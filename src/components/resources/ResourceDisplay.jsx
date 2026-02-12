import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf } from 'lucide-react';

export default function ResourceDisplay({ type, amount, showLabel = true, size = 'md' }) {
  const config = {
    glow: {
      icon: '✨',
      label: 'Glow',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    sprouts: {
      icon: '🌱',
      label: 'Sprouts',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    steps: {
      icon: '👣',
      label: 'Steps',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const settings = config[type] || config.glow;
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-2.5'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${settings.bgColor} ${settings.borderColor} border-2 rounded-full ${sizeClasses[size]}`}>
      <span className="text-xl">{settings.icon}</span>
      <span className={`font-bold ${settings.color}`}>
        {amount.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-gray-600 text-sm">
          {settings.label}
        </span>
      )}
    </div>
  );
}