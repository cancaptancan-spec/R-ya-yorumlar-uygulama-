import { useEffect, useRef, useState } from 'react';

export type DreamSceneTheme = {
  atmosphere: 'water_moon' | 'light_sky' | 'nature_peace' | 'night_stars' | 'golden_mosque';
  primaryColor: string;
  accentColor: string;
  sceneCaption: string;
};

type Palette = { skyTop: string; skyBottom: string; ground: string; distant: string };

const DEFAULT_PRIMARY = '#174b43';
const DEFAULT_ACCENT = '#e5ca82';
const ATMOSPHERE_PALETTES: Record<DreamSceneTheme['atmosphere'], Palette> = {
  water_moon: { skyTop: '#102b3a', skyBottom: '#246052', ground: '#163f3d', distant: '#285b52' },
  light_sky: { skyTop: '#7198a1', skyBottom: '#e1c99e', ground: '#718b78', distant: '#a8b7a0' },
  nature_peace: { skyTop: '#153b3b', skyBottom: '#658875', ground: '#173e36', distant: '#426b55' },
  night_stars: { skyTop: '#111b39', skyBottom: '#343d61', ground: '#202b40', distant: '#39445e' },
  golden_mosque: { skyTop: '#263d51', skyBottom: '#ad8560', ground: '#263b3c', distant: '#4c5c54' },
};

const validHex = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : fallback;

const rgba = (hex: string, alpha: number): string => {
  const clean = validHex(hex, DEFAULT_ACCENT).slice(1);
  const full = clean.length === 3 ? clean.split('').map((part) => part + part).join('') : clean;
  const value = Number.parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const seeded = (index: number): number => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 44 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 24 * scale, y - 5 * scale, 20 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 7 * scale, y - 9 * scale, 25 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 31 * scale, y - 3 * scale, 19 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPine(ctx: CanvasRenderingContext2D, x: number, base: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, base - size);
  ctx.lineTo(x - size * 0.43, base - size * 0.42);
  ctx.lineTo(x - size * 0.2, base - size * 0.42);
  ctx.lineTo(x - size * 0.58, base - size * 0.08);
  ctx.lineTo(x - size * 0.16, base - size * 0.08);
  ctx.lineTo(x - size * 0.68, base + size * 0.25);
  ctx.lineTo(x + size * 0.68, base + size * 0.25);
  ctx.lineTo(x + size * 0.16, base - size * 0.08);
  ctx.lineTo(x + size * 0.58, base - size * 0.08);
  ctx.lineTo(x + size * 0.2, base - size * 0.42);
  ctx.lineTo(x + size * 0.43, base - size * 0.42);
  ctx.closePath();
  ctx.fill();
}

