import {
  Bias,
  BestPairView,
  ConfidenceLevel,
  FundamentalEvent,
  PairAnalysis,
  ReportResponse,
  SignalState,
  TradePlan
} from '../models/report.models';

/**
 * Pure display-time derivations over a report payload. Everything here is
 * computed from the data already present in the response — no extra API call.
 * Premium summary fields read across payload.pairs[]; Free/Basic read the
 * narrowed bestPairView. R:R is computed from the trade plan.
 */

export interface RiskReward {
  ratio: number;
  label: string; // e.g. "1:2.5"
}

/** Mid of the entry zone. */
export function entryMid(plan: TradePlan): number {
  return (plan.entryLow + plan.entryHigh) / 2;
}

/**
 * Risk:reward from a trade plan. LONG: (TP - mid) / (mid - SL);
 * SHORT: (mid - TP) / (SL - mid). Rounded to one decimal, shown as "1:x".
 * Returns null when the denominator is non-positive (degenerate plan).
 */
export function riskReward(plan: TradePlan): RiskReward | null {
  const mid = entryMid(plan);
  const reward = plan.direction === 'LONG' ? plan.takeProfit - mid : mid - plan.takeProfit;
  const risk = plan.direction === 'LONG' ? mid - plan.stopLoss : plan.stopLoss - mid;
  if (risk <= 0 || reward <= 0) {
    return null;
  }
  const ratio = Math.round((reward / risk) * 10) / 10;
  return { ratio, label: `1:${ratio.toFixed(1)}` };
}

const BIAS_LABEL: Record<Bias, string> = {
  BULLISH: 'Bullish',
  BEARISH: 'Bearish',
  RANGING: 'Ranging',
  NEUTRAL: 'Neutral'
};

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

const SIGNAL_LABEL: Record<SignalState, string> = {
  CONFIRMED: 'Confirmed',
  AWAITING_CONFIRMATION: 'Awaiting Confirmation',
  DETECTED: 'Detected',
  EXPIRED: 'Expired',
  INVALIDATED: 'Invalidated'
};

export function biasLabel(bias: Bias): string {
  return BIAS_LABEL[bias] ?? 'Neutral';
}

export function confidenceLabel(level: ConfidenceLevel): string {
  return CONFIDENCE_LABEL[level] ?? '—';
}

export function signalLabel(state: SignalState): string {
  return SIGNAL_LABEL[state] ?? '—';
}

/** "Active Opportunity Window" derivation from a pair's signal state. */
export function opportunityWindow(state: SignalState): string {
  switch (state) {
    case 'CONFIRMED':
      return 'Active Setup';
    case 'AWAITING_CONFIRMATION':
      return 'Setup Forming';
    case 'DETECTED':
      return 'Early Signal';
    default:
      return 'No Active Setup';
  }
}

/** Sentiment label for a compact preview, e.g. "Bearish · Awaiting Confirmation". */
export function sentimentLabel(bias: Bias, state: SignalState): string {
  return `${biasLabel(bias)} · ${signalLabel(state)}`;
}

/** Market environment (Premium): from consolidating flag, else best pair weekly bias. */
export function marketEnvironment(
  marketsConsolidating: boolean,
  bestPairWeeklyBias: Bias | undefined
): string {
  if (marketsConsolidating) {
    return 'Consolidating Market';
  }
  switch (bestPairWeeklyBias) {
    case 'BULLISH':
      return 'Risk-On Environment';
    case 'BEARISH':
      return 'Risk-Off Environment';
    case 'RANGING':
      return 'Mixed Market';
    default:
      return 'Mixed Market';
  }
}

/** The full PairAnalysis for the report's best pair, when present. */
export function bestPairOf(report: ReportResponse): PairAnalysis | null {
  const pairs = report.payload.pairs;
  if (!pairs?.length) {
    return null;
  }
  const symbol = report.payload.bestPair;
  return pairs.find((p) => p.pair === symbol) ?? pairs[0];
}

/** Weakest pair (Premium): lowest confidence.score across all pairs. */
export function weakestPair(pairs: PairAnalysis[]): PairAnalysis | null {
  if (!pairs.length) {
    return null;
  }
  return pairs.reduce((min, p) => (p.confidence.score < min.confidence.score ? p : min));
}

/**
 * Highest fundamental alignment (Premium): a pair with no fundamental conflict
 * and a non-neutral fundamental bias. Returns the first such pair, or null.
 */
export function highestFundamentalAlignment(pairs: PairAnalysis[]): PairAnalysis | null {
  return (
    pairs.find((p) => !p.fundamentalConflict && p.fundamental.bias !== 'NEUTRAL') ?? null
  );
}

