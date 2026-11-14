export type FlowDirection = 'rtl' | 'ttb' | 'btt' | 'drift';
export type FontPreset = 'rounded' | 'serif' | 'script' | 'display';
export type ParticleTheme = 'crimson-hearts' | 'pink-hearts' | 'ribbon-skull' | 'gold-stars' | 'none';
export type DoodleStyle = 'love-doodles' | 'birthday-doodles' | 'ribbon-skull' | 'none';
export type QrStyle = 'heart-silhouette' | 'heart-frame' | 'classic-pink';
export type MusicPreset = 'birthday' | 'romantic';
export type CatPosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center';
export type CakeStyle = 'strawberry' | 'chocolate' | 'matcha' | 'galaxy';

export interface CatSurpriseConfig {
  enabled: boolean;
  delaySeconds: number;
  scale: number;
  position: CatPosition;
  cakeStyle: CakeStyle;
}

export interface SceneConfig {
  messages: string[];
  direction: FlowDirection;
  textColor: string;
  glowColor: string;
  glowStrength: number;
  fontPreset: FontPreset;
  particleTheme: ParticleTheme;
  doodleStyle: DoodleStyle;
  musicPreset: MusicPreset;
  speed: number;
  density: number;
  tiltAngle: number;
  textScale: number;
  qrStyle: QrStyle;
  qrCaption: string;
  catSurprise: CatSurpriseConfig;
}

export interface ScenePreset {
  id: string;
  label: string;
  config: Partial<SceneConfig> & { messages: string[] };
}

export const DEFAULT_CAT_SURPRISE: CatSurpriseConfig = {
  enabled: true,
  delaySeconds: 5,
  scale: 1.0,
  position: 'bottom-center',
  cakeStyle: 'strawberry',
};

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  messages: [
    'Happy birth day Tanjil',
  ],
  direction: 'rtl',
  textColor: '#fff7fc',
  glowColor: '#e879f9',
  glowStrength: 1.15,
  fontPreset: 'rounded',
  particleTheme: 'crimson-hearts',
  doodleStyle: 'love-doodles',
  musicPreset: 'birthday',
  speed: 1.5,
  density: 110,
  tiltAngle: 8,
  textScale: 0.78,
  qrStyle: 'heart-silhouette',
  qrCaption: '',
  catSurprise: { ...DEFAULT_CAT_SURPRISE },
};

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'birthday',
    label: 'Birthday',
    config: {
      messages: [
        'Happy birth day Tanjil',
        'Make a wish',
      ],
      direction: 'rtl',
      textColor: '#fff7fc',
      glowColor: '#e879f9',
      fontPreset: 'rounded',
      particleTheme: 'crimson-hearts',
      doodleStyle: 'birthday-doodles',
      musicPreset: 'birthday',
      catSurprise: { ...DEFAULT_CAT_SURPRISE, enabled: true },
    },
  },
  {
    id: 'love',
    label: 'Love',
    config: {
      messages: [
        'I wanna be yours',
      ],
      direction: 'rtl',
      textColor: '#fff7fc',
      glowColor: '#e879f9',
      fontPreset: 'rounded',
      particleTheme: 'crimson-hearts',
      doodleStyle: 'love-doodles',
      musicPreset: 'romantic',
      catSurprise: { ...DEFAULT_CAT_SURPRISE, enabled: false },
    },
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    config: {
      messages: [
        'Happy Anniversary',
        'Forever & always',
      ],
      direction: 'rtl',
      textColor: '#fff5f8',
      glowColor: '#ff7eb6',
      fontPreset: 'serif',
      particleTheme: 'pink-hearts',
      doodleStyle: 'love-doodles',
      musicPreset: 'romantic',
      catSurprise: { ...DEFAULT_CAT_SURPRISE, enabled: false },
    },
  },
  {
    id: 'bestie',
    label: 'Bestie 🎀☠️',
    config: {
      messages: [
        'Partners in crime',
        'Bestie for life',
      ],
      direction: 'rtl',
      textColor: '#fff7fc',
      glowColor: '#f472b6',
      fontPreset: 'rounded',
      particleTheme: 'ribbon-skull',
      doodleStyle: 'ribbon-skull',
      catSurprise: { ...DEFAULT_CAT_SURPRISE, enabled: false },
    },
  },
  {
    id: 'bangla-love',
    label: 'বাংলা শুভেচ্ছা',
    config: {
      messages: [
        'শুভ জন্মদিন আমার প্রিয়',
        'ভালো থেকো সবসময়',
      ],
      direction: 'rtl',
      textColor: '#fff7fc',
      glowColor: '#e879f9',
      fontPreset: 'rounded',
      particleTheme: 'crimson-hearts',
      doodleStyle: 'love-doodles',
      musicPreset: 'birthday',
      catSurprise: { ...DEFAULT_CAT_SURPRISE, enabled: true },
    },
  },
];

