import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('site hardening', () => {
  test('base layout publishes canonical and social metadata', () => {
    const source = readSource('src/layouts/BaseLayout.astro');

    expect(source).toContain('canonicalUrl');
    expect(source).toContain('property="og:title"');
    expect(source).toContain('property="og:description"');
    expect(source).toContain('property="og:url"');
    expect(source).toContain('name="twitter:card"');
  });

  test('giscus is loaded only after an explicit reader action', () => {
    const source = readSource('src/components/Giscus.astro');

    expect(source).toContain('data-giscus-container');
    expect(source).toContain('data-giscus-loader');
    expect(source).toContain('document.createElement');
    expect(source).toContain('https://giscus.app/client.js');
    expect(source).not.toContain('<script\n      is:inline\n      src="https://giscus.app/client.js"');
  });

  test('content collection external links reject script-like protocols', () => {
    const source = readSource('src/content.config.ts');

    expect(source).toContain('webUrl');
    expect(source).toContain("protocol === 'https:'");
    expect(source).toContain("protocol === 'http:'");
  });

  test('github pages deploy permissions are scoped by job', () => {
    const source = readSource('.github/workflows/deploy.yml');

    expect(source).toMatch(/permissions:\s*\n\s+contents: read/);
    expect(source).toMatch(/deploy:\s*\n(?:.*\n)*?\s+permissions:\s*\n\s+pages: write\n\s+id-token: write/);
  });

  test('dependency overrides keep audited transitive packages on patched versions', () => {
    const manifest = JSON.parse(readSource('package.json'));
    const lock = JSON.parse(readSource('package-lock.json'));

    expect(manifest.overrides).toMatchObject({
      esbuild: '0.28.1',
      'volar-service-yaml': '0.0.71',
    });
    expect(lock.packages['node_modules/esbuild'].version).toBe('0.28.1');
    expect(lock.packages['node_modules/volar-service-yaml'].version).toBe('0.0.71');
    expect(lock.packages['node_modules/yaml-language-server/node_modules/yaml'].version).toBe('2.8.3');
  });

  test('small generated avatar assets are used for chrome and profile UI', () => {
    expect(readSource('src/layouts/BaseLayout.astro')).toContain("withBase('/favicon.png')");
    expect(readSource('src/components/AvatarCard.astro')).toContain("withBase('/avatar.webp')");

    expect(statSync(resolve(root, 'public/avatar.webp')).size).toBeLessThan(20_000);
    expect(statSync(resolve(root, 'public/favicon.png')).size).toBeLessThan(120_000);
  });

  test('rss rendering drops raw html before publishing feed content', () => {
    const source = readSource('src/pages/rss.xml.ts');

    expect(source).toContain("import { marked, Renderer } from 'marked';");
    expect(source).toContain('const rssRenderer = new Renderer();');
    expect(source).toContain('rssRenderer.html = () =>');
    expect(source).toContain('{ renderer: rssRenderer }');
  });

  test('public navigation surface stays formal and focused', () => {
    const footer = readSource('src/components/Footer.astro');
    const firstPost = readSource('src/content/posts/hello-world/index.md');

    expect(footer).toContain("withBase('/categories/')");
    expect(footer).toContain("withBase('/rss.xml')");
    expect(footer).not.toContain("withBase('/graph/')");
    expect(footer).not.toContain("withBase('/albums/')");
    expect(footer).not.toContain("withBase('/friends/')");
    expect(firstPost).toContain('tags: [站点记录]');
    expect(firstPost).toContain('category: 站点记录');
    expect(firstPost).not.toContain('tags: [随笔]');
    expect(firstPost).not.toContain('category: 随笔');
  });

  test('homepage hero carries the formal first-screen identity', () => {
    const source = readSource('src/pages/index.astro');
    const heroSection = source.slice(source.indexOf('<section class="hero-screen"'), source.indexOf('</section>') + 10);

    expect(heroSection).toContain('aria-labelledby="hero-title"');
    expect(heroSection).toContain('id="hero-title"');
    expect(heroSection).toContain('写作、项目与长期复盘');
    expect(heroSection).toContain('求职沟通');
    expect(heroSection).toContain('考研复试');
    expect(heroSection).toContain("href={withBase('/projects/')}");
    expect(heroSection).toContain("href={withBase('/about/')}");
  });

  test('homepage hero frames the source artwork for a formal first impression', () => {
    const source = readSource('src/pages/index.astro');
    const heroImageRule = source.slice(source.indexOf('.hero-img'), source.indexOf('.hero-img.loaded'));
    const heroVeilRule = source.slice(source.indexOf('.hero-veil'), source.indexOf(':global(html[data-theme'));

    expect(heroImageRule).toContain('object-fit: cover');
    expect(heroImageRule).toContain('object-position: 42% center');
    expect(heroVeilRule).toContain('linear-gradient(115deg');
    expect(heroVeilRule).toContain('rgba(0,0,0,.62) 100%');
    expect(source).toContain('.hero-veil::after');
    expect(source).toContain('inset: 0');
    expect(source).toContain('radial-gradient(ellipse at 84% 76%');
    expect(source).toContain('rgba(0,0,0,.92) 0%');
    expect(source).toContain('rgba(0,0,0,.18) 68%');
    expect(source).not.toContain('inset: 52% 0 0 46%');
    expect(source).not.toContain('background: linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.78) 100%);');
  });

  test('homepage lower content acts as a formal material index', () => {
    const source = readSource('src/pages/index.astro');

    expect(source).toContain('class="portfolio-index glass"');
    expect(source).toContain('公开材料索引');
    expect(source).toContain("href={withBase('/projects/')}");
    expect(source).toContain("href={withBase('/posts/')}");
    expect(source).toContain("href={withBase('/about/')}");
    expect(source).toContain('求职沟通');
    expect(source).toContain('考研复试');
    expect(source).toContain('border-top: 1px solid var(--line);');
    expect(source).not.toContain('background: rgba(255,255,255,.44);');
    expect(source).not.toContain('音乐播放器');
    expect(source).not.toContain('番剧');
  });

  test('project entries surface status and audience for formal review', () => {
    const schema = readSource('src/content.config.ts');
    const page = readSource('src/pages/projects/index.astro');
    const project = readSource('src/content/projects/oracle-alpha.md');

    expect(schema).toContain('status: z.string()');
    expect(schema).toContain('audience: z.array(z.string())');
    expect(project).toContain('status: 建设中');
    expect(project).toContain('audience: [求职沟通, 考研复试]');
    expect(page).toContain('class="project-meta"');
    expect(page).toContain('当前状态');
    expect(page).toContain('适用场景');
    expect(page).toContain('p.data.status');
    expect(page).toContain('p.data.audience');
  });

  test('secondary personal-blog pages are not promoted to search or sitemap indexes', () => {
    const layout = readSource('src/layouts/BaseLayout.astro');
    const sitemapConfig = readSource('astro.config.mjs');
    const secondaryPages = [
      'src/pages/albums/index.astro',
      'src/pages/friends/index.astro',
      'src/pages/graph/index.astro',
    ];

    expect(layout).toContain('noindex');
    expect(layout).toContain('searchable');
    expect(layout).toContain('name="robots"');
    expect(layout).toContain('data-pagefind-body={searchable');

    expect(sitemapConfig).toContain('FORMAL_PUBLIC_PATHS');
    expect(sitemapConfig).toContain('sitemap({');
    expect(sitemapConfig).toContain('filter:');

    for (const page of secondaryPages) {
      const source = readSource(page);
      expect(source).toContain('noindex={true}');
      expect(source).toContain('searchable={false}');
    }

    expect(readSource('src/pages/friends/index.astro')).not.toContain('想交换友链');
  });

  test('decorative motion is scoped to the homepage hero only', () => {
    const effects = readSource('src/scripts/effects.ts');
    const layout = readSource('src/layouts/BaseLayout.astro');
    const home = readSource('src/pages/index.astro');

    expect(effects).toContain("document.querySelector<HTMLElement>('.hero-screen')");
    expect(effects).toContain('hero.appendChild(canvas)');
    expect(effects).toContain("canvas.style.cssText = 'position:absolute;");
    expect(effects).toContain("hero.addEventListener('click'");
    expect(effects).not.toContain('document.body.appendChild(canvas)');
    expect(effects).not.toContain("document.addEventListener('click'");
    expect(layout).not.toContain('scripts/effects.ts');
    expect(home).toContain('scripts/effects.ts');
  });

  test('stale identity panel component is removed after hero takes over first-screen identity', () => {
    expect(readSource('src/pages/index.astro')).not.toContain('IdentityPanel');
    expect(existsSync(resolve(root, 'src/components/IdentityPanel.astro'))).toBe(false);
  });
});
