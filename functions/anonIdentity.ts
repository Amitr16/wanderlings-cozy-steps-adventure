/**
 * Get or create a stable anonymous user identity
 * Uses localStorage to persist across sessions
 */
export function getAnonKey() {
  const key = 'wanderlings_anon_id';
  let anonId = localStorage.getItem(key);
  
  if (!anonId) {
    anonId = 'anon_' + crypto.randomUUID();
    localStorage.setItem(key, anonId);
  }
  
  return anonId;
}