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

  test('post detail page renders the component behind the existing toc gate', () => {
    const source = readFileSync(resolve(root, 'src/pages/posts/[id].astro'), 'utf8');

    expect(source).toContain("import FloatingToc from '../../components/FloatingToc.astro';");
    expect(source).toContain('{toc.length > 2 && <FloatingToc headings={toc} />}');
    expect(source).not.toContain('class="toc glass"');
  });
});
