import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n');
}

describe('approved blog interface', () => {
  test('primary navigation uses the approved centered entries', () => {
    const config = readSource('src/config.ts');
    const nav = readSource('src/components/Nav.astro');

    expect(config).toContain("{ label: '首页', href: '/' }");
    expect(config).toContain("{ label: '时间轴', href: '/posts/' }");
    expect(config).toContain("{ label: '标签', href: '/tags/' }");
    expect(config).toContain("{ label: '分类', href: '/categories/' }");
    expect(config).toContain("{ label: '关于', href: '/about/' }");
    expect(config).not.toContain("{ label: '项目', href: '/projects/' }");
    expect(nav).toContain('left: 50%; transform: translateX(-50%)');
    expect(nav).toContain('#search-btn { font-size: 19px; }');
  });

  test('homepage uses the approved full-screen title and typewriter copy', () => {
    const home = readSource('src/pages/index.astro');

    expect(home).toContain('>Yilin Blog</h1>');
    expect(home).toContain('data-typewriter');
    expect(home).toContain('记录项目、琐碎、AI');
    expect(home).toContain('微服务、前端、后端、AI 学习琐碎');
    expect(home).toContain("window.addEventListener('wheel'");
    expect(home).toContain("document.getElementById('home-content')");
    expect(home).not.toContain('hero-actions');
    expect(home).not.toContain('hero-tags');
  });

  test('shared sidebar keeps the approved content order and limits recent posts', () => {
    expect(existsSync(resolve(root, 'src/components/ContentSidebar.astro'))).toBe(true);
    const sidebar = readSource('src/components/ContentSidebar.astro');
    const avatar = readSource('src/components/AvatarCard.astro');
    const recent = readSource('src/components/RecentPostsWidget.astro');

    expect(sidebar.indexOf('<AvatarCard />')).toBeLessThan(sidebar.indexOf('<AnnouncementWidget />'));
    expect(sidebar.indexOf('<AnnouncementWidget />')).toBeLessThan(sidebar.indexOf('<RecentPostsWidget limit={3} />'));
    expect(sidebar.indexOf('<RecentPostsWidget limit={3} />')).toBeLessThan(sidebar.indexOf('<SiteStats />'));
    expect(sidebar).toContain('data-pagefind-ignore');
    expect(avatar).toContain('Follow Me');
    expect(avatar).toContain('SITE.github');
    expect(avatar).toContain('项目 · 琐碎 · AI');
    expect(avatar).not.toContain('>RSS</a>');
    expect(recent).toContain('limit = 3');
  });

  test('shared content layout renders one lazy comment section after main content', () => {
    const layout = readSource('src/components/ContentPageLayout.astro');
    const comments = readSource('src/components/CommentSection.astro');

    expect(layout).toContain('<ContentSidebar />');
    expect(layout).toContain('<slot name="sidebar"><ContentSidebar /></slot>');
    expect(layout).toContain('grid-template-columns: 250px minmax(0, 1fr)');
    expect(layout).not.toContain('grid-template-columns: minmax(300px, 320px) minmax(0, 1fr)');
    expect(layout).toContain('<CommentSection />');
    expect((layout.match(/<CommentSection \/>/g) ?? [])).toHaveLength(1);
    expect(comments).toContain('<Giscus />');
    expect(comments).toContain('>评论</h2>');
    expect(comments).toContain('data-pagefind-ignore');
  });

  test('reader pages use the shared layout', () => {
    const pages = [
      'src/pages/about.astro',
      'src/pages/posts/index.astro',
      'src/pages/posts/[id].astro',
      'src/pages/projects/index.astro',
      'src/pages/projects/[id].astro',
      'src/pages/categories/index.astro',
      'src/pages/categories/[category].astro',
      'src/pages/tags/index.astro',
      'src/pages/tags/[tag].astro',
      'src/pages/series/index.astro',
      'src/pages/series/[series].astro',
      'src/pages/albums/index.astro',
      'src/pages/friends/index.astro',
      'src/pages/graph/index.astro',
    ];

    for (const page of pages) {
      expect(readSource(page), page).toMatch(/<ContentPageLayout(?: compactTop)?>/);
    }
  });

  test('timeline, categories and tags keep distinct main structures', () => {
    const posts = readSource('src/pages/posts/index.astro');
    const categories = readSource('src/pages/categories/index.astro');
    const tags = readSource('src/pages/tags/index.astro');

    expect(posts).toContain('class="archive-timeline"');
    expect(posts).toContain('class="timeline-year"');
    expect(posts).not.toContain('class="tag-cloud"');
    expect(posts).not.toContain('class="category-bar"');
    expect(categories).toContain('class="category-list"');
    expect(tags).toContain('--tag-weight');
  });

  test('homepage supplements its existing second-screen content', () => {
    const home = readSource('src/pages/index.astro');

    expect(home).toContain('<RecentPostsWidget limit={3} />');
    expect(home).toContain('<SiteStats />');
    expect(home).toContain('<CommentSection />');
    expect(home).not.toContain('<ProfileSummaryWidget />');
    expect(home).not.toContain('公开材料索引');
  });

  test('main archive pages do not repeat their titles as small labels', () => {
    const pages = [
      'src/pages/about.astro',
      'src/pages/posts/index.astro',
      'src/pages/categories/index.astro',
      'src/pages/tags/index.astro',
    ];

    for (const page of pages) {
      expect(readSource(page), page).not.toContain('class="page-sub"');
    }
  });

  test('main archive pages use a compact title hero above their content', () => {
    expect(existsSync(resolve(root, 'src/components/PageTitleHero.astro'))).toBe(true);
    const hero = readSource('src/components/PageTitleHero.astro');
    const pages = [
      ['src/pages/posts/index.astro', '时间轴'],
      ['src/pages/categories/index.astro', '分类'],
      ['src/pages/tags/index.astro', '标签'],
      ['src/pages/about.astro', '关于'],
    ] as const;

    expect(hero).toContain('class="page-title-hero"');
    expect(hero).toContain('SITE.heroImages');
    expect(hero).toContain('height: clamp(380px, 46vh, 500px)');
    expect(hero).not.toContain('data-typewriter');
    for (const [page, title] of pages) {
      const source = readSource(page);
      expect(source, page).toContain(`title="${title}"`);
      expect(source, page).toContain('<ContentPageLayout compactTop>');
      expect(source, page).not.toContain('class="page-title"');
    }
  });

  test('tag cloud uses varied color, type and position treatments', () => {
    const tags = readSource('src/pages/tags/index.astro');

    expect(tags).toContain('tagColors');
    expect(tags).toContain('--tag-color');
    expect(tags).toContain('--tag-tilt');
    expect(tags).toContain('--tag-shift-x');
    expect(tags).toContain('--tag-shape');
    expect(tags).toContain('margin: 5px 7px;');
    expect(tags).toContain('.tag-cloud-page a:nth-child(3n)');
    expect(tags).toContain('.tag-cloud-page a:nth-child(5n)');
    expect(tags).toContain('.tag-cloud-page a:nth-child(7n)');
  });
});
