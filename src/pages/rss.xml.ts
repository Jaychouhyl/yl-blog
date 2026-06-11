import rss from '@astrojs/rss';
import { marked } from 'marked';
import type { APIContext } from 'astro';
import { SITE, withBase } from '../config';
import { publishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await publishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: new URL(withBase('/'), context.site!),
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary ?? '',
        link: withBase(`/posts/${post.id}/`),
        content: String(await marked.parse(post.body ?? '')),
      }))
    ),
  });
}
