import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { 
  canSendLanternToday, 
  sendLantern, 
  getAllLanterns,
  claimLantern,
  sendThankReaction 
} from './lanternHelper';

const avatarEmojis = ['🌱', '🍄', '🌿', '🌸', '🪨', '💧', '✨', '🔥'];

const getAvatarEmoji = (seed) => {
  if (!seed) return '🌱';
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarEmojis[index % avatarEmojis.length];
};

export default function LanternsTab({ myProfile, friends }) {
  const queryClient = useQueryClient();
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const { data: canSendToday, isLoading: checkingSend } = useQuery({
    queryKey: ['canSendLantern', myProfile?.id],
    queryFn: () => canSendLanternToday(myProfile),
    enabled: !!myProfile
  });

  const { data: lanterns = [] } = useQuery({
    queryKey: ['lanterns', myProfile?.public_id],
    queryFn: () => getAllLanterns(myProfile.public_id),
    enabled: !!myProfile
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (friendPublicId) => {
      await sendLantern(myProfile, friendPublicId);
    },
    onSuccess: () => {
      toast.success('Lantern sent! ✨');
      setShowFriendPicker(false);
      setSelectedFriend(null);
      queryClient.invalidateQueries({ queryKey: ['canSendLantern'] });
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send lantern');
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (gift) => {
      await claimLantern(gift, userProgress.id);
    },
    onSuccess: () => {
      toast.success('Lantern claimed! You received a free scout token 🎫');
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to claim lantern');
    }
  });

  const thankMutation = useMutation({
    mutationFn: async ({ giftId, emoji }) => {
      await sendThankReaction(giftId, emoji);
    },
    onSuccess: () => {
      toast.success('Thank you sent! 💚');
      queryClient.invalidateQueries({ queryKey: ['lanterns'] });
    }
  });

  const unclaimedLanterns = lanterns.filter(l => !l.claimed_at);
  const claimedLanterns = lanterns.filter(l => l.claimed_at);

  // Get sender profiles for lanterns
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: lanterns.length > 0
  });

  const getSenderProfile = (publicId) => {
    return allProfiles.find(p => p.public_id === publicId);
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 mb-2">Add friends to send lantern gifts!</p>
        <p className="text-sm text-gray-500">Lanterns give your friends a free scout token ✨</p>
      </div>
    );
  }

  return (
    <div>
      {/* Send Lantern Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Send a Lantern Gift</h3>
          {!canSendToday && !checkingSend && (
            <span className="text-xs text-gray-500">✓ Sent today</span>
          )}
        </div>

        {!showFriendPicker ? (
          <Button
            onClick={() => setShowFriendPicker(true)}
            disabled={!canSendToday || checkingSend}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Gift className="w-4 h-4 mr-2" />
            {canSendToday ? 'Choose Friend to Send Lantern' : 'Already sent today'}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200"
          >
            <p className="text-sm text-gray-700 mb-3">Choose a friend:</p>
            <div className="space-y-2 mb-3">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedFriend?.id === friend.id
                      ? 'bg-amber-200 border-2 border-amber-400'
                      : 'bg-white border-2 border-amber-100 hover:border-amber-300'
                  }`}
                >
                  <span className="text-2xl">{getAvatarEmoji(friend.avatar_seed)}</span>
                  <span className="font-semibold text-gray-800">{friend.nickname}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => sendMutation.mutate(selectedFriend.public_id)}
                disabled={!selectedFriend || sendMutation.isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Lantern ✨'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFriendPicker(false);
                  setSelectedFriend(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Unclaimed Lanterns */}
      {unclaimedLanterns.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3">Inbox ({unclaimedLanterns.length})</h3>
          <div className="space-y-3">
            {unclaimedLanterns.map((lantern) => {
              const sender = getSenderProfile(lantern.from_public_id);
              return (
                <motion.div
                  key={lantern.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-amber-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{sender ? getAvatarEmoji(sender.avatar_seed) : '🌟'}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{sender?.nickname || 'A friend'}</p>
                      <p className="text-sm text-gray-600">sent you a lantern!</p>
                    </div>
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </div>
                  <Button
                    onClick={() => claimMutation.mutate(lantern)}
                    disabled={claimMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-600"
                  >
                    {claimMutation.isPending ? 'Claiming...' : 'Claim Free Scout Token 🎫'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claimed History */}
      {claimedLanterns.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Recent Gifts</h3>
          <div className="space-y-2">
            {claimedLanterns.slice(0, 5).map((lantern) => {
              const sender = getSenderProfile(lantern.from_public_id);
              return (
                <div
                  key={lantern.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-2xl">{sender ? getAvatarEmoji(sender.avatar_seed) : '🌟'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{sender?.nickname || 'A friend'}</p>
                    <p className="text-xs text-gray-500">Claimed ✓</p>
                  </div>
                  {!lantern.thank_reaction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => thankMutation.mutate({ giftId: lantern.id, emoji: '💚' })}
                      disabled={thankMutation.isPending}
                    >
                      Thank 💚
                    </Button>
                  )}
                  {lantern.thank_reaction && (
                    <span className="text-lg">{lantern.thank_reaction}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lanterns.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No lanterns yet</p>
          <p className="text-sm text-gray-500 mt-1">Send one to brighten a friend's day!</p>
        </div>
      )}
    </div>
  );
}