export const QUICK_SYMBOLS = ['♡', '🤍', '🫶', '🩹', '🎀', '☠️', '✨', '🎂', '❤️', '🖤'];

export const COLOR_PALETTES = [
  { id: 'pink-purple-neon', label: 'Pink Purple Neon', text: '#fff7fc', glow: '#e879f9' },
  { id: 'soft-pink', label: 'Soft Pink', text: '#fff0f6', glow: '#f472b6' },
  { id: 'pure-white', label: 'Pure White', text: '#ffffff', glow: '#ffffff' },
  { id: 'crimson-rose', label: 'Crimson', text: '#ffeef0', glow: '#ff1e42' },
  { id: 'warm-gold', label: 'Warm Gold', text: '#fffbeb', glow: '#fbbf24' },
];

export function getFontFamilyCss(preset: FontPreset): string {
  switch (preset) {
    case 'serif':
      return '"Cormorant Garamond", "Hind Siliguri", Georgia, serif';
    case 'script':
      return '"Dancing Script", "Hind Siliguri", cursive';
    case 'display':
      return '"Outfit", "Hind Siliguri", sans-serif';
    case 'rounded':
    default:
      return '"Mali", "Quicksand", "Hind Siliguri", sans-serif';
  }
}

/**
 * Compact UTF-8 safe URL serializer so Bengali text & emojis (🎀☠️🫶🤍🩹)
 * encode cleanly and keep QR code URLs compact.
 */
interface CompactCatPayload {
  e?: boolean;
  d?: number;
  s?: number;
  p?: CatPosition;
  c?: CakeStyle;
}

interface CompactPayload {
  m: string[];
  d?: FlowDirection;
  tc?: string;
  gc?: string;
  gs?: number;
  fp?: FontPreset;
  pt?: ParticleTheme;
  ds?: DoodleStyle;
  sp?: number;
  dn?: number;
  ta?: number;
  ts?: number;
  mp?: MusicPreset;
  cs?: CompactCatPayload;
}

