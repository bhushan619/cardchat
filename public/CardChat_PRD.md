# CardChat — Product Requirements Document (PRD)

**Version:** 4.9  
**Date:** April 21, 2026
**Status:** Interactive Prototype (Frontend Only — Mock Data)  
**Platform:** React 18 + Vite + Tailwind CSS + TypeScript  
**Live Preview:** https://cardchat.lovable.app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Landing Page](#3-landing-page)
4. [Customer App](#4-customer-app)
5. [Admin Panel](#5-admin-panel)
6. [Order State Machine](#6-order-state-machine)
7. [Data Models](#7-data-models)
8. [Design System](#8-design-system)
9. [File Structure](#9-file-structure)
10. [Known Limitations](#10-known-limitations)
11. [Future Considerations](#11-future-considerations)
12. [Full Changelog](#12-full-changelog)

---

## 1. Executive Summary

CardChat is a real-time gift card trading platform comprising two interfaces:

- **Customer App** — A mobile-first, dark-themed interface where customers sell gift cards to agents, track order statuses, and receive bank payouts.
- **Admin Panel** — A desktop-first interface where agents, team leads, and super admins manage conversations, create/verify orders, process payments, and administer platform settings.

The current build is a **fully interactive frontend prototype** using mock data. No backend, database, or real API calls are connected. All state is ephemeral (component-level) or persisted via `localStorage`/`sessionStorage` for demo purposes.

### Core Business Flow
1. Customer signs up via splash → onboarding → email OTP → alias assignment
2. Customer initiates a chat with an agent to sell gift cards
3. Agent creates an order (via Order Wizard or Cardlight Sales Order tool)
4. Agent verifies cards against simulated API
5. Agent initiates bank transfer to customer's verified account
6. Customer receives real-time status updates and transfer proof

---

## 2. Architecture Overview

### 2.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 with TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 with semantic HSL design tokens |
| UI Components | shadcn/ui (Radix primitives + Tailwind) |
| Routing | React Router DOM v6 |
| State Management | React Context (`AdminRoleContext`, `ThemeContext`), component-level `useState` |
| Data | Static mock data (`src/data/mock.ts`) — no backend |
| Charts | Recharts (installed, used in customer dashboard) |
| Animations | CSS keyframes (`scale-in`, `fade-in`, `slide-up`, `rate-flash`) |
| Fonts | Space Grotesk (headings), Inter (body) |

### 2.2 Application Routes

```
/                          → Landing page (app selector)

# Customer App
/customer/auth             → Splash → Onboarding → Auth flow
/customer                  → Home screen
/customer/chat             → Chat list → Chat view
/customer/contacts         → Agent directory
/customer/me               → Profile, bank accounts, transactions, dashboard, settings
/customer/rewards          → Rewards overview, referral, history
/customer/ranking          → Trading volume ranking
/customer/guide            → User guide (accordion)

# Admin Panel
/admin/login               → Admin login
/admin                     → Messages (3-column + chat + sidebar)
/admin/chat/:id            → Dedicated chat view (fallback route)
/admin/customers           → Customer management table
/admin/card-rates          → Card rates table
/admin/orders              → Orders table
/admin/naira-rate          → Naira rate management
/admin/users               → User management
/admin/team                → Team dashboard
/admin/team-chat           → Internal team chat (DMs + channels)
/admin/ip-restrictions     → IP & country restrictions
/admin/sensitive-words     → Sensitive words filter
/admin/api-config          → API configuration
/admin/ranking             → Trading volume ranking (all roles)
/admin/rewards             → Rewards management (all roles)
/admin/wallets             → Platform wallet (deposits, disbursements)
/admin/broadcast           → SMS broadcast
/admin/customer-guide      → Customer guide reference (for agents)
/admin/guide               → Admin user guide
/admin/profile             → Admin profile settings
/admin/screens             → Admin screens gallery (interactive preview)
```

### 2.3 Theming

The app supports **light and dark modes** via a `ThemeProvider` context. The theme preference is stored in `localStorage` under key `cardchat-theme`. Default theme is **dark**.

- **Customer App**: Defaults to dark luxury theme. Toggle available in the Me tab.
- **Admin Panel**: Toggle available in the top bar (sun/moon icon).
- Theme switch applies the `.dark` or `.light` class to `<html>` and updates all CSS custom properties defined in `index.css`.

---

## 3. Landing Page (`/`)

**Component:** `src/pages/Index.tsx`

A minimal centered selector serving as the entry point to both interfaces:

- CardChat "CC" logo on accent background (`rounded-2xl`, 80×80)
- App title "CardChat" with tagline "Gift card trading platform — interactive UI prototype"
- Two CTA buttons (stacked on mobile, side-by-side on desktop):
  - **Customer App** (accent fill, Smartphone icon) → `/customer/auth`
  - **Admin Panel** (outline, Monitor icon) → `/admin/login`
- Footer note: "All screens use mock data · No backend connected"

---

## 4. Customer App

**Layout Component:** `src/components/customer/CustomerLayout.tsx`

All customer pages (except Auth) are wrapped in `CustomerLayout`, which provides:
- A scrollable content area
- A **bottom tab bar** with 4 tabs: Home, Chat, Contacts, Me
- A **Beginner's Guide overlay** (shown on first visit, persisted via `localStorage`)

Mobile-first design: `max-w-md mx-auto`, centered with `border-x`.

### 4.1 Authentication Flow (`/customer/auth`)

**Component:** `src/pages/customer/CustomerAuth.tsx`

A 3-phase flow managed by component state:

#### Phase 1: Splash Screen
**Component:** `src/components/customer/SplashScreen.tsx`

- **5-second animated introduction** that auto-plays on app open
- Displays the CardChat business avatar ("LC" logo)
- Highlights four trust pillars with staggered fade-in animations:
  - **Safety** — End-to-end encryption
  - **Speed** — Average payout under 5 minutes
  - **Service** — 24/7 verified agent support
  - **Volume** — 200K+ orders, $50M+ traded
- Stats row: "200K+ Orders", "$50M+ Traded", "4.9★ Rating", "< 5 Min Payout"
- Auto-transitions to Phase 2 after animation completes

#### Phase 2: Onboarding Slides
**Component:** `src/components/customer/OnboardingSlides.tsx`

- **4 swipeable introduction pages** shown before registration
- Each slide has a distinctive icon, title, and description:
  1. **Bank-Grade Security** — end-to-end encryption, verified agents, audited transactions
  2. **Lightning-Fast Settlements** — average payout under 5 minutes, real-time tracking
  3. **Dedicated Support** — 24/7 live chat with verified agents, no bots
  4. **$50M+ Traded** — trusted since 2019, 200K+ successful transactions
- Progress dots indicate current slide position
- "Skip" button available on every slide
- "Next" to advance; "Get Started" on final slide
- Transitions to Phase 3 on completion

#### Phase 3: Authentication Steps
Five sequential steps managed by `step` state:

**Step 1 — Welcome Screen:**
- CardChat logo with app name and tagline
- "Get Started" button (new users)
- "I already have an account" button (returning users)
- Both navigate to Step 2

**Step 2 — Sign-In Method Selection:**
- Title: "Sign In" with subtitle "Choose your preferred method"
- Three options:
  - **Continue with Apple** (outline button with Apple icon)
  - **Continue with Google** (outline button with Chrome icon)
  - **Email Address** input with "Send OTP" button
- Divider "or" between social and email options
- All methods advance to Step 3 (OTP)

**Step 3 — OTP Verification:**
- Title: "Verify Your Email"
- Subtitle: "Enter the 4-digit code sent to [email]"
- **4 individual digit input fields** (each `w-12 h-12`, centered text, auto-focus next on input)
- "Verify" button (accent green)
- "Resend in 60s" countdown link
- Specification: 5-minute expiry, max 3 attempts (not enforced in prototype)
- Advances to Step 4

**Step 4 — Alias Confirmation (formerly Step 5):**
- Title: "You're all set!"
- System-generated **6-character alphanumeric alias** displayed prominently (e.g., "J4D9KP")
- Monospace font, accent-colored badge
- Usage explanation: "This is your unique trading identity. This alias is used across all support interactions."
- Shield icon for trust reinforcement
- "Continue to Home" button → navigates to `/customer`

> **Note:** The invite code step has been removed from the registration flow. Invite codes are now entered via the **Rewards** screen accessible from the Customer App.


### 4.2 Home Screen (`/customer`)

**Component:** `src/pages/customer/CustomerHome.tsx`

A minimalist, iOS-inspired layout:

#### Header
- CardChat logo avatar ("LC" in accent rounded square with shadow)
- App name "CardChat"
- Tagline: "Your trusted gift card trading platform"

#### Core Actions Grid
- **4-column modular grid** (iOS system app style)
- Each tile: icon in accent-colored container (`bg-accent/10`), label, short description
- Rounded-2xl borders with `border-border/50`, hover accent highlight
- Actions:
  - **Sell Cards** (Gift icon) → navigates to `/customer/contacts`
  - **Rewards** (Star icon) → navigates to `/customer/rewards`
  - **Ranking** (Trophy icon) → navigates to `/customer/ranking`
  - **Calculator** (Calculator icon) → opens rate calculator modal

#### Wallet Section
- Gradient card (`from-accent to-accent/80`) with wallet icon
- **Balance display:** masked by default, toggleable via Eye/EyeOff icon
- **Breakdown:** When visible, shows `(550,000 Trading + 6,200 Rewards)` beneath total
- "View Details" button → navigates to Me tab wallet view

#### Live Rates Section
- Section header: "Live Rates" with "Auto-refresh 60s" indicator
- Shows first 5 card rates from mock data (filtered by search)
- Each rate card shows:
  - Card type name (e.g., "iTunes US")
  - Format badge: "Physical" or "E-Code" (small accent pill)
  - Currency indicator (e.g., "USD")
  - Buy rate per $1 in Naira (e.g., "₦680/$1")
  - Last updated timestamp
- "View all rates →" link when more than 5 rates exist (navigates to full list)

#### Quick Start CTA
- "Ready to trade?" section with accent-styled "Start Trading →" button
- Navigates to `/customer/chat`

### 4.3 Chat (`/customer/chat`)

**Component:** `src/pages/customer/CustomerChat.tsx`

#### Chat List View
- Header: "Chats" title with MessageCircle icon
- Search bar: "Search messages..." with magnifying glass icon
- Conversation list (mock data: 2 chats):
  - Each item shows: avatar circle (first letter), name, last message (truncated), timestamp, unread badge (accent green circle with count)
  - Active order indicator: "📌 Active Order" badge (warning-colored pill)
  - Tap to open chat view

#### Chat View
**Component:** `src/pages/customer/CustomerChatView.tsx`

**Header:**
- Back arrow button
- Agent avatar (accent circle with initial)
- Agent name ("CardChat Support")
- Online status indicator ("Online" in accent text)

**Pinned Order Card:**
- Displayed at top when an order exists
- Shows: Order ID, card details (type, denomination, rate), current status badge
- **5-step progress tracker** with connected dots:
  1. Order Created
  2. Settled
  3. Billing Sent
  4. Transfer Processing
  5. Transfer Complete
- "View Details" button opens order details modal
- "Demo: Next Status →" button for prototype demonstration

**Message Area:**
- Scrollable message list
- Customer messages: right-aligned, accent-tinted bubble (`chat-bubble-self`)
- Agent/system messages: left-aligned, neutral bubble (`chat-bubble-other`)
- Image messages: placeholder rectangle with ImageIcon and "Card Image" label
- Order system messages: centered, accent-bordered card with order details
- Billing system message: centered, accent-bordered with payout amount
- Transfer complete: success-bordered card with transfer details + proof screenshot placeholder

**Order Details Modal:**
- Bottom sheet overlay (slides up from bottom, `animate-slide-up`)
- Sections:
  - **Order ID & Status** — centered card with status badge
  - **Card Details** — Card Type, Denomination, Total Face Value, Rate, Naira Rate
  - **Payout Summary** — Card Value (NGN), Fee (₦0), Total Payout (bold accent)
  - **Bank Transfer** — completion status icon, bank details, amount, reference
  - **Timeline** — vertical timeline with connected dots showing all 5 status steps

**Chat Input:**
- Text input field ("Type a message...")
- **Camera icon** — inline beside input (for card photos)
- **Smile icon** — inline beside input (for emoji)
- **Send button** — accent green circle with Send icon

### 4.4 Contacts (`/customer/contacts`) — Traffic Shunting

**Component:** `src/pages/customer/CustomerContacts.tsx`

**Objective:** Leverage the user's desire for a "fast response" to achieve proactive traffic shunting via visual cues.

- Header: "Agents" title
- Search/filter input: "Filter by agent name..."
- **Status legend** — inline dot + label chips for all three tiers
- Agent list (4 agents), **auto-sorted by availability** (Online → Busy → Saturated):
  - Avatar circle with initial (primary-tinted for available/busy, muted for saturated)
  - **3-Tier Status System** (absolute-positioned dot on avatar + badge):
    - 🟢 **Available** (Green / `bg-success`) — Badge: "Instant Reply", description: "Available now". Encourages users to select these agents first.
    - 🟡 **Busy** (Yellow / `bg-warning`) — Badge: "Potential Delay", description: "May take a moment". Manages user expectations and reduces anxiety/follow-up pestering.
    - ⚫ **Saturated** (Grey / `bg-muted-foreground`) — Badge: "Heavily Occupied", description: "Long wait expected". Row rendered at 60% opacity.
  - Agent name and status description with contextual icon (Zap/Clock/AlertCircle)
  - Clicking an available or busy agent navigates to their **Agent Profile** page (`/customer/agent/:id`)
  - **Clicking a saturated agent triggers a pop-up notice** (without hard-locking the click):

#### Saturated Agent Pop-Up Notice
- **Dialog** with AlertCircle icon and "Agent Heavily Occupied" title
- Informs user that the agent is handling many conversations and response times may be significantly longer
- If available agents exist, suggests trying one of the N available agents marked "Instant Reply"
- **Two actions:**
  - "Try an Available Agent" (primary button, shown only if available agents exist) — closes dialog and scrolls to top
  - "Continue Anyway" (outline button) — proceeds to agent profile despite warning

#### Agent Profile Page
**Component:** `src/pages/customer/AgentProfile.tsx`

- Agent avatar, name, online status
- **"Message" button** — navigates directly to the agent's chat window (passes `chatId` via router state to `/customer/chat`, which auto-opens the chat view instead of showing the chat list)
- Agent details and stats
- Empty state: "No agents match your search"

### 4.5 Profile / Me Tab (`/customer/me`)

**Component:** `src/pages/customer/CustomerMe.tsx`

A multi-section profile page with drill-down sub-views.

#### Main Profile View
- **Profile Card:** Avatar (initials "JD"), full name "John Doe", 6-character alias badge (`J4D9KP` in monospace, accent pill), email with Mail icon, optional **WhatsApp number** (with WhatsApp glyph) when set
- **Edit Profile** — pencil icon opens modal with name/email/**WhatsApp number** editing and OTP verification for email changes. WhatsApp number is optional and lets agents reach the customer via WhatsApp Business Cloud API in addition to in-app chat.
- **Wallet Card** — gradient card showing:
  - Total balance (masked by default, toggleable)
  - **Breakdown:** `(550,000 Trading + 6,200 Rewards)` when visible
  - Withdraw button → opens withdrawal form
  - My Wallet button → navigates to wallet sub-view
- **Menu Items** (each with icon, label, description, chevron):
  - My Orders — order history with status filters
  - Bank Accounts — add/manage verified bank accounts
  - Data Dashboard — "View your stats"
  - Security Settings — "2FA, password"
  - App Settings — "Notifications, language"
  - User Guide — navigates to `/customer/guide`
- **Log Out** — destructive-colored button

#### Bank Accounts Sub-View
- Header with back button: "Verified Bank Accounts"
- List of verified accounts (3 mock):
  - Bank name, masked account number, holder name
  - Green checkmark (verified), trash icon (delete)
- Account limit indicator: "3/5 accounts verified"
- "Add Bank Account" button → expandable form:
  - Bank Name input
  - Account Number input (10-digit)
  - Auto-verification display: "✓ Verified: JOHN ADEBAYO"
  - Cancel / Confirm & Save buttons

#### Transaction Records Sub-View
- Header with back button: "Transaction Records"
- Filter tabs: All, Success, Failed
- Transaction list (4 mock):
  - Status dot (green/red), amount, bank + date, status badge, chevron
  - Tap to open transaction detail view

#### Transaction Detail View
- Status card (success/failed themed)
- Amount, status badge
- **Transaction Info:** ID, Order ID, Date, Amount (with copy icons for IDs)
- **Bank Details:** Bank Account, Transfer Type, Processing Time
- **Timeline:** 3-step vertical timeline (Order placed → Payment initiated → Completed/Failed)
- "Retry Transaction" button for failed transactions

#### Data Dashboard Sub-View
- Time range filter tabs: This Week, This Month, All Time
- Stats grid (2x2):
  - Total Trades: 24
  - Total Value: ₦1.2M
  - Success Rate: 96%
  - Avg. Turnaround: 12 min
- **Monthly Volume Chart:** Bar chart (7 days, Mon-Sun) with accent-colored bars and lighter background bars

### 4.6 User Guide (`/customer/guide`)

**Component:** `src/pages/customer/CustomerGuide.tsx`

- **12 expandable accordion sections** with step-by-step instructions
- Topics:
  1. Getting Started — splash, onboarding, OTP, alias flow (invite code moved to Rewards)
  2. Exploring the Home Screen — modular grid, search, live rates
  3. How to Sell a Gift Card — step-by-step sell flow
  4. Using the Chat — inline image/emoji, message bubbles, order tracking
  5. Finding Available Agents — search, status indicators (green/yellow dots)
  6. Understanding Card Rates — format badges, currency, refresh
  7. Managing Your Profile — alias display, bank accounts, settings
   8. Beginner's Guide — 3-step first-login overlay documentation
   9. Receiving Payments — bank verification, transfer tracking, proof screenshots
   10. Wallet & Withdrawals — withdrawal limits (₦2,000–₦790,000)
   11. Safety & Security Tips — never share passwords, verify agent badges
   12. Staying Updated — rate changes, app notifications
- Each step has optional **Pro Tips** (accent-colored callouts)
- **Expand All / Collapse All** controls
- Accessible from Me tab menu and bottom tab bar

### 4.7 Beginner's Guide Overlay

**Component:** `src/components/customer/BeginnerGuide.tsx`

A **navigation-aware floating tooltip overlay** shown on first login:

- Implemented at **layout level** (in `CustomerLayout.tsx`) to persist across route changes
- **3 steps:**
  1. **Home Tab** — "This is your Home Screen. You can view live rates, start selling cards, and access quick actions."
  2. **Contacts Tab** — "This is the Contacts page. You can browse verified agents and start a conversation."
  3. **Chat Tab** — "This is the Chat page. You can send messages, share card images, and track your orders."
- Each step navigates the user to the corresponding tab automatically
- Progress bar with step indicators
- "Next" button to advance; "Skip" to dismiss
- "Finish" on final step
- Persistence: `localStorage` keys `beginner_guide_done` and `beginner_guide_step`
- Viewport-aware positioning to prevent overflow on mobile devices

### 4.8 Rewards (`/customer/rewards`)

**Component:** `src/pages/customer/CustomerRewards.tsx`

A single-page rewards overview combining earnings summary, referral tools, and history.

#### Total Rewards Card
- Gradient card (`from-accent to-accent/80`) centered
- Total rewards earned (₦6,200) in large 3xl font
- **Breakdown:** Ranking vs Referral earnings side-by-side with divider

#### Referral Code
- User's 6-char alias as referral code with copy button
- Compact card layout

#### Invite Code Input
- Inline input + submit button (hidden after successful submission)
- 7-day submission window note

#### Rewards History
- Chronological list of all earned rewards
- Each entry shows: icon (Trophy for ranking, Gift for referral), description, date, amount
- Color-coded: ranking = accent, referral = warning
- Amount shown in success green with ArrowDownLeft icon

#### How It Works (Info Modal)
- Triggered via Info icon in header bar
- Bottom sheet modal explaining Ranking Rewards, Referral Rewards, and Invite Code rules
- "Got it" dismiss button

### 4.9 Trading Volume Ranking (`/customer/ranking`)

**Component:** `src/pages/customer/CustomerRanking.tsx`

A motivation-first ranking page showing the user's trading volume standing within the current month.

#### Header
- Back arrow to Home, page title "Trading Volume Ranking"
- Period label (e.g., "Mar 01 – Mar 31, 2026")
- "Rules" button (Info icon) → opens Dialog with tier explanations and reset schedule

#### Personal Achievement Card
- Gradient card (`from-accent/10 via-card to-accent/5`) with decorative circle
- **My Rank** — large `#N` display (5xl font)
- **Current Reward** — accent-colored ₦ amount
- **2-column stats grid:**
  - Trading Volume (total volume number)
  - To Next Tier (remaining volume in warning color, or "Max ✓" if at highest tier)

#### Progress & CTA
- Progress bar to next reward tier with percentage
- Motivational text: "Trade X more to unlock ₦Y reward — almost there!" (with Flame icon)
- "Increase Trading Volume" CTA button → navigates to `/customer/contacts`

#### Leaderboard
- Smart display: Top 20 shown if user is within top 20; otherwise Top 10 + separator + 5 rows around user
- Grid columns: Rank, Nickname, Volume, Reward
- Medal icons for top 3 (gold, silver, bronze)
- Current user row highlighted with `bg-accent/10` and left accent border, "Me" badge
- Auto-scrolls to user's row on page load

#### Data Source
- **File:** `src/data/rankingMock.ts`
- 9 reward tiers (10K–1M volume thresholds)
- 25 mock users with pre-assigned ranks, volumes, and rewards
- Helper functions: `getCurrentTier()`, `getNextTier()`

### 4.10 Customer App Navigation

**Bottom Tab Bar** (4 tabs):
| Tab | Icon | Path | Description |
|-----|------|------|-------------|
| Home | Home | `/customer` | Main dashboard |
| Chat | MessageCircle | `/customer/chat` | Conversations |
| Contacts | Users | `/customer/contacts` | Agent directory |
| Me | User | `/customer/me` | Profile & settings |

- Active tab highlighted with accent color
- Tab bar sticks to bottom with `shrink-0`, `z-50`

---

## 5. Admin Panel

### 5.1 Login (`/admin/login`)

**Component:** `src/pages/admin/AdminLogin.tsx`

- Centered card layout on subtle primary-tinted background
- CardChat Admin logo (Shield icon on primary background)
- Email + password form with show/hide toggle
- **Mock credentials displayed** for demo:
  - `admin@cardchat.com` / `admin123` (Super Admin)
  - `lead@cardchat.com` / `lead123` (Team Lead)
  - `agent@cardchat.com` / `agent123` (Agent)
- Simulated 600ms login delay with loading spinner
- Error message: "Invalid email or password. Try the demo credentials below."
- On success: stores auth in `sessionStorage` under key `adminAuth`, navigates to `/admin`

### 5.2 Admin Layout

**Component:** `src/components/admin/AdminLayout.tsx`

A full-height flex layout with:

#### Sidebar (w-60, fixed)
- **Header:** CardChat logo, "Admin Panel" subtitle
- **Navigation:** 16 sidebar items with icons, role-filtered visibility
- **Unread Badges:** Messages and Team Chat nav items display unread count badges (destructive-colored circles), visible even when the item is active
- **Role Switcher:** "View as" section with 4 role buttons (Super Admin, Team Lead, Agent, Finance)
- **User Profile:** Avatar circle (initial), name, role label, logout button

#### Top Bar (h-14, fixed)
- **Global Search:** Input with real-time filtering across customers, orders, and card rates
  - Recent searches displayed when focused with empty query
  - Categorized results: Customers (navigate to chat), Orders (navigate to orders), Card Rates (navigate to card-rates)
  - Empty state with "No results found" message
- **Theme Toggle:** Sun/moon button
- **Notification Bell:** Badge with count (3)
- **Role Indicator:** Shield icon with current role label

#### Search Overlay
- Absolute-positioned overlay below top bar
- Shows recent searches when query is empty
- Categorized search results with item counts
- Each result clickable: customers → chat view, orders → orders page, rates → card rates

### 5.3 Role-Based Access Control (RBAC)

Four roles with hierarchical access:

| Feature | Super Admin | Team Lead | Agent | Finance |
|---------|:-----------:|:---------:|:-----:|:-------:|
| Messages | ✅ | ✅ | ✅ | ❌ |
| Team Chat | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ❌ |
| Card Rates | ✅ | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ✅ | ✅ |
| Volume Ranking | ✅ | ✅ | ✅ | ❌ |
| Rewards | ✅ | ✅ | ✅ | ❌ |
| Platform Wallet | ✅ | ❌ | ❌ | ✅ |
| Customer Guide | ✅ | ✅ | ✅ | ❌ |
| Admin Guide | ✅ | ✅ | ✅ | ❌ |
| Naira Rate | ✅ | ✅ | ❌ | ✅ |
| Team Dashboard | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| IP & Country | ✅ | ❌ | ❌ | ❌ |
| Sensitive Words | ✅ | ❌ | ❌ | ❌ |
| API Config | ✅ | ❌ | ❌ | ❌ |
| SMS Broadcast | ✅ | ❌ | ❌ | ❌ |

- Role stored in React Context (`AdminRoleContext`) — supports 4 roles: `super_admin`, `team_lead`, `agent`, `finance`
- Sidebar items filtered by role — items with `roles` array are only shown if current role is included; items without `roles` are visible to all
- Finance role is restricted: no access to Volume Ranking, Rewards, Messages, Customers, Card Rates, Customer Guide, or Admin Guide
- "View as" switcher is **demo-only** — in production, roles would come from server-side auth

### 5.4 Messages Page (`/admin`)

**Component:** `src/pages/admin/AdminMessages.tsx` (998 lines — the largest page)

A **3-panel layout** combining conversation list, chat, and order sidebar:

#### Left Panel — Conversation Tabs (25% width, 240–336px)
- **2 tab columns:** Consulting (amber gradient) and Trading (emerald gradient). Pending Payment is treated as a sub-status surfaced inline within the Trading column rather than as its own tab.
- Conversations are categorized by their order status via the state machine:
  - No order / `pending_sale` / `pending` / `order_cancelled` / `payment_completed` → Consulting
  - `in_trade` / `pending_payment` / `success` → Trading
- Each conversation card shows:
  - Avatar with a small **channel dot** on the bottom-right corner (emerald = WhatsApp, primary = TRTC in-app)
  - **Channel badge** (icon-only chip) next to the alias indicating the active messaging channel
  - Star toggle (favorites)
  - Alias (6-char code)
  - Last message (truncated)
  - Timestamp
  - Unread count badge
  - Tags: VIP (amber), Repeat (primary), New (accent), Priority (destructive)
  - Good Rate percentage
  - Total Value
- Click to select → loads chat in center panel

#### Center Panel — Chat View
- **Chat Header (48px height, single row):**
  - Avatar with status dot (green = online)
  - Customer alias + **channel icon badge** (WhatsApp glyph or in-app chat bubble) — shows whether the customer is currently messaging via TRTC.io in-app chat or WhatsApp Business Cloud API
  - **TTV / TMTV** stacked in a single column (right-aligned) with info tooltips
  - Order status pills (Success / Order Cancelled / etc.) are **not** shown in the header — status is surfaced in the order sidebar and via system messages instead
  - **Identity toggle** (Eye/EyeOff) — reveals/hides full customer name (Super Admin only)
  - **Escalate button** (Agents icon) — opens popover to add Team Leads/Super Admins to the chat
  - **Reassign control** lives in the **Dedicated Chat View** (`/admin/chat/:id`) header, not in the Messages page header — opens a popover to transfer the chat to another agent (Team Lead/Super Admin only)

- **Escalation / Group Chat:**
  - Clicking escalate shows a popover with available Team Leads and Super Admins
  - Adding a user creates a system message: "{Name} ({Role}) has joined the chat"
  - **Members bar** appears above chat showing all participants with (X) remove buttons
  - Removing a user creates: "{Name} has left the chat"
  - Each participant's messages show their name with unique color coding:
    - Customer → primary color
    - Agent (You) → accent color
    - Group members → orange, emerald, violet (rotating)

- **Message Area:**
  - Customer messages: right-aligned accent bubbles
  - Agent messages: left-aligned neutral bubbles with sender name
  - System messages: centered, muted, smaller text
  - Image messages: placeholder thumbnails
  - **Order status system messages:** Only customer-facing statuses appear:
    - Order Created, Order Processing, Success, Pending Payment, Payment Completed
    - Internal transitions (pending_sale → pending → in_trade → negotiation) are **suppressed**

- **Chat Input:**
  - Text input field
  - Camera icon (inline)
  - Smile/emoji icon (inline)
  - Send button (accent circle)
   - "Create Order" button (opens Order Wizard)
   - **"Fund Deduction/Addition" button** (Super Admin and Team Lead only) — opens Fund Adjustment Modal to add/deduct money from customer wallet. Shows current wallet balance, transaction history, and records all operations.
   - **Related Order dropdown** in Fund Adjustment Modal — links the adjustment to a specific order. Dropdown filters orders by the selected customer's alias and displays order summary (Card Type, Amount, Naira Rate, Status) when selected.
   - **6-digit Transaction PIN gate** — Before any fund adjustment is committed, the modal switches to a `fundPinStep` view requiring the operator to enter their 6-digit Transaction PIN. Submission is blocked until PIN is verified. Adjustment records (`FundAdjustment`) are persisted to `sessionStorage` under key `cardchat_fund_adjustments`.

- **Order Status Controls:**
  - When an order exists for the conversation, status action buttons appear
  - Buttons show available transitions based on the state machine
  - Clicking a status button triggers the transition and adds a system message (if customer-facing)
  - Payment flow: selecting "Pending Payment" enables a payment mode with bank selection and amount input

#### Right Panel — Order Sidebar (35% width, 320–504px, hidden below `xl`)
- **Tabbed interface:** "Orders" tab and "Sales Order" (Cardlight) tab

**Orders Tab:**
- Lists all orders for the selected conversation (completed wizard orders + mock orders)
- Each order card: ID, status badge (color-coded), payout, card count, timestamp
- **Alias as first column** identifier
- Click to expand order details inline
- Expanded details show: card breakdown, bank info, transfer amounts

**Sales Order (Cardlight) Tab:**
- See §5.5 below

### 5.5 Sales Order — Cardlight Integration

**Component:** `src/components/admin/OrderWizardModal.tsx` (also named `CardlightPanel`)

A multi-phase sales tool embedded in the right sidebar:

#### Phase 1: Login
- Account and password fields for Cardlight credentials
- "Login" button with simulated loading
- Transition to Phase 2 on success

#### Phase 2: Create Sale
- **Two-level cascading card selector:**
  - Level 1: Card Brand dropdown (AMEX, VISA, Sephora, Nordstrom, Nike, iTunes, Amazon, Steam, Google Play, eBay)
  - Level 2: Currency dropdown (filtered by selected brand's available currencies)
- **Card Source selector:** W / E / M buttons (toggle group)

- **Card Entry Form** (add up to 15 cards):
  - Each card entry has:
    - **Image Gallery:** Up to 10 image thumbnails per card entry
      - Click "+" to upload images
      - Hover any thumbnail to show remove (X) button
      - Gallery-style horizontal layout
    - **3-column input grid:**
      - Card Rate (text input)
      - Card Amount (text input with $ prefix)
      - Card No. (text input)
    - Remove card button (trash icon)
  - "Add Card" button (max 15)

- **Summary Bar:** Card count and total calculations

- **"Create Now" button:** Creates the order and adds it to the session order list

#### Phase 3: Order Tracking
- Session-based order list
- **Alias column** as primary identifier (auto-inherited from selected customer)
- Each order shows: Card Code, Description, Denomination, Purchase Rate, Supplier, Status, Date
- **"Sale" button** on each order → triggers Buyer Selection flow

#### Buyer Selection Flow
- **Seller selection modal:** Displays available sellers with:
  - Seller name
  - Rate (per unit)
  - Information (pipe-separated details: card type, conditions, requirements)
  - Transaction count
- Click seller → **"Choose & Sell" confirmation dialog:**
  - AlertDialog with seller details
  - "Cancel" / "Choose & Sell" buttons
  - On confirm: triggers `onBuyerSelected` callback

### 5.6 Dedicated Chat View (`/admin/chat/:id`)

**Component:** `src/pages/admin/AdminChatView.tsx` (590 lines)

A fallback chat view accessible via direct URL or search results. Contains the same features as the Messages page chat panel but as a standalone page:

- Back button to return to messages
- Full chat with escalation, group chat, identity toggle, reassignment
- **Order Wizard Modal** (Dialog-based instead of embedded)
- Right sidebar with order list (expandable entries with inline details)
- Payment flow with bank selection and confirmation
- Status badges: Processing, Completed, Failed, Settled, Trading, Pending

### 5.7 Customer Management (`/admin/customers`)

**Component:** `src/pages/admin/AdminCustomers.tsx`

- Header: "Customers" with Users icon and total count badge
- Search by alias or tag
- **Full data table** with columns:
  - Alias (monospace font)
  - Status (Consulting/Trading/Pending) — color-coded badges:
    - Consulting = amber
    - Trading = emerald
    - Pending = blue
  - **Channel** — badge showing whether the customer is on **WhatsApp** (emerald) or **In-app / TRTC** (primary)
  - Tags (VIP, Repeat, New, Priority badges)
  - Good Rate (percentage)
  - Total Value (₦ amount)
  - Last Active (relative time)
  - Total Orders (random 1-20 for mock)
  - Joined Date
  - Actions: Eye icon → opens profile modal
- **Profile Modal (Dialog):**
  - Customer alias prominently displayed
  - **Active channel** row + **WhatsApp number** (when set) rendered as a click-to-chat `wa.me` link
  - Status badge
  - All metrics: Good Rate, Total Value, Total Orders, Joined Date, Last Active
  - Tags list
  - Last message preview
  - Wallet tab with balance, credits, withdrawals, transactions
  - Close button

### 5.8 Card Rates (`/admin/card-rates`)

**Component:** `src/pages/admin/AdminCardRates.tsx`

- Header: "Card Rates" with CreditCard icon, current Naira Rate and Price Control display
- **Two independent search boxes:** Card Type search and Currency search (filter independently)
- Refresh button
- "Auto-refresh every 60s" indicator
- **"Price Push" button** (Super Admin and Team Lead only) — broadcasts current popular card prices (Apple, Steam, Razer Gold) to all platform customers
- **Rate calculation formula:**
  - Sell Rate = Current Naira Rate × Buy Rate
  - Buy Rate = Sell Rate × Current Price Control
- **Data table** columns:
  - Card Type
  - Format — badge: "E-Code" (primary pill) or "Physical" (muted pill)
  - Currency
  - Buy Rate (₦ per $1)
  - Sell Rate (₦ per $1)
  - Last Updated

### 5.9 Volume Ranking (`/admin/ranking`)

**Component:** `src/pages/admin/AdminRanking.tsx`  
**Access:** Super Admin, Team Lead, Agent (Finance excluded)

Admin view of the trading volume ranking system.

- Header: "Trading Volume Ranking" with active period date range
- **Bi-weekly period selector:** Select dropdown listing all H1 (1st–15th) and H2 (16th–end) periods for 2026 (24 entries) — defaults to current period
- **Date/Time range filters:** Optional From/To `DateTimePicker`s for additional ad-hoc filtering of leaderboard entries
- **CSV Export button** (Download icon) — exports the currently filtered leaderboard (Rank, Alias, Volume, Reward ₦) for the active period
- **Two-panel layout (1:2 grid on desktop):**

#### Reward Tiers Panel
- Lists all 6 reward tiers with threshold and reward amounts (sourced from `rankingMock.rankingTiers`)
- Format: "≥ 2,000,000" → "₦10,000"

#### Leaderboard Panel
- **Alias search:** Filter leaderboard by alias (case-insensitive)
- User count display: "Leaderboard (N users)"
- **Table columns:** Rank (with medal icons for top 3), Alias (monospace), Volume, Reward
- Scrollable with sticky header (max 500px height)
- Medal icons: Trophy (gold) for #1, Medal (silver) for #2, Award (bronze) for #3

### 5.10 Rewards Management (`/admin/rewards`)

**Component:** `src/pages/admin/AdminRewards.tsx`  
**Access:** Super Admin, Team Lead, Agent (Finance excluded)

Admin view of all rewards distributed to customers. Ranking rewards require **manual distribution by Super Admin only**; referral rewards are automated.

#### Summary Cards (3-column grid)
- **Total Rewards** — accent color, sum of all rewards
- **Ranking Rewards** — success color, sum of ranking-type rewards
- **Referral Rewards** — warning color, sum of referral-type rewards

#### Ranking Reward Distribution (Super Admin only)
- **"Distribute Ranking Rewards" button** — visible only to Super Admin
- Requires selecting a bi-weekly period (H1: 1st–15th, H2: 16th–end of month)
- **Pre-distribution checks:**
  - All orders in the selected period must be closed/settled
  - If open orders exist, distribution is blocked and pending orders are displayed in a table
  - Already-distributed periods cannot be re-distributed
- On successful distribution: ranking rewards are generated based on the leaderboard for that period and added to the rewards table

#### Filters
- **Alias search:** Filter by customer alias (case-insensitive)
- **Type filter:** Select dropdown — All Types, Ranking, Referral
- **Date/Time range:** From and To date-time pickers for filtering reward records by date

#### Rewards Table
- **Columns:** ID, Alias, Type (badge: ranking=success, referral=warning), Description, Amount (success green), Date, Time
- Mock reward records covering referral types (ranking records added via distribution)
- Empty state: "No rewards found"

### 5.11 Orders (`/admin/orders`)

**Component:** `src/pages/admin/AdminOrders.tsx`

- Header: "Orders" with FileText icon
- Search by order ID or customer alias
- **Data table** columns:
  - **Alias** (first column — customer identifier)
  - Order ID
  - Card Type
  - Card Rate (₦)
  - **Naira Rate (₦)** — per-order naira rate at time of trade
  - Amount ($)
  - Status — badges: Settled (success), Trading (primary), Pending Payment (warning)
  - Created (timestamp)
- **Expanded details** include Naira Rate alongside other order fields
- **CSV export** includes Naira Rate column

### 5.12 Naira Rate (`/admin/naira-rate`)

**Component:** `src/pages/admin/AdminNairaRate.tsx`  
**Access:** Super Admin, Team Lead

- **Current Rate Display:** ₦289 prominently shown with system denomination and price control percentage
- **Update Form (3 editable fields):**
  - New Rate input (NGN per CNY) — **validated between 99–299**
  - New Denomination input
  - New Price Control (%) — **validated between 1.00%–100.00%**
  - Reason for change text input
- **Broadcasting:** On save, rate is broadcast to all active sessions with real-time status indicator (Broadcasting → All sessions updated)
- **Warning:** "These values will be broadcast to all active sessions and the Customer App immediately. All new orders will use these values."
- **Rate History Table:**
  - Timestamp
  - Old Rate → New Rate
  - Changed By (admin name)
  - Reason

### 5.13 User Management (`/admin/users`)

**Component:** `src/pages/admin/AdminUsers.tsx`  
**Access:** Super Admin only

- Admin users table:
  - Name
  - Email
  - Role (Super Admin / Team Lead / Agent)
  - Status (Active / Offline) — color-coded badges
  - Last Login (relative time)

### 5.14 Team Dashboard (`/admin/team`)

**Component:** `src/pages/admin/AdminTeam.tsx`  
**Access:** Super Admin, Team Lead

#### Stats Grid (4 cards)
- **Active Chats** — current open conversations (with delta vs prior period)
- **Online Agents** — fraction of online vs total agents (e.g. `3/4`)
- **Orders Today** — today's order count with delta
- **Avg Response** — average first-response time across agents (with delta)

#### Agent Performance Table
- Columns: **Agent**, Active Chats, Orders, Settled (success color), Pending (warning color), Avg Time
- Hover-highlighted rows; muted header band

#### Active Escalations Panel
- Lists chats currently escalated to the viewing user
- Each row shows requesting agent → recipient, customer alias, brief reason, and an "Active" status pill

### 5.14b Team Chat (`/admin/team-chat`)

**Component:** `src/pages/admin/AdminTeamChat.tsx`  
**Access:** All admin roles

Internal collaboration workspace for staff. See `mem://features/admin-panel/collaboration` for full role-color and unread-badge specifications. Provides direct messages, role-colored bubbles, automated system notifications, and persistent message history (mock).

### 5.15 IP & Country Restrictions (`/admin/ip-restrictions`)

**Component:** `src/pages/admin/AdminIpRestrictions.tsx`  
**Access:** Super Admin only

Two-section management page:

#### Country Rules
- Country name and code display
- Mode: Allow / Block (badge)
- Enabled toggle (Switch component)
- Add new country rule form
- Delete with confirmation

#### IP Address Rules
- CIDR notation input (e.g., `192.168.1.0/24`)
- Descriptive label
- Mode: Allow / Block
- Enabled toggle
- Add/delete with confirmation

#### Audit Log
- Tracks all rule changes with:
  - Timestamp
  - Admin identity
  - Action performed
- Toast notifications for all actions

### 5.16 Sensitive Words Filter (`/admin/sensitive-words`)

**Component:** `src/pages/admin/AdminSensitiveWords.tsx`  
**Access:** Super Admin only

#### Word Categories (color-coded)
- **Profanity** — destructive (red) color coding
- **Competitor** — warning (amber) color coding
- **PII Pattern** — primary (green) color coding

#### Detection Modes
- **Exact** — whole word match only
- **Partial** — substring match

#### Management Features
- Add new words: word input, category dropdown, detection mode selector
- **Inline editing** (pencil icon) — edit word text in place
- **Delete** (trash icon) — remove individual words
- **Search bar** — filter words by text
- **Category filter** — filter by profanity/competitor/PII
- **Bulk import** — Upload `.txt` file (one word per line) via Upload button
- Toast notifications for all CRUD operations

#### Masking Behavior (Specification)
- Agents and Team Leads see asterisks (e.g., "f***")
- Super Admins see original text
- (Not enforced in prototype — specification only)

### 5.17 API Config (`/admin/api-config`)

**Component:** `src/pages/admin/AdminApiConfig.tsx`  
**Access:** Super Admin only

- Merchant API endpoint configuration
- Webhook callback URL settings
- Connection testing functionality

### 5.18 Platform Wallet (`/admin/wallets`)

**Component:** `src/pages/admin/AdminWallets.tsx`  
**Access:** Super Admin, Finance

A ledger-style view of all platform wallet transactions used to auto-credit customer wallets on successful orders.

#### Summary Cards (3-column grid)
- **Platform Balance** — accent color, deposits minus disbursements
- **Total Deposits** — success color, sum of all deposits
- **Total Disbursements** — warning color, sum of all disbursements

#### Filters
- **Search:** Free-text search across Transfer ID, Order ID, description, remark
- **Type filter:** All Types / Deposits / Disbursements
- **Customer filter:** Dropdown of unique customer aliases
- **Date range:** From/To date-time pickers
- **Clear All:** Resets all filters
- **Record count:** Displays filtered count

#### Transaction Table
- **Columns:** Transfer ID, Order ID, Customer (avatar + alias), Type (deposit with green ArrowDownLeft / disbursement with amber ArrowUpRight), Description, Naira Rate (₦), Amount (₦, color-coded +/-), Date · Time, Remark
- Each record includes: unique PW ID, transfer ID, optional order ID, optional customer alias, naira rate at time of transaction

#### Add Money Modal
- Amount input (₦) with comma-stripped validation
- Description (optional)
- Remark (optional)
- Creates a new deposit record with current timestamp and system naira rate

#### CSV Export
- Exports filtered records with all columns including Naira Rate
- Filename: `platform-wallet-YYYY-MM-DD.csv`

### 5.19 SMS Broadcast (`/admin/broadcast`)

**Component:** `src/pages/admin/AdminBroadcast.tsx`  
**Access:** Super Admin only

- Message composer
- Audience selection
- Send functionality

### 5.19 Admin User Guide (`/admin/guide`)

**Component:** `src/pages/admin/AdminGuide.tsx`

- **15 expandable accordion sections** with numbered step-by-step instructions
- Sections cover every admin feature:
  1. Navigating the Dashboard
  2. Messages & Conversation Management
  3. Escalation & Group Chat
  4. Creating a Trade Order (full wizard walkthrough)
  5. Sales Order (Cardlight) Tab — login, sale creation, seller selection, Choose & Sell
  6. Managing Orders
  7. Customer Management — browsing, search, profile modal, tag prioritization
  8. Card Rates
  9. Naira Rate Management
  10. User Management
  11. Team Dashboard
  12. IP & Country Restrictions — rules, modes, audit log
  13. Sensitive Words Filter — categories, modes, bulk import, CRUD
  14. Role-Based Access Control — full access matrix
  15. Global Search — categorized results
- **Updated content reflects:**
  - Multi-image support (up to 10 per card entry, hover-to-remove)
  - Customer-facing status filtering in chat
  - Responsive fluid panel widths (25% / 35% with min/max)
  - 3-column compact input grid (Rate, Amount, No.)
- Each section tagged with applicable roles (All Roles / Super Admin / Team Lead)
- Pro tips with accent-colored callouts
- Quick-nav buttons for jumping to sections
- Expand All / Collapse All controls

### 5.20 Customer Guide Reference (`/admin/customer-guide`)

**Component:** `src/pages/admin/AdminCustomerGuide.tsx`

- **10 expandable guide sections** written from the agent's perspective
- Helps agents understand and assist customers with:
  1. Getting Started — splash, onboarding, OTP, invite code, alias
  2. Customer Home Screen — modular grid, search, live rates
  3. How Customers Sell Gift Cards — agent tips
  4. Customer Chat Interface — inline image/emoji, visual feedback
  5. Finding Agents — status indicators, search
  6. Beginner's Guide (First Login) — 3-step overlay
  7. Customer Profile (Me Tab) — alias-centric, bank accounts
  8. Customer Payments — payout flow
  9. Customer Safety Tips — agent guidance
  10. App Design & Dark Theme — dark luxury theme, iOS layout, visual feedback

---

## 6. Order State Machine

**File:** `src/lib/orderStateMachine.ts`

A finite state machine governing order lifecycle:

### 6.1 Agent-Side Statuses

```
pending_sale → pending → in_trade → success → pending_payment → payment_completed
                                  ↘ order_cancelled
```

| Status | Label | Next Statuses |
|--------|-------|---------------|
| `pending_sale` | Pending Sale | `pending` |
| `pending` | Pending | `in_trade` |
| `in_trade` | In Trade | `success`, `order_cancelled` |
| `order_cancelled` | Order Cancelled | (terminal) |
| `success` | Success | `pending_payment` |
| `pending_payment` | Pending Payment | `payment_completed` |
| `payment_completed` | Payment Completed | (terminal) |

### 6.2 Customer-Facing Status Mapping

| Agent Status | Customer Sees |
|-------------|---------------|
| `pending_sale`, `pending` | Order Created |
| `in_trade` | Order Processing |
| `order_cancelled` | Failed |
| `success` | Success |
| `pending_payment` | Pending Payment |
| `payment_completed` | Payment Completed |

### 6.3 Conversation Tab Mapping

| Agent Status | Tab |
|-------------|-----|
| No order / `pending_sale` / `pending` / `order_cancelled` / `payment_completed` | Consulting |
| `in_trade` / `pending_payment` / `success` | Trading |

> Pending Payment is no longer a separate tab column — it surfaces as an in-row status indicator within the Trading tab.

### 6.4 Status Persistence

**File:** `src/hooks/useOrderStatus.ts`

- Order statuses are stored per conversation in `localStorage` under key `cardchat_order_statuses`
- Each entry: `{ conversationId, orderId, status, updatedAt }`
- Functions: `createOrder`, `transitionStatus`, `getStatus`, `getOrderId`, `getConversationTab`, `resetAll`
- Transition validation via `canTransition()` — invalid transitions are silently ignored

### 6.5 Status Styling

| Status | Text Color | Background |
|--------|-----------|------------|
| Pending Sale | `text-warning` | `bg-warning/10` |
| Pending | `text-primary` | `bg-primary/10` |
| In Trade | `text-accent` | `bg-accent/10` |
| Order Cancelled | `text-destructive` | `bg-destructive/10` |
| Success | `text-success` | `bg-success/10` |
| Pending Payment | `text-primary` | `bg-primary/10` |
| Payment Completed | `text-success` | `bg-success/10` |

---

## 7. Data Models

**File:** `src/data/mock.ts`

### 7.1 Card Rates
```typescript
{
  id: number;
  cardType: string;                    // "iTunes US", "Amazon UK", etc.
  currency: string;                    // "USD", "GBP"
  cardFormat: "Physical" | "E-Code";
  buyRate: number;                     // Naira per $1
  sellRate: number;                    // Naira per $1
  lastUpdated: string;                 // "2 min ago"
}
```
11 mock entries covering iTunes, Amazon, Steam, Google Play, Vanilla Visa, eBay in USD/GBP.

### 7.2 Conversations
```typescript
{
  id: string;                          // "c1" through "c7"
  alias: string;                       // 6-char alphanumeric (e.g., "A7X3KP")
  lastMessage: string;
  time: string;                        // Relative ("2m", "5m", etc.)
  unread: number;
  status: "consulting" | "trading" | "pending";
  goodRate: number;                    // Customer rating percentage
  totalValue: string;                  // "₦450,000"
  tags: string[];                      // ["VIP", "Repeat", "New", "Priority"]
}
```
7 mock conversations.

### 7.3 Chat Messages
```typescript
{
  id: number;
  sender: "customer" | "agent" | "system";
  senderName?: string;                 // For group chat display
  text: string;
  time: string;
  image?: boolean;                     // Placeholder image message
  isOrder?: boolean;                   // System order message
}
```
6 mock messages in a typical sell-verify-order flow.

### 7.4 Orders
```typescript
{
  id: string;                          // "ORD-20260318-001"
  customer: string;                    // Alias
  cardType: string;
  denomination: string;                // "$100 x2"
  amount: number;
  nairaRate: number;
  unitPrice: number;
  status: "settled" | "trading" | "pending_payment";
  created: string;
}
```
3 mock orders.

### 7.5 Completed Orders (from Wizard)
```typescript
{
  orderId: string;
  cards: { cardType: string; denomination: string; unitPrice: string; status: string }[];
  totalPayout: number;
  totalFaceValue: number;
  bank: string;
  bankAccount: string;
  holderName: string;
  transferAmount: string;
  timestamp: string;
  status: "processing" | "completed" | "failed";
}
```

### 7.6 Cardlight Card Entry
```typescript
{
  id: number;
  cardImages: string[];                // Up to 10 image URLs per entry
  cardNo: string;
  cardRate: string;
  cardAmount: string;
}
```

### 7.7 Cardlight Seller Entry
```typescript
{
  id: string;
  seller: string;                      // e.g., "GRTEAM"
  rate: number;                        // e.g., 5.88
  information: string;                 // Pipe-separated details
  transactions: number;                // Historical count
}
```

### 7.8 Other Models

| Model | Fields |
|-------|--------|
| **Bank Accounts** | id, bankName, accountNumber (masked), holderName, verified |
| **Transactions** | id, orderId, amount, status (success/failed), date, bank |
| **Admin Users** | id, name, email, role (super_admin/team_lead/agent), status (active/offline), lastLogin |
| **Naira Rate History** | timestamp, oldRate, newRate, changedBy, reason |
| **Customer Contacts** | id, name, status (online/away/saturated), isAgent, lastSeen — mapped to 3-tier system: online→Available, away/busy→Busy, saturated→Saturated |
| **Card Brands** | name, currencies[] (used in Cardlight cascading selector) |

### 7.9 Wallet Balance
```typescript
// Wallet balance is split into two components:
tradingBalance: number;   // 550,000 — earnings from card trades
rewardsBalance: number;   // 6,200 — earnings from ranking + referral rewards
walletBalance: number;    // tradingBalance + rewardsBalance (computed)
```

### 7.10 System Constants
- `systemNairaRate`: 289 (₦ per CNY)
- `systemDenomination`: 100
- `systemPriceControl`: 85.00 (%)
- Naira rate valid range: 99–299
- Price control valid range: 1.00%–100.00%
- Customer wallet withdrawal minimum: ₦2,000
- Customer wallet withdrawal maximum: ₦790,000
- Cardlight card sources: `["W", "E", "M"]`
- Max cards per order: 15
- Max images per card entry: 10
- Max bank accounts per customer: 5

### 7.11 Persistence Keys

The prototype uses browser storage to simulate backend persistence. All keys are documented here for parity with future backend implementation.

| Key | Storage | Purpose |
|-----|---------|---------|
| `cardchat-theme` | localStorage | Active UI theme (`light` / `dark`) |
| `cardchat_order_statuses` | localStorage | Per-conversation order id + status + updatedAt (state machine) |
| `adminAuth` | sessionStorage | Mock admin login session (role + email) |
| `cardchat_completed_orders` | sessionStorage | Orders created via the Order Wizard / Cardlight panel |
| `cardchat_transfer_completed` | sessionStorage | Set of order IDs whose payment transfer has been confirmed |
| `cardchat_fund_adjustments` | sessionStorage | `FundAdjustment[]` log of customer wallet additions/deductions |

---

## 8. Design System

### 8.1 Color Tokens (HSL)

All colors are defined as HSL values in CSS custom properties (`index.css`) and consumed via Tailwind classes.

#### Light Mode (`:root`)
| Token | HSL Value | Usage |
|-------|----------|-------|
| `--background` | `0 0% 98%` | Page background |
| `--foreground` | `225 20% 12%` | Primary text |
| `--card` | `0 0% 100%` | Card surfaces |
| `--primary` | `160 65% 38%` | Brand green |
| `--accent` | `160 65% 38%` | CTA green (same as primary) |
| `--muted` | `220 14% 95%` | Subdued backgrounds |
| `--destructive` | `0 62% 50%` | Error/danger |
| `--warning` | `38 92% 50%` | Pending/processing |
| `--success` | `160 65% 38%` | Completion states |

#### Dark Mode (`.dark`)
| Token | HSL Value | Usage |
|-------|----------|-------|
| `--background` | `225 20% 7%` | Deep navy/charcoal |
| `--foreground` | `210 20% 92%` | Light text |
| `--card` | `225 20% 10%` | Elevated dark surfaces |
| `--primary` | `160 65% 45%` | Brighter green |
| `--accent` | `160 65% 42%` | CTA green |
| `--muted` | `225 15% 13%` | Dark subdued |
| `--destructive` | `0 62% 45%` | Muted red |

#### Chat-Specific Tokens
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--chat-bubble-self` | `160 40% 92%` | `160 40% 15%` | Customer messages |
| `--chat-bubble-other` | `220 14% 96%` | `225 20% 12%` | Agent messages |
| `--chat-pinned` | `38 60% 95%` | `38 60% 12%` | Pinned order card |

#### Sidebar Tokens (Admin)
| Token | Light | Dark |
|-------|-------|------|
| `--sidebar-background` | `220 14% 96%` | `225 20% 5%` |
| `--sidebar-foreground` | `225 20% 18%` | `210 20% 90%` |
| `--sidebar-primary` | `160 65% 38%` | `160 65% 50%` |

### 8.2 Typography

| Property | Value |
|----------|-------|
| Heading font | `Space Grotesk` (via CSS custom property `--font-heading`) |
| Body font | `Inter` (via CSS custom property `--font-body`) |
| Font class | `.font-heading` for headings, system body for text |
| Sizes used | `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl` |

### 8.3 Component Classes (CSS Layer)

Defined in `index.css` `@layer components`:

| Class | Usage |
|-------|-------|
| `.tab-bar-item` | Customer bottom tab items |
| `.tab-bar-item.active` | Active tab (accent color) |
| `.column-header` | Admin column headers |
| `.chat-bubble` | Base chat message bubble |
| `.chat-bubble-self` | Customer's own messages (right-aligned) |
| `.chat-bubble-other` | Incoming messages (left-aligned, bordered) |
| `.pinned-order` | Pinned order notification card |
| `.status-badge` | Inline status pill |
| `.admin-sidebar-item` | Admin sidebar navigation item |
| `.rate-value` | Flash animation for rate updates |

### 8.4 Interactive Feedback

- **Global button feedback:** All `<button>` and `[role="button"]` elements have:
  - `transition-all duration-150` on base state
  - `:active` → `transform: scale(0.96); opacity: 0.85`
- Provides immediate tactile response on tap/click across all interactive elements

### 8.5 Animations

| Animation | Keyframes | Usage |
|-----------|----------|-------|
| `scale-in` | 0→1 scale, 0→1 opacity | Icons, avatars |
| `rate-flash` | accent/15% → transparent bg | Rate value updates |
| `slide-up` | Translate Y + opacity | Bottom sheets, beginner guide |
| `fade-in` | 0→1 opacity | Text content, staggered reveals |

### 8.6 UI Component Library (shadcn/ui)

Components used from shadcn/ui: Accordion, AlertDialog, Avatar, Badge, Button, Card, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, ResizablePanels, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner (toast), Switch, Table, Tabs, Textarea, Toast, Toggle, ToggleGroup, Tooltip.

### 8.7 Border Radius
- Default: `0.75rem` (`--radius`)
- Used variants: `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`

---

## 9. File Structure

```
src/
├── App.tsx                           # Root router with all routes
├── main.tsx                          # Entry point
├── index.css                         # Design tokens, theme, custom classes
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx           # Admin shell (sidebar + topbar)
│   │   └── OrderWizardModal.tsx      # Cardlight panel + order wizard (642 lines)
│   ├── customer/
│   │   ├── CustomerLayout.tsx        # Customer shell (content + tab bar + guide)
│   │   ├── BeginnerGuide.tsx         # First-login tooltip overlay
│   │   ├── OnboardingSlides.tsx      # Swipeable intro slides
│   │   └── SplashScreen.tsx          # 5-second animated splash
│   ├── ui/                           # shadcn/ui components (40+ files)
│   └── NavLink.tsx                   # Shared navigation link
├── contexts/
│   └── AdminRoleContext.tsx          # RBAC role state (super_admin/team_lead/agent)
├── data/
│   ├── mock.ts                      # All mock data
│   └── rankingMock.ts               # Ranking tiers, users, helpers
├── hooks/
│   ├── use-mobile.tsx                # Mobile viewport detection
│   ├── use-theme.tsx                 # Theme provider + toggle
│   ├── use-toast.ts                  # Toast hook
│   └── useOrderStatus.ts            # Order state machine persistence
├── lib/
│   ├── orderStateMachine.ts          # Order FSM types, transitions, labels, styling
│   └── utils.ts                      # Utility functions (cn, etc.)
├── pages/
│   ├── Index.tsx                     # Landing page (app selector)
│   ├── NotFound.tsx                  # 404 page
│   ├── admin/
│   │   ├── AdminLogin.tsx            # Login page
│   │   ├── AdminMessages.tsx         # Messages (998 lines — main admin page)
│   │   ├── AdminChatView.tsx         # Standalone chat view (590 lines)
│   │   ├── AdminCustomers.tsx        # Customer management
│   │   ├── AdminCardRates.tsx        # Card rates table
│   │   ├── AdminOrders.tsx           # Orders table
│   │   ├── AdminNairaRate.tsx        # Naira rate management
│   │   ├── AdminUsers.tsx            # User management
│   │   ├── AdminTeam.tsx             # Team dashboard
│   │   ├── AdminIpRestrictions.tsx   # IP & country restrictions
│   │   ├── AdminSensitiveWords.tsx   # Sensitive words filter
│   │   ├── AdminApiConfig.tsx        # API configuration
│   │   ├── AdminBroadcast.tsx        # SMS broadcast
│   │   ├── AdminRanking.tsx           # Trading volume ranking (admin)
│   │   ├── AdminRewards.tsx          # Rewards management (admin)
│   │   ├── AdminGuide.tsx            # Admin user guide
│   │   ├── AdminWallets.tsx          # Platform wallet ledger
│   │   ├── AdminProfile.tsx          # Admin profile settings
│   │   ├── AdminScreensGallery.tsx   # Interactive screens gallery
│   │   └── AdminCustomerGuide.tsx    # Customer guide reference
│   └── customer/
│       ├── CustomerAuth.tsx          # Auth flow (splash → onboarding → auth)
│       ├── CustomerHome.tsx          # Home screen
│       ├── CustomerChat.tsx          # Chat list
│       ├── CustomerChatView.tsx      # Chat view with order tracking
│       ├── CustomerContacts.tsx      # Agent directory
│       ├── CustomerMe.tsx            # Profile (multi-section)
│       ├── CustomerRewards.tsx      # Rewards overview + referral + history
│       ├── CustomerRanking.tsx       # Trading volume ranking (customer)
│       └── CustomerGuide.tsx         # User guide
```

---

## 10. Known Limitations

| Limitation | Detail |
|-----------|--------|
| No backend | All data is mock — no database, no persistence beyond localStorage/sessionStorage |
| No real auth | Login is simulated with hardcoded credentials; session stored in sessionStorage |
| No real-time messaging | No WebSocket or real-time subscriptions |
| No push notifications | Not implemented |
| Simulated verification | Card verification uses random outcomes and delays |
| Simulated transfers | No payment gateway — bank transfers are UI-only |
| Client-side search | Search filters local arrays, not a database |
| Demo role switching | RBAC role switcher is for prototyping — no server-side enforcement |
| No real Cardlight API | Cardlight integration is UI-only |
| No file uploads | Image attachments use placeholders, not real uploads |
| Large page files | `AdminMessages.tsx` (998 lines) and `OrderWizardModal.tsx` (642 lines) should be refactored |
| No real wallet ledger | Platform Wallet uses mock data — no real bank integration or double-entry bookkeeping |
| No order-wallet linking | Fund adjustments reference orders by ID but no backend enforces the relationship |
| No naira rate history per order | Orders store a snapshot naira rate but rate changes are not audited per-order |
| No real CSV export | CSV exports are generated client-side from filtered mock data |
| No audit trail | Fund adjustments, rate changes, and role switches have no server-side audit log |

---

## 11. Future Considerations

1. **Backend Integration:** Lovable Cloud (Supabase) for database, auth, edge functions, storage
2. **Real-time Chat:** WebSocket or Supabase Realtime for live messaging
3. **Card Verification API:** Integration with actual merchant verification services
4. **Cardlight API:** Real integration with Cardlight card selling marketplace
5. **Payment Gateway:** Bank transfer APIs (Paystack, Flutterwave) for automated payouts
6. **Push Notifications:** Real-time trade and transfer notifications
7. **Analytics Dashboard:** Admin dashboards with real metrics (Recharts already installed)
8. **File Upload/Storage:** Real image upload for card photos with cloud storage
9. **Audit Logging:** Server-side audit trail for all admin actions
10. **Customer KYC:** Identity verification for regulatory compliance
11. **Multi-language (i18n):** Internationalization support
12. **Beginner Guide Persistence:** Store guide state in database per user
13. **IP Geolocation:** Real GeoIP integration for country-based access control
14. **Content Moderation:** Server-side sensitive word filtering in real-time
15. **Component Refactoring:** Break down large files (AdminMessages, OrderWizardModal, CustomerMe) into smaller components

---

## 12. Full Changelog

### v4.5 → v4.6

| Change | Description |
|--------|-------------|
| **Ranking Rewards Manual Distribution** | Ranking rewards are no longer auto-distributed. Super Admin must manually trigger distribution per bi-weekly period via a "Distribute Ranking Rewards" button. System validates all orders are closed before allowing distribution. |
| **Referral Rewards Automated** | Referral rewards remain automated — triggered when an invited user completes their first trade. |
| **Finance Role Restricted** | Finance role removed from Volume Ranking and Rewards access. Updated RBAC table and sidebar visibility. |
| **Rewards Date/Time Filter** | Added From/To date-time pickers to the Rewards Management page for granular filtering of reward records. |
| **Platform Wallet Filters & Export** | Added date/time range filters, search, type filter (deposit/disbursement), and CSV export to the Platform Wallet page. |
| **PRD Updated** | PRD bumped to v4.6 with rewards distribution workflow, RBAC changes, and filter/export features. |

### v4.4 → v4.5

| Change | Description |
|--------|-------------|
| **Wallet Balance Split** | `walletBalance` decomposed into `tradingBalance` (₦550,000) + `rewardsBalance` (₦6,200); breakdown shown on Home, Me profile card, and My Wallet sub-view when balance is visible |
| **Customer Rewards Page** | Redesigned `/customer/rewards` as a single-page layout with total rewards card (ranking vs referral breakdown), referral code, invite code input, rewards history list, and "How it works" info modal via header icon |
| **Admin Rewards Page** | New `/admin/rewards` page with summary cards (total/ranking/referral), alias search, type filter, and detailed rewards table — accessible to all roles |
| **RBAC Updated** | Rewards added to RBAC table — accessible to all 4 roles |
| **Sidebar Updated** | 16 nav items (added Rewards with Gift icon) |
| **Home Actions Updated** | 4-action grid now: Sell Cards, Rewards, Ranking, Calculator (replaces Live Rates, Chat, Guide) |
| **PRD Updated** | PRD bumped to v4.5 with wallet split, rewards pages, updated routes, RBAC, and file structure |

### v4.3 → v4.4

| Change | Description |
|--------|-------------|
| **Customer Ranking Page** | New `/customer/ranking` page with personal achievement card, progress bar, motivational CTA, and smart leaderboard (top 20 or top 10 + context around user) |
| **Admin Ranking Page** | New `/admin/ranking` page with reward tiers panel, searchable leaderboard with alias filter, and month selector |
| **Ranking Mock Data** | New `src/data/rankingMock.ts` with 9 reward tiers, 25 mock users, and tier helper functions |
| **Re-negotiation Removed** | Removed `negotiation` status from the order state machine — `in_trade` now transitions directly to `success` or `order_cancelled` |
| **RBAC Updated** | Volume Ranking added to RBAC table — accessible to all roles |
| **PRD Updated** | PRD bumped to v4.4 with ranking pages, order flow simplification, renumbered admin sections |

### v4.2 → v4.3

| Change | Description |
|--------|-------------|
| **Finance Role Added** | New `finance` role with access to Platform Wallet, Naira Rate, Orders, and Team Chat |
| **4-Role RBAC** | Role switcher now includes Finance; all nav items and RBAC table updated for 4 roles |
| **Sidebar Unread Badges** | Messages (5) and Team Chat (3) nav items display destructive-colored unread count badges, visible even when active |
| **Order Card Alignment** | Order number row amount removed; Card No. and Order No. right-aligned in the card name/icon row |
| **Order ID Right-Aligned** | Order ID display right-aligned in order cards for cleaner layout |
| **PRD Updated** | PRD bumped to v4.3 reflecting all sidebar, RBAC, and order card changes |

### v4.1 → v4.2

| Change | Description |
|--------|-------------|
| **System Naira Rate → 289** | Changed global rate from ₦1,580 to ₦289 across all mock data, orders, and chat references |
| **Price Control Management** | Added editable Price Control field (1.00%–100.00%) to Naira Rate page with validation and broadcast |
| **Naira Rate Validation** | Rate input validated between 99–299 with error toast on invalid values |
| **Denomination Editable** | Sales Order panel denomination field is now editable (was read-only), pre-filled with system default |
| **Card Rates Dual Search** | Replaced single search box with independent Card Type and Currency search filters |
| **Price Push Button** | Super Admin/Team Lead can broadcast popular card prices (Apple, Steam, Razer) to all customers |
| **Fund Deduction/Addition** | New button in chat interface (Super Admin/Team Lead) to add/deduct from customer wallet with full transaction recording |
| **Fund Adjustment Modal** | Shows current wallet balance, transaction history, and records all fund operations |
| **Wallet Withdrawal Limits** | Customer withdrawals capped at ₦2,000 minimum and ₦790,000 maximum per transaction |
| **Invite Code Moved** | Removed from registration flow; now accessible on the Rewards screen |
| **Admin Header Stats** | Displays current Naira rate and Price Control for agents (view-only); editable by Super Admin/Team Lead |
| **Guides Updated** | Admin Guide, Customer Guide, and PRD updated to reflect all v4.2 changes |

### v4 → v4.1

| Change | Description |
|--------|-------------|
| **Alias Privacy Text Updated** | Removed "Only system administrators can see your real identity" — alias screen now says "This alias is used across all support interactions" |
| **Agent Profile → Direct Chat** | Clicking "Message" on an agent's profile navigates directly to that agent's chat window (via router state `chatId`), bypassing the chat list |
| **Tab Mapping Fix** | Corrected `getTabForStatus`: `pending_sale`, `pending`, and `order_cancelled` now route to Consulting tab; `in_trade`, `negotiation`, and `success` route to Trading tab |
| **Agent Profile Documented** | Added Agent Profile page section under Contacts |

### v3 → v4

| Change | Description |
|--------|-------------|
| **PRD Consolidation** | Merged v2 and v3 into single comprehensive document covering every feature |
| **Complete Feature Documentation** | Every page, component, interaction, and data model fully documented |
| **File Structure Map** | Added complete file tree with descriptions |
| **State Machine Documentation** | Full FSM specification with transitions, mappings, and persistence details |

### v2 → v3

| Change | Description |
|--------|-------------|
| Splash Screen | 5-second animated intro with trust pillars |
| Onboarding Slides | 4 swipeable pre-registration pages |
| Email OTP Auth | Apple/Google/Email OTP sign-in, invite codes, alias confirmation |
| Dark Luxury Theme | Customer app dark color scheme |
| Modular Home Grid | iOS-inspired 4-tile core actions |
| Beginner's Guide | 3-step first-login overlay |
| Interactive Feedback | Global button scale-down animation |
| Customer Management | Admin customer table with profile modal |
| IP & Country Restrictions | Country/IP allow/block rules with audit logging |
| Sensitive Words Filter | Profanity/competitor/PII filtering with bulk import |
| Sales Order (Cardlight) | Cardlight login, sale creation, seller selection |
| Multi-Image Card Entries | Up to 10 images per card entry with hover-to-remove |
| Customer-Facing Status Only | Chat suppresses internal agent transitions |
| Responsive Admin Panels | Fluid percentage widths (25%/35%) with min/max constraints |
| Naira Rate Access | Team Lead now has access |
| Updated User Guides | All 3 guides updated |

### v1 → v2

| Change | Description |
|--------|-------------|
| Card Format | Physical/E-Code format support |
| Currency & Rate in Wizard | Auto-calculated rate display |
| Escalation / Group Chat | Add Team Leads/Super Admins to chats |
| Sender Names | Color-coded sender labels in group chat |
| Failed Card Deletion | Remove failed cards in verification step |
| Transfer Confirmation | Post-transfer confirmation screen |
| Orders Sidebar | Chat view right panel with order history |
| Chat Image Drag & Drop | Draggable chat images for card entries |
| Admin User Guide | 12-section guide |
| Customer User Guide | 10-section guide |

### v4.6 → v4.7

| Change | Description |
|--------|-------------|
| **Traffic Shunting** | 3-tier agent status system (Available/Busy/Saturated) with proactive visual cues on Contacts page |
| **Saturated Agent Pop-Up** | Warning dialog when clicking heavily-occupied agents, suggesting available alternatives |
| **Auto-Sort by Availability** | Agent list sorted Online → Busy → Saturated to guide user selection |
| **Admin Screens Gallery** | Interactive gallery page (`/admin/screens`) showing all admin panel pages as scaled iframe previews |

### v4.7 → v4.8 — April 16, 2026

| Change | Description |
|--------|-------------|
| **Platform Wallet Enhanced** | Full ledger page with Transfer ID, Order ID, Customer, Type, Description, Naira Rate, Amount, Date/Time, Remark columns. Includes search, type/customer/date filters, and CSV export. |
| **Platform Wallet Add Money** | Deposit modal with amount, description, and remark fields |
| **Orders Naira Rate Column** | Added per-order Naira Rate column to Orders table, expanded details, and CSV export |
| **Fund Adjustment Order Linking** | Related Order dropdown in Fund Adjustment modal filters by customer alias, shows order summary (Card Type, Amount, Naira Rate, Status) |
| **Cleaned Wallet Descriptions** | Removed redundant customer/order details from wallet description field — now uses clean labels |
| **Known Limitations Expanded** | Added limitations for wallet ledger, order-wallet linking, naira rate auditing, CSV exports, and audit trail |
| **PRD Updated** | PRD bumped to v4.8 with Platform Wallet section (5.18), updated Orders section, enhanced Fund Adjustment docs |

### v4.8 → v4.9 (Current) — April 21, 2026

| Change | Description |
|--------|-------------|
| **WhatsApp Channel Integration** | WhatsApp Business Cloud API (Meta) added as a parallel messaging channel alongside TRTC.io. Unified-inbox model: one conversation thread per customer regardless of channel. |
| **Channel Indicators** | New `ChannelBadge` component (`src/components/admin/ChannelBadge.tsx`). Shown in `/admin` conversation list (icon-only chip + colored avatar dot), in the chat header (icon-only chip), and in `/admin/customers` (full pill in dedicated **Channel** column). |
| **Customer WhatsApp Number** | Optional WhatsApp number on the Customer profile (`/customer/me`). Editable via the Edit Profile modal. Surfaced to admins as a click-to-chat `wa.me` link in the Customer details modal. |
| **Mock Data** | `conversations` mock now carries `channel: "trtc" \| "whatsapp"` and `whatsappNumber` per customer. |
| **Chat Header Cleanup** | Removed order status pill (Success / Order Cancelled / etc.) from the 48px chat header. TTV and TMTV are now stacked in a single right-aligned column. Status remains visible in the order sidebar and via in-thread system messages. |
| **PRD Updated** | PRD bumped to v4.9 documenting WhatsApp channel, profile WhatsApp field, and chat-header re-arrangement. |
