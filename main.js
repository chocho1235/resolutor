const section = document.querySelector(".about-band");
const title = document.querySelector("#about-title");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Progress 0→1 as the about band moves through the viewport (long, readable range). */
function computeRawProgress() {
  if (!section) return 0;
  const vh = window.innerHeight || 1;
  const top = section.getBoundingClientRect().top;
  const start = vh * 0.92;
  const end = vh * 0.14;
  const range = start - end;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, (start - top) / range));
}

let targetP = 0;
let displayP = 0;
let rafId = null;
/** For framerate-independent smoothing (avoids stepped motion when rAF timing varies). */
let lastTickTime = null;

function applyFill(p) {
  if (!title) return;
  const clamped = Math.min(1, Math.max(0, p));
  const pct = (clamped * 100).toFixed(3);
  title.style.setProperty("--title-fill", `${pct}%`);
}

function tick(now) {
  if (!title) return;
  const t = typeof now === "number" ? now : performance.now();
  const prev = lastTickTime;
  lastTickTime = t;
  const dtMs = prev == null ? 1000 / 60 : Math.min(56, Math.max(0, t - prev));
  const dt = dtMs / 1000;

  const diff = targetP - displayP;
  const lambda = 9.5;
  const alpha = 1 - Math.exp(-lambda * dt);
  displayP += diff * alpha;

  if (Math.abs(diff) < 0.001) {
    displayP = targetP;
  }

  applyFill(displayP);

  if (Math.abs(targetP - displayP) > 0.0007) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
    lastTickTime = null;
    displayP = targetP;
    applyFill(displayP);
  }
}

function queueTick() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

function updateAboutTitleFill() {
  if (!title) return;

  if (motionQuery.matches) {
    title.classList.add("about-band__title--reduced");
    title.style.removeProperty("--title-fill");
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    return;
  }

  title.classList.remove("about-band__title--reduced");

  targetP = computeRawProgress();
  queueTick();
}

let scrollScheduled = false;
function onScrollOrResize() {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(() => {
      updateAboutTitleFill();
      scrollScheduled = false;
    });
  }
}

if (title) {
  targetP = displayP = computeRawProgress();
  applyFill(displayP);

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  motionQuery.addEventListener("change", updateAboutTitleFill);
}

const heroVideos = document.querySelectorAll(".hero__video");
/** Playback slower than real time when motion is allowed (browser API; not true optical slow-mo). */
const HERO_VIDEO_PLAYBACK_RATE = 0.5;

function syncHeroVideo() {
  if (!heroVideos.length) return;
  const rate = motionQuery.matches ? 1 : HERO_VIDEO_PLAYBACK_RATE;
  heroVideos.forEach((v) => {
    v.playbackRate = rate;
  });
  if (motionQuery.matches) {
    heroVideos.forEach((v) => v.pause());
  } else {
    heroVideos.forEach((v) => v.play().catch(() => {}));
  }
}

if (heroVideos.length) {
  syncHeroVideo();
  motionQuery.addEventListener("change", syncHeroVideo);

  const heroBase = document.querySelector(".hero__video--base");
  const heroSpot = document.querySelector(".hero__video--spot");
  if (heroBase && heroSpot) {
    heroBase.addEventListener("timeupdate", () => {
      if (Math.abs(heroSpot.currentTime - heroBase.currentTime) > 0.2) {
        heroSpot.currentTime = heroBase.currentTime;
      }
    });
  }
}

