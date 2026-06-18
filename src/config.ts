export const SITE = {
  name: '忆霖',
  description: '忆霖的个人站 —— 写作、项目与长期复盘',
  announcement: '这里整理长期写作、项目复盘和学习记录。内容会持续更新，优先保留能说明思考过程的材料。',
  startDate: '2026-06-10',
  github: 'https://github.com/Jaychouhyl',
  resumeUrl: '',
  nav: [
    { label: '主页', href: '/' },
    { label: '文章', href: '/posts/' },
    { label: '项目', href: '/projects/' },
    { label: '关于', href: '/about/' },
  ],
  // 首屏全屏插画：把图片放到 public/ 后追加到数组即可（如 '/hero-2.jpg'）
  heroImages: ['/hero.webp'],
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
