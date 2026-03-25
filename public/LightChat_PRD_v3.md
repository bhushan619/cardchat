# LightChat — Product Requirements Document (PRD) v3.0

**Version:** 3.0 (Updated)  
**Date:** March 24, 2026  
**Status:** Interactive Prototype (Frontend Only — Mock Data)  
**Platform:** React + Vite + Tailwind CSS + TypeScript  

---

## 1. Executive Summary

LightChat is a real-time gift card trading platform with two interfaces: a **Customer App** (mobile-first) and an **Admin Panel** (desktop). The platform enables customers to sell gift cards to agents who verify, price, and process payouts — all through an integrated chat-based workflow.

This document reflects the **updated state** of the prototype after iterative development, including: a luxury dark theme, splash/onboarding animations, email OTP authentication, modular iOS-inspired home layout, provider trust profile, beginner's guide overlay, Sales Order (Cardlight) integration, customer management, IP/country restrictions, sensitive words filter, and comprehensive updated user guides.

---

## 2. Architecture Overview

### 2.1 Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS with semantic design tokens (HSL), shadcn/ui components, dark luxury theme
- **Routing:** React Router DOM v6
- **State:** React Context (AdminRoleContext for RBAC), local component state
- **Data:** Mock data layer (`src/data/mock.ts`) — no backend connected

### 2.2 Application Structure
```
/                        → Landing page (app selector)
/customer/*              → Customer App (mobile layout, max-w-md, dark theme)
/admin/*                 → Admin Panel (desktop layout, sidebar + main)
```

---

## 3. Customer App

### 3.1 Onboarding & Authentication (`/customer/auth`) ✨ UPDATED

The auth flow follows a multi-phase sequence: **Splash → Onboarding → Auth**.

#### 3.1.1 Splash Screen (Phase 1) ✨ NEW
- **5-second animated introduction** playing automatically on app open
- Displays the LightChat business avatar element
- Highlights four trust pillars in sequence: **Safety**, **Speed**, **Service**, and **Volume**
- Each pillar animates in with staggered fade-in effects
- Stats displayed: "200K+ Orders", "$50M+ Traded", "4.9★ Rating", "< 5 Min Payout"
- Auto-transitions to onboarding after animation completes
- Component: `SplashScreen.tsx`

#### 3.1.2 Onboarding Slides (Phase 2) ✨ NEW
- **Up to 5 swipeable introduction pages** shown before registration
- Each slide has a distinctive icon, title, and description
- Slide content emphasizes the same trust pillars:
  1. **Bank-Grade Security** — end-to-end encryption, verified agents, audited transactions
  2. **Lightning-Fast Settlements** — average payout under 5 minutes, real-time tracking
  3. **Dedicated Support** — 24/7 live chat with verified agents, no bots
  4. **$50M+ Traded** — trusted since 2019, 200K+ successful transactions
- Progress dots indicate current position
- "Skip" button available on every slide
- "Next" to advance, "Get Started" on final slide
- Component: `OnboardingSlides.tsx`

#### 3.1.3 Authentication (Phase 3) ✨ UPDATED
- **Welcome Screen:** "Get Started" (new users) or "I already have an account" (returning)
- **Sign-In Methods:**
  - Continue with Apple
  - Continue with Google
  - Email-based OTP (primary method)
- **Email OTP Flow:**
  - Enter email address → "Send OTP" button
  - 4-digit OTP input with individual digit fields
  - 5-minute expiry, max 3 attempts
  - "Resend in 60s" countdown
- **Invite Code (Optional):**
  - 6-character code or WS alias entry
  - "Skip for Now" option
  - 7-day window to add code retroactively; defaults to "App Ad" source after
- **Alias Confirmation:**
  - System-generated 6-character alphanumeric alias (e.g., "A7X3KP")
  - Displayed with privacy explanation: "Support agents will only see your alias — never your real name"
  - "Continue to Home" button

### 3.2 Home Screen (`/customer`) ✨ UPDATED

