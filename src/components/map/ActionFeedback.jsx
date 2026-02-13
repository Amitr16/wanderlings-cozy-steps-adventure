import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionFeedback({ message, rewards, isVisible, onComplete }) {
  if (!isVisible) return null;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "backOut" }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-300 min-w-[280px]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="text-center mb-4"
          >
            <div className="text-6xl mb-2">✨</div>
            <h3 className="text-xl font-bold text-gray-800">{message}</h3>
          </motion.div>

          {rewards && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              {rewards.sprouts > 0 && (
                <div className="flex items-center justify-center gap-2 bg-green-50 rounded-lg px-4 py-2">
                  <span className="text-2xl">🌱</span>
                  <span className="font-bold text-green-600">+{rewards.sprouts}</span>
                  <span className="text-gray-600">Sprouts</span>
                </div>
              )}
              {rewards.mood > 0 && (
                <div className="flex items-center justify-center gap-2 bg-purple-50 rounded-lg px-4 py-2">
                  <span className="text-2xl">💚</span>
                  <span className="font-bold text-purple-600">+{rewards.mood}</span>
                  <span className="text-gray-600">Mood</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}