function drawMosque(ctx: CanvasRenderingContext2D, width: number, height: number, ground: string, accent: string) {
  const base = height * 0.79;
  const center = width * 0.52;
  const scale = Math.min(width / 480, height / 300, 1.25);
  const domeW = 58 * scale;
  ctx.fillStyle = ground;
  ctx.fillRect(center - 105 * scale, base - 63 * scale, 210 * scale, 74 * scale);
  ctx.fillRect(center - 137 * scale, base - 45 * scale, 34 * scale, 56 * scale);
  ctx.fillRect(center + 103 * scale, base - 45 * scale, 34 * scale, 56 * scale);

  ctx.beginPath();
  ctx.moveTo(center - domeW, base - 62 * scale);
  ctx.quadraticCurveTo(center - domeW * 0.8, base - 142 * scale, center, base - 153 * scale);
  ctx.quadraticCurveTo(center + domeW * 0.8, base - 142 * scale, center + domeW, base - 62 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(center - 155 * scale, base - 158 * scale, 17 * scale, 169 * scale);
  ctx.fillRect(center + 138 * scale, base - 158 * scale, 17 * scale, 169 * scale);
  ctx.beginPath();
  ctx.moveTo(center - 160 * scale, base - 158 * scale);
  ctx.lineTo(center - 146.5 * scale, base - 190 * scale);
  ctx.lineTo(center - 133 * scale, base - 158 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(center + 133 * scale, base - 158 * scale);
  ctx.lineTo(center + 146.5 * scale, base - 190 * scale);
  ctx.lineTo(center + 160 * scale, base - 158 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rgba(accent, 0.25);
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.arc(center + i * 34 * scale, base - 30 * scale, 7 * scale, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillRect(center - 1 * scale, base - 188 * scale, 2 * scale, 28 * scale);
}

/** Draws a complete static frame, suitable for both animation and share-card canvases. */
export function drawDreamSceneFrame(
  ctx: CanvasRenderingContext2D,
  theme: DreamSceneTheme,
  width: number,
  height: number,
  timeSeconds: number,
): void {
  if (width <= 0 || height <= 0) return;
  const atmosphere = Object.hasOwn(ATMOSPHERE_PALETTES, theme?.atmosphere)
    ? theme.atmosphere
    : 'water_moon';
  const palette = ATMOSPHERE_PALETTES[atmosphere];
  const primary = validHex(theme?.primaryColor, DEFAULT_PRIMARY);
  const accent = validHex(theme?.accentColor, DEFAULT_ACCENT);
  const t = Number.isFinite(timeSeconds) ? timeSeconds : 0;
  const w = width;
  const h = height;
  const horizon = h * 0.69;

  ctx.clearRect(0, 0, w, h);
  const sky = ctx.createLinearGradient(0, 0, w * 0.12, h);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.58, primary);
  sky.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glowX = w * (atmosphere === 'water_moon' ? 0.7 : 0.76);
  const glowY = h * (atmosphere === 'night_stars' ? 0.27 : 0.32);
  const glowRadius = Math.max(w, h) * 0.5;
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
  glow.addColorStop(0, rgba(accent, atmosphere === 'light_sky' ? 0.34 : 0.26));
  glow.addColorStop(0.36, rgba(accent, 0.09));
  glow.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Slow, translucent rays sweep through the upper atmosphere.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const rayOriginX = w * 0.73;
  const rayOriginY = h * 0.31;
  const raySpan = w * 0.9;
  for (let i = 0; i < 7; i += 1) {
    const angle = -2.55 + i * 0.13 + Math.sin(t * 0.16 + i) * 0.025;
    const reach = h * (0.82 + (i % 3) * 0.13);
    const spread = 0.045 + (i % 2) * 0.018;
    ctx.beginPath();
    ctx.moveTo(rayOriginX, rayOriginY);
    ctx.lineTo(rayOriginX + Math.cos(angle - spread) * raySpan, rayOriginY + Math.sin(angle - spread) * reach);
    ctx.lineTo(rayOriginX + Math.cos(angle + spread) * raySpan, rayOriginY + Math.sin(angle + spread) * reach);
    ctx.closePath();
    ctx.fillStyle = rgba(accent, 0.018 + (Math.sin(t * 0.35 + i) + 1) * 0.009);
    ctx.fill();
  }
  ctx.restore();

  if (atmosphere === 'night_stars' || atmosphere === 'water_moon') {
    // Moon disc and a softly veiled halo.
    ctx.fillStyle = rgba(accent, atmosphere === 'night_stars' ? 0.88 : 0.76);
    ctx.beginPath();
    ctx.arc(glowX, glowY, Math.max(9, Math.min(w, h) * 0.045), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(palette.skyTop, 0.52);
    ctx.beginPath();
    ctx.arc(glowX + Math.min(w, h) * 0.018, glowY - Math.min(w, h) * 0.018, Math.max(8, Math.min(w, h) * 0.04), 0, Math.PI * 2);
    ctx.fill();
  }

  if (atmosphere === 'light_sky' || atmosphere === 'golden_mosque') {
    const drift = (t * 3) % (w + 180);
    drawCloud(ctx, ((drift + w * 0.08) % (w + 150)) - 70, h * 0.28, Math.max(0.48, w / 500), '#fff2d6', 0.16);
    drawCloud(ctx, ((-drift * 0.48 + w * 0.74 + w + 140) % (w + 160)) - 80, h * 0.42, Math.max(0.36, w / 620), '#f5e6c7', 0.12);
  }

  // Fine stars / airborne motes; deterministic positions keep every frame coherent.
  const particleCount = atmosphere === 'night_stars' ? 58 : 34;
  for (let i = 0; i < particleCount; i += 1) {
    const px = seeded(i + 5) * w;
    const py = seeded(i + 81) * h * (atmosphere === 'light_sky' ? 0.56 : 0.67);
    const radius = 0.55 + seeded(i + 9) * (i % 8 === 0 ? 1.35 : 0.75);
    const twinkle = 0.38 + 0.52 * (0.5 + 0.5 * Math.sin(t * (0.65 + seeded(i + 7)) + i));
    ctx.beginPath();
    ctx.arc(px + Math.sin(t * 0.06 + i) * 2, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = rgba(accent, twinkle * (atmosphere === 'light_sky' ? 0.38 : 0.78));
    ctx.fill();
  }

  // Mid-distance silhouettes, each scene has a deliberately distinct horizon.
  if (atmosphere === 'light_sky') {
    ctx.fillStyle = palette.distant;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.03);
    ctx.quadraticCurveTo(w * 0.18, horizon - h * 0.1, w * 0.4, horizon + h * 0.01);
    ctx.quadraticCurveTo(w * 0.7, horizon + h * 0.11, w, horizon - h * 0.04);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.fillStyle = palette.ground;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.13);
    ctx.quadraticCurveTo(w * 0.25, horizon + h * 0.02, w * 0.48, horizon + h * 0.16);
    ctx.quadraticCurveTo(w * 0.77, horizon + h * 0.3, w, horizon + h * 0.12);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  } else if (atmosphere === 'nature_peace') {
    ctx.fillStyle = palette.distant;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.1);
    ctx.quadraticCurveTo(w * 0.22, horizon - h * 0.11, w * 0.48, horizon + h * 0.08);
    ctx.quadraticCurveTo(w * 0.74, horizon - h * 0.04, w, horizon + h * 0.12);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    for (let i = 0; i < 11; i += 1) {
      const x = (i / 10) * w + Math.sin(i * 2.3) * w * 0.035;
      const size = h * (0.2 + seeded(i + 90) * 0.22);
      drawPine(ctx, x, horizon + h * 0.24 + seeded(i + 12) * h * 0.12, size, i % 2 ? palette.ground : primary);
    }
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, horizon + h * 0.27, w, h);
  } else if (atmosphere === 'golden_mosque') {
    ctx.fillStyle = palette.distant;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.13);
    ctx.quadraticCurveTo(w * 0.28, horizon - h * 0.04, w * 0.56, horizon + h * 0.12);
    ctx.quadraticCurveTo(w * 0.78, horizon + h * 0.2, w, horizon + h * 0.05);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    drawMosque(ctx, w, h, palette.ground, accent);
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, h * 0.8, w, h * 0.2);
  } else {
    // A layered mountain ridge gives the water and starlit scenes their own silhouettes.
    ctx.fillStyle = palette.distant;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.02);
    ctx.lineTo(w * 0.18, horizon - h * 0.13);
    ctx.lineTo(w * 0.34, horizon + h * 0.02);
    ctx.lineTo(w * 0.56, horizon - h * 0.2);
    ctx.lineTo(w * 0.8, horizon + h * 0.03);
    ctx.lineTo(w, horizon - h * 0.08);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.ground;
    ctx.beginPath();
    ctx.moveTo(0, horizon + h * 0.12);
    ctx.quadraticCurveTo(w * 0.35, horizon + h * 0.01, w * 0.6, horizon + h * 0.14);
    ctx.quadraticCurveTo(w * 0.82, horizon + h * 0.22, w, horizon + h * 0.1);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }

  if (atmosphere === 'water_moon' || atmosphere === 'night_stars') {
    const waterTop = h * 0.73;
    const water = ctx.createLinearGradient(0, waterTop, w, h);
    water.addColorStop(0, rgba(palette.distant, 0.92));
    water.addColorStop(1, rgba(palette.skyTop, 0.98));
    ctx.fillStyle = water;
    ctx.fillRect(0, waterTop, w, h - waterTop);
    const reflectionX = glowX + Math.sin(t * 0.18) * w * 0.012;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 13; i += 1) {
      const y = waterTop + h * (0.035 + i * 0.021);
      const spread = w * (0.035 + i * 0.011);
      const sway = Math.sin(t * 0.44 + i * 0.8) * w * 0.012;
      ctx.beginPath();
      ctx.moveTo(reflectionX - spread + sway, y);
      ctx.quadraticCurveTo(reflectionX + sway, y - h * 0.008, reflectionX + spread + sway, y);
      ctx.strokeStyle = rgba(accent, 0.12 + (1 - i / 15) * 0.28);
      ctx.lineWidth = Math.max(0.7, h * 0.002);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Thin drifting mist bands add a soft foreground layer without obscuring the landscape.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 3; i += 1) {
    const y = h * (0.7 + i * 0.075);
    const mist = ctx.createLinearGradient(0, y, w, y);
    mist.addColorStop(0, rgba(accent, 0));
    mist.addColorStop(0.48, rgba(accent, 0.035));
    mist.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = mist;
    ctx.fillRect(((t * (2 + i) + i * w * 0.39) % (w * 1.5)) - w * 0.75, y, w * 0.85, h * 0.045);
  }
  ctx.restore();
}

