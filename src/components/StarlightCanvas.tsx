import React, { useEffect, useRef } from 'react';
import { DoodleStyle, getFontFamilyCss, SceneConfig } from '../types/scene';

interface StarlightCanvasProps {
  config: SceneConfig;
  replayTrigger: number;
  started?: boolean;
  onCanvasTap?: () => void;
}

interface StarParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface TextNode {
  id: number;
  messageIndex: number;
  x: number;
  y: number;
  z: number;
  baseFontSize: number;
  speedFactor: number;
  driftVx: number;
  driftVy: number;
  bobPhase: number;
  bobAmp: number;
  fadePhase: number;
  fadeSpeed: number;
  rollAngle: number;
  appearDelay: number;
  layerTier: 'far' | 'mid' | 'near';
}

interface FloatingParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  vy: number;
  vx: number;
  swayPhase: number;
  swayAmp: number;
  spinPhase: number;
  spinSpeed: number;
  tiltAngle: number;
  kind: 'heart' | 'petal' | 'ember' | 'ribbon' | 'skull' | 'star';
  alpha: number;
}

interface TextSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  baseRenderFontSize: number;
}

function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

function drawHeartPath(ctx: CanvasRenderingContext2D, size: number): void {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.05, -s * 0.1, -s * 0.95, -s * 0.18, -s * 0.95, s * 0.32);
  ctx.bezierCurveTo(-s * 0.95, s * 0.78, -s * 0.25, s * 1.05, 0, s * 1.32);
  ctx.bezierCurveTo(s * 0.25, s * 1.05, s * 0.95, s * 0.78, s * 0.95, s * 0.32);
  ctx.bezierCurveTo(s * 0.95, -s * 0.18, s * 0.05, -s * 0.1, 0, s * 0.35);
  ctx.closePath();
}

function drawRosePetalPath(ctx: CanvasRenderingContext2D, size: number): void {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.bezierCurveTo(s * 0.85, -s * 0.55, s * 0.95, s * 0.45, 0, s * 0.95);
  ctx.bezierCurveTo(-s * 0.65, s * 0.6, -s * 0.75, -s * 0.35, 0, -s * 0.9);
  ctx.closePath();
}

function drawFourPointStar(ctx: CanvasRenderingContext2D, size: number): void {
  const outer = size;
  const inner = size * 0.28;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function strokeHeartOutline(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.15);
  ctx.bezierCurveTo(cx - s * 0.08, cy - s * 0.55, cx - s * 0.72, cy - s * 0.55, cx - s * 0.72, cy - s * 0.08);
  ctx.bezierCurveTo(cx - s * 0.72, cy + s * 0.35, cx - s * 0.2, cy + s * 0.58, cx, cy + s * 0.75);
  ctx.bezierCurveTo(cx + s * 0.2, cy + s * 0.58, cx + s * 0.72, cy + s * 0.35, cx + s * 0.72, cy - s * 0.08);
  ctx.bezierCurveTo(cx + s * 0.72, cy - s * 0.55, cx + s * 0.08, cy - s * 0.55, cx, cy - s * 0.15);
  ctx.closePath();
  ctx.stroke();
}

function drawLoveDoodles(ctx: CanvasRenderingContext2D, startX: number, fontSize: number): void {
  const s = fontSize * 0.44;
  ctx.lineWidth = Math.max(1.2, fontSize * 0.052);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Heart-hands outline
  const x1 = startX + s * 1.1;
  ctx.beginPath();
  ctx.arc(x1 - s * 0.36, -s * 0.12, s * 0.55, Math.PI * 0.75, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1 + s * 0.36, -s * 0.12, s * 0.55, Math.PI * 1.05, Math.PI * 0.25);
  ctx.stroke();
  strokeHeartOutline(ctx, x1, s * 0.06, s * 0.56);

  // Striped heart outline
  const x2 = x1 + s * 1.85;
  strokeHeartOutline(ctx, x2, 0, s * 0.85);
  ctx.beginPath();
  ctx.moveTo(x2 - s * 0.28, -s * 0.3);
  ctx.lineTo(x2 - s * 0.28, s * 0.38);
  ctx.moveTo(x2, -s * 0.2);
  ctx.lineTo(x2, s * 0.55);
  ctx.moveTo(x2 + s * 0.28, -s * 0.3);
  ctx.lineTo(x2 + s * 0.28, s * 0.38);
  ctx.stroke();

  // Tilted band-aid outline
  const x3 = x2 + s * 1.85;
  ctx.save();
  ctx.translate(x3, 0);
  ctx.rotate(-0.65);
  const bw = s * 1.25;
  const bh = s * 0.52;
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-bw * 0.18, -bh / 2);
  ctx.lineTo(-bw * 0.18, bh / 2);
  ctx.moveTo(bw * 0.18, -bh / 2);
  ctx.lineTo(bw * 0.18, bh / 2);
  ctx.stroke();
  ctx.restore();
}

