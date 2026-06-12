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
  const MAX_AMBIENT = 12; // 克制的密度

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  addEventListener('resize', resize);

  function spawnAmbient(): Petal {
    return {
      x: Math.random() * canvas.width, y: -20,
      size: 5 + Math.random() * 6,
      vx: -0.4 - Math.random() * 0.6, vy: 0.7 + Math.random() * 0.9,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.04,
      life: -1,
    };
  }

  document.addEventListener('click', (e) => {
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

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ambient = petals.filter((p) => p.life < 0).length;
    if (ambient < MAX_AMBIENT && Math.random() < 0.03) petals.push(spawnAmbient());

    const sakura = getComputedStyle(document.documentElement).getPropertyValue('--sakura').trim() || '#f08aa0';
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i]!;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.life > 0) { p.life--; p.vy += 0.04; }
      if ((p.life === 0) || p.y > canvas.height + 30 || p.x < -30) { petals.splice(i, 1); continue; }
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
    requestAnimationFrame(tick);
  }
  tick();
}
