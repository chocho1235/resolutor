/**
 * Shared head-tag helpers for SEO (Open Graph sizing, published dates and page metadata).
 */
import fs from "node:fs";
import path from "node:path";

/** @returns {Record<string, { date: string, topic: string }>} */
export function loadArticleMeta(rootDir) {
  const out = {};
  try {
    const j = JSON.parse(fs.readFileSync(path.join(rootDir, "public/articles.json"), "utf8"));
    for (const a of j.articles || []) {
      out[a.slug] = { date: a.date, topic: a.topic || "" };
    }
  } catch {
    /* optional */
  }
  return out;
}

/** @returns {{ defaults?: Record<string, string>, pages: Record<string, Record<string, string>> }} */
export function loadSeoPageMeta(rootDir) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(rootDir, "public/seo-pages.json"), "utf8"));
    return {
      defaults: parsed.defaults || {},
      pages: parsed.pages || {},
    };
  } catch {
    return { defaults: {}, pages: {} };
  }
}

/**
 * @param {string} html
 * @param {string} slug
 * @param {Record<string, { date: string }>} articleMeta
 */
export function ensureArticlePublishedMeta(html, slug, articleMeta) {
  const meta = articleMeta[slug];
  if (!meta?.date) return html;
  if (/property=["']article:published_time["']/i.test(html)) return html;
  const t = `${meta.date}T09:00:00+01:00`;
  if (/property=["']og:url["']/i.test(html)) {
    return html.replace(
      /(<meta\s+property=["']og:url["']\s+content=["'][^"']+["']\s*\/?>)/i,
      `$1\n    <meta property="article:published_time" content="${t}" />`,
    );
  }
  return html.replace(
    /(<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>)/i,
    `$1\n    <meta property="article:published_time" content="${t}" />`,
  );
}

export function ensurePublishedMetaForDate(html, date) {
  if (!date || /property=["']article:published_time["']/i.test(html)) return html;
  const t = `${date}T09:00:00+01:00`;
  if (/property=["']og:url["']/i.test(html)) {
    return html.replace(
      /(<meta\s+property=["']og:url["']\s+content=["'][^"']+["']\s*\/?>)/i,
      `$1\n    <meta property="article:published_time" content="${t}" />`,
    );
  }
  return html.replace(
    /(<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>)/i,
    `$1\n    <meta property="article:published_time" content="${t}" />`,
  );
}

/** Insert og:image dimensions when missing (handles single- and multi-line og:image meta). */
export function ensureOgImageDims(html) {
  if (/property=["']og:image:width["']/i.test(html)) return html;
  const re = /<meta\s[\s\S]*?property=["']og:image["'][\s\S]*?\/>/i;
  const m = html.match(re);
  if (!m) return html;
  return html.replace(
    re,
    `${m[0]}\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`,
  );
}
