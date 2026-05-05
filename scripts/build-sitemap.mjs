/**
 * Writes dist/sitemap.xml after vite build (+ inject structured data step).
 * Set SITE_ORIGIN if the live site is not www.resolutor.co.uk
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSeoPageMeta } from "./seo-meta-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const SITE = (process.env.SITE_ORIGIN || "https://www.resolutor.co.uk").replace(/\/$/, "");
const seoPageMeta = loadSeoPageMeta(root);

/** @returns {string} YYYY-MM-DD */
function mtimeIsoDate(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function metadataDate(locPath, filePath) {
  return seoPageMeta.pages?.[locPath]?.modified || seoPageMeta.pages?.[locPath]?.published || mtimeIsoDate(filePath);
}

/**
 * Extract og:image URL from HTML source files (workspace paths, before build relocate).
 *
 * @param {string} filePath - absolute path
 * @returns {string | null}
 */
function ogImageFromHtmlFile(filePath) {
  try {
    const html = fs.readFileSync(filePath, "utf8");
    const m =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (!m) return null;
    return decodeEntitiesXml(m[1]);
  } catch {
    return null;
  }
}

function decodeEntitiesXml(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** @type {Array<{ loc: string, file: string, priority: string, changefreq: string, image: string | null }>} */
const entries = [];

/**
 * @param {string} locPath
 * @param {string} fileRel - path relative to repo root under consumer/ or articles/ or single-file pages
 * @param {string} priority
 * @param {string} changefreq
 */
function add(locPath, fileRel, priority, changefreq) {
  const filePath = path.join(root, fileRel);
  entries.push({
    loc: `${SITE}${locPath}`,
    file: filePath,
    priority,
    changefreq,
    image: ogImageFromHtmlFile(filePath),
  });
}

add("/", "index.html", "1.0", "weekly");
add("/about", "about.html", "0.9", "monthly");
add("/pricing", "pricing.html", "0.9", "monthly");
add("/careers", "careers.html", "0.8", "monthly");
add("/contact", "contact.html", "0.85", "monthly");
add("/consumer", "consumer.html", "0.9", "weekly");
add("/newsroom", "newsroom.html", "0.85", "weekly");

const consumerDir = path.join(root, "consumer");
for (const name of fs.readdirSync(consumerDir)) {
  if (!name.endsWith(".html")) continue;
  const slug = name.replace(/\.html$/, "");
  add(`/consumer/${slug}`, path.join("consumer", name), "0.82", "monthly");
}

const articlesDir = path.join(root, "articles");
for (const name of fs.readdirSync(articlesDir)) {
  if (!name.endsWith(".html")) continue;
  const slug = name.replace(/\.html$/, "");
  add(`/articles/${slug}`, path.join("articles", name), "0.82", "monthly");
}

entries.sort((a, b) => a.loc.localeCompare(b.loc));

const urlXml = entries
  .map((e) => {
    const imageBlock = e.image
      ? `\n    <image:image>\n      <image:loc>${escapeXml(e.image)}</image:loc>\n    </image:image>`
      : "";

    return `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${metadataDate(new URL(e.loc).pathname, e.file)}</lastmod>
    <changefreq>${escapeXml(e.changefreq)}</changefreq>
    <priority>${escapeXml(e.priority)}</priority>${imageBlock}
  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlXml}
</urlset>
`;

if (!fs.existsSync(dist)) {
  console.warn("build-sitemap: dist/ missing — run vite build first");
  process.exit(0);
}

fs.writeFileSync(path.join(dist, "sitemap.xml"), xml, "utf8");
console.log("Wrote dist/sitemap.xml with", entries.length, "URLs");

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
fs.writeFileSync(path.join(dist, "robots.txt"), robots, "utf8");
console.log("Wrote dist/robots.txt (Sitemap:", `${SITE}/sitemap.xml`, ")");
