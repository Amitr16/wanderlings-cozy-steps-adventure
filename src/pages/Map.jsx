import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAnonKey } from '@/functions/anonIdentity';
import HexGrid from '../components/map/HexGrid';
import ResourceDisplay from '../components/resources/ResourceDisplay';
const createPageUrl = (pageName) => `/${pageName}`;

export default function Map() {
  const queryClient = useQueryClient();

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const anonKey = getAnonKey();
      const results = await base44.entities.UserProgress.filter({ created_by: anonKey });
      return results[0];
    }
  });

  const { data: tiles = [], isLoading: loadingTiles } = useQuery({
    queryKey: ['mapTiles'],
    queryFn: async () => {
      const anonKey = getAnonKey();
      return await base44.entities.MapTile.filter({ created_by: anonKey });
    }
  });

  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const anonKey = getAnonKey();
      return await base44.entities.Quest.filter({ created_by: anonKey, day: progress?.season_day || 1 });
    },
    enabled: !!progress
  });

  const scoutMutation = useMutation({
    mutationFn: async (tile) => {
      const cost = 3;
      if (progress.glow < cost) throw new Error('Not enough Glow');

      // Add slight delay for animation anticipation
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log('Scouting tile:', tile.q, tile.r, 'from', tile.state, 'to revealed');
      await base44.entities.MapTile.update(tile.id, { state: 'revealed' });
      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow - cost,
        tiles_scouted: progress.tiles_scouted + 1,
        sprouts: progress.sprouts + 2
      });

      // Update quest progress
      for (const quest of quests) {
        if (quest.target_metric === 'scout' && !quest.completed) {
          await base44.entities.Quest.update(quest.id, {
            current_progress: Math.min(quest.current_progress + 1, quest.target_amount),
            completed: quest.current_progress + 1 >= quest.target_amount
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['mapTiles']);
      queryClient.invalidateQueries(['quests']);
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (tile) => {
      const cost = 7;
      if (progress.glow < cost) throw new Error('Not enough Glow');

      // Add anticipation delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const sproutReward = Math.floor(Math.random() * 9) + 10; // 10-18 Sprouts

      await base44.entities.MapTile.update(tile.id, { state: 'restored' });
      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow - cost,
        tiles_restored: progress.tiles_restored + 1,
        sprouts: progress.sprouts + sproutReward,
        creature_mood: Math.min(100, progress.creature_mood + 5)
      });

      // Update quest progress
      for (const quest of quests) {
        if (quest.target_metric === 'restore' && !quest.completed) {
          await base44.entities.Quest.update(quest.id, {
            current_progress: Math.min(quest.current_progress + 1, quest.target_amount),
            completed: quest.current_progress + 1 >= quest.target_amount
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['mapTiles']);
      queryClient.invalidateQueries(['quests']);
    }
  });

  const bloomMutation = useMutation({
    mutationFn: async (tile) => {
      const cost = 12;
      if (progress.glow < cost) throw new Error('Not enough Glow');

      // Longer anticipation for special moment
      await new Promise(resolve => setTimeout(resolve, 200));

      const sproutReward = Math.floor(Math.random() * 11) + 15; // 15-25 Sprouts

      await base44.entities.MapTile.update(tile.id, { state: 'bloomed' });
      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow - cost,
        tiles_bloomed: progress.tiles_bloomed + 1,
        sprouts: progress.sprouts + sproutReward,
        creature_mood: Math.min(100, progress.creature_mood + 10)
      });

      // Update quest progress
      for (const quest of quests) {
        if (quest.target_metric === 'bloom' && !quest.completed) {
          await base44.entities.Quest.update(quest.id, {
            current_progress: Math.min(quest.current_progress + 1, quest.target_amount),
            completed: quest.current_progress + 1 >= quest.target_amount
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['mapTiles']);
      queryClient.invalidateQueries(['quests']);
    }
  });

  if (loadingProgress || loadingTiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const canAfford = {
    scout: progress.glow >= 3,
    restore: progress.glow >= 7,
    bloom: progress.glow >= 12
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Camp')}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Camp
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <ResourceDisplay type="glow" amount={progress?.glow || 0} size="md" />
              <ResourceDisplay type="sprouts" amount={progress?.sprouts || 0} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🗺️ The Forest</h2>
            <div className="text-sm text-gray-600">
              Week {progress?.current_week || 1} • Day {progress?.season_day || 1}
            </div>
          </div>
          
          <div className="h-[600px]">
            <HexGrid
              tiles={tiles}
              currentWeek={progress?.current_week || 1}
              onScout={(tile) => scoutMutation.mutate(tile)}
              onRestore={(tile) => restoreMutation.mutate(tile)}
              onBloom={(tile) => bloomMutation.mutate(tile)}
              canAfford={canAfford}
            />
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200"
        >
          <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-semibold text-sm">Scout</p>
                <p className="text-xs text-gray-600">3 Glow • Reveals tile</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="font-semibold text-sm">Restore</p>
                <p className="text-xs text-gray-600">7 Glow • Brings life back</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-sm">Bloom</p>
                <p className="text-xs text-gray-600">12 Glow • Maximum beauty</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}