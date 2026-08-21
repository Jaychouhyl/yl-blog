import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readSource(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('resume style about page', () => {
  test('site config keeps the removed resume url option absent', () => {
    const source = readSource('src/config.ts');

    expect(source).not.toContain('resumeUrl');
  });

  test('about page is structured as a restrained resume entry', () => {
    const source = readSource('src/pages/about.astro');
    const requiredText = [
      '一句话定位',
      '教育背景',
      '技能栈',
      '研究兴趣',
      '代表项目',
      '联系方式',
      '语言',
      '框架与工具',
      '方向',
    ];

    for (const text of requiredText) expect(source).toContain(text);
    expect(source).toContain("href={withBase('/projects/smartx-erp/')}");
    expect(source).not.toContain('SITE.resumeUrl');
    expect(source).not.toContain('下载简历 PDF');
    expect(source).toContain('border-top: 1px solid var(--line);');
    expect(source).not.toContain('rgba(68, 53, 58, 0.12)');
  });
});
