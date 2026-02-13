import React from 'react';
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

export default function HexGrid({ tiles, currentWeek, onScout, onRestore, onBloom, canAfford }) {
  const tileSize = 50;
  const padding = 100;

  // Filter tiles by week unlock
  const maxRadius = 2 + currentWeek; // Week 1 = radius 3, Week 2 = radius 4, etc.
  const visibleTiles = tiles.filter(tile => getHexRadius(tile.q, tile.r) <= maxRadius);

  // Calculate viewBox
  const minX = Math.min(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).x)) - padding;
  const maxX = Math.max(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).x)) + padding;
  const minY = Math.min(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).y)) - padding;
  const maxY = Math.max(...visibleTiles.map(t => hexToPixel(t.q, t.r, tileSize).y)) + padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl">
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        className="min-h-[500px]"
      >
        {/* Village center marker */}
        <g transform={`translate(0, 0)`}>
          <circle r={tileSize * 1.2} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={3} />
          <text y={8} textAnchor="middle" className="text-3xl">🏕️</text>
        </g>

        {visibleTiles.map((tile) => {
          const { x, y } = hexToPixel(tile.q, tile.r, tileSize);
          return (
            <HexTile
              key={`${tile.q}_${tile.r}`}
              tile={tile}
              x={x}
              y={y}
              size={tileSize}
              onScout={onScout}
              onRestore={onRestore}
              onBloom={onBloom}
              canAfford={canAfford}
            />
          );
        })}
      </svg>
    </div>
  );
}