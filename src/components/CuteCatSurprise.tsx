import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { CakeStyle, CatPosition, CatSurpriseConfig } from '../types/scene';

interface CuteCatSurpriseProps {
  config: CatSurpriseConfig;
  previewTrigger: number;
  replayTrigger?: number;
  started?: boolean;
}

type SurprisePhase = 'waiting' | 'entrance' | 'windup' | 'push' | 'rebound' | 'idle';

interface CakePalette {
  sponge: string;
  spongeShade: string;
  icing: string;
  icingShade: string;
  splat: string;
  sprinkles: [string, string, string];
  candle: string;
}

const CAKE_PALETTES: Record<CakeStyle, CakePalette> = {
  strawberry: {
    sponge: '#fde6cc',
    spongeShade: '#f5cfa8',
    icing: '#ff9ec4',
    icingShade: '#f472b6',
    splat: '#ff85b8',
    sprinkles: ['#ff3b7f', '#ffe066', '#ffffff'],
    candle: '#ff5c8a',
  },
  chocolate: {
    sponge: '#8b5a3c',
    spongeShade: '#6b422a',
    icing: '#4a2617',
    icingShade: '#32180e',
    splat: '#6f3b24',
    sprinkles: ['#ff7eb6', '#ffd166', '#72efdd'],
    candle: '#ffbe0b',
  },
  matcha: {
    sponge: '#e6f5d0',
    spongeShade: '#cce6aa',
    icing: '#74c69d',
    icingShade: '#52b788',
    splat: '#8ce0b2',
    sprinkles: ['#ffffff', '#ff99c8', '#ffd166'],
    candle: '#ff758f',
  },
  galaxy: {
    sponge: '#433878',
    spongeShade: '#2e2559',
    icing: '#e879f9',
    icingShade: '#c084fc',
    splat: '#f0abfc',
    sprinkles: ['#fff7ae', '#7dd3fc', '#f9a8d4'],
    candle: '#c084fc',
  },
};

function getPositionClasses(pos: CatPosition): string {
  switch (pos) {
    case 'bottom-left':
      return 'bottom-20 left-3 sm:left-6 origin-bottom-left';
    case 'bottom-right':
      return 'bottom-20 right-3 sm:right-6 origin-bottom-right';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center';
    case 'bottom-center':
    default:
      return 'bottom-20 left-1/2 -translate-x-1/2 origin-bottom';
  }
}

