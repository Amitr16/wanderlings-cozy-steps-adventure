import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, ChevronRight } from 'lucide-react';
import { getActiveSeason, getOrCreateSeasonProgress, xpForNextLevel, getUnclaimedLevels } from './seasonHelper';

const createPageUrl = (pageName) => `/${pageName}`;

export default function CampSeasonCard({ myProfile }) {
  const { data: season } = useQuery({
    queryKey: ['activeSeason'],
    queryFn: getActiveSeason
  });

  const { data: progress } = useQuery({
    queryKey: ['seasonProgress', season?.season_id, myProfile?.public_id],
    queryFn: () => getOrCreateSeasonProgress(season.season_id, myProfile.public_id),
    enabled: !!season && !!myProfile
  });

  if (!season || !progress) return null;

  const daysLeft = Math.ceil((new Date(season.end_at) - new Date()) / (1000 * 60 * 60 * 24));
  const nextLevelXP = xpForNextLevel(progress.season_level);
  const unclaimedLevels = getUnclaimedLevels(progress);
  
  // Progress to next level
  const currentLevelXP = progress.season_level > 1 ? xpForNextLevel(progress.season_level - 1) : 0;
  const xpIntoLevel = progress.season_xp - currentLevelXP;
  const xpNeeded = nextLevelXP ? nextLevelXP - currentLevelXP : 0;
  const progressPercent = nextLevelXP ? (xpIntoLevel / xpNeeded) * 100 : 100;

  const themeColors = {
    firefly: 'from-amber-500 to-orange-600',
    mosswood: 'from-green-500 to-emerald-600',
    brookside: 'from-blue-500 to-cyan-600',
    frostfall: 'from-purple-500 to-indigo-600'
  };

  const themeEmojis = {
    firefly: '✨',
    mosswood: '🌿',
    brookside: '💧',
    frostfall: '❄️'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg mb-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{themeEmojis[season.theme_key]}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{season.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </div>
        
        {unclaimedLevels.length > 0 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {unclaimedLevels.length} to claim!
          </div>
        )}
      </div>

      {/* Level and XP */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-gray-800">Level {progress.season_level}</span>
          </div>
          <span className="text-sm text-gray-600">
            {progress.season_xp.toLocaleString()} XP
            {nextLevelXP && ` / ${nextLevelXP.toLocaleString()}`}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${themeColors[season.theme_key]}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {nextLevelXP && (
          <p className="text-xs text-gray-500 mt-1">
            {xpIntoLevel} / {xpNeeded} XP to next level
          </p>
        )}
      </div>

      {/* View Season button */}
      <Link to={createPageUrl('Season')}>
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
          View Season Rewards
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </motion.div>
  );
}