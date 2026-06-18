import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('project portfolio structure', () => {
  test('project collection supports portfolio metadata', () => {
    const source = readFileSync(resolve(root, 'src/content.config.ts'), 'utf8');

    expect(source).toContain('demo: webUrl.optional()');
    expect(source).toContain('role: z.string().optional()');
    expect(source).toContain('period: z.string().optional()');
    expect(source).toContain('featured: z.boolean().default(false)');
    expect(source).toContain('summary: z.string().optional()');
  });

  test('project detail route renders markdown with interview metadata', () => {
    const detailPath = resolve(root, 'src/pages/projects/[id].astro');

    expect(existsSync(detailPath)).toBe(true);

    const source = readFileSync(detailPath, 'utf8');
    expect(source).toContain('getStaticPaths');
    expect(source).toContain("getCollection('projects')");
    expect(source).toContain('ReadingProgress');
    expect(source).toContain('ProjectMetaCard');
    expect(source).toContain('<Content />');
    expect(source).toContain("withBase('/projects/')");
  });

  test('project metadata card exposes actions and structured fields', () => {
    const source = readFileSync(resolve(root, 'src/components/ProjectMetaCard.astro'), 'utf8');

    expect(source).toContain('project-hero');
    expect(source).toContain('project-actions');
    expect(source).toContain('data.repo');
    expect(source).toContain('data.demo');
  });

  test('project list links cards to detail pages without rendering full markdown', () => {
    const source = readFileSync(resolve(root, 'src/pages/projects/index.astro'), 'utf8');

    expect(source).toContain('portfolio-card');
    expect(source).toContain('withBase(`/projects/${p.id}/`)');
    expect(source).toContain('p.data.summary');
    expect(source).toContain('p.data.role');
    expect(source).toContain('p.data.period');
    expect(source).not.toContain('render(p)');
  });

  test('OracleAlpha keeps a restrained portfolio template', () => {
    const source = readFileSync(resolve(root, 'src/content/projects/oracle-alpha.md'), 'utf8');
    const headings = [
      '## 背景与目标',
      '## 技术栈与架构',
      '## 我负责的部分',
      '## 难点与解决',
      '## 结果与指标',
      '## 复盘与下一步',
    ];

    for (const heading of headings) expect(source).toContain(heading);
    expect(source).toContain('// 待站主填写真实信息');
    expect(source).toContain('不声称已上线');
  });
});
