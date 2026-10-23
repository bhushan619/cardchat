# Notification UI — Audit and Proposed Updates

No app changes have been made. This list is based on the current source, the supplied checklist, and a preview check of the admin campaign list and phone-sized Home screen.

## 1. Mobile updates
- Add an interactive notification bell to Home with an unread-count badge. The existing bell in the permission banner is not an inbox button.
- Add a mobile notification panel/list opened by the bell.
- Show a campaign icon, message content, time ago, and a blue unread dot on each notification.
- Update the unread count when notifications are opened and preserve read state during the prototype session.
- Rename the existing Promotions setting to **Promotions & Campaigns**, preserve its selection, and connect it to promotional notification visibility. Keep order/security notifications separate.
- Add notification image previews, including an enlarged view when tapped. This is an additional requested improvement.

**Current findings:** Home has no notification inbox, unread badge, or campaign rows. A Promotions toggle already exists, but its value is temporary and not connected to campaign notifications.

## 2. Admin audience updates
- Replace the alias textarea under **Audience User Label** with a customer-tag multi-select dropdown.
- Use the existing Customer Tags definitions and show their configured colors in the options and selected tags.
- Preserve selected tags when editing or copying a campaign; do not silently treat existing alias audiences as tag audiences.

**Current finding:** The reported audience gap is confirmed in the source. Customer-tag management already exists and will be reused.

## 3. Admin campaign-form updates
- Add **Manual / Automatic** radio buttons; Notification Type is currently fixed to Automatic.
- Show **Trigger Scenario** only for Automatic campaigns and add configurable day inputs for applicable daily rules.
- Show **Send Now / Schedule** for Manual campaigns; retain the date/time input with a clearly displayed **UTC+4** label for scheduling and make its interpretation consistent.
- Add **Save as Draft** and type-appropriate **Send Now / Schedule / Activate** actions instead of a generic confirmation action.
- Add optional conversion-goal selection for Manual campaigns.
- When **External** is selected, show an image-upload section.
- Add uploaded-image thumbnails, enlarged previews, and replacement/removal controls. These preview/edit controls are additional requested improvements.

**Already present — retain and verify:** Trigger Scenario options, immediate/scheduled selection, a UTC+4 date/time label, Action After Tap options with a conditional Path Parameters field, Android/iOS selection, and start/end version fields. These need integration with the new campaign types, not duplicate controls.

## 4. Admin campaign-list and analytics updates
- Add **Conversion Count** and **Conversion Rate** columns.
- Add a campaign detail/analytics panel showing audience, delivery and click metrics, conversion results, and a journey funnel.
- Represent draft and activated campaigns clearly in the list and relevant filters.
- Preserve the existing search/status/message-type filters, Add/Edit/Copy/End toolbar actions, and pagination; verify them with the added campaign states.

**Current findings:** Filters, toolbar actions, pagination, recipients, delivered counts, and click rate already exist. Conversion columns, conversion goals, and a campaign analytics/detail panel are missing.

## 5. Verification and documentation
- Check all conditional Add/Edit/Copy states, tag selections, image controls, draft actions, and schedule behavior.
- Verify the Home bell → notification list → read notification → updated unread badge flow on a phone-sized screen.
- Verify notification settings, image previews, and admin analytics layouts without clipped content.
- Add focused tests for unread-state changes, campaign-type rules, timezone handling, and conversion calculations.
- Update the PRD to distinguish the implemented screens from production delivery requirements. The current in-project PRD does not describe every item in the supplied checklist.

## Technical scope and limitations
- Keep this work in the existing frontend prototype; reuse Customer Tags and the campaign store rather than adding a second campaign system.
- Use session-scoped prototype state for customer inbox reads and preferences. Do not change messaging or order processing.
- Demonstrate delivery/conversion metrics and journey results with clearly identified sample data. Actual notification sending, automatic daily execution, Firebase attribution, cross-device persistence, and production uploads are separate integration work and are not established by UI controls.
