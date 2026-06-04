import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'fx-privacy',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-content px-5 py-12 sm:px-8 sm:py-16">
      <header class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-accent">Legal</p>
        <h1 class="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">Privacy Policy</h1>
        <p class="mt-2 text-sm text-navy-500">Last Updated: May 2026</p>
      </header>

      <div class="mt-10 max-w-3xl space-y-10 text-base leading-relaxed text-navy-600">
        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">1. Introduction</h2>
          <p class="mt-3">
            FX–Brief ("we", "our", or "us") is committed to protecting your personal data. This
            Privacy Policy explains what information we collect, how we use it, and your rights as a
            user. By registering and using FX–Brief, you agree to the terms of this Privacy Policy.
            This policy is written in compliance with Indonesia's Undang-Undang Perlindungan Data
            Pribadi (UU PDP).
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">2. Data We Collect</h2>
          <p class="mt-3">We collect only the minimum data necessary to provide the FX–Brief service:</p>
          <ul class="mt-3 space-y-2">
            @for (item of dataCollected; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">3. How We Use Your Data</h2>
          <ul class="mt-3 space-y-2">
            @for (item of dataUse; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">4. Data Sharing</h2>
          <p class="mt-3">
            We do not sell, rent, or share your personal data with any third party for commercial
            purposes. Your data is only processed by the following services necessary to operate
            FX–Brief:
          </p>
          <ul class="mt-3 space-y-2">
            @for (item of thirdParties; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">5. Data Security</h2>
          <ul class="mt-3 space-y-2">
            @for (item of security; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">6. Your Rights (UU PDP)</h2>
          <ul class="mt-3 space-y-2">
            @for (item of rights; track item) {
              <li class="flex gap-2">
                <i class="pi pi-circle-fill mt-1.5 text-[6px] text-accent"></i>
                <span>{{ item }}</span>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">7. Data Retention</h2>
          <p class="mt-3">
            We retain your account data for as long as your account is active. If you request account
            deletion, all your personal data will be permanently deleted within 30 days. You can
            cancel the deletion request at any time within that 30 day window by logging in and
            choosing to keep your account. Once the 30 days have passed, deletion is permanent and
            cannot be reversed. Anonymized, non-identifiable usage statistics may be retained for
            platform improvement purposes.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">8. Changes to This Policy</h2>
          <p class="mt-3">
            We may update this Privacy Policy from time to time. If we make significant changes, we
            will notify you via email. Continued use of FX–Brief after changes constitutes acceptance
            of the updated policy.
          </p>
        </section>

        <section>
          <h2 class="font-display text-xl font-semibold text-navy-900">9. Contact</h2>
          <p class="mt-3">
            If you have any questions about this Privacy Policy or wish to exercise your data rights,
            please contact us using the feedback button on your Account page.
          </p>
        </section>
      </div>
    </article>
  `
})
export class PrivacyComponent {
  readonly dataCollected = [
    'Email address — used for account identification, login, email verification, and transactional notifications',
    'Password — stored in encrypted form (hashed with BCrypt), never stored in plain text. Not collected for Google login users.',
    'Google account information — name and email, collected only when you register or log in with Google',
    'Report generation logs — the date and time you generated each report, used to enforce the one-report-per-market-day limit',
    'Subscription data — your plan type (Free, Basic, or Premium), remaining report count, and payment history',
    'Payment transactions — processed entirely by Midtrans. FX–Brief does not store any payment card details.'
  ];

  readonly dataUse = [
    'To authenticate your account and manage your login sessions',
    'To verify your email address on registration',
    'To enforce the one-report-per-forex-market-day limit, which resets at 22:00 UTC',
    'To manage your subscription status and remaining report count',
    'To process payments via Midtrans and update your report count accordingly',
    'To send transactional emails — verification, welcome, report exhaustion, feedback acknowledgement, feedback reply',
    'To monitor platform usage for performance and improvement purposes'
  ];

  readonly thirdParties = [
    'DigitalOcean — cloud hosting and managed database. Your data is stored on DigitalOcean servers.',
    'Resend — transactional email delivery. Your email is used solely to send the emails described in Section 3.',
    'Midtrans — payment processing. Payment data is handled entirely by Midtrans and never stored by FX–Brief.',
    'Google — if you use Google login, your name and email are shared with FX–Brief by Google as part of the OAuth flow.'
  ];

  readonly security = [
    'All data transmitted over HTTPS using SSL/TLS encryption',
    'Passwords hashed using BCrypt — never stored in plain text',
    'Database access restricted and not publicly exposed',
    'Payment data never stored — handled entirely by Midtrans',
    'Admin access to user data limited to platform owner only'
  ];

  readonly rights = [
    'Right to access — request information about what data we hold about you',
    'Right to correction — request that inaccurate data be corrected',
    'Right to deletion — request permanent deletion of your account and all associated data. Use the option on your Account/Profile page. Data deleted within 30 days. You can cancel your deletion request by logging in within the 30 day window and choosing to keep your account.',
    'Right to withdraw consent — stop using FX–Brief at any time. Ceasing use constitutes withdrawal of consent for future data processing.'
  ];

  constructor() {
    inject(SeoService).apply({
      title: 'Privacy Policy',
      description:
        "FX–Brief's Privacy Policy, compliant with Indonesia's UU PDP — what we collect, how we use it, and your rights.",
      url: 'https://fx-brief.com/privacy',
      canonical: 'https://fx-brief.com/privacy'
    });
  }
}
