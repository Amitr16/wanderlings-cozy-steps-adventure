import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Swords, Trophy, Clock, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  createDuel,
  acceptDuel,
  declineDuel,
  listIncomingDuels,
  listActiveDuels,
  listCompletedDuels,
  computeScore,
  finalizeIfExpired,
  claimRewards,
  getActiveDuelCount,
  getDuelTypeInfo
} from './duelHelper';

const avatarEmojis = ['🌱', '🍄', '🌿', '🌸', '🪨', '💧', '✨', '🔥'];

const getAvatarEmoji = (seed) => {
  if (!seed) return '🌱';
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarEmojis[index % avatarEmojis.length];
};

const duelTypes = [
  { key: 'bloom_2', duration: 24 },
  { key: 'restore_3', duration: 24 },
  { key: 'embers_24h', duration: 24 }
];

const DuelCard = ({ duel, myPublicId, allProfiles, onAccept, onDecline, onClaim }) => {
  const [liveScores, setLiveScores] = useState({ from: 0, to: 0 });
  const [finalized, setFinalized] = useState(duel);
  
  const isFrom = duel.from_public_id === myPublicId;
  const opponentId = isFrom ? duel.to_public_id : duel.from_public_id;
  const opponent = allProfiles.find(p => p.public_id === opponentId);
  const challenger = allProfiles.find(p => p.public_id === duel.from_public_id);
  
  const typeInfo = getDuelTypeInfo(duel.type);
  
  useEffect(() => {
    if (duel.status === 'active') {
      const computeLiveScores = async () => {
        const scoreFrom = await computeScore(duel, duel.from_public_id);
        const scoreTo = await computeScore(duel, duel.to_public_id);
        setLiveScores({ from: scoreFrom, to: scoreTo });
        
        // Auto-finalize if expired
        const now = new Date();
        const endTime = new Date(duel.end_at);
        if (now > endTime) {
          const finalDuel = await finalizeIfExpired(duel);
          setFinalized(finalDuel);
        }
      };
      
      computeLiveScores();
      const interval = setInterval(computeLiveScores, 10000); // Update every 10s
      return () => clearInterval(interval);
    }
  }, [duel]);
  
  const displayDuel = finalized.status === 'complete' ? finalized : duel;
  const myScore = isFrom ? liveScores.from : liveScores.to;
  const opponentScore = isFrom ? liveScores.to : liveScores.from;
  
  const timeRemaining = () => {
    if (!duel.end_at) return '';
    const now = new Date();
    const end = new Date(duel.end_at);
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };
  
  if (duel.status === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenger ? getAvatarEmoji(challenger.avatar_seed) : '🌟'}</span>
            <div>
              <p className="font-bold text-gray-800">{challenger?.nickname || 'Friend'}</p>
              <p className="text-xs text-gray-600">challenges you!</p>
            </div>
          </div>
          <span className="text-2xl">{typeInfo.emoji}</span>
        </div>
        
        <div className="bg-white rounded p-3 mb-3">
          <p className="font-semibold text-sm text-gray-800">{typeInfo.name}</p>
          <p className="text-xs text-gray-600">{typeInfo.description}</p>
          <p className="text-xs text-gray-500 mt-1">Duration: {duel.duration_hours}h</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onAccept(duel.id)}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            onClick={() => onDecline(duel.id)}
            variant="outline"
            className="flex-1"
          >
            Decline
          </Button>
        </div>
      </motion.div>
    );
  }
  
  if (duel.status === 'active' || displayDuel.status === 'complete') {
    const isComplete = displayDuel.status === 'complete';
    const isWinner = displayDuel.winner_public_id === myPublicId;
    const isDraw = isComplete && !displayDuel.winner_public_id;
    const alreadyClaimed = isFrom ? displayDuel.claimed_from : displayDuel.claimed_to;
    
    const finalMyScore = isComplete ? (isFrom ? displayDuel.score_from : displayDuel.score_to) : myScore;
    const finalOpponentScore = isComplete ? (isFrom ? displayDuel.score_to : displayDuel.score_from) : opponentScore;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg p-4 border-2 ${
          isComplete 
            ? isWinner ? 'bg-green-50 border-green-300' : isDraw ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
            : 'bg-purple-50 border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeInfo.emoji}</span>
            <div>
              <p className="font-semibold text-sm text-gray-800">{typeInfo.name}</p>
              <p className="text-xs text-gray-600">vs {opponent?.nickname || 'Friend'}</p>
            </div>
          </div>
          {isComplete ? (
            <div className="text-right">
              {isWinner && <p className="text-xs font-bold text-green-600">🏆 Victory!</p>}
              {isDraw && <p className="text-xs font-bold text-blue-600">🤝 Draw</p>}
              {!isWinner && !isDraw && <p className="text-xs text-gray-600">Try again!</p>}
            </div>
          ) : (
            <div className="text-right">
              <p className="text-xs text-gray-600">{timeRemaining()}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between bg-white rounded p-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getAvatarEmoji(allProfiles.find(p => p.public_id === myPublicId)?.avatar_seed)}</span>
              <span className="text-xs text-gray-600">You</span>
            </div>
            <span className={`text-lg font-bold ${isComplete && isWinner ? 'text-green-600' : 'text-gray-800'}`}>
              {finalMyScore}
            </span>
          </div>
          
          <div className="flex items-center justify-between bg-white rounded p-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{opponent ? getAvatarEmoji(opponent.avatar_seed) : '🌟'}</span>
              <span className="text-xs text-gray-600">{opponent?.nickname || 'Friend'}</span>
            </div>
            <span className={`text-lg font-bold ${isComplete && !isWinner && !isDraw ? 'text-green-600' : 'text-gray-800'}`}>
              {finalOpponentScore}
            </span>
          </div>
        </div>
        
        {isComplete && !alreadyClaimed && (
          <Button
            onClick={() => onClaim(displayDuel)}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Claim Rewards
          </Button>
        )}
        
        {isComplete && alreadyClaimed && (
          <div className="text-center text-xs text-gray-500">Rewards claimed ✓</div>
        )}
      </motion.div>
    );
  }
  
  return null;
};

