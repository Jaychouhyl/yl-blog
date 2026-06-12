export const SITE = {
  name: '忆霖',
  motto: '字句之间，自有天地。',
  description: '忆霖的个人博客 —— 随笔、项目与生活',
  startDate: '2026-06-10',
  github: 'https://github.com/Jaychouhyl',
  nav: [
    { label: '主页', href: '/' },
    { label: '随笔', href: '/posts/' },
    { label: '项目', href: '/projects/' },
    { label: '相册', href: '/albums/' },
    { label: '友链', href: '/friends/' },
    { label: '关于', href: '/about/' },
  ],
  // 首屏全屏插画：把图片放到 public/ 后改这里的文件名即可（如 '/hero.jpg'）
  heroImage: '/hero-default.svg',
  // repoId / categoryId 留空时评论区显示「尚未开通」提示；
  // 站主在 https://giscus.app 开通后回填即可生效
  giscus: {
    repo: 'Jaychouhyl/yl-blog',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
};

const rawBase = import.meta.env.BASE_URL;
/** 给站内路径加 base 前缀：withBase('/posts/') => '/yl-blog/posts/' */
export function withBase(path: string): string {
  const normalPath = path.startsWith('/') ? path : '/' + path;
  return (rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase) + normalPath;
}