function drawBirthdayDoodles(ctx: CanvasRenderingContext2D, startX: number, fontSize: number): void {
  const s = fontSize * 0.44;
  ctx.lineWidth = Math.max(1.2, fontSize * 0.052);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const x1 = startX + s * 1.05;
  ctx.beginPath();
  ctx.roundRect(x1 - s * 0.65, -s * 0.15, s * 1.3, s * 0.72, s * 0.14);
  ctx.moveTo(x1 - s * 0.65, s * 0.12);
  ctx.quadraticCurveTo(x1 - s * 0.32, s * 0.28, x1, s * 0.12);
  ctx.quadraticCurveTo(x1 + s * 0.32, s * 0.28, x1 + s * 0.65, s * 0.12);
  ctx.moveTo(x1, -s * 0.15);
  ctx.lineTo(x1, -s * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1, -s * 0.68, s * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  const x2 = x1 + s * 1.85;
  ctx.beginPath();
  ctx.moveTo(x2 - s * 0.6, s * 0.4);
  ctx.lineTo(x2 - s * 0.7, -s * 0.32);
  ctx.lineTo(x2 - s * 0.25, s * 0.05);
  ctx.lineTo(x2, -s * 0.45);
  ctx.lineTo(x2 + s * 0.25, s * 0.05);
  ctx.lineTo(x2 + s * 0.7, -s * 0.32);
  ctx.lineTo(x2 + s * 0.6, s * 0.4);
  ctx.closePath();
  ctx.stroke();

  const x3 = x2 + s * 1.55;
  ctx.save();
  ctx.translate(x3, 0);
  drawFourPointStar(ctx, s * 0.65);
  ctx.stroke();
  ctx.restore();
}

function drawRibbonSkullDoodles(ctx: CanvasRenderingContext2D, startX: number, fontSize: number): void {
  const s = fontSize * 0.44;
  ctx.lineWidth = Math.max(1.2, fontSize * 0.052);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const x1 = startX + s * 1.1;
  ctx.beginPath();
  ctx.moveTo(x1, 0);
  ctx.bezierCurveTo(x1 - s * 0.85, -s * 0.65, x1 - s * 0.85, s * 0.45, x1, 0);
  ctx.bezierCurveTo(x1 + s * 0.85, -s * 0.65, x1 + s * 0.85, s * 0.45, x1, 0);
  ctx.moveTo(x1 - s * 0.1, s * 0.08);
  ctx.lineTo(x1 - s * 0.42, s * 0.65);
  ctx.moveTo(x1 + s * 0.1, s * 0.08);
  ctx.lineTo(x1 + s * 0.42, s * 0.65);
  ctx.stroke();

  const x2 = x1 + s * 1.75;
  ctx.beginPath();
  ctx.arc(x2, -s * 0.12, s * 0.52, Math.PI * 0.82, Math.PI * 0.18);
  ctx.lineTo(x2 + s * 0.28, s * 0.52);
  ctx.lineTo(x2 - s * 0.28, s * 0.52);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x2 - s * 0.18, -s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.arc(x2 + s * 0.18, -s * 0.12, s * 0.1, 0, Math.PI * 2);
  ctx.stroke();

  strokeHeartOutline(ctx, x2 + s * 1.55, 0, s * 0.72);
}

function buildTextSprite(
  text: string,
  fontFamily: string,
  fontWeight: number,
  textColor: string,
  glowColor: string,
  glowStrength: number,
  doodleStyle: DoodleStyle
): TextSprite {
  const baseRenderFontSize = 52;
  const pad = 42;

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d')!;
  mCtx.font = `${fontWeight} ${baseRenderFontSize}px ${fontFamily}`;
  const textWidth = Math.max(20, mCtx.measureText(text).width);
  const hasDoodles = doodleStyle !== 'none';
  const doodleWidth = hasDoodles ? baseRenderFontSize * 2.85 : 0;

  const width = Math.ceil(textWidth + doodleWidth + pad * 2);
  const height = Math.ceil(baseRenderFontSize * 1.9 + pad * 2);

  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = width;
  spriteCanvas.height = height;
  const ctx = spriteCanvas.getContext('2d')!;

  const startX = pad;
  const centerY = height / 2;

  ctx.font = `${fontWeight} ${baseRenderFontSize}px ${fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Pass 1: Wide pink/purple outer neon bloom
  if (glowStrength > 0.05) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 32 * glowStrength;
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.78;
    ctx.fillText(text, startX, centerY);

    // Pass 2: Vibrant rose-pink inner halo
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 14 * glowStrength;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(text, startX, centerY);
  }

  // Pass 3: Crisp ultra-luminous core
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 4 * glowStrength;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 1;
  ctx.fillText(text, startX, centerY);

  if (glowStrength > 0.05) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.55;
    ctx.fillText(text, startX, centerY);
    ctx.globalAlpha = 1;
  }

  if (hasDoodles) {
    ctx.save();
    ctx.translate(0, centerY);
    ctx.strokeStyle = textColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20 * glowStrength;
    const doodleStartX = startX + textWidth + baseRenderFontSize * 0.28;
    if (doodleStyle === 'love-doodles') {
      drawLoveDoodles(ctx, doodleStartX, baseRenderFontSize);
    } else if (doodleStyle === 'birthday-doodles') {
      drawBirthdayDoodles(ctx, doodleStartX, baseRenderFontSize);
    } else if (doodleStyle === 'ribbon-skull') {
      drawRibbonSkullDoodles(ctx, doodleStartX, baseRenderFontSize);
    }
    ctx.restore();
  }

  return { canvas: spriteCanvas, width, height, baseRenderFontSize };
}

function buildHeartSprite(fill: string, glow: string): HTMLCanvasElement {
  const size = 96;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.translate(size / 2, size * 0.34);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 22;
  ctx.fillStyle = fill;
  drawHeartPath(ctx, 24);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 165, 165, 0.25)';
  drawHeartPath(ctx, 15);
  ctx.fill();
  return c;
}

function buildPetalSprite(): HTMLCanvasElement {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.translate(size / 2, size / 2);
  ctx.shadowColor = '#ff1f3d';
  ctx.shadowBlur = 14;
  const grad = ctx.createLinearGradient(0, -16, 0, 16);
  grad.addColorStop(0, '#ff334b');
  grad.addColorStop(1, '#99001a');
  ctx.fillStyle = grad;
  drawRosePetalPath(ctx, 15);
  ctx.fill();
  return c;
}

function buildEmberSprite(): HTMLCanvasElement {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 14);
  g.addColorStop(0, 'rgba(255, 90, 110, 1)');
  g.addColorStop(0.35, 'rgba(255, 30, 50, 0.7)');
  g.addColorStop(1, 'rgba(255, 0, 30, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export const StarlightCanvas: React.FC<StarlightCanvasProps> = ({
  config,
  replayTrigger,
  started = true,
  onCanvasTap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const configRef = useRef<SceneConfig>(config);
  configRef.current = config;
  const startedRef = useRef<boolean>(started);
  startedRef.current = started;

  const pointerStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    movedDistance: 0,
    targetYaw: 0,
    targetPitch: 0,
    currentYaw: 0,
    currentPitch: 0,
  });

  const introStartRef = useRef<number>(performance.now());
  const nodesRef = useRef<TextNode[]>([]);
  const textSpritesRef = useRef<TextSprite[]>([]);
  const heartSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const petalSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const emberSpriteRef = useRef<HTMLCanvasElement | null>(null);

  // Rebuild cached neon sprites whenever text/style/colors change or fonts finish loading
  useEffect(() => {
    const refreshSprites = () => {
      const msgs = config.messages.filter((m) => m.trim().length > 0);
      const safeMsgs = msgs.length > 0 ? msgs : ['Happy birth day'];
      const fontFamily = getFontFamilyCss(config.fontPreset);
      const fontWeight = config.fontPreset === 'serif' ? 500 : 400;

      textSpritesRef.current = safeMsgs.map((msg) =>
        buildTextSprite(
          msg,
          fontFamily,
          fontWeight,
          config.textColor,
          config.glowColor,
          config.glowStrength,
          config.doodleStyle
        )
      );

      const isPink = config.particleTheme === 'pink-hearts';
      heartSpriteRef.current = buildHeartSprite(
        isPink ? '#ff3d8b' : '#ff2218',
        isPink ? '#ff70b8' : '#ff3828'
      );
      if (!petalSpriteRef.current) petalSpriteRef.current = buildPetalSprite();
      if (!emberSpriteRef.current) emberSpriteRef.current = buildEmberSprite();
    };

    refreshSprites();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(refreshSprites);
    }
  }, [
    config.messages,
    config.fontPreset,
    config.textColor,
    config.glowColor,
    config.glowStrength,
    config.doodleStyle,
    config.particleTheme,
  ]);

  const buildTextNodes = (count: number, messagesCount: number, w: number, h: number): TextNode[] => {
    const spanX = Math.max(w * 0.72, 340);
    const spanY = Math.max(h * 0.62, 420);
    const nodes: TextNode[] = [];
    const safeMsgCount = Math.max(1, messagesCount);

    // Stratified jittered grid ensures ZERO large empty black spaces while keeping organic random overlap
    const cols = Math.max(4, Math.round(Math.sqrt(count * (w / Math.max(360, h)))));
    const rows = Math.max(8, Math.ceil(count / cols));

    for (let i = 0; i < count; i++) {
      const gridCol = i % cols;
      const gridRow = Math.floor(i / cols) % rows;

      // Distribute depth layers: 40% small/far, 40% mid, 20% large prominent foreground
      const tierRoll = i % 15;
      let layerTier: 'far' | 'mid' | 'near' = 'mid';
      let z = 0;
      let baseFontSize = 15;
      let speedFactor = 1.0;

      if (tierRoll === 0 || tierRoll === 2 || tierRoll === 5 || tierRoll === 8 || tierRoll === 11 || tierRoll === 13) {
        layerTier = 'far';
        z = -360 + Math.random() * 190;
        baseFontSize = 10.5 + Math.random() * 3.5;
        speedFactor = 0.58 + Math.random() * 0.25;
      } else if (tierRoll === 4 || tierRoll === 12 || tierRoll === 14) {
        layerTier = 'near';
        z = 105 + Math.random() * 80;
        baseFontSize = 25 + Math.random() * 7;
        speedFactor = 1.38 + Math.random() * 0.30;
      } else {
        layerTier = 'mid';
        z = -140 + Math.random() * 195;
        baseFontSize = 15 + Math.random() * 5;
        speedFactor = 0.88 + Math.random() * 0.32;
      }

      const cellW = (spanX * 2.15) / cols;
      const cellH = (spanY * 1.9) / rows;
      const baseX = -spanX * 1.075 + (gridCol + 0.5) * cellW;
      const baseY = -spanY * 0.95 + (gridRow + 0.5) * cellH;

      const x = baseX + (Math.random() - 0.5) * cellW * 1.25;
      const y = baseY + (Math.random() - 0.5) * cellH * 1.25;

      nodes.push({
        id: i,
        messageIndex: i % safeMsgCount,
        x,
        y,
        z,
        baseFontSize,
        speedFactor,
        driftVx: (Math.random() - 0.5) * 26,
        driftVy: (Math.random() - 0.5) * 22,
        bobPhase: Math.random() * Math.PI * 2,
        bobAmp: 4 + Math.random() * 10,
        fadePhase: Math.random() * Math.PI * 2,
        fadeSpeed: 0.45 + Math.random() * 0.65,
        rollAngle: (Math.random() - 0.5) * 0.14,
        appearDelay: Math.random() * 0.45,
        layerTier,
      });
    }
    return nodes;
  };

  useEffect(() => {
    if (started) {
      introStartRef.current = performance.now();
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    nodesRef.current = buildTextNodes(configRef.current.density, configRef.current.messages.length, w, h);
  }, [replayTrigger, config.density, started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    // Subtle twinkling stars
    const stars: StarParticle[] = Array.from({ length: 150 }, () => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1400,
      z: -500 + Math.random() * 700,
      size: 0.6 + Math.random() * 1.4,
      baseAlpha: 0.2 + Math.random() * 0.55,
      twinkleSpeed: 1.0 + Math.random() * 2.2,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    if (nodesRef.current.length === 0) {
      nodesRef.current = buildTextNodes(
        configRef.current.density,
        configRef.current.messages.length,
        width,
        height
      );
    }

    // 95 Glowing Hearts (both upward & downward) + 45 Red Rose Petals + 35 Red Embers
    const spanInitX = Math.max(width * 0.8, 420);
    const spanInitY = Math.max(height * 0.72, 480);

    const heartParticles: FloatingParticle[] = Array.from({ length: 95 }, (_, i) => {
      const goesDown = i % 3 === 0;
      const kinds: FloatingParticle['kind'][] = ['heart', 'heart', 'ribbon', 'skull'];
      return {
        x: (Math.random() - 0.5) * spanInitX * 2.1,
        y: (Math.random() - 0.5) * spanInitY * 2.1,
        z: -340 + Math.random() * 500,
        size: 7 + Math.random() * 16,
        vy: goesDown ? 18 + Math.random() * 34 : -(24 + Math.random() * 44),
        vx: -14 - Math.random() * 22,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 10 + Math.random() * 22,
        spinPhase: Math.random() * Math.PI * 2,
        spinSpeed: 0.9 + Math.random() * 1.8,
        tiltAngle: (Math.random() - 0.5) * 0.55,
        kind: kinds[i % kinds.length],
        alpha: 0.62 + Math.random() * 0.38,
      };
    });

    const petalAndEmberParticles: FloatingParticle[] = Array.from({ length: 80 }, (_, i) => {
      const isPetal = i < 45;
      return {
        x: (Math.random() - 0.5) * spanInitX * 2.1,
        y: (Math.random() - 0.5) * spanInitY * 2.1,
        z: -320 + Math.random() * 480,
        size: isPetal ? 7 + Math.random() * 9 : 3 + Math.random() * 4.5,
        vy: isPetal ? 22 + Math.random() * 36 : -(16 + Math.random() * 28),
        vx: isPetal ? -22 - Math.random() * 26 : (Math.random() - 0.5) * 28,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: isPetal ? 18 + Math.random() * 24 : 8 + Math.random() * 14,
        spinPhase: Math.random() * Math.PI * 2,
        spinSpeed: isPetal ? 1.4 + Math.random() * 2.0 : 0.6,
        tiltAngle: Math.random() * Math.PI * 2,
        kind: isPetal ? 'petal' : 'ember',
        alpha: isPetal ? 0.68 + Math.random() * 0.32 : 0.55 + Math.random() * 0.45,
      };
    });

    const allParticles = [...heartParticles, ...petalAndEmberParticles];

    let lastTime = performance.now();
    let rafId = 0;

    const renderFrame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const elapsedIntro = (now - introStartRef.current) / 1000;
      const timeSec = now / 1000;

      const cfg = configRef.current;
      const motionMult = prefersReducedMotion ? 0.18 : cfg.speed;

      const pState = pointerStateRef.current;
      pState.currentYaw += (pState.targetYaw - pState.currentYaw) * Math.min(1, dt * 6);
      pState.currentPitch += (pState.targetPitch - pState.currentPitch) * Math.min(1, dt * 6);

      const tiltRad = (cfg.tiltAngle * Math.PI) / 180;
      const baseYaw =
        tiltRad * 0.65 +
        Math.sin(timeSec * 0.32) * (tiltRad * 0.25) +
        pState.currentYaw;
      const basePitch =
        -tiltRad * 0.28 +
        Math.cos(timeSec * 0.25) * (tiltRad * 0.16) +
        pState.currentPitch;
      const baseRoll = -tiltRad * 0.22;

      const cosY = Math.cos(baseYaw);
      const sinY = Math.sin(baseYaw);
      const cosX = Math.cos(basePitch);
      const sinX = Math.sin(basePitch);

      const fov = Math.max(540, Math.min(width, height) * 0.92);
      const spanX = Math.max(width * 0.82, 420);
      const spanY = Math.max(height * 0.72, 460);

      // Pure black background
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (!startedRef.current) {
        ctx.restore();
        rafId = requestAnimationFrame(renderFrame);
        return;
      }

      const project3D = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const depth = fov - z2;
        if (depth < 80) return null;
        const scale = fov / depth;
        return {
          sx: width * 0.5 + x1 * scale,
          sy: height * 0.5 + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // 1. Stars
      const starIntroAlpha = easeOutCubic(elapsedIntro / 0.35);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x -= 12 * motionMult * dt;
        if (star.x < -900) star.x = 900;

        const proj = project3D(star.x, star.y, star.z);
        if (!proj) continue;
        if (proj.sx < -10 || proj.sx > width + 10 || proj.sy < -10 || proj.sy > height + 10) {
          continue;
        }
        const twinkle = 0.55 + 0.45 * Math.sin(timeSec * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.baseAlpha * twinkle * starIntroAlpha;
        if (alpha <= 0.02) continue;

        ctx.fillStyle = `rgba(255, 240, 250, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, Math.max(0.45, star.size * proj.scale * 0.65), 0, Math.PI * 2);
        ctx.fill();
      }

      type Renderable =
        | {
            type: 'text';
            pz: number;
            sx: number;
            sy: number;
            alpha: number;
            roll: number;
            spriteIdx: number;
            targetFontSize: number;
          }
        | {
            type: 'particle';
            pz: number;
            sx: number;
            sy: number;
            scale: number;
            alpha: number;
            particle: FloatingParticle;
            spinScaleX: number;
            rot: number;
          };

      const renderables: Renderable[] = [];
      const baseTextVel = 220 * motionMult;
      const sprites = textSpritesRef.current;
      const mobileFactor = width < 640 ? 0.82 : 0.98;

      // 2. Dense Text Nodes
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (cfg.direction === 'rtl') {
          node.x -= baseTextVel * node.speedFactor * dt;
          if (node.x < -spanX * 1.25) {
            node.x = spanX * 1.25 + Math.random() * 40;
          }
        } else if (cfg.direction === 'ttb') {
          node.y += baseTextVel * 0.68 * node.speedFactor * dt;
          node.x += node.driftVx * dt;
          if (node.y > spanY * 1.15) node.y = -spanY * 1.15;
          if (node.x < -spanX * 1.2) node.x = spanX * 1.2;
          else if (node.x > spanX * 1.2) node.x = -spanX * 1.2;
        } else if (cfg.direction === 'btt') {
          node.y -= baseTextVel * 0.68 * node.speedFactor * dt;
          node.x += node.driftVx * dt;
          if (node.y < -spanY * 1.15) node.y = spanY * 1.15;
          if (node.x < -spanX * 1.2) node.x = spanX * 1.2;
          else if (node.x > spanX * 1.2) node.x = -spanX * 1.2;
        } else {
          node.z += 75 * motionMult * node.speedFactor * dt;
          node.x += node.driftVx * dt;
          node.y += node.driftVy * dt;
          if (node.z > 240) node.z = -380;
        }

        const localIntro = (elapsedIntro - node.appearDelay) / 0.75;
        if (localIntro <= 0) continue;
        const introEase = easeOutCubic(localIntro);

        const bobY =
          cfg.direction === 'rtl'
            ? Math.sin(timeSec * 0.85 + node.bobPhase) * (node.bobAmp * 0.45)
            : Math.sin(timeSec * 0.95 + node.bobPhase) * node.bobAmp;
        const bobX =
          cfg.direction === 'rtl'
            ? 0
            : Math.cos(timeSec * 0.75 + node.bobPhase) * (node.bobAmp * 0.5);
        const introOffsetX = cfg.direction === 'rtl' ? (1 - introEase) * 140 : 0;

        const proj = project3D(node.x + bobX + introOffsetX, node.y + bobY, node.z);
        if (!proj) continue;

        if (proj.sx < -420 || proj.sx > width + 420 || proj.sy < -160 || proj.sy > height + 160) {
          continue;
        }

        // Smooth continuous fade-in and fade-out pulse (foreground stays extra clear & bright)
        const shimmer =
          node.layerTier === 'near'
            ? 0.85 + 0.15 * Math.sin(timeSec * node.fadeSpeed + node.fadePhase)
            : 0.62 + 0.38 * Math.sin(timeSec * node.fadeSpeed + node.fadePhase);
        const depthAlpha =
          proj.pz < -220
            ? Math.max(0.32, 1 - (-220 - proj.pz) / 340)
            : proj.pz > 220
            ? Math.max(0, 1 - (proj.pz - 220) / 140)
            : 1;

        const edgeFadeX =
          cfg.direction === 'rtl'
            ? Math.min(
                1,
                Math.max(0, (proj.sx + 320) / 200),
                Math.max(0, (width + 320 - proj.sx) / 200)
              )
            : 1;

        const tierAlpha =
          node.layerTier === 'far' ? 0.62 : node.layerTier === 'mid' ? 0.88 : 1.0;

        const finalAlpha = Math.max(0, Math.min(1, introEase * shimmer * depthAlpha * edgeFadeX * tierAlpha));
        if (finalAlpha <= 0.03 || sprites.length === 0) continue;

        const clampedProjScale = Math.min(1.6, proj.scale);
        renderables.push({
          type: 'text',
          pz: proj.pz,
          sx: proj.sx,
          sy: proj.sy,
          alpha: finalAlpha,
          roll: baseRoll + node.rollAngle,
          spriteIdx: node.messageIndex % sprites.length,
          targetFontSize: node.baseFontSize * clampedProjScale * cfg.textScale * mobileFactor,
        });
      }

      // 3. Hearts, Red Rose Petals & Glowing Red Embers
      if (cfg.particleTheme !== 'none') {
        const particleIntro = easeOutCubic((elapsedIntro - 0.05) / 0.7);
        for (let i = 0; i < allParticles.length; i++) {
          const p = allParticles[i];
          const isPetalOrEmber = p.kind === 'petal' || p.kind === 'ember';
          // Only show petals & embers on heart/romantic themes or always as subtle particles
          if (isPetalOrEmber && cfg.particleTheme === 'gold-stars') continue;

          p.y += p.vy * motionMult * dt;
          const windX = cfg.direction === 'rtl' ? p.vx * 0.9 : p.vx * 0.35;
          p.x += (windX + Math.sin(timeSec * 1.2 + p.swayPhase) * p.swayAmp) * motionMult * dt;
          p.spinPhase += p.spinSpeed * motionMult * dt;

          if (p.y < -spanY * 1.15) {
            p.y = spanY * 1.15;
            p.x = (Math.random() - 0.5) * spanX * 2.2;
          } else if (p.y > spanY * 1.15) {
            p.y = -spanY * 1.15;
            p.x = (Math.random() - 0.5) * spanX * 2.2;
          }

          if (p.x < -spanX * 1.25) p.x = spanX * 1.25;
          else if (p.x > spanX * 1.25) p.x = -spanX * 1.25;

          const proj = project3D(p.x, p.y, p.z);
          if (!proj) continue;
          if (proj.sx < -80 || proj.sx > width + 80 || proj.sy < -80 || proj.sy > height + 80) {
            continue;
          }

          const depthFade =
            proj.pz < -240
              ? Math.max(0.25, 1 - (-240 - proj.pz) / 340)
              : proj.pz > 240
              ? Math.max(0, 1 - (proj.pz - 240) / 120)
              : 1;

          const alpha = p.alpha * depthFade * particleIntro;
          if (alpha <= 0.03) continue;

          renderables.push({
            type: 'particle',
            pz: proj.pz,
            sx: proj.sx,
            sy: proj.sy,
            scale: Math.min(1.45, proj.scale),
            alpha,
            particle: p,
            spinScaleX: 0.58 + 0.42 * Math.cos(p.spinPhase),
            rot: p.tiltAngle + (p.kind === 'petal' ? Math.sin(timeSec * 1.4 + p.swayPhase) * 0.45 : baseRoll * 0.5),
          });
        }
      }

      // Unified back-to-front depth sort
      renderables.sort((a, b) => a.pz - b.pz);

      // 4. Blit sprites at 60fps
      const heartSprite = heartSpriteRef.current;
      const petalSprite = petalSpriteRef.current;
      const emberSprite = emberSpriteRef.current;

      for (let i = 0; i < renderables.length; i++) {
        const item = renderables[i];
        if (item.type === 'text') {
          const sp = sprites[item.spriteIdx];
          if (!sp) continue;
          const maxFont = width < 640 ? 48 : 58;
          const clampedFont = Math.max(8.5, Math.min(maxFont, item.targetFontSize));
          const ratio = clampedFont / sp.baseRenderFontSize;
          const drawW = sp.width * ratio;
          const drawH = sp.height * ratio;

          ctx.save();
          ctx.translate(item.sx, item.sy);
          ctx.rotate(item.roll);
          ctx.globalAlpha = item.alpha;
          ctx.drawImage(sp.canvas, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          const p = item.particle;
          const size = Math.max(4, Math.min(36, p.size * item.scale));
          ctx.save();
          ctx.translate(item.sx, item.sy);
          ctx.rotate(item.rot);
          ctx.scale(item.spinScaleX, 1);
          ctx.globalAlpha = item.alpha;

          if (p.kind === 'petal' && petalSprite) {
            const drawSize = size * 2.1;
            ctx.drawImage(petalSprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else if (p.kind === 'ember' && emberSprite) {
            const drawSize = size * 2.8;
            ctx.drawImage(emberSprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else if (
            (cfg.particleTheme === 'crimson-hearts' || cfg.particleTheme === 'pink-hearts') &&
            heartSprite
          ) {
            const drawSize = size * 2.4;
            ctx.drawImage(heartSprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else if (cfg.particleTheme === 'gold-stars') {
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#fde68a';
            drawFourPointStar(ctx, size * 0.72);
            ctx.fill();
          } else if (cfg.particleTheme === 'ribbon-skull') {
            if (p.kind === 'heart' && heartSprite) {
              const drawSize = size * 2.3;
              ctx.drawImage(heartSprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            } else {
              const glyph = p.kind === 'ribbon' ? '🎀' : '☠️';
              ctx.font = `${Math.round(size * 1.25)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(glyph, 0, 0);
            }
          }
          ctx.restore();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ps = pointerStateRef.current;
    ps.isDragging = true;
    ps.startX = e.clientX;
    ps.startY = e.clientY;
    ps.movedDistance = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ps = pointerStateRef.current;
    if (ps.isDragging) {
      const dx = e.clientX - ps.startX;
      const dy = e.clientY - ps.startY;
      ps.movedDistance += Math.hypot(dx, dy);
      ps.startX = e.clientX;
      ps.startY = e.clientY;
      ps.targetYaw = Math.max(-0.55, Math.min(0.55, ps.targetYaw + dx * 0.0028));
      ps.targetPitch = Math.max(-0.35, Math.min(0.35, ps.targetPitch + dy * 0.0028));
    } else {
      const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      ps.targetYaw = nx * 0.14;
      ps.targetPitch = ny * 0.09;
    }
  };

  const handlePointerUp = () => {
    const ps = pointerStateRef.current;
    const wasTap = ps.isDragging && ps.movedDistance < 8;
    ps.isDragging = false;
    if (wasTap && onCanvasTap) {
      onCanvasTap();
    }
  };

  const handlePointerLeave = () => {
    const ps = pointerStateRef.current;
    ps.isDragging = false;
    ps.targetYaw = 0;
    ps.targetPitch = 0;
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-0 h-full w-full touch-none select-none cursor-grab active:cursor-grabbing"
      aria-label="Dense 3D glowing romantic kinetic wishes wallpaper"
    />
  );
};
