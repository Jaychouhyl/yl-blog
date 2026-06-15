import { readFileSync, statSync } from 'node:fs';
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
});
