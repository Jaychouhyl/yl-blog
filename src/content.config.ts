import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

const webUrl = z.url().refine((value) => {
  const { protocol } = new URL(value);
  return protocol === 'https:' || protocol === 'http:';
}, 'Only http(s) URLs are allowed');

const posts = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/posts',
    // entry 由 tinyglobby 生成，始终是 posix 路径（如 hello-world/index.md）
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      category: z.string().optional(),
      series: z.string().optional(),
      seriesOrder: z.number().optional(),
      summary: z.string().optional(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      repo: webUrl.optional(),
      demo: webUrl.optional(),
      status: z.string().default('整理中'),
      summary: z.string().optional(),
      role: z.string().optional(),
      period: z.string().optional(),
      featured: z.boolean().default(false),
      audience: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      cover: image().optional(),
      order: z.number().default(99),
    }),
});

const albums = defineCollection({
  loader: file('./src/content/albums/albums.yaml'),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.coerce.date(),
      images: z.array(z.object({ src: image(), alt: z.string().default('') })),
    }),
});

const friends = defineCollection({
  loader: file('./src/content/friends/friends.yaml'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    url: webUrl,
    desc: z.string().default(''),
    avatar: webUrl.optional(),
  }),
});

export const collections = { posts, projects, albums, friends };
