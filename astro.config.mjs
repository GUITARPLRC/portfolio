import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Tailwind is applied through PostCSS (see postcss.config.cjs).
export default defineConfig({
    site: 'https://chuckreynolds.dev',
    integrations: [mdx(), sitemap()]
});
