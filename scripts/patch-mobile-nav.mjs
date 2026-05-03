/**
 * One-off patch: mobile sidebar nav markup (backdrop, mobile bar, drawer chrome).
 * Idempotent: skips files that already contain masthead__mobile-bar.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

function walkHtml(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtml(full, acc);
    else if (name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const BACKDROP = `        <div class="mobile-nav__backdrop" hidden></div>
`;

const MOBILE_BAR = (logoSrc) => `          <div class="masthead__mobile-bar">
            <button
              type="button"
              class="mobile-nav__toggle"
              aria-expanded="false"
              aria-controls="site-menu-panel"
            >
              <span class="mobile-nav__toggle-bars" aria-hidden="true"></span>
              <span class="visually-hidden">Open menu</span>
            </button>
            <a class="masthead__logo-link masthead__logo-link--bar" href="/" aria-label="Resolutor Legal Support — home">
              <img
                class="masthead__logo masthead__logo--bar"
                src="${logoSrc}"
                alt="Resolutor Legal Support"
                width="443"
                height="82"
                loading="eager"
              />
            </a>
            <span class="mobile-nav__bar-spacer" aria-hidden="true"></span>
          </div>
`;

const DRAWER_HEAD = `              <div class="mobile-nav__drawer-head">
                <p class="mobile-nav__drawer-title" id="site-menu-panel-title">Menu</p>
                <button type="button" class="mobile-nav__close" aria-label="Close menu">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
`;

for (const file of walkHtml(root)) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes("masthead__mobile-bar")) continue;
  if (!s.includes('<div class="masthead">')) continue;

  s = s.replace('<div class="masthead">', `<div class="masthead">\n${BACKDROP}`);

  s = s.replace(
    '<a class="masthead__logo-link" href="/" aria-label="Resolutor Legal Support — home">',
    '<a class="masthead__logo-link masthead__logo-link--desktop" href="/" aria-label="Resolutor Legal Support — home">',
  );

  const m = s.match(
    /<a class="masthead__logo-link masthead__logo-link--desktop"[\s\S]*?<img[^>]*\bsrc="([^"]+)"/,
  );
  const logoSrc = m?.[1];
  if (!logoSrc) {
    console.error("skip (no logo src):", path.relative(root, file));
    continue;
  }

  s = s.replace(/<div class="masthead__content">\n/, `<div class="masthead__content">\n${MOBILE_BAR(logoSrc)}`);

  s = s.replace(
    /<header class="top">\s*<div class="top__actions">/,
    `<header class="top top--site-menu" id="site-menu-panel" aria-labelledby="site-menu-panel-title">\n            <div class="top__actions">\n${DRAWER_HEAD}`,
  );

  fs.writeFileSync(file, s);
  console.log("patched", path.relative(root, file));
}
