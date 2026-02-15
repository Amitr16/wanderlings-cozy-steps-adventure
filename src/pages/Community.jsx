import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Gift, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { 
  getOrCreateProfile, 
  sendFriendRequest, 
  getFriendProfiles,
  getPendingRequests 
} from '../components/social/profileHelper';
import FriendsList from '../components/social/FriendsList';
import FriendRequestCard from '../components/social/FriendRequestCard';
import LanternsTab from '../components/social/LanternsTab';
import LeagueTab from '../components/social/LeagueTab';
import DuelsTab from '../components/social/DuelsTab';

const createPageUrl = (pageName) => `/${pageName}`;

export default function Community() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('friends');
  
  const tabs = ['friends', 'lanterns', 'league', 'duels'];
  const [friendCodeInput, setFriendCodeInput] = useState('');

  const { data: myProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: getOrCreateProfile
  });

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends', myProfile?.public_id],
    queryFn: () => getFriendProfiles(myProfile.public_id),
    enabled: !!myProfile
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pendingRequests', myProfile?.public_id],
    queryFn: () => getPendingRequests(myProfile.public_id),
    enabled: !!myProfile
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendCode) => {
      return await sendFriendRequest(myProfile.public_id, friendCode);
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      setFriendCodeInput('');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send friend request');
    }
  });

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;
    addFriendMutation.mutate(friendCodeInput);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { data: unclaimedCount = 0 } = useQuery({
    queryKey: ['unclaimedLanterns', myProfile?.public_id],
    queryFn: async () => {
      const { getAllLanterns } = await import('../components/social/lanternHelper');
      const lanterns = await getAllLanterns(myProfile.public_id);
      return lanterns.filter(l => !l.claimed_at).length;
    },
    enabled: !!myProfile
  });

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'lanterns', label: 'Lanterns', icon: Gift, badge: unclaimedCount },
    { id: 'league', label: 'League', icon: Swords }
  ];

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
            <div className="text-sm text-gray-600">
              {myProfile?.friend_code}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title & Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🌟 Community</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Your Friend Code:</span>
            <code className="bg-green-100 px-3 py-1 rounded-lg font-bold text-green-700">
              {myProfile?.friend_code}
            </code>
          </div>
          <p className="text-xs text-gray-500 mt-1">Share this code with friends to connect</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border-2 border-green-200 mb-6"
        >
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'friends' && (
              <div>
                {/* Add Friend */}
                <form onSubmit={handleAddFriend} className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Add Friend by Code
                  </label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="MOSS-4K9D"
                      value={friendCodeInput}
                      onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                      className="flex-1"
                      maxLength={9}
                    />
                    <Button 
                      type="submit" 
                      disabled={addFriendMutation.isPending || !friendCodeInput.trim()}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {addFriendMutation.isPending ? 'Sending...' : 'Send Request'}
                    </Button>
                  </div>
                </form>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3">Pending Requests</h3>
                    <div className="space-y-2">
                      {pendingRequests.map((req) => (
                        <FriendRequestCard 
                          key={req.id} 
                          request={req} 
                          myPublicId={myProfile.public_id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Friends List */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">
                    Your Friends ({friends.length})
                  </h3>
                  {loadingFriends ? (
                    <p className="text-gray-500 text-center py-8">Loading friends...</p>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="text-4xl mb-3">👥</div>
                      <p className="text-gray-600">No friends yet</p>
                      <p className="text-sm text-gray-500 mt-1">Share your friend code to connect!</p>
                    </div>
                  ) : (
                    <FriendsList friends={friends} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'lanterns' && (
              <LanternsTab myProfile={myProfile} friends={friends} />
            )}

            {activeTab === 'league' && (
              <LeagueTab myProfile={myProfile} friends={friends} />
            )}

            {activeTab === 'duels' && (
              <DuelsTab myProfile={myProfile} friends={friends} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}