/**
 * Keeps repository articles/*.html Open Graph and article:published_time tags aligned
 * with public/articles.json (for local dev parity with the post-build dist pipeline).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureArticlePublishedMeta, ensureOgImageDims, loadArticleMeta } from "./seo-meta-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const articleMeta = loadArticleMeta(root);
const dir = path.join(root, "articles");

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith(".html")) continue;
  const slug = name.replace(/\.html$/, "");
  if (!articleMeta[slug]) continue;
  const fp = path.join(dir, name);
  let html = fs.readFileSync(fp, "utf8");
  const before = html;
  html = ensureArticlePublishedMeta(html, slug, articleMeta);
  html = ensureOgImageDims(html);
  if (html !== before) {
    fs.writeFileSync(fp, html, "utf8");
    console.log("synced article meta:", path.relative(root, fp));
  }
}
