import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import ResourceDisplay from '../resources/ResourceDisplay';

export default function QuestCard({ quest, onClaim }) {
  const progress = Math.min((quest.current_progress / quest.target_amount) * 100, 100);
  const isComplete = quest.current_progress >= quest.target_amount;
  const isClaimed = quest.claimed;

  const questIcons = {
    steps: '👣',
    tiles_revealed: '👁️',
    tiles_restored: '🌿',
    login: '✨'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Quest Icon */}
        <div className="text-3xl">
          {questIcons[quest.target_metric] || '⭐'}
        </div>

        {/* Quest Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1">{quest.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{quest.description}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{quest.current_progress} / {quest.target_amount}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">Rewards:</span>
            <ResourceDisplay type="glow" amount={quest.glow_reward} showLabel={false} size="sm" />
            <ResourceDisplay type="sprouts" amount={quest.sprout_reward} showLabel={false} size="sm" />
          </div>

          {/* Claim Button */}
          {isClaimed ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Claimed
            </div>
          ) : isComplete ? (
            <Button
              onClick={() => onClaim(quest)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Claim Rewards
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Circle className="w-4 h-4" />
              In Progress
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}