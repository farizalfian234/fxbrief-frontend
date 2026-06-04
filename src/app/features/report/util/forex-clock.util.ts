/**
 * Pure-frontend forex market clock. The forex week runs from Sunday 22:00 UTC
 * to Friday 22:00 UTC; outside that window the market is closed. These helpers
 * derive the closed state, a formatted UTC time string, and a human countdown
 * to the next open, all from a supplied Date so callers can drive them from a
 * once-per-second timer without any backend call.
 *
 * Note: the authoritative market-open flag for gating still comes from the
 * backend (subscription.marketOpen); this clock powers the live display and
 * countdown only.
 */

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 0;
const CLOSE_HOUR_UTC = 22;

export function isMarketClosed(now: Date): boolean {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();

  if (day === SATURDAY) {
    return true;
  }
  if (day === FRIDAY && hour >= CLOSE_HOUR_UTC) {
    return true;
  }
  if (day === SUNDAY && hour < CLOSE_HOUR_UTC) {
    return true;
  }
  return false;
}

/** Formats the current UTC time as e.g. "14:32 UTC". */
export function formatUtcClock(now: Date): string {
  const h = now.getUTCHours().toString().padStart(2, '0');
  const m = now.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m} UTC`;
}

/** Milliseconds until the next Sunday 22:00 UTC market open from `now`. */
export function msUntilOpen(now: Date): number {
  const open = new Date(now.getTime());
  open.setUTCHours(CLOSE_HOUR_UTC, 0, 0, 0);

  const day = now.getUTCDay();
  if (day === SUNDAY) {
    if (now.getUTCHours() >= CLOSE_HOUR_UTC) {
      return 0;
    }
    // Opens today at 22:00 UTC.
  } else {
    // Advance to the coming Sunday.
    const daysUntilSunday = (SUNDAY + 7 - day) % 7 || 7;
    open.setUTCDate(open.getUTCDate() + daysUntilSunday);
  }
  return Math.max(0, open.getTime() - now.getTime());
}

/** Formats a duration in ms as "7h 28m" (or "0h 00m" near the boundary). */
export function formatCountdown(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}
