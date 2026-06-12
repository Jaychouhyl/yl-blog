const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  interface Petal {
    x: number; y: number; size: number; vx: number; vy: number;
    rot: number; vr: number; life: number; // life<0 表示常驻飘落瓣
  }
  const petals: Petal[] = [];
  const MAX_AMBIENT = 6; // 参考站常驻 5 片的克制密度

  // 1. 缓存 --sakura 颜色，主题切换时通过 MutationObserver 刷新
  function readSakura() {
    return getComputedStyle(document.documentElement).getPropertyValue('--sakura').trim() || '#f08aa0';
  }
  let sakura = readSakura();
  new MutationObserver(() => { sakura = readSakura(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 3. devicePixelRatio 适配
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

  function spawnAmbient(): Petal {
    return {
      x: Math.random() * innerWidth, y: -20,
      size: 5 + Math.random() * 6,
      vx: -0.4 - Math.random() * 0.6, vy: 0.7 + Math.random() * 0.9,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.04,
      life: -1,
    };
  }

  document.addEventListener('click', (e) => {
    if (e.detail === 0) return; // 键盘触发的合成 click 无有效坐标
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      petals.push({
        x: e.clientX, y: e.clientY, size: 4 + Math.random() * 4,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2,
        life: 60,
      });
    }
  });

  let rafId = 0;

  function tick() {
    // 使用逻辑坐标（CSS 像素）清除画布
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const ambient = petals.filter((p) => p.life < 0).length;
    if (ambient < MAX_AMBIENT && Math.random() < 0.02) petals.push(spawnAmbient());

    // 1. 使用缓存的 sakura 变量，不再每帧读取 getComputedStyle
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i]!;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.life > 0) { p.life--; p.vy += 0.04; }
      // 3. 出界判断改用逻辑坐标（CSS 像素）
      if ((p.life === 0) || p.y > innerHeight + 30 || p.x < -30) { petals.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life > 0 ? Math.min(1, p.life / 30) : 0.7;
      ctx.fillStyle = sakura;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
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
