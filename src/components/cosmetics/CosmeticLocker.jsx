import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { getCosmeticItem, COSMETIC_ITEMS, getRarityColor } from './cosmeticData';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ProfileDisplay from './ProfileDisplay';

export default function CosmeticLocker({ myProfile }) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('profile');

  const { data: inventory = [] } = useQuery({
    queryKey: ['cosmeticInventory', myProfile?.public_id],
    queryFn: async () => {
      if (!myProfile?.public_id) return [];
      return await base44.entities.CosmeticInventory.filter({ public_id: myProfile.public_id });
    },
    enabled: !!myProfile
  });

  const { data: loadout } = useQuery({
    queryKey: ['cosmeticLoadout', myProfile?.public_id],
    queryFn: async () => {
      if (!myProfile?.public_id) return null;
      const results = await base44.entities.CosmeticLoadout.filter({ public_id: myProfile.public_id });
      if (results && results.length > 0) return results[0];
      
      // Create loadout if doesn't exist
      return await base44.entities.CosmeticLoadout.create({
        public_id: myProfile.public_id
      });
    },
    enabled: !!myProfile
  });

  const equipMutation = useMutation({
    mutationFn: async ({ itemId, slotKey }) => {
      if (!loadout) return;
      await base44.entities.CosmeticLoadout.update(loadout.id, {
        [slotKey]: itemId
      });
    },
    onSuccess: () => {
      toast.success('Cosmetic equipped!');
      queryClient.invalidateQueries({ queryKey: ['cosmeticLoadout'] });
    }
  });

  const unequipMutation = useMutation({
    mutationFn: async ({ slotKey }) => {
      if (!loadout) return;
      await base44.entities.CosmeticLoadout.update(loadout.id, {
        [slotKey]: null
      });
    },
    onSuccess: () => {
      toast.success('Cosmetic unequipped!');
      queryClient.invalidateQueries({ queryKey: ['cosmeticLoadout'] });
    }
  });

  const typeFilters = [
    { id: 'profile', label: 'Profile Borders', slot: 'active_profile_border' },
    { id: 'title', label: 'Titles', slot: 'active_title' },
    { id: 'camp', label: 'Camp Decor', slot: 'active_camp_banner' }
  ];

  const currentFilter = typeFilters.find(f => f.id === selectedType);
  const filteredInventory = inventory.filter(item => {
    const cosmeticData = getCosmeticItem(item.item_id);
    return cosmeticData?.type === selectedType;
  });

  const currentlyEquipped = loadout ? loadout[currentFilter.slot] : null;

  return (
    <div>
      {/* Preview */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">Preview</h3>
        <div className="flex justify-center">
          <ProfileDisplay profile={myProfile} size="lg" showTitle={true} />
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 border-2 border-gray-200">
        {typeFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedType(filter.id)}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
              selectedType === filter.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-600">No {currentFilter.label.toLowerCase()} unlocked yet</p>
          <p className="text-sm text-gray-500 mt-1">Level up to earn cosmetic rewards!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredInventory.map((item, idx) => {
            const cosmeticData = getCosmeticItem(item.item_id);
            if (!cosmeticData) return null;

            const isEquipped = currentlyEquipped === item.item_id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-xl p-4 border-2 transition-all ${
                  isEquipped
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{cosmeticData.visual}</div>
                    <div>
                      <div className="font-bold text-gray-800">{cosmeticData.name}</div>
                      <div className={`text-xs font-semibold ${getRarityColor(cosmeticData.rarity)}`}>
                        {cosmeticData.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {isEquipped ? (
                    <Button
                      onClick={() => unequipMutation.mutate({ slotKey: currentFilter.slot })}
                      disabled={unequipMutation.isPending}
                      size="sm"
                      variant="outline"
                    >
                      Unequip
                    </Button>
                  ) : (
                    <Button
                      onClick={() => equipMutation.mutate({ 
                        itemId: item.item_id, 
                        slotKey: currentFilter.slot 
                      })}
                      disabled={equipMutation.isPending}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Equip
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}