/** Step wizards — general guide only, not legal advice */
function initStepWizard(root) {
  if (!root) return;

  const panel = root.querySelector(".help-wizard__panel");
  const steps = [...root.querySelectorAll("[data-wizard-step]")];
  const initialStep = root.getAttribute("data-wizard-initial") || "intro";
  const isFaultyGoods = root.hasAttribute("data-faulty-goods-tool");
  const faultyTimeToResult = { "30": "fg-result-30", "6m": "fg-result-6m", "6mp": "fg-result-6mp" };

  function updateFaultyDistanceCallouts(stepId) {
    if (!isFaultyGoods) return;
    steps.forEach((el) => {
      const callout = el.querySelector("[data-faulty-distance-callout]");
      if (!callout) return;
      const id = el.getAttribute("data-wizard-step");
      const visible =
        id === stepId &&
        (stepId === "fg-result-30" || stepId === "fg-result-6m" || stepId === "fg-result-6mp") &&
        root.dataset.faultyDistance === "yes";
      callout.hidden = !visible;
    });
  }

  function show(stepId) {
    steps.forEach((el) => {
      const id = el.getAttribute("data-wizard-step");
      el.hidden = id !== stepId;
    });
    updateFaultyDistanceCallouts(stepId);
    requestAnimationFrame(() => {
      const active = root.querySelector(`[data-wizard-step="${stepId}"]`);
      if (!active || active.hidden) return;
      const focusable = active.querySelector("button:not([disabled]), a[href], [href]");
      (focusable || panel)?.focus({ preventScroll: false });
    });
  }

  root.addEventListener("click", (e) => {
    if (isFaultyGoods) {
      const timeBtn = e.target.closest("[data-faulty-time]");
      if (timeBtn) root.dataset.faultyTime = timeBtn.getAttribute("data-faulty-time") || "";
      const distBtn = e.target.closest("[data-faulty-distance]");
      if (distBtn) root.dataset.faultyDistance = distBtn.getAttribute("data-faulty-distance") || "";
    }

    const go = e.target.closest("[data-wizard-go]");
    if (go) {
      let next = go.getAttribute("data-wizard-go");
      if (isFaultyGoods && next === "fg-aftercare-no-to-result") {
        next = faultyTimeToResult[root.dataset.faultyTime] || "fg-q-time";
      }
      if (next) show(next);
      return;
    }
    const restart = e.target.closest("[data-wizard-restart]");
    if (restart) {
      if (isFaultyGoods) {
        delete root.dataset.faultyTime;
        delete root.dataset.faultyDistance;
      }
      const to = restart.getAttribute("data-wizard-restart");
      show(to || initialStep);
    }
  });
}

document.querySelectorAll("[data-help-wizard]").forEach(initStepWizard);
document.querySelectorAll("[data-faulty-goods-tool]").forEach(initStepWizard);

/** Articles / newsroom feed — driven by public/articles.json */
const BASE = import.meta.env.BASE_URL || "/";

function assetUrl(relPath) {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  return `${base}/${relPath.replace(/^\//, "")}`;
}

function articleImageSrc(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return assetUrl(path);
}

const ARTICLE_TYPE_META = {
  firm: { label: "News", bar: "insights-meta__bar--firm" },
  article: { label: "Article", bar: "insights-meta__bar--article" },
  podcast: { label: "Podcast", bar: "insights-meta__bar--podcast" },
};

function formatArticleDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return {
    datetime: iso,
    text: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function createFeaturedArticleCard(item) {
  const meta = ARTICLE_TYPE_META[item.type] || ARTICLE_TYPE_META.article;
  const { datetime, text } = formatArticleDate(item.date);
  const href = assetUrl(`articles/${item.slug}`);
  const imgSrc = articleImageSrc(item.image);

  const article = document.createElement("article");
  article.className = "insights-card insights-card--featured";
  const a = document.createElement("a");
  a.className = "insights-card__link insights-card__link--featured";
  a.href = href;

  const figure = document.createElement("figure");
  figure.className = "insights-card__figure insights-card__figure--featured";
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "";
  img.width = 1200;
  img.height = 800;
  img.loading = "lazy";
  figure.appendChild(img);

  const h3 = document.createElement("h3");
  h3.className = "insights-card__title insights-card__title--featured";
  h3.textContent = item.title;

  const metaDiv = document.createElement("div");
  metaDiv.className = "insights-meta";
  const bar = document.createElement("span");
  bar.className = `insights-meta__bar ${meta.bar}`;
  bar.setAttribute("aria-hidden", "true");
  const typeSpan = document.createElement("span");
  typeSpan.className = "insights-meta__type";
  typeSpan.textContent = meta.label;
  const time = document.createElement("time");
  time.className = "insights-meta__date";
  time.dateTime = datetime;
  time.textContent = text;
  metaDiv.append(bar, typeSpan, time);

  a.append(figure, h3, metaDiv);
  article.appendChild(a);
  return article;
}

function createCompactArticleCard(item) {
  const meta = ARTICLE_TYPE_META[item.type] || ARTICLE_TYPE_META.article;
  const { datetime, text } = formatArticleDate(item.date);
  const href = assetUrl(`articles/${item.slug}`);
  const imgSrc = articleImageSrc(item.image);

  const article = document.createElement("article");
  article.className = "insights-card insights-card--compact";
  const a = document.createElement("a");
  a.className = "insights-card__link insights-card__link--compact";
  a.href = href;

  const thumb = document.createElement("div");
  thumb.className = "insights-card__thumb";
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = "";
  img.width = 600;
  img.height = 600;
  img.loading = "lazy";
  thumb.appendChild(img);

  const body = document.createElement("div");
  body.className = "insights-card__body";
  if (item.topic) {
    const topic = document.createElement("p");
    topic.className = "insights-card__topic";
    topic.textContent = item.topic;
    body.appendChild(topic);
  }
  const h3 = document.createElement("h3");
  h3.className = "insights-card__title insights-card__title--compact";
  h3.textContent = item.title;

  const metaDiv = document.createElement("div");
  metaDiv.className = "insights-meta";
  const bar = document.createElement("span");
  bar.className = `insights-meta__bar ${meta.bar}`;
  bar.setAttribute("aria-hidden", "true");
  const typeSpan = document.createElement("span");
  typeSpan.className = "insights-meta__type";
  typeSpan.textContent = meta.label;
  const time = document.createElement("time");
  time.className = "insights-meta__date";
  time.dateTime = datetime;
  time.textContent = text;
  metaDiv.append(bar, typeSpan, time);

  body.append(h3, metaDiv);
  a.append(thumb, body);
  article.appendChild(a);
  return article;
}

function sortArticlesForSpotlight(items) {
  const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted.find((i) => i.featured) || sorted[0];
  const others = sorted.filter((i) => i !== featured).slice(0, 2);
  return { featured, others };
}

function sortArticlesForFullList(items) {
  return [...items].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date) - new Date(a.date);
  });
}

function renderArticleSpotlight(container, items) {
  container.textContent = "";
  const { featured, others } = sortArticlesForSpotlight(items);
  if (!featured) return;

  container.appendChild(createFeaturedArticleCard(featured));
  const stack = document.createElement("div");
  stack.className = "insights__stack";
  for (const o of others) {
    stack.appendChild(createCompactArticleCard(o));
  }
  container.appendChild(stack);
}

function renderArticleFullGrid(container, items) {
  container.textContent = "";
  for (const item of sortArticlesForFullList(items)) {
    container.appendChild(createCompactArticleCard(item));
  }
}

function showArticlesFeedError(nodes) {
  for (const el of nodes) {
    el.textContent = "";
    const p = document.createElement("p");
    p.className = "newsroom-feed__error";
    p.append("We could not load the article list. ");
    const a = document.createElement("a");
    a.href = assetUrl("newsroom");
    a.textContent = "Open the newsroom";
    p.appendChild(a);
    p.append(".");
    el.appendChild(p);
    el.removeAttribute("aria-busy");
  }
}

async function initArticlesFeed() {
  const nodes = document.querySelectorAll("[data-articles-feed]");
  if (!nodes.length) return;

  let items;
  try {
    const res = await fetch(assetUrl("articles.json"));
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    items = data.articles;
    if (!Array.isArray(items) || items.length === 0) throw new Error("empty");
  } catch {
    showArticlesFeedError(nodes);
    return;
  }

  for (const el of nodes) {
    const mode = el.getAttribute("data-articles-feed");
    el.textContent = "";
    if (mode === "spotlight") renderArticleSpotlight(el, items);
    else if (mode === "full") renderArticleFullGrid(el, items);
    el.removeAttribute("aria-busy");
  }
}

initArticlesFeed();

/** Slide-out primary navigation (max-width 640px) */
const mobileNavMq = window.matchMedia("(max-width: 640px)");

