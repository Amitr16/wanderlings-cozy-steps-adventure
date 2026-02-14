import React from 'react';
import { motion } from 'framer-motion';

const avatarEmojis = ['🌱', '🍄', '🌿', '🌸', '🪨', '💧', '✨', '🔥'];

const getAvatarEmoji = (seed) => {
  if (!seed) return '🌱';
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarEmojis[index % avatarEmojis.length];
};

export default function FriendsList({ friends }) {
  return (
    <div className="space-y-2">
      {friends.map((friend, index) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors"
        >
          <div className="text-4xl">
            {getAvatarEmoji(friend.avatar_seed)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{friend.nickname}</p>
            <p className="text-xs text-gray-500">{friend.friend_code}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}