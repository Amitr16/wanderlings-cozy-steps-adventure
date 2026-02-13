import { base44 } from '@/api/base44Client';

// Generate quests for a specific day based on the 28-day blueprint
export async function generateDailyQuests(day, userEmail, personalStepGoal = 3000) {
  const miniGoal = Math.floor(personalStepGoal * 0.6);
  const psg = personalStepGoal;
  const stretchGoal = Math.floor(personalStepGoal * 1.2);

  // Define quest patterns for each week
  const questPatterns = {
    // Week 1: Days 1-7 (Onboarding & Foundation)
    1: { move: 'mini_goal', world: 'scout', cozy: 'campfire' },
    2: { move: 'mini_goal', world: 'scout', cozy: 'campfire' },
    3: { move: 'psg', world: 'restore', cozy: 'campfire' },
    4: { move: 'psg', world: 'restore', cozy: 'decoration' },
    5: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    6: { move: 'psg', world: 'restore', cozy: 'decoration' },
    7: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    
    // Week 2: Days 8-14 (Expansion)
    8: { move: 'mini_goal', world: 'scout', cozy: 'campfire' },
    9: { move: 'psg', world: 'restore', cozy: 'decoration' },
    10: { move: 'psg', world: 'restore', cozy: 'campfire' },
    11: { move: 'stretch_goal', world: 'bloom', cozy: 'decoration' },
    12: { move: 'psg', world: 'restore', cozy: 'campfire' },
    13: { move: 'stretch_goal', world: 'bloom', cozy: 'decoration' },
    14: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    
    // Week 3: Days 15-21 (Mastery)
    15: { move: 'mini_goal', world: 'scout', cozy: 'campfire' },
    16: { move: 'psg', world: 'restore', cozy: 'decoration' },
    17: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    18: { move: 'psg', world: 'restore', cozy: 'decoration' },
    19: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    20: { move: 'stretch_goal', world: 'bloom', cozy: 'decoration' },
    21: { move: 'stretch_goal', world: 'bloom', cozy: 'campfire' },
    
    // Week 4: Days 22-28 (Festival & Celebration)
    22: { move: 'psg', world: 'restore', cozy: 'festival_lantern' },
    23: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' },
    24: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' },
    25: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' },
    26: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' },
    27: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' },
    28: { move: 'stretch_goal', world: 'bloom', cozy: 'festival_lantern' }
  };

  const pattern = questPatterns[day] || questPatterns[1];
  const quests = [];

  // Move Quest
  const moveQuests = {
    mini_goal: {
      title: 'Mini Goal',
      description: `Reach ${miniGoal.toLocaleString()} steps`,
      target_amount: miniGoal,
      glow_reward: 5,
      sprout_reward: 10
    },
    psg: {
      title: 'Daily Goal',
      description: `Reach ${psg.toLocaleString()} steps`,
      target_amount: psg,
      glow_reward: 10,
      sprout_reward: 15
    },
    stretch_goal: {
      title: 'Stretch Goal!',
      description: `Reach ${stretchGoal.toLocaleString()} steps`,
      target_amount: stretchGoal,
      glow_reward: 15,
      sprout_reward: 20
    }
  };

  quests.push({
    day,
    quest_type: 'move',
    title: moveQuests[pattern.move].title,
    description: moveQuests[pattern.move].description,
    target_metric: pattern.move,
    target_amount: moveQuests[pattern.move].target_amount,
    glow_reward: moveQuests[pattern.move].glow_reward,
    sprout_reward: moveQuests[pattern.move].sprout_reward,
    festival_token_reward: day >= 22 ? 5 : 0,
    created_by: userEmail
  });

  // World Quest
  const worldQuests = {
    scout: {
      title: 'Explore the Forest',
      description: 'Scout 2 new tiles',
      target_amount: 2,
      sprout_reward: 10
    },
    restore: {
      title: 'Restore Nature',
      description: 'Restore 2 tiles',
      target_amount: 2,
      sprout_reward: 15
    },
    bloom: {
      title: 'Full Bloom',
      description: 'Bloom 1 tile to perfection',
      target_amount: 1,
      sprout_reward: 20
    }
  };

  quests.push({
    day,
    quest_type: 'world',
    title: worldQuests[pattern.world].title,
    description: worldQuests[pattern.world].description,
    target_metric: pattern.world,
    target_amount: worldQuests[pattern.world].target_amount,
    sprout_reward: worldQuests[pattern.world].sprout_reward,
    festival_token_reward: day >= 22 ? 5 : 0,
    created_by: userEmail
  });

  // Cozy Quest
  const cozyQuests = {
    campfire: {
      title: 'Campfire Moment',
      description: 'Visit your camp',
      target_amount: 1,
      glow_reward: 5,
      sprout_reward: 5
    },
    decoration: {
      title: 'Decorate Camp',
      description: 'Add beauty to your space',
      target_amount: 1,
      glow_reward: 5,
      sprout_reward: 10
    },
    festival_lantern: {
      title: 'Festival Lantern',
      description: 'Light a festival lantern',
      target_amount: 1,
      glow_reward: 10,
      sprout_reward: 10,
      festival_token_reward: 10
    }
  };

  quests.push({
    day,
    quest_type: 'cozy',
    title: cozyQuests[pattern.cozy].title,
    description: cozyQuests[pattern.cozy].description,
    target_metric: pattern.cozy,
    target_amount: cozyQuests[pattern.cozy].target_amount,
    glow_reward: cozyQuests[pattern.cozy].glow_reward || 0,
    sprout_reward: cozyQuests[pattern.cozy].sprout_reward,
    festival_token_reward: cozyQuests[pattern.cozy].festival_token_reward || 0,
    created_by: userEmail
  });

  // Create quests in database
  await base44.entities.Quest.bulkCreate(quests);
  
  return quests;
}

// Check if it's a new day and handle day rollover
export async function handleDayRollover(progress) {
  const today = new Date().toISOString().split('T')[0];
  const lastLogin = progress.last_login_date;

  if (lastLogin !== today) {
    const user = await base44.auth.me();
    
    // Calculate new season day
    let newSeasonDay = progress.season_day + 1;
    let newWeek = progress.current_week;
    
    // Reset to Day 1 if season complete
    if (newSeasonDay > 28) {
      newSeasonDay = 1;
      newWeek = 1;
    } else {
      // Calculate week (1-4)
      newWeek = Math.ceil(newSeasonDay / 7);
    }

    // Update progress
    await base44.entities.UserProgress.update(progress.id, {
      season_day: newSeasonDay,
      current_week: newWeek,
      today_steps: 0,
      last_login_date: today
    });

    // Delete old quests
    const oldQuests = await base44.entities.Quest.filter({ created_by: user.email });
    for (const quest of oldQuests) {
      await base44.entities.Quest.delete(quest.id);
    }

    // Generate new quests for the new day
    await generateDailyQuests(newSeasonDay, user.email, progress.personal_step_goal);

    return { dayChanged: true, newDay: newSeasonDay, newWeek };
  }

  return { dayChanged: false };
}