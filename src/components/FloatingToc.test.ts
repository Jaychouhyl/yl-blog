import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('FloatingToc integration', () => {
  test('component includes desktop, mobile, and active section behavior', () => {
    const componentPath = resolve(root, 'src/components/FloatingToc.astro');

    expect(existsSync(componentPath)).toBe(true);

    const source = readFileSync(componentPath, 'utf8');
    expect(source).toContain('floating-toc-wrapper');
    expect(source).toContain('floating-toc-panel');
    expect(source).toContain('data-toc-progress>0</span>');
    expect(source).toContain('updateReadingProgress');
    expect(source).toContain("window.addEventListener('scroll', requestReadingProgressUpdate, { passive: true })");
    expect(source).toContain('floating-toc-toggle');
    expect(source).toContain('floating-toc-drawer');
    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('article h2, article h3');
    expect(source).toContain('prefers-reduced-motion: reduce');
    expect(source).toContain('keydown');
    expect(source).toContain('Escape');
    expect(source).toContain('focus({ preventScroll: true })');
    expect(source).toContain('chooseActiveHeading');
    expect(source).toContain('visibleHeadings');
    expect(source).toContain('aria-controls={drawerId}');
    expect(source).toContain('.active');
  });

  test('article headings keep enough offset below the fixed navigation', () => {
    const source = readFileSync(resolve(root, 'src/styles/prose.css'), 'utf8');

    expect(source).toContain('.prose h2,');
    expect(source).toContain('.prose h3');
    expect(source).toContain('scroll-margin-top');
    expect(source).toContain('var(--page-top)');
  });

  test('post detail page renders the toc through the article sidebar', () => {
    const source = readFileSync(resolve(root, 'src/pages/posts/[id].astro'), 'utf8');
    const sidebar = readFileSync(resolve(root, 'src/components/ArticleSidebar.astro'), 'utf8');
    const hero = readFileSync(resolve(root, 'src/components/ArticleTitleHero.astro'), 'utf8');

    expect(source).toContain("import ArticleTitleHero from '../../components/ArticleTitleHero.astro';");
    expect(source).toContain("<ArticleTitleHero post={post} readingTime={readingMinutes(post.body ?? '')} />");
    expect(source).toContain('<ContentPageLayout compactTop>');
    expect(hero).toContain('height: clamp(380px, 46vh, 500px)');
    expect(source).toContain("import ArticleSidebar from '../../components/ArticleSidebar.astro';");
    expect(source).toContain('<ArticleSidebar slot="sidebar" headings={toc} />');
    expect(sidebar.indexOf('<AvatarCard />')).toBeLessThan(sidebar.indexOf('<AnnouncementWidget />'));
    expect(sidebar.indexOf('<AnnouncementWidget />')).toBeLessThan(sidebar.indexOf('<FloatingToc headings={headings} />'));
    expect(sidebar.indexOf('<FloatingToc headings={headings} />')).toBeLessThan(sidebar.indexOf('<RecentPostsWidget limit={3} />'));
    expect(sidebar.indexOf('<RecentPostsWidget limit={3} />')).toBeLessThan(sidebar.indexOf('<SiteStats />'));
    expect(sidebar).toContain('position: sticky');
    expect(sidebar).toContain('max-height: calc(100vh - var(--page-top) - 18px)');
    expect(sidebar).toContain('scrollbar-width: none');
    expect(sidebar).toContain('::-webkit-scrollbar');
    expect(sidebar).toContain('font-family: var(--sans)');
    expect(sidebar).toContain('.article-sidebar :global(.widget)');
    expect(sidebar).toContain('font-size: 15px');
    expect(source).not.toContain('<header class="head">');
    expect(source).not.toContain('class="toc glass"');
  });
});
