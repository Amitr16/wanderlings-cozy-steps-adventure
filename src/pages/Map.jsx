import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
const createPageUrl = (pageName) => `/${pageName}`;
import MapTile from '../components/map/MapTile';
import ResourceDisplay from '../components/resources/ResourceDisplay';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Map() {
  const queryClient = useQueryClient();

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results[0];
    }
  });

  const { data: tiles, isLoading } = useQuery({
    queryKey: ['mapTiles'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.MapTile.filter({ created_by: user.email });
    }
  });

  const { data: quests } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Quest.filter({ created_by: user.email });
    }
  });

  const revealMutation = useMutation({
    mutationFn: async (tile) => {
      const revealCost = 3;
      if (progress.glow < revealCost) {
        throw new Error('Not enough Glow');
      }

      await base44.entities.MapTile.update(tile.id, { state: 'revealed' });
      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow - revealCost
      });

      // Update quest progress
      if (quests) {
        for (const quest of quests) {
          if (quest.target_metric === 'tiles_revealed' && !quest.completed) {
            await base44.entities.Quest.update(quest.id, {
              current_progress: quest.current_progress + 1,
              completed: quest.current_progress + 1 >= quest.target_amount
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mapTiles']);
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['quests']);
      toast.success('Tile revealed! 👁️');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reveal tile');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (tile) => {
      const restoreCost = 7;
      if (progress.glow < restoreCost) {
        throw new Error('Not enough Glow');
      }

      await base44.entities.MapTile.update(tile.id, {
        state: 'restored',
        restored_date: new Date().toISOString()
      });

      await base44.entities.UserProgress.update(progress.id, {
        glow: progress.glow - restoreCost,
        sprouts: progress.sprouts + tile.sprout_reward,
        tiles_restored: progress.tiles_restored + 1,
        creature_mood: Math.min(100, progress.creature_mood + 5)
      });

      // Update quest progress
      if (quests) {
        for (const quest of quests) {
          if (quest.target_metric === 'tiles_restored' && !quest.completed) {
            await base44.entities.Quest.update(quest.id, {
              current_progress: quest.current_progress + 1,
              completed: quest.current_progress + 1 >= quest.target_amount
            });
          }
        }
      }
    },
    onSuccess: (_, tile) => {
      queryClient.invalidateQueries(['mapTiles']);
      queryClient.invalidateQueries(['userProgress']);
      queryClient.invalidateQueries(['quests']);
      toast.success(`Tile restored! +${tile.sprout_reward} Sprouts 🌱`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to restore tile');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600">Loading the magical forest...</p>
        </div>
      </div>
    );
  }

  // Organize tiles into a grid
  const gridSize = 5;
  const tileGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  tiles?.forEach(tile => {
    if (tile.position_x < gridSize && tile.position_y < gridSize) {
      tileGrid[tile.position_y][tile.position_x] = tile;
    }
  });

  const canAfford = {
    reveal: (progress?.glow || 0) >= 3,
    restore: (progress?.glow || 0) >= 7
  };

  const stats = {
    fogged: tiles?.filter(t => t.state === 'fogged').length || 0,
    revealed: tiles?.filter(t => t.state === 'revealed').length || 0,
    restored: tiles?.filter(t => t.state === 'restored').length || 0
  };

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
              <h1 className="text-2xl font-bold text-gray-800">🗺️ Magical Forest</h1>
            </div>
            <div className="flex items-center gap-3">
              <ResourceDisplay type="glow" amount={progress?.glow || 0} size="md" />
              <ResourceDisplay type="sprouts" amount={progress?.sprouts || 0} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-100 to-green-100 rounded-2xl p-4 mb-6 border-2 border-green-300"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-700 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Reveal</span> fogged tiles (3 ✨) to discover what's there, then <span className="font-bold">Restore</span> them (7 ✨) to bring them back to life!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-300 text-center">
            <div className="text-2xl mb-1">🌫️</div>
            <p className="text-2xl font-bold text-gray-800">{stats.fogged}</p>
            <p className="text-xs text-gray-500">Fogged</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-amber-300 text-center">
            <div className="text-2xl mb-1">👁️</div>
            <p className="text-2xl font-bold text-amber-600">{stats.revealed}</p>
            <p className="text-xs text-gray-500">Revealed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-green-300 text-center">
            <div className="text-2xl mb-1">🌲</div>
            <p className="text-2xl font-bold text-green-600">{stats.restored}</p>
            <p className="text-xs text-gray-500">Restored</p>
          </div>
        </div>

        {/* Map Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-xl border-4 border-green-200"
        >
          <div className="flex flex-col gap-2">
            {tileGrid.map((row, y) => (
              <div key={y} className="flex justify-center gap-2">
                {row.map((tile, x) => (
                  <div key={`${x}-${y}`}>
                    {tile ? (
                      <MapTile
                        tile={tile}
                        onReveal={() => revealMutation.mutate(tile)}
                        onRestore={() => restoreMutation.mutate(tile)}
                        canAfford={canAfford}
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="mt-6 bg-white/60 rounded-xl p-4 border border-green-200">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Legend</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded border-2 border-gray-500" />
              <span className="text-gray-600">Fogged (3 ✨ to reveal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-green-100 rounded border-2 border-green-300" />
              <span className="text-gray-600">Revealed (7 ✨ to restore)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-200 via-emerald-300 to-green-400 rounded border-2 border-green-500" />
              <span className="text-gray-600">Restored & Beautiful!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}