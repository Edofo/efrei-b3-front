/* Quest 2 · The time counter — solution */

const MINUTES_PER_HOUR = 60;

export function toMinutes(hours: number, minutes: number): number {
  return hours * MINUTES_PER_HOUR + minutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

export function percentWatched(position: number, duration: number): number {
  // Challenge: a zero duration → 0 (otherwise a division by zero gives Infinity), capped at 100.
  if (duration === 0) return 0;
  return Math.min(100, Math.round((position / duration) * 100));
}
