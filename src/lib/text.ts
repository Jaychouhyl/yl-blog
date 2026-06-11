export function countWords(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')   // 围栏代码块整块剥除
    .replace(/`[^`\n]+`/g, ' ')        // 行内代码剥除
    .replace(/<[^>]+>/g, ' ')          // HTML 标签剥除
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`~|_-]/g, ' ');
  // 基本汉字区 U+4E00-U+9FFF，覆盖现代中文写作；生僻扩展区按词处理可接受
  const cjk = (plain.match(/[一-鿿]/g) ?? []).length;
  const latinWords = (plain.replace(/[一-鿿]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return cjk + latinWords;
}

/** 中文约 400 字/分钟，四舍五入，最低 1 分钟 */
export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / 400));
}

export function formatDate(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}-${day}`;
}
