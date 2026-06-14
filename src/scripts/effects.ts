const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  interface Feather {
    x: number; y: number; size: number; vx: number; vy: number;
    rot: number; vr: number; swing: number; swingSpeed: number;
    life: number; // life<0 表示常驻飘落
  }
  const feathers: Feather[] = [];
  const MAX_AMBIENT = 5; // 克制密度，符合专业基调

  // 羽毛颜色取自 --feather，随主题（亮/暗）切换刷新
  function readFeather() {
    return getComputedStyle(document.documentElement).getPropertyValue('--feather').trim()
      || 'rgba(48,44,39,0.42)';
  }
  let feather = readFeather();
  new MutationObserver(() => { feather = readFeather(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });

  function resize() {
    const dpr = devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function spawnAmbient(): Feather {
    return {
      x: Math.random() * innerWidth, y: -24,
      size: 6 + Math.random() * 5,
      vx: -0.3 - Math.random() * 0.4, vy: 0.4 + Math.random() * 0.5,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.03,
      swing: Math.random() * Math.PI * 2, swingSpeed: 0.015 + Math.random() * 0.02,
      life: -1,
    };
  }

  // 画一片羽毛：沿 y 轴的柳叶形 + 中脉
  function drawFeather(len: number) {
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.quadraticCurveTo(len * 0.55, 0, 0, len);
    ctx.quadraticCurveTo(-len * 0.55, 0, 0, -len);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = Math.max(0.5, len * 0.07);
    ctx.moveTo(0, -len);
    ctx.lineTo(0, len * 0.88);
    ctx.stroke();
  }

  document.addEventListener('click', (e) => {
    if (e.detail === 0) return; // 键盘合成 click 无有效坐标
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      feathers.push({
        x: e.clientX, y: e.clientY, size: 5 + Math.random() * 4,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.18,
        swing: Math.random() * Math.PI * 2, swingSpeed: 0.03 + Math.random() * 0.03,
        life: 70,
      });
    }
  });

  let rafId = 0;

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const ambient = feathers.filter((f) => f.life < 0).length;
    if (ambient < MAX_AMBIENT && Math.random() < 0.02) feathers.push(spawnAmbient());

    ctx.fillStyle = feather;
    ctx.strokeStyle = feather;
    for (let i = feathers.length - 1; i >= 0; i--) {
      const f = feathers[i]!;
      f.x += f.vx; f.y += f.vy; f.rot += f.vr; f.swing += f.swingSpeed;
      if (f.life > 0) { f.life--; f.vy += 0.03; }
      const drawX = f.x + Math.sin(f.swing) * 6; // 水平摆动，更像羽毛飘
      if ((f.life === 0) || f.y > innerHeight + 30 || f.x < -40) { feathers.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(drawX, f.y);
      ctx.rotate(f.rot + Math.sin(f.swing) * 0.3);
      ctx.globalAlpha = f.life > 0 ? Math.min(1, f.life / 35) : 1;
      drawFeather(f.size);
      ctx.restore();
    }
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      cancelAnimationFrame(rafId); // 防竞态双循环
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
}
