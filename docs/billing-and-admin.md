# Billing and the extended admin panel

Phase 2 decisions behind page groups 38–40 in the design canvas (প্ল্যান ও বিল, অ্যাডমিন — বিলিং, অ্যাডমিন — সিস্টেম).
Read this before building those screens or the billing backend.

## Who pays

The subscription belongs to the **account owner**, not to a project. An owner's plan caps how many projects they own and
how many members a project can have. Members and partners never pay. Archived (finished) projects don't count toward the
project limit; they stay readable.

## Plans (proposed prices — set the real ones in Admin › প্ল্যান)

| Plan      | Monthly | Yearly (2 months free) | Projects  | Members per project | Adds                                                            |
| --------- | ------- | ---------------------- | --------- | ------------------- | --------------------------------------------------------------- |
| ফ্রি      | ৳ 0     | —                      | 1         | 2                   | expenses, suppliers, contractors, accounts, reports (view only) |
| ব্যক্তিগত | ৳ 499   | ৳ 4,990                | 3         | 5                   | Excel export and backup, farm and shop sales                    |
| যৌথ       | ৳ 1,499 | ৳ 14,990               | 10        | 20                  | partners, capital calls, flat sales, instalments, receipts      |
| ডেভেলপার  | ৳ 3,999 | ৳ 39,990               | unlimited | 50                  | own logo on receipts, phone support                             |

- **Trial:** 14 days of যৌথ, starting when the first project is opened. No payment details are needed up front. When the
  trial ends unpaid, the account drops to ফ্রি and projects beyond the free limit become read-only.
- **Changing plan:** an upgrade applies at once, and the unused days of the old plan come off the new price (12 of 30
  days of ৳ 1,499 = ৳ 600). A downgrade applies at the end of the current period.
- **Price changes:** current subscribers keep the old price until their next renewal and are told 30 days ahead, by
  SMS and email.

## Payments

| Route                                | Methods                           | Renewal                                                                                        |
| ------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| bKash Tokenized Checkout (agreement) | bKash                             | Automatic: the owner approves once and we charge each period against the agreement id we store |
| SSLCommerz                           | cards, Nagad, Rocket, net banking | Manual: the owner pays each period; reminders go out 3 days before and on the due day          |

SSLCommerz has no subscription object of its own, so renewal scheduling, retries and the renewal ledger are ours either
way. Fees are around 2.5% for local cards and MFS, plus a setup fee, and the real rates are set in the merchant agreement.
Get the bKash recurring product and both MDRs confirmed in writing before launch. A nightly job reconciles our ledger
against both gateways' settlements.

## When a payment fails (dunning)

1. **Day 0:** the charge fails. The owner gets an SMS and email with the reason (low bKash balance, expired card).
2. **Days 1–7 (grace):** we retry daily at 06:00. Everything keeps working, and a red banner shows on the dashboard.
3. **After 7 days:** new entries are blocked. Viewing, reports and Excel keep working.
4. **After 30 days:** the account moves to ফ্রি. Nothing is ever deleted.

## Admin panel additions

| Group   | Screen                   | Why it exists                                                                                                                                   |
| ------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| বিলিং   | রেভিনিউ                  | MRR, ARR, trial conversion, the month's MRR movement, churn (gross, net, involuntary), overdue accounts, upcoming renewals                      |
|         | সাবস্ক্রিপশন + বিস্তারিত | Find an owner's billing state fast. Extend, comp, refund or cancel, each with a reason and a 2FA code, all audited                              |
|         | পেমেন্ট                  | Every gateway transaction, failure reasons, refunds, reconciliation status                                                                      |
|         | প্ল্যান + এডিট           | Prices, limits and features (the pricing page reads from these), plus the trial and dunning rules                                               |
|         | কুপন                     | Percent or fixed discounts, per plan, with duration, usage cap and expiry. One use per owner                                                    |
| সিস্টেম | অ্যানালিটিক্স            | Signups, activation funnel (account → project → first entry → invite → paid), monthly cohorts, project kinds. Aggregates only, no personal data |
|         | সিস্টেম হেলথ             | API, database, jobs, SMS, email, payment webhooks and storage status; failed-job retry; nightly backups and the last restore test               |
|         | এসএমএস ও ইমেইল           | Delivery log, editable templates in both languages, SMS balance alert (login codes stop when it runs out)                                       |
|         | সিকিউরিটি                | Admin sessions with remote sign-out, failed logins, blocked IPs, rate limits, staff 2FA status                                                  |
|         | ফিচার ও রেজিস্ট্রেশন     | Registration open / invite-only / closed, trial on or off, feature flags by plan or account with a kill switch                                  |

The admin sidebar in the new boards has three groups (general, বিলিং, সিস্টেম). The original admin boards still show
the old seven-item menu. Build the sidebar once from the new menu.

## Still to decide

- Final prices, and whether VAT is shown on top of them or included.
- Whether support staff can view the app as a user (impersonation). Sources recommend it, with a session log, an expiry
  and a visible banner. The current design only has the owner-granted read-only support view.
- The SMS provider, and who tops up the balance.

## Sources

- bKash agreement-based recurring, community SDKs: [bkash-rs subscriptions](https://docs.rs/crate/bkash-rs/latest/source/src/models/subscriptions.rs),
  [laravel-bkash](https://packagist.org/packages/sabitahmad/laravel-bkash), [bkash-js](https://github.com/msilabs/bkash-js)
- SSLCommerz recurring and fees: [saasaloy issue #214](https://github.com/mimukit/saasaloy/issues/214),
  [paymentgateways.org review](https://paymentgateways.org/gateway/sslcommerz), [bengalcloud 2026 guide](https://bengalcloud.com/best-payment-gateway-in-bangladesh/)
- Dunning and grace periods: [Lago](https://getlago.com/blog/dunning-management),
  [Kinde](https://kinde.com/learn/billing/churn/dunning-strategies-for-saas-email-flows-and-retry-logic/)
- Admin panel scope (impersonation, audit, flags, churn metrics):
  [operator dashboards](https://brotcode.pages.dev/blog/engineering/saas-admin-dashboard-operators/),
  [Makerkit super admin](https://makerkit.dev/blog/changelog/super-admin)