Redesigned with a **minimalist, iOS-inspired modular layout** that reduces visual interference and highlights core functions.

#### 3.2.1 Header
- LightChat logo/avatar (tappable to toggle Provider Profile)
- App name and "Tap logo to view provider info" subtitle

#### 3.2.2 Provider Profile (Toggle) ✨ NEW
- Toggled by tapping the LightChat logo
- **Provider Card:**
  - Business name with verification badge (✓)
  - "Platform Verified · Since 2019" status
  - Trust badges grid (3-column): KYB Verified, Rating 4.9/5, Avg Payout < 5 min
  - Stats grid (2-column): Total Traded $50M+, Completed Orders 200K+
- **Trust & Compliance Section:**
  - Identity Verified (KYB) — Business registration confirmed
  - Escrow Protection — Funds held securely until settlement
  - Licensed Operator — Regulatory compliant operations
  - Dispute Resolution — 24h response guarantee
- Component: `ProviderProfile.tsx`

#### 3.2.3 Core Actions Grid ✨ UPDATED
- **4-column modular grid** (iOS system app style):
  - **Sell Cards** — navigates to chat
  - **Live Rates** — real-time pricing view
  - **Chat** — navigates to chat tab
  - **Guide** — navigates to user guide
- Each tile: icon in accent-colored container, label, short description
- Rounded-2xl borders with subtle border highlight on hover

#### 3.2.4 Search Bar
- Filter cards by name in real-time

#### 3.2.5 Live Rates Section
- Current buy rates for supported gift cards
- Card type, format badge (Physical/E-Code), currency, rate per $1 in ₦
- "Auto-refresh 60s" indicator
- "View all rates" link when more than 5 cards

#### 3.2.6 Quick Start CTA
- "Ready to trade?" banner with "Start Trading" button
- Navigates to chat

#### 3.2.7 Beginner's Guide Overlay ✨ NEW
- **3-step bottom-sheet overlay** shown on first login
- Steps:
  1. **Connect with an Agent** — Browse verified agents on the Contacts page and start a conversation
  2. **Start a Chat** — Tap on an agent to open a secure chat, share card details, get a rate quote
  3. **Complete Your Trade** — Submit card, track order live, receive payout to bank account
- Progress bar with step indicators
- "Next" button to advance (max 2 taps to complete)
- "Skip" button to dismiss at any time
- "Finish" on final step
- Component: `BeginnerGuide.tsx`

### 3.3 Chat (`/customer/chat`) ✨ UPDATED
- Conversation list with active/past chats
- Full chat view with message input
- **Image and emoji icons placed inline beside the send button** (streamlined input)
- System messages display only **customer-facing status updates**: Order Created, Order Processing, Success, Pending Payment, Payment Completed. Internal agent transitions are suppressed. ✨ UPDATED
- **Group chat support:** When escalated, shows sender names on messages

### 3.4 Contacts (`/customer/contacts`)
- Available agents list with online/away status indicators
- **Green dot** = Online and available
- **Yellow dot** = Away (may respond slower)
- Search/filter agents by name
- Tap to start new conversation

### 3.5 Profile (`/customer/me`) ✨ UPDATED
- **6-character alias displayed prominently** at the top
- Registered bank accounts (for payouts)
- Transaction history with statuses
- VIP/Repeat customer badges

### 3.6 User Guide (`/customer/guide`) ✨ UPDATED
- **12 expandable guide sections** with step-by-step instructions (increased from 10)
- **New/updated topics:**
  - Getting Started — full splash → onboarding → OTP → invite → alias flow
  - Exploring the Home Screen — modular grid, provider profile toggle, live rates
  - Viewing the Provider Profile — KYB verification, trust badges, compliance marks ✨ NEW
  - How to Sell a Gift Card — updated with inline image/emoji icons
  - Using the Chat — updated with inline media controls
  - Finding Available Agents — search filter, status indicators
  - Understanding Card Rates
  - Managing Your Profile — alias-centric
  - Beginner's Guide — documents the 3-step first-login overlay ✨ NEW
  - Receiving Payments
  - Safety & Security Tips
  - Staying Updated
- Each step has optional pro tips
- Expand All / Collapse All controls
- Accessible from bottom tab bar ("Guide" tab)

### 3.7 Visual Design ✨ NEW

#### 3.7.1 Dark Luxury Theme
- **Dark color scheme** applied globally to the customer app
- Background: deep navy/charcoal tones (HSL: `225 20% 7%`)
- Reduces device power consumption (OLED benefit)
- Provides premium, luxury aesthetic
- All design tokens defined as CSS custom properties in `index.css`

#### 3.7.2 Interactive Feedback ✨ NEW
- **All buttons provide immediate visual feedback** on tap/click
- Global `:active` state: `transform: scale(0.96); opacity: 0.85`
- Applied to all `<button>` elements via CSS
- Ensures responsive feel across all interactive elements

#### 3.7.3 Animation System ✨ NEW
- `scale-in` animation for icons and avatars
- `fade-in` animation for text content
- `slide-up` animation for bottom sheets (beginner guide)
- Staggered delays for sequential reveals (onboarding, splash)

### 3.8 Navigation
- Bottom tab bar: Home, Chat, Contacts, Me, **Guide**
- Mobile-first layout (max-width: md, centered, dark theme)

---

## 4. Admin Panel

### 4.1 Layout
- **Sidebar** (w-60): Navigation, role switcher, user profile, logout
- **Top Bar** (h-14): Global search with categorized results (Customers, Orders, Card Rates), notification bell (badge count), role indicator
- **Main Content:** Full-width, scrollable

### 4.2 Role-Based Access Control (RBAC) ✨ UPDATED

| Feature | Super Admin | Team Lead | Agent |
|---------|:-----------:|:---------:|:-----:|
| Messages | ✅ | ✅ | ✅ |
| **Customers** ✨ NEW | ✅ | ✅ | ✅ |
| Card Rates | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ |
| Customer Guide | ✅ | ✅ | ✅ |
| Admin Guide | ✅ | ✅ | ✅ |
| Team Dashboard | ✅ | ✅ | ❌ |
| Naira Rate | ✅ | ✅ | ❌ |
| **IP & Country** ✨ NEW | ✅ | ❌ | ❌ |
| **Sensitive Words** ✨ NEW | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| API Config | ✅ | ❌ | ❌ |
| SMS Broadcast | ✅ | ❌ | ❌ |

- **"View as" switcher** in sidebar footer for demo/prototyping
- Role stored in React Context (`AdminRoleContext`) with persistence

### 4.3 Messages (`/admin`)
- **3-column layout:** Consulting, Trading, Pending
- Each conversation card shows: alias, last message, time, unread count, status, goodRate, totalValue, tags (VIP, Repeat, New, Priority)
- Click to open chat view

### 4.4 Chat View (`/admin/chat/:id`) ✨ UPDATED
- **Full chat interface** with message history
- **Message bubbles** with sender name labels in small colored font (customer, agent, group members)
- **Sender color coding:** Customer = primary, Agent = accent, Group members = unique colors (orange, emerald, violet)
- System messages styled differently (centered, muted) — only **customer-facing statuses** are shown (Order Created, Order Processing, Success, Pending Payment, Payment Completed); internal agent transitions are suppressed ✨ UPDATED
- Image messages with placeholder thumbnails
- **Responsive tabbed right sidebar** with "Orders" and "Sales Order" (Cardlight) tabs. Panel widths are fluid: left panel 25% (240–336px), right panel 35% (320–504px), chat fills remaining space. Right panel hidden below `xl` breakpoint. ✨ UPDATED

#### 4.4.1 Escalation & Group Chat
- **Escalate button** in chat header opens a popover
- Shows available Team Leads and Super Admins from `adminUsers`
- Click to add member → chat converts to group chat
- **Members bar** above chat shows all participants with remove (X) buttons
- System messages announce joins/leaves ("Sarah Lead has joined the chat")
- Each participant's messages display their name with unique color coding

#### 4.4.2 Order Sidebar (Orders Tab)
- Right panel displays Orders section
- Combines newly created orders (from wizard) with existing mock orders
- Each order card shows: ID, status badge, payout, card count, timestamp
- **Alias as first column** in order list ✨ UPDATED
- Click to expand order details

#### 4.4.3 Sales Order Sidebar (Cardlight Tab) ✨ NEW
- **Multi-step Cardlight lifecycle:**
  1. **Login** — Authenticate with Cardlight credentials
  2. **Create Sale** — Multi-card entry with 35/65 image-to-input split layout
  3. **Order Tracking** — List with Alias as first column
- **Sale Operations:**
  - "Sale" button triggers seller selection modal
  - Modal displays available seller rates and transaction history
  - Mandatory "Choose & Sell" confirmation step
- **Fund Transfers:**
  - Agent-managed using pre-verified bank accounts
  - Customers receive automated read-only status updates
  - Proof screenshots sent to customers
- New orders auto-inherit the alias of the currently selected customer

### 4.5 Order Wizard Modal ✨ UPDATED

**3-step wizard flow:**

#### Step 1: Create Order
- **Chat Images Panel:** Horizontal scrollable gallery (35% width) ✨ UPDATED
  - Drag-and-drop images onto card entries
  - Used images dimmed with checkmark overlay
  - Grip handle for drag affordance
- **Card Entry List** (65% width, up to 15 cards per order) ✨ UPDATED:
  - Card Type dropdown (deduplicated from rates)
  - Card Format selector: Physical / E-Code
  - Currency badge display (auto-set)
  - Rate display (auto-set: ₦X/$1)
  - Denomination input ($)
  - Card code/PIN input
  - **Multi-image support:** Each card entry supports up to 10 image thumbnails in a gallery layout. Hover any thumbnail to remove it. ✨ UPDATED
  - **Compact input layout:** Card Rate, Card Amount, and Card No. arranged in a 3-column grid below the image gallery ✨ UPDATED
  - Drop zone for image attachment (drag from chat images panel)
  - Remove card button (trash icon)
- **Summary bar:** Card count, total face value ($)
- Add Card button (max 15)

#### Step 2: Verify
- Verify All Cards button for batch verification
- Individual card verification with shield icon
- Simulated API verification with realistic timing
- Failed/Expired card handling with removal options
- Progress bar: "X of Y cards verified"

#### Step 3: Initiate Transfer
- Bank account selection from customer's verified accounts
- Payout summary: total face value, naira total, rate
- "Initiate Transfer" button

#### Confirmation Screen
- Success animation with checkmark icon
- Order ID, card count, total face value, total payout
- Transfer details: bank, account, holder name, amount, timestamp
- Card breakdown with individual payout amounts
- "Done" button — order added to sidebar orders list

### 4.6 Customer Management (`/admin/customers`) ✨ NEW
- **Full customer table:** Alias, Status (consulting/trading/pending), Tags (VIP/Repeat), Good Rate, Total Value, Last Active, Total Orders, Joined Date
- **Status color coding:** Consulting = amber, Trading = emerald, Pending = blue
- **Search bar** to filter by alias
- **Profile modal** (eye icon) showing detailed customer information
- Customer count displayed in header
- Accessible to all roles

### 4.7 Card Rates (`/admin/card-rates`)
- Full table with columns: Card Type, Format (Physical/E-Code badge), Currency, Buy Rate (₦), Sell Rate (₦), Last Updated
- Format badges: E-Code = primary color pill, Physical = muted pill
- Search bar, refresh button, auto-refresh every 60s

### 4.8 Orders (`/admin/orders`) ✨ UPDATED
- Orders table: **Alias** (first column) ✨ UPDATED, Order ID, Card Type, Denomination, Amount, Naira Rate, Unit Price, Status, Created
- Status badges: Settled, Trading, Pending Payment
- Search by order ID or customer alias

### 4.9 Naira Rate (`/admin/naira-rate`) — Super Admin + Team Lead ✨ UPDATED
- Current system rate display (₦1,580)
- Update form: new rate + reason
- Rate change history table: timestamp, old/new rate, changed by, reason

### 4.10 User Management (`/admin/users`) — Super Admin Only
- Admin users table: Name, Email, Role, Status, Last Login
- Roles: Super Admin, Team Lead, Agent
- Status: Active, Offline

### 4.11 Team Dashboard (`/admin/team`) — Team Lead + Super Admin
- Team performance metrics
- Agent activity monitoring

### 4.12 IP & Country Restrictions (`/admin/ip-restrictions`) — Super Admin Only ✨ NEW
- **Two-section management page:**
  - **Country Rules:** Country name, country code, Allow/Block mode, enabled toggle
  - **IP Address Rules:** CIDR notation input, descriptive label, Allow/Block mode, enabled toggle
- Each rule has an individual on/off toggle (without deletion)
- Add/delete rules with confirmation
- **Audit log** tracking all changes with timestamps and admin identity
- Toast notifications for all actions

### 4.13 Sensitive Words Filter (`/admin/sensitive-words`) — Super Admin Only ✨ NEW
- **Three word categories:**
  - **Profanity** — destructive color coding
  - **Competitor** — warning color coding
  - **PII Pattern** — primary color coding
- **Two detection modes:**
  - **Exact** — whole word match
  - **Partial** — substring match
- **Management features:**
  - Add new words with category and detection mode selection
  - Edit existing words inline (pencil icon)
  - Delete words (trash icon)
  - Search bar and category filter
  - **Bulk import** from .txt file (one word per line) via Upload button
- Toast notifications for all CRUD operations

### 4.14 API Config (`/admin/api-config`) — Super Admin Only
- Merchant API endpoint configuration
- Webhook callback URL settings
- Connection testing

### 4.15 SMS Broadcast (`/admin/broadcast`) — Super Admin Only
- Message composer
- Audience selection
- Send functionality

### 4.16 Admin User Guide (`/admin/guide`) ✨ UPDATED
- **15 expandable guide sections** (increased from 12) with numbered step-by-step instructions
- **New sections added:**
  - **Sales Order (Cardlight) Tab** — Cardlight login, sale creation, seller selection modal, Choose & Sell flow ✨ NEW
  - **Customer Management** — browsing customers, search, profile modal, tag prioritization ✨ NEW
  - **IP & Country Restrictions** — country/IP rules, Allow/Block modes, audit log ✨ NEW
  - **Sensitive Words Filter** — categories, detection modes, bulk import, CRUD operations ✨ NEW
- **Updated sections:**
  - Creating a Trade Order — reflects tabbed sidebar (504px), 35/65 image-to-input split, alias auto-inheritance
  - Managing Orders — Alias as first column
  - Role-Based Access — includes Customers, IP & Country, Sensitive Words in access matrix
  - Global Search — categorized results (Customers, Orders, Card Rates)
- Each section tagged with applicable roles
- Pro tips with accent-colored callouts
- Quick-nav buttons for jumping to sections

### 4.17 Customer Guide Reference (`/admin/customer-guide`) ✨ UPDATED
- **10 expandable guide sections** written from the agent's perspective
- **New/updated topics:**
  - Getting Started — splash, onboarding, Apple/Google/OTP sign-in, invite code, alias
  - Customer Home Screen — modular grid, provider profile toggle
  - How Customers Sell Gift Cards — agent perspective with tips
  - Customer Chat Interface — inline image/emoji, visual feedback
  - Finding Agents — status indicators, search
  - Beginner's Guide (First Login) — 3-step overlay documentation ✨ NEW
  - Customer Profile (Me Tab) — alias-centric
  - Customer Payments — payout flow
  - Customer Safety Tips — agent guidance for reassuring customers
  - App Design & Dark Theme — dark luxury theme, visual feedback, iOS layout ✨ NEW
- Accessible from sidebar ("Customer Guide" nav item, visible to all roles)

---

## 5. Data Model (Mock)

### 5.1 Card Rates
```typescript
{
  id: number;
  cardType: string;       // "iTunes US", "Amazon UK", etc.
  currency: string;       // "USD", "GBP"
  cardFormat: "Physical" | "E-Code";
  buyRate: number;        // Naira per $1
  sellRate: number;       // Naira per $1
  lastUpdated: string;    // "2 min ago"
}
```

### 5.2 Conversations
```typescript
{
  id: string;
  alias: string;          // "A7X3KP" (6-char alphanumeric)
  lastMessage: string;
  time: string;
  unread: number;
  status: "consulting" | "trading" | "pending";
  goodRate: number;       // Customer rating %
  totalValue: string;     // "₦450,000"
  tags: string[];         // ["VIP", "Repeat"]
}
```

### 5.3 Chat Messages
```typescript
{
  id: number;
  sender: "customer" | "agent" | "system";
  senderName?: string;    // for group chat
  text: string;
  time: string;
  image?: boolean;
  isOrder?: boolean;
}
```

### 5.4 Orders
```typescript
{
  id: string;             // "ORD-20260318-001"
  customer: string;       // alias (displayed as first column)
  cardType: string;
  denomination: string;
  amount: number;
  nairaRate: number;
  unitPrice: number;
  status: "settled" | "trading" | "pending_payment";
  created: string;
}
```

### 5.5 Completed Orders
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

### 5.6 Sensitive Words ✨ NEW
```typescript
{
  id: string;
  word: string;
  category: "profanity" | "competitor" | "pii";
  mode: "exact" | "partial";
}
```

### 5.7 IP/Country Rules ✨ NEW
```typescript
{
  id: string;
  country?: string;       // Country rules
  code?: string;
  cidr?: string;          // IP rules
  label?: string;
  mode: "allow" | "block";
  enabled: boolean;
}
```

### 5.8 Other Models
- **Bank Accounts:** id, bankName, accountNumber, holderName, verified
- **Transactions:** id, orderId, amount, status, date, bank
- **Admin Users:** id, name, email, role, status, lastLogin
- **Naira Rate History:** timestamp, oldRate, newRate, changedBy, reason
- **Customer Contacts:** id, name, status, isAgent, lastSeen

---

## 6. Design System

### 6.1 Tokens (HSL-based in index.css) ✨ UPDATED
- `--background`, `--foreground` — base surfaces (**dark theme**: `225 20% 7%`)
- `--card`, `--card-foreground` — elevated surfaces
- `--primary`, `--primary-foreground` — brand actions
- `--accent`, `--accent-foreground` — highlight/CTA (green tones)
- `--muted`, `--muted-foreground` — subdued content
- `--destructive` — error/danger states
- `--success` — verification/completion states
- `--warning` — pending/processing states
- `--sidebar-*` — admin sidebar theming

### 6.2 Typography
- `font-heading` — display/headings
- System font stack for body text
- Consistent sizing: text-xs, text-sm, text-base

### 6.3 Components (shadcn/ui)
- Button, Input, Badge, Card, Dialog, Popover, Select, RadioGroup, Label, Tabs, Toast, Tooltip, Switch, Table, etc.
- Custom status badges, tab bar items, sidebar items

### 6.4 Interactive Feedback ✨ NEW
- Global `button:active` style: `transform: scale(0.96); opacity: 0.85`
- Smooth transitions on all interactive elements
- Scale-in, fade-in, and slide-up animations

---

## 7. Changelog

### v2 → v3 (Current) ✨

| Change | Description |
|--------|-------------|
| **Splash Screen** | 5-second animated intro with trust pillars (safety, speed, service, volume) |
| **Onboarding Slides** | Up to 5 swipeable pre-registration pages emphasizing platform trust |
| **Email OTP Auth** | Replaced phone/password with Apple/Google/Email OTP sign-in, invite codes, alias confirmation |
| **Dark Luxury Theme** | Customer app dark color scheme for premium feel and OLED power savings |
| **Modular Home Grid** | iOS-inspired 4-tile core actions (Sell, Rates, Chat, Guide) replacing banners/services |
| **Provider Profile** | Tappable trust profile with KYB verification, ratings, stats, compliance marks |
| **Beginner's Guide** | 3-step first-login overlay: Connect Agent → Start Chat → Complete Trade |
| **Interactive Feedback** | Global button scale-down animation on tap for immediate visual response |
| **Customer Management** | New admin page: customer table with alias, status, tags, profile modal |
| **IP & Country Restrictions** | New admin page: country/IP allow/block rules with audit logging |
| **Sensitive Words Filter** | New admin page: profanity/competitor/PII filtering with bulk import |
| **Sales Order (Cardlight)** | New sidebar tab: Cardlight login, sale creation, seller selection, Choose & Sell |
| **Order List Updates** | Alias as first column, Sale operations with seller selection modal |
| **Chat Input Streamlined** | Image and emoji icons inline beside send button |
| **Updated User Guides** | All 3 guides (Customer, Admin, Admin-Customer) updated to reflect all v3 changes |
| **Naira Rate Access** | Team Lead now has access (previously Super Admin only) |
| **Multi-Image Card Entries** | Each card entry in the order wizard supports up to 10 image thumbnails with hover-to-remove |
| **Customer-Facing Status Only** | Chat system messages now only show customer-relevant status changes; internal agent transitions are suppressed |
| **Responsive Admin Panels** | Messages 3-column layout uses fluid percentage widths with min/max constraints instead of fixed pixel values |

### v1 → v2

| Change | Description |
|--------|-------------|
| **Card Format** | Added Physical/E-Code format to card rates, admin table, customer home, order wizard |
| **Currency & Rate in Wizard** | Order wizard shows currency badge and auto-calculated rate per card |
| **Escalation / Group Chat** | Agents can escalate chats by adding Team Leads/Super Admins |
| **Sender Names on Messages** | Group chat messages display sender name with unique color coding |
| **Failed Card Deletion** | Failed/expired cards can be removed in verification step |
| **Transfer Confirmation** | Post-transfer confirmation screen with full order summary |
| **Orders Sidebar** | Chat view right panel shows order history with expandable details |
| **Chat Image Drag & Drop** | Create Order step includes draggable chat images for card entries |
| **Admin User Guide** | 12-section step-by-step guide for all admin features |
| **Customer User Guide** | 10-section guide for all customer app features |

---

## 8. Known Limitations

- All data is mock — no backend, no persistence, no real API calls
- Verification is simulated with random outcomes and delays
- No real authentication or session management
- No real-time messaging (WebSocket, etc.)
- No push notifications
- Bank transfers are simulated — no payment gateway integration
- Search is client-side filtering only
- Role switching is for demo purposes only (no real auth-based RBAC)
- Beginner guide shows on every home page visit (no persistence of "seen" state)
- Cardlight integration is UI-only (no real Cardlight API)

---

## 9. Future Considerations (for Production)

1. **Backend:** Lovable Cloud (Supabase) for database, auth, edge functions
2. **Real-time:** WebSocket/Supabase Realtime for live chat
3. **Card Verification:** Integration with actual merchant APIs
4. **Cardlight API:** Real Cardlight integration for card selling marketplace
5. **Payments:** Bank transfer API integration (Paystack, Flutterwave)
6. **Notifications:** Push notifications for trade updates
7. **Analytics:** Admin dashboards with real metrics (Recharts already installed)
8. **File Upload:** Real image upload/storage for card photos
9. **Audit Logging:** Server-side audit trail for rate changes, orders, transfers
10. **Customer KYC:** Identity verification for compliance
11. **Multi-language:** i18n support for broader reach
12. **Beginner Guide Persistence:** Store "guide seen" state in database per user
13. **IP Geolocation:** Real GeoIP integration for country-based access control
14. **Content Moderation:** Server-side sensitive word filtering in real-time chat
