'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface OrbProps {
  state: OrbState;
  size?: 'sm' | 'lg';
}

export function Orb({ state, size = 'lg' }: OrbProps) {
  const isLg = size === 'lg';
  const outerSize = isLg ? 'w-40 h-40' : 'w-7 h-7';
  const innerSize = isLg ? 'w-28 h-28' : 'w-5 h-5';

  return (
    <div className={`relative flex items-center justify-center ${outerSize}`}>
      {/* Ripple waves — listening */}
      <AnimatePresence>
        {state === 'listening' &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border border-emerald-400/40"
              style={{ width: isLg ? '7rem' : '1.25rem', height: isLg ? '7rem' : '1.25rem' }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: isLg ? 2.6 : 2.4, opacity: 0 }}
              transition={{ duration: 1.8, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>

      {/* Orbiting particles — thinking */}
      <AnimatePresence>
        {state === 'thinking' &&
          [0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className={`absolute rounded-full bg-emerald-300 ${isLg ? 'w-2 h-2' : 'w-1 h-1'}`}
              animate={{
                rotate: [0 + i * 90, 360 + i * 90],
                x: isLg ? [0, 52, 0, -52, 0] : [0, 16, 0, -16, 0],
                y: isLg ? [-52, 0, 52, 0, -52] : [-16, 0, 16, 0, -16],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
            />
          ))}
      </AnimatePresence>

      {/* Equalizer bars — speaking */}
      <AnimatePresence>
        {state === 'speaking' && isLg && (
          <div className="absolute -bottom-8 flex items-end gap-1">
            {[3, 6, 10, 7, 4, 9, 5].map((h, i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-emerald-400"
                style={{ height: h * 2 }}
                animate={{ scaleY: [1, 2.2, 0.6, 1.8, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Core orb */}
      <motion.div
        className={`relative rounded-full ${innerSize}`}
        animate={{
          scale: state === 'listening' ? [1, 1.08, 1] : state === 'speaking' ? [1, 1.05, 0.97, 1] : 1,
          boxShadow:
            state === 'idle'
              ? '0 0 24px 4px rgba(0,156,59,0.25), 0 0 60px 10px rgba(0,156,59,0.10)'
              : state === 'listening'
                ? '0 0 40px 12px rgba(0,200,80,0.5), 0 0 80px 20px rgba(0,200,80,0.2)'
                : state === 'thinking'
                  ? '0 0 32px 8px rgba(52,211,153,0.4), 0 0 70px 16px rgba(52,211,153,0.15)'
                  : '0 0 48px 16px rgba(0,200,80,0.6), 0 0 90px 24px rgba(0,200,80,0.25)',
        }}
        transition={{
          scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #6EE7B7 0%, #10B981 30%, #059669 60%, #065F46 100%)',
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: '12%',
            left: '15%',
            width: '40%',
            height: '35%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 100%)',
          }}
        />
        {/* Bottom shadow */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '10%',
            right: '12%',
            width: '35%',
            height: '30%',
            background: 'radial-gradient(circle, rgba(0,0,0,0.25) 0%, transparent 100%)',
          }}
        />
      </motion.div>
    </div>
  );
}
