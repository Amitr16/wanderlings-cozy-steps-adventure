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

// Handcrafted irregular island mask
const isValidTile = (q, r, maxRadius) => {
  const radius = getHexRadius(q, r);
  if (radius > maxRadius) return false;
  
  // Asymmetric cutouts for natural silhouette
  if (radius === maxRadius) {
    if ((q === maxRadius && r === 0) || 
        (q === 0 && r === maxRadius) ||
        (q === -maxRadius && r === maxRadius) ||
        (q === maxRadius && r === -maxRadius)) {
      return false;
    }
  }
  
  if (radius === maxRadius - 1) {
    if ((q === maxRadius - 1 && r === 1) || 
        (q === 1 && r === maxRadius - 1) ||
        (q === -2 && r === maxRadius)) {
      return false;
    }
  }
  
  // Create valley (lower area on one side)
  if (q === -maxRadius + 1 && Math.abs(r) <= 1) return false;
  
  return true;
};

// Assign elevation to tiles (height variation)
const getTileElevation = (q, r) => {
  const radius = getHexRadius(q, r);
  
  // Village is highest
  if (q === 0 && r === 0) return 12;
  
  // Inner ring elevated
  if (radius === 1) return 8;
  
  // Create elevated cluster (northwest)
  if (q <= -1 && r <= 0 && radius <= 2) return 6;
  
  // Random small hills
  if ((q === 2 && r === 1) || (q === 1 && r === 2)) return 4;
  
  // Most tiles at base level
  if (radius <= 2) return 2;
  
  return 0;
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

  // Group tiles by elevation for layered rendering
  const tilesByElevation = visibleTiles.reduce((acc, tile) => {
    const elevation = getTileElevation(tile.q, tile.r);
    if (!acc[elevation]) acc[elevation] = [];
    acc[elevation].push({ ...tile, elevation });
    return acc;
  }, {});
  
  const elevationLevels = Object.keys(tilesByElevation).map(Number).sort((a, b) => a - b);

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
          
          {/* Elevation-based shadow (stronger) */}
          <filter id="elevationShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12"/>
            <feOffset dx="-2" dy="8" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6"/>
            </feComponentTransfer>
            <feFlood floodColor="#1b4332" floodOpacity="0.5"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Terrain texture patterns */}
          <pattern id="mossTexture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.5" fill="rgba(80,100,70,0.15)"/>
            <circle cx="6" cy="5" r="0.5" fill="rgba(60,80,50,0.1)"/>
          </pattern>
        </defs>
        
        {/* Continuous terrain base (blended surface) */}
        <g opacity="0.3">
          {visibleTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 2;
              const px = x + tileSize * 1.1 * Math.cos(angle);
              const py = y + tileSize * 1.1 * Math.sin(angle);
              points.push(`${px},${py}`);
            }
            return (
              <path
                key={`terrain_${tile.q}_${tile.r}`}
                d={`M ${points.join(' L ')} Z`}
                fill="url(#mossTexture)"
                opacity="0.4"
              />
            );
          })}
        </g>

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

        {/* Render by elevation (bottom to top) */}
        {elevationLevels.map((elevation) => (
          <g key={`elevation_${elevation}`}>
            {tilesByElevation[elevation].map((tile) => {
              const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
              const elevationOffset = -elevation * 2; // Negative = higher visual position
              
              // Check neighbors for cliff rendering
              const neighbors = [
                { q: tile.q + 1, r: tile.r },
                { q: tile.q - 1, r: tile.r },
                { q: tile.q, r: tile.r + 1 },
                { q: tile.q, r: tile.r - 1 },
                { q: tile.q + 1, r: tile.r - 1 },
                { q: tile.q - 1, r: tile.r + 1 }
              ];
              
              const cliffEdges = neighbors.filter(n => {
                const neighborTile = visibleTiles.find(t => t.q === n.q && t.r === n.r);
                if (!neighborTile) return false;
                const neighborElevation = getTileElevation(n.q, n.r);
                return elevation - neighborElevation >= 4; // Cliff threshold
              });
              
              return (
                <g key={`${tile.q}_${tile.r}`}>
                  {/* Cliff faces (vertical sides) */}
                  {cliffEdges.map((edge, idx) => {
                    const angle = Math.atan2(edge.r - tile.r, edge.q - tile.q);
                    const cliffX = x + Math.cos(angle) * tileSize * 0.8;
                    const cliffY = y + Math.sin(angle) * tileSize * 0.8 + elevationOffset;
                    
                    return (
                      <rect
                        key={`cliff_${idx}`}
                        x={cliffX - 20}
                        y={cliffY}
                        width="40"
                        height={elevation}
                        fill="url(#cliffGradient)"
                        opacity="0.7"
                      />
                    );
                  })}
                  
                  {/* Tile with elevation */}
                  <g 
                    filter="url(#elevationShadow)"
                    style={{
                      transform: `translateY(${elevationOffset}px)`
                    }}
                  >
                    <HexTile
                      tile={tile}
                      x={x}
                      y={y}
                      size={tileSize}
                      onScout={onScout}
                      onRestore={onRestore}
                      onBloom={onBloom}
                      canAfford={canAfford}
                      elevation={elevation}
                    />
                  </g>
                </g>
              );
            })}
          </g>
        ))}
        
        {/* Cliff gradient */}
        <defs>
          <linearGradient id="cliffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a7052" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3d4d37" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}