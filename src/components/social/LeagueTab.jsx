import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Swords, Trophy, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { 
  getWeek,
  getOrAssignTeam,
  assignTeam,
  getTeamTotals,
  getUserContribution,
  getFriendsLeaderboard
} from './leagueHelper';

const teamInfo = {
  mosswood: {
    name: 'Mosswood',
    emoji: '🌲',
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-300',
    bgColor: 'bg-green-50'
  },
  brookside: {
    name: 'Brookside',
    emoji: '💧',
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50'
  },
  firefly: {
    name: 'Firefly',
    emoji: '✨',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50'
  }
};

const avatarEmojis = ['🌱', '🍄', '🌿', '🌸', '🪨', '💧', '✨', '🔥'];

const getAvatarEmoji = (seed) => {
  if (!seed) return '🌱';
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarEmojis[index % avatarEmojis.length];
};

export default function LeagueTab({ myProfile, friends }) {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    }
  });

  const week = getWeek(userProgress);
  const currentTeam = myProfile?.league_week === week ? myProfile?.league_team : null;

  const { data: teamTotals } = useQuery({
    queryKey: ['teamTotals', week],
    queryFn: () => getTeamTotals(week),
    enabled: !!week
  });

  const { data: myContribution } = useQuery({
    queryKey: ['myContribution', myProfile?.public_id, week],
    queryFn: () => getUserContribution(myProfile.public_id, week),
    enabled: !!myProfile && !!week
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', myProfile?.public_id, week],
    queryFn: () => {
      const friendIds = friends.map(f => f.public_id);
      return getFriendsLeaderboard(myProfile.public_id, friendIds, week);
    },
    enabled: !!myProfile && !!week
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (team) => {
      await assignTeam(myProfile, team, week);
    },
    onSuccess: () => {
      toast.success('Team joined! Go explore the map to earn embers 🔥');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myContribution'] });
      queryClient.invalidateQueries({ queryKey: ['teamTotals'] });
    },
    onError: () => {
      toast.error('Failed to join team');
    }
  });

  const getProfileForContribution = (publicId) => {
    return allProfiles.find(p => p.public_id === publicId);
  };

  // Team Selection UI
  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Swords className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Join a Team This Week!</h3>
          <p className="text-sm text-gray-600 mb-1">
            Choose your circle and help your team collect embers 🔥
          </p>
          <p className="text-xs text-gray-500">
            Scout, restore, and bloom tiles to earn embers for your team
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(teamInfo).map(([teamKey, info]) => (
            <motion.button
              key={teamKey}
              onClick={() => setSelectedTeam(teamKey)}
              whileHover={{ scale: 1.02 }}
              className={`w-full p-6 rounded-2xl border-3 transition-all ${
                selectedTeam === teamKey
                  ? `${info.borderColor} bg-gradient-to-r ${info.color} text-white shadow-lg`
                  : `${info.borderColor} ${info.bgColor} hover:shadow-md`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{info.emoji}</span>
                  <div className="text-left">
                    <p className={`font-bold text-lg ${selectedTeam === teamKey ? 'text-white' : 'text-gray-800'}`}>
                      {info.name}
                    </p>
                    <p className={`text-sm ${selectedTeam === teamKey ? 'text-white/90' : 'text-gray-600'}`}>
                      {teamTotals?.[teamKey]?.toLocaleString() || 0} embers this week
                    </p>
                  </div>
                </div>
                {selectedTeam === teamKey && (
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <Button
          onClick={() => joinTeamMutation.mutate(selectedTeam)}
          disabled={!selectedTeam || joinTeamMutation.isPending}
          className="w-full bg-purple-500 hover:bg-purple-600 text-lg py-6"
        >
          {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
        </Button>
      </div>
    );
  }

  // Main League View
  const myTeamInfo = teamInfo[currentTeam];
  const maxEmbers = Math.max(
    teamTotals?.mosswood || 0,
    teamTotals?.brookside || 0,
    teamTotals?.firefly || 0,
    1
  );

  return (
    <div className="space-y-6">
      {/* Your Team */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border-3 ${myTeamInfo.borderColor} bg-gradient-to-r ${myTeamInfo.color} text-white`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{myTeamInfo.emoji}</span>
            <div>
              <p className="text-sm opacity-90">Your Team</p>
              <p className="text-2xl font-bold">{myTeamInfo.name}</p>
            </div>
          </div>
          <Flame className="w-8 h-8 opacity-80" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-90">Your embers:</span>
          <span className="text-2xl font-bold">{myContribution?.embers || 0} 🔥</span>
        </div>
      </motion.div>

      {/* Team Standings */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Team Standings (Week {week})
        </h3>
        <div className="space-y-3">
          {Object.entries(teamInfo).map(([teamKey, info]) => {
            const embers = teamTotals?.[teamKey] || 0;
            const percentage = (embers / maxEmbers) * 100;
            return (
              <div key={teamKey} className={`p-4 rounded-xl ${info.bgColor} border-2 ${info.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.emoji}</span>
                    <span className="font-bold text-gray-800">{info.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{embers.toLocaleString()} 🔥</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${info.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Friends Leaderboard */}
      {leaderboard.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Friends Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((contribution, index) => {
              const profile = getProfileForContribution(contribution.public_id);
              const isMe = contribution.public_id === myProfile.public_id;
              const teamColor = teamInfo[contribution.team];
              return (
                <div
                  key={contribution.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                    isMe
                      ? `${teamColor.borderColor} ${teamColor.bgColor} shadow-sm`
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-xl font-bold text-gray-400 w-6 text-center">
                    {index + 1}
                  </span>
                  <span className="text-2xl">{profile ? getAvatarEmoji(profile.avatar_seed) : '🌟'}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {profile?.nickname || 'Friend'}
                      {isMe && <span className="text-xs text-gray-500 ml-2">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {teamInfo[contribution.team].emoji} {teamInfo[contribution.team].name}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {contribution.embers} 🔥
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How to Earn */}
      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
        <p className="text-sm font-semibold text-purple-800 mb-2">How to Earn Embers 🔥</p>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• Scout a tile: <strong>1 ember</strong></li>
          <li>• Restore a tile: <strong>3 embers</strong></li>
          <li>• Bloom a tile: <strong>7 embers</strong></li>
        </ul>
      </div>
    </div>
  );
}