export type DreamAnimationCanvasProps = {
  theme: DreamSceneTheme;
  className?: string;
  showCaption?: boolean;
  showBadge?: boolean;
  paused?: boolean;
};

export function DreamAnimationCanvas({
  theme,
  className = '',
  showCaption = true,
  showBadge = true,
  paused = false,
}: DreamAnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener?.('change', updatePreference);
    return () => media.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return undefined;
    let frameId = 0;
    let startTime = 0;
    let cssWidth = 0;
    let cssHeight = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      cssWidth = rect.width;
      cssHeight = rect.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(cssWidth * pixelRatio);
      canvas.height = Math.round(cssHeight * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawDreamSceneFrame(ctx, theme, cssWidth, cssHeight, 0);
    };

    const render = (now: number) => {
      if (!startTime) startTime = now;
      const time = reducedMotion || paused ? 0 : (now - startTime) / 1000;
      drawDreamSceneFrame(ctx, theme, cssWidth, cssHeight, time);
      if (!reducedMotion && !paused) frameId = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion || paused) return;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(render);
    });
    observer.observe(canvas);
    resize();
    if (!reducedMotion && !paused) frameId = window.requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [theme, reducedMotion, paused]);

  const caption = typeof theme?.sceneCaption === 'string' ? theme.sceneCaption.trim() : '';

  return (
    <div className={`dream-animation-canvas relative h-full w-full min-h-0 overflow-hidden ${className}`} role="img" aria-label={caption || 'Huzurlu, sembolik rüya sahnesi'} data-testid="dream-animation-canvas">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      {(showCaption || showBadge) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#102a2c]/75 via-[#102a2c]/25 to-transparent px-3 pb-3 pt-9 sm:px-4 sm:pb-4">
          {showCaption && (
            <p className="max-w-[75%] text-[10px] leading-4 text-[#f4ecd7] drop-shadow sm:text-xs">
              {caption || 'Sükûnetli bir rüya manzarası'}
            </p>
          )}
          {showBadge && (
            <span className="ml-auto shrink-0 rounded-full border border-[#e5ca82]/45 bg-[#163c38]/90 px-2.5 py-1 text-[9px] font-medium tracking-[0.08em] text-[#f0dfad]">
              Canlı Sahne
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DreamAnimationCanvas;
