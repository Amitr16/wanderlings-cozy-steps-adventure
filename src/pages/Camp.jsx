import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Map, Target, Plus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAnonUser } from '@/components/system/anonUser';
const createPageUrl = (pageName) => `/${pageName}`;
import MosslingDisplay from '../components/creature/MosslingDisplay';
import ResourceDisplay from '../components/resources/ResourceDisplay';
import { motion } from 'framer-motion';

export default function Camp() {
  const queryClient = useQueryClient();
  const [showStepSimulator, setShowStepSimulator] = useState(false);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = getAnonUser();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    }
  });

  const { data: quests } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const user = getAnonUser();
      return await base44.entities.Quest.filter({ created_by: user.email, day: progress?.season_day || 1 });
    },
    enabled: !!progress
  });

  const addStepsMutation = useMutation({
    mutationFn: async (steps) => {
      const newTotalSteps = progress.total_steps + steps;
      const newTodaySteps = progress.today_steps + steps;
      const glowFromSteps = Math.floor(steps / 100);
      
      // Glow cap system: 150 max stored, overflow goes to Dew
      const GLOW_CAP = 150;
      let newGlow = progress.glow + glowFromSteps;
      let newDew = progress.dew;
      
      if (newGlow > GLOW_CAP) {
        newDew += newGlow - GLOW_CAP;
        newGlow = GLOW_CAP;
      }

      await base44.entities.UserProgress.update(progress.id, {
        total_steps: newTotalSteps,
        today_steps: newTodaySteps,
        glow: newGlow,
        dew: newDew
      });

      // Update quest progress
      if (quests) {
        for (const quest of quests) {
          if ((quest.target_metric === 'mini_goal' && newTodaySteps >= progress.personal_step_goal * 0.6) ||
              (quest.target_metric === 'psg' && newTodaySteps >= progress.personal_step_goal) ||
              (quest.target_metric === 'stretch_goal' && newTodaySteps >= progress.personal_step_goal * 1.2)) {
            if (!quest.completed) {
              await base44.entities.Quest.update(quest.id, {
                current_progress: quest.target_amount,
                completed: true
              });
            }
          }
        }
      }

      return glowFromSteps;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['quests']);
    }
  });

  const handleAddSteps = (amount) => {
    addStepsMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">Loading your camp...</p>
        </div>
      </div>
    );
  }

  const unclaimedQuests = quests?.filter(q => q.completed && !q.claimed).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">🏕️ Your Camp</h1>
            <div className="flex items-center gap-3">
              <ResourceDisplay type="glow" amount={progress?.glow || 0} size="md" />
              {progress?.dew > 0 && (
                <div className="text-sm text-gray-600">
                  +{progress.dew} Dew 💧
                </div>
              )}
              <ResourceDisplay type="sprouts" amount={progress?.sprouts || 0} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Creature Section - The Star of the Show */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-3xl p-8 mb-6 border-4 border-green-200 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient fireflies */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xs"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`
                }}
                animate={{
                  y: [-10, 10, -10],
                  x: [-5, 5, -5],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <MosslingDisplay 
              size="xl" 
              mood={progress?.creature_mood || 100}
              bondLevel={progress?.bond_level || 1}
              state={
                progress?.creature_mood >= 90 ? 'radiant' :
                progress?.creature_mood >= 70 ? 'happy' :
                progress?.creature_mood >= 50 ? 'curious' : 'sleepy'
              }
              animate={true}
              onInteract={() => {
                // Easter egg: Mossling reacts to taps
              }}
            />
            
            <motion.h2 
              className="text-3xl font-bold text-gray-800 mt-6 mb-2"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Your Mossling
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-700 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {progress?.creature_mood >= 90 ? '✨ Absolutely radiant today! ✨' :
               progress?.creature_mood >= 70 ? '💚 Feeling playful and energetic!' :
               progress?.creature_mood >= 50 ? '👀 Curiously watching the forest...' :
               '😴 Resting peacefully by the fire...'}
            </motion.p>

            <div className="flex gap-4 items-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border-2 border-green-300 shadow-sm">
                <span className="text-sm text-gray-600">Mood </span>
                <span className="font-bold text-green-600 text-lg">{progress?.creature_mood || 100}%</span>
              </div>
              
              {progress?.bond_level > 1 && (
                <div className="bg-purple-50 rounded-full px-6 py-3 border-2 border-purple-300 shadow-sm">
                  <span className="text-sm text-gray-600">Bond </span>
                  <span className="font-bold text-purple-600 text-lg">Level {progress?.bond_level}</span>
                </div>
              )}
            </div>

            {/* Today's steps reaction */}
            {progress?.today_steps > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-blue-50 rounded-2xl px-6 py-3 border-2 border-blue-200"
              >
                <p className="text-sm text-blue-700">
                  <span className="font-bold">"{progress.today_steps >= progress.personal_step_goal 
                    ? "You did it! The forest feels alive!" 
                    : "Keep walking! Each step helps me restore our home!"}"</span>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">👣</div>
              <div>
                <p className="text-sm text-gray-500">Today's Steps</p>
                <p className="text-2xl font-bold text-gray-800">{progress?.today_steps?.toLocaleString() || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">🌲</div>
              <div>
                <p className="text-sm text-gray-500">Tiles Restored</p>
                <p className="text-2xl font-bold text-gray-800">{progress?.tiles_restored || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">⭐</div>
              <div>
                <p className="text-sm text-gray-500">Total Steps</p>
                <p className="text-2xl font-bold text-gray-800">{progress?.total_steps?.toLocaleString() || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link to={createPageUrl('Map')}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Restore the Forest</h3>
                  <p className="text-green-100">Help Mossling heal the woodland</p>
                </div>
                <div className="text-4xl">🌿</div>
              </div>
            </motion.div>
          </Link>

          <Link to={createPageUrl('Quests')}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {unclaimedQuests > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-4 border-white">
                  {unclaimedQuests}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Daily Quests</h3>
                  <p className="text-purple-100">Complete missions for rewards</p>
                </div>
                <Target className="w-12 h-12 opacity-80" />
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Step Simulator (for demo purposes) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed border-gray-300"
        >
          <button
            onClick={() => setShowStepSimulator(!showStepSimulator)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="font-bold text-gray-800 mb-1">🔧 Step Simulator (Demo)</h3>
              <p className="text-sm text-gray-500">Add steps to test the game mechanics</p>
            </div>
            <TrendingUp className={`w-5 h-5 text-gray-400 transition-transform ${showStepSimulator ? 'rotate-180' : ''}`} />
          </button>

          {showStepSimulator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAddSteps(100)}
                  variant="outline"
                  className="border-blue-300 hover:bg-blue-50"
                >
                  +100 steps
                </Button>
                <Button
                  onClick={() => handleAddSteps(500)}
                  variant="outline"
                  className="border-green-300 hover:bg-green-50"
                >
                  +500 steps
                </Button>
                <Button
                  onClick={() => handleAddSteps(1000)}
                  variant="outline"
                  className="border-purple-300 hover:bg-purple-50"
                >
                  +1000 steps
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                100 steps = 1 Glow ✨
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}