import rss from '@astrojs/rss';
import { marked, Renderer } from 'marked';
import type { APIContext } from 'astro';
import { SITE, withBase } from '../config';
import { publishedPosts } from '../lib/posts';

const rssRenderer = new Renderer();
rssRenderer.html = () => '';

export async function GET(context: APIContext) {
  const posts = await publishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: new URL(withBase('/'), context.site!),
    customData: '<language>zh-CN</language>',
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary ?? '',
        link: withBase(`/posts/${post.id}/`),
        // RSS 用 marked 渲染纯 Markdown，并丢弃原始 HTML。
        content: await marked.parse(post.body ?? '', { renderer: rssRenderer }),
      }))
    ),
  });
}
