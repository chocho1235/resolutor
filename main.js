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

const ARTICLE_TYPE_META = {
  firm: { label: "Firm news", bar: "insights-meta__bar--firm" },
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
  const href = assetUrl(`articles/${item.slug}.html`);
  const imgSrc = assetUrl(item.image);

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
  const href = assetUrl(`articles/${item.slug}.html`);
  const imgSrc = assetUrl(item.image);

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
    a.href = assetUrl("newsroom.html");
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
