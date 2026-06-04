import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  effect,
  input,
  signal
} from '@angular/core';

import { PreferenceOptions, PreferenceType } from '../models/preferences.models';

export interface PreferenceSelection {
  preferenceType: PreferenceType | null;
  preferenceValue: string | null;
}

const TYPE_LABELS: Record<PreferenceType, string> = {
  TRADING_STYLE: 'Trading Style',
  PREFERRED_SESSION: 'Preferred Session',
  RISK_PROFILE: 'Risk Profile',
  FAVORITE_PAIR: 'Favorite Pair'
};

/** Humanizes an enum-style value, e.g. SWING_TRADER -> "Swing Trader". */
export function humanizePreferenceValue(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Formats a preference value for display. Favorite-pair values arrive already
 * slashed (e.g. "eur/usd" or "EUR/USD") and are shown fully uppercased; all
 * other values are humanized from their enum form.
 */
export function formatPreferenceValue(type: PreferenceType | null, value: string): string {
  if (type === 'FAVORITE_PAIR') {
    return value.toUpperCase();
  }
  return humanizePreferenceValue(value);
}

/**
 * Two-step preference picker. Dropdown one selects the preference type, dropdown
 * two selects a value valid for that type and is disabled until a type is
 * chosen. Options come from the backend. The picker emits the current selection
 * on every change; the parent decides what a valid/savable selection is and
 * whether it is a saved default (Account) or a one-time override (Dashboard).
 */
@Component({
  selector: 'fx-preference-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-navy-700">Preference Type</label>
        <select
          #typeSelect
          (change)="onTypeChange(typeSelect.value)"
          class="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
        >
          <option value="" [selected]="selectedType() === null">Select preference</option>
          @for (t of options().types; track t.preferenceType) {
            <option [value]="t.preferenceType" [selected]="t.preferenceType === selectedType()">
              {{ typeLabel(t.preferenceType) }}
            </option>
          }
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-navy-700">Preference Value</label>
        <select
          #valueSelect
          (change)="onValueChange(valueSelect.value)"
          [disabled]="!selectedType()"
          class="mt-1 w-full rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm text-navy-900 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-navy-400"
        >
          <option value="" [selected]="selectedValue() === null">{{ valuePlaceholder() }}</option>
          @for (v of valuesForType(); track v) {
            <option [value]="v" [selected]="v === selectedValue()">{{ formatValue(v) }}</option>
          }
        </select>
      </div>
    </div>
  `
})
export class PreferencePickerComponent {
  readonly options = input.required<PreferenceOptions>();
  readonly initialType = input<PreferenceType | null>(null);
  readonly initialValue = input<string | null>(null);

  @Output() selectionChange = new EventEmitter<PreferenceSelection>();

  readonly selectedType = signal<PreferenceType | null>(null);
  readonly selectedValue = signal<string | null>(null);

  readonly valuesForType = computed(() => {
    const type = this.selectedType();
    if (!type) {
      return [];
    }
    return this.options().types.find((t) => t.preferenceType === type)?.values ?? [];
  });

  readonly valuePlaceholder = computed(() =>
    this.selectedType() ? 'Select value' : 'Select a type first'
  );

  private typeSeeded = false;
  private valueSeeded = false;

  constructor() {
    // Seed the dropdowns from the saved preference. Type and value arrive as
    // separate async signal updates, so each is seeded under its own guard (a
    // shared guard let the type's update consume the only seeding pass and drop
    // the value). The correct <option> is marked [selected] in the template, so
    // it is honoured whenever the option list renders — no manual select-value
    // timing is needed.
    effect(
      () => {
        const type = this.initialType();
        const value = this.initialValue();
        if (!this.typeSeeded && type !== null) {
          this.typeSeeded = true;
          this.selectedType.set(type);
        }
        if (!this.valueSeeded && value !== null) {
          this.valueSeeded = true;
          this.selectedValue.set(value);
          this.emit();
        }
      },
      { allowSignalWrites: true }
    );
  }

  /** Allows the parent to programmatically reset the dropdowns (e.g. after Clear). */
  reset(): void {
    this.selectedType.set(null);
    this.selectedValue.set(null);
    this.emit();
  }

  typeLabel(type: PreferenceType): string {
    return TYPE_LABELS[type];
  }

  formatValue(value: string): string {
    return formatPreferenceValue(this.selectedType(), value);
  }

  onTypeChange(value: string): void {
    this.selectedType.set((value || null) as PreferenceType | null);
    this.selectedValue.set(null);
    this.emit();
  }

  onValueChange(value: string): void {
    this.selectedValue.set(value || null);
    this.emit();
  }

  private emit(): void {
    this.selectionChange.emit({
      preferenceType: this.selectedType(),
      preferenceValue: this.selectedValue()
    });
  }
}
