/**
 * After vite build: inject Article JSON-LD plus missing Open Graph and article meta tags into
 * each built guide under dist/consumer/…/index.html and dist/articles/…/index.html.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensureArticlePublishedMeta,
  ensureOgImageDims,
  loadArticleMeta,
} from "./seo-meta-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const SITE = (process.env.SITE_ORIGIN || "https://www.resolutor.co.uk").replace(/\/$/, "");

const articleMeta = loadArticleMeta(root);

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8209;/g, "\u2011");
}

function extractMeta(html) {
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? decodeEntities(titleM[1].replace(/\s+/g, " ").trim()) : "";

  let desc = "";
  const descM =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (descM) desc = decodeEntities(descM[1]);

  let canonical = "";
  const canM =
    html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
    html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  if (canM) canonical = decodeEntities(canM[1]);

  let ogImage = "";
  const ogSingle =
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (ogSingle) ogImage = decodeEntities(ogSingle[1]);
  else {
    const ogMulti = html.match(/property=["']og:image["'][\s\S]*?content=["']([^"']+)["']/i);
    if (ogMulti) ogImage = decodeEntities(ogMulti[1]);
  }

  return { title, description: desc, canonical, ogImage };
}

function stripBrand(title) {
  return title.replace(/\s*\|\s*Resolutor Legal Support\s*$/i, "").trim();
}

function stripOldLd(html) {
  return html.replace(
    /<script[^>]*id=["']resolutor-structured-data["'][^>]*>[\s\S]*?<\/script>\s*\n?/gi,
    "",
  );
}

function injectLd(html, articleLd) {
  const blob = `\n    <script id="resolutor-structured-data" type="application/ld+json">${JSON.stringify(
    articleLd,
  )}<\/script>`;
  const insertBefore = /<\/head>/i;
  return html.replace(insertBefore, `${blob}\n  </head>`);
}

function processGuide(distDir, slug, opts) {
  const { newsroomSlug } = opts;
  const fp = path.join(distDir, slug, "index.html");
  if (!fs.existsSync(fp)) return;

  let html = fs.readFileSync(fp, "utf8");

  const isArticles = !!newsroomSlug;
  if (isArticles) html = ensureArticlePublishedMeta(html, newsroomSlug, articleMeta);
  html = ensureOgImageDims(html);
  html = stripOldLd(html);

  const raw = extractMeta(html);
  if (!raw.canonical || !raw.title) {
    console.warn("inject-seo: incomplete head, skip", fp);
    return;
  }

  const headline = stripBrand(raw.title);
  const imageArr = raw.ogImage ? [raw.ogImage] : [];

  let datePublished;
  if (newsroomSlug && articleMeta[newsroomSlug]?.date) {
    datePublished = `${articleMeta[newsroomSlug].date}T09:00:00+01:00`;
  }

  const dateModified = fs.statSync(fp).mtime.toISOString().replace(/\.\d{3}Z$/, "Z");

  /** @type {Record<string, unknown>} */
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: raw.description || headline,
    inLanguage: "en-GB",
    isAccessibleForFree: true,
    url: raw.canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": raw.canonical,
    },
    ...(imageArr.length ? { image: imageArr } : {}),
    author: {
      "@type": "Organization",
      name: "Resolutor Legal Support",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "Resolutor Legal Support",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/og-image.png`,
      },
    },
    dateModified,
    ...(datePublished ? { datePublished } : {}),
  };

  const section = newsroomSlug && articleMeta[newsroomSlug]?.topic;
  if (section) articleLd.articleSection = section;

  html = injectLd(html, articleLd);
  fs.writeFileSync(fp, html, "utf8");
  console.log("SEO structured data:", path.relative(dist, fp));
}

function walkPart(subdir, slugAsArticle) {
  const base = path.join(dist, subdir);
  if (!fs.existsSync(base)) return;
  for (const ent of fs.readdirSync(base, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const slug = ent.name;
    processGuide(base, slug, { newsroomSlug: slugAsArticle ? slug : undefined });
  }
}

if (!fs.existsSync(dist)) {
  console.warn("inject-seo-structured-data-dist: dist/ missing — run vite build first");
  process.exit(0);
}

walkPart("consumer", false);
walkPart("articles", true);
