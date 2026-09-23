# Conversation remarks and tags

## What will change
- Add the screenshot-style customer tags to conversation rows and the selected chat header on both App Messages and WhatsApp.
- Add a right-click conversation menu with **Add remark** and **Add tags** actions.
- Add matching remark and tag dialogs, including selection state, character count, Save/Cancel actions, and clear-on-empty behavior.
- Show saved remarks beneath the selected customer header and keep changes available while using the prototype.

## Technical details
- Implement the shared behavior in the common messages screen so both channels stay consistent.
- Persist per-customer remarks and tags in browser storage.
- Use the existing semantic theme colors and shared dialog/button controls; no message, order, or transfer logic changes.
- Verify both `/admin` and `/admin/whatsapp` visually and check the latest build status.
