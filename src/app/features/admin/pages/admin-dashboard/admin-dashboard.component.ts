import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SeoService } from '../../../../core/services/seo.service';
import { messageForError } from '../../../../shared/util/api-error.util';
import { AdminApiService } from '../../services/admin-api.service';
import { ChartCardComponent } from '../../components/chart-card.component';
import {
  ActiveInactiveSplit,
  DashboardStats,
  NewSubscribersPoint,
  ReportVolumePoint,
  RevenuePoint
} from '../../models/admin.models';
import {
  activeInactiveChart,
  newSubscribersChart,
  reportVolumeChart,
  revenueChart
} from '../../util/admin-charts.util';

@Component({
  selector: 'fx-admin-dashboard',
  standalone: true,
  imports: [ChartCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-2xl font-bold text-navy-900">Admin Dashboard</h1>

    @if (banner(); as msg) {
      <p class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ msg }}</p>
    }

    <!-- Quick stats -->
    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (s of statCards(); track s.label) {
        <div class="rounded-2xl border border-surface-border bg-white p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-navy-400">{{ s.label }}</p>
          @if (statsLoading()) {
            <div class="mt-3 h-8 w-16 animate-pulse rounded bg-surface-muted"></div>
          } @else {
            <p class="mt-2 font-display text-3xl font-bold" [class]="s.valueClass">{{ s.value }}</p>
          }
          <p class="mt-1 text-xs text-navy-400">{{ s.hint }}</p>
        </div>
      }
    </div>

    <!-- Charts -->
    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      @if (revenue(); as c) {
        <fx-chart-card
          title="Revenue per month"
          subtitle="Trailing 12 forex months (USD)"
          type="bar"
          [data]="c.data"
          [options]="c.options"
        />
      }
      @if (newSubscribers(); as c) {
        <fx-chart-card
          title="New subscribers per month"
          subtitle="First-time paid subscribers"
          type="bar"
          [data]="c.data"
          [options]="c.options"
        />
      }
      @if (activeInactive(); as c) {
        <fx-chart-card
          title="Active vs inactive users"
          subtitle="Current snapshot"
          type="bar"
          [data]="c.data"
          [options]="c.options"
        />
      }
      @if (reportVolume(); as c) {
        <fx-chart-card
          title="Daily report generation"
          subtitle="Trailing 30 forex days"
          type="line"
          [data]="c.data"
          [options]="c.options"
        />
      }
    </div>
  `
})
export class AdminDashboardComponent {
  private readonly api = inject(AdminApiService);

  readonly banner = signal('');
  readonly statsLoading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);

  readonly revenue = signal<ReturnType<typeof revenueChart> | null>(null);
  readonly newSubscribers = signal<ReturnType<typeof newSubscribersChart> | null>(null);
  readonly activeInactive = signal<ReturnType<typeof activeInactiveChart> | null>(null);
  readonly reportVolume = signal<ReturnType<typeof reportVolumeChart> | null>(null);

  readonly statCards = computed(() => {
    const s = this.stats();
    return [
      {
        label: 'Active subscribers',
        value: s?.totalActiveSubscribers ?? 0,
        hint: 'Basic + Premium',
        valueClass: 'text-navy-900'
      },
      {
        label: 'Reports this month',
        value: s?.totalReportsCurrentForexMonth ?? 0,
        hint: 'Current forex market month',
        valueClass: 'text-navy-900'
      },
      {
        label: 'Free users',
        value: s?.totalFreeUsersActive ?? 0,
        hint: 'Active free accounts',
        valueClass: 'text-navy-900'
      },
      {
        label: 'At 0 reports',
        value: s?.usersAtZeroRemainingReports ?? 0,
        hint: 'Needs renewal attention',
        valueClass: (s?.usersAtZeroRemainingReports ?? 0) > 0 ? 'text-amber-600' : 'text-navy-900'
      }
    ];
  });

  constructor() {
    inject(SeoService).apply({ title: 'Admin Dashboard' });
    this.load();
  }

  private load(): void {
    this.api.dashboardStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.statsLoading.set(false);
      },
      error: (err) => {
        this.banner.set(messageForError(err));
        this.statsLoading.set(false);
      }
    });

    this.api.revenue().subscribe({
      next: (d: RevenuePoint[]) => this.revenue.set(revenueChart(d)),
      error: (err) => this.banner.set(messageForError(err))
    });
    this.api.newSubscribers().subscribe({
      next: (d: NewSubscribersPoint[]) => this.newSubscribers.set(newSubscribersChart(d)),
      error: (err) => this.banner.set(messageForError(err))
    });
    this.api.activeInactive().subscribe({
      next: (d: ActiveInactiveSplit) => this.activeInactive.set(activeInactiveChart(d)),
      error: (err) => this.banner.set(messageForError(err))
    });
    this.api.reportVolume().subscribe({
      next: (d: ReportVolumePoint[]) => this.reportVolume.set(reportVolumeChart(d)),
      error: (err) => this.banner.set(messageForError(err))
    });
  }
}
