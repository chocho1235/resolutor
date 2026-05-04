import { authLoginHref, getSupabaseClient, isAuthConfigured, safeNextPath } from "./auth.js";

const params = new URLSearchParams(location.search);

function redirectIfSession() {
  const sb = getSupabaseClient();
  if (!sb) return;
  void sb.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const dest = safeNextPath(params.get("next"));
      location.assign(dest);
    }
  });
}

function wireLoginLink() {
  const el = document.getElementById("auth-signup-to-login");
  if (!el) return;
  const raw = params.get("next");
  el.href = raw ? authLoginHref(safeNextPath(raw)) : authLoginHref("");
}

function showUnconfigured() {
  const form = document.getElementById("auth-signup-form");
  const note = document.getElementById("auth-signup-unconfigured");
  if (form) form.hidden = true;
  if (note) {
    note.hidden = false;
    note.textContent =
      "Sign-up is not configured for this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.";
  }
}

function init() {
  wireLoginLink();
  if (!isAuthConfigured()) {
    showUnconfigured();
    return;
  }
  redirectIfSession();

  const sb = getSupabaseClient();
  const form = document.getElementById("auth-signup-form");
  const err = document.getElementById("auth-signup-error");
  const ok = document.getElementById("auth-signup-success");
  const submit = document.getElementById("auth-signup-submit");
  if (!form || !sb) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("password_confirm") ?? "");
    const terms = fd.get("terms");
    if (!email || !password) {
      if (err) err.textContent = "Enter your email and a password (at least six characters).";
      return;
    }
    if (password !== confirm) {
      if (err) err.textContent = "Password and confirmation do not match.";
      return;
    }
    if (!terms) {
      if (err) err.textContent = "Please accept the terms of use to create an account.";
      return;
    }
    if (err) err.textContent = "";
    if (ok) ok.hidden = true;
    if (submit) submit.disabled = true;
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { subscription_tier: "free" } },
      });
      if (error) throw error;
      if (data.session) {
        const dest = safeNextPath(params.get("next"));
        location.assign(dest);
        return;
      }
      if (ok) {
        ok.hidden = false;
        ok.textContent =
          "Check your inbox to confirm your email if your project requires it, then log in. You can close this tab or open the log in page.";
      }
      form.reset();
    } catch (e2) {
      if (err) err.textContent = e2.message || "Something went wrong.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

init();
