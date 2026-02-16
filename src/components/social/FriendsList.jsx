import React from 'react';
import { motion } from 'framer-motion';
import ProfileDisplay from '../cosmetics/ProfileDisplay';

export default function FriendsList({ friends }) {
  return (
    <div className="space-y-2">
      {friends.map((friend, index) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-colors"
        >
          <ProfileDisplay profile={friend} size="md" showTitle={true} />
        </motion.div>
      ))}
    </div>
  );
}