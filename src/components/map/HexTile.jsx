import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ScoutParticles, RestoreParticles, BloomParticles, GlowRipple } from './TileParticles';

const biomeEmojis = {
  mosswood: '🌲',
  firefly: '✨',
  brookside: '💧',
  mushroom: '🍄',
  blossom: '🌸',
  pebble: '🪨'
};

const biomeColors = {
  fogged: { fill: '#9CA3AF', stroke: '#6B7280' },
  revealed: { fill: '#E5E7EB', stroke: '#9CA3AF' },
  restored: { fill: '#86EFAC', stroke: '#10B981' },
  bloomed: { fill: '#4ADE80', stroke: '#059669' }
};

export default function HexTile({ tile, x, y, onScout, onRestore, onBloom, canAfford, size = 60 }) {
  const { state, biome } = tile;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState(null);
  
  const handleClick = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (state === 'fogged' && canAfford.scout) {
      setAnimationType('scout');
      setTimeout(() => {
        onScout(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 500);
      }, 150);
    } else if (state === 'revealed' && canAfford.restore) {
      setAnimationType('restore');
      setTimeout(() => {
        onRestore(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 600);
      }, 150);
    } else if (state === 'restored' && canAfford.bloom) {
      setAnimationType('bloom');
      setTimeout(() => {
        onBloom(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 800);
      }, 150);
    }
  };

  // Create hexagon path
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  const pathData = `M ${points.join(' L ')} Z`;

  const colors = biomeColors[state];
  const isClickable = 
    (state === 'fogged' && canAfford.scout) ||
    (state === 'revealed' && canAfford.restore) ||
    (state === 'restored' && canAfford.bloom);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Hex tile */}
      <motion.path
        d={pathData}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={state === 'bloomed' ? 3 : 2}
        className={isClickable ? "cursor-pointer" : "cursor-not-allowed"}
        onClick={handleClick}
        initial={false}
        animate={{
          scale: isAnimating ? 1.1 : 1,
          opacity: state === 'fogged' ? 0.7 : 1
        }}
        whileHover={isClickable ? { scale: 1.08 } : {}}
        transition={{ duration: 0.2 }}
      />

      {/* Fog overlay with dissolve effect */}
      <AnimatePresence>
        {state === 'fogged' && (
          <motion.path
            d={pathData}
            fill="#374151"
            opacity={0.5}
            initial={{ opacity: 0.5 }}
            exit={{ 
              opacity: 0,
              scale: 1.2
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Bloomed shimmer effect */}
      {state === 'bloomed' && (
        <motion.path
          d={pathData}
          fill="url(#shimmerGradient)"
          opacity={0.3}
          animate={{
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Content based on state */}
      <AnimatePresence mode="wait">
        {state === 'fogged' && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <foreignObject x={-8} y={-8} width={16} height={16}>
              <Lock className="text-gray-600 w-4 h-4" />
            </foreignObject>
            {canAfford.scout && (
              <motion.text 
                y={20} 
                textAnchor="middle" 
                className="text-xs fill-amber-600 font-bold"
                animate={{ y: [20, 18, 20] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                3✨
              </motion.text>
            )}
          </motion.g>
        )}
        
        {state === 'revealed' && (
          <motion.g
            initial={{ opacity: 0, scale: 0, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "backOut" }}
          >
            <text y={8} textAnchor="middle" className="text-2xl">
              {biomeEmojis[biome]}
            </text>
            {canAfford.restore && (
              <motion.text 
                y={25} 
                textAnchor="middle" 
                className="text-xs fill-green-600 font-bold"
                animate={{ y: [25, 23, 25] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                7✨
              </motion.text>
            )}
          </motion.g>
        )}
        
        {(state === 'restored' || state === 'bloomed') && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: state === 'bloomed' ? [1, 1.15, 1] : 1,
              rotate: state === 'bloomed' ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              scale: { duration: 2, repeat: state === 'bloomed' ? Infinity : 0 },
              rotate: { duration: 3, repeat: state === 'bloomed' ? Infinity : 0 }
            }}
          >
            <text 
              y={8} 
              textAnchor="middle" 
              className={state === 'bloomed' ? 'text-3xl' : 'text-2xl'}
            >
              {biomeEmojis[biome]}
            </text>
          </motion.g>
        )}

        {state === 'restored' && canAfford.bloom && (
          <motion.text 
            y={25} 
            textAnchor="middle" 
            className="text-xs fill-purple-600 font-bold"
            animate={{ y: [25, 23, 25], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            12✨
          </motion.text>
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {animationType === 'scout' && <ScoutParticles x={0} y={0} size={size} />}
        {animationType === 'restore' && <RestoreParticles x={0} y={0} size={size} />}
        {animationType === 'bloom' && <BloomParticles x={0} y={0} size={size} />}
        {animationType === 'restore' && <GlowRipple x={0} y={0} size={size} color="#10B981" />}
        {animationType === 'bloom' && <GlowRipple x={0} y={0} size={size} color="#8B5CF6" />}
      </AnimatePresence>

      {/* Shimmer gradient definition */}
      <defs>
        <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </g>
  );
}