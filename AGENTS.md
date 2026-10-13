# Project architecture

- Keep App Messages and WhatsApp conversation-list controls in the shared AdminMessages screen so channel behavior stays consistent.
- Store prototype conversation read state and favorites in sessionStorage; read-state updates use the pure conversationReadState helper for testable channel scoping.