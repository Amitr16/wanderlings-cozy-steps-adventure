import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { makeHexPath } from './hexUtils';
import { ScoutParticles, RestoreParticles, BloomParticles, GlowRipple } from './TileParticles';

const biomeEmojis = {
  mosswood: '🌲',
  firefly: '✨',
  brookside: '💧',
  mushroom: '🍄',
  blossom: '🌸',
  pebble: '🪨'
};

export default function HexTile({ tile, x, y, onScout, onRestore, onBloom, canAfford, size = 60, elevation = 0 }) {
  const state = String(tile.state || 'fogged').toLowerCase();
  const { biome } = tile;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState(null);
  const [showAffordError, setShowAffordError] = useState(false);
  
  const handleClick = async () => {
    console.log('[HexTile] 1. CLICK HANDLER - tile:', tile.q, tile.r, 'state:', state, 'canAfford:', canAfford);
    if (isAnimating) {
      console.log('[HexTile] Already animating, skipping');
      return;
    }
    
    if (state === 'bloomed') {
      console.log('[HexTile] Tile is fully bloomed - no more actions available');
      return;
    }
    
    if (state === 'fogged') {
      console.log('[HexTile] 2. State is fogged, checking afford:', canAfford.scout);
      if (canAfford.scout) {
        console.log('[HexTile] 3. Can afford! Starting scout animation');
        setIsAnimating(true);
        setAnimationType('scout');
        setTimeout(() => {
          console.log('[HexTile] 4. About to call onScout with tile:', tile);
          onScout(tile);
          setTimeout(() => {
            console.log('[HexTile] 5. Scout animation complete, resetting state');
            setIsAnimating(false);
            setAnimationType(null);
          }, 500);
        }, 150);
      } else {
        console.log('Cannot afford scout, showing error');
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    } else if (state === 'revealed') {
      if (canAfford.restore) {
        setIsAnimating(true);
        setAnimationType('restore');
        setTimeout(() => {
          onRestore(tile);
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationType(null);
          }, 600);
        }, 150);
      } else {
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    } else if (state === 'restored') {
      if (canAfford.bloom) {
        setIsAnimating(true);
        setAnimationType('bloom');
        setTimeout(() => {
          onBloom(tile);
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationType(null);
          }, 800);
        }, 150);
      } else {
        console.log('[HexTile] Cannot afford bloom');
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    } else {
      console.log('[HexTile] ERROR - state not handled:', state);
    }
  };

  const pathData = makeHexPath(size);
  const isClickable = state === 'fogged' || state === 'revealed' || state === 'restored';

  return (
    <g transform={`translate(${x}, ${y})`} style={{ isolation: 'isolate' }}>
      {/* Invisible hex hit area (captures taps accurately) */}
      <path
        d={pathData}
        fill="transparent"
        stroke="none"
        className="cursor-pointer"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        style={{ pointerEvents: 'all', touchAction: 'manipulation' }}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {/* Cost indicators and affordability error feedback */}
        <AnimatePresence mode="wait">
          {state === 'fogged' && canAfford.scout && (
            <motion.text 
              y={20} 
              textAnchor="middle" 
              className="text-xs fill-amber-600 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [20, 18, 20] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              3✨
            </motion.text>
          )}
          
          {state === 'revealed' && canAfford.restore && (
            <motion.text 
              y={25} 
              textAnchor="middle" 
              className="text-xs fill-green-600 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [25, 23, 25] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              7✨
            </motion.text>
          )}
          
          {state === 'restored' && canAfford.bloom && (
            <motion.text 
              y={25} 
              textAnchor="middle" 
              className="text-xs fill-purple-600 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [25, 23, 25], scale: [1, 1.1, 1] }}
              exit={{ opacity: 0 }}
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

        {/* Affordability Error Feedback */}
        <AnimatePresence>
          {showAffordError && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <motion.g
                animate={{ x: [-2, 2, -2, 2, 0] }}
                transition={{ duration: 0.4 }}
              >
                <rect
                  x={-45}
                  y={-40}
                  width={90}
                  height={28}
                  rx={12}
                  fill="#ef4444"
                  opacity={0.98}
                />
                <text
                  y={-18}
                  textAnchor="middle"
                  className="text-sm fill-white font-bold"
                >
                  Need {state === 'fogged' ? '3' : state === 'revealed' ? '7' : '12'}✨
                </text>
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>
      </g>
    </g>
  );
}