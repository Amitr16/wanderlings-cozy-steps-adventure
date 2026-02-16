// Cosmetic item definitions
export const COSMETIC_ITEMS = {
  // Profile Borders
  'border_ember': {
    id: 'border_ember',
    name: 'Ember Frame',
    type: 'profile',
    rarity: 'uncommon',
    visual: '🔥',
    borderStyle: 'border-4 border-orange-400 shadow-lg shadow-orange-200',
    bgGradient: 'from-orange-50 to-red-50'
  },
  'border_moss': {
    id: 'border_moss',
    name: 'Moss Guard',
    type: 'profile',
    rarity: 'uncommon',
    visual: '🌿',
    borderStyle: 'border-4 border-green-500 shadow-lg shadow-green-200',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  'border_firefly': {
    id: 'border_firefly',
    name: 'Firefly Halo',
    type: 'profile',
    rarity: 'rare',
    visual: '✨',
    borderStyle: 'border-4 border-yellow-400 shadow-lg shadow-yellow-300 animate-pulse',
    bgGradient: 'from-yellow-50 to-amber-50'
  },
  'border_crystal': {
    id: 'border_crystal',
    name: 'Crystal Edge',
    type: 'profile',
    rarity: 'epic',
    visual: '💎',
    borderStyle: 'border-4 border-purple-500 shadow-xl shadow-purple-300',
    bgGradient: 'from-purple-50 to-pink-50'
  },

  // Titles
  'title_wanderer': {
    id: 'title_wanderer',
    name: 'Wanderer',
    type: 'title',
    rarity: 'common',
    display: 'Wanderer',
    color: 'text-gray-600'
  },
  'title_restorer': {
    id: 'title_restorer',
    name: 'Forest Restorer',
    type: 'title',
    rarity: 'uncommon',
    display: 'Forest Restorer',
    color: 'text-green-600'
  },
  'title_champion': {
    id: 'title_champion',
    name: 'Ember Champion',
    type: 'title',
    rarity: 'rare',
    display: 'Ember Champion',
    color: 'text-orange-600'
  },
  'title_guardian': {
    id: 'title_guardian',
    name: 'Guardian of Light',
    type: 'title',
    rarity: 'epic',
    display: 'Guardian of Light',
    color: 'text-purple-600'
  },

  // Camp Decorations
  'camp_banner_moss': {
    id: 'camp_banner_moss',
    name: 'Mosswood Banner',
    type: 'camp',
    rarity: 'uncommon',
    visual: '🏴',
    preview: 'Green flag with moss emblem'
  },
  'camp_lanterns_firefly': {
    id: 'camp_lanterns_firefly',
    name: 'Firefly String Lights',
    type: 'camp',
    rarity: 'rare',
    visual: '💡',
    preview: 'Glowing lantern string'
  },

  // Badges
  'badge_founder': {
    id: 'badge_founder',
    name: 'Founder',
    type: 'badge',
    rarity: 'legendary',
    visual: '👑',
    description: 'Early supporter of Wanderlings'
  }
};

export const getRarityColor = (rarity) => {
  const colors = {
    common: 'text-gray-500',
    uncommon: 'text-green-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500'
  };
  return colors[rarity] || colors.common;
};

export const getCosmeticItem = (itemId) => {
  return COSMETIC_ITEMS[itemId] || null;
};