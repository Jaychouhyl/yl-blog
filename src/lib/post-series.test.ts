import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('post series system', () => {
  test('post schema supports ordered series metadata', () => {
    const source = readSource('src/content.config.ts');

    expect(source).toContain('series: z.string().optional()');
    expect(source).toContain('seriesOrder: z.number().optional()');
  });

  test('post helpers expose grouped series ordered by article order', () => {
    const source = readSource('src/lib/posts.ts');

    expect(source).toContain('allSeries');
    expect(source).toContain('seriesOrder');
    expect(source).toContain('localeCompare');
  });

  test('article detail renders a bottom series navigator', () => {
    const source = readSource('src/pages/posts/[id].astro');

    expect(source).toContain('SeriesNav');
    expect(source).toContain('seriesPosts');
    expect(source).toContain('post.data.series');
  });

  test('series navigator and pages use base-aware internal links', () => {
    const componentPath = resolve(root, 'src/components/SeriesNav.astro');
    const indexPath = resolve(root, 'src/pages/series/index.astro');
    const detailPath = resolve(root, 'src/pages/series/[series].astro');

    expect(existsSync(componentPath)).toBe(true);
    expect(existsSync(indexPath)).toBe(true);
    expect(existsSync(detailPath)).toBe(true);

    expect(readSource('src/components/SeriesNav.astro')).toContain('withBase(`/posts/${post.id}/`)');
    expect(readSource('src/pages/series/index.astro')).toContain('withBase(`/series/${series}/`)');
    expect(readSource('src/pages/series/[series].astro')).toContain('PostCard');
  });

  test('example post participates in a neutral site-building series', () => {
    const source = readSource('src/content/posts/hello-world/index.md');

    expect(source).toContain('series: 站点建设');
    expect(source).toContain('seriesOrder: 1');
  });

  test('post tags stay safe for single-segment tag routes', () => {
    const postRoot = resolve(root, 'src/content/posts');
    const files = readdirSync(postRoot, { recursive: true })
      .map(String)
      .filter((path) => path.endsWith('index.md'));

    const invalidTags = files.flatMap((path) => {
      const source = readFileSync(resolve(postRoot, path), 'utf8');
      const tagLine = source.match(/^tags:\s*\[(.*)\]$/m)?.[1] ?? '';
      return tagLine
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.includes('/'))
        .map((tag) => `${path}: ${tag}`);
    });

    expect(invalidTags).toEqual([]);
  });
});
