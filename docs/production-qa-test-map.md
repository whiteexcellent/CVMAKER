# OmniCV Production QA Test Map

This document operationalizes the live validation plan for `https://cvmaker-beta.vercel.app/` without introducing new production-only APIs or taking live Stripe charges.

## Test Lanes

- `free lane`: real internal free account, used for signup/login continuity, credit depletion, gated feature rejections, and checkout initialization.
- `pro lane`: real internal yearly Pro account, used for premium feature access, unlimited-credit display, current-plan pricing behavior, and billing portal access.
- `synthetic lane`: temporary entitlement simulation on an internal account by editing `profiles` fields and restoring them from snapshot after the test run.

## Evidence and Artifacts

- Browser session artifacts: `output/playwright/`
- Profile snapshots and rollback bundles: `output/qa/`
- Manual findings log: add dated notes to the same folder as screenshots and snapshots.

## AI Chat Triage

1. Sign into the `free lane` account and open `/wizard`.
2. Exercise AI chat on steps 1-4 with short and long prompts.
3. Capture:
   - visible UI message
   - request status for `POST /api/wizard/chat`
   - provider outcome from Vercel logs
4. In Vercel, verify `OPENROUTER_API_KEY` and `GROQ_API_KEY` are populated for the active production environment.
5. In Vercel logs, classify failures as one of:
   - `401`: session/cookie/auth propagation
   - `429`: Supabase rate-limit RPC
   - `502`: provider returned unusable content or hard HTTP error
   - `503`: no provider configured
   - `504`: upstream timeout/network failure

Route references:

- `src/app/api/wizard/chat/route.ts`
- `src/components/wizard/AIChatSidebar.tsx`

## Persona Matrix

| Area | Free lane | Pro lane | Synthetic lane |
| --- | --- | --- | --- |
| Magic-link login | Verify redirect to requested page and stable session reuse | Verify redirect to requested page and stable session reuse | Optional |
| Dashboard credits | Cap at 2 credits | Unlimited display | Simulate depleted and recovered states |
| Wizard + AI chat | Success path and error surface | Success path with premium subscription context | Optional provider smoke |
| CV generation | Deducts credit and saves resume/PDF | Saves without meaningful credit depletion | Simulate exhausted credits and recovery |
| Cover letter | Deducts credit | Works as expected | Exhausted-credit `402` if needed |
| Presentation | Deducts credit | Works as expected | Exhausted-credit `402` if needed |
| LinkedIn import | `403` gate | Full happy path | Optional |
| Job scrape | `403` gate | Full happy path | Optional |
| Search jobs | `403` gate | Full happy path | Optional |
| Search companies | `403` gate | Full happy path | Optional |
| Pricing | Can initialize checkout and return safely on cancel | Shows current plan | Optional |
| Settings / billing | Falls back safely when no portal | Opens portal or safe redirect | Optional |
| Share analytics | Public share link increments views | Same | Expiry simulation if needed |

## Stripe-Safe Validation

- Never complete a new live payment by default.
- `free lane`:
  - click `Get Pro Yearly`
  - verify checkout session creation and redirect to hosted Stripe checkout
  - verify cancel returns to `/pricing?canceled=true`
  - note whether a `stripe_customer_id` is created in `profiles`
- `pro lane`:
  - verify pricing marks the plan as current
  - verify `Settings > Manage Subscription` opens Stripe Billing Portal or returns a safe redirect
- Use `synthetic lane` only for entitlement edge states that cannot be observed from existing live subscriptions.

## Synthetic Profile State Workflow

Use the helper script with the production service-role credentials already configured in the environment. Always snapshot before mutating.

```bash
npm run qa:profile-state -- snapshot --email free-test@example.com --out output/qa/free.snapshot.json
npm run qa:profile-state -- apply --snapshot output/qa/free.snapshot.json --tier free --total-credits 0 --daily-credits 0 --confirm-write
npm run qa:profile-state -- restore --snapshot output/qa/free.snapshot.json --confirm-write
```

Supported mutation flags:

- `--tier free|pro`
- `--total-credits <number>`
- `--daily-credits <number>`
- `--last-credit-reset <ISO timestamp>`
- `--stripe-status <status>`

Do not change `stripe_customer_id` or `stripe_subscription_id` manually unless the test explicitly requires restore from a trusted snapshot.

## Acceptance Checklist

- AI chat succeeds in both free and Pro lanes, or a precise failure class is documented from logs.
- Free lane enforces credit cap, premium gating, and safe checkout redirect.
- Pro lane exposes premium tools, unlimited usage display, and safe billing management.
- Any synthetic changes are restored from snapshot before the test run is closed.
