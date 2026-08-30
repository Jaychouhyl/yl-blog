import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const postsRoot = resolve(root, 'src/content/posts');

const categoryByPrefix = new Map([
  ['smartx-erp-', 'SmartX ERP'],
  ['auto-obsidian-', 'Auto Obsidian MD'],
  ['neokg-', 'NeoKG'],
  ['easyhome-', 'EasyHome'],
]);

describe('project article categories', () => {
  test('each project series uses its project name as the category', () => {
    const projectPosts = readdirSync(postsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => [...categoryByPrefix.keys()].some((prefix) => slug.startsWith(prefix)));

    expect(projectPosts).toHaveLength(21);

    for (const slug of projectPosts) {
      const expected = [...categoryByPrefix].find(([prefix]) => slug.startsWith(prefix))?.[1];
      const source = readFileSync(resolve(postsRoot, slug, 'index.md'), 'utf8');

      expect(source, slug).toContain(`category: ${expected}`);
      expect(source, slug).not.toContain('category: 项目复盘');
    }
  });
});
