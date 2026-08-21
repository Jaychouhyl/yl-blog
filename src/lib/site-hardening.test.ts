import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n');
}

describe('site hardening', () => {
  test('base layout publishes canonical and social metadata', () => {
    const source = readSource('src/layouts/BaseLayout.astro');

    expect(source).toContain('canonicalUrl');
    expect(source).toContain('property="og:title"');
    expect(source).toContain('property="og:description"');
    expect(source).toContain('property="og:url"');
    expect(source).toContain("withBase('/avatar.png')");
    expect(source).toContain('name="twitter:card" content="summary"');
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

  test('the approved avatar asset is used for profile and social previews', () => {
    expect(readSource('src/layouts/BaseLayout.astro')).toContain("withBase('/favicon.png')");
    expect(readSource('src/components/AvatarCard.astro')).toContain("withBase('/avatar.png')");

    expect(statSync(resolve(root, 'public/avatar.png')).size).toBeLessThan(200_000);
    expect(statSync(resolve(root, 'public/favicon.png')).size).toBeLessThan(120_000);
  });

  test('the public contact email is configured once and rendered as a mail link', () => {
    const config = readSource('src/config.ts');
    const about = readSource('src/pages/about.astro');

    expect(config).toContain("email: 'hyl92186009@gmail.com'");
    expect(about).toContain('href={`mailto:${SITE.email}`}');
    expect(about).toContain('{SITE.email}');
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
    expect(heroSection).toContain('Yilin Blog');
    expect(source).toContain('记录项目、琐碎、AI');
    expect(source).toContain('微服务、前端、后端、AI 学习琐碎');
    expect(heroSection).not.toContain('求职沟通');
    expect(heroSection).not.toContain('考研复试');
  });

  test('homepage hero frames the source artwork for a formal first impression', () => {
    const source = readSource('src/pages/index.astro');
    const heroImageRule = source.slice(source.indexOf('.hero-img'), source.indexOf('.hero-img.loaded'));
    const heroVeilRule = source.slice(source.indexOf('.hero-veil'), source.indexOf(':global(html[data-theme'));

    expect(heroImageRule).toContain('object-fit: cover');
    expect(heroImageRule).toContain('object-position: 42% center');
    expect(heroVeilRule).toContain('radial-gradient(ellipse at center');
    expect(heroVeilRule).toContain('rgba(0,0,0,.68) 0%');
    expect(heroVeilRule).toContain('rgba(0,0,0,0) 74%');
    expect(source).not.toContain('.hero-veil::after');
    expect(source).not.toContain('text-shadow: 0 2px 18px');
  });

  test('homepage lower content starts directly with the article feed', () => {
    const source = readSource('src/pages/index.astro');

    expect(source).toContain('{recent.map((post) => <PostCard post={post} />)}');
    expect(source).not.toContain('class="portfolio-index glass"');
    expect(source).not.toContain('公开材料索引');
    expect(source).not.toContain('<ProfileSummaryWidget />');
    expect(source).not.toContain('音乐播放器');
    expect(source).not.toContain('番剧');
  });

  test('project entries surface status and audience for formal review', () => {
    const schema = readSource('src/content.config.ts');
    const page = readSource('src/pages/projects/index.astro');
    const project = readSource('src/content/projects/smartx-erp.md');

    expect(schema).toContain('status: z.string()');
    expect(schema).toContain('audience: z.array(z.string())');
    expect(project).toContain('status: 毕业设计系统');
    expect(project).toContain('audience: [系统设计, AI 工程, 企业后台, 技术复盘]');
    expect(page).toContain('class="project-meta"');
    expect(page).toContain('当前状态');
    expect(page).toContain('适用场景');
    expect(page).toContain('p.data.status');
    expect(page).toContain('p.data.audience');
  });

  test('personal factual copy stays marked for owner review', () => {
    const about = readSource('src/pages/about.astro');
    const summaryWidget = readSource('src/components/ProfileSummaryWidget.astro');

    expect(about).toContain('具体学校、专业和时间信息暂不公开。');
    expect(about).not.toContain('计算机相关方向');
    expect(summaryWidget).toContain('公开材料');
    expect(summaryWidget).toContain('待补充');
    expect(summaryWidget).not.toContain('数据分析');
    expect(summaryWidget).not.toContain('Web 展示');
  });

  test('SmartX image references preserve the GitHub Pages base path', () => {
    const sources = [
      readSource('src/content/projects/smartx-erp.md'),
      readSource('src/content/posts/smartx-erp-graduation-closeout/index.md'),
      readSource('src/content/posts/smartx-erp-rag-entity-routing/index.md'),
    ];

    for (const source of sources) {
      expect(source).not.toContain('](/images/projects/smartx-erp/');
      expect(source).not.toContain('](../../images/projects/smartx-erp/');
    }

    expect(sources[0]).toContain('](../../../public/images/projects/smartx-erp/');
    expect(sources[1]).toContain('](../../../../public/images/projects/smartx-erp/');
    expect(sources[2]).toContain('](../../../../public/images/projects/smartx-erp/');
  });

  test('about profile separators use theme line token', () => {
    const about = readSource('src/pages/about.astro');

    expect(about).toContain('border-top: 1px solid var(--line);');
    expect(about).not.toContain('rgba(68, 53, 58, 0.12)');
  });

  test('project card separators use theme line token', () => {
    const projects = readSource('src/pages/projects/index.astro');

    expect(projects).toContain('.card-head { border-bottom: 1px solid var(--line);');
    expect(projects).not.toContain('rgba(68, 53, 58, 0.12)');
  });

  test('reader-facing archive and project labels stay in Chinese', () => {
    const posts = readSource('src/pages/posts/index.astro');
    const projects = readSource('src/pages/projects/index.astro');

    expect(posts).toContain('<PageTitleHero title="时间轴" />');
    expect(posts).not.toContain('>Categories</a>');
    expect(projects).toContain('>公开项目</p>');
    expect(projects).not.toContain('>Portfolio Item</p>');
  });

  test('main archive pages omit repeated eyebrow labels', () => {
    const home = readSource('src/pages/index.astro');
    const about = readSource('src/pages/about.astro');
    const posts = readSource('src/pages/posts/index.astro');
    const projects = readSource('src/pages/projects/index.astro');

    expect(home).not.toContain('>公开材料</p>');
    expect(home).not.toContain('PUBLIC PORTFOLIO');
    expect(home).not.toContain('PUBLIC MATERIALS');
    expect(about).not.toContain('>关于</p>');
    expect(about).not.toContain('>ABOUT</p>');
    expect(posts).not.toContain('>时间轴</p>');
    expect(posts).not.toContain('>ARCHIVE</p>');
    expect(projects).toContain('>项目</p>');
    expect(projects).not.toContain('>PROJECTS</p>');
  });

  test('reader-facing Chinese labels avoid uppercase tracking styles', () => {
    const base = readSource('src/styles/base.css');
    const posts = readSource('src/pages/posts/index.astro');
    const projects = readSource('src/pages/projects/index.astro');

    const pageSubRule = base.slice(base.indexOf('.page-sub'), base.indexOf(':focus-visible'));
    const categoryIndexRule = posts.slice(posts.indexOf('.category-index'), posts.indexOf('.count'));
    const projectEyebrowRule = projects.slice(projects.indexOf('.eyebrow'), projects.indexOf('.name'));

    expect(pageSubRule).not.toContain('letter-spacing');
    expect(pageSubRule).not.toContain('text-transform');
    expect(categoryIndexRule).not.toContain('letter-spacing');
    expect(categoryIndexRule).not.toContain('text-transform');
    expect(projectEyebrowRule).not.toContain('letter-spacing');
    expect(projectEyebrowRule).not.toContain('text-transform');
  });

  test('search modal follows formal design tokens', () => {
    const source = readSource('src/components/SearchModal.astro');
    const modalRule = source.slice(source.indexOf('#search-modal {'), source.indexOf('#search-modal::backdrop'));

    expect(source).toContain('border-radius: 8px');
    expect(modalRule).toContain('--pagefind-ui-background: var(--card);');
    expect(modalRule).toContain('--pagefind-ui-text: var(--ink);');
    expect(modalRule).toContain('--pagefind-ui-border: var(--line);');
    expect(modalRule).toContain('--pagefind-ui-primary: var(--sakura);');
    expect(modalRule).toContain('--pagefind-ui-tag: var(--sakura-soft);');
    expect(source).not.toContain(":global(html[data-theme='dark']) #search-modal");
    expect(source).not.toContain('border-radius: 14px');
    expect(source).not.toContain('#2a2420');
    expect(source).not.toContain('#e8e2d8');
    expect(source).not.toContain('#4a4038');
    expect(source).not.toContain('#d4738c');
    expect(source).not.toContain('#3a2c22');
  });

  test('search modal has an accessible title and close control', () => {
    const source = readSource('src/components/SearchModal.astro');

    expect(source).toContain('<dialog id="search-modal" aria-labelledby="search-title">');
    expect(source).toContain('<header class="search-head">');
    expect(source).toContain('<h2 id="search-title">搜索站内内容</h2>');
    expect(source).toContain('id="search-close"');
    expect(source).toContain('aria-label="关闭搜索"');
    expect(source).toContain("const closeButton = document.getElementById('search-close')");
    expect(source).toContain("closeButton?.addEventListener('click', () => modal.close());");
  });

  test('transparent nav hover keeps the formal hero palette', () => {
    const source = readSource('src/components/Nav.astro');

    expect(source).toContain('.nav.transparent .link:hover { color: rgba(255,255,255,.86); }');
    expect(source).not.toContain('#ffd9e2');
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

  test('feather motion is loaded globally and listens for page clicks', () => {
    const effects = readSource('src/scripts/effects.ts');
    const layout = readSource('src/layouts/BaseLayout.astro');
    const home = readSource('src/pages/index.astro');

    expect(effects).not.toContain("document.querySelector<HTMLElement>('.hero-screen')");
    expect(effects).toContain('if (!reduced) {');
    expect(effects).toContain('document.body.appendChild(canvas)');
    expect(effects).toContain("canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;'");
    expect(effects).toContain("document.addEventListener('click'");
    expect(effects).toContain('if (e.detail === 0) return;');
    expect(effects).toContain('x: e.clientX, y: e.clientY');
    expect(effects).toContain('innerWidth');
    expect(effects).toContain('innerHeight');
    expect(effects).toContain('Math.random() * innerWidth');
    expect(effects).toContain('drawFeather');
    expect(effects).toContain("attributeFilter: ['data-theme', 'data-accent']");
    expect(effects).toContain('ctx.setTransform(dpr, 0, 0, dpr, 0, 0)');
    expect(effects).toContain("document.addEventListener('visibilitychange'");
    expect(effects).not.toContain("hero.addEventListener('click'");
    expect(effects).not.toContain('getBoundingClientRect()');
    expect(layout).toContain('scripts/effects.ts');
    expect(home).not.toContain('scripts/effects.ts');
  });

  test('stale identity panel component is removed after hero takes over first-screen identity', () => {
    expect(readSource('src/pages/index.astro')).not.toContain('IdentityPanel');
    expect(existsSync(resolve(root, 'src/components/IdentityPanel.astro'))).toBe(false);
  });
});