function isBirthdayText(messages: string[]): boolean {
  const joined = messages.join(' ').toLowerCase();
  return /birth\s*day|bday|জন্মদিন|🎂/.test(joined);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeSceneToParam(config: SceneConfig): string {
  const payload: CompactPayload = {
    m: config.messages.filter((line) => line.trim().length > 0),
  };
  if (config.direction !== DEFAULT_SCENE_CONFIG.direction) payload.d = config.direction;
  if (config.textColor !== DEFAULT_SCENE_CONFIG.textColor) payload.tc = config.textColor;
  if (config.glowColor !== DEFAULT_SCENE_CONFIG.glowColor) payload.gc = config.glowColor;
  if (Math.abs(config.glowStrength - DEFAULT_SCENE_CONFIG.glowStrength) > 0.01) {
    payload.gs = Number(config.glowStrength.toFixed(2));
  }
  if (config.fontPreset !== DEFAULT_SCENE_CONFIG.fontPreset) payload.fp = config.fontPreset;
  if (config.particleTheme !== DEFAULT_SCENE_CONFIG.particleTheme) payload.pt = config.particleTheme;
  if (config.doodleStyle !== DEFAULT_SCENE_CONFIG.doodleStyle) payload.ds = config.doodleStyle;
  if (Math.abs(config.speed - DEFAULT_SCENE_CONFIG.speed) > 0.01) {
    payload.sp = Number(config.speed.toFixed(2));
  }
  if (config.density !== DEFAULT_SCENE_CONFIG.density) payload.dn = config.density;
  if (config.tiltAngle !== DEFAULT_SCENE_CONFIG.tiltAngle) payload.ta = config.tiltAngle;
  if (Math.abs(config.textScale - DEFAULT_SCENE_CONFIG.textScale) > 0.01) {
    payload.ts = Number(config.textScale.toFixed(2));
  }
  if (config.musicPreset !== DEFAULT_SCENE_CONFIG.musicPreset) payload.mp = config.musicPreset;

  // Persist independent cat surprise settings per experience URL (omit when matching defaults to keep QR compact)
  const cat = config.catSurprise ?? DEFAULT_CAT_SURPRISE;
  const defaultEnabled = isBirthdayText(payload.m);
  const compactCat: CompactCatPayload = {};
  if (cat.enabled !== defaultEnabled) compactCat.e = cat.enabled;
  if (cat.delaySeconds !== DEFAULT_CAT_SURPRISE.delaySeconds) compactCat.d = cat.delaySeconds;
  if (Math.abs(cat.scale - DEFAULT_CAT_SURPRISE.scale) > 0.01) {
    compactCat.s = Number(cat.scale.toFixed(2));
  }
  if (cat.position !== DEFAULT_CAT_SURPRISE.position) compactCat.p = cat.position;
  if (cat.cakeStyle !== DEFAULT_CAT_SURPRISE.cakeStyle) compactCat.c = cat.cakeStyle;
  if (Object.keys(compactCat).length > 0) {
    payload.cs = compactCat;
  }

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

export function decodeSceneFromParam(param: string): SceneConfig | null {
  try {
    const bytes = base64UrlToBytes(param);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as CompactPayload;
    if (!parsed || !Array.isArray(parsed.m) || parsed.m.length === 0) {
      return null;
    }
    const msgs = parsed.m.map((s) => String(s)).filter((s) => s.trim().length > 0);
    const defaultEnabledForLink = isBirthdayText(msgs);

    const catSurprise: CatSurpriseConfig = {
      enabled:
        typeof parsed.cs?.e === 'boolean' ? parsed.cs.e : defaultEnabledForLink,
      delaySeconds:
        typeof parsed.cs?.d === 'number'
          ? Math.max(1, Math.min(30, Math.round(parsed.cs.d)))
          : DEFAULT_CAT_SURPRISE.delaySeconds,
      scale:
        typeof parsed.cs?.s === 'number'
          ? Math.max(0.6, Math.min(1.5, parsed.cs.s))
          : DEFAULT_CAT_SURPRISE.scale,
      position: parsed.cs?.p ?? DEFAULT_CAT_SURPRISE.position,
      cakeStyle: parsed.cs?.c ?? DEFAULT_CAT_SURPRISE.cakeStyle,
    };

    return {
      ...DEFAULT_SCENE_CONFIG,
      messages: msgs,
      direction: parsed.d ?? DEFAULT_SCENE_CONFIG.direction,
      textColor: parsed.tc ?? DEFAULT_SCENE_CONFIG.textColor,
      glowColor: parsed.gc ?? DEFAULT_SCENE_CONFIG.glowColor,
      glowStrength: typeof parsed.gs === 'number' ? parsed.gs : DEFAULT_SCENE_CONFIG.glowStrength,
      fontPreset: parsed.fp ?? DEFAULT_SCENE_CONFIG.fontPreset,
      particleTheme: parsed.pt ?? DEFAULT_SCENE_CONFIG.particleTheme,
      doodleStyle: parsed.ds ?? DEFAULT_SCENE_CONFIG.doodleStyle,
      musicPreset: parsed.mp ?? DEFAULT_SCENE_CONFIG.musicPreset,
      speed: typeof parsed.sp === 'number' ? parsed.sp : DEFAULT_SCENE_CONFIG.speed,
      density: typeof parsed.dn === 'number' ? parsed.dn : DEFAULT_SCENE_CONFIG.density,
      tiltAngle: typeof parsed.ta === 'number' ? parsed.ta : DEFAULT_SCENE_CONFIG.tiltAngle,
      textScale: typeof parsed.ts === 'number' ? parsed.ts : DEFAULT_SCENE_CONFIG.textScale,
      catSurprise,
    };
  } catch {
    return null;
  }
}

const CUSTOM_ORIGIN_KEY = 'starlight_custom_share_origin';

export function isAiStudioDevHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.startsWith('ais-dev-');
}

export function getSavedCustomShareOrigin(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CUSTOM_ORIGIN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCustomShareOrigin(origin: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = origin.trim().replace(/\/+$/, '');
    if (trimmed) {
      localStorage.setItem(CUSTOM_ORIGIN_KEY, trimmed);
    } else {
      localStorage.removeItem(CUSTOM_ORIGIN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getDefaultShareBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const custom = getSavedCustomShareOrigin();
  if (custom && /^https?:\/\//i.test(custom)) {
    return custom;
  }
  const { origin, pathname } = window.location;
  // Private AI Studio dev URLs (ais-dev-*) return 403 when scanned on external devices;
  // map automatically to the Shared App URL (ais-pre-*).
  const publicOrigin = origin.replace('://ais-dev-', '://ais-pre-');
  const cleanPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  return `${publicOrigin}${cleanPath}`;
}

export function buildShareUrl(config: SceneConfig, baseUrlOverride?: string): string {
  const encoded = encodeSceneToParam(config);
  const base = (baseUrlOverride?.trim() || getDefaultShareBaseUrl()).replace(/\/+$/, '');
  try {
    const url = new URL(base || window.location.origin);
    url.searchParams.set('s', encoded);
    return url.toString();
  } catch {
    return `${getDefaultShareBaseUrl()}?s=${encoded}`;
  }
}
