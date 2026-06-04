export type PreferenceType =
  | 'TRADING_STYLE'
  | 'PREFERRED_SESSION'
  | 'RISK_PROFILE'
  | 'FAVORITE_PAIR';

export interface UserPreference {
  set: boolean;
  preferenceType?: PreferenceType;
  preferenceValue?: string;
}

export interface PreferenceTypeOptions {
  preferenceType: PreferenceType;
  values: string[];
}

export interface PreferenceOptions {
  types: PreferenceTypeOptions[];
}

export interface SavePreferenceRequest {
  preferenceType: PreferenceType;
  preferenceValue: string;
}
