import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../../../core/services/seo.service';
import { APP_ROUTES } from '../../../../core/config/app-routes';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  featured: boolean;
}

@Component({
  selector: 'fx-landing',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="bg-gradient-to-b from-navy-900 to-navy-800 text-white">
      <div class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-20">
        <div class="max-w-3xl">
          <h1 class="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Know what matters before you trade.
          </h1>
          <p class="mt-5 max-w-2xl text-lg leading-relaxed text-navy-100">
            Daily forex market briefings filtered for quality — technical structure, key zones, and
            fundamental context. Trade only what matters.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              [routerLink]="routes.register"
              class="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >Try Free — No Credit Card Needed</a
            >
            <a
              href="#pricing"
              class="inline-flex items-center justify-center rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >See Plans</a
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Product preview -->
    <section class="bg-gradient-to-b from-navy-800 to-surface-muted">
      <div class="mx-auto max-w-content px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
        <div class="mx-auto max-w-2xl rounded-2xl bg-navy-50 p-3 shadow-2xl ring-1 ring-navy-200 sm:p-4">
          <!-- Summary card -->
          <div class="rounded-xl bg-white px-5 py-5 shadow-sm">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Today's market conclusion
            </p>
            <h3 class="mt-0.5 font-display text-lg font-bold text-navy-900">Market summary</h3>
            <div class="mt-4 grid grid-cols-2 gap-2.5">
              @for (item of previewSummary; track item.label) {
                <div class="rounded-lg bg-surface-muted px-3 py-2">
                  <p class="text-[10px] font-medium text-navy-400">{{ item.label }}</p>
                  <p class="text-xs font-semibold text-navy-900">{{ item.value }}</p>
                </div>
              }
            </div>
            <div class="mt-3 rounded-lg bg-amber-50 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                High-impact events today
              </p>
              <p class="mt-0.5 text-xs text-amber-800">FOMC Rate Decision, US CPI y/y</p>
            </div>
          </div>

          <!-- Best-pair card -->
          <div class="mt-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-accent">
            <span class="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <i class="pi pi-star-fill text-[8px]"></i> Best Pair Today
            </span>
            <div class="mt-2 flex items-start justify-between">
              <div>
                <h4 class="font-display text-lg font-bold text-navy-900">XAU/USD</h4>
                <p class="text-sm font-medium text-green-600">Bullish</p>
              </div>
              <div class="rounded-xl bg-green-100 px-3 py-2 text-center text-green-700">
                <span class="block text-[9px] font-medium uppercase opacity-70">Confidence</span>
                <span class="block text-base font-bold uppercase">High</span>
              </div>
            </div>

            <div class="mt-3 rounded-lg bg-surface-muted px-3 py-2.5">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-navy-400">Setup status</p>
              <p class="mt-0.5 text-xs text-navy-700">
                CONFIRMED LONG at H4 demand — clean M15 break of structure with strong confluence
              </p>
            </div>

            <div class="mt-3 grid grid-cols-4 gap-2">
              <div>
                <p class="text-[10px] font-medium text-navy-400">Entry</p>
                <p class="text-xs font-semibold text-navy-900">2418.40–2421.10</p>
              </div>
              <div>
                <p class="text-[10px] font-medium text-navy-400">Stop</p>
                <p class="text-xs font-semibold text-navy-900">2412.85</p>
              </div>
              <div>
                <p class="text-[10px] font-medium text-navy-400">Target</p>
                <p class="text-xs font-semibold text-navy-900">2438.60</p>
              </div>
              <div>
                <p class="text-[10px] font-medium text-navy-400">R:R</p>
                <p class="text-xs font-semibold text-navy-900">1:2.8</p>
              </div>
            </div>

            <p class="mt-3 text-xs leading-relaxed text-navy-600">
              Price reclaimed the H4 demand zone with a decisive M15 break of structure, aligning with
              the daily bullish trend and a supportive fundamental backdrop.
            </p>

            <!-- Expanded: executive reasoning (stops here) -->
            <div class="mt-4 border-t border-surface-border pt-4">
              <div class="flex items-center justify-between text-xs font-semibold text-accent">
                <span>Hide full analysis</span>
                <i class="pi pi-chevron-up"></i>
              </div>
              <div class="mt-3">
                <h5 class="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                  Executive reasoning
                </h5>
                <p class="mt-1 text-xs leading-relaxed text-navy-700">
                  Gold is in a confirmed bullish structure across the weekly and daily timeframes, and
                  price has just completed a clean pullback into a fresh H4 demand zone. The M15 break
                  of structure provides entry confirmation, while a softening dollar and dovish rate
                  expectations reinforce the upside case. Risk is well-defined below the zone.
                </p>
              </div>

              <!-- Skeleton of further sections, fading out to imply more depth -->
              <div class="relative mt-5 max-h-28 overflow-hidden" aria-hidden="true">
                <div class="space-y-4 opacity-60">
                  <div>
                    <h5 class="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                      Market structure
                    </h5>
                    <div class="mt-2 grid grid-cols-4 gap-2">
                      <div class="h-9 rounded-lg bg-surface-muted"></div>
                      <div class="h-9 rounded-lg bg-surface-muted"></div>
                      <div class="h-9 rounded-lg bg-surface-muted"></div>
                      <div class="h-9 rounded-lg bg-surface-muted"></div>
                    </div>
                  </div>
                  <div>
                    <h5 class="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                      Supply &amp; demand zones
                    </h5>
                    <div class="mt-2 h-3 w-2/3 rounded bg-surface-muted"></div>
                  </div>
                </div>
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
              </div>

              <p class="mt-1 text-center text-[11px] font-medium text-navy-400">
                + Market structure, supply &amp; demand zones, M15 confirmation, confidence
                assessment, setup lifecycle &amp; fundamental context
              </p>
            </div>
          </div>

          <p class="px-1 pt-3 text-center text-[11px] text-navy-400">
            Illustrative preview — your live report uses the latest market data.
          </p>
        </div>
      </div>
    </section>

    <!-- Problem -->
    <section class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <h2 class="font-display text-2xl font-bold text-navy-900 sm:text-3xl">Sound familiar?</h2>
      <p class="mt-4 max-w-2xl text-base leading-relaxed text-navy-600">
        Every trading day, you spend hours reviewing charts, checking economic calendars, reading
        news, and trying to figure out which pairs are worth trading. By the time you're done — the
        best setups are already moving.
      </p>
    </section>

    <!-- Solution -->
    <section class="bg-surface-muted">
      <div class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
        <h2 class="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Your market briefing. Ready in seconds.
        </h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-navy-600">
          FX–Brief filters the market for you. Every trading day, get structured analysis on the
          pairs that matter — technical structure, key zones, and fundamental context combined. Spend
          less time searching. More time executing. Reports are ready quickly from cached data, or
          generated fresh when needed.
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <h2 class="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
        What Every FX–Brief Report Includes
      </h2>
      <div class="mt-8 grid gap-5 sm:grid-cols-2">
        @for (f of features; track f.title) {
          <div class="rounded-2xl border border-surface-border bg-white p-6">
            <h3 class="font-display text-lg font-semibold text-navy-900">{{ f.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-navy-600">{{ f.description }}</p>
          </div>
        }
      </div>
    </section>

    <!-- How it works -->
    <section class="bg-surface-muted">
      <div class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
        <h2 class="font-display text-2xl font-bold text-navy-900 sm:text-3xl">How FX–Brief works</h2>
        <div class="mt-8 grid gap-5 sm:grid-cols-3">
          @for (step of steps; track step.title; let i = $index) {
            <div class="rounded-2xl bg-white p-6 shadow-sm">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 font-display text-sm font-bold text-white">
                {{ i + 1 }}
              </span>
              <h3 class="mt-4 font-display text-lg font-semibold text-navy-900">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-navy-600">{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="bg-surface-muted scroll-mt-20">
      <div class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
        <h2 class="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Simple, consumption-based pricing. No subscriptions. No auto-renewals.
        </h2>
        <p class="mt-3 max-w-2xl text-base text-navy-600">
          Buy reports. Use them at your own pace. Top up when you need more.
        </p>

        <div class="mt-8 grid gap-5 lg:grid-cols-3">
          @for (plan of plans; track plan.name) {
            <div
              class="flex flex-col rounded-2xl border bg-white p-6"
              [class.border-surface-border]="!plan.featured"
              [class.border-accent]="plan.featured"
              [class.ring-1]="plan.featured"
              [class.ring-accent]="plan.featured"
            >
              <div class="flex items-baseline justify-between">
                <h3 class="font-display text-xl font-bold text-navy-900">{{ plan.name }}</h3>
                <span class="font-display text-2xl font-bold text-navy-900">{{ plan.price }}</span>
              </div>
              <p class="mt-2 text-sm text-navy-600">{{ plan.description }}</p>
              <ul class="mt-5 flex-1 space-y-2.5">
                @for (feature of plan.features; track feature) {
                  <li class="flex gap-2 text-sm text-navy-700">
                    <i class="pi pi-check mt-0.5 text-xs text-accent"></i>
                    <span>{{ feature }}</span>
                  </li>
                }
              </ul>
              <a
                [routerLink]="routes.register"
                class="mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition"
                [class.bg-navy-600]="plan.featured"
                [class.text-white]="plan.featured"
                [class.hover:bg-navy-700]="plan.featured"
                [class.border]="!plan.featured"
                [class.border-surface-border]="!plan.featured"
                [class.text-navy-700]="!plan.featured"
                [class.hover:bg-surface-muted]="!plan.featured"
                >Get Started</a
              >
            </div>
          }
        </div>

        <p class="mt-6 text-sm text-navy-500">
          Reports never expire. Use them daily or weekly — they're yours until you use them.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-navy-900 text-white">
      <div class="mx-auto max-w-content px-5 py-12 text-center sm:px-8 sm:py-16">
        <h2 class="font-display text-2xl font-bold sm:text-3xl">Ready to trade with clarity?</h2>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-100">
          Start with 3 free reports today. No subscriptions, no auto-renewals, no credit card
          required. Just structured market analysis — ready when you are.
        </p>
        <a
          [routerLink]="routes.register"
          class="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >Get Started Free</a
        >
      </div>
    </section>
  `
})
export class LandingComponent {
  readonly routes = APP_ROUTES;

  readonly previewSummary = [
    { label: 'Strongest Pair', value: 'XAU/USD' },
    { label: 'Weakest Pair', value: 'GBP/USD' },
    { label: 'Best Technical Structure', value: 'XAU/USD · Bullish' },
    { label: 'Highest Fundamental Alignment', value: 'XAU/USD' },
    { label: 'Valid Setups', value: '6 / 8' },
    { label: 'Market Environment', value: 'Risk-On Environment' }
  ];

  readonly steps = [
    {
      title: 'Generate your report',
      description: 'One tap builds your daily briefing from the latest multi-timeframe market data.'
    },
    {
      title: 'Review the setups',
      description:
        'See the highest-quality opportunities — bias, confidence, trade parameters, and market context, ranked for you.'
    },
    {
      title: 'Trade with confidence',
      description:
        'Act on structured analysis instead of spending hours charting. Clarity before the market opens.'
    }
  ];

  readonly features = [
    {
      title: 'Multi-Timeframe Analysis',
      description:
        'Every report is built top-down across Weekly, Daily, H4, and M15 timeframes so you always see the full picture before making a decision.'
    },
    {
      title: 'Structure-Based Trade Setups',
      description:
        'When a pair is ready, you get a clear entry zone, take profit, and stop loss — all based on real market structure, not guesswork.'
    },
    {
      title: 'Fundamental Context',
      description:
        "High-impact economic events and geopolitical factors are layered into every report so you know what's driving the market this week."
    },
    {
      title: 'Personalized Market Focus',
      description:
        'FX–Brief adapts to your trading preferences — helping you focus on the setups and market conditions that match how you trade. Market quality always comes first.'
    }
  ];

  readonly plans: PricingPlan[] = [
    {
      name: 'Free',
      price: '$0',
      description: 'Try FX–Brief with no commitment. See exactly what you get before spending a cent.',
      features: [
        '3 free reports — no credit card needed',
        '1 best pair per day',
        'Daily pair card — bias, confidence, short reasoning',
        'Report history locked'
      ],
      featured: false
    },
    {
      name: 'Basic',
      price: '$10',
      description:
        'Perfect for traders who want a focused daily insight on the single best pair available.',
      features: [
        '20 reports per top-up',
        '1 best pair per day',
        'Daily pair card — bias, confidence, short reasoning',
        'Last 10 reports saved in history'
      ],
      featured: true
    },
    {
      name: 'Premium',
      price: '$20',
      description:
        'For active traders who want the full picture — all major pairs, every trading day.',
      features: [
        'Full market coverage across all monitored pairs',
        '20 reports per top-up',
        'All 8 major pairs including Gold (XAU/USD)',
        'Daily pair cards + full technical and fundamental breakdown per pair',
        'Unlimited report history'
      ],
      featured: false
    }
  ];

  constructor() {
    const seo = inject(SeoService);
    seo.apply({
      title: 'FX–Brief — AI-Powered Forex Analysis',
      description:
        'Daily forex market briefings filtered for quality — technical structure, key zones, and fundamental context. Trade only what matters.',
      url: 'https://fx-brief.com/',
      canonical: 'https://fx-brief.com/'
    });
    seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FX–Brief',
      url: 'https://fx-brief.com/',
      logo: 'https://fx-brief.com/assets/images/logo-primary.png',
      description:
        'FX–Brief delivers structured, AI-powered forex analysis reports built for traders who want clarity before the market opens.'
    });
  }
}
