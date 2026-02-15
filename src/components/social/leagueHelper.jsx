import { base44 } from '@/api/base44Client';

// Get current week from UserProgress
export const getWeek = (progress) => {
  return progress?.current_week || 1;
};

// Get or assign team for current week
export const getOrAssignTeam = async (myProfile, week) => {
  // Check if user already has a team for this week
  if (myProfile.league_team && myProfile.league_week === week) {
    return myProfile.league_team;
  }
  
  // User needs to pick a team (return null to prompt UI)
  return null;
};

// Assign user to a team for the week
export const assignTeam = async (myProfile, team, week) => {
  await base44.entities.UserProfile.update(myProfile.id, {
    league_team: team,
    league_week: week
  });
  
  // Create or get LeagueContribution record
  const existing = await base44.entities.LeagueContribution.filter({
    week,
    public_id: myProfile.public_id
  });
  
  if (!existing || existing.length === 0) {
    await base44.entities.LeagueContribution.create({
      week,
      team,
      public_id: myProfile.public_id,
      embers: 0
    });
  }
};

// Record action event (idempotent via event_key)
export const recordActionEvent = async ({ publicId, week, team, tileId, type, embers }) => {
  const eventKey = `${publicId}:${week}:${tileId}:${type}`;
  
  // Check if event already exists
  const existing = await base44.entities.ActionEvent.filter({ event_key: eventKey });
  if (existing && existing.length > 0) {
    return { alreadyRecorded: true };
  }
  
  // Create event
  await base44.entities.ActionEvent.create({
    event_key: eventKey,
    public_id: publicId,
    week,
    team,
    type,
    tile_id: tileId,
    embers
  });
  
  return { alreadyRecorded: false };
};

// Increment team totals
export const incrementTeamTotals = async (week, team, embers) => {
  const existing = await base44.entities.LeagueWeekTeam.filter({ week, team });
  
  if (existing && existing.length > 0) {
    const record = existing[0];
    await base44.entities.LeagueWeekTeam.update(record.id, {
      embers_total: record.embers_total + embers
    });
  } else {
    await base44.entities.LeagueWeekTeam.create({
      week,
      team,
      embers_total: embers,
      milestone_level: 0
    });
  }
};

// Increment user contribution
export const incrementUserContribution = async (week, team, publicId, embers) => {
  const existing = await base44.entities.LeagueContribution.filter({
    week,
    public_id: publicId
  });
  
  if (existing && existing.length > 0) {
    const record = existing[0];
    await base44.entities.LeagueContribution.update(record.id, {
      embers: record.embers + embers
    });
  } else {
    await base44.entities.LeagueContribution.create({
      week,
      team,
      public_id: publicId,
      embers
    });
  }
};

// Record a map action and award embers
export const recordMapAction = async ({ myProfile, progress, tileId, actionType }) => {
  const week = getWeek(progress);
  const team = await getOrAssignTeam(myProfile, week);
  
  if (!team) {
    // User hasn't picked a team yet, skip scoring
    return { scored: false, reason: 'no_team' };
  }
  
  const embersMap = {
    scout: 1,
    restore: 3,
    bloom: 7
  };
  
  const eventTypeMap = {
    scout: 'tile_scouted',
    restore: 'tile_restored',
    bloom: 'tile_bloomed'
  };
  
  const embers = embersMap[actionType] || 0;
  const eventType = eventTypeMap[actionType];
  
  // Record event (idempotent)
  const { alreadyRecorded } = await recordActionEvent({
    publicId: myProfile.public_id,
    week,
    team,
    tileId,
    type: eventType,
    embers
  });
  
  if (alreadyRecorded) {
    return { scored: false, reason: 'duplicate' };
  }
  
  // Increment totals
  await incrementTeamTotals(week, team, embers);
  await incrementUserContribution(week, team, myProfile.public_id, embers);
  
  return { scored: true, embers, team };
};

// Get team totals for the week
export const getTeamTotals = async (week) => {
  const teams = await base44.entities.LeagueWeekTeam.filter({ week });
  
  const totals = {
    mosswood: 0,
    brookside: 0,
    firefly: 0
  };
  
  if (teams) {
    teams.forEach(t => {
      totals[t.team] = t.embers_total;
    });
  }
  
  return totals;
};

// Get user's contribution for the week
export const getUserContribution = async (publicId, week) => {
  const contributions = await base44.entities.LeagueContribution.filter({
    public_id: publicId,
    week
  });
  
  return contributions && contributions.length > 0 ? contributions[0] : null;
};

// Get friends leaderboard
export const getFriendsLeaderboard = async (myPublicId, friendPublicIds, week) => {
  const allContributions = await base44.entities.LeagueContribution.filter({ week });
  
  if (!allContributions) return [];
  
  // Filter to friends + me
  const relevantIds = [myPublicId, ...friendPublicIds];
  const filtered = allContributions.filter(c => relevantIds.includes(c.public_id));
  
  // Sort by embers descending
  return filtered.sort((a, b) => b.embers - a.embers);
};