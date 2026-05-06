import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const consumerDir = path.resolve(__dirname, "consumer");
/** @type {Record<string, string>} */
const consumerPages = {};
if (fs.existsSync(consumerDir)) {
  for (const name of fs.readdirSync(consumerDir)) {
    if (name.endsWith(".html")) {
      const base = path.basename(name, ".html");
      consumerPages[`consumer/${base}`] = path.join(consumerDir, name);
    }
  }
}

const articlesDir = path.resolve(__dirname, "articles");
/** @type {Record<string, string>} */
const articlePages = {};
if (fs.existsSync(articlesDir)) {
  for (const name of fs.readdirSync(articlesDir)) {
    if (name.endsWith(".html")) {
      const base = path.basename(name, ".html");
      articlePages[`articles/${base}`] = path.join(articlesDir, name);
    }
  }
}

/** Dev/preview: map /about → /about.html. Build: move about.html → about/index.html for static hosts. */
function extensionlessHtmlRoutes() {
  return {
    name: "extensionless-html-routes",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        const raw = req.url ?? "";
        if (raw.startsWith("/@") || raw.startsWith("/node_modules") || raw.startsWith("/src")) return next();
        let url = raw.split("?")[0] ?? "";
        if (url === "/" || url === "") return next();
        url = url.replace(/\/$/, "");
        const last = url.split("/").pop() ?? "";
        if (last.includes(".")) {
          if (last.endsWith(".html")) return next();
          return next();
        }
        req.url = `${url}.html${raw.includes("?") ? "?" + raw.split("?").slice(1).join("?") : ""}`;
        next();
      });
    },
    configurePreviewServer(server) {
      const distRoot = path.resolve(__dirname, "dist");
      server.middlewares.use((req, _res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        const raw = req.url ?? "";
        let url = raw.split("?")[0] ?? "";
        if (url === "/" || url === "") return next();
        url = url.replace(/\/$/, "").replace(/^\//, "");
        const last = url.split("/").pop() ?? "";
        if (last.includes(".")) {
          if (last.endsWith(".html")) return next();
          return next();
        }
        const diskPath = path.join(distRoot, url, "index.html");
        if (fs.existsSync(diskPath)) {
          const q = raw.includes("?") ? "?" + raw.split("?").slice(1).join("?") : "";
          req.url = `/${url}/index.html${q}`;
        }
        next();
      });
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      if (!fs.existsSync(outDir)) return;

      function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
          const full = path.join(dir, ent.name);
          if (ent.isDirectory()) {
            if (ent.name === "assets") continue;
            walk(full);
          } else if (ent.name.endsWith(".html") && ent.name !== "index.html" && ent.name !== "404.html") {
            const base = ent.name.slice(0, -5);
            const targetDir = path.join(dir, base);
            fs.mkdirSync(targetDir, { recursive: true });
            fs.renameSync(full, path.join(targetDir, "index.html"));
          }
        }
      }

      walk(outDir);
    },
  };
}

export default defineConfig({
  plugins: [extensionlessHtmlRoutes()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        about: path.resolve(__dirname, "about.html"),
        pricing: path.resolve(__dirname, "pricing.html"),
        careers: path.resolve(__dirname, "careers.html"),
        contact: path.resolve(__dirname, "contact.html"),
        notFound: path.resolve(__dirname, "404.html"),
        consumer: path.resolve(__dirname, "consumer.html"),
        newsroom: path.resolve(__dirname, "newsroom.html"),
        login: path.resolve(__dirname, "login.html"),
        signup: path.resolve(__dirname, "signup.html"),
        dashboard: path.resolve(__dirname, "dashboard.html"),
        ...consumerPages,
        ...articlePages,
      },
    },
  },
});
