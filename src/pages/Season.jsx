import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Lock, CheckCircle, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  getActiveSeason,
  getOrCreateSeasonProgress,
  getAllSeasonRewards,
  claimReward,
  xpForNextLevel,
  getUnclaimedLevels
} from '../components/season/seasonHelper';
import { getOrCreateProfile } from '../components/social/profileHelper';

const createPageUrl = (pageName) => `/${pageName}`;

export default function Season() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('progress');

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getOrCreateProfile
  });

  const { data: season, isLoading: loadingSeason } = useQuery({
    queryKey: ['activeSeason'],
    queryFn: getActiveSeason
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['seasonProgress', season?.season_id, myProfile?.public_id],
    queryFn: () => getOrCreateSeasonProgress(season.season_id, myProfile.public_id),
    enabled: !!season && !!myProfile
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['seasonRewards', season?.season_id],
    queryFn: () => getAllSeasonRewards(season.season_id),
    enabled: !!season
  });

  const claimMutation = useMutation({
    mutationFn: ({ level }) => claimReward(season.season_id, myProfile.public_id, level),
    onSuccess: (claimedRewards) => {
      const rewardText = claimedRewards.map(r => {
        if (r.reward_type === 'sprouts') return `${r.reward_payload.amount} Sprouts`;
        if (r.reward_type === 'title') return `Title: ${r.reward_payload.name}`;
        if (r.reward_type === 'cosmetic') return r.reward_payload.name;
        if (r.reward_type === 'badge') return r.reward_payload.name;
        return 'Reward';
      }).join(', ');
      
      toast.success(`Claimed: ${rewardText}!`);
      queryClient.invalidateQueries({ queryKey: ['seasonProgress'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to claim reward');
    }
  });

  if (loadingSeason || loadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-gray-600">Loading season...</p>
        </div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">No active season</p>
          <Link to={createPageUrl('Camp')}>
            <Button className="mt-4">Back to Camp</Button>
          </Link>
        </div>
      </div>
    );
  }

  const unclaimedLevels = getUnclaimedLevels(progress);
  const nextLevelXP = xpForNextLevel(progress.season_level);

  // Group rewards by level
  const rewardsByLevel = {};
  rewards.forEach(reward => {
    if (!rewardsByLevel[reward.level]) rewardsByLevel[reward.level] = [];
    rewardsByLevel[reward.level].push(reward);
  });

  const renderRewardBadge = (reward) => {
    if (reward.reward_type === 'sprouts') {
      return `🌱 ${reward.reward_payload.amount} Sprouts`;
    }
    if (reward.reward_type === 'title') {
      return `📜 ${reward.reward_payload.name}`;
    }
    if (reward.reward_type === 'cosmetic') {
      return `✨ ${reward.reward_payload.name}`;
    }
    if (reward.reward_type === 'badge') {
      return `🏆 ${reward.reward_payload.name}`;
    }
    return 'Reward';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Camp')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Camp
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">{season.name}</h1>
              <p className="text-sm text-gray-600">Level {progress.season_level}</p>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-4 px-4 font-semibold transition-colors ${
                activeTab === 'progress'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-4 px-4 font-semibold transition-colors ${
                activeTab === 'rewards'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rewards Ladder
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'progress' && (
              <div>
                {/* Current Level */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Level {progress.season_level}</h2>
                  <p className="text-gray-600">
                    {progress.season_xp.toLocaleString()} XP
                    {nextLevelXP && ` / ${nextLevelXP.toLocaleString()} XP`}
                  </p>
                </div>

                {/* Unclaimed Rewards */}
                {unclaimedLevels.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      Ready to Claim
                    </h3>
                    <div className="space-y-2">
                      {unclaimedLevels.map(level => (
                        <motion.div
                          key={level}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-purple-50 rounded-xl p-4 border-2 border-purple-300"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-purple-800">Level {level} Reward</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {(rewardsByLevel[level] || []).map((reward, idx) => (
                                  <span key={idx} className="text-sm text-purple-700">
                                    {renderRewardBadge(reward)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={() => claimMutation.mutate({ level })}
                              disabled={claimMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {claimMutation.isPending ? 'Claiming...' : 'Claim'}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* How to Earn XP */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3">How to Earn XP</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span>🔍 Scout a tile</span>
                      <span className="font-bold">+2 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🌱 Restore a tile</span>
                      <span className="font-bold">+6 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🌸 Bloom a tile</span>
                      <span className="font-bold">+14 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Seasonal Rewards</h3>
                <div className="space-y-3">
                  {Object.keys(rewardsByLevel).sort((a, b) => a - b).map(level => {
                    const levelNum = parseInt(level);
                    const isUnlocked = progress.season_level >= levelNum;
                    const isClaimed = progress.claimed_levels.includes(levelNum);
                    
                    return (
                      <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl p-4 border-2 ${
                          isClaimed
                            ? 'bg-green-50 border-green-300'
                            : isUnlocked
                            ? 'bg-purple-50 border-purple-300'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isClaimed
                                ? 'bg-green-500'
                                : isUnlocked
                                ? 'bg-purple-500'
                                : 'bg-gray-300'
                            }`}>
                              {isClaimed ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                              ) : isUnlocked ? (
                                <span className="text-white font-bold">{level}</span>
                              ) : (
                                <Lock className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">Level {level}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {rewardsByLevel[level].map((reward, idx) => (
                                  <span key={idx} className="text-sm text-gray-600">
                                    {renderRewardBadge(reward)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {isUnlocked && !isClaimed && (
                            <Button
                              onClick={() => claimMutation.mutate({ level: levelNum })}
                              disabled={claimMutation.isPending}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Claim
                            </Button>
                          )}
                          {isClaimed && (
                            <span className="text-sm text-green-600 font-semibold">Claimed ✓</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}