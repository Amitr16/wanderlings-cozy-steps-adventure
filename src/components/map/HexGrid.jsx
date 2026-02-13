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
  const tileSize = 55; // Slightly larger for more overlap
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
          
          {/* Tile blur filter for blending */}
          <filter id="tileBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
          </filter>
        </defs>
        
        {/* Massive continuous terrain base (no gaps) */}
        <g opacity="0.8">
          {visibleTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const elevation = getTileElevation(tile.q, tile.r);
            const elevationOffset = -elevation * 3;
            
            return (
              <g key={`terrain_${tile.q}_${tile.r}`}>
                {/* Ultra-large blurred base */}
                <circle
                  cx={x}
                  cy={y + elevationOffset}
                  r={tileSize * 2.5}
                  fill="#8fa585"
                  opacity={0.7}
                  style={{ filter: 'blur(35px)' }}
                />
                <circle
                  cx={x}
                  cy={y + elevationOffset}
                  r={tileSize * 1.8}
                  fill="#8fa585"
                  opacity={0.6}
                  style={{ filter: 'blur(22px)' }}
                />
                <circle
                  cx={x}
                  cy={y + elevationOffset}
                  r={tileSize * 1.3}
                  fill="#8fa585"
                  opacity={0.5}
                  style={{ filter: 'blur(12px)' }}
                />
              </g>
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

        {/* Render by elevation (bottom to top) with cliff faces */}
        {elevationLevels.map((elevation) => (
          <g key={`elevation_${elevation}`}>
            {tilesByElevation[elevation].map((tile) => {
              const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
              const elevationOffset = -elevation * 3; // Stronger height
              
              // Check all neighbors for cliff faces
              const neighbors = [
                { q: tile.q + 1, r: tile.r, angle: 0 },
                { q: tile.q + 1, r: tile.r - 1, angle: Math.PI / 3 },
                { q: tile.q, r: tile.r - 1, angle: 2 * Math.PI / 3 },
                { q: tile.q - 1, r: tile.r, angle: Math.PI },
                { q: tile.q - 1, r: tile.r + 1, angle: 4 * Math.PI / 3 },
                { q: tile.q, r: tile.r + 1, angle: 5 * Math.PI / 3 }
              ];
              
              return (
                <g key={`${tile.q}_${tile.r}`}>
                  {/* Render cliff faces for elevation differences */}
                  {neighbors.map((n, idx) => {
                    const neighborTile = visibleTiles.find(t => t.q === n.q && t.r === n.r);
                    const neighborElevation = neighborTile ? getTileElevation(n.q, n.r) : 0;
                    const heightDiff = elevation - neighborElevation;
                    
                    if (heightDiff >= 3) {
                      const edgeX = x + Math.cos(n.angle) * tileSize * 0.7;
                      const edgeY = y + Math.sin(n.angle) * tileSize * 0.7 + elevationOffset;
                      
                      return (
                        <g key={`cliff_${idx}`}>
                          {/* Vertical cliff face */}
                          <rect
                            x={edgeX - 25}
                            y={edgeY}
                            width="50"
                            height={heightDiff * 3}
                            fill="url(#cliffGradient)"
                            opacity="0.85"
                            rx="2"
                          />
                          {/* Shadow at cliff base */}
                          <ellipse
                            cx={edgeX}
                            cy={edgeY + heightDiff * 3}
                            rx="28"
                            ry="6"
                            fill="#1b4332"
                            opacity="0.4"
                          />
                        </g>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Tile surface */}
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
        
        {/* Massive overlapping terrain features (break grid dominance) */}
        <g opacity="0.75" filter="url(#elevationShadow)">
          {/* Ancient tree forest (spans 5+ tiles) */}
          <g transform="translate(-80, -100)">
            <ellipse cx="0" cy="15" rx="80" ry="20" fill="#2d3a28" opacity="0.6" />
            <text fontSize="64" y="-10">🌲</text>
            <text fontSize="52" x="50" y="-35">🌲</text>
            <text fontSize="58" x="-60" y="10">🌲</text>
            <text fontSize="48" x="20" y="20">🌳</text>
            <text fontSize="44" x="-30" y="-20">🌲</text>
          </g>
          
          {/* Mushroom grove expansion */}
          <g transform="translate(90, 60)">
            <ellipse cx="0" cy="12" rx="60" ry="18" fill="#3d4d37" opacity="0.5" />
            <text fontSize="40" x="-35" y="0">🍄</text>
            <text fontSize="36" x="25" y="-10">🍄</text>
            <text fontSize="32" x="5" y="18">🍄</text>
            <text fontSize="38" x="-15" y="25">🍄</text>
          </g>
          
          {/* Rocky outcrop cluster */}
          <g transform="translate(-40, 110)">
            <ellipse cx="0" cy="12" rx="70" ry="18" fill="#1b4332" opacity="0.6" />
            <text fontSize="72" y="0">🪨</text>
            <text fontSize="56" x="55" y="10">🪨</text>
            <text fontSize="48" x="-50" y="15">🪨</text>
          </g>
          
          {/* Scattered wildflowers */}
          <g transform="translate(50, -50)">
            <text fontSize="28" x="0" y="0">🌼</text>
            <text fontSize="24" x="30" y="15">🌸</text>
            <text fontSize="26" x="-25" y="10">🌺</text>
          </g>
        </g>
        
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