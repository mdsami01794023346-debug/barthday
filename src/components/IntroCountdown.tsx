import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { CountdownCue } from '../utils/audio';

interface IntroCountdownProps {
  glowColor?: string;
  soundUnlocked: boolean;
  onStepChange?: (step: CountdownCue) => void;
  onComplete: () => void;
}

/**
 * Displays a centered glowing 3 -> 2 -> 1 countdown on a pure black screen
 * ONCE at initial page load before revealing the kinetic starry wishes and surprise.
 */
export const IntroCountdown: React.FC<IntroCountdownProps> = ({
  glowColor = '#e879f9',
  soundUnlocked,
  onStepChange,
  onComplete,
}) => {
  const [step, setStep] = useState<3 | 2 | 1>(3);
  const [done, setDone] = useState<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  const hasRunRef = useRef<boolean>(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    onStepChangeRef.current?.(3);

    const t1 = window.setTimeout(() => {
      setStep(2);
      onStepChangeRef.current?.(2);
    }, 900);

    const t2 = window.setTimeout(() => {
      setStep(1);
      onStepChangeRef.current?.(1);
    }, 1800);

    const t3 = window.setTimeout(() => {
      onStepChangeRef.current?.(0);
      setDone(true);
      onCompleteRef.current();
    }, 2650);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-black select-none pointer-events-none"
      aria-live="polite"
      aria-label={`Starting in ${step}`}
    >
      {/* Subtle pink/purple radial aura behind countdown */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-35 transition-colors duration-500"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(244,114,182,0.35) 45%, transparent 72%)`,
        }}
      />

      {/* Glowing circular ring + animated number */}
      <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.5"
          />
          <motion.circle
            key={`ring-${step}`}
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={glowColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            style={{
              filter: `drop-shadow(0 0 10px ${glowColor})`,
            }}
          />
        </svg>

        <AnimatePresence mode="wait">
          <motion.span
            key={`num-${step}`}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.35 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl font-semibold tracking-tight text-white tabular-nums"
            style={{
              fontFamily: '"Mali", "Outfit", "Hind Siliguri", sans-serif',
              textShadow: `0 0 18px #ffffff, 0 0 36px ${glowColor}, 0 0 64px #f472b6`,
            }}
          >
            {step}
          </motion.span>
        </AnimatePresence>
      </div>

      {!soundUnlocked && (
        <div className="mt-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-rose-400/25 text-rose-200/85 text-xs font-medium animate-pulse">
          <Volume2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Tap anywhere for countdown &amp; music sound</span>
        </div>
      )}
    </div>
  );
};
