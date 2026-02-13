/**
 * Get or create a stable anonymous user identity
 * Uses localStorage to persist across sessions
 */
export function getAnonUser() {
  let anonId = localStorage.getItem('wanderlings_anon_id');

  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem('wanderlings_anon_id', anonId);
  }

  return {
    email: `anon:${anonId}`
  };
}