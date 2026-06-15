import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

const NON_INDEXED_ROUTES = ['/albums/', '/friends/', '/graph/'];
const FORMAL_PUBLIC_PATHS = (page) => {
  const { pathname } = new URL(page);
  return !NON_INDEXED_ROUTES.some((route) => pathname.endsWith(route));
};

export default defineConfig({
  site: 'https://jaychouhyl.github.io',
  base: '/yl-blog',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: FORMAL_PUBLIC_PATHS })],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
    shikiConfig: { themes: { light: 'vitesse-light', dark: 'vitesse-dark' }, defaultColor: false },
  },
});
