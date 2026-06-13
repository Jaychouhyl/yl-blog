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
