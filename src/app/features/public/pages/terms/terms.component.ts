import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-terms',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Legal</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p class="mt-2 text-sm text-navy-500">v1.0 | May 2026 | Effective upon registration</p>
      </header>

      <div class="mt-10 max-w-3xl space-y-10 text-base leading-relaxed text-navy-600">
        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">1. Agreement to Terms</h2>
          <p class="mt-3">
            By registering for and using FX–Brief, you agree to be bound by these Terms of Service. If
            you do not agree to these terms, do not use FX–Brief. These terms apply to all users of
            the platform, including Free, Basic, and Premium plan users.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">2. What FX–Brief Is</h2>
          <p class="mt-3">
            FX–Brief is a market analysis tool that provides daily forex analysis reports based on
            technical and fundamental data. FX–Brief is designed to support your trading research —
            not to replace your judgment.
          </p>
          <p class="mt-3">FX–Brief is NOT:</p>
          <ul class="mt-3 space-y-2">
            @for (item of notList; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
          <p class="mt-3">
            Every analysis report is generated using structured technical logic and AI-assisted
            narratives. Market data is refreshed every 65 minutes during forex market hours. Reports
            are not based on tick-by-tick real-time data.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">3. Not Financial Advice</h2>
          <p class="mt-3">
            Nothing on FX–Brief constitutes financial advice, investment advice, trading advice, or
            any other form of advice. All content is provided for informational and educational
            purposes only.
          </p>
          <p class="mt-3">
            You are solely responsible for every trading decision you make. FX–Brief and its owner
            accept no liability for any losses, damages, or consequences arising from your use of the
            platform or any trading decisions made based on its content.
          </p>
          <p class="mt-3">
            Always apply your own judgment, conduct your own research, and manage your own risk before
            entering any trade.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">4. Eligibility</h2>
          <ul class="mt-3 space-y-2">
            @for (item of eligibility; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">5. Accounts</h2>
          <h3 class="mt-3 text-sm font-semibold text-navy-900">5.1 Registration</h3>
          <p class="mt-2">
            You may register using email and password or Google login. You are responsible for
            maintaining the security of your account credentials. Notify us immediately if you suspect
            unauthorized access to your account.
          </p>
          <h3 class="mt-4 text-sm font-semibold text-navy-900">5.2 Account Termination</h3>
          <p class="mt-2">
            You may request account deletion at any time from your Account page. Your account will be
            permanently deleted within 30 days of the request. You may cancel the deletion request by
            logging in within that 30 day window.
          </p>
          <p class="mt-3">
            We reserve the right to suspend or terminate accounts that violate these Terms of Service,
            including but not limited to accounts that attempt to abuse the free report system or
            engage in fraudulent activity.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">6. Reports and Usage Limits</h2>
          <ul class="mt-3 space-y-2">
            @for (item of usageLimits; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">7. Payments</h2>
          <h3 class="mt-3 text-sm font-semibold text-navy-900">7.1 Pricing</h3>
          <p class="mt-2">
            Basic plan: $10 per top-up (20 reports). Premium plan: $20 per top-up (20 reports). Prices
            are displayed in USD. Transactions are processed in Indonesian Rupiah (IDR) at the
            prevailing exchange rate at time of payment. Payments are processed by Midtrans and subject
            to Midtrans transaction fees.
          </p>
          <h3 class="mt-4 text-sm font-semibold text-navy-900">7.2 No Refunds</h3>
          <p class="mt-2">
            All payments are final. We do not offer refunds for unused reports or partial top-ups.
            Reports are consumption-based — once a top-up is purchased, it is credited to your account
            immediately upon payment confirmation.
          </p>
          <h3 class="mt-4 text-sm font-semibold text-navy-900">7.3 Payment Processing</h3>
          <p class="mt-2">
            FX–Brief does not store any payment card or payment account details. All payment
            processing is handled entirely by Midtrans. By making a payment, you also agree to
            Midtrans's terms and conditions.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">8. Acceptable Use</h2>
          <p class="mt-3">You agree not to:</p>
          <ul class="mt-3 space-y-2">
            @for (item of acceptableUse; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">9. Intellectual Property</h2>
          <p class="mt-3">
            All content, analysis logic, branding, and software comprising FX–Brief is owned by
            FX–Brief and its owner. You are granted a limited, non-exclusive, non-transferable license
            to access and use FX–Brief for personal trading research purposes only.
          </p>
          <p class="mt-3">
            Report content generated for your account is for your personal use only. You may not
            redistribute, republish, or commercialize FX–Brief report content without explicit written
            permission.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">10. Disclaimer of Warranties</h2>
          <p class="mt-3">
            FX–Brief is provided on an as-is and as-available basis. We make no warranties, express or
            implied, regarding:
          </p>
          <ul class="mt-3 space-y-2">
            @for (item of warranties; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
          <p class="mt-3">
            Market data is sourced from third-party data providers and refreshed every 65 minutes
            during market hours. FX–Brief does not guarantee data accuracy and accepts no liability for
            data errors or delays.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">11. Limitation of Liability</h2>
          <p class="mt-3">
            To the maximum extent permitted by applicable law, FX–Brief and its owner shall not be
            liable for any direct, indirect, incidental, consequential, or punitive damages arising
            from:
          </p>
          <ul class="mt-3 space-y-2">
            @for (item of liability; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">12. Changes to Terms</h2>
          <p class="mt-3">
            We may update these Terms of Service from time to time. If we make significant changes, we
            will notify you via email. Continued use of FX–Brief after changes constitutes acceptance
            of the updated terms.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">13. Governing Law</h2>
          <p class="mt-3">
            These Terms of Service are governed by the laws of Indonesia. Any disputes arising from
            these terms or your use of FX–Brief shall be subject to the jurisdiction of Indonesian
            courts.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">14. Contact</h2>
          <p class="mt-3">
            If you have any questions about these Terms of Service, please contact us using the
            feedback button on your Account page.
          </p>
        </section>
      </div>
    </article>
  `
})
export class TermsComponent {
  readonly notList = [
    'A financial advisor',
    'A licensed investment service',
    'A signal service guaranteeing profitable trades',
    'A real-time trading platform'
  ];

  readonly eligibility = [
    'You must be at least 18 years old to use FX–Brief',
    'You must provide accurate information during registration',
    'One account per person — creating multiple accounts to obtain additional free reports is prohibited',
    'FX–Brief is available to users in Indonesia and internationally, subject to local laws and regulations'
  ];

  readonly usageLimits = [
    'Free plan users receive 3 reports — one time only, never replenished',
    'Basic and Premium plan users receive 20 reports per top-up — consumption based, never expire until used',
    'One report may be generated per forex market day (resets at 22:00 UTC)',
    'Report generation is locked during forex market close (Friday 22:00 UTC to Sunday 22:00 UTC)',
    'If all pairs return no meaningful analysis, no report limit is subtracted',
    'Reports are for personal use only — redistribution or resale of report content is prohibited'
  ];

  readonly acceptableUse = [
    'Use FX–Brief for any unlawful purpose',
    'Attempt to bypass or abuse the free report limit by creating multiple accounts',
    "Reverse engineer, scrape, or copy FX–Brief's analysis logic or output for commercial use",
    'Share your account credentials with others',
    "Attempt to disrupt, damage, or gain unauthorized access to FX–Brief's systems"
  ];

  readonly warranties = [
    'The accuracy, completeness, or timeliness of any analysis or market data',
    'The fitness of FX–Brief for any particular trading strategy or purpose',
    'Uninterrupted or error-free access to the platform',
    'The results of any trading decisions made using FX–Brief'
  ];

  readonly liability = [
    'Your use of or inability to use FX–Brief',
    'Any trading losses incurred based on FX–Brief analysis',
    'Any errors, inaccuracies, or omissions in report content',
    'Any interruption or unavailability of the service'
  ];

  constructor() {
    inject(SeoService).apply({
      title: 'Terms of Service',
      description:
        "FX–Brief's Terms of Service — how the platform works, usage limits, payments, and your responsibilities.",
      url: 'https://fx-brief.com/terms',
      canonical: 'https://fx-brief.com/terms'
    });
  }
}
