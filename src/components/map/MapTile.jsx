import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Sparkles } from 'lucide-react';

const biomeEmojis = {
  forest: '🌲',
  meadow: '🌸',
  pond: '💧',
  grove: '🍄',
  mushroom: '🍄'
};

export default function MapTile({ tile, onReveal, onRestore, canAfford, compact = false }) {
  const { state, biome, position_x, position_y } = tile;

  const renderTile = () => {
    if (state === 'fogged') {
      return (
        <motion.button
          onClick={() => canAfford.reveal && onReveal(tile)}
          disabled={!canAfford.reveal}
          className={`relative w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg border-2 border-gray-500 
            ${canAfford.reveal ? 'cursor-pointer hover:from-gray-200 hover:to-gray-300' : 'cursor-not-allowed opacity-50'}
            transition-all flex items-center justify-center group`}
          whileHover={canAfford.reveal ? { scale: 1.05 } : {}}
          whileTap={canAfford.reveal ? { scale: 0.95 } : {}}
        >
          <div className="absolute inset-0 bg-black/20 rounded-lg" />
          <Lock className="w-6 h-6 text-gray-600 z-10" />
          {canAfford.reveal && (
            <div className="absolute bottom-1 right-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              3✨
            </div>
          )}
        </motion.button>
      );
    }

    if (state === 'revealed') {
      return (
        <motion.button
          onClick={() => canAfford.restore && onRestore(tile)}
          disabled={!canAfford.restore}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative w-full h-full bg-gradient-to-br from-amber-100 to-green-100 rounded-lg border-2 border-green-300
            ${canAfford.restore ? 'cursor-pointer hover:from-amber-50 hover:to-green-50' : 'cursor-not-allowed opacity-60'}
            transition-all flex items-center justify-center text-3xl group`}
          whileHover={canAfford.restore ? { scale: 1.05 } : {}}
          whileTap={canAfford.restore ? { scale: 0.95 } : {}}
        >
          <div className="opacity-30">{biomeEmojis[biome] || '🌿'}</div>
          {canAfford.restore && (
            <div className="absolute bottom-1 right-1 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              7✨
            </div>
          )}
        </motion.button>
      );
    }

    if (state === 'restored') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full h-full bg-gradient-to-br from-green-200 via-emerald-300 to-green-400 rounded-lg border-2 border-green-500 flex items-center justify-center text-4xl overflow-hidden"
        >
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {biomeEmojis[biome] || '🌿'}
          </motion.div>
          <motion.div
            className="absolute top-1 right-1"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
          </motion.div>
        </motion.div>
      );
    }
  };

  return (
    <div className={compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'}>
      {renderTile()}
    </div>
  );
}