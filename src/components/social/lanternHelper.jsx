import { base44 } from '@/api/base44Client';

// Get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Check if user can send a lantern today
export const canSendLanternToday = async (myProfile) => {
  if (!myProfile.last_lantern_sent_date) return true;
  return myProfile.last_lantern_sent_date !== getTodayDateString();
};

// Send a lantern gift to a friend
export const sendLantern = async (myProfile, friendPublicId) => {
  const canSend = await canSendLanternToday(myProfile);
  if (!canSend) throw new Error('Already sent a lantern today');

  // Create gift
  await base44.entities.Gift.create({
    from_public_id: myProfile.public_id,
    to_public_id: friendPublicId,
    type: 'lantern'
  });

  // Update sender's last sent date
  await base44.entities.UserProfile.update(myProfile.id, {
    last_lantern_sent_date: getTodayDateString()
  });
};

// Get unclaimed lanterns for current user
export const getUnclaimedLanterns = async (myPublicId) => {
  const allGifts = await base44.entities.Gift.filter({ 
    to_public_id: myPublicId,
    type: 'lantern'
  });
  
  return (allGifts || []).filter(g => !g.claimed_at);
};

// Get all lanterns (inbox) for current user
export const getAllLanterns = async (myPublicId) => {
  return await base44.entities.Gift.filter({ 
    to_public_id: myPublicId,
    type: 'lantern'
  });
};

// Claim a lantern gift
export const claimLantern = async (gift, userProgressId) => {
  if (gift.claimed_at) throw new Error('Already claimed');

  // Mark as claimed
  await base44.entities.Gift.update(gift.id, {
    claimed_at: new Date().toISOString()
  });

  // Get current progress
  const progress = await base44.entities.UserProgress.get(userProgressId);
  
  // Add free scout token
  await base44.entities.UserProgress.update(userProgressId, {
    free_scout_tokens: (progress.free_scout_tokens || 0) + 1
  });
};

// Send thank reaction
export const sendThankReaction = async (giftId, emoji) => {
  await base44.entities.Gift.update(giftId, {
    thank_reaction: emoji
  });
};