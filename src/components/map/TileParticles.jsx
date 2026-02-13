import React from 'react';
import { motion } from 'framer-motion';

export function ScoutParticles({ x, y, size }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8;
    return {
      id: i,
      dx: Math.cos(angle) * size * 1.5,
      dy: Math.sin(angle) * size * 1.5
    };
  });

  return (
    <g>
      {particles.map(p => (
        <motion.circle
          key={p.id}
          cx={x}
          cy={y}
          r={3}
          fill="#D1D5DB"
          initial={{ opacity: 0.8, scale: 0 }}
          animate={{ 
            opacity: 0,
            scale: 1,
            x: p.dx,
            y: p.dy
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

export function RestoreParticles({ x, y, size, color = '#86EFAC' }) {
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
    const distance = size * (0.6 + Math.random() * 0.6);
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 20,
      delay: i * 0.03
    };
  });

  return (
    <g>
      {sparkles.map(s => (
        <motion.g key={s.id}>
          <motion.circle
            cx={x}
            cy={y}
            r={2}
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              x: s.dx,
              y: s.dy,
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 0.8,
              delay: s.delay,
              ease: "easeOut"
            }}
          />
          <motion.text
            x={x}
            y={y}
            textAnchor="middle"
            className="text-xs"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: s.dy * 0.7,
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 0.6,
              delay: s.delay + 0.1,
              ease: "easeOut"
            }}
          >
            ✨
          </motion.text>
        </motion.g>
      ))}
    </g>
  );
}

export function BloomParticles({ x, y, size }) {
  const burstCount = 20;
  const particles = Array.from({ length: burstCount }, (_, i) => {
    const angle = (Math.PI * 2 * i) / burstCount;
    const distance = size * (1 + Math.random() * 0.8);
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 30,
      delay: i * 0.02,
      emoji: ['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)]
    };
  });

  return (
    <g>
      {/* Radial burst */}
      <motion.circle
        cx={x}
        cy={y}
        r={size * 0.3}
        fill="#FDE047"
        opacity={0.6}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 3, 0],
          opacity: [0, 0.6, 0]
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Particles */}
      {particles.map(p => (
        <motion.text
          key={p.id}
          x={x}
          y={y}
          textAnchor="middle"
          className="text-sm"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            x: p.dx,
            y: p.dy,
            scale: [0, 1.2, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 1.2,
            delay: p.delay,
            ease: "easeOut"
          }}
        >
          {p.emoji}
        </motion.text>
      ))}
    </g>
  );
}

export function GlowRipple({ x, y, size, color = '#10B981' }) {
  return (
    <>
      <motion.circle
        cx={x}
        cy={y}
        r={size * 0.5}
        fill="none"
        stroke={color}
        strokeWidth={2}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ 
          scale: 2,
          opacity: 0
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={size * 0.5}
        fill="none"
        stroke={color}
        strokeWidth={2}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ 
          scale: 2,
          opacity: 0
        }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      />
    </>
  );
}