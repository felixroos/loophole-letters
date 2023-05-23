import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4001,
  },
  site: "https://loophole-letters.netlify.app",
  integrations: [mdx(), sitemap(), tailwind(), solidJs()],
});
