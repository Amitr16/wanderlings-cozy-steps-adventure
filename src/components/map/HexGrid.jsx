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
      {/* Wooden table texture base */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(251, 191, 36, 0.12) 0%, transparent 55%),
            linear-gradient(135deg, #8b7355 0%, #6b5743 50%, #5a4632 100%)
          `,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.25), inset 0 4px 20px rgba(255,255,255,0.05)'
        }}
      />
      
      {/* Felt mat on table */}
      <div 
        className="absolute inset-8 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% 40%, rgba(251, 191, 36, 0.15) 0%, transparent 65%),
            radial-gradient(circle at 50% 50%, #a8b89d 0%, #8fa585 50%, #76926d 100%)
          `,
          boxShadow: `
            0 8px 24px rgba(0,0,0,0.35),
            inset 0 0 60px rgba(0,0,0,0.08),
            inset 0 -2px 8px rgba(255,255,255,0.1)
          `
        }}
      />

      {/* Subtle moss texture overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 6px),
            repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)
          `
        }}
      />

      {/* Organic terrain patches (soft moss variations) */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
        <div 
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ 
            background: 'radial-gradient(circle, #2d5016 0%, transparent 70%)',
            left: '15%',
            top: '20%'
          }}
        />
        <div 
          className="absolute w-48 h-48 rounded-full blur-3xl opacity-8"
          style={{ 
            background: 'radial-gradient(circle, #1b4d3e 0%, transparent 70%)',
            right: '20%',
            bottom: '25%'
          }}
        />
      </div>

      {/* Ambient floating particles - minimal and slow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xs"
            style={{
              left: `${20 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              filter: 'blur(0.5px)'
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-8, 8, -8],
              opacity: [0.15, 0.35, 0.15],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2
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
        style={{ filter: 'contrast(0.98) saturate(0.95)' }}
      >
        <defs>
          {/* Warm evening village glow */}
          <radialGradient id="villageGlow">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#FCD34D" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          
          {/* Strong elevated piece shadow */}
          <filter id="hexShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
            <feOffset dx="0" dy="6" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.45"/>
            </feComponentTransfer>
            <feFlood floodColor="#1b4332" floodOpacity="0.35"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Soft inner bevel for felt texture */}
          <filter id="feltBevel">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
            <feOffset dx="0" dy="-1" result="topLight"/>
            <feFlood floodColor="white" floodOpacity="0.15"/>
            <feComposite in2="topLight" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Raised village platform with evening warmth */}
        <g transform={`translate(0, 0)`}>
          {/* Large warm glow (campfire ambience) */}
          <circle r={tileSize * 3.2} fill="url(#villageGlow)" opacity="0.4" />
          
          {/* Gentle pulsing glow */}
          <motion.circle
            r={tileSize * 2.2}
            fill="url(#villageGlow)"
            initial={{ opacity: 0.3, scale: 0.95 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.08, 0.95]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Village platform (elevated felt layer) */}
          <circle 
            r={tileSize * 1.4} 
            fill="#FEF3C7" 
            stroke="#F59E0B" 
            strokeWidth={2.5}
            filter="url(#hexShadow)"
            style={{ 
              paintOrder: 'stroke fill',
              strokeLinecap: 'round'
            }}
          />
          
          {/* Soft inner highlight (felt texture) */}
          <circle 
            r={tileSize * 1.35} 
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)" 
            strokeWidth={1.5}
          />
          
          {/* Campfire emoji */}
          <text y={10} textAnchor="middle" className="text-4xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🏕️</text>
        </g>

        {/* Render hex tiles with dramatic layering */}
        {visibleTiles.map((tile) => {
          const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
          
          // Calculate distance from center for perspective
          const distanceFromCenter = Math.sqrt(tile.q * tile.q + tile.r * tile.r);
          
          // Dramatic depth scaling (closer = larger, further = smaller)
          const depthScale = 1 + (3 - distanceFromCenter) * 0.05; // 0.9 to 1.15
          
          // Vertical layering (back tiles lower, front tiles higher)
          const depthY = tile.r * 3; // Push back tiles down
          
          // Lighting (overhead light makes top brighter)
          const brightness = 1 + (3 - tile.r) * 0.08;
          
          return (
            <g 
              key={`${tile.q}_${tile.r}`} 
              filter="url(#hexShadow)"
              style={{
                transform: `translate(0, ${depthY}px) scale(${depthScale})`,
                transformOrigin: `${x}px ${y}px`
              }}
            >
              <g style={{ filter: `brightness(${brightness})` }}>
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
            </g>
          );
        })}
      </svg>
    </div>
  );
}