/**
 * Writes dist/sitemap.xml after vite build. Set SITE_ORIGIN if the live site is not www.resolutor.co.uk
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const SITE = (process.env.SITE_ORIGIN || "https://www.resolutor.co.uk").replace(/\/$/, "");

/** @returns {string} YYYY-MM-DD */
function mtimeIsoDate(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** @type {Array<{ loc: string, file: string, priority: string, changefreq: string }>} */
const entries = [];

function add(locPath, fileRel, priority, changefreq) {
  const filePath = path.join(root, fileRel);
  entries.push({
    loc: `${SITE}${locPath}`,
    file: filePath,
    priority,
    changefreq,
  });
}

add("/", "index.html", "1.0", "weekly");
add("/about", "about.html", "0.9", "monthly");
add("/pricing", "pricing.html", "0.9", "monthly");
add("/careers", "careers.html", "0.8", "monthly");
add("/consumer", "consumer.html", "0.9", "weekly");
add("/newsroom", "newsroom.html", "0.85", "weekly");

const consumerDir = path.join(root, "consumer");
for (const name of fs.readdirSync(consumerDir)) {
  if (name.endsWith(".html")) {
    const slug = name.replace(/\.html$/, "");
    add(`/consumer/${slug}`, path.join("consumer", name), "0.75", "monthly");
  }
}

const articlesDir = path.join(root, "articles");
for (const name of fs.readdirSync(articlesDir)) {
  if (name.endsWith(".html")) {
    const slug = name.replace(/\.html$/, "");
    add(`/articles/${slug}`, path.join("articles", name), "0.75", "monthly");
  }
}

entries.sort((a, b) => a.loc.localeCompare(b.loc));

const urlXml = entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${mtimeIsoDate(e.file)}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
