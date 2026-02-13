import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexPath } from './hexUtils';

const biomeEmojis = {
  mosswood: '🌲',
  firefly: '✨',
  brookside: '💧',
  mushroom: '🍄',
  blossom: '🌸',
  pebble: '🪨'
};

// Uniform terrain color — fog controls visibility, not tile color
const stateStyle = {
  fogged:   { fill: '#8fa585', iconOpacity: 0.3 },
  revealed: { fill: '#8fa585', iconOpacity: 0.7 },
  restored: { fill: '#8fa585', iconOpacity: 1.0 },
  bloomed:  { fill: '#8fa585', iconOpacity: 1.0 }
};

export default function HexTile({
  tile,
  size = 34,
  onScout,
  onRestore,
  onBloom,
  canAfford
}) {
  const state = String(tile?.state || 'fogged').toLowerCase();
  const style = stateStyle[state] || stateStyle.fogged;
  const [showAffordError, setShowAffordError] = useState(false);

  const handleAction = () => {
    // Instant feedback on tap
    if (state === 'fogged') {
      if (!canAfford?.scout) return flashNeed();
      onScout?.(tile);
      return;
    }
    if (state === 'revealed') {
      if (!canAfford?.restore) return flashNeed();
      onRestore?.(tile);
      return;
    }
    if (state === 'restored') {
      if (!canAfford?.bloom) return flashNeed();
      onBloom?.(tile);
      return;
    }
  };

  const flashNeed = () => {
    setShowAffordError(true);
    window.setTimeout(() => setShowAffordError(false), 800);
  };

  const pathD = hexPath(size);

  const label =
    state === 'fogged' ? '3✨' :
    state === 'revealed' ? '7✨' :
    state === 'restored' ? '12✨' : '';

  return (
    <g>
      {/* Visible tile face (invisible hitbox) */}
      <path d={pathD} fill="transparent" stroke="none" />

      {/* Emoji (only once revealed+) */}
      {state !== 'fogged' && (
        <text
          textAnchor="middle"
          y={6}
          fontSize={18}
          opacity={style.iconOpacity}
          style={{ pointerEvents: 'none' }}
        >
          {biomeEmojis[tile?.biome] || '🌿'}
        </text>
      )}

      {/* Cost hint */}
      {label && (
        <text
          textAnchor="middle"
          y={size + 14}
          fontSize={12}
          fill="#7c5a00"
          opacity={0.9}
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}

      {/* Click target: put on TOP, pointerdown = instant */}
      <path
        d={pathD}
        fill="transparent"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction();
        }}
        style={{ cursor: 'pointer', pointerEvents: 'all', touchAction: 'manipulation' }}
      />

      {/* Need X feedback */}
      <AnimatePresence>
        {showAffordError && (
          <motion.g
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <rect
              x={-34}
              y={-44}
              width={68}
              height={22}
              rx={11}
              fill="#ef4444"
              opacity={0.95}
            />
            <text
              textAnchor="middle"
              y={-28}
              fontSize={12}
              fill="#fff"
              fontWeight="700"
              style={{ pointerEvents: 'none' }}
            >
              Need {state === 'fogged' ? '3✨' : state === 'revealed' ? '7✨' : '12✨'}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}