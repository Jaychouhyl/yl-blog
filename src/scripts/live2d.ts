const KEY = 'live2d';

async function initLive2d() {
  if (innerWidth <= 768) return; // 移动端不加载
  if (localStorage.getItem(KEY) === 'off') return;
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
    // 模型或脚本加载失败时静默跳过，不影响页面其他部分
  }
}

document.getElementById('live2d-toggle')?.addEventListener('click', () => {
  const off = localStorage.getItem(KEY) === 'off';
  localStorage.setItem(KEY, off ? 'on' : 'off');
  location.reload();
});

initLive2d();
