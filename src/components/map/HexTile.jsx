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

export default function HexTile({ tile, x, y, onScout, onRestore, onBloom, canAfford, size = 60 }) {
  const { state, biome } = tile;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState(null);
  
  const handleClick = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (state === 'fogged' && canAfford.scout) {
      setAnimationType('scout');
      setTimeout(() => {
        onScout(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 500);
      }, 150);
    } else if (state === 'revealed' && canAfford.restore) {
      setAnimationType('restore');
      setTimeout(() => {
        onRestore(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 600);
      }, 150);
    } else if (state === 'restored' && canAfford.bloom) {
      setAnimationType('bloom');
      setTimeout(() => {
        onBloom(tile);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimationType(null);
        }, 800);
      }, 150);
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

  const colors = biomeColors[state];
  const isClickable = 
    (state === 'fogged' && canAfford.scout) ||
    (state === 'revealed' && canAfford.restore) ||
    (state === 'restored' && canAfford.bloom);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Thick felt hex piece with fabric edge */}
      <motion.path
        d={pathData}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={state === 'bloomed' ? 4 : 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isClickable ? "cursor-pointer" : "cursor-not-allowed"}
        onClick={handleClick}
        initial={false}
        animate={{
          scale: isAnimating ? 1.1 : 1,
          opacity: state === 'fogged' ? 0.7 : 1
        }}
        whileHover={isClickable ? { scale: 1.05 } : {}}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          filter: 'url(#feltBevel) drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          paintOrder: 'stroke fill'
        }}
      />
      
      {/* Top highlight (overhead light on felt) */}
      <path
        d={pathData}
        fill="none"
        stroke={colors.innerLight}
        strokeWidth={1.5}
        opacity={state === 'fogged' ? 0.4 : 0.7}
        style={{
          transform: 'scale(0.88) translateY(-2px)',
          transformOrigin: 'center'
        }}
      />

      {/* Soft wool-like fog overlay */}
      <AnimatePresence>
        {state === 'fogged' && (
          <motion.path
            d={pathData}
            fill="#4a5a45"
            opacity={0.4}
            initial={{ opacity: 0.4 }}
            exit={{ 
              opacity: 0,
              scale: 1.15,
              filter: 'blur(8px)'
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ filter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* Soft bloomed glow (organic, not harsh) */}
      {state === 'bloomed' && (
        <>
          <motion.path
            d={pathData}
            fill="url(#warmGlow)"
            opacity={0.25}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'blur(3px)' }}
          />
        </>
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
            <foreignObject x={-8} y={-8} width={16} height={16}>
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

      {/* Soft warm glow gradient (evening light) */}
      <defs>
        <radialGradient id="warmGlow">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}