/** Count of valid setups: CONFIRMED or AWAITING_CONFIRMATION, as "n/total". */
export function validSetups(pairs: PairAnalysis[]): { count: number; total: number; label: string } {
  const count = pairs.filter(
    (p) => p.signalState === 'CONFIRMED' || p.signalState === 'AWAITING_CONFIRMATION'
  ).length;
  const total = pairs.length;
  return { count, total, label: `${count}/${total}` };
}

/** Pairs to avoid (Premium): HTF conflict, or expired/invalidated signal. */
export function pairsToAvoid(pairs: PairAnalysis[]): string[] {
  return pairs
    .filter(
      (p) =>
        p.htfConflict || p.signalState === 'EXPIRED' || p.signalState === 'INVALIDATED'
    )
    .map((p) => p.pair);
}

/**
 * High-impact events today (Premium): every pair's fundamental events that are
 * High importance and dated today, de-duplicated by event name.
 */
export function highImpactEventsToday(pairs: PairAnalysis[], now: Date): FundamentalEvent[] {
  const todayUtc = now.toISOString().slice(0, 10);
  const seen = new Set<string>();
  const out: FundamentalEvent[] = [];
  for (const p of pairs) {
    for (const ev of p.fundamental.events ?? []) {
      if (ev.importance !== 'High') {
        continue;
      }
      if (ev.date.slice(0, 10) !== todayUtc) {
        continue;
      }
      if (seen.has(ev.event)) {
        continue;
      }
      seen.add(ev.event);
      out.push(ev);
    }
  }
  return out;
}

/** Whether a pair carries the "Matches Your Preference" badge. */
export function matchesPreference(report: ReportResponse, pair: string): boolean {
  return report.preferenceMatches?.[pair] === true;
}

/** Ordered Premium pairs, best to worst by confidence score. */
export function pairsByConfidence(pairs: PairAnalysis[]): PairAnalysis[] {
  return [...pairs].sort((a, b) => b.confidence.score - a.confidence.score);
}

/** Minutes elapsed since a timestamp, floored at 0. */
export function minutesSince(iso: string | undefined, now: Date): number {
  if (!iso) {
    return 0;
  }
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((now.getTime() - then) / 60000));
}

/**
 * Normalized view-model the pair card renders. Both the Premium full
 * PairAnalysis and the Free/Basic narrowed bestPairView map onto this shape, so
 * one card component serves every plan. `analysis` is present only for Premium
 * (it powers the expandable full-analysis accordion); Free/Basic leave it null
 * and show the locked upsell instead.
 */
export interface PairCardView {
  pair: string;
  bias: Bias;
  confidenceLevel: ConfidenceLevel;
  setupStatus: string;
  shortReasoning: string;
  signalState: SignalState;
  tradePlan: TradePlan | null;
  analysis: PairAnalysis | null;
}

/** Maps a full Premium PairAnalysis to the card view-model. */
export function pairAnalysisToView(p: PairAnalysis): PairCardView {
  return {
    pair: p.pair,
    bias: p.structureByTimeframe.D?.bias ?? 'NEUTRAL',
    confidenceLevel: p.confidence.level,
    setupStatus: p.setupStatus,
    shortReasoning: p.shortReasoning,
    signalState: p.signalState,
    tradePlan: p.tradePlan,
    analysis: p
  };
}

/** Maps the Free/Basic narrowed bestPairView to the card view-model. */
export function bestPairViewToView(v: BestPairView): PairCardView {
  return {
    pair: v.pair,
    bias: v.dailyBias,
    confidenceLevel: v.confidenceLevel,
    setupStatus: v.setupStatus,
    shortReasoning: v.shortReasoning,
    signalState: v.signalState,
    tradePlan: v.tradePlan,
    analysis: null
  };
}

/** Uppercases a pair symbol for display (values arrive already slashed). */
export function formatPairSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/**
 * Formats a price-like number for display: rounded to at most 5 decimal places
 * with trailing zeros trimmed, so floating-point artifacts like
 * 0.5990939999999999 render as 0.59909 while clean values like 0.59775 are
 * unchanged. Non-finite inputs fall back to a dash.
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return parseFloat(value.toFixed(5)).toString();
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats an ISO timestamp as "Jun 3 · 01:30 UTC", always in UTC (not the
 * browser's local zone). Falls back to the raw string if it cannot be parsed.
 */
export function formatEventDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const month = MONTHS[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${month} ${day} · ${hh}:${mm} UTC`;
}

/** The latest N fundamental events by date (future → past). */
export function latestEvents(events: FundamentalEvent[] | undefined, limit: number): FundamentalEvent[] {
  if (!events?.length) {
    return [];
  }
  return [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
