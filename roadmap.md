# Roadmap — Proactive Features PRD v1.0

## Feature 1: Quick Reply Templates (QR-01/02/03)
- [ ] `src/lib/quickReplies.ts` — template store (localStorage), seed templates, variable resolution, usage tracking
- [ ] `src/pages/admin/AdminQuickReplies.tsx` — management table (CRUD, category filter, search) + Analytics tab
- [ ] Chat integration in AdminMessages.tsx — ⚡ sidebar panel + `/` slash command (both App Messages & WhatsApp)

## Feature 2: Auto Rate Quotation (AQ-01/02/03)
- [ ] `src/lib/rateQuote.ts` — card/amount detection from customer messages, quote store with 15-min rate lock
- [ ] Quote card UI in AdminMessages.tsx (teal card below detected message, editable amount, Send Quote)
- [ ] "Accept" reply → pre-fill OrderWizardModal with locked rate

## Feature 3: Inactivity Follow-Up (IF-01/02/03/04)
- [ ] `src/lib/inactivity.ts` — settings store + stats store
- [ ] `src/pages/admin/AdminSettings.tsx` — Inactivity Follow-Up config card + View Stats
- [ ] Indicators in AdminMessages.tsx — amber clock in list, header badge, auto-reminder message, per-conversation pause

## Feature 4: Customer Trading Analytics (TA-01/02/03/04)
- [ ] `src/data/tradingAnalyticsMock.ts` — seeded mock dataset
- [ ] `src/pages/admin/AdminTradingAnalytics.tsx` — Overview / Peak Hours / Customers / Card Types tabs

## Wiring & Verification
- [ ] Routes in App.tsx + menu items in AdminLayout.tsx
- [ ] Build check + browser verification
- [ ] Update master PRD (public/CardChat_PRD.md)
