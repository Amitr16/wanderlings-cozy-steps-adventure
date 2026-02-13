import React from 'react';
import { motion } from 'framer-motion';

const sizeClasses = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-9xl'
};

const moodStates = {
  sleepy: { emoji: '😴', animation: 'gentle-bob' },
  curious: { emoji: '👀', animation: 'look-around' },
  happy: { emoji: '💚', animation: 'bounce' },
  radiant: { emoji: '✨', animation: 'spin-celebrate' }
};

export default function MosslingDisplay({ 
  size = 'md', 
  mood = 100, 
  bondLevel = 1,
  state = 'happy', // 'sleepy', 'curious', 'happy', 'radiant'
  animate = true,
  onInteract = null 
}) {
  const moodState = moodStates[state] || moodStates.happy;
  
  const getAnimation = () => {
    if (!animate) return {};
    
    switch (moodState.animation) {
      case 'gentle-bob':
        return {
          y: [0, -5, 0],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      case 'look-around':
        return {
          rotate: [0, -10, 10, -5, 5, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'bounce':
        return {
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeOut" }
        };
      case 'spin-celebrate':
        return {
          rotate: [0, 360],
          scale: [1, 1.15, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div 
      className="relative inline-flex flex-col items-center cursor-pointer"
      onClick={onInteract}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Radiant glow for happy/radiant states */}
      {animate && (state === 'happy' || state === 'radiant') && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)',
            filter: 'blur(25px)',
            width: '150%',
            height: '150%',
            left: '-25%',
            top: '-25%'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Mossling character */}
      <motion.div
        className={`${sizeClasses[size]} relative z-10`}
        style={{ 
          filter: 'drop-shadow(0 6px 16px rgba(34, 197, 94, 0.4))'
        }}
        animate={getAnimation()}
      >
        🌿
      </motion.div>

      {/* Expression indicator */}
      <motion.div
        className="text-2xl absolute -top-3 -right-3"
        initial={{ scale: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: state === 'happy' ? [0, 15, -15, 0] : 0
        }}
        transition={{
          scale: { duration: 0.3 },
          rotate: { duration: 1.5, repeat: Infinity }
        }}
      >
        {moodState.emoji}
      </motion.div>

      {/* Sparkle particles for radiant state */}
      {animate && state === 'radiant' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              style={{ 
                top: `${20 + i * 10}%`, 
                left: `${70 + i * 15}%` 
              }}
              animate={{
                y: [-10, -30],
                x: [0, (i - 1) * 10],
                opacity: [1, 0],
                scale: [0.5, 1.5],
                rotate: [0, 360]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}

      {/* Fireflies for curious state */}
      {animate && state === 'curious' && (
        <>
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm"
              style={{ 
                top: `${30 + i * 20}%`, 
                left: i === 0 ? '10%' : '85%'
              }}
              animate={{
                y: [-5, 5, -5],
                x: [0, 5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}

      {/* Bond level indicator (subtle) */}
      {bondLevel > 1 && (
        <div className="mt-2 flex gap-1">
          {[...Array(bondLevel)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-green-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}