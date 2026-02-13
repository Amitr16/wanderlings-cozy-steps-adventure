import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAnonUser } from '@/components/system/anonUser';
const createPageUrl = (pageName) => `/${pageName}`;
import QuestCard from '../components/quests/QuestCard';
import ResourceDisplay from '../components/resources/ResourceDisplay';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Quests() {
  const queryClient = useQueryClient();

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = getAnonUser();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    }
  });

  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const user = getAnonUser();
      return await base44.entities.Quest.filter({ created_by: user.email });
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (quest) => {
      await base44.entities.Quest.update(quest.id, { claimed: true });
      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow + quest.glow_reward,
        sprouts: progress.sprouts + quest.sprout_reward,
        creature_mood: Math.min(100, progress.creature_mood + 3)
      });
    },
    onSuccess: (_, quest) => {
      queryClient.invalidateQueries(['quests']);
      queryClient.invalidateQueries(['userProgress']);
      toast.success(`Quest completed! +${quest.glow_reward} Glow, +${quest.sprout_reward} Sprouts! 🎉`);
    }
  });

  if (isLoading || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⭐</div>
          <p className="text-gray-600">{!progress ? 'Please complete onboarding first' : 'Loading quests...'}</p>
        </div>
      </div>
    );
  }

  const dailyQuests = quests?.filter(q => q.quest_type === 'daily') || [];
  const completedCount = dailyQuests.filter(q => q.claimed).length;
  const availableCount = dailyQuests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Camp')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">⭐ Daily Quests</h1>
            </div>
            <div className="flex items-center gap-3">
              <ResourceDisplay type="glow" amount={progress?.glow || 0} size="md" />
              <ResourceDisplay type="sprouts" amount={progress?.sprouts || 0} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 border-2 border-purple-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Today's Progress</h2>
              <p className="text-gray-600">
                {completedCount} of {dailyQuests.length} quests completed
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">
                {completedCount === dailyQuests.length ? '🎉' : '⭐'}
              </div>
              {availableCount > 0 && (
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {availableCount} to claim!
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / dailyQuests.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quest Cards */}
        <div className="space-y-4">
          {dailyQuests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No quests available</h3>
              <p className="text-gray-600">Check back tomorrow for new daily quests!</p>
            </div>
          ) : (
            dailyQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuestCard
                  quest={quest}
                  onClaim={() => claimMutation.mutate(quest)}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-amber-50 rounded-xl p-4 border border-amber-200"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete quests to earn Glow and Sprouts</li>
                <li>• New quests appear daily</li>
                <li>• Restoring tiles helps complete multiple quests at once!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}