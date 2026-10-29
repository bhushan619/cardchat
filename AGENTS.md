# Project architecture

- Keep App Messages and WhatsApp conversation-list controls in the shared AdminMessages screen so channel behavior stays consistent.
- Store prototype conversation read state and favorites in sessionStorage; read-state updates use the pure conversationReadState helper for testable channel scoping.
- Reuse the shared notification campaign store for admin authoring and the customer inbox; keep inbox reads/preferences session-scoped and interpret scheduled wall-clock times as UTC+4 to avoid browser-timezone drift.
- Keep notification audience tags as definition IDs distinct from legacy alias audiences; automatic activation is not delivery, and prototype analytics must not imply live event attribution.
- Put ledger filter matching in pure helpers under src/lib (e.g. accountNumberMatches) rather than inline in pages, so each rule has a unit test next to the existing tests.
- Withdrawal filters stage input separately from applied values and match linked orders by customer alias; this keeps Search/Clear consistent with Transfers without inventing unrelated order links.
- Keep gateway health and warmup policy on the dedicated WA Gateway Config page; general Settings uses session-scoped helpers for the staff-ID selector and customer introduction message so configuration survives navigation without changing live routing or delivery.