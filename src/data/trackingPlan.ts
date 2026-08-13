export type Priority = "P0" | "P1" | "P2" | "P3";

export interface TrackedEvent {
  name: string;
  trigger: string;
  properties: string;
  where: string;
  priority: Priority;
}

export interface TrackingCategory {
  id: string;
  name: string;
  events: TrackedEvent[];
}

export const trackingPlan: TrackingCategory[] = [
  {
    id: "auth",
    name: "Authentication & Onboarding",
    events: [
      { name: "auth_register_started", trigger: "User opens registration screen", properties: "—", where: "RegisterScreen.initState()", priority: "P0" },
      { name: "auth_register_completed", trigger: "Registration successful", properties: "method: email", where: "AuthService.register() success callback", priority: "P0" },
      { name: "auth_register_failed", trigger: "Registration error", properties: "error: string", where: "AuthService.register() catch block", priority: "P0" },
      { name: "auth_login_started", trigger: "User taps Login button", properties: "—", where: "LoginScreen._onLoginTapped()", priority: "P0" },
      { name: "auth_login_success", trigger: "Login successful", properties: "method: email", where: "AuthService.login() success callback", priority: "P0" },
      { name: "auth_login_failed", trigger: "Login error", properties: "error: string", where: "AuthService.login() catch block", priority: "P0" },
      { name: "auth_logout", trigger: "User logs out", properties: "—", where: "AuthService.logout()", priority: "P0" },
      { name: "auth_forgot_password_tapped", trigger: "Taps forgot password link", properties: "—", where: "LoginScreen onTap handler", priority: "P1" },
      { name: "auth_password_reset_requested", trigger: "Submits password reset", properties: "—", where: "ForgotPasswordScreen._onSubmit()", priority: "P1" },
      { name: "auth_terms_viewed", trigger: "Taps Terms of Use link", properties: "—", where: "RegisterScreen onTap handler", priority: "P1" },
      { name: "auth_privacy_viewed", trigger: "Taps Privacy Policy link", properties: "—", where: "RegisterScreen onTap handler", priority: "P1" },
    ],
  },
  {
    id: "lifecycle",
    name: "App Lifecycle & Version",
    events: [
      { name: "app_opened", trigger: "App launched (cold start)", properties: "version, build, platform, os_version", where: "main.dart → WidgetsBindingObserver or app entry", priority: "P0" },
      { name: "app_resumed", trigger: "App returns from background", properties: "background_duration_sec", where: "didChangeAppLifecycleState(resumed)", priority: "P1" },
      { name: "app_backgrounded", trigger: "App goes to background", properties: "—", where: "didChangeAppLifecycleState(paused)", priority: "P1" },
      { name: "update_check_completed", trigger: "Version check API returned", properties: "update_type: mandatory/optional/none, latest_version, current_version", where: "VersionService.checkVersion() after API response", priority: "P0" },
      { name: "update_prompt_shown", trigger: "Update dialog displayed", properties: "update_type, version", where: "ForceUpdateScreen.initState() / OptionalUpdateDialog.build()", priority: "P0" },
      { name: "update_prompt_accepted", trigger: "User tapped Update Now", properties: "update_type, version, source: play_store/apk", where: "Update button onTap handler", priority: "P0" },
      { name: "update_prompt_dismissed", trigger: "User tapped Later (optional)", properties: "version, dismiss_count", where: "Later button onTap handler", priority: "P0" },
      { name: "update_apk_download_started", trigger: "APK download began", properties: "version, file_size_mb", where: "OtaUpdate.execute() start", priority: "P1" },
      { name: "update_apk_download_completed", trigger: "APK download finished", properties: "version, duration_sec", where: "OtaUpdate INSTALLING status", priority: "P1" },
      { name: "update_apk_install_triggered", trigger: "PackageInstaller launched", properties: "version", where: "OtaUpdate INSTALLING callback", priority: "P1" },
      { name: "maintenance_screen_shown", trigger: "Maintenance screen displayed", properties: "message, end_time", where: "MaintenanceScreen.initState()", priority: "P0" },
      { name: "maintenance_retry_tapped", trigger: "User tapped Try Again", properties: "—", where: "Try Again button onTap", priority: "P1" },
    ],
  },
  {
    id: "navigation",
    name: "Navigation & Screen Views",
    events: [
      { name: "screen_viewed", trigger: "Any screen becomes visible", properties: "screen_name: home/chat/contacts/me/rewards/ranking/wallet/settings/rates", where: "RouteObserver.didPush() or each screen's initState()", priority: "P1" },
      { name: "tab_switched", trigger: "Bottom nav tab tapped", properties: "from_tab, to_tab", where: "BottomNavigationBar.onTap", priority: "P1" },
      { name: "deep_link_opened", trigger: "App opened via deep link", properties: "url, source", where: "Deep link handler in app.dart", priority: "P2" },
    ],
  },
  {
    id: "home",
    name: "Home Screen",
    events: [
      { name: "home_sell_cards_tapped", trigger: "Taps Sell Cards button", properties: "—", where: "Sell Cards button onTap", priority: "P1" },
      { name: "home_calculator_tapped", trigger: "Taps Calculator button", properties: "—", where: "Calculator button onTap", priority: "P1" },
      { name: "home_wallet_card_tapped", trigger: "Taps wallet balance card", properties: "—", where: "Wallet card GestureDetector onTap", priority: "P1" },
      { name: "home_withdraw_tapped", trigger: "Taps Withdraw button on wallet card", properties: "—", where: "Withdraw button onTap", priority: "P1" },
      { name: "home_rate_card_tapped", trigger: "Taps a card rate row", properties: "card_type, card_format", where: "Rate card ListTile onTap", priority: "P1" },
      { name: "home_rate_card_viewed", trigger: "Rate card visible on screen (impression)", properties: "card_type, card_format, rate", where: "VisibilityDetector on each rate card widget", priority: "P3" },
      { name: "home_rates_refreshed", trigger: "Rate list auto-refreshed or pull-to-refresh", properties: "card_count", where: "RefreshIndicator onRefresh or auto-refresh timer", priority: "P2" },
    ],
  },
  {
    id: "rates",
    name: "Card Rates & Calculator",
    events: [
      { name: "rates_filter_applied", trigger: "User filters rate list", properties: "filter_type: format/currency, value", where: "Filter dropdown onChange", priority: "P2" },
      { name: "rates_search_used", trigger: "User searches card rates", properties: "query", where: "Search TextField onChanged (debounced 500ms)", priority: "P2" },
      { name: "calculator_opened", trigger: "Opens rate calculator", properties: "from_screen", where: "Calculator screen initState or navigation push", priority: "P1" },
      { name: "calculator_calculated", trigger: "Completes a calculation", properties: "card_type, amount, result_naira", where: "Calculate button onTap after result computed", priority: "P1" },
      { name: "calculator_denomination_selected", trigger: "Picks a denomination", properties: "card_type, denomination", where: "Denomination picker onChange", priority: "P2" },
    ],
  },
  {
    id: "chat",
    name: "Chat & Messaging",
    events: [
      { name: "chat_conversation_opened", trigger: "Opens a conversation", properties: "agent_alias, channel: trtc", where: "ChatScreen.initState()", priority: "P0" },
      { name: "chat_message_sent", trigger: "Customer sends a text message", properties: "message_length, conversation_id", where: "TrtcService.sendMessage() success callback", priority: "P0" },
      { name: "chat_image_sent", trigger: "Customer sends an image (card photo)", properties: "file_size_kb, conversation_id", where: "Image picker → send flow success callback", priority: "P0" },
      { name: "chat_document_sent", trigger: "Customer sends a document", properties: "file_type, file_size_kb", where: "Document picker → send flow success callback", priority: "P1" },
      { name: "chat_message_received", trigger: "Customer receives agent message", properties: "conversation_id", where: "TRTC message listener callback", priority: "P1" },
      { name: "chat_image_viewed", trigger: "Customer taps to view full image", properties: "conversation_id", where: "Image preview onTap", priority: "P2" },
      { name: "chat_notification_tapped", trigger: "Customer opens app from chat notification", properties: "conversation_id", where: "Push notification handler → navigation", priority: "P1" },
      { name: "chat_agent_selected", trigger: "Customer picks an agent from contacts", properties: "agent_alias", where: "Contacts list item onTap", priority: "P1" },
      { name: "chat_new_conversation_started", trigger: "Customer starts a new conversation", properties: "agent_alias", where: "First message sent in new conversation check", priority: "P0" },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    events: [
      { name: "order_card_viewed", trigger: "Customer views order card in chat", properties: "order_id, status", where: "Order card widget build (with dedup)", priority: "P1" },
      { name: "order_details_opened", trigger: "Customer taps View Details on order", properties: "order_id, status, card_type, amount", where: "View Details button onTap", priority: "P1" },
      { name: "order_status_changed", trigger: "Order status update received", properties: "order_id, old_status, new_status", where: "Order status listener/callback", priority: "P0" },
      { name: "order_completed", trigger: "Order reaches Success status", properties: "order_id, card_type, amount, payout_naira", where: "Status listener when new_status == success", priority: "P0" },
    ],
  },
  {
    id: "wallet",
    name: "Wallet & Withdrawals",
    events: [
      { name: "wallet_viewed", trigger: "Opens wallet screen", properties: "balance", where: "WalletScreen.initState()", priority: "P1" },
      { name: "wallet_balance_revealed", trigger: "Taps to show/hide balance", properties: "action: show/hide", where: "Balance visibility toggle onTap", priority: "P2" },
      { name: "wallet_transaction_viewed", trigger: "Taps a transaction row", properties: "transaction_id, type: credit/debit", where: "Transaction ListTile onTap", priority: "P2" },
      { name: "withdrawal_started", trigger: "Taps Withdraw button", properties: "balance", where: "Withdraw button onTap", priority: "P0" },
      { name: "withdrawal_bank_selected", trigger: "Selects bank account", properties: "bank_name", where: "Bank selector onChange", priority: "P0" },
      { name: "withdrawal_amount_entered", trigger: "Enters withdrawal amount", properties: "amount", where: "Amount field onSubmitted or Continue button", priority: "P0" },
      { name: "withdrawal_submitted", trigger: "Confirms withdrawal request", properties: "amount, bank_name", where: "Confirm withdrawal button onTap → API success", priority: "P0" },
      { name: "withdrawal_success", trigger: "Withdrawal completed (PalmPay callback)", properties: "amount, bank_name, duration_sec", where: "Withdrawal status listener when status == completed", priority: "P0" },
      { name: "withdrawal_failed", trigger: "Withdrawal failed", properties: "amount, error", where: "Withdrawal status listener when status == failed", priority: "P0" },
    ],
  },
  {
    id: "bank",
    name: "Bank Accounts (Beneficiaries)",
    events: [
      { name: "bank_account_add_started", trigger: "Opens add bank account form", properties: "—", where: "Add Bank Account button onTap", priority: "P2" },
      { name: "bank_account_verified", trigger: "Account verification successful", properties: "bank_name", where: "Verify button → API success callback", priority: "P2" },
      { name: "bank_account_verification_failed", trigger: "Verification failed", properties: "bank_name, error", where: "Verify button → API error callback", priority: "P2" },
      { name: "bank_account_added", trigger: "New bank account saved", properties: "bank_name", where: "Save bank account → API success", priority: "P2" },
      { name: "bank_account_deleted", trigger: "Bank account removed", properties: "bank_name", where: "Delete confirmation → API success", priority: "P2" },
    ],
  },
  {
    id: "rewards",
    name: "Rewards & Referral",
    events: [
      { name: "rewards_viewed", trigger: "Opens Rewards screen", properties: "total_rewards, referral_count", where: "RewardsScreen.initState()", priority: "P1" },
      { name: "rewards_history_scrolled", trigger: "Scrolls through rewards list", properties: "items_viewed", where: "ScrollController listener (fire once per session)", priority: "P3" },
      { name: "referral_code_copied", trigger: "Taps Copy on referral code", properties: "code", where: "Copy button onTap", priority: "P1" },
      { name: "referral_code_shared", trigger: "Taps Share on referral code", properties: "code, share_method", where: "Share button onTap → share sheet", priority: "P1" },
      { name: "invite_code_entered", trigger: "Enters an invite code", properties: "code", where: "Submit button onTap (before validation)", priority: "P0" },
      { name: "invite_code_accepted", trigger: "Invite code validated successfully", properties: "code, referrer_alias", where: "Invite code API success callback", priority: "P0" },
      { name: "invite_code_rejected", trigger: "Invite code rejected", properties: "code, reason: invalid/expired/self/already_used", where: "Invite code API error callback", priority: "P0" },
      { name: "referral_reward_received", trigger: "Pts 500 credited for referral", properties: "invitee_alias", where: "Reward notification listener or wallet credit event", priority: "P0" },
      { name: "rewards_how_it_works_opened", trigger: "Taps Info icon → How It Works modal", properties: "—", where: "Info icon onTap", priority: "P2" },
    ],
  },
  {
    id: "ranking",
    name: "Ranking",
    events: [
      { name: "ranking_viewed", trigger: "Opens Ranking screen", properties: "current_rank, current_tier, volume", where: "RankingScreen.initState()", priority: "P1" },
      { name: "ranking_rules_opened", trigger: "Taps Rules button", properties: "—", where: "Rules button onTap", priority: "P2" },
      { name: "ranking_increase_volume_tapped", trigger: 'Taps "Increase Trading Volume" CTA', properties: "—", where: "CTA button onTap", priority: "P1" },
      { name: "ranking_leaderboard_scrolled", trigger: "Scrolls leaderboard", properties: "items_viewed", where: "ScrollController listener (fire once per session)", priority: "P3" },
      { name: "ranking_tier_changed", trigger: "Customer moves to new tier", properties: "old_tier, new_tier, volume", where: "Ranking data refresh → compare with cached tier", priority: "P1" },
    ],
  },
  {
    id: "safety",
    name: "Content Safety (Report & Block)",
    events: [
      { name: "report_flag_tapped", trigger: "Taps flag icon on agent message", properties: "message_id, agent_alias", where: "Flag icon onTap", priority: "P1" },
      { name: "report_reason_selected", trigger: "Selects a report reason", properties: "reason", where: "Radio button onChange in report modal", priority: "P1" },
      { name: "report_submitted", trigger: "Submits content report", properties: "reason, has_details: bool, also_blocked: bool", where: "Submit Report button → API success", priority: "P0" },
      { name: "report_cancelled", trigger: "Closes report modal without submitting", properties: "—", where: "Cancel button or modal dismiss onTap", priority: "P2" },
      { name: "agent_blocked", trigger: "Blocks an agent", properties: "agent_alias, from: report_modal/chat_menu", where: "Block confirm → API success", priority: "P0" },
      { name: "agent_unblocked", trigger: "Unblocks from Settings", properties: "agent_alias", where: "Unblock confirm → API success", priority: "P1" },
      { name: "blocked_agents_viewed", trigger: "Opens Blocked Agents in Settings", properties: "count", where: "Blocked Agents screen initState()", priority: "P2" },
    ],
  },
  {
    id: "settings",
    name: "Settings & Profile",
    events: [
      { name: "settings_opened", trigger: "Opens Settings screen", properties: "—", where: "SettingsScreen.initState()", priority: "P2" },
      { name: "settings_language_changed", trigger: "Changes app language", properties: "from, to", where: "Language picker onChange", priority: "P2" },
      { name: "settings_notification_toggled", trigger: "Toggles push notifications", properties: "enabled: bool", where: "Notification toggle onChange", priority: "P2" },
      { name: "settings_dark_mode_toggled", trigger: "Toggles dark mode", properties: "enabled: bool", where: "Dark mode toggle onChange", priority: "P2" },
      { name: "profile_viewed", trigger: "Opens profile screen", properties: "—", where: "ProfileScreen.initState()", priority: "P2" },
      { name: "profile_updated", trigger: "Updates profile info", properties: "fields_changed: [name, email, phone]", where: "Save profile button → API success", priority: "P2" },
    ],
  },
  {
    id: "errors",
    name: "Errors & Performance",
    events: [
      { name: "error_api_failed", trigger: "Any API call returns error", properties: "endpoint, status_code, error_message", where: "API service interceptor (Dio interceptor or http wrapper)", priority: "P0" },
      { name: "error_network_timeout", trigger: "API call timed out", properties: "endpoint, timeout_sec", where: "API service timeout handler", priority: "P0" },
      { name: "error_crash", trigger: "Unhandled exception caught", properties: "error_type, stack_trace_hash", where: "FlutterError.onError + PlatformDispatcher.onError in main.dart", priority: "P0" },
      { name: "performance_screen_load", trigger: "Screen finishes rendering", properties: "screen_name, load_time_ms", where: "WidgetsBinding.addPostFrameCallback in each screen", priority: "P3" },
      { name: "performance_api_latency", trigger: "API call round-trip time", properties: "endpoint, latency_ms", where: "API service interceptor (measure start→end)", priority: "P3" },
      { name: "performance_trtc_connection", trigger: "TRTC connection state change", properties: "state: connected/disconnected/reconnecting, duration_ms", where: "TRTC SDK event listener", priority: "P1" },
    ],
  },
  {
    id: "push",
    name: "Push Notifications",
    events: [
      { name: "notification_received", trigger: "Push notification arrives", properties: "type: chat/order/reward/system", where: "Firebase Messaging onMessage / onBackgroundMessage", priority: "P1" },
      { name: "notification_tapped", trigger: "User taps notification", properties: "type, destination_screen", where: "Firebase Messaging onMessageOpenedApp", priority: "P1" },
      { name: "notification_permission_granted", trigger: "User grants notification permission", properties: "—", where: "Permission request callback (granted)", priority: "P0" },
      { name: "notification_permission_denied", trigger: "User denies notification permission", properties: "—", where: "Permission request callback (denied)", priority: "P0" },
    ],
  },
];

export const commonProperties: { property: string; source: string; example: string }[] = [
  { property: "user_id", source: "Customer alias (anonymized)", example: "A7X3KP" },
  { property: "session_id", source: "Generated on app open", example: "uuid" },
  { property: "timestamp", source: "System clock", example: "ISO 8601" },
  { property: "app_version", source: "package_info_plus", example: "1.2.0" },
  { property: "build_number", source: "package_info_plus", example: "15" },
  { property: "platform", source: "Platform.isAndroid/iOS", example: "android" },
  { property: "device_model", source: "device_info_plus", example: "Samsung Galaxy S23" },
  { property: "os_version", source: "device_info_plus", example: "Android 14" },
  { property: "install_source", source: "PackageManager", example: "play_store / sideloaded" },
];

export const trackingNamingConvention =
  "category_action_detail — all snake_case, lowercase. Example: auth_login_success, order_create_started, chat_message_sent";
