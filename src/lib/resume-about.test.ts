import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('about page', () => {
  test('site config keeps the removed resume url option absent', () => {
    const source = readSource('src/config.ts');

    expect(source).not.toContain('resumeUrl');
  });

  test('about page stays focused on the purpose of the blog', () => {
    const source = readSource('src/pages/about.astro');
    const requiredText = ['关于此博客', '项目复盘', '学习记录', '琐碎'];
    const removedText = ['一句话定位', '教育背景', '技能栈', '研究兴趣', '代表项目', '联系方式'];

    for (const text of requiredText) expect(source).toContain(text);
    for (const text of removedText) expect(source).not.toContain(text);
    expect(source).not.toContain('SITE.resumeUrl');
    expect(source).not.toContain('下载简历 PDF');
    expect(source).toContain('border-bottom: 1px solid var(--line);');
    expect(source).not.toContain('rgba(68, 53, 58, 0.12)');
  });
});
