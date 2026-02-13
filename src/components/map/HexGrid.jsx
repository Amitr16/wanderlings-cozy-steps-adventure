import React from 'react';
import { motion } from 'framer-motion';
import HexTile from './HexTile';

// Hex grid utilities
const hexToPixel = (q, r, size) => {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
};

const getHexRadius = (q, r) => {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
};

// Handcrafted island mask - defines organic boundary
const isValidTile = (q, r, maxRadius) => {
  const radius = getHexRadius(q, r);
  if (radius > maxRadius) return false;
  
  // Create irregular coastline by removing specific edge tiles
  if (radius === maxRadius) {
    // Remove some outer tiles to create organic shape
    if ((q === maxRadius && r === 0) || 
        (q === 0 && r === maxRadius) ||
        (q === -maxRadius && r === maxRadius)) {
      return false;
    }
  }
  
  // Remove corner pockets for more natural shape
  if (radius === maxRadius - 1) {
    if ((q === maxRadius - 1 && r === 1) || 
        (q === 1 && r === maxRadius - 1)) {
      return false;
    }
  }
  
  return true;
};

export default function HexGrid({ tiles, currentWeek, onScout, onRestore, onBloom, canAfford }) {
  const tileSize = 50;
  const padding = 100;

  // Filter tiles by week unlock AND island mask
  const maxRadius = 2 + currentWeek;
  const visibleTiles = tiles.filter(tile => 
    getHexRadius(tile.q, tile.r) <= maxRadius && 
    isValidTile(tile.q, tile.r, maxRadius)
  );

  // Calculate viewBox
  const minX = Math.min(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).x)) - padding;
  const maxX = Math.max(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).x)) + padding;
  const minY = Math.min(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).y)) - padding;
  const maxY = Math.max(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).y)) + padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="w-full h-full overflow-auto rounded-2xl relative">
      {/* Background terrain texture */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(52, 211, 153, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
            linear-gradient(to bottom, #f0fdf4 0%, #d1fae5 50%, #a7f3d0 100%)
          `,
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.08)'
        }}
      />

      {/* Ambient floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs opacity-40"
            style={{
              left: `${15 + i * 12}%`,
              top: `${10 + (i % 4) * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 360]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        className="min-h-[500px] relative z-10"
      >
        <defs>
          {/* Village radial glow gradient */}
          <radialGradient id="villageGlow">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
          </radialGradient>
          
          {/* Drop shadow for depth */}
          <filter id="hexShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Village center with radial glow */}
        <g transform={`translate(0, 0)`}>
          {/* Outer glow ring */}
          <circle r={tileSize * 2.5} fill="url(#villageGlow)" opacity="0.6" />
          
          {/* Pulsing glow animation */}
          <motion.circle
            r={tileSize * 1.8}
            fill="url(#villageGlow)"
            initial={{ opacity: 0.4, scale: 0.9 }}
            animate={{ 
              opacity: [0.4, 0.7, 0.4],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Village marker */}
          <circle r={tileSize * 1.3} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3} />
          <text y={10} textAnchor="middle" className="text-4xl">🏕️</text>
        </g>

        {/* Render hex tiles with shadow filter */}
        {visibleTiles.map((tile) => {
          const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
          return (
            <g key={`${tile.q}_${tile.r}`} filter="url(#hexShadow)">
              <HexTile
                tile={tile}
                x={x}
                y={y}
                size={tileSize}
                onScout={onScout}
                onRestore={onRestore}
                onBloom={onBloom}
                canAfford={canAfford}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}