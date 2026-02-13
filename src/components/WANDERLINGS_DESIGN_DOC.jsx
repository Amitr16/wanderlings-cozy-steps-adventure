// 🌿 WANDERLINGS - DESIGN & DEVELOPMENT DOCUMENT
// This is a comprehensive reference doc stored as a comment-only component

/*

# 🌿 Wanderlings - Design & Development Document

**Last Updated:** 2026-02-13  
**Core Philosophy:** Mossling-Centered Emotional Ritual

---

## 🎯 Core Identity

Wanderlings is **not** about restoring a map.  
Wanderlings is about **caring for a tiny playful creature whose world grows because you move.**

**The player is:** A caretaker, companion, and friend  
**The core loop is:** Walk → Mossling gains energy → Mossling restores the forest → You see Mossling react

---

## ✅ What Has Been Built

### 1. **Core Systems**

#### Entity Schema
- **UserProgress**: Tracks steps, Glow, Dew, Sprouts, mood, bond level, season progression
- **MapTile**: Hexagonal world with biomes and 4 states (fogged → revealed → restored → bloomed)
- **Quest**: Daily quest system with 3 categories (move, world, cozy)

#### Pages
- **Onboarding**: 3-step tutorial introducing Mossling and core mechanics
- **Camp (Home)**: Sacred space featuring Mossling as the emotional anchor
- **Map**: Hexagonal restoration interface with Scout/Restore/Bloom actions
- **Quests**: Daily quest tracking with reward claiming

#### Components
- **MosslingDisplay**: Playful creature with 4 mood states (sleepy, curious, happy, radiant)
  - Dynamic animations: gentle bob, look-around, bounce, spin-celebrate
  - Sparkle particles and fireflies
  - Bond level progression indicators
  - Interactive tap feedback
- **HexGrid & HexTile**: Hexagonal map rendering with biome colors and state transitions
- **ResourceDisplay**: Glow, Sprouts, Steps visualization
- **QuestCard**: Quest progress tracking and reward claiming

### 2. **Game Mechanics**

#### Resources
- **Glow**: Primary energy (capped at 150, overflow → Dew)
  - Earned: 1 Glow per 100 steps
  - Spent: Scout (3), Restore (7), Bloom (12)
- **Dew**: Overflow Glow bank
- **Sprouts**: Cosmetic currency (10-25 per restoration action)

#### Map Progression
- 4 weeks per season (28 days)
- Tiles unlock weekly
- Scout → Reveal tile (3 Glow, +2 Sprouts)
- Restore → Bring life (7 Glow, +10-18 Sprouts, +5 mood)
- Bloom → Maximum beauty (12 Glow, +15-25 Sprouts, +10 mood)

#### Daily Quests
- 3 categories: Move (steps), World (map actions), Cozy (campfire, decorations, guild)
- Auto-generates based on 28-day blueprint
- Rewards: Glow, Sprouts, Festival Tokens

#### Creature System
- **Mood**: Daily emotional state (0-100)
  - Increases with walking, restoring, quest completion
  - Affects animations and reactions
- **Bond Level**: Long-term progression (unlocks animations)
  - Level 1: Idle bounce
  - Level 2: Restore sparkle
  - Level 3: Happy spin
  - Level 4: Night glow aura
  - Level 5: Festival dance

### 3. **Design Achievements**

✅ Mossling is the emotional anchor  
✅ Camp feels like a sacred space  
✅ Playful sprite personality with expressive animations  
✅ Minimal & calm design philosophy  
✅ 28-day seasonal structure  
✅ Daily ritual under 10 minutes  
✅ No punishment mechanics (safe emotional space)

---

## 🚧 What Needs To Be Built

### Phase 1: Core Polish (Critical)

#### 1. Mossling Restoration Animation
**Currently:** Tile updates instantly  
**Needs:** Mossling hops to tile → plants seed → glow wave → tile blooms → Mossling claps

**Implementation:**
- Add animation sequence in HexTile component
- Delay tile state update until animation completes
- Add particle effects for planting moment
- Add Mossling mini sprite on tile during action

#### 2. Cost-Aware Rotation System
**Currently:** No cost prediction  
**Needs:** Show estimated Sprout rewards before action

**Implementation:**
- Add tooltip on hex tiles showing cost and reward range
- Preview system for "Is this worth it?"

#### 3. Step Integration (Mock → Real)
**Currently:** Step simulator for testing  
**Needs:** Real device step counter integration

**Options:**
- Web: Pedometer API (limited browser support)
- Mobile: Native app wrapper (React Native bridge)
- Hybrid: Manual sync from Apple Health / Google Fit

#### 4. Campfire Social Space
**Status:** Mentioned in quests but not built  
**Needs:** 
- Campfire visual on Camp page
- Daily Kindling contribution (1-3 Glow)
- Guild progress visualization
- Mossling reacts to guild success

#### 5. Audio & Ambience
**Status:** None  
**Needs:**
- Soft forest audio loop
- Mossling interaction sounds (chirps, giggles)
- Restoration "whoosh" effects
- Background firefly crackle

---

### Phase 2: Retention Hooks (High Priority)

#### 6. Daily Blessing (Login Reward)
**Status:** Field exists in UserProgress but no UI  
**Needs:**
- Daily login popup with small Glow reward (5-10)
- Streak counter (3-day, 7-day bonuses)
- Mossling greeting message

#### 7. Bond Level Progression
**Status:** Field tracked but no visual milestones  
**Needs:**
- Bond XP earned from quest completions
- Level-up celebrations with new animation unlocks
- Bond level breakdown in Camp

#### 8. Decorations System
**Status:** Referenced in quests but not implemented  
**Needs:**
- Camp customization items (lanterns, flowers, stones)
- Purchasable with Sprouts
- Affects Mossling mood positively
- Purely cosmetic emotional value

#### 9. Festival Events
**Status:** Festival Tokens exist but no events  
**Needs:**
- Seasonal festivals (Lanternleaf, Snowdrop, Blossom)
- Guild leaderboards (celebration, not competition)
- Festival-exclusive decorations and Mossling animations
- Time-limited quest sets

---

### Phase 3: Monetization (After Retention Proven)

#### 10. Cozy Pass (Single-Tier Subscription)
**Concept:** $3.99/month or $29.99/year  
**Includes:**
- Premium Mossling outfits (seasonal themes)
- Exclusive bond animations
- 2x Sprout earnings
- Festival priority cosmetics
- Supporter badge
- Optional story pages (lore)

**Why This Works:**
- Aligns with emotion (support Mossling)
- No pay-to-win mechanics
- Sustainable long-term income
- Players feel like patrons, not whales

#### 11. One-Time IAPs (Optional)
- Starter Glow Pack (500 Glow for $1.99) - one-time only
- Sprout Bundles (cosmetic acceleration)
- Decoration packs (themed sets)

**Critical Rule:** Never sell gameplay advantage, only cosmetics and time-savers

---

### Phase 4: Social & Competitive (Far Future)

#### 12. Guild System (Async Co-op)
**Status:** Referenced but not built  
**Needs:**
- Join/create guilds (max 20 members)
- Shared Kindling goal (unlock guild decorations)
- Guild chat (simple text)
- Guild leaderboard (celebration-focused)

#### 13. Friends & Gifting
**Needs:**
- Friend list (via invite code)
- Send Glow/Sprouts as gifts
- Visit friend's camps (read-only)
- Leave notes on campfire

---

## 🎨 Design Principles to Preserve

### 1. Minimal & Calm
- No cluttered UI
- Max 3 actions per screen
- Soft colors, generous whitespace
- No urgency or timers

### 2. Emotional Safety
- No punishment for inactivity
- Mossling never "dies" or gets sad long-term
- Missed days = gentle welcome back, not penalty

### 3. Sustainable Income Model
- Target: $1-3 ARPU from 10-20% conversion
- Focus on long retention (6+ months)
- No dark patterns or FOMO manipulation

### 4. Daily Ritual
- Open app → See Mossling → Restore 2-3 tiles → Complete 1 quest → Close
- Under 10 minutes
- Feels meditative, not grindy

---

## 📊 Success Metrics (When Live)

### Retention
- **D1:** 50%+ (strong onboarding)
- **D7:** 30%+ (habit formation)
- **D30:** 15%+ (emotional attachment)

### Engagement
- **Avg session:** 8-12 minutes
- **Sessions/day:** 2-3 (morning ritual, evening check-in)
- **Actions/session:** 5-10 (walk, restore, quest, contribute)

### Monetization
- **Conversion:** 10-15% to Cozy Pass
- **ARPU:** $1.50-3.00
- **LTV:** $20-40 (12-month horizon)

### Emotional Health
- **Mossling mood avg:** 75%+ (players engaged)
- **Bond level 3+:** 40% of D30 users (progression working)
- **Guild participation:** 30% of active users (social hook effective)

---

## 🛠️ Technical Debt & Optimizations

### Current Issues
1. **Step simulator** is a placeholder (needs real device integration)
2. **No cost prediction** before actions (reduces player confidence)
3. **Instant tile updates** miss emotional payoff (need animations)
4. **No audio** (diminishes immersion)
5. **Daily blessing** tracked but not shown (missing retention hook)

### Performance
- Hex grid renders smoothly (no issues reported)
- Quest generation is efficient (28-day blueprint system)
- No backend functions enabled (all client-side logic)

---

## 🚀 Recommended Build Order

### Sprint 1: Core Polish (1-2 weeks)
1. ✅ Mossling restoration animation (CRITICAL for emotion)
2. ✅ Daily blessing popup (CRITICAL for retention)
3. ✅ Cost preview tooltips
4. ✅ Campfire visualization + Kindling UI

### Sprint 2: Retention Hooks (1-2 weeks)
5. ✅ Bond level progression UI
6. ✅ Decorations shop + Camp customization
7. ✅ Audio ambience (forest loop, Mossling sounds)

### Sprint 3: Social & Events (2-3 weeks)
8. ✅ Guild system (async co-op)
9. ✅ Festival event framework
10. ✅ Friends list + gifting

### Sprint 4: Monetization (1 week)
11. ✅ Cozy Pass subscription setup
12. ✅ Premium cosmetics catalog
13. ✅ One-time IAPs

---

## 💡 Why This Will Work

### Emotional Anchor Strategy
- Players don't quit on Mossling (unlike quitting on a game)
- Mossling = digital pet without pressure
- Bond system = long-term attachment

### Sustainable Growth
- No hyper-growth needed
- Target: 10K DAU at 15% D30 = stable $15-30K MRR
- Low CAC via organic (cozy game community)

### Differentiation
- **Not:** Fitness tracker, habit app, idle game
- **Is:** Emotional companion ritual with gentle movement reward
- Competes with: Animal Crossing Pocket Camp, Pikmin Bloom
- Wins on: Simplicity, emotional safety, sustainability focus

---

## 📝 Next Steps

1. **Review this doc** with stakeholders/team
2. **Prioritize Sprint 1** tasks (restoration animation + daily blessing)
3. **Test with 10-20 beta users** before scaling
4. **Measure retention** before adding monetization
5. **Iterate based on emotional feedback**, not just metrics

---

**End of Document**

*"The forest is not the hero. The map is not the hero. Mossling is the hero."*

*/

// This component is never imported - it exists purely as documentation
export default function WanderlingsDesignDoc() {
  return null;
}