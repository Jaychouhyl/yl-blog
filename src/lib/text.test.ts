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
  it('行内代码与 HTML 标签不计入', () => {
    // 点击(2字)+按钮(2字)+继续(2字)=6字，`买入信号` 在行内代码里不计，<br> 标签剥掉不计
    expect(countWords('点击 `买入信号` 按钮<br>继续')).toBe(6);
  });
  it('空字符串为 0', () => {
    expect(countWords('')).toBe(0);
  });
});

describe('readingMinutes', () => {
  it('四舍五入，最低 1 分钟', () => {
    expect(readingMinutes('短')).toBe(1);
    expect(readingMinutes('字'.repeat(1200))).toBe(3);
  });
});

describe('formatDate', () => {
  it('UTC 日期格式化为 YYYY-MM-DD（不受本地时区影响）', () => {
    expect(formatDate(new Date(Date.UTC(2026, 5, 10)))).toBe('2026-06-10');
  });
});
