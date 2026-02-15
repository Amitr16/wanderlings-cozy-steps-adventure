import { base44 } from '@/api/base44Client';

const duelTypeInfo = {
  bloom_2: {
    name: 'Bloom Challenge',
    description: 'Most tiles bloomed',
    emoji: '🌸',
    target: 2
  },
  restore_3: {
    name: 'Restore Challenge',
    description: 'Most tiles restored',
    emoji: '🌱',
    target: 3
  },
  embers_24h: {
    name: '24h Ember Race',
    description: 'Most embers earned',
    emoji: '🔥',
    target: 50
  }
};

export const getDuelTypeInfo = (type) => duelTypeInfo[type] || duelTypeInfo.bloom_2;

// Create a new duel challenge
export const createDuel = async (fromPublicId, toPublicId, type, durationHours) => {
  return await base44.entities.Duel.create({
    from_public_id: fromPublicId,
    to_public_id: toPublicId,
    type,
    duration_hours: durationHours,
    status: 'pending',
    score_from: 0,
    score_to: 0
  });
};

// Accept a duel (sets start/end times)
export const acceptDuel = async (duelId) => {
  const allDuels = await base44.entities.Duel.list();
  const duel = allDuels?.find(d => d.id === duelId);
  if (!duel) throw new Error('Duel not found');
  
  const now = new Date();
  const endTime = new Date(now.getTime() + duel.duration_hours * 60 * 60 * 1000);
  
  await base44.entities.Duel.update(duelId, {
    status: 'active',
    start_at: now.toISOString(),
    end_at: endTime.toISOString()
  });
};

// Decline a duel
export const declineDuel = async (duelId) => {
  await base44.entities.Duel.update(duelId, {
    status: 'declined'
  });
};

// List incoming duel requests
export const listIncomingDuels = async (myPublicId) => {
  const duels = await base44.entities.Duel.filter({
    to_public_id: myPublicId,
    status: 'pending'
  });
  return duels || [];
};

// List active duels
export const listActiveDuels = async (myPublicId) => {
  const allDuels = await base44.entities.Duel.list();
  if (!allDuels) return [];
  
  const now = new Date();
  return allDuels.filter(d => 
    d.status === 'active' && 
    (d.from_public_id === myPublicId || d.to_public_id === myPublicId) &&
    new Date(d.end_at) > now
  );
};

// List completed duels
export const listCompletedDuels = async (myPublicId) => {
  const allDuels = await base44.entities.Duel.list();
  if (!allDuels) return [];
  
  return allDuels
    .filter(d => 
      d.status === 'complete' && 
      (d.from_public_id === myPublicId || d.to_public_id === myPublicId)
    )
    .sort((a, b) => new Date(b.end_at) - new Date(a.end_at))
    .slice(0, 10);
};

// Compute score for a duel participant (compute on read)
export const computeScore = async (duel, publicId) => {
  if (!duel.start_at || !duel.end_at) return 0;
  
  const allEvents = await base44.entities.ActionEvent.filter({ public_id: publicId });
  if (!allEvents) return 0;
  
  const startTime = new Date(duel.start_at);
  const endTime = new Date(duel.end_at);
  
  const relevantEvents = allEvents.filter(e => {
    const timestamp = e.created_date || e.created_at || e.createdAt || e.createdDate;
    if (!timestamp) return false;
    const eventTime = new Date(timestamp);
    return !isNaN(eventTime.getTime()) && eventTime >= startTime && eventTime <= endTime;
  });
  
  if (duel.type === 'bloom_2') {
    return relevantEvents.filter(e => e.type === 'tile_bloomed').length;
  } else if (duel.type === 'restore_3') {
    return relevantEvents.filter(e => e.type === 'tile_restored').length;
  } else if (duel.type === 'embers_24h') {
    return relevantEvents.reduce((sum, e) => sum + (e.embers || 0), 0);
  }
  
  return 0;
};

// Finalize duel if expired (compute winner)
export const finalizeIfExpired = async (duel) => {
  if (duel.status !== 'active') return duel;
  
  const now = new Date();
  const endTime = new Date(duel.end_at);
  
  if (now <= endTime) return duel;
  
  // Compute final scores
  const scoreFrom = await computeScore(duel, duel.from_public_id);
  const scoreTo = await computeScore(duel, duel.to_public_id);
  
  let winnerPublicId = null;
  if (scoreFrom > scoreTo) {
    winnerPublicId = duel.from_public_id;
  } else if (scoreTo > scoreFrom) {
    winnerPublicId = duel.to_public_id;
  }
  
  await base44.entities.Duel.update(duel.id, {
    status: 'complete',
    score_from: scoreFrom,
    score_to: scoreTo,
    winner_public_id: winnerPublicId
  });
  
  return { ...duel, status: 'complete', score_from: scoreFrom, score_to: scoreTo, winner_public_id: winnerPublicId };
};

// Claim duel rewards
export const claimRewards = async (duel, myPublicId, myProgress) => {
  const isFrom = duel.from_public_id === myPublicId;
  const alreadyClaimed = isFrom ? duel.claimed_from : duel.claimed_to;
  
  if (alreadyClaimed) {
    throw new Error('Rewards already claimed');
  }
  
  // Award rewards
  const isWinner = duel.winner_public_id === myPublicId;
  const sprouts = isWinner ? 20 : 10;
  
  await base44.entities.UserProgress.update(myProgress.id, {
    sprouts: myProgress.sprouts + sprouts
  });
  
  // Mark as claimed
  const updateField = isFrom ? 'claimed_from' : 'claimed_to';
  await base44.entities.Duel.update(duel.id, {
    [updateField]: true
  });
  
  return { sprouts, isWinner };
};

// Get count of active duels for rate limiting
export const getActiveDuelCount = async (myPublicId) => {
  const active = await listActiveDuels(myPublicId);
  return active.length;
};