export const CuteCatSurprise: React.FC<CuteCatSurpriseProps> = ({
  config,
  previewTrigger,
  replayTrigger = 0,
  started = true,
}) => {
  const [phase, setPhase] = useState<SurprisePhase>('waiting');
  const [dismissed, setDismissed] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const lastPreviewRef = useRef(previewTrigger);
  const lastReplayRef = useRef(replayTrigger);

  // Schedule delayed surprise (or immediate preview when triggered from editor)
  useEffect(() => {
    const isPreviewNow = previewTrigger !== lastPreviewRef.current;
    const isSceneReplay = replayTrigger !== lastReplayRef.current;
    lastPreviewRef.current = previewTrigger;
    lastReplayRef.current = replayTrigger;

    if (!config.enabled || (!started && !isPreviewNow)) {
      setPhase('waiting');
      return;
    }

    if (isPreviewNow || isSceneReplay) {
      setDismissed(false);
    }

    const delayMs = isPreviewNow ? 0 : Math.max(1, config.delaySeconds) * 1000;
    const timers: number[] = [];

    const runChoreography = () => {
      setPhase('entrance');
      timers.push(window.setTimeout(() => setPhase('windup'), 950));
      timers.push(window.setTimeout(() => setPhase('push'), 1750));
      timers.push(window.setTimeout(() => setPhase('rebound'), 2550));
      timers.push(window.setTimeout(() => setPhase('idle'), 3400));
    };

    if (delayMs === 0) {
      runChoreography();
    } else {
      setPhase('waiting');
      timers.push(window.setTimeout(runChoreography, delayMs));
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [config.enabled, config.delaySeconds, previewTrigger, replayTrigger, started]);

  // Occasional cute blinking while idling
  useEffect(() => {
    if (!config.enabled || phase !== 'idle') return;
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 180);
    }, 3400);
    return () => window.clearInterval(interval);
  }, [config.enabled, phase]);

  if (!config.enabled || dismissed || phase === 'waiting') {
    return null;
  }

  const cake = CAKE_PALETTES[config.cakeStyle] ?? CAKE_PALETTES.strawberry;
  const hasFrostingOnFace = phase === 'push' || phase === 'rebound' || phase === 'idle';
  const showSplatBurst = phase === 'push';

  // Responsive scale safeguard so small phones never clip
  const responsiveScale = Math.max(0.55, Math.min(1.5, config.scale));

  return (
    <div
      className={`fixed z-20 pointer-events-none select-none ${getPositionClasses(config.position)}`}
      aria-live="polite"
      aria-label="Cute birthday kittens cake surprise animation"
    >
      <motion.div
        initial={{ opacity: 0, y: 85, scale: 0.65 * responsiveScale }}
        animate={{ opacity: 1, y: 0, scale: responsiveScale }}
        exit={{ opacity: 0, y: 40, scale: 0.7 * responsiveScale }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="relative group"
      >
        {/* Subtle dismiss button (appears gently in corner so viewer can close anytime) */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="pointer-events-auto absolute -top-1 right-1 z-30 w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          aria-label="Hide kitten surprise"
          title="Hide kittens"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Floating idle celebration hearts */}
        <AnimatePresence>
          {(phase === 'rebound' || phase === 'idle') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-x-0 -top-4 flex justify-center gap-10 pointer-events-none"
            >
              <motion.span
                animate={{ y: [-2, -16, -2], opacity: [0.45, 0.95, 0.45], scale: [0.85, 1.1, 0.85] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="text-sm drop-shadow-[0_0_8px_rgba(244,114,182,0.85)]"
              >
                💖
              </motion.span>
              <motion.span
                animate={{ y: [-6, -20, -6], opacity: [0.35, 0.9, 0.35], scale: [0.8, 1.05, 0.8] }}
                transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                className="text-xs drop-shadow-[0_0_8px_rgba(244,114,182,0.85)]"
              >
                ✨
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main SVG Stage: Left Kitten (Mochi) + Center Cake + Right Kitten (Boba) */}
        <svg
          viewBox="0 0 320 185"
          className="w-[270px] sm:w-[320px] h-auto overflow-visible drop-shadow-[0_12px_28px_rgba(0,0,0,0.75)]"
        >
          {/* Soft stage ground glow */}
          <ellipse cx="160" cy="166" rx="126" ry="12" fill="rgba(244, 114, 182, 0.16)" />

          {/* ======================== CENTER BIRTHDAY CAKE ======================== */}
          <motion.g
            style={{ originX: '160px', originY: '162px' }}
            animate={
              phase === 'push'
                ? { scaleY: [1, 0.78, 1.06, 0.92, 1], scaleX: [1, 1.16, 0.96, 1.03, 1] }
                : { scaleY: 1, scaleX: 1 }
            }
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Cake Plate */}
            <ellipse cx="160" cy="161" rx="44" ry="8" fill="#ffffff" />
            <ellipse cx="160" cy="159" rx="38" ry="5.5" fill="#f3e8ff" />

            {/* Cake Sponge Body */}
            <rect x="128" y="122" width="64" height="36" rx="8" fill={cake.sponge} />
            <rect x="128" y="142" width="64" height="16" rx="6" fill={cake.spongeShade} opacity="0.55" />
            {/* Cream Filling Stripe */}
            <rect x="128" y="137" width="64" height="5" fill="#ffffff" opacity="0.85" />

            {/* Frosting Top + Drips */}
            <path
              d="M126 125 C126 116, 194 116, 194 125 L194 132 C190 137, 184 137, 182 131 C179 140, 171 140, 169 130 C165 138, 156 138, 154 129 C149 139, 141 139, 139 131 C135 136, 128 136, 126 131 Z"
              fill={cake.icing}
            />
            <ellipse cx="160" cy="121" rx="34" ry="7" fill={cake.icingShade} opacity="0.4" />

            {/* Cake Toppings & Sprinkles */}
            <circle cx="143" cy="118" r="4.5" fill={cake.sprinkles[0]} />
            <circle cx="177" cy="118" r="4.5" fill={cake.sprinkles[0]} />
            <rect x="136" y="127" width="4" height="2" rx="1" transform="rotate(-20 136 127)" fill={cake.sprinkles[1]} />
            <rect x="152" y="126" width="4" height="2" rx="1" transform="rotate(25 152 126)" fill={cake.sprinkles[2]} />
            <rect x="171" y="127" width="4" height="2" rx="1" transform="rotate(-15 171 127)" fill={cake.sprinkles[1]} />
            <rect x="183" y="125" width="4" height="2" rx="1" transform="rotate(35 183 125)" fill={cake.sprinkles[2]} />

            {/* Birthday Candle + Flickering Flame */}
            <rect x="157" y="99" width="6" height="20" rx="2.5" fill={cake.candle} />
            <line x1="157" y1="105" x2="163" y2="103" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
            <line x1="157" y1="112" x2="163" y2="110" stroke="#ffffff" strokeWidth="1.4" opacity="0.7" />
            <line x1="160" y1="99" x2="160" y2="95" stroke="#4a3728" strokeWidth="1.5" strokeLinecap="round" />

            <motion.g
              style={{ originX: '160px', originY: '95px' }}
              animate={{
                scale: [1, 1.14, 0.94, 1.08, 1],
                rotate: [-3, 4, -2, 3, -3],
              }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <circle cx="160" cy="88" r="9" fill="rgba(255, 200, 70, 0.35)" />
              <path
                d="M160 80 C164 85, 165 92, 160 95 C155 92, 156 85, 160 80 Z"
                fill="#ffbe0b"
              />
              <path
                d="M160 85 C162 88, 162.5 92, 160 94 C157.5 92, 158 88, 160 85 Z"
                fill="#fff3b0"
              />
            </motion.g>
          </motion.g>

          {/* ======================== LEFT KITTEN (MOCHI - PLAYFUL PUSHER) ======================== */}
          <motion.g
            animate={
              phase === 'windup'
                ? { x: -4, y: -3, rotate: -5 }
                : phase === 'push'
                ? { x: 28, y: -4, rotate: 12 }
                : phase === 'rebound'
                ? { x: 4, y: -7, rotate: -4 }
                : phase === 'idle'
                ? { x: 0, y: [0, -3.5, 0], rotate: 0 }
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={
              phase === 'idle'
                ? {
                    x: { duration: 0.35, ease: 'easeOut' },
                    rotate: { duration: 0.35, ease: 'easeOut' },
                    y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                  }
                : { type: 'spring', stiffness: 280, damping: 16 }
            }
            style={{ originX: '76px', originY: '150px' }}
          >
            {/* Wagging Tail */}
            <motion.path
              d="M44 146 C22 142, 18 116, 30 108"
              fill="none"
              stroke="#ffdcb8"
              strokeWidth="10"
              strokeLinecap="round"
              animate={{ rotate: [-6, 10, -6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '44px', originY: '146px' }}
            />
            <motion.path
              d="M25 114 C27 110, 31 108, 30 108"
              fill="none"
              stroke="#f4a261"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Body */}
            <ellipse cx="72" cy="136" rx="28" ry="26" fill="#fff1e0" stroke="#e8c39e" strokeWidth="1.5" />
            <ellipse cx="75" cy="140" rx="16" ry="15" fill="#ffffff" opacity="0.7" />

            {/* Ears */}
            <path d="M44 82 L39 54 L63 70 Z" fill="#ffe6cc" stroke="#e8c39e" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M46 77 L44 61 L58 70 Z" fill="#ff9ebb" />
            <path d="M98 82 L103 54 L79 70 Z" fill="#ffe6cc" stroke="#e8c39e" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M96 77 L98 61 L84 70 Z" fill="#ff9ebb" />

            {/* Head */}
            <ellipse cx="71" cy="94" rx="34" ry="28" fill="#fff1e0" stroke="#e8c39e" strokeWidth="1.5" />
            {/* Peach Tabby Forehead Stripes */}
            <path d="M65 69 L65 77 M71 67 L71 78 M77 69 L77 77" stroke="#f4a261" strokeWidth="3" strokeLinecap="round" />

            {/* Cheek Blush */}
            <ellipse cx="50" cy="100" rx="6" ry="3.5" fill="#ff8fab" opacity="0.65" />
            <ellipse cx="92" cy="100" rx="6" ry="3.5" fill="#ff8fab" opacity="0.65" />

            {/* Eyes based on phase */}
            {phase === 'push' || phase === 'rebound' ? (
              <>
                <path d="M54 92 Q59 86 64 92" fill="none" stroke="#3b261d" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M78 92 Q83 86 88 92" fill="none" stroke="#3b261d" strokeWidth="2.6" strokeLinecap="round" />
              </>
            ) : isBlinking ? (
              <>
                <line x1="54" y1="91" x2="63" y2="91" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="79" y1="91" x2="88" y2="91" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="59" cy="90" r="4.8" fill="#2b1b14" />
                <circle cx="57.5" cy="88.3" r="1.7" fill="#ffffff" />
                <circle cx="83" cy="90" r="4.8" fill="#2b1b14" />
                <circle cx="81.5" cy="88.3" r="1.7" fill="#ffffff" />
              </>
            )}

            {/* Nose & Mischievous / Happy Mouth */}
            <polygon points="69,96 74,96 71.5,99.5" fill="#ff758f" />
            <path
              d="M67 101 Q71.5 106 76 101"
              fill="none"
              stroke="#3b261d"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Whiskers */}
            <line x1="34" y1="93" x2="46" y2="95" stroke="#c9a581" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="34" y1="99" x2="46" y2="99" stroke="#c9a581" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="96" y1="95" x2="108" y2="93" stroke="#c9a581" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="96" y1="99" x2="108" y2="99" stroke="#c9a581" strokeWidth="1.4" strokeLinecap="round" />

            {/* Left Kitten Paws (raise & push forward during windup/push!) */}
            <motion.g
              animate={
                phase === 'windup'
                  ? { x: 12, y: -16, rotate: -25 }
                  : phase === 'push'
                  ? { x: 48, y: -18, rotate: 18 }
                  : phase === 'rebound'
                  ? { x: 4, y: -14, rotate: -10 }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              style={{ originX: '92px', originY: '132px' }}
            >
              <ellipse cx="96" cy="128" rx="9" ry="7" fill="#fff1e0" stroke="#e8c39e" strokeWidth="1.5" />
              <circle cx="98" cy="128" r="3" fill="#ff9ebb" opacity="0.85" />
            </motion.g>
          </motion.g>

          {/* ======================== RIGHT KITTEN (BOBA - CAKE TARGET!) ======================== */}
          <motion.g
            animate={
              phase === 'windup'
                ? { x: -16, y: 2, rotate: -8 }
                : phase === 'push'
                ? { x: -56, y: 24, rotate: -24 }
                : phase === 'rebound'
                ? { x: 4, y: -8, rotate: 6 }
                : phase === 'idle'
                ? { x: 0, y: [0, -3.5, 0], rotate: 0 }
                : { x: 0, y: 0, rotate: 0 }
            }
            transition={
              phase === 'idle'
                ? {
                    x: { duration: 0.35, ease: 'easeOut' },
                    rotate: { duration: 0.35, ease: 'easeOut' },
                    y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
                  }
                : { type: 'spring', stiffness: 260, damping: 15 }
            }
            style={{ originX: '246px', originY: '150px' }}
          >
            {/* Wagging Tail */}
            <motion.path
              d="M274 146 C296 142, 300 116, 288 108"
              fill="none"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              animate={{ rotate: [6, -10, 6] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '274px', originY: '146px' }}
            />

            {/* Body */}
            <ellipse cx="246" cy="136" rx="28" ry="26" fill="#ffffff" stroke="#f3c6db" strokeWidth="1.5" />
            {/* Cute Pink Bow Tie */}
            <path d="M236 121 L246 125 L236 129 Z" fill="#ff4d8d" />
            <path d="M256 121 L246 125 L256 129 Z" fill="#ff4d8d" />
            <circle cx="246" cy="125" r="3" fill="#ff85b8" />

            {/* Ears */}
            <path d="M220 82 L215 54 L239 70 Z" fill="#ffffff" stroke="#f3c6db" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M222 77 L220 61 L234 70 Z" fill="#ff9ebb" />
            <path d="M274 82 L279 54 L255 70 Z" fill="#ffffff" stroke="#f3c6db" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M272 77 L274 61 L260 70 Z" fill="#ff9ebb" />

            {/* Head */}
            <ellipse cx="247" cy="94" rx="34" ry="28" fill="#ffffff" stroke="#f3c6db" strokeWidth="1.5" />

            {/* Cheek Blush */}
            <ellipse cx="226" cy="100" rx="6" ry="3.5" fill="#ff8fab" opacity="0.65" />
            <ellipse cx="268" cy="100" rx="6" ry="3.5" fill="#ff8fab" opacity="0.65" />

            {/* Eyes based on phase */}
            {phase === 'push' ? (
              <>
                {/* Squinting > < during cake splat */}
                <path d="M229 88 L236 92 L229 96" fill="none" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M265 88 L258 92 L265 96" fill="none" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : phase === 'rebound' ? (
              <>
                <path d="M230 92 Q235 86 240 92" fill="none" stroke="#3b261d" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M254 92 Q259 86 264 92" fill="none" stroke="#3b261d" strokeWidth="2.6" strokeLinecap="round" />
              </>
            ) : isBlinking ? (
              <>
                <line x1="230" y1="91" x2="239" y2="91" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="255" y1="91" x2="264" y2="91" stroke="#3b261d" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="235" cy="90" r="4.8" fill="#2b1b14" />
                <circle cx="233.5" cy="88.3" r="1.7" fill="#ffffff" />
                <circle cx="259" cy="90" r="4.8" fill="#2b1b14" />
                <circle cx="257.5" cy="88.3" r="1.7" fill="#ffffff" />
              </>
            )}

            {/* Nose & Mouth */}
            <polygon points="244.5,96 249.5,96 247,99.5" fill="#ff758f" />
            <path
              d="M242 102 Q247 107 252 102"
              fill="none"
              stroke="#3b261d"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Adorable Frosting Splatter on Boba's Face after cake push */}
            {hasFrostingOnFace && (
              <motion.g
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <ellipse cx="241" cy="97" rx="8.5" ry="6" fill={cake.splat} opacity="0.9" />
                <circle cx="230" cy="99" r="4.2" fill={cake.icing} />
                <circle cx="253" cy="103" r="3.4" fill={cake.icing} />
                <circle cx="247" cy="95" r="2.6" fill="#ffffff" opacity="0.9" />
                <rect x="236" y="95" width="3.5" height="1.8" rx="0.9" transform="rotate(-25 236 95)" fill={cake.sprinkles[1]} />
                <rect x="251" y="102" width="3.5" height="1.8" rx="0.9" transform="rotate(30 251 102)" fill={cake.sprinkles[0]} />
              </motion.g>
            )}

            {/* Whiskers */}
            <line x1="210" y1="93" x2="222" y2="95" stroke="#d9b8c7" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="210" y1="99" x2="222" y2="99" stroke="#d9b8c7" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="272" y1="95" x2="284" y2="93" stroke="#d9b8c7" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="272" y1="99" x2="284" y2="99" stroke="#d9b8c7" strokeWidth="1.4" strokeLinecap="round" />

            {/* Front Paw */}
            <ellipse cx="222" cy="134" rx="8.5" ry="6.5" fill="#ffffff" stroke="#f3c6db" strokeWidth="1.5" />
          </motion.g>

          {/* ======================== FROSTING SPLAT & BOOP EFFECT ======================== */}
          <AnimatePresence>
            {showSplatBurst && (
              <motion.g
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1.15 }}
                exit={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 0.4 }}
                style={{ originX: '162px', originY: '104px' }}
              >
                <circle cx="144" cy="92" r="5" fill={cake.splat} />
                <circle cx="182" cy="88" r="4.5" fill={cake.icing} />
                <circle cx="166" cy="76" r="4" fill={cake.sprinkles[1]} />
                <circle cx="132" cy="108" r="3.5" fill={cake.sprinkles[0]} />
                <text
                  x="160"
                  y="72"
                  textAnchor="middle"
                  fill="#ffffff"
                  stroke="#ff4d8d"
                  strokeWidth="3"
                  paintOrder="stroke"
                  fontSize="14"
                  fontWeight="800"
                >
                  BOOP!
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
};
