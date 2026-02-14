import { base44 } from '@/api/base44Client';

// Generate a unique friend code like MOSS-4K9D
const generateFriendCode = () => {
  const prefixes = ['MOSS', 'LEAF', 'FERN', 'VINE', 'ROOT', 'BARK', 'TWIG', 'SEED'];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${prefix}-${suffix}`;
};

// Get or create UserProfile for current user
export const getOrCreateProfile = async () => {
  const user = await base44.auth.me();
  
  // Try to find existing profile
  const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
  if (profiles && profiles.length > 0) {
    return profiles[0];
  }

  // Create new profile
  let attempts = 0;
  while (attempts < 5) {
    try {
      const friendCode = generateFriendCode();
      const publicId = crypto.randomUUID();
      
      const newProfile = await base44.entities.UserProfile.create({
        public_id: publicId,
        friend_code: friendCode,
        nickname: user.full_name || 'Wanderer',
        avatar_seed: Math.random().toString(36).substring(7)
      });
      
      return newProfile;
    } catch (err) {
      // Retry if duplicate friend_code
      attempts++;
      if (attempts >= 5) throw new Error('Failed to generate unique friend code');
    }
  }
};

// Find profile by friend code
export const findProfileByFriendCode = async (friendCode) => {
  const profiles = await base44.entities.UserProfile.filter({ 
    friend_code: friendCode.toUpperCase().trim() 
  });
  return profiles && profiles.length > 0 ? profiles[0] : null;
};

// Normalize friendship pair (always store smaller public_id as user_a)
export const normalizeFriendshipPair = (publicId1, publicId2) => {
  return publicId1 < publicId2 
    ? { user_a: publicId1, user_b: publicId2 }
    : { user_a: publicId2, user_b: publicId1 };
};

// Send friend request
export const sendFriendRequest = async (myPublicId, theirFriendCode) => {
  const theirProfile = await findProfileByFriendCode(theirFriendCode);
  if (!theirProfile) throw new Error('Friend code not found');
  if (theirProfile.public_id === myPublicId) throw new Error('Cannot add yourself');

  const { user_a, user_b } = normalizeFriendshipPair(myPublicId, theirProfile.public_id);

  // Check if friendship already exists
  const existing = await base44.entities.Friendship.filter({ 
    user_a_public_id: user_a, 
    user_b_public_id: user_b 
  });

  if (existing && existing.length > 0) {
    const friendship = existing[0];
    if (friendship.status === 'accepted') throw new Error('Already friends');
    if (friendship.status === 'pending') throw new Error('Request already sent');
  }

  // Create friend request
  return await base44.entities.Friendship.create({
    user_a_public_id: user_a,
    user_b_public_id: user_b,
    status: 'pending',
    requested_by_public_id: myPublicId
  });
};

// Get all friendships for a user (accepted + pending)
export const getFriendships = async (myPublicId) => {
  const asA = await base44.entities.Friendship.filter({ user_a_public_id: myPublicId });
  const asB = await base44.entities.Friendship.filter({ user_b_public_id: myPublicId });
  return [...(asA || []), ...(asB || [])];
};

// Get friend profiles (only accepted)
export const getFriendProfiles = async (myPublicId) => {
  const friendships = await getFriendships(myPublicId);
  const accepted = friendships.filter(f => f.status === 'accepted');
  
  const friendPublicIds = accepted.map(f => 
    f.user_a_public_id === myPublicId ? f.user_b_public_id : f.user_a_public_id
  );

  if (friendPublicIds.length === 0) return [];

  // Fetch all friend profiles
  const allProfiles = await base44.entities.UserProfile.list();
  return allProfiles.filter(p => friendPublicIds.includes(p.public_id));
};

// Get pending requests where I'm the recipient
export const getPendingRequests = async (myPublicId) => {
  const friendships = await getFriendships(myPublicId);
  return friendships.filter(f => 
    f.status === 'pending' && f.requested_by_public_id !== myPublicId
  );
};