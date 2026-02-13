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
    <div className="w-full h-full overflow-auto rounded-2xl relative bg-gradient-to-br from-green-100 via-emerald-50 to-green-100">
      
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
          
          {/* Bloom glow (moved from tiles) */}
          <radialGradient id="warmGlow">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>
          
          {/* Elevation-based shadow (softened) */}
          <filter id="elevationShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feFlood floodColor="#1b4332" floodOpacity="0.25"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Hex shadow for village */}
          <filter id="hexShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Cliff gradient */}
          <linearGradient id="cliffGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a7052" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#3d4d37" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Unified continuous terrain base - single landmass */}
        <g>
          {/* Deep blur base for seamless blending */}
          {visibleTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const elevation = getTileElevation(tile.q, tile.r);
            const elevationOffset = -elevation * 4;
            
            const normalizedState = String(tile.state || '').toLowerCase();
            const baseColor = normalizedState === 'fogged' ? '#6b7566' :
                             normalizedState === 'revealed' ? '#d4e5cf' :
                             normalizedState === 'restored' ? '#7fc57a' : '#5db958';
            
            return (
              <circle
                key={`base_${tile.q}_${tile.r}`}
                cx={x}
                cy={y + elevationOffset}
                r={tileSize * 0.9}
                fill={baseColor}
                opacity={0.8}
                style={{ filter: 'blur(18px)' }}
              />
            );
          })}
          
          {/* Mid-layer for color definition */}
          {visibleTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const elevation = getTileElevation(tile.q, tile.r);
            const elevationOffset = -elevation * 4;
            
            const normalizedState = String(tile.state || '').toLowerCase();
            const midColor = normalizedState === 'fogged' ? '#7a8575' :
                            normalizedState === 'revealed' ? '#e0f0da' :
                            normalizedState === 'restored' ? '#8ad085' : '#6ac465';
            
            return (
              <circle
                key={`mid_${tile.q}_${tile.r}`}
                cx={x}
                cy={y + elevationOffset}
                r={tileSize * 0.75}
                fill={midColor}
                opacity={0.85}
                style={{ filter: 'blur(10px)' }}
              />
            );
          })}
          
          {/* Top layer for surface detail */}
          {visibleTiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const elevation = getTileElevation(tile.q, tile.r);
            const elevationOffset = -elevation * 4;
            
            const normalizedState = String(tile.state || '').toLowerCase();
            const topColor = normalizedState === 'fogged' ? '#8a9585' :
                            normalizedState === 'revealed' ? '#f0f9ec' :
                            normalizedState === 'restored' ? '#95db8f' : '#7ed078';
            
            return (
              <circle
                key={`top_${tile.q}_${tile.r}`}
                cx={x}
                cy={y + elevationOffset}
                r={tileSize * 0.6}
                fill={topColor}
                opacity={0.9}
                style={{ filter: 'blur(5px)' }}
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

        {/* Render by elevation (bottom to top) with cliff faces */}
        {elevationLevels.map((elevation) => (
          <g key={`elevation_${elevation}`}>
            {tilesByElevation[elevation].map((tile) => {
              const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
              const elevationOffset = -elevation * 4; // Y-offset for real 3D
              
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
                  {/* Cliff faces where height drops */}
                  {neighbors.map((n, idx) => {
                    const neighborTile = visibleTiles.find(t => t.q === n.q && t.r === n.r);
                    const neighborElevation = neighborTile ? getTileElevation(n.q, n.r) : 0;
                    const heightDiff = elevation - neighborElevation;
                    
                    if (heightDiff >= 2) {
                      const edgeX = x + Math.cos(n.angle) * tileSize * 0.65;
                      const edgeY = y + Math.sin(n.angle) * tileSize * 0.65 + elevationOffset;
                      const cliffHeight = heightDiff * 4;
                      
                      return (
                        <g key={`cliff_${idx}`}>
                          {/* Vertical cliff wall */}
                          <rect
                            x={edgeX - 30}
                            y={edgeY}
                            width="60"
                            height={cliffHeight}
                            fill="url(#cliffGradient)"
                            opacity="0.9"
                            rx="3"
                          />
                          {/* Base shadow */}
                          <ellipse
                            cx={edgeX}
                            cy={edgeY + cliffHeight}
                            rx="32"
                            ry="8"
                            fill="#1b4332"
                            opacity="0.5"
                            style={{ filter: 'blur(4px)' }}
                          />
                        </g>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Interactive tile layer with Y-offset */}
                  <g
                    transform={`translate(${x}, ${y + elevationOffset})`}
                    filter="url(#elevationShadow)"
                  >
                    <HexTile
                      tile={tile}
                      x={0}
                      y={0}
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
        
        {/* Large props spanning multiple tiles (only show in restored areas) */}
        <g opacity="0.85">
          {/* Ancient tree cluster (elevated, northwest) */}
          {visibleTiles.some(t => {
            const s = String(t.state || '').toLowerCase();
            return t.q <= -1 && t.r <= 0 && (s === 'restored' || s === 'bloomed');
          }) && (
            <g transform="translate(-100, -120)">
              <ellipse cx="0" cy="20" rx="90" ry="22" fill="#1b4332" opacity="0.5" style={{ filter: 'blur(6px)' }} />
              <text fontSize="70" y="-15">🌲</text>
              <text fontSize="58" x="60" y="-40">🌲</text>
              <text fontSize="62" x="-70" y="5">🌲</text>
              <text fontSize="52" x="25" y="25">🌳</text>
              <text fontSize="48" x="-35" y="-25">🌲</text>
            </g>
          )}
          
          {/* Boulder field (south) */}
          {visibleTiles.some(t => {
            const s = String(t.state || '').toLowerCase();
            return t.r >= 2 && (s === 'restored' || s === 'bloomed');
          }) && (
            <g transform="translate(-30, 140)">
              <ellipse cx="0" cy="18" rx="85" ry="20" fill="#1b4332" opacity="0.55" style={{ filter: 'blur(5px)' }} />
              <text fontSize="76" y="0">🪨</text>
              <text fontSize="62" x="65" y="15">🪨</text>
              <text fontSize="54" x="-60" y="20">🪨</text>
              <text fontSize="48" x="20" y="-10">🪨</text>
            </g>
          )}
          
          {/* Mushroom grove (northeast) */}
          {visibleTiles.some(t => {
            const s = String(t.state || '').toLowerCase();
            return t.q >= 1 && t.r <= -1 && (s === 'restored' || s === 'bloomed');
          }) && (
            <g transform="translate(110, 50)">
              <ellipse cx="0" cy="15" rx="70" ry="18" fill="#2d3a28" opacity="0.45" style={{ filter: 'blur(4px)' }} />
              <text fontSize="44" x="-40" y="0">🍄</text>
              <text fontSize="38" x="30" y="-12">🍄</text>
              <text fontSize="36" x="8" y="22">🍄</text>
              <text fontSize="40" x="-18" y="28">🍄</text>
            </g>
          )}
        </g>
        
        {/* Heavy fog layer ON TOP (covers everything) */}
        <g style={{ pointerEvents: 'none' }}>
          {visibleTiles.filter(t => String(t.state || '').toLowerCase() === 'fogged').map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
            const elevation = getTileElevation(tile.q, tile.r);
            const elevationOffset = -elevation * 4;
            
            return (
              <g key={`fog_${tile.q}_${tile.r}`}>
                <circle
                  cx={x}
                  cy={y + elevationOffset}
                  r={tileSize * 1.05}
                  fill="#2a3228"
                  opacity={0.25}
                  style={{ filter: 'blur(10px)' }}
                />
                <circle
                  cx={x}
                  cy={y + elevationOffset}
                  r={tileSize * 0.75}
                  fill="#1f251e"
                  opacity={0.18}
                  style={{ filter: 'blur(6px)' }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}