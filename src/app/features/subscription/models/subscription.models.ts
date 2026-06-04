import { PlanName } from '../../report/models/report.models';

export interface Plan {
  id: number;
  name: PlanName;
  price: number;
  reportQuota: number;
}

export interface Subscription {
  plan: Plan;
  effectivePlan: Plan;
  remainingReports: number;
  hasEverPaid: boolean;
  marketOpen: boolean;
}

export type TopUpPlan = 'BASIC' | 'PREMIUM';

export interface TopUpRequest {
  plan: TopUpPlan;
}

export interface CarryOverCalculation {
  remainingReports: number;
  additionalReports: number;
  newTotal: number;
}

export interface TopUpInitiation {
  targetPlan: Plan;
  orderId: string;
  snapToken: string;
  clientKey: string;
  production: boolean;
  warningFlag: boolean;
  exchangeRate: number;
  amountIdr: number;
  carryOverCalculation: CarryOverCalculation;
}

export interface ExchangeRate {
  usdToIdr: number;
  fetchedAt: string;
}
