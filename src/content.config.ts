import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

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
      repo: z.string().url().optional(),
      tech: z.array(z.string()).default([]),
      cover: image().optional(),
      order: z.number().default(99),
    }),
});

const albums = defineCollection({
  loader: file('./src/content/albums/albums.yaml', { parser: (t) => parseYaml(t) }),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.coerce.date(),
      images: z.array(z.object({ src: image(), alt: z.string().default('') })),
    }),
});

const friends = defineCollection({
  loader: file('./src/content/friends/friends.yaml', { parser: (t) => parseYaml(t) }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    desc: z.string().default(''),
    avatar: z.string().url().optional(),
  }),
});

export const collections = { posts, projects, albums, friends };
