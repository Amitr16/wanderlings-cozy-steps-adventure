import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCosmeticItem } from './cosmeticData';
import { cn } from '@/lib/utils';

// Generate avatar emoji from seed
const getAvatarEmoji = (seed) => {
  const emojis = ['🌿', '🍃', '🌱', '🌾', '🍀', '🌳', '🌲', '🎋', '🪴', '🌻', '🌺', '🌸'];
  const index = seed ? parseInt(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % emojis.length : 0;
  return emojis[index];
};

export default function ProfileDisplay({ profile, size = 'md', showTitle = true }) {
  const { data: loadout } = useQuery({
    queryKey: ['cosmeticLoadout', profile?.public_id],
    queryFn: async () => {
      if (!profile?.public_id) return null;
      const results = await base44.entities.CosmeticLoadout.filter({ public_id: profile.public_id });
      return results && results.length > 0 ? results[0] : null;
    },
    enabled: !!profile
  });

  if (!profile) return null;

  const activeBorder = loadout?.active_profile_border ? getCosmeticItem(loadout.active_profile_border) : null;
  const activeTitle = loadout?.active_title ? getCosmeticItem(loadout.active_title) : null;

  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-5xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        activeBorder ? `bg-gradient-to-br ${activeBorder.bgGradient} ${activeBorder.borderStyle}` : 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300'
      )}>
        {getAvatarEmoji(profile.avatar_seed)}
      </div>
      <div>
        <div className="font-bold text-gray-800">{profile.nickname}</div>
        {showTitle && activeTitle && (
          <div className={cn("text-xs font-semibold", activeTitle.color)}>
            {activeTitle.display}
          </div>
        )}
        {showTitle && !activeTitle && (
          <div className="text-xs text-gray-500">{profile.friend_code}</div>
        )}
      </div>
    </div>
  );
}