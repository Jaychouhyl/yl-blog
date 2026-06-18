import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function publishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const map = new Map<number, Post[]>();
  for (const p of posts) {
    const y = p.data.date.getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export function allTags(posts: Post[]): [string, Post[]][] {
  const map = new Map<string, Post[]>();
  for (const p of posts) for (const t of p.data.tags) {
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh'));
}

export function allCategories(posts: Post[]): [string, Post[]][] {
  const map = new Map<string, Post[]>();
  for (const p of posts) {
    if (!p.data.category) continue;
    if (!map.has(p.data.category)) map.set(p.data.category, []);
    map.get(p.data.category)!.push(p);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh'));
}

export function sortSeriesPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ao = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    return ao - bo || a.data.date.valueOf() - b.data.date.valueOf() || a.data.title.localeCompare(b.data.title, 'zh');
  });
}

export function allSeries(posts: Post[]): [string, Post[]][] {
  const map = new Map<string, Post[]>();
  for (const p of posts) {
    if (!p.data.series) continue;
    if (!map.has(p.data.series)) map.set(p.data.series, []);
    map.get(p.data.series)!.push(p);
  }
  return [...map.entries()]
    .map(([series, list]) => [series, sortSeriesPosts(list)] as [string, Post[]])
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh'));
}
