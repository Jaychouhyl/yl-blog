const KEY = 'live2d';

async function initLive2d() {
  if (innerWidth <= 768) return; // 移动端不加载；与 base.css/Nav 的 768px 响应断点保持一致
  if (localStorage.getItem(KEY) !== 'on') return; // 默认关闭：WebGL 持续渲染是低配设备卡顿主因，参考站同样禁用动画看板娘
  try {
    const { loadOml2d } = await import('oh-my-live2d');
    loadOml2d({
      dockedPosition: 'right',
      mobileDisplay: false,
      statusBar: { disable: false },
      menus: { disable: true },
      models: [
        {
          path: 'https://model.oml2d.com/Senko_Normals/senko.model3.json',
          scale: 0.12,
          stageStyle: { height: 250 },
        },
      ],
      tips: {
        welcomeTips: {
          message: {
            daybreak: '欢迎回来呀～今天读点什么？',
            morning: '欢迎回来呀～今天读点什么？',
            noon: '欢迎回来呀～今天读点什么？',
            afternoon: '欢迎回来呀～今天读点什么？',
            dusk: '欢迎回来呀～今天读点什么？',
            night: '夜深了，注意休息哦',
            lateNight: '夜深了，注意休息哦',
            weeHours: '夜深了，注意休息哦',
          },
        },
      },
    });
  } catch {
    // 脚本拉取失败时静默跳过；模型 CDN 404 属 oml2d 内部异步行为，仅表现为看板娘不显示，不影响页面
  }
}

document.getElementById('live2d-toggle')?.addEventListener('click', () => {
  const on = localStorage.getItem(KEY) === 'on';
  localStorage.setItem(KEY, on ? 'off' : 'on');
  location.reload();
});

const run = () => { void initLive2d(); };
if ('requestIdleCallback' in window) {
  requestIdleCallback(run, { timeout: 3000 });
} else {
  setTimeout(run, 200);
}
