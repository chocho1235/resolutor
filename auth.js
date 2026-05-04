import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** Secret (service) keys must never run in the browser — Supabase returns 403 if you try. */
function isSecretKeyInBrowser(key) {
  if (!key || typeof key !== "string") return false;
  return key.trim().startsWith("sb_secret_");
}

const ARTICLE_ROOT_SEL =
  "main.page-main > article.consumer-guide, main.page-main > article.article-page";

const READ_THRESHOLD_MS = 30_000;
/** Persisted anonymous preview exhaustion: survives refresh & other articles until the user obtains a session. */
const ANONYMOUS_READ_LOCK_KEY = "resolutorAnonymousLongformLock";

let client = null;

function isAnonymousReadLocked() {
  try {
    return globalThis.localStorage?.getItem(ANONYMOUS_READ_LOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function setAnonymousReadLocked() {
  try {
    globalThis.localStorage?.setItem(ANONYMOUS_READ_LOCK_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

/** Public URL prefix without trailing slash (empty at site root). */
export function appBasePath() {
  let b = import.meta.env.BASE_URL || "/";
  if (b !== "/" && b.endsWith("/")) b = b.slice(0, -1);
  return b === "/" ? "" : b;
}

/** Safe internal redirect target; rejects off-site and auth loops. */
export function safeNextPath(raw) {
  if (raw == null || typeof raw !== "string") return "/";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/";
  try {
    const u = new URL(t, location.origin);
    if (u.origin !== location.origin) return "/";
    const p = u.pathname;
    if (p === "/login" || p === "/signup") return "/";
    return u.pathname + u.search + u.hash;
  } catch {
    return "/";
  }
}

export function authLoginHref(nextPath = "") {
  const prefix = appBasePath();
  const base = `${prefix}/login`;
  const next = safeNextPath(nextPath);
  if (!nextPath || next === "/") return base;
  return `${base}?next=${encodeURIComponent(next)}`;
}

export function authSignupHref(nextPath = "") {
  const prefix = appBasePath();
  const base = `${prefix}/signup`;
  const next = safeNextPath(nextPath);
  if (!nextPath || next === "/") return base;
  return `${base}?next=${encodeURIComponent(next)}`;
}

export function authDashboardHref() {
  return `${appBasePath()}/dashboard`;
}

/**
 * Subscription tier from Supabase Auth user_metadata.
 * Set `subscription_tier` to `paid` (or `plan` / `subscription` as `paid`) for paid users — e.g. in the Supabase dashboard
 * or via your billing webhook. Everyone else is treated as free.
 */
export function getSubscriptionTier(user) {
  if (!user) return "free";
  const m = user.user_metadata ?? {};
  const raw = m.subscription_tier ?? m.plan ?? m.subscription;
  if (typeof raw === "string" && raw.toLowerCase().trim() === "paid") return "paid";
  return "free";
}

export function subscriptionTierLabel(tier) {
  return tier === "paid" ? "Paid account" : "Free account";
}

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (isSecretKeyInBrowser(supabaseAnonKey)) {
    console.warn(
      "[Resolutor] VITE_SUPABASE_ANON_KEY must be the Publishable (or anon JWT) key, not the Secret key. Replace sb_secret_… in .env with the Publishable key from Supabase → Settings → API.",
    );
    return null;
  }
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export function isAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && !isSecretKeyInBrowser(supabaseAnonKey));
}

function getArticleRoot() {
  return document.querySelector(ARTICLE_ROOT_SEL);
}

let readGateActive = false;

function lockScroll(on) {
  document.documentElement.classList.toggle("site-auth--scroll-lock", on);
}

function updateAuthBarOffset() {
  const bar = document.getElementById("site-auth-bar");
  if (!bar) return;
  const h = Math.ceil(bar.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--site-auth-bar-offset", `${h}px`);
}

function syncAuthBar(session) {
  const bar = document.getElementById("site-auth-bar");
  if (!bar) return;
  const actions = bar.querySelector(".site-auth-bar__actions");
  if (!actions) return;
  actions.textContent = "";
  const here = `${location.pathname}${location.search}`;
  if (session?.user) {
    const tier = getSubscriptionTier(session.user);
    const tierEl = document.createElement("span");
    tierEl.className = `site-auth-bar__tier site-auth-bar__tier--${tier}`;
    tierEl.textContent = subscriptionTierLabel(tier);

    const label = document.createElement("span");
    label.className = "site-auth-bar__user";
    const email = session.user.email ?? "Signed in";
    label.textContent = email.length > 36 ? `${email.slice(0, 33)}…` : email;

    const dash = document.createElement("a");
    dash.className = "site-auth-bar__btn site-auth-bar__btn--secondary";
    dash.href = authDashboardHref();
    dash.textContent = "Dashboard";

    const out = document.createElement("button");
    out.type = "button";
    out.className = "site-auth-bar__btn site-auth-bar__btn--quiet";
    out.textContent = "Sign out";
    out.addEventListener("click", async () => {
      const sb = getSupabaseClient();
      if (sb) await sb.auth.signOut();
    });
    actions.append(tierEl, label, dash, out);
  } else {
    const loginA = document.createElement("a");
    loginA.className = "site-auth-bar__btn";
    loginA.href = authLoginHref(here);
    loginA.textContent = "Log in";
    const signupA = document.createElement("a");
    signupA.className = "site-auth-bar__btn site-auth-bar__btn--secondary";
    signupA.href = authSignupHref(here);
    signupA.textContent = "Sign up";
    actions.append(loginA, signupA);
  }
  requestAnimationFrame(() => updateAuthBarOffset());
}

function removeReadGate() {
  readGateActive = false;
  lockScroll(false);
  document.removeEventListener("keydown", onGateKeydown);
  document.getElementById("article-read-gate")?.remove();
}

function showReadGate() {
  if (document.getElementById("article-read-gate")) return;
  readGateActive = true;
  lockScroll(true);

  const next = `${location.pathname}${location.search}`;
  const loginHref = authLoginHref(next);
  const signupHref = authSignupHref(next);
  const prefix = appBasePath();
  const homeHref = prefix ? `${prefix}/` : "/";

  const gate = document.createElement("div");
  gate.id = "article-read-gate";
  gate.className = "article-read-gate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-labelledby", "article-read-gate-title");

  const panel = document.createElement("div");
  panel.className = "article-read-gate__panel";

  const h2 = document.createElement("h2");
  h2.className = "article-read-gate__title";
  h2.id = "article-read-gate-title";
  h2.textContent = "Log in to continue reading";

  const p = document.createElement("p");
  p.className = "article-read-gate__lede";
  p.textContent =
    "Free reading of our newsroom articles and consumer guides is limited in this browser until you log in or register. That limit has now applied: refreshing or opening another guide will not reset it. Use the homepage link if you prefer to leave.";

  const actions = document.createElement("div");
  actions.className = "article-read-gate__actions";

  const inA = document.createElement("a");
  inA.className = "article-read-gate__btn article-read-gate__btn--primary";
  inA.href = loginHref;
  inA.textContent = "Log in";

  const homeA = document.createElement("a");
  homeA.className = "article-read-gate__btn";
  homeA.href = homeHref;
  homeA.textContent = "Back to homepage";

  actions.append(inA, homeA);

  const foot = document.createElement("p");
  foot.className = "article-read-gate__foot";
  foot.append("Need an account? ");
  const upA = document.createElement("a");
  upA.className = "article-read-gate__link";
  upA.href = signupHref;
  upA.textContent = "Sign up free";
  foot.appendChild(upA);

  panel.append(h2, p, actions, foot);
  gate.appendChild(panel);
  document.body.appendChild(gate);
  inA.focus();

  document.addEventListener("keydown", onGateKeydown);
}

function onGateKeydown(e) {
  if (e.key !== "Escape" || !readGateActive) return;
  e.preventDefault();
}

export function initSiteAuthUI() {
  if (document.getElementById("site-auth-bar")) return;

  const bar = document.createElement("div");
  bar.id = "site-auth-bar";
  bar.className = "site-auth-bar";
  const inner = document.createElement("div");
  inner.className = "site-auth-bar__inner";
  const actions = document.createElement("div");
  actions.className = "site-auth-bar__actions";
  inner.appendChild(actions);
  bar.appendChild(inner);
  document.body.insertBefore(bar, document.body.firstChild);
  document.documentElement.classList.add("site-auth--bar");

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => updateAuthBarOffset());
    ro.observe(bar);
  }
  window.addEventListener("resize", updateAuthBarOffset, { passive: true });
  window.addEventListener("orientationchange", updateAuthBarOffset, { passive: true });

  const sb = getSupabaseClient();
  if (sb) {
    sb.auth.onAuthStateChange((_evt, session) => {
      syncAuthBar(session);
      if (session) {
        removeReadGate();
      } else if (isAnonymousReadLocked() && getArticleRoot()) {
        showReadGate();
      }
    });
    sb.auth.getSession().then(({ data: { session } }) => syncAuthBar(session));
  } else {
    syncAuthBar(null);
  }
}

export async function initArticleReadGate() {
  const root = getArticleRoot();
  if (!root) return;

  const sb = getSupabaseClient();
  if (sb) {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (session) return;
  }

  if (isAnonymousReadLocked()) {
    showReadGate();
    return;
  }

  let visibleMs = 0;
  let lastTs = performance.now();
  const ac = new AbortController();
  const { signal } = ac;

  const syncClock = () => {
    lastTs = performance.now();
  };
  document.addEventListener("visibilitychange", syncClock, { signal });

  let rafId = 0;
  let authUnsub = null;

  function stop() {
    ac.abort();
    authUnsub?.();
    authUnsub = null;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  if (sb) {
    const { data } = sb.auth.onAuthStateChange((_event, sess) => {
      if (sess) stop();
    });
    authUnsub = () => data.subscription.unsubscribe();
  }

  const frame = (ts) => {
    if (!getArticleRoot()) {
      stop();
      return;
    }
    if (!document.hidden) {
      visibleMs += ts - lastTs;
      if (visibleMs >= READ_THRESHOLD_MS) {
        stop();
        void (async () => {
          if (sb) {
            const {
              data: { session: s },
            } = await sb.auth.getSession();
            if (s) return;
          }
          setAnonymousReadLocked();
          showReadGate();
        })();
        return;
      }
    }
    lastTs = ts;
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);
}
