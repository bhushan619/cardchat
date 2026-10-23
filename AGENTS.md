# Project architecture

- Keep App Messages and WhatsApp conversation-list controls in the shared AdminMessages screen so channel behavior stays consistent.
- Store prototype conversation read state and favorites in sessionStorage; read-state updates use the pure conversationReadState helper for testable channel scoping.
- Reuse the shared notification campaign store for admin authoring and the customer inbox; keep inbox reads/preferences session-scoped and interpret scheduled wall-clock times as UTC+4 to avoid browser-timezone drift.
- Keep notification audience tags as definition IDs distinct from legacy alias audiences; automatic activation is not delivery, and prototype analytics must not imply live event attribution.