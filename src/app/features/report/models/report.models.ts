export type PlanName = 'FREE' | 'BASIC' | 'PREMIUM';

export type Bias = 'BULLISH' | 'BEARISH' | 'RANGING' | 'NEUTRAL';

export type SignalState =
  | 'DETECTED'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'INVALIDATED'
  | 'EXPIRED';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TradeDirection = 'LONG' | 'SHORT';

export type ImportanceLevel = 'Low' | 'Medium' | 'High';

export interface TradePlan {
  direction: TradeDirection;
  entryLow: number;
  entryHigh: number;
  takeProfit: number;
  stopLoss: number;
}

export interface TimeframeStructure {
  bias: Bias;
  lastStructuralEvent: 'BOS' | 'CHOCH' | 'MSS' | 'NONE' | string;
  swings?: { label: string; price: number }[];
}

export interface StructureByTimeframe {
  W?: TimeframeStructure;
  D?: TimeframeStructure;
  H4?: TimeframeStructure;
  M15?: TimeframeStructure;
}

export interface ActiveZone {
  type: 'SUPPLY' | 'DEMAND' | string;
  low: number;
  high: number;
  formedAt?: string;
  freshnessScore?: number;
  state?: 'FRESH' | 'WEAKENED' | 'INVALIDATED' | string;
  penetrationRatio?: number;
  maxPenetrationRatio?: number;
  fibonacciLevels?: { level: number; price: number }[];
  invalidated?: boolean;
  invalidationReason?: string;
}

export interface ConfidenceFactor {
  label: string;
  delta: number;
  applied: boolean;
}

export interface Confidence {
  score: number;
  level: ConfidenceLevel;
  factors?: ConfidenceFactor[];
}

export interface M15Confirmation {
  bos?: boolean;
  liquiditySweep?: boolean;
  engulfingDisplacement?: boolean;
  chochAligned?: boolean;
  confirmed?: boolean;
}

export interface FundamentalEvent {
  event: string;
  importance: ImportanceLevel;
  date: string;
  currency?: string;
}

export interface Fundamental {
  currency: string;
  bias: Bias;
  highImpactThisWeek: boolean;
  events?: FundamentalEvent[];
}

/** Full per-pair analysis as returned in the Premium payload.pairs[] array. */
export interface PairAnalysis {
  pair: string;
  signalState: SignalState;
  setupStatus: string;
  shortReasoning: string;
  executiveReasoning?: string;
  invalidationNote?: string;
  fundamentalSummary?: string;
  structureByTimeframe: StructureByTimeframe;
  activeZone: ActiveZone | null;
  confidence: Confidence;
  m15Confirmation: M15Confirmation | null;
  tradePlan: TradePlan | null;
  fundamental: Fundamental;
  htfConflict: boolean;
  fundamentalConflict: boolean;
  layer?: unknown;
}

/** Free/Basic narrowed best-pair projection (payload.bestPairView). */
export interface BestPairView {
  pair: string;
  dailyBias: Bias;
  confidenceLevel: ConfidenceLevel;
  majorNewsRisk: boolean;
  signalState: SignalState;
  setupStatus: string;
  shortReasoning: string;
  tradePlan: TradePlan | null;
}

/** Free/Basic narrowed compact preview (payload.compactPreviews[]). */
export interface CompactPreview {
  pair: string;
  dailyBias: Bias;
  signalState: SignalState;
}

export interface ReportPayload {
  bestPair: string | null;
  pairs?: PairAnalysis[];
  bestPairView?: BestPairView | null;
  compactPreviews?: CompactPreview[] | null;
  marketsConsolidating: boolean;
  generatedAt: string;
  marketDataFetchedAt?: string;
  calendarFetchedAt?: string;
}

export interface PreferenceSnapshot {
  preferenceType: string;
  preferenceValue: string;
}

/** Wrapper returned by generate / today / history-detail. */
export interface ReportResponse {
  reportId: number;
  summary: string;
  payload: ReportPayload;
  forexMarketDate: string;
  generatedAt: string;
  planAtGeneration: PlanName;
  countedAgainstLimit: boolean;
  remainingReports: number;
  reportsExhausted: boolean;
  preferenceSnapshot?: PreferenceSnapshot;
  finalDisplayScores?: Record<string, number>;
  preferenceMatches?: Record<string, boolean>;
}

export interface HistoryItem {
  reportId: number;
  forexMarketDate: string;
  planAtGeneration: PlanName;
  summary: string;
  preferenceSnapshot?: PreferenceSnapshot;
}

export interface HistoryPage {
  locked: boolean;
  items: HistoryItem[];
  totalArchivedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Optional one-time preference override sent in the generate body. */
export interface GenerateRequest {
  preferenceType?: string;
  preferenceValue?: string;
}
