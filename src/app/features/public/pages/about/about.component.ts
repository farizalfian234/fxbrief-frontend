import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../../../core/services/seo.service';

interface Classification {
  label: string;
  badgeClass: string;
  when: string;
  means: string;
}

@Component({
  selector: 'fx-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">About / Help</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          How FX–Brief Works
        </h1>
      </header>

      <div class="mt-10 max-w-3xl space-y-12">
        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            Your daily analysis, structured for action.
          </h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              Every time you generate a report, FX–Brief analyzes the major forex pairs using a
              top-down multi-timeframe approach — starting from the Weekly chart, then Daily, then
              H4, and finally M15 for entry timing. This ensures every insight is backed by the
              bigger picture before zooming into the details.
            </p>
            <p>
              Your report starts with a summary of the overall market picture, followed by pair
              cards showing the most important information at a glance. Each card shows the pair's
              bias, confidence level, setup status, trade parameters (entry zone, stop loss, take
              profit, and R:R when available), and a short reasoning — everything you need to decide
              whether a pair is worth watching this session.
            </p>
            <p>
              Every pair card has a View Full Analysis button. Free and Basic users see the button
              but it is locked — tap it to see upgrade options. Premium users can expand it to see
              the full analysis — an executive reasoning summary, complete market structure
              breakdown, supply and demand zone details, entry confirmation signals, confidence
              assessment, setup lifecycle and risk, and fundamental context. Every number and level
              in the report is calculated from real market data. Nothing is guessed.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            What each classification means
          </h2>
          <div class="mt-4 space-y-4">
            @for (c of classifications; track c.label) {
              <div class="rounded-2xl border border-surface-border bg-white p-5">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  [class]="c.badgeClass"
                  >{{ c.label }}</span
                >
                <p class="mt-3 text-sm font-medium text-navy-900">When you see this</p>
                <p class="mt-1 text-sm leading-relaxed text-navy-600">{{ c.when }}</p>
                <p class="mt-3 text-sm font-medium text-navy-900">What it means</p>
                <p class="mt-1 text-sm leading-relaxed text-navy-600">{{ c.means }}</p>
              </div>
            }
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            Reports you own. No expiry. Use them at your own pace.
          </h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              Each top-up gives you 20 reports. There is no time limit — your reports never expire
              until you use them. You can generate every trading day, or only when the market looks
              interesting. It's completely up to you.
            </p>
            <p>
              You can generate one report per forex market day. The limit resets at 22:00 UTC — the
              moment New York closes and Sydney opens, marking the start of a new forex trading day.
              This is the same for every user, everywhere in the world.
            </p>
            <p>
              One exception: if all pairs return no meaningful content — no setups, no active zones,
              no fundamental events, nothing — your report limit is not subtracted. We only count a
              report when you actually receive something useful.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">Try before you commit.</h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              Every new account starts with 3 free reports — no credit card required. Use them to
              see exactly what FX–Brief delivers before deciding to top up. Your free reports deliver
              the same analysis quality as paid reports — you get the best pair breakdown with full
              reasoning. The only difference is paid plans unlock additional pairs and report
              history.
            </p>
            <p>
              Report history is locked on the free plan. Once you top up to Basic or Premium, your
              history unlocks based on your plan — Basic shows your last 10 reports, Premium shows
              everything.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            The market is closed. And honestly — so should you be.
          </h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              The forex market runs from Sunday 22:00 UTC to Friday 22:00 UTC. Outside of these
              hours, there is no price action, no economic events, and no new data to analyze. A
              report generated during market close would be based on stale information and would not
              reflect what the market is actually doing when it reopens.
            </p>
            <p>
              So FX–Brief locks the Generate button during market close — not to restrict you, but
              because there is genuinely nothing useful to show. Use the downtime to rest, review
              your week, and come back fresh when the market reopens. It will still be there. And so
              will FX–Brief.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            When the market has nothing to say, we say so.
          </h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              Occasionally — especially during quiet periods or major holiday weeks — all pairs may
              show no significant technical setups, no active trends, and no impactful fundamental
              events. When this happens, FX–Brief will show a Markets Consolidating message instead
              of a report.
            </p>
            <p>
              This is not a bug. It means the market is in a waiting phase, and the data does not
              support a meaningful analysis at this time. On days like this, your report limit is not
              subtracted — because you did not receive a report. We think that's fair, and we hope
              you do too.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            We believe you deserve to know exactly how FX–Brief works.
          </h2>
          <div class="mt-4 space-y-4">
            @for (t of transparency; track t.title) {
              <div>
                <h3 class="text-sm font-semibold text-navy-900">{{ t.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-navy-600">{{ t.body }}</p>
              </div>
            }
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">
            Ready for more? Top up anytime.
          </h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              When you run out of reports — or want to switch plans — just tap the Top Up button. On
              your Dashboard it appears automatically when your reports reach zero. You can also find
              it at any time on your Account page or Report History page.
            </p>
            <p>
              Choose Basic ($10) for focused single-pair analysis, or Premium ($20) for the full
              8-pair breakdown. You can switch plans at any top up — no commitment to staying on the
              same plan.
            </p>
            <p>
              If you still have reports remaining when you top up, don't worry — they carry over.
              Your new total will be your remaining reports plus 20 new ones. We'll show you the
              calculation before you confirm.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">Your preference. Your focus.</h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              FX–Brief lets you set one market preference to personalize which pairs are prioritized
              in your report. Choose a preference type — Trading Style, Preferred Session, Risk
              Profile, or Favorite Pair — then select a value that matches how you trade.
            </p>
            <p>
              Your preference is one optional setting — a compatibility layer that slightly adjusts
              pair prioritization to match how you trade. Market quality always comes first.
              Preferences never override better setups. If you prefer not to set one, the default
              market-based ranking applies.
            </p>
          </div>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">Want to leave? We understand.</h2>
          <div class="mt-3 space-y-3 text-base leading-relaxed text-navy-600">
            <p>
              You can request account deletion from your Account page at any time. Once requested,
              your account is scheduled for permanent deletion after 30 days. During this window, all
              your data is still intact. You will receive a confirmation email with your deletion
              date as a reminder.
            </p>
            <p>
              Changed your mind? Simply log back in within the 30 day window. You will be shown a
              prompt asking whether you want to cancel the deletion request and keep your account, or
              continue with the deletion and log out. If you choose to keep your account, it is
              immediately reactivated — no data is lost. If you choose to continue, you will be logged
              out and the deletion will proceed as scheduled.
            </p>
            <p>Once the 30 days have passed, deletion is permanent and cannot be reversed.</p>
          </div>
        </section>

        <section class="rounded-2xl bg-surface-muted p-5">
          <p class="text-sm leading-relaxed text-navy-600">
            FX–Brief is a market analysis tool designed to support your research — not replace your
            judgment. Every trade you make is your own decision. Always apply proper risk management
            and never trade more than you can afford to lose. Past market structure does not
            guarantee future price movement.
          </p>
        </section>
      </div>
    </article>
  `
})
export class AboutComponent {
  readonly classifications: Classification[] = [
    {
      label: 'Confirmed',
      badgeClass: 'bg-green-100 text-green-700',
      when: 'A valid setup has been identified and all confirmation conditions are met.',
      means:
        'This is the most actionable state. The pair has a clear directional bias, a confirmed entry signal, and a specific area to watch. You will see an entry zone, a take profit level, and a stop loss level — all based on real market structure. No guesswork.'
    },
    {
      label: 'Awaiting Confirmation',
      badgeClass: 'bg-amber-100 text-amber-700',
      when: 'A potential setup is forming but the final confirmation signal has not fired yet.',
      means:
        'The technical structure is in place but the market has not yet given the green light. Watch this pair closely. When confirmation arrives, it may become actionable quickly. No trade plan is shown until confirmation is received.'
    },
    {
      label: 'Detected',
      badgeClass: 'bg-blue-100 text-blue-700',
      when: 'An early signal has been spotted, but it is too early to act.',
      means:
        'FX–Brief has identified the beginning of a potential setup. The conditions are not yet mature enough to warrant a trade plan. Monitor this pair for further development over the coming sessions.'
    },
    {
      label: 'Expired',
      badgeClass: 'bg-navy-100 text-navy-700',
      when: 'The setup window passed without the required confirmation triggering.',
      means:
        'The opportunity this setup represented has elapsed. The market moved on without producing a valid entry. This pair is no longer actionable based on the current setup — wait for a fresh signal to form.'
    },
    {
      label: 'Invalidated',
      badgeClass: 'bg-red-100 text-red-700',
      when: 'Market conditions have broken the setup.',
      means:
        'Something in the market structure has changed that removes the basis for the setup. Skip this pair for now. FX–Brief will identify a new setup if and when conditions improve.'
    }
  ];

  readonly transparency = [
    {
      title: 'Data Freshness',
      body:
        'Market data in FX–Brief is refreshed every 65 minutes during forex market hours. It is not tick-by-tick real-time data. FX–Brief is designed for multi-timeframe analysis on Weekly, Daily, H4, and M15 — timeframes where data refreshed within the hour is completely valid and meaningful for the analysis we provide. If you need millisecond-level live pricing, FX–Brief is not the right tool for that purpose.'
    },
    {
      title: 'AI-Generated Narratives',
      body:
        'The written explanations in your report — the reasoning, the descriptions, the summaries — are composed using an AI language model working from pre-computed structured data. The actual analysis — price levels, entry zones, supply and demand zones, Fibonacci levels, confidence scores, and signal classifications — is all calculated from real market data using structured technical logic. The words are written by AI. The numbers come from the market.'
    },
    {
      title: 'Not Financial Advice',
      body:
        'FX–Brief provides market analysis — not financial advice. Every report is a structured view of market conditions based on technical and fundamental data available at the time of generation. It does not guarantee any outcome. You are responsible for every trading decision you make. Always apply your own judgment and risk management before entering any trade.'
    },
    {
      title: 'Analysis Limitations',
      body:
        'FX–Brief analyzes market structure, supply and demand zones, Fibonacci confluence, and fundamental calendar events. It cannot predict black swan events, surprise central bank decisions, sudden geopolitical shocks, or any market-moving event that occurs after the last data refresh. No analysis tool can. Use FX–Brief as one input in your decision-making process — not the only one.'
    }
  ];

  constructor() {
    inject(SeoService).apply({
      title: 'How FX–Brief Works',
      description:
        'Learn how FX–Brief builds daily forex briefings: multi-timeframe analysis, setup classifications, report limits, and transparency.',
      url: 'https://fx-brief.com/about',
      canonical: 'https://fx-brief.com/about'
    });
  }
}
