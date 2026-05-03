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

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        about: path.resolve(__dirname, "about.html"),
        pricing: path.resolve(__dirname, "pricing.html"),
        careers: path.resolve(__dirname, "careers.html"),
        consumer: path.resolve(__dirname, "consumer.html"),
        newsroom: path.resolve(__dirname, "newsroom.html"),
        ...consumerPages,
        ...articlePages,
      },
    },
  },
});