export default function DuelsTab({ myProfile, friends }) {
  const queryClient = useQueryClient();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  const { data: userProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    }
  });
  
  const { data: incomingDuels = [] } = useQuery({
    queryKey: ['incomingDuels', myProfile?.public_id],
    queryFn: () => listIncomingDuels(myProfile.public_id),
    enabled: !!myProfile
  });
  
  const { data: activeDuels = [] } = useQuery({
    queryKey: ['activeDuels', myProfile?.public_id],
    queryFn: () => listActiveDuels(myProfile.public_id),
    enabled: !!myProfile,
    refetchInterval: 30000 // Refetch every 30s
  });
  
  const { data: completedDuels = [] } = useQuery({
    queryKey: ['completedDuels', myProfile?.public_id],
    queryFn: () => listCompletedDuels(myProfile.public_id),
    enabled: !!myProfile
  });
  
  const { data: activeDuelCount = 0 } = useQuery({
    queryKey: ['activeDuelCount', myProfile?.public_id],
    queryFn: () => getActiveDuelCount(myProfile.public_id),
    enabled: !!myProfile
  });
  
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const createDuelMutation = useMutation({
    mutationFn: async ({ friendId, type, duration }) => {
      await createDuel(myProfile.public_id, friendId, type, duration);
    },
    onSuccess: () => {
      toast.success('Duel challenge sent! 🥊');
      setSelectedFriend(null);
      setSelectedType(null);
      queryClient.invalidateQueries({ queryKey: ['incomingDuels'] });
      queryClient.invalidateQueries({ queryKey: ['activeDuels'] });
    },
    onError: () => {
      toast.error('Failed to create duel');
    }
  });
  
  const acceptDuelMutation = useMutation({
    mutationFn: acceptDuel,
    onSuccess: () => {
      toast.success('Duel accepted! Let the challenge begin! ⚔️');
      queryClient.invalidateQueries({ queryKey: ['incomingDuels'] });
      queryClient.invalidateQueries({ queryKey: ['activeDuels'] });
      queryClient.invalidateQueries({ queryKey: ['activeDuelCount'] });
    },
    onError: () => {
      toast.error('Failed to accept duel');
    }
  });
  
  const declineDuelMutation = useMutation({
    mutationFn: declineDuel,
    onSuccess: () => {
      toast.success('Duel declined');
      queryClient.invalidateQueries({ queryKey: ['incomingDuels'] });
    },
    onError: () => {
      toast.error('Failed to decline duel');
    }
  });
  
  const claimRewardsMutation = useMutation({
    mutationFn: async (duel) => {
      return await claimRewards(duel, myProfile.public_id, userProgress);
    },
    onSuccess: (result) => {
      toast.success(`Claimed ${result.sprouts} sprouts! ${result.isWinner ? '🏆' : '✨'}`);
      queryClient.invalidateQueries({ queryKey: ['completedDuels'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to claim rewards');
    }
  });
  
  const handleCreateDuel = () => {
    if (!selectedFriend || !selectedType) {
      toast.error('Select a friend and duel type');
      return;
    }
    
    if (activeDuelCount >= 2) {
      toast.error('Maximum 2 active duels at once');
      return;
    }
    
    const duelType = duelTypes.find(d => d.key === selectedType);
    createDuelMutation.mutate({
      friendId: selectedFriend,
      type: duelType.key,
      duration: duelType.duration
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Swords className="w-12 h-12 mx-auto text-purple-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-800">Duels</h3>
        <p className="text-xs text-gray-600">Challenge friends to friendly competitions</p>
      </div>
      
      {/* Start New Duel */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
        <p className="font-semibold text-sm text-gray-800 mb-3">Start New Duel</p>
        
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Select Friend</p>
          <div className="grid grid-cols-2 gap-2">
            {friends.slice(0, 6).map(friend => (
              <button
                key={friend.public_id}
                onClick={() => setSelectedFriend(friend.public_id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedFriend === friend.public_id
                    ? 'border-purple-400 bg-purple-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAvatarEmoji(friend.avatar_seed)}</span>
                  <span className="text-xs font-medium truncate">{friend.nickname}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Choose Challenge</p>
          <div className="space-y-2">
            {duelTypes.map(dt => {
              const info = getDuelTypeInfo(dt.key);
              return (
                <button
                  key={dt.key}
                  onClick={() => setSelectedType(dt.key)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    selectedType === dt.key
                      ? 'border-purple-400 bg-purple-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{info.emoji}</span>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-gray-800">{info.name}</p>
                        <p className="text-xs text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{dt.duration}h</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <Button
          onClick={handleCreateDuel}
          disabled={!selectedFriend || !selectedType || createDuelMutation.isPending || activeDuelCount >= 2}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {createDuelMutation.isPending ? 'Sending...' : 'Send Challenge'}
        </Button>
        
        {activeDuelCount >= 2 && (
          <p className="text-xs text-center text-red-600 mt-2">Max 2 active duels</p>
        )}
      </div>
      
      {/* Incoming Challenges */}
      {incomingDuels.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Incoming Challenges</h4>
          <div className="space-y-2">
            {incomingDuels.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                myPublicId={myProfile.public_id}
                allProfiles={allProfiles}
                onAccept={(id) => acceptDuelMutation.mutate(id)}
                onDecline={(id) => declineDuelMutation.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Active Duels */}
      {activeDuels.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Active Duels</h4>
          <div className="space-y-2">
            {activeDuels.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                myPublicId={myProfile.public_id}
                allProfiles={allProfiles}
                onClaim={(d) => claimRewardsMutation.mutate(d)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Results */}
      {completedDuels.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Recent Results</h4>
          <div className="space-y-2">
            {completedDuels.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                myPublicId={myProfile.public_id}
                allProfiles={allProfiles}
                onClaim={(d) => claimRewardsMutation.mutate(d)}
              />
            ))}
          </div>
        </div>
      )}
      
      {incomingDuels.length === 0 && activeDuels.length === 0 && completedDuels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Swords className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">No duels yet. Challenge a friend above!</p>
        </div>
      )}
    </div>
  );
}