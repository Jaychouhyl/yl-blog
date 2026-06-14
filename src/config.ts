export const SITE = {
  name: '忆霖',
  motto: '字句之间，自有天地。',
  description: '忆霖的个人博客 —— 随笔、项目与生活',
  announcement: '欢迎来到忆霖的小站。这里记录随笔、项目和一些喜欢的生活片段。',
  startDate: '2026-06-10',
  github: 'https://github.com/Jaychouhyl',
  nav: [
    { label: '主页', href: '/' },
    { label: '随笔', href: '/posts/' },
    { label: '分类', href: '/categories/' },
    { label: '图谱', href: '/graph/' },
    { label: '项目', href: '/projects/' },
    { label: '相册', href: '/albums/' },
    { label: '友链', href: '/friends/' },
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
