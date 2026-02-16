import { base44 } from '@/api/base44Client';

// XP curve: formula = 40*level + 10*level^2
export const XP_CURVE = [
  0,     // Level 1
  50,    // Level 2
  120,   // Level 3
  200,   // Level 4
  300,   // Level 5
  420,   // Level 6
  560,   // Level 7
  720,   // Level 8
  900,   // Level 9
  1100,  // Level 10
  1320,  // Level 11
  1560,  // Level 12
  1820,  // Level 13
  2100,  // Level 14
  2400,  // Level 15
  2720,  // Level 16
  3060,  // Level 17
  3420,  // Level 18
  3800,  // Level 19
  4200,  // Level 20
];

// XP per action type
export const XP_PER_ACTION = {
  'tile_scouted': 2,
  'tile_restored': 6,
  'tile_bloomed': 14
};

// Convert XP to level
export const xpToLevel = (xp) => {
  for (let i = XP_CURVE.length - 1; i >= 0; i--) {
    if (xp >= XP_CURVE[i]) return i + 1;
  }
  return 1;
};

// Get XP needed for next level
export const xpForNextLevel = (currentLevel) => {
  if (currentLevel >= XP_CURVE.length) return null; // max level
  return XP_CURVE[currentLevel];
};

// Get active season
export const getActiveSeason = async () => {
  const seasons = await base44.entities.Season.filter({ is_active: true });
  return seasons && seasons.length > 0 ? seasons[0] : null;
};

// Get or create SeasonProgress for a user
export const getOrCreateSeasonProgress = async (seasonId, publicId) => {
  const existing = await base44.entities.SeasonProgress.filter({
    season_id: seasonId,
    public_id: publicId
  });
  
  if (existing && existing.length > 0) return existing[0];
  
  return await base44.entities.SeasonProgress.create({
    season_id: seasonId,
    public_id: publicId,
    season_xp: 0,
    season_level: 1,
    claimed_levels: []
  });
};

// Award Season XP (idempotent)
export const awardSeasonXP = async ({
  seasonId,
  publicId,
  sourceType,
  sourceId,
  xp
}) => {
  // Build unique event key
  const eventKey = `${seasonId}:${publicId}:${sourceType}:${sourceId}`;
  
  // Check if already awarded
  const existing = await base44.entities.SeasonEventLog.filter({ event_key: eventKey });
  if (existing && existing.length > 0) return existing[0];
  
  // Create event log
  const logEntry = await base44.entities.SeasonEventLog.create({
    event_key: eventKey,
    season_id: seasonId,
    public_id: publicId,
    source_type: sourceType,
    source_id: sourceId,
    xp
  });
  
  // Update SeasonProgress
  const progress = await getOrCreateSeasonProgress(seasonId, publicId);
  const newXP = progress.season_xp + xp;
  const newLevel = xpToLevel(newXP);
  
  await base44.entities.SeasonProgress.update(progress.id, {
    season_xp: newXP,
    season_level: newLevel,
    last_xp_award_at: new Date().toISOString()
  });
  
  return logEntry;
};

// Get rewards for a specific level
export const getRewardsForLevel = async (seasonId, level) => {
  return await base44.entities.SeasonReward.filter({
    season_id: seasonId,
    level
  });
};

// Get all rewards for a season
export const getAllSeasonRewards = async (seasonId) => {
  const rewards = await base44.entities.SeasonReward.filter({ season_id: seasonId });
  return (rewards || []).sort((a, b) => a.level - b.level);
};

// Claim reward for a level
export const claimReward = async (seasonId, publicId, level) => {
  const progress = await getOrCreateSeasonProgress(seasonId, publicId);
  
  // Verify level is achieved and not claimed
  if (progress.season_level < level) {
    throw new Error('Level not yet reached');
  }
  
  if (progress.claimed_levels.includes(level)) {
    throw new Error('Reward already claimed');
  }
  
  // Get rewards for this level
  const rewards = await getRewardsForLevel(seasonId, level);
  
  // Grant each reward
  for (const reward of rewards) {
    if (reward.reward_type === 'sprouts') {
      // Update UserProgress
      const user = await base44.auth.me();
      const userProgress = await base44.entities.UserProgress.filter({ created_by: user.email });
      if (userProgress && userProgress[0]) {
        await base44.entities.UserProgress.update(userProgress[0].id, {
          sprouts: userProgress[0].sprouts + reward.reward_payload.amount
        });
      }
    } else if (reward.reward_type === 'cosmetic' || reward.reward_type === 'title' || reward.reward_type === 'badge') {
      // Add to inventory
      const existing = await base44.entities.CosmeticInventory.filter({
        public_id: publicId,
        item_id: reward.reward_payload.item_id
      });
      
      if (!existing || existing.length === 0) {
        await base44.entities.CosmeticInventory.create({
          public_id: publicId,
          item_id: reward.reward_payload.item_id,
          item_type: reward.reward_type === 'badge' ? 'badge' : reward.reward_payload.item_type || 'profile',
          source: 'season'
        });
      }
    }
  }
  
  // Mark level as claimed
  await base44.entities.SeasonProgress.update(progress.id, {
    claimed_levels: [...progress.claimed_levels, level]
  });
  
  return rewards;
};

// Get unclaimed levels
export const getUnclaimedLevels = (progress) => {
  const unclaimed = [];
  for (let i = 1; i <= progress.season_level; i++) {
    if (!progress.claimed_levels.includes(i)) {
      unclaimed.push(i);
    }
  }
  return unclaimed;
};