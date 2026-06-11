import { describe, it, expect } from 'vitest';
import { countWords, readingMinutes, formatDate } from './text';

describe('countWords', () => {
  it('统计中文字符数', () => {
    expect(countWords('你好世界')).toBe(4);
  });
  it('中英混排：中文按字、英文按词', () => {
    expect(countWords('用 Python 写策略')).toBe(4 + 1); // 用写策略=4字 + Python=1词
  });
  it('忽略代码块与图片，链接只算文字', () => {
    const md = '前言\n```js\nconst x = 1;\n```\n![图](./a.png)\n[链接文字](https://x.com)';
    expect(countWords(md)).toBe(2 + 4); // 前言 + 链接文字
  });
});

describe('readingMinutes', () => {
  it('400 字/分钟，向上保底 1 分钟', () => {
    expect(readingMinutes('短')).toBe(1);
    expect(readingMinutes('字'.repeat(1200))).toBe(3);
  });
});

describe('formatDate', () => {
  it('格式化为 YYYY-MM-DD', () => {
    expect(formatDate(new Date(2026, 5, 10))).toBe('2026-06-10');
  });
});
