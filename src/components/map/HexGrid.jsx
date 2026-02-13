import React from 'react';
import { motion } from 'framer-motion';
import HexTile from './HexTile';
import { hexToPixel, hexPath } from './hexUtils';

const getHexRadius = (q, r) =>
  Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));

const isValidTile = (q, r, maxRadius) =>
  getHexRadius(q, r) <= maxRadius;

export default function HexGrid({
  tiles = [],
  currentWeek = 1,
  onScout,
  onRestore,
  onBloom,
  canAfford
}) {
  const tileSize = 34;
  const padding = 60;

  const maxRadius = 2 + currentWeek;
  const visibleTiles = tiles.filter(t =>
    isValidTile(t.q, t.r, maxRadius)
  );

  if (!visibleTiles.length) {
    return (
      <div className="w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-green-100">
        <div className="text-gray-600">No tiles yet</div>
      </div>
    );
  }

  const pts = visibleTiles.map(t =>
    hexToPixel(t.q, t.r, tileSize)
  );

  const minX = Math.min(...pts.map(p => p.x)) - padding;
  const maxX = Math.max(...pts.map(p => p.x)) + padding;
  const minY = Math.min(...pts.map(p => p.y)) - padding;
  const maxY = Math.max(...pts.map(p => p.y)) + padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const maskHexes = visibleTiles
    .filter(tile => tile.state !== 'fogged')
    .map(tile => {
      const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
      return (
        <g key={`mask_${tile.q}_${tile.r}`} transform={`translate(${x}, ${y})`}>
          <path
            d={hexPath(tileSize)}
            fill="black"
          />
        </g>
      );
    });

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl relative">
      {/* Felt background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% 35%, rgba(251,191,36,0.12) 0%, transparent 65%),
            radial-gradient(circle at 50% 50%, #a8b89d 0%, #8fa585 50%, #76926d 100%)
          `,
          boxShadow: `
            inset 0 0 60px rgba(0,0,0,0.06),
            inset 0 -2px 8px rgba(255,255,255,0.08)
          `
        }}
      />

      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ isolation: 'isolate' }}
      >
        {/* MASK */}
        <defs>
          <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b8f5f" />
            <stop offset="50%" stopColor="#7fae6e" />
            <stop offset="100%" stopColor="#5f8a55" />
          </linearGradient>

          <mask id="fogMask">
            {/* Entire area fogged */}
            <rect
              x={minX}
              y={minY}
              width={maxX - minX}
              height={maxY - minY}
              fill="white"
            />

            {/* Reveal cleared tiles with hex shapes */}
            {maskHexes}
          </mask>
        </defs>

        {/* Continuous terrain background */}
        <rect
          x={minX}
          y={minY}
          width={maxX - minX}
          height={maxY - minY}
          fill="url(#terrainGradient)"
        />

        {/* Tiles */}
        {visibleTiles.map(tile => {
          const { x, y } = hexToPixel(tile.q, tile.r, tileSize);

          return (
            <g
              key={tile.id || `${tile.q}_${tile.r}`}
              transform={`translate(${x}, ${y})`}
            >
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

        {/* Fog layer (masked) */}
        <g mask="url(#fogMask)" style={{ pointerEvents: 'none' }}>
          <rect
            x={minX}
            y={minY}
            width={maxX - minX}
            height={maxY - minY}
            fill="#e7efe3"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}