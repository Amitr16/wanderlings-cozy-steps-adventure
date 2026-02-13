import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ScoutParticles, RestoreParticles, BloomParticles, GlowRipple } from './TileParticles';

const biomeEmojis = {
  mosswood: '🌲',
  firefly: '✨',
  brookside: '💧',
  mushroom: '🍄',
  blossom: '🌸',
  pebble: '🪨'
};

// Soft felt color palette with muted, organic tones
const biomeColors = {
  fogged: { 
    fill: '#a8b5a0', 
    stroke: '#6b7566',
    innerLight: 'rgba(255, 255, 255, 0.1)'
  },
  revealed: { 
    fill: '#c8d5bf', 
    stroke: '#8fa989',
    innerLight: 'rgba(255, 255, 255, 0.15)'
  },
  restored: { 
    fill: '#7fbf7a', 
    stroke: '#4a9044',
    innerLight: 'rgba(255, 255, 255, 0.2)'
  },
  bloomed: { 
    fill: '#5da958', 
    stroke: '#2f6b2a',
    innerLight: 'rgba(255, 255, 255, 0.25)'
  }
};

export default function HexTile({ tile, x, y, onScout, onRestore, onBloom, canAfford, size = 60, elevation = 0 }) {
  // Normalize state to lowercase for robust matching
  const state = String(tile.state || 'fogged').toLowerCase();
  const { biome } = tile;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState(null);
  const [showAffordError, setShowAffordError] = useState(false);
  
  const handleClick = async () => {
    console.log('CLICK HANDLER', tile.q, tile.r, 'state:', state, 'canAfford:', canAfford);
    if (isAnimating) {
      console.log('Already animating, skipping');
      return;
    }
    
    if (state === 'fogged') {
      console.log('State is fogged, checking afford:', canAfford.scout);
      if (canAfford.scout) {
        console.log('Can afford! Starting scout animation');
        setIsAnimating(true);
        setAnimationType('scout');
        setTimeout(() => {
          console.log('Calling onScout with tile:', tile);
          onScout(tile);
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationType(null);
          }, 500);
        }, 150);
      } else {
        console.log('Cannot afford scout, showing error');
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    } else if (state === 'revealed') {
      if (canAfford.restore) {
        setIsAnimating(true);
        setAnimationType('restore');
        setTimeout(() => {
          onRestore(tile);
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationType(null);
          }, 600);
        }, 150);
      } else {
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    } else if (state === 'restored') {
      if (canAfford.bloom) {
        setIsAnimating(true);
        setAnimationType('bloom');
        setTimeout(() => {
          onBloom(tile);
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationType(null);
          }, 800);
        }, 150);
      } else {
        setShowAffordError(true);
        setTimeout(() => setShowAffordError(false), 1000);
      }
    }
  };

  // Create rounded hexagon path (softer felt edges)
  const points = [];
  const cornerRadius = 4;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const nextAngle = (Math.PI / 3) * (i + 1) - Math.PI / 2;
    
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    const nextPx = size * Math.cos(nextAngle);
    const nextPy = size * Math.sin(nextAngle);
    
    // Calculate control points for rounded corners
    const dx = nextPx - px;
    const dy = nextPy - py;
    const length = Math.sqrt(dx * dx + dy * dy);
    const ratio = cornerRadius / length;
    
    points.push({
      start: { x: px + dx * ratio, y: py + dy * ratio },
      end: { x: nextPx - dx * ratio, y: nextPy - dy * ratio },
      corner: { x: nextPx, y: nextPy }
    });
  }
  
  // Build path with rounded corners
  const pathData = points.map((p, i) => {
    if (i === 0) {
      return `M ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
    }
    return `Q ${points[i-1].corner.x},${points[i-1].corner.y} ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
  }).join(' ') + ` Q ${points[points.length-1].corner.x},${points[points.length-1].corner.y} ${points[0].start.x},${points[0].start.y} Z`;

  const colors = biomeColors[state] ?? biomeColors.fogged;
  const isClickable = state === 'fogged' || state === 'revealed' || state === 'restored';

  const largerSize = size * 1.8; // Much larger for aggressive overlap
  
  // Larger hex path for overlap
  const largerPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const nextAngle = (Math.PI / 3) * (i + 1) - Math.PI / 2;
    
    const px = largerSize * Math.cos(angle);
    const py = largerSize * Math.sin(angle);
    const nextPx = largerSize * Math.cos(nextAngle);
    const nextPy = largerSize * Math.sin(nextAngle);
    
    const dx = nextPx - px;
    const dy = nextPy - py;
    const length = Math.sqrt(dx * dx + dy * dy);
    const ratio = cornerRadius / length;
    
    largerPoints.push({
      start: { x: px + dx * ratio, y: py + dy * ratio },
      end: { x: nextPx - dx * ratio, y: nextPy - dy * ratio },
      corner: { x: nextPx, y: nextPy }
    });
  }
  
  const largerPathData = largerPoints.map((p, i) => {
    if (i === 0) {
      return `M ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
    }
    return `Q ${largerPoints[i-1].corner.x},${largerPoints[i-1].corner.y} ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
  }).join(' ') + ` Q ${largerPoints[largerPoints.length-1].corner.x},${largerPoints[largerPoints.length-1].corner.y} ${largerPoints[0].start.x},${largerPoints[0].start.y} Z`;

  return (
    <g transform={`translate(${x}, ${y})`} style={{ isolation: 'isolate' }}>
      {/* Click target ALWAYS on top */}
      <circle
        r={size * 1.05}
        fill="transparent"
        stroke="none"
        className="cursor-pointer"
        onClick={handleClick}
        style={{ pointerEvents: 'all' }}
      />
      
      <g style={{ pointerEvents: 'none' }}>
        {/* Hover highlight */}
        {isClickable && (
          <motion.circle
            r={size * 0.85}
            fill="transparent"
            stroke="transparent"
            strokeWidth={0}
            whileHover={{ 
              fill: 'rgba(255, 255, 255, 0.12)',
              stroke: 'rgba(255, 255, 255, 0.25)',
              strokeWidth: 2
            }}
            transition={{ duration: 0.2 }}
          />
        )}



      {/* Bloomed glow */}
      {state === 'bloomed' && (
        <motion.circle
          cx={0}
          cy={0}
          r={size * 0.9}
          fill="url(#warmGlow)"
          opacity={0.35}
          animate={{
            opacity: [0.25, 0.45, 0.25],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'blur(8px)', pointerEvents: 'none' }}
        />
      )}

      {/* Content based on state */}
      <AnimatePresence mode="wait">
        {state === 'fogged' && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <foreignObject x={-8} y={-8} width={16} height={16} style={{ pointerEvents: 'none' }}>
              <Lock className="text-gray-600 w-4 h-4" />
            </foreignObject>
            {canAfford.scout && (
              <motion.text 
                y={20} 
                textAnchor="middle" 
                className="text-xs fill-amber-600 font-bold"
                animate={{ y: [20, 18, 20] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                3✨
              </motion.text>
            )}
          </motion.g>
        )}
        
        {state === 'revealed' && (
          <motion.g
            initial={{ opacity: 0, scale: 0, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "backOut" }}
          >
            <text y={8} textAnchor="middle" className="text-2xl">
              {biomeEmojis[biome]}
            </text>
            {canAfford.restore && (
              <motion.text 
                y={25} 
                textAnchor="middle" 
                className="text-xs fill-green-600 font-bold"
                animate={{ y: [25, 23, 25] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                7✨
              </motion.text>
            )}
          </motion.g>
        )}
        
        {(state === 'restored' || state === 'bloomed') && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: state === 'bloomed' ? [1, 1.15, 1] : 1,
              rotate: state === 'bloomed' ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              scale: { duration: 2, repeat: state === 'bloomed' ? Infinity : 0 },
              rotate: { duration: 3, repeat: state === 'bloomed' ? Infinity : 0 }
            }}
          >
            <text 
              y={8} 
              textAnchor="middle" 
              className={state === 'bloomed' ? 'text-3xl' : 'text-2xl'}
            >
              {biomeEmojis[biome]}
            </text>
          </motion.g>
        )}

        {state === 'restored' && canAfford.bloom && (
          <motion.text 
            y={25} 
            textAnchor="middle" 
            className="text-xs fill-purple-600 font-bold"
            animate={{ y: [25, 23, 25], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            12✨
          </motion.text>
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {animationType === 'scout' && <ScoutParticles x={0} y={0} size={size} />}
        {animationType === 'restore' && <RestoreParticles x={0} y={0} size={size} />}
        {animationType === 'bloom' && <BloomParticles x={0} y={0} size={size} />}
        {animationType === 'restore' && <GlowRipple x={0} y={0} size={size} color="#10B981" />}
        {animationType === 'bloom' && <GlowRipple x={0} y={0} size={size} color="#8B5CF6" />}
      </AnimatePresence>

      {/* Affordability Error Feedback */}
      <AnimatePresence>
        {showAffordError && (
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <motion.g
              animate={{ x: [-2, 2, -2, 2, 0] }}
              transition={{ duration: 0.4 }}
            >
              <rect
                x={-30}
                y={-35}
                width={60}
                height={20}
                rx={10}
                fill="#ef4444"
                opacity={0.95}
              />
              <text
                y={-22}
                textAnchor="middle"
                className="text-xs fill-white font-bold"
              >
                Need {state === 'fogged' ? '3' : state === 'revealed' ? '7' : '12'}✨
              </text>
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
      </g>

      {/* Click target ALWAYS on top */}
      <circle
        r={size * 1.05}
        fill="transparent"
        stroke="none"
        className="cursor-pointer"
        onClick={handleClick}
        style={{ pointerEvents: 'all' }}
      />

    </g>
  );
}