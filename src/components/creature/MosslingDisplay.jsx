import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function MosslingDisplay({ mood = 100, size = 'large', animate = true }) {
  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const moodEmoji = mood >= 80 ? '😊' : mood >= 50 ? '😌' : '😔';

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-amber-300/30 via-green-300/20 to-transparent rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Creature */}
      <motion.div
        className={`${sizes[size]} relative z-10 flex items-center justify-center`}
        animate={animate ? {
          y: [0, -8, 0],
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative">
          {/* Mossling body */}
          <div className="text-6xl" style={{ filter: 'drop-shadow(0 4px 12px rgba(45, 80, 22, 0.3))' }}>
            🌿
          </div>
          
          {/* Mood indicator */}
          <div className="absolute -top-1 -right-1 text-2xl">
            {moodEmoji}
          </div>

          {/* Sparkle effect */}
          {animate && mood >= 80 && (
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}