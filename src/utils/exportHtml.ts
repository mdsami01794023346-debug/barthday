import { getFontFamilyCss, SceneConfig } from '../types/scene';

/**
 * Generates a self-contained single-file HTML gift containing the dense
 * 60fps sprite-cached romantic neon canvas with repeated texts, glowing hearts,
 * rose petals, and red embers.
 */
export function downloadStandaloneGiftHtml(config: SceneConfig): void {
  const safeTitle = (config.messages[0] || 'Starlight Wishes').replace(/[<>&"']/g, '');
  const serializedConfig = JSON.stringify({
    messages: config.messages.filter((m) => m.trim().length > 0),
    direction: config.direction,
    textColor: config.textColor,
    glowColor: config.glowColor,
    glowStrength: config.glowStrength,
    fontFamily: getFontFamilyCss(config.fontPreset),
    fontPreset: config.fontPreset,
    particleTheme: config.particleTheme,
    doodleStyle: config.doodleStyle,
    musicPreset: config.musicPreset || 'birthday',
    speed: config.speed,
    density: config.density,
    tiltAngle: config.tiltAngle,
    textScale: config.textScale,
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Dancing+Script:wght@600;700&family=Hind+Siliguri:wght@300;400;600&family=Mali:wght@300;400;500&family=Outfit:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;600&family=Quicksand:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; color: #fff; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; }
    canvas { position: fixed; inset: 0; width: 100%; height: 100%; touch-action: none; display: block; }
    #soundBtn {
      position: fixed; bottom: 16px; right: 16px; z-index: 20;
      padding: 8px 14px; border-radius: 999px;
      background: rgba(15, 15, 20, 0.72); backdrop-filter: blur(8px);
      border: 1px solid rgba(244, 114, 182, 0.35); color: #fecdd3;
      font-size: 12px; font-weight: 600; cursor: pointer;
    }
    #introCountdown {
      position: fixed; inset: 0; z-index: 30;
      display: flex; flex-direction: column; gap: 22px; align-items: center; justify-content: center;
      background: #000; pointer-events: none;
    }
    #introNum {
      font-family: 'Mali', 'Outfit', sans-serif;
      font-size: 72px; font-weight: 600; color: #fff;
      text-shadow: 0 0 18px #fff, 0 0 38px #e879f9, 0 0 68px #f472b6;
      transition: transform 0.35s ease, opacity 0.35s ease;
    }
    #introHint {
      padding: 6px 14px; border-radius: 999px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(244,114,182,0.3);
      color: rgba(254,205,211,0.88); font-size: 12px; font-weight: 500;
    }
  </style>
</head>
<body>
  <canvas id="scene"></canvas>
  <div id="introCountdown"><span id="introNum">3</span><span id="introHint">Tap anywhere for timer &amp; music sound ♪</span></div>
  <button id="soundBtn" type="button">Sound: Tap ♪</button>
  <script>
    const CFG = ${serializedConfig};
    const canvas = document.getElementById('scene');
    const ctx = canvas.getContext('2d');
    const safeMessages = CFG.messages.length ? CFG.messages : ['Happy birth day'];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    function easeOutCubic(t) {
      const c = Math.max(0, Math.min(1, t));
      return 1 - Math.pow(1 - c, 3);
    }

    function drawHeart(c2d, size) {
      const s = size;
      c2d.beginPath();
      c2d.moveTo(0, s * 0.35);
      c2d.bezierCurveTo(-s * 0.05, -s * 0.1, -s * 0.95, -s * 0.18, -s * 0.95, s * 0.32);
      c2d.bezierCurveTo(-s * 0.95, s * 0.78, -s * 0.25, s * 1.05, 0, s * 1.32);
      c2d.bezierCurveTo(s * 0.25, s * 1.05, s * 0.95, s * 0.78, s * 0.95, s * 0.32);
      c2d.bezierCurveTo(s * 0.95, -s * 0.18, s * 0.05, -s * 0.1, 0, s * 0.35);
      c2d.closePath();
    }

    function drawPetal(c2d, size) {
      const s = size;
      c2d.beginPath();
      c2d.moveTo(0, -s * 0.9);
      c2d.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.95, s * 0.45, 0, s * 0.95);
      c2d.bezierCurveTo(-s * 0.65, s * 0.6, -s * 0.75, -s * 0.35, 0, -s * 0.9);
      c2d.closePath();
    }

    function drawStar(c2d, size) {
      const outer = size, inner = size * 0.28;
      c2d.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 4;
        if (i === 0) c2d.moveTo(Math.cos(a)*r, Math.sin(a)*r);
        else c2d.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
      c2d.closePath();
    }

    function strokeHeartOutline(c2d, cx, cy, s) {
      c2d.beginPath();
      c2d.moveTo(cx, cy - s * 0.15);
      c2d.bezierCurveTo(cx - s * 0.08, cy - s * 0.55, cx - s * 0.72, cy - s * 0.55, cx - s * 0.72, cy - s * 0.08);
      c2d.bezierCurveTo(cx - s * 0.72, cy + s * 0.35, cx - s * 0.2, cy + s * 0.58, cx, cy + s * 0.75);
      c2d.bezierCurveTo(cx + s * 0.2, cy + s * 0.58, cx + s * 0.72, cy + s * 0.35, cx + s * 0.72, cy - s * 0.08);
      c2d.bezierCurveTo(cx + s * 0.72, cy - s * 0.55, cx + s * 0.08, cy - s * 0.55, cx, cy - s * 0.15);
      c2d.closePath();
      c2d.stroke();
    }

    function drawDoodles(c2d, style, startX, fontSize) {
      const s = fontSize * 0.44;
      c2d.lineWidth = Math.max(1.2, fontSize * 0.052);
      c2d.lineCap = 'round';
      c2d.lineJoin = 'round';
      if (style === 'love-doodles') {
        const x1 = startX + s * 1.1;
        c2d.beginPath(); c2d.arc(x1 - s * 0.36, -s * 0.12, s * 0.55, Math.PI * 0.75, Math.PI * 1.95); c2d.stroke();
        c2d.beginPath(); c2d.arc(x1 + s * 0.36, -s * 0.12, s * 0.55, Math.PI * 1.05, Math.PI * 0.25); c2d.stroke();
        strokeHeartOutline(c2d, x1, s * 0.06, s * 0.56);
        const x2 = x1 + s * 1.85;
        strokeHeartOutline(c2d, x2, 0, s * 0.85);
        c2d.beginPath();
        c2d.moveTo(x2 - s * 0.28, -s * 0.3); c2d.lineTo(x2 - s * 0.28, s * 0.38);
        c2d.moveTo(x2, -s * 0.2); c2d.lineTo(x2, s * 0.55);
        c2d.moveTo(x2 + s * 0.28, -s * 0.3); c2d.lineTo(x2 + s * 0.28, s * 0.38);
        c2d.stroke();
        const x3 = x2 + s * 1.85;
        c2d.save(); c2d.translate(x3, 0); c2d.rotate(-0.65);
        const bw = s * 1.25, bh = s * 0.52;
        c2d.beginPath(); c2d.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2); c2d.stroke();
        c2d.beginPath(); c2d.moveTo(-bw * 0.18, -bh / 2); c2d.lineTo(-bw * 0.18, bh / 2);
        c2d.moveTo(bw * 0.18, -bh / 2); c2d.lineTo(bw * 0.18, bh / 2); c2d.stroke();
        c2d.restore();
      } else if (style === 'birthday-doodles') {
        const x1 = startX + s * 1.05;
        c2d.beginPath(); c2d.roundRect(x1 - s * 0.65, -s * 0.15, s * 1.3, s * 0.72, s * 0.14);
        c2d.moveTo(x1 - s * 0.65, s * 0.12); c2d.quadraticCurveTo(x1 - s * 0.32, s * 0.28, x1, s * 0.12);
        c2d.quadraticCurveTo(x1 + s * 0.32, s * 0.28, x1 + s * 0.65, s * 0.12);
        c2d.moveTo(x1, -s * 0.15); c2d.lineTo(x1, -s * 0.5); c2d.stroke();
        c2d.beginPath(); c2d.arc(x1, -s * 0.68, s * 0.12, 0, Math.PI * 2); c2d.stroke();
        const x2 = x1 + s * 1.85;
        c2d.beginPath(); c2d.moveTo(x2 - s * 0.6, s * 0.4); c2d.lineTo(x2 - s * 0.7, -s * 0.32);
        c2d.lineTo(x2 - s * 0.25, s * 0.05); c2d.lineTo(x2, -s * 0.45);
        c2d.lineTo(x2 + s * 0.25, s * 0.05); c2d.lineTo(x2 + s * 0.7, -s * 0.32);
        c2d.lineTo(x2 + s * 0.6, s * 0.4); c2d.closePath(); c2d.stroke();
        const x3 = x2 + s * 1.55;
        c2d.save(); c2d.translate(x3, 0); drawStar(c2d, s * 0.65); c2d.stroke(); c2d.restore();
      } else if (style === 'ribbon-skull') {
        const x1 = startX + s * 1.1;
        c2d.beginPath(); c2d.moveTo(x1, 0);
        c2d.bezierCurveTo(x1 - s * 0.85, -s * 0.65, x1 - s * 0.85, s * 0.45, x1, 0);
        c2d.bezierCurveTo(x1 + s * 0.85, -s * 0.65, x1 + s * 0.85, s * 0.45, x1, 0);
        c2d.moveTo(x1 - s * 0.1, s * 0.08); c2d.lineTo(x1 - s * 0.42, s * 0.65);
        c2d.moveTo(x1 + s * 0.1, s * 0.08); c2d.lineTo(x1 + s * 0.42, s * 0.65); c2d.stroke();
        const x2 = x1 + s * 1.75;
        c2d.beginPath(); c2d.arc(x2, -s * 0.12, s * 0.52, Math.PI * 0.82, Math.PI * 0.18);
        c2d.lineTo(x2 + s * 0.28, s * 0.52); c2d.lineTo(x2 - s * 0.28, s * 0.52); c2d.closePath(); c2d.stroke();
        c2d.beginPath(); c2d.arc(x2 - s * 0.18, -s * 0.12, s * 0.1, 0, Math.PI * 2);
        c2d.arc(x2 + s * 0.18, -s * 0.12, s * 0.1, 0, Math.PI * 2); c2d.stroke();
        strokeHeartOutline(c2d, x2 + s * 1.55, 0, s * 0.72);
      }
    }

    let textSprites = [];
    function buildSprites() {
      const fw = CFG.fontPreset === 'serif' ? 500 : 400;
      const fs = 52, pad = 42;
      textSprites = safeMessages.map(msg => {
        const mc = document.createElement('canvas').getContext('2d');
        mc.font = fw + ' ' + fs + 'px ' + CFG.fontFamily;
        const tw = Math.max(20, mc.measureText(msg).width);
        const hasD = CFG.doodleStyle && CFG.doodleStyle !== 'none';
        const dw = hasD ? fs * 2.85 : 0;
        const w = Math.ceil(tw + dw + pad * 2);
        const h = Math.ceil(fs * 1.9 + pad * 2);
        const sc = document.createElement('canvas');
        sc.width = w; sc.height = h;
        const c2d = sc.getContext('2d');
        c2d.font = fw + ' ' + fs + 'px ' + CFG.fontFamily;
        c2d.textAlign = 'left'; c2d.textBaseline = 'middle';
        const cy = h / 2;
        if (CFG.glowStrength > 0.05) {
          c2d.shadowColor = CFG.glowColor; c2d.shadowBlur = 32 * CFG.glowStrength;
          c2d.fillStyle = CFG.glowColor; c2d.globalAlpha = 0.78;
          c2d.fillText(msg, pad, cy);
          c2d.shadowColor = '#f472b6'; c2d.shadowBlur = 14 * CFG.glowStrength;
          c2d.fillStyle = CFG.textColor; c2d.globalAlpha = 0.9;
          c2d.fillText(msg, pad, cy);
        }
        c2d.shadowColor = CFG.glowColor; c2d.shadowBlur = 4 * CFG.glowStrength;
        c2d.fillStyle = CFG.textColor; c2d.globalAlpha = 1;
        c2d.fillText(msg, pad, cy);
        if (CFG.glowStrength > 0.05) {
          c2d.shadowBlur = 0;
          c2d.fillStyle = '#ffffff'; c2d.globalAlpha = 0.55;
          c2d.fillText(msg, pad, cy);
          c2d.globalAlpha = 1;
        }
        if (hasD) {
          c2d.save(); c2d.translate(0, cy);
          c2d.strokeStyle = CFG.textColor; c2d.shadowColor = CFG.glowColor;
          c2d.shadowBlur = 20 * CFG.glowStrength;
          drawDoodles(c2d, CFG.doodleStyle, pad + tw + fs * 0.28, fs);
          c2d.restore();
        }
        return { canvas: sc, width: w, height: h, fs };
      });
    }
    buildSprites();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildSprites);

    const heartSprite = (() => {
      const c = document.createElement('canvas'); c.width = 96; c.height = 96;
      const g = c.getContext('2d'); g.translate(48, 33);
      const pk = CFG.particleTheme === 'pink-hearts';
      g.shadowColor = pk ? '#ff70b8' : '#ff3828'; g.shadowBlur = 22;
      g.fillStyle = pk ? '#ff3d8b' : '#ff2218';
      drawHeart(g, 24); g.fill();
      return c;
    })();

    const petalSprite = (() => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64;
      const g = c.getContext('2d'); g.translate(32, 32);
      g.shadowColor = '#ff1f3d'; g.shadowBlur = 14;
      const gr = g.createLinearGradient(0, -16, 0, 16);
      gr.addColorStop(0, '#ff334b'); gr.addColorStop(1, '#99001a');
      g.fillStyle = gr; drawPetal(g, 15); g.fill();
      return c;
    })();

    const emberSprite = (() => {
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(16, 16, 1, 16, 16, 14);
      gr.addColorStop(0, 'rgba(255,90,110,1)');
      gr.addColorStop(0.35, 'rgba(255,30,50,0.7)');
      gr.addColorStop(1, 'rgba(255,0,30,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
      return c;
    })();

    const spanX0 = Math.max(width * 0.72, 340);
    const spanY0 = Math.max(height * 0.62, 420);
    const cols = Math.max(4, Math.round(Math.sqrt(CFG.density * (width / Math.max(360, height)))));
    const rows = Math.max(8, Math.ceil(CFG.density / cols));
    const nodes = Array.from({ length: CFG.density }, (_, i) => {
      const gc = i % cols, gr = Math.floor(i / cols) % rows;
      const tr = i % 15;
      let tier = 'mid', z = -140 + Math.random() * 195, bfs = 15 + Math.random() * 5, sf = 0.88 + Math.random() * 0.32;
      if (tr === 0 || tr === 2 || tr === 5 || tr === 8 || tr === 11 || tr === 13) {
        tier = 'far'; z = -360 + Math.random() * 190; bfs = 10.5 + Math.random() * 3.5; sf = 0.58 + Math.random() * 0.25;
      } else if (tr === 4 || tr === 12 || tr === 14) {
        tier = 'near'; z = 105 + Math.random() * 80; bfs = 25 + Math.random() * 7; sf = 1.38 + Math.random() * 0.30;
      }
      const cw = (spanX0 * 2.15) / cols, ch = (spanY0 * 1.9) / rows;
      return {
        mi: i % safeMessages.length,
        x: -spanX0 * 1.075 + (gc + 0.5) * cw + (Math.random() - 0.5) * cw * 1.25,
        y: -spanY0 * 0.95 + (gr + 0.5) * ch + (Math.random() - 0.5) * ch * 1.25,
        z, bfs, sf, tier,
        dvx: (Math.random() - 0.5) * 26, dvy: (Math.random() - 0.5) * 22,
        bp: Math.random() * Math.PI * 2, ba: 4 + Math.random() * 10,
        fp: Math.random() * Math.PI * 2, fs: 0.45 + Math.random() * 0.65,
        roll: (Math.random() - 0.5) * 0.14, delay: Math.random() * 0.45
      };
    });

    const stars = Array.from({ length: 150 }, () => ({
      x: (Math.random() - 0.5) * 1800, y: (Math.random() - 0.5) * 1400, z: -500 + Math.random() * 700,
      size: 0.6 + Math.random() * 1.4, a: 0.2 + Math.random() * 0.55, ts: 1 + Math.random() * 2.2, tp: Math.random() * Math.PI * 2
    }));

    const parts = [
      ...Array.from({ length: 95 }, (_, i) => ({
        x: (Math.random() - 0.5) * spanX0 * 2.2, y: (Math.random() - 0.5) * spanY0 * 2.2, z: -340 + Math.random() * 500,
        size: 7 + Math.random() * 16, vy: i % 3 === 0 ? 18 + Math.random() * 34 : -(24 + Math.random() * 44),
        vx: -14 - Math.random() * 22, sp: Math.random() * Math.PI * 2, sa: 10 + Math.random() * 22,
        spp: Math.random() * Math.PI * 2, sps: 0.9 + Math.random() * 1.8, tilt: (Math.random() - 0.5) * 0.55,
        kind: ['heart', 'heart', 'ribbon', 'skull'][i % 4], a: 0.62 + Math.random() * 0.38
      })),
      ...Array.from({ length: 80 }, (_, i) => ({
        x: (Math.random() - 0.5) * spanX0 * 2.2, y: (Math.random() - 0.5) * spanY0 * 2.2, z: -320 + Math.random() * 480,
        size: i < 45 ? 7 + Math.random() * 9 : 3 + Math.random() * 4.5,
        vy: i < 45 ? 22 + Math.random() * 36 : -(16 + Math.random() * 28),
        vx: i < 45 ? -22 - Math.random() * 26 : (Math.random() - 0.5) * 28,
        sp: Math.random() * Math.PI * 2, sa: i < 45 ? 18 + Math.random() * 24 : 8 + Math.random() * 14,
        spp: Math.random() * Math.PI * 2, sps: i < 45 ? 1.4 + Math.random() * 2 : 0.6,
        tilt: Math.random() * Math.PI * 2, kind: i < 45 ? 'petal' : 'ember', a: i < 45 ? 0.68 + Math.random() * 0.32 : 0.55 + Math.random() * 0.45
      }))
    ];

    let introStart = performance.now(), lastTime = performance.now(), started = false, curStep = 3;
    const introBox = document.getElementById('introCountdown');
    const introNum = document.getElementById('introNum');
    const introHint = document.getElementById('introHint');
    setTimeout(() => { curStep = 2; introNum.textContent = '2'; playCue(2); }, 900);
    setTimeout(() => { curStep = 1; introNum.textContent = '1'; playCue(1); }, 1800);
    setTimeout(() => {
      curStep = 0;
      started = true;
      introStart = performance.now();
      introBox.style.display = 'none';
      playCue(0);
      if (soundUnlocked && !userMuted && !sOn) startSound();
    }, 2650);

    let pState = { dragging: false, sx: 0, sy: 0, ty: 0, tp: 0, cy: 0, cp: 0 };
    canvas.addEventListener('pointerdown', e => { pState.dragging = true; pState.sx = e.clientX; pState.sy = e.clientY; });
    canvas.addEventListener('pointermove', e => {
      if (pState.dragging) {
        pState.ty = Math.max(-0.55, Math.min(0.55, pState.ty + (e.clientX - pState.sx) * 0.003));
        pState.tp = Math.max(-0.35, Math.min(0.35, pState.tp + (e.clientY - pState.sy) * 0.003));
        pState.sx = e.clientX; pState.sy = e.clientY;
      }
    });
    window.addEventListener('pointerup', () => { pState.dragging = false; });

    function loop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!started) {
        ctx.save(); ctx.scale(dpr, dpr);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
        ctx.restore();
        requestAnimationFrame(loop);
        return;
      }
      const elapsed = (now - introStart) / 1000, sec = now / 1000;
      pState.cy += (pState.ty - pState.cy) * Math.min(1, dt * 6);
      pState.cp += (pState.tp - pState.cp) * Math.min(1, dt * 6);

      const tr = (CFG.tiltAngle * Math.PI) / 180;
      const yaw = tr * 0.65 + Math.sin(sec * 0.32) * (tr * 0.25) + pState.cy;
      const pitch = -tr * 0.28 + Math.cos(sec * 0.25) * (tr * 0.16) + pState.cp;
      const roll = -tr * 0.22;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw), cosX = Math.cos(pitch), sinX = Math.sin(pitch);
      const fov = Math.max(540, Math.min(width, height) * 0.92);
      const spanX = Math.max(width * 0.82, 420), spanY = Math.max(height * 0.72, 460);
      const mf = width < 640 ? 0.82 : 0.98;

      ctx.save(); ctx.scale(dpr, dpr);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);

      function proj(x, y, z) {
        const x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
        const depth = fov - z2;
        if (depth < 80) return null;
        const s = fov / depth;
        return { sx: width * 0.5 + x1 * s, sy: height * 0.5 + y2 * s, pz: z2, s };
      }

      const si = easeOutCubic(elapsed / 0.35);
      for (const st of stars) {
        st.x -= 12 * CFG.speed * dt;
        if (st.x < -900) st.x = 900;
        const p = proj(st.x, st.y, st.z);
        if (!p || p.sx < -10 || p.sx > width + 10 || p.sy < -10 || p.sy > height + 10) continue;
        const a = st.a * (0.55 + 0.45 * Math.sin(sec * st.ts + st.tp)) * si;
        ctx.fillStyle = 'rgba(255,240,250,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(0.45, st.size * p.s * 0.65), 0, Math.PI * 2); ctx.fill();
      }

      const list = [], vel = 220 * CFG.speed;
      for (const n of nodes) {
        if (CFG.direction === 'rtl') {
          n.x -= vel * n.sf * dt;
          if (n.x < -spanX * 1.25) n.x = spanX * 1.25 + Math.random() * 40;
        } else if (CFG.direction === 'ttb') {
          n.y += vel * 0.68 * n.sf * dt; n.x += n.dvx * dt;
          if (n.y > spanY * 1.15) n.y = -spanY * 1.15;
          if (n.x < -spanX * 1.2) n.x = spanX * 1.2; else if (n.x > spanX * 1.2) n.x = -spanX * 1.2;
        } else if (CFG.direction === 'btt') {
          n.y -= vel * 0.68 * n.sf * dt; n.x += n.dvx * dt;
          if (n.y < -spanY * 1.15) n.y = spanY * 1.15;
          if (n.x < -spanX * 1.2) n.x = spanX * 1.2; else if (n.x > spanX * 1.2) n.x = -spanX * 1.2;
        } else {
          n.z += 75 * CFG.speed * n.sf * dt; n.x += n.dvx * dt; n.y += n.dvy * dt;
          if (n.z > 240) n.z = -380;
        }
        const li = (elapsed - n.delay) / 0.75; if (li <= 0) continue;
        const ie = easeOutCubic(li);
        const bx = CFG.direction === 'rtl' ? 0 : Math.cos(sec * 0.75 + n.bp) * n.ba * 0.5;
        const by = CFG.direction === 'rtl' ? Math.sin(sec * 0.85 + n.bp) * n.ba * 0.45 : Math.sin(sec * 0.95 + n.bp) * n.ba;
        const p = proj(n.x + bx + (CFG.direction === 'rtl' ? (1 - ie) * 140 : 0), n.y + by, n.z);
        if (!p || p.sx < -420 || p.sx > width + 420 || p.sy < -160 || p.sy > height + 160) continue;
        const sh = n.tier === 'near' ? 0.85 + 0.15 * Math.sin(sec * n.fs + n.fp) : 0.62 + 0.38 * Math.sin(sec * n.fs + n.fp);
        const ta = n.tier === 'far' ? 0.62 : n.tier === 'mid' ? 0.88 : 1.0;
        const cs = Math.min(1.6, p.s);
        list.push({ t: 0, pz: p.pz, sx: p.sx, sy: p.sy, a: ie * sh * ta, r: roll + n.roll, si: n.mi % textSprites.length, fs: n.bfs * cs * (CFG.textScale || 0.78) * mf });
      }

      if (CFG.particleTheme !== 'none') {
        const pi = easeOutCubic((elapsed - 0.05) / 0.7);
        for (const pt of parts) {
          if ((pt.kind === 'petal' || pt.kind === 'ember') && CFG.particleTheme === 'gold-stars') continue;
          pt.y += pt.vy * CFG.speed * dt;
          pt.x += ((CFG.direction === 'rtl' ? pt.vx * 0.9 : pt.vx * 0.35) + Math.sin(sec * 1.2 + pt.sp) * pt.sa) * CFG.speed * dt;
          pt.spp += pt.sps * CFG.speed * dt;
          if (pt.y < -spanY * 1.15) pt.y = spanY * 1.15; else if (pt.y > spanY * 1.15) pt.y = -spanY * 1.15;
          if (pt.x < -spanX * 1.25) pt.x = spanX * 1.25; else if (pt.x > spanX * 1.25) pt.x = -spanX * 1.25;
          const p = proj(pt.x, pt.y, pt.z);
          if (!p || p.sx < -80 || p.sx > width + 80 || p.sy < -80 || p.sy > height + 80) continue;
          list.push({ t: 1, pz: p.pz, sx: p.sx, sy: p.sy, s: Math.min(1.45, p.s), a: pt.a * pi, pt, sxScale: 0.58 + 0.42 * Math.cos(pt.spp), r: pt.tilt + (pt.kind === 'petal' ? Math.sin(sec * 1.4 + pt.sp) * 0.45 : roll * 0.5) });
        }
      }

      list.sort((a, b) => a.pz - b.pz);
      for (const it of list) {
        if (it.t === 0) {
          const sp = textSprites[it.si]; if (!sp) continue;
          const maxF = width < 640 ? 48 : 58;
          const cf = Math.max(8.5, Math.min(maxF, it.fs)), rat = cf / sp.fs;
          const dw = sp.width * rat, dh = sp.height * rat;
          ctx.save(); ctx.translate(it.sx, it.sy); ctx.rotate(it.r); ctx.globalAlpha = it.a;
          ctx.drawImage(sp.canvas, -dw / 2, -dh / 2, dw, dh); ctx.restore();
        } else {
          const pt = it.pt, sz = Math.max(4, Math.min(36, pt.size * it.s));
          ctx.save(); ctx.translate(it.sx, it.sy); ctx.rotate(it.r); ctx.scale(it.sxScale, 1); ctx.globalAlpha = it.a;
          if (pt.kind === 'petal') { const d = sz * 2.1; ctx.drawImage(petalSprite, -d/2, -d/2, d, d); }
          else if (pt.kind === 'ember') { const d = sz * 2.8; ctx.drawImage(emberSprite, -d/2, -d/2, d, d); }
          else if (CFG.particleTheme === 'crimson-hearts' || CFG.particleTheme === 'pink-hearts') { const d = sz * 2.4; ctx.drawImage(heartSprite, -d/2, -d/2, d, d); }
          else if (CFG.particleTheme === 'gold-stars') { ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12; ctx.fillStyle = '#fde68a'; drawStar(ctx, sz * 0.72); ctx.fill(); }
          else if (CFG.particleTheme === 'ribbon-skull') {
            if (pt.kind === 'heart') { const d = sz * 2.3; ctx.drawImage(heartSprite, -d/2, -d/2, d, d); }
            else { ctx.font = Math.round(sz * 1.25) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pt.kind === 'ribbon' ? '🎀' : '☠️', 0, 0); }
          }
          ctx.restore();
        }
      }
      ctx.restore();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Self-contained PCM WAV Happy Birthday / Romantic tune via HTMLAudioElement (works reliably on iPhone/Android)
    const soundBtn = document.getElementById('soundBtn');
    const track = CFG.musicPreset === 'romantic' ? {
      len: 11.52,
      ev: [
        [0,349.23,.55,[174.61,220]],[.48,440,.55],[.96,523.25,.55],[1.44,659.25,.55],[1.92,523.25,.55],[2.4,440,.55],
        [2.88,392,.55,[196,246.94]],[3.36,493.88,.55],[3.84,587.33,.55],[4.32,659.25,.55],[4.8,587.33,.55],[5.28,493.88,.55],
        [5.76,329.63,.55,[164.81,196]],[6.24,392,.55],[6.72,493.88,.55],[7.2,587.33,.55],[7.68,493.88,.55],[8.16,392,.55],
        [8.64,220,.55,[110,164.81]],[9.12,329.63,.55],[9.6,440,.55],[10.08,523.25,.55],[10.56,659.25,.55],[11.04,523.25,.55]
      ]
    } : {
      len: 13.6,
      ev: [
        [0,392,.34,[130.81,196,261.63]],[.36,392,.16],[.54,440,.5,[130.81,164.81,196]],[1.06,392,.5],[1.58,523.25,.5,[98,146.83,196]],[2.1,493.88,.98],
        [3.2,392,.34,[98,146.83,174.61]],[3.56,392,.16],[3.74,440,.5,[98,146.83,196]],[4.26,392,.5],[4.78,587.33,.5,[130.81,164.81,196]],[5.3,523.25,.98],
        [6.4,392,.34,[130.81,164.81,196]],[6.76,392,.16],[6.94,783.99,.5,[130.81,196,233.08]],[7.46,659.25,.5],[7.98,523.25,.5,[87.31,130.81,174.61]],[8.5,493.88,.5],[9.02,440,.84],
        [9.95,698.46,.34,[87.31,130.81,174.61]],[10.31,698.46,.16],[10.49,659.25,.5,[130.81,164.81,196]],[11.01,523.25,.5,[98,146.83,174.61]],[11.53,587.33,.5],[12.05,523.25,1.25,[130.81,164.81,196]]
      ]
    };
    let wavAudio = null, cueAudio = null, cueUrls = {}, sOn = false, userMuted = false, soundUnlocked = false, primed = false;
    function mixToWavUrl(mix) {
      const sr = 22050, n = mix.length;
      let pk = 0.001; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(mix[i]));
      const sc = 0.88 / pk, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
      const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      ws(0,'RIFF'); v.setUint32(4,36+n*2,true); ws(8,'WAVE'); ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true);
      v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true);
      ws(36,'data'); v.setUint32(40,n*2,true);
      for (let i = 0, o = 44; i < n; i++, o += 2) v.setInt16(o, Math.round(Math.max(-1, Math.min(1, mix[i]*sc)) * 32767), true);
      return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    }
    function getCueUrl(step) {
      if (cueUrls[step]) return cueUrls[step];
      const sr = 22050;
      if (step === 0) {
        const n = Math.floor(0.72 * sr), mix = new Float32Array(n);
        const notes = [[523.25,0],[659.25,0.035],[783.99,0.07],[1046.5,0.105]];
        for (const nt of notes) {
          const st = Math.floor(nt[1]*sr), w = 2*Math.PI*nt[0];
          for (let i = st; i < n; i++) {
            const t = (i-st)/sr;
            mix[i] += (Math.sin(w*t)+0.3*Math.sin(2*w*t)*Math.exp(-7*t))*0.35*Math.min(1,t/0.008)*Math.exp(-4.8*t);
          }
        }
        return (cueUrls[step] = mixToWavUrl(mix));
      }
      const freq = step === 3 ? 523.25 : step === 2 ? 587.33 : 659.25;
      const n = Math.floor(0.34 * sr), mix = new Float32Array(n), w = 2*Math.PI*freq;
      for (let i = 0; i < n; i++) {
        const t = i/sr;
        mix[i] = (Math.sin(w*t)+0.38*Math.sin(2*w*t)*Math.exp(-12*t)+0.14*Math.sin(3*w*t)*Math.exp(-18*t))*0.75*Math.min(1,t/0.006)*Math.exp(-9.5*t);
      }
      return (cueUrls[step] = mixToWavUrl(mix));
    }
    function playCue(step) {
      const u = getCueUrl(step);
      if (!cueAudio) { cueAudio = new Audio(u); cueAudio.volume = 0.92; cueAudio.setAttribute('playsinline','true'); }
      else { cueAudio.pause(); cueAudio.src = u; cueAudio.currentTime = 0; }
      cueAudio.play().then(() => { soundUnlocked = true; if (introHint) introHint.style.display = 'none'; }).catch(() => {});
    }
    function buildAudio() {
      if (wavAudio) return wavAudio;
      const sr = 22050, n = Math.floor(track.len * sr), mix = new Float32Array(n);
      for (const e of track.ev) {
        const si = Math.floor(e[0] * sr), ln = Math.floor((e[2] + 0.55) * sr), w = 2 * Math.PI * e[1];
        for (let i = 0; i < ln; i++) {
          const idx = (si + i) % n, t = i / sr, env = Math.min(1, t / 0.012) * Math.exp(-3 * t);
          mix[idx] += (Math.sin(w*t) + 0.38*Math.sin(2*w*t)*Math.exp(-2.2*t) + 0.14*Math.sin(3*w*t)*Math.exp(-4*t)) * 0.55 * env;
        }
        if (e[3]) {
          const cl = Math.floor(1.55 * sr);
          for (const cf of e[3]) {
            const cw = 2 * Math.PI * cf;
            for (let i = 0; i < cl; i++) {
              const idx = (si + i) % n, t = i / sr;
              mix[idx] += (Math.sin(cw*t) + 0.2*Math.sin(2*cw*t)) * 0.14 * Math.min(1, t / 0.055) * Math.exp(-1.75 * t);
            }
          }
        }
      }
      wavAudio = new Audio(mixToWavUrl(mix));
      wavAudio.loop = true; wavAudio.volume = 1; wavAudio.setAttribute('playsinline', 'true');
      return wavAudio;
    }
    function startSound() {
      const a = buildAudio();
      a.muted = false;
      a.play().then(() => { sOn = true; soundUnlocked = true; soundBtn.textContent = 'Sound: On ♪'; }).catch(() => {});
    }
    function stopSound() {
      sOn = false; if (wavAudio) wavAudio.pause(); soundBtn.textContent = 'Sound: Off';
    }
    playCue(3);
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sOn) { userMuted = true; stopSound(); } else { userMuted = false; startSound(); }
    });
    const autoUnlock = () => {
      if (userMuted) return;
      if (!started) {
        if (!soundUnlocked) {
          soundUnlocked = true;
          if (introHint) introHint.style.display = 'none';
          const a = buildAudio();
          if (!primed && !sOn) {
            a.muted = true;
            a.play().then(() => { if (!sOn) { a.pause(); a.currentTime = 0; } a.muted = false; primed = true; }).catch(() => { a.muted = false; });
          }
          playCue(curStep);
        }
        return;
      }
      if (!sOn) startSound();
    };
    window.addEventListener('click', autoUnlock, { capture: true, passive: true });
    window.addEventListener('touchend', autoUnlock, { capture: true, passive: true });
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'starlight-wishes-gift.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