function initMobileNav() {
  const toggle = document.querySelector(".mobile-nav__toggle");
  const panel = document.getElementById("site-menu-panel");
  const backdrop = document.querySelector(".mobile-nav__backdrop");
  const closeBtn = document.querySelector(".mobile-nav__close");
  const label = toggle?.querySelector(".visually-hidden");
  if (!toggle || !panel || !backdrop) return;

  let open = false;

  function applyInert() {
    if (mobileNavMq.matches) {
      if (open) panel.removeAttribute("inert");
      else panel.setAttribute("inert", "");
    } else {
      panel.removeAttribute("inert");
    }
  }

  function sync() {
    const active = open && mobileNavMq.matches;
    document.body.classList.toggle("mobile-nav-open", active);
    toggle.setAttribute("aria-expanded", String(active));
    if (active) {
      backdrop.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      if (label) label.textContent = "Close menu";
    } else {
      backdrop.setAttribute("hidden", "");
      document.body.style.overflow = "";
      open = false;
      if (label) label.textContent = "Open menu";
    }
    applyInert();
  }

  function close(opts = { focusToggle: true }) {
    open = false;
    sync();
    if (mobileNavMq.matches && opts.focusToggle) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => {
    if (!mobileNavMq.matches) return;
    open = !open;
    sync();
  });

  closeBtn?.addEventListener("click", () => close());

  backdrop.addEventListener("click", () => close());

  panel.addEventListener("click", (e) => {
    if (!mobileNavMq.matches) return;
    if (e.target.closest("a[href]")) close({ focusToggle: false });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open && mobileNavMq.matches) close();
  });

  mobileNavMq.addEventListener("change", () => {
    if (!mobileNavMq.matches) open = false;
    sync();
  });

  sync();
}

initMobileNav();

/** After ~30s of visible reading on long-form pages, offer “carry on reading” + subscribe (email / newsroom). */
const READING_SUBSCRIBE_KEY = "resolutorReadingSubscribeDismissed";

function initReadingSubscribePrompt() {
  const longForm = document.querySelector("article.consumer-guide, article.article-page");
  if (!longForm) return;
  if (sessionStorage.getItem(READING_SUBSCRIBE_KEY) === "1") return;

  const TICK_MS = 250;
  const THRESHOLD_MS = 30_000;
  let visibleMs = 0;
  let intervalId = null;
  let shown = false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const wrap = document.createElement("div");
  wrap.className = "reading-subscribe";
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", "Updates and further reading");
  wrap.hidden = true;

  const inner = document.createElement("div");
  inner.className = "reading-subscribe__inner";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "reading-subscribe__close";
  closeBtn.setAttribute("aria-label", "Dismiss");
  closeBtn.textContent = "×";

  const title = document.createElement("h2");
  title.className = "reading-subscribe__title";
  title.id = "reading-subscribe-title";
  title.textContent = "Carry on reading";

  const text = document.createElement("p");
  text.className = "reading-subscribe__text";
  text.textContent =
    "Subscribe by email for updates when we publish new guides and newsroom pieces, or browse the newsroom now.";

  const actions = document.createElement("div");
  actions.className = "reading-subscribe__actions";

  const mail = document.createElement("a");
  mail.className = "reading-subscribe__btn reading-subscribe__btn--primary";
  mail.href =
    "mailto:legal@resolutor.co.uk?subject=" +
    encodeURIComponent("Subscribe to Resolutor updates") +
    "&body=" +
    encodeURIComponent(
      "Please add me to your mailing list for new consumer guides and articles.\n\n(We will use your email only for that purpose.)",
    );
  mail.textContent = "Subscribe by email";

  const news = document.createElement("a");
  news.className = "reading-subscribe__btn reading-subscribe__btn--secondary";
  news.href = assetUrl("newsroom");
  news.textContent = "Newsroom";

  actions.append(mail, news);
  inner.append(closeBtn, title, text, actions);
  wrap.appendChild(inner);
  document.body.appendChild(wrap);

  function dismiss() {
    sessionStorage.setItem(READING_SUBSCRIBE_KEY, "1");
    wrap.classList.remove("is-visible");
    wrap.hidden = true;
    wrap.remove();
    if (intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  closeBtn.addEventListener("click", dismiss);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !wrap.isConnected || wrap.hidden) return;
    dismiss();
  });

  function open() {
    if (shown) return;
    shown = true;
    if (intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    wrap.hidden = false;
    if (reduceMotion.matches) wrap.classList.add("reading-subscribe--instant");
    requestAnimationFrame(() => {
      wrap.classList.add("is-visible");
    });
  }

  intervalId = window.setInterval(() => {
    if (!document.hidden) visibleMs += TICK_MS;
    if (visibleMs >= THRESHOLD_MS) open();
  }, TICK_MS);
}

initReadingSubscribePrompt();
