import React from 'react';
import { motion } from 'framer-motion';
import HexTile from './HexTile';
import { hexToPixel } from './hexUtils';

const getHexRadius = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));

// Keep your island mask minimal for now
const isValidTile = (q, r, maxRadius) => getHexRadius(q, r) <= maxRadius;

export default function HexGrid({ tiles = [], currentWeek = 1, onScout, onRestore, onBloom, canAfford }) {
  // ONE source of truth for geometry:
  const tileSize = 34;
  const padding = 60;

  const maxRadius = 2 + currentWeek;
  const visibleTiles = tiles.filter(t => isValidTile(t.q, t.r, maxRadius));

  // Handle empty
  if (!visibleTiles.length) {
    return (
      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-green-100">
        <div className="text-gray-600">No tiles yet</div>
      </div>
    );
  }

  const pts = visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize));
  const minX = Math.min(...pts.map(p => p.x)) - padding;
  const maxX = Math.max(...pts.map(p => p.x)) + padding;
  const minY = Math.min(...pts.map(p => p.y)) - padding;
  const maxY = Math.max(...pts.map(p => p.y)) + padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl relative">
      {/* Felt background (keep it) */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% 35%, rgba(251, 191, 36, 0.12) 0%, transparent 65%),
            radial-gradient(circle at 50% 50%, #a8b89d 0%, #8fa585 50%, #76926d 100%)
          `,
          boxShadow: `
            inset 0 0 60px rgba(0,0,0,0.06),
            inset 0 -2px 8px rgba(255,255,255,0.08)
          `
        }}
      />
      {/* Moss texture */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 6px),
            repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 6px)
          `
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10"
        style={{ isolation: "isolate" }}
      >
        {/* Tiny ambient particles */}
        {[...Array(5)].map((_, i) => (
          <motion.text
            key={i}
            x={minX + (i + 1) * ((maxX - minX) / 6)}
            y={minY + (i % 2 ? 60 : 120)}
            fontSize="10"
            opacity="0.15"
            animate={{ opacity: [0.08, 0.2, 0.08], y: [0, -8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
            style={{ pointerEvents: 'none' }}
          >
            ✨
          </motion.text>
        ))}

        {/* Global fog overlay */}
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={minX}
            y={minY}
            width={maxX - minX}
            height={maxY - minY}
            fill="#e7efe3"
            opacity="0.9"
          />
        </g>

        {/* Tiles */}
        {visibleTiles.map((tile) => {
          const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
          const isCleared = tile.state !== 'fogged';

          return (
            <g key={tile.id || `${tile.q}_${tile.r}`} transform={`translate(${x}, ${y})`}>

              {/* Expanding reveal animation */}
              {isCleared && (
                <motion.circle
                  r={0}
                  fill="#000"
                  initial={{ r: 0 }}
                  animate={{ r: tileSize * 1.6 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    mixBlendMode: "destination-out",
                    pointerEvents: "none"
                  }}
                />
              )}

              <HexTile
                tile={tile}
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