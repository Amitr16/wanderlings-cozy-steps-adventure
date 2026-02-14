import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const avatarEmojis = ['🌱', '🍄', '🌿', '🌸', '🪨', '💧', '✨', '🔥'];

const getAvatarEmoji = (seed) => {
  if (!seed) return '🌱';
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarEmojis[index % avatarEmojis.length];
};

export default function FriendRequestCard({ request, myPublicId }) {
  const queryClient = useQueryClient();

  // Find the requester's profile
  const { data: requesterProfile } = useQuery({
    queryKey: ['profile', request.requested_by_public_id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ 
        public_id: request.requested_by_public_id 
      });
      return profiles && profiles.length > 0 ? profiles[0] : null;
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: async (newStatus) => {
      return await base44.entities.Friendship.update(request.id, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      toast.success(newStatus === 'accepted' ? 'Friend request accepted!' : 'Request declined');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
    onError: () => {
      toast.error('Failed to update request');
    }
  });

  if (!requesterProfile) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
      <div className="text-3xl">
        {getAvatarEmoji(requesterProfile.avatar_seed)}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800">{requesterProfile.nickname}</p>
        <p className="text-xs text-gray-500">wants to be friends</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => updateRequestMutation.mutate('accepted')}
          disabled={updateRequestMutation.isPending}
          className="bg-green-500 hover:bg-green-600"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateRequestMutation.mutate('declined')}
          disabled={updateRequestMutation.isPending}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}