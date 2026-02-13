import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Eye } from 'lucide-react';

const biomeEmojis = {
  mosswood: '🌲',
  firefly: '✨',
  brookside: '💧',
  mushroom: '🍄',
  blossom: '🌸',
  pebble: '🪨'
};

const biomeNames = {
  mosswood: 'Mosswood Grove',
  firefly: 'Firefly Glade',
  brookside: 'Brookside Path',
  mushroom: 'Mushroom Hollow',
  blossom: 'Blossom Hill',
  pebble: 'Pebble Bridge'
};

export default function HexTile({ tile, x, y, onScout, onRestore, onBloom, canAfford, size = 60 }) {
  const { state, biome } = tile;
  
  const handleClick = () => {
    if (state === 'fogged' && canAfford.scout) onScout(tile);
    else if (state === 'revealed' && canAfford.restore) onRestore(tile);
    else if (state === 'restored' && canAfford.bloom) onBloom(tile);
  };

  const getColor = () => {
    if (state === 'fogged') return '#9CA3AF';
    if (state === 'revealed') return '#D1D5DB';
    if (state === 'restored') return '#86EFAC';
    if (state === 'bloomed') return '#4ADE80';
  };

  const getCost = () => {
    if (state === 'fogged') return '3';
    if (state === 'revealed') return '7';
    if (state === 'restored') return '12';
    return null;
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

  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.path
        d={pathData}
        fill={getColor()}
        stroke={state === 'fogged' ? '#6B7280' : '#10B981'}
        strokeWidth={state === 'bloomed' ? 3 : 2}
        className="cursor-pointer"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
      
      {state === 'fogged' && (
        <g>
          <Lock x={-8} y={-8} width={16} height={16} className="text-gray-600" />
          {canAfford.scout && (
            <text y={20} textAnchor="middle" className="text-xs fill-amber-600 font-bold">
              {getCost()}✨
            </text>
          )}
        </g>
      )}
      
      {state === 'revealed' && (
        <g>
          <text y={8} textAnchor="middle" className="text-2xl">
            {biomeEmojis[biome]}
          </text>
          {canAfford.restore && (
            <text y={25} textAnchor="middle" className="text-xs fill-amber-600 font-bold">
              {getCost()}✨
            </text>
          )}
        </g>
      )}
      
      {(state === 'restored' || state === 'bloomed') && (
        <g>
          <text y={8} textAnchor="middle" className={state === 'bloomed' ? 'text-3xl' : 'text-2xl'}>
            {biomeEmojis[biome]}
          </text>
          {state === 'bloomed' && (
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles x={15} y={-15} width={12} height={12} className="text-amber-400" />
            </motion.g>
          )}
          {state === 'restored' && canAfford.bloom && (
            <text y={25} textAnchor="middle" className="text-xs fill-purple-600 font-bold">
              {getCost()}✨
            </text>
          )}
        </g>
      )}
    </g>
  );
}