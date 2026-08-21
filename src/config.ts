export const SITE = {
  name: '忆霖',
  description: '忆霖的个人站 —— 写作、项目与长期复盘',
  announcement: '这里整理长期写作、项目复盘和学习记录。内容会持续更新，优先保留能说明思考过程的材料。',
  startDate: '2026-06-10',
  github: 'https://github.com/Jaychouhyl',
  email: 'hyl92186009@gmail.com',
  nav: [
    { label: '首页', href: '/' },
    { label: '时间轴', href: '/posts/' },
    { label: '标签', href: '/tags/' },
    { label: '分类', href: '/categories/' },
    { label: '关于', href: '/about/' },
  ],
  // 首屏全屏插画：把图片放到 public/ 后追加到数组即可（如 '/hero-2.jpg'）
  heroImages: ['/hero.webp'],
  // 看板娘点击时随机弹出的气泡文案
  mascotMessages: [
    '飛べ。',
    '还在发呆？给我去写。',
    '想变强，就再练一遍。',
    '这种程度，还差得远。',
    '别停下，你能做得更好。',
  ],
  giscus: {
    repo: 'Jaychouhyl/yl-blog',
    repoId: 'R_kgDOS2WxiQ',
    category: 'Announcements',
    categoryId: 'DIC_kwDOS2Wxic4C_AuJ',
  },
};

const rawBase = import.meta.env.BASE_URL;
/** 给站内路径加 base 前缀：withBase('/posts/') => '/yl-blog/posts/' */
export function withBase(path: string): string {
  const normalPath = path.startsWith('/') ? path : '/' + path;
  return (rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase) + normalPath;
}
