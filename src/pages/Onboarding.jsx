import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import MosslingDisplay from '../components/creature/MosslingDisplay';
const createPageUrl = (pageName) => `/${pageName}`;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Create user progress
      await base44.entities.UserProgress.create({
        creature_type: 'mossling',
        glow: 15,
        sprouts: 0,
        total_steps: 0,
        today_steps: 0,
        tiles_restored: 0,
        creature_mood: 100,
        onboarding_complete: true,
        last_login_date: new Date().toISOString().split('T')[0],
        created_by: user.email
      });

      // Create initial map tiles (5x5 grid)
      const tiles = [];
      const biomes = ['forest', 'meadow', 'pond', 'grove', 'mushroom'];
      
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          tiles.push({
            position_x: x,
            position_y: y,
            state: x === 2 && y === 2 ? 'restored' : 'fogged', // Center tile starts restored
            biome: biomes[Math.floor(Math.random() * biomes.length)],
            sprout_reward: 5,
            created_by: user.email
          });
        }
      }

      await base44.entities.MapTile.bulkCreate(tiles);

      // Create initial daily quests
      const quests = [
        {
          title: 'First Steps',
          description: 'Take 500 steps today',
          quest_type: 'daily',
          target_metric: 'steps',
          target_amount: 500,
          current_progress: 0,
          glow_reward: 10,
          sprout_reward: 5,
          created_by: user.email
        },
        {
          title: 'Reveal the Forest',
          description: 'Reveal 2 new tiles',
          quest_type: 'daily',
          target_metric: 'tiles_revealed',
          target_amount: 2,
          current_progress: 0,
          glow_reward: 15,
          sprout_reward: 10,
          created_by: user.email
        },
        {
          title: 'Restore Nature',
          description: 'Restore 1 tile to its natural beauty',
          quest_type: 'daily',
          target_metric: 'tiles_restored',
          target_amount: 1,
          current_progress: 0,
          glow_reward: 20,
          sprout_reward: 15,
          created_by: user.email
        }
      ];

      await base44.entities.Quest.bulkCreate(quests);

      navigate(createPageUrl('Camp'));
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps_content = [
    {
      title: 'Welcome to Wanderlings',
      description: 'A magical world where your steps restore nature',
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-8xl">🌲✨</div>
          <p className="text-gray-600 text-center max-w-md">
            Walk in real life, help tiny creatures restore a magical forest, and watch your village become more beautiful every day.
          </p>
        </div>
      )
    },
    {
      title: 'Meet Your Mossling',
      description: 'Your cozy companion on this journey',
      content: (
        <div className="flex flex-col items-center gap-6">
          <MosslingDisplay size="xl" mood={100} animate={true} />
          <p className="text-gray-600 text-center max-w-md">
            This little friend will join you as you explore the magical forest. They love seeing tiles restored and nature flourishing!
          </p>
        </div>
      )
    },
    {
      title: 'How It Works',
      description: 'Simple and rewarding',
      content: (
        <div className="space-y-4 max-w-md">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-2xl">👣</div>
            <div>
              <h4 className="font-semibold text-gray-800">Walk Every Day</h4>
              <p className="text-sm text-gray-600">Your steps convert into magical Glow energy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-2xl">🗺️</div>
            <div>
              <h4 className="font-semibold text-gray-800">Explore the Map</h4>
              <p className="text-sm text-gray-600">Use Glow to reveal and restore forest tiles</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-2xl">⭐</div>
            <div>
              <h4 className="font-semibold text-gray-800">Complete Quests</h4>
              <p className="text-sm text-gray-600">Earn rewards and make your Mossling happy</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps_content[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          >
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps_content.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {currentStep.title}
              </h1>
              <p className="text-lg text-gray-500">
                {currentStep.description}
              </p>
            </div>

            <div className="flex justify-center mb-8">
              {currentStep.content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-gray-600"
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {step < steps_content.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {loading ? 'Starting...' : 'Start Your Journey'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}