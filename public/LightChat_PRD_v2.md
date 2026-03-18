# LightChat — Product Requirements Document (PRD) v2.0

**Version:** 2.0 (Updated)  
**Date:** March 18, 2026  
**Status:** Interactive Prototype (Frontend Only — Mock Data)  
**Platform:** React + Vite + Tailwind CSS + TypeScript  

---

## 1. Executive Summary

LightChat is a real-time gift card trading platform with two interfaces: a **Customer App** (mobile-first) and an **Admin Panel** (desktop). The platform enables customers to sell gift cards to agents who verify, price, and process payouts — all through an integrated chat-based workflow.

This document reflects the **updated state** of the prototype after iterative development, including escalation/group chat, drag-and-drop image attachment, card format support (Physical/E-Code), transfer confirmation flows, order tracking sidebars, and comprehensive user guides.

---

## 2. Architecture Overview

### 2.1 Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS with semantic design tokens (HSL), shadcn/ui components
- **Routing:** React Router DOM v6
- **State:** React Context (AdminRoleContext for RBAC), local component state
- **Data:** Mock data layer (`src/data/mock.ts`) — no backend connected

### 2.2 Application Structure
```
/                        → Landing page (app selector)
/customer/*              → Customer App (mobile layout, max-w-md)
/admin/*                 → Admin Panel (desktop layout, sidebar + main)
```

---

## 3. Customer App

### 3.1 Authentication (`/customer/auth`)
- Login / Sign-up screen
- Phone/email + password entry
- OTP verification (mock)

### 3.2 Home Screen (`/customer`)
- **Promotional Banners:** Horizontally scrollable cards (Sell iTunes, Refer & Earn, Steam Cards)
- **Services Grid:** Sell Cards, Live Rates, Rewards (3-column grid)
- **Live Card Prices:** Real-time card rate list with:
  - Card type name
  - **Format badge** (Physical / E-Code) — color-coded
  - Currency indicator (USD, GBP)
  - Buy rate per $1 in Naira
  - Last updated timestamp
  - Auto-refresh every 60 seconds
- **Search Bar:** Filter cards by name
- **Invite CTA:** Referral program banner with share button

### 3.3 Chat (`/customer/chat`)
- Conversation list with active/past chats
- Full chat view with message input
- Image attachment support for card photos
- System messages for order confirmations
- **Group chat support:** When escalated, shows sender names on messages

### 3.4 Contacts (`/customer/contacts`)
- Available agents list with online/away/offline status
- Agent identification badges
- Tap to start new conversation

### 3.5 Profile (`/customer/me`)
- Account information display
- Registered bank accounts
- Transaction history
- VIP/Repeat customer badges

### 3.6 User Guide (`/customer/guide`) ✨ NEW
- 10 expandable guide sections with step-by-step instructions
- Topics: Getting Started, Home Screen, Selling Cards, Chat, Contacts, Rates, Profile, Payments, Safety, Notifications
- Each step has optional pro tips
- Expand All / Collapse All controls
- Accessible from bottom tab bar ("Guide" tab)

### 3.7 Navigation
- Bottom tab bar: Home, Chat, Contacts, Me, **Guide**
- Mobile-first layout (max-width: md, centered)

---

## 4. Admin Panel

### 4.1 Layout
- **Sidebar** (w-60): Navigation, role switcher, user profile
- **Top Bar** (h-14): Global search with recent/quick results, notification bell (badge count), role indicator
- **Main Content:** Full-width, scrollable

### 4.2 Role-Based Access Control (RBAC)

| Feature | Super Admin | Team Lead | Agent |
|---------|:-----------:|:---------:|:-----:|
| Messages | ✅ | ✅ | ✅ |
| Card Rates | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ |
| User Guide | ✅ | ✅ | ✅ |
| Team Dashboard | ✅ | ✅ | ❌ |
| Naira Rate | ✅ | ❌ | ❌ |
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
- System messages styled differently (centered, muted)
- Image messages with placeholder thumbnails

#### 4.4.1 Escalation & Group Chat ✨ NEW
- **Escalate button** in chat header opens a popover
- Shows available Team Leads and Super Admins from `adminUsers`
- Click to add member → chat converts to group chat
- **Members bar** above chat shows all participants with remove (X) buttons
- System messages announce joins/leaves ("Sarah Lead has joined the chat")
- Each participant's messages display their name with unique color coding

#### 4.4.2 Order Sidebar ✨ NEW
- **Right panel** displays Orders section
- Combines newly created orders (from wizard) with existing mock orders
- Each order card shows: ID, status badge (processing/completed/failed), payout, card count, timestamp
- Click to expand order details
- **Status styling:** Processing = warning (yellow), Completed = success (green), Failed = destructive (red)

### 4.5 Order Wizard Modal ✨ UPDATED

**3-step wizard flow:**

#### Step 1: Create Order
- **Chat Images Panel:** Horizontal scrollable gallery of images from conversation
  - Drag-and-drop images onto card entries
  - Used images dimmed with checkmark overlay
  - Grip handle for drag affordance
- **Card Entry List** (up to 15 cards per order):
  - **Card Type** dropdown (deduplicated from rates: iTunes US, Amazon US, Steam US, etc.)
  - **Card Format** selector: Physical / E-Code ✨ NEW
  - **Currency** badge display (auto-set from card type) ✨ NEW
  - **Rate display** (auto-set: ₦X/$1) ✨ NEW
  - Denomination input ($)
  - Card code/PIN input
  - Drop zone for image attachment (highlights on drag-over with ring effect)
  - Attached image label with detach (X) button
  - Remove card button (trash icon)
- **Summary bar:** Card count, total face value ($)
- Add Card button (max 15)

#### Step 2: Verify
- **Verify All Cards** button for batch verification
- Individual card verification with shield icon
- **Simulated API verification** with realistic timing:
  - Pending → Submitted → Processing → Verified/Failed/Expired
  - ~80% verified, ~15% failed, ~5% expired (random)
  - Status messages: "API checking card validity...", "Card verified via webhook callback", etc.
- **Failed/Expired card handling:** ✨ NEW
  - Trash icon to delete failed cards inline
  - "Remove This Card" button on failed entries
  - Must remove all failed cards OR re-verify before proceeding
- Progress: "X of Y cards verified" with progress bar
- Status badges with icons and colors per state

#### Step 3: Initiate Transfer
- **Bank account selection** from customer's verified accounts
- Payout summary: total face value, naira total, rate
- Transfer amount (editable)
- "Initiate Transfer" button

#### Confirmation Screen ✨ NEW
- Success animation with checkmark icon
- Order ID display
- **Order Details:** card count, total face value, total payout
- **Transfer Details:** bank, account, holder name, amount, timestamp
- **Card Breakdown:** list of all verified cards with individual payout amounts
- "Processing" status badge
- "Done" button to close
- Order automatically added to sidebar orders list

### 4.6 Card Rates (`/admin/card-rates`) ✨ UPDATED
- Full table with columns: Card Type, **Format** (Physical/E-Code badge), Currency, Buy Rate (₦), Sell Rate (₦), Last Updated
- **Format badges:** E-Code = primary color pill, Physical = muted pill
- Search bar (filter by card type or currency)
- Refresh button
- Auto-refresh every 60 seconds note

### 4.7 Orders (`/admin/orders`)
- Orders table: Order ID, Customer, Card Type, Denomination, Amount, Naira Rate, Unit Price, Status, Created
- Status badges: Settled, Trading, Pending Payment
- Search by order ID or customer

### 4.8 Naira Rate (`/admin/naira-rate`) — Super Admin Only
- Current system rate display (₦1,580)
- Update form: new rate + reason
- Rate change history table: timestamp, old/new rate, changed by, reason

### 4.9 User Management (`/admin/users`) — Super Admin Only
- Admin users table: Name, Email, Role, Status, Last Login
- Roles: Super Admin, Team Lead, Agent
- Status: Active, Offline

### 4.10 Team Dashboard (`/admin/team`) — Team Lead + Super Admin
- Team performance metrics
- Agent activity monitoring

### 4.11 API Config (`/admin/api-config`) — Super Admin Only
- Merchant API endpoint configuration
- Webhook callback URL settings
- Connection testing

### 4.12 SMS Broadcast (`/admin/broadcast`) — Super Admin Only
- Message composer
- Audience selection
- Send functionality

### 4.13 Admin User Guide (`/admin/guide`) ✨ NEW
- 12 expandable guide sections with numbered step-by-step instructions
- **Topics:** Messages, Escalation & Group Chat, Creating Orders (full wizard walkthrough), Card Rates, Orders, Naira Rate, User Management, Team Dashboard, API Config, SMS Broadcast, Role-Based Access, Global Search
- Each section tagged with applicable roles (All Roles / Super Admin / Team Lead)
- Pro tips with accent-colored callouts
- Quick-nav buttons for jumping to sections
- Expand All / Collapse All controls
- Accessible from sidebar ("User Guide" nav item, visible to all roles)

---

## 5. Data Model (Mock)

### 5.1 Card Rates ✨ UPDATED
```typescript
{
  id: number;
  cardType: string;       // "iTunes US", "Amazon UK", etc.
  currency: string;       // "USD", "GBP"
  cardFormat: "Physical" | "E-Code";  // ✨ NEW
  buyRate: number;        // Naira per $1
  sellRate: number;       // Naira per $1
  lastUpdated: string;    // "2 min ago"
}
```

### 5.2 Conversations
```typescript
{
  id: string;
  alias: string;          // "User-A7X3"
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
  senderName?: string;    // ✨ NEW — for group chat
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
  customer: string;
  cardType: string;
  denomination: string;
  amount: number;
  nairaRate: number;
  unitPrice: number;
  status: "settled" | "trading" | "pending_payment";
  created: string;
}
```

### 5.5 Completed Orders ✨ NEW
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

### 5.6 Other Models
- **Bank Accounts:** id, bankName, accountNumber, holderName, verified
- **Transactions:** id, orderId, amount, status, date, bank
- **Admin Users:** id, name, email, role, status, lastLogin
- **Naira Rate History:** timestamp, oldRate, newRate, changedBy, reason
- **Promo Banners:** id, title, subtitle, color
- **Customer Contacts:** id, name, status, isAgent, lastSeen

---

## 6. Design System

### 6.1 Tokens (HSL-based in index.css)
- `--background`, `--foreground` — base surfaces
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
- Button, Input, Badge, Card, Dialog, Popover, Select, RadioGroup, Label, Tabs, Toast, Tooltip, etc.
- Custom status badges, tab bar items, sidebar items

---

## 7. Changelog (v1 → v2)

| Change | Description |
|--------|-------------|
| **Card Format** | Added Physical/E-Code format to card rates data, admin table, customer home, and order wizard |
| **Currency & Rate in Wizard** | Order wizard now shows currency badge and auto-calculated rate per card |
| **Escalation / Group Chat** | Agents can escalate chats by adding Team Leads/Super Admins; converts to group chat with member management |
| **Sender Names on Messages** | Group chat messages display sender name above bubble with unique color coding |
| **Failed Card Deletion** | Failed/expired cards can be removed directly in the verification step |
| **Transfer Confirmation** | Post-transfer confirmation screen with full order summary, bank details, and card breakdown |
| **Orders Sidebar** | Chat view right panel shows order history with status badges and expandable details |
| **Chat Image Drag & Drop** | Create Order step includes draggable chat images that attach to specific card entries |
| **Admin User Guide** | 12-section step-by-step guide for all admin features, role-tagged, with pro tips |
| **Customer User Guide** | 10-section step-by-step guide for all customer app features with safety tips |
| **Guide Navigation** | Both guides accessible from primary navigation (sidebar / tab bar) |

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

---

## 9. Future Considerations (for Production)

1. **Backend:** Lovable Cloud (Supabase) for database, auth, edge functions
2. **Real-time:** WebSocket/Supabase Realtime for live chat
3. **Card Verification:** Integration with actual merchant APIs
4. **Payments:** Bank transfer API integration (Paystack, Flutterwave)
5. **Notifications:** Push notifications for trade updates
6. **Analytics:** Admin dashboards with real metrics (Recharts already installed)
7. **File Upload:** Real image upload/storage for card photos
8. **Audit Logging:** Server-side audit trail for rate changes, orders, transfers
9. **Customer KYC:** Identity verification for compliance
10. **Multi-language:** i18n support for broader reach
