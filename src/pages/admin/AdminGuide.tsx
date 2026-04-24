import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, CreditCard, FileText, DollarSign, Users, BarChart3, Globe, Send, Shield, Search, BookOpen, CheckCircle2, ArrowRight, KeyRound, MessagesSquare } from "lucide-react";

interface GuideStep {
  text: string;
  tip?: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: typeof MessageSquare;
  description: string;
  roles: string[];
  steps: GuideStep[];
}

const guides: GuideSection[] = [
  {
    id: "messages",
    title: "Managing Customer Conversations",
    icon: MessageSquare,
    description: "Handle incoming customer messages, manage chat statuses, and communicate effectively.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Messages' from the sidebar — this is the main dashboard." },
      { text: "Conversations are organized into 2 tabs: Consulting (new inquiries, pending_sale, pending, payment_completed, order_cancelled) and Trading (in_trade, pending_payment, success).", tip: "Pending Payment is now an inline sub-status within the Trading tab, not a separate column." },
      { text: "Click on any conversation to open the full chat view with a responsive tabbed sidebar (Orders + Sales Order). The left panel (25%), chat area, and right panel (35%) scale fluidly across screen sizes." },
      { text: "Type your response in the message input at the bottom and press Send or hit Enter." },
      { text: "Use the status dropdown at the top of a chat to move conversations between Consulting and Trading. Sub-statuses (e.g., Pending Payment) are auto-managed by the order workflow.", tip: "Conversations move tabs automatically based on the order state machine." },
      { text: "Channel badges next to each conversation indicate the source: TRTC (in-app) or WhatsApp Business. Customer WhatsApp numbers are visible to authorized roles." },
      { text: "Only customer-facing status changes appear as system messages in chat (e.g., Order Created, Order Processing, Success, Payment Completed). Internal agent transitions are silent.", tip: "This keeps the customer's chat clean — they only see statuses relevant to them." },
      { text: "Look for unread count badges on each conversation card to prioritize responses. VIP and Repeat customer tags are shown — prioritize these customers." },
      { text: "Reassign a customer to another agent from the chat header (Super Admin and Team Lead only). The Reassign control lives in the dedicated chat view header." },
      { text: "Super Admin and Team Lead: Use the 'Fund Deduction/Addition' button next to 'Create Order' to add or deduct funds from the customer's wallet. The modal shows current wallet balance and transaction history.", tip: "All fund adjustments require a 6-digit Transaction PIN before commit, and are recorded for audit." },
    ],
  },
  {
    id: "escalate",
    title: "Escalating a Chat to a Group",
    icon: Shield,
    description: "Add team leads or super admins to a conversation for assistance.",
    roles: ["All Roles"],
    steps: [
      { text: "Open the chat you want to escalate by clicking on a conversation." },
      { text: "Click the 'Escalate' button in the chat header toolbar." },
      { text: "A dropdown will appear showing available Team Leads and Super Admins." },
      { text: "Click on a team member to add them to the chat — the conversation becomes a group chat." },
      { text: "A system message will appear confirming the new member has joined." },
      { text: "The 'Members' bar above the chat shows all participants — you can remove members by clicking the X next to their name.", tip: "Escalation is useful when a customer's trade needs supervisor approval." },
      { text: "Each participant's messages will show their name in a colored label above the message bubble." },
    ],
  },
  {
    id: "create-order",
    title: "Creating a Trade Order",
    icon: FileText,
    description: "Process a gift card trade using the tabbed sidebar workflow.",
    roles: ["All Roles"],
    steps: [
      { text: "Open a customer's chat — the 504px tabbed sidebar on the right has 'Orders' and 'Sales Order' (Cardlight) tabs." },
      { text: "Click 'Create Order' to start. New orders automatically inherit the alias of the currently selected customer." },
      { text: "Step 1 — Create Order: The panel uses a 35/65 split — chat images on the left, card entry form on the right." },
      { text: "Drag chat images and drop them onto card entries to attach them (used images are dimmed with a checkmark). Each card entry supports multiple images (up to 10) — hover any thumbnail to remove it." },
      { text: "For each card, select Card Type, Format (Physical/E-Code), enter Denomination (editable, pre-filled with system default). Currency and rate auto-populate." },
      { text: "Below the images, Card Rate, Card Amount, and Card No. are arranged in a compact 3-column grid for quick entry." },
      { text: "Enter card codes/PINs. Click 'Add Card' for more cards (up to 15 per order)." },
      { text: "Step 2 — Verify: Click 'Verify All Cards' or verify individually. Failed/Expired cards can be removed." },
      { text: "Step 3 — Initiate Transfer: Select the customer's bank account, review payout amount, and click 'Initiate Transfer'.", tip: "All remaining cards must be verified before proceeding to transfer." },
      { text: "A confirmation screen shows Order ID, payout summary, bank details, and card breakdown. Click 'Done'." },
    ],
  },
  {
    id: "sales-order",
    title: "Sales Order (Cardlight) Tab",
    icon: FileText,
    description: "Manage Cardlight integration for selling verified cards.",
    roles: ["All Roles"],
    steps: [
      { text: "In the chat sidebar, switch to the 'Sales Order' tab to access the Cardlight workflow." },
      { text: "Step 1 — Login: Authenticate with Cardlight credentials to access the selling marketplace." },
      { text: "Step 2 — Create Sale: Enter card details with multi-card support using the 35/65 image-to-input split layout." },
      { text: "The order list displays 'Alias' as the first column, followed by card details, status, and amounts." },
      { text: "Click 'Sale' on any order to open the seller selection modal — displaying available rates and transaction history." },
      { text: "Select a seller and click 'Choose & Sell' to confirm the sale. This is a mandatory confirmation step.", tip: "Always compare seller rates before confirming — different sellers may offer different prices." },
      { text: "Final fund transfers are agent-managed using pre-verified bank accounts. Customers receive automated read-only status updates and proof screenshots." },
    ],
  },
  {
    id: "customers",
    title: "Customer Management",
    icon: Users,
    description: "View and manage all customer accounts, profiles, and activity.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Customers' from the sidebar." },
      { text: "Browse all customers in a table showing Alias, Status, Tags (VIP/Repeat), Good Rate, Total Value, Last Active, and Total Orders." },
      { text: "Use the search bar to filter by alias." },
      { text: "Click the eye icon on any customer row to view their detailed profile in a modal." },
      { text: "Customer profiles show alias, join date, order count, tags, and recent activity.", tip: "Use tags (VIP, Repeat) to prioritize high-value customers." },
    ],
  },
  {
    id: "card-rates",
    title: "Viewing & Searching Card Rates",
    icon: CreditCard,
    description: "Monitor live gift card buy and sell rates with granular filtering.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Card Rates' from the sidebar." },
      { text: "The header displays the current system Naira Rate and Price Control percentage." },
      { text: "The table shows all supported cards with Card Type, Format (Physical/E-Code), Currency, Buy Rate, Sell Rate, and Last Updated." },
      { text: "Use the two independent search boxes to filter: one for Card Type (e.g., 'iTunes') and one for Currency (e.g., 'GBP'). Both filters work simultaneously.", tip: "The dual search lets you quickly find specific combinations like 'Steam' cards in 'USD'." },
      { text: "Rate formulas: Sell Rate = Naira Rate × Buy Rate. Buy Rate = Sell Rate × Price Control." },
      { text: "Click 'Refresh' to manually refresh rates — rates also auto-refresh every 60 seconds.", tip: "E-Code rates are typically higher than Physical card rates." },
      { text: "Super Admin and Team Lead: Use the 'Price Push' button to broadcast current popular card prices (Apple, Steam, Razer Gold) to all platform customers." },
    ],
  },
  {
    id: "orders",
    title: "Managing Orders",
    icon: FileText,
    description: "View, search, and track all trade orders and their statuses.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Orders' from the sidebar." },
      { text: "The order list shows Alias as the first column, followed by Order ID, Card Type, Denomination, Amount, Rate, Unit Price, Status, and Created time." },
      { text: "Use the search bar to find orders by ID or customer alias." },
      { text: "Order statuses include: Settled (complete), Trading (in progress), and Pending Payment (awaiting transfer)." },
      { text: "Orders created from the chat wizard also appear in the chat view's right sidebar for quick reference." },
    ],
  },
  {
    id: "naira-rate",
    title: "Setting the System Naira Rate & Price Control",
    icon: DollarSign,
    description: "Update the global NGN/CNY rate and price control used for all order calculations.",
    roles: ["Super Admin", "Team Lead"],
    steps: [
      { text: "Navigate to 'Naira Rate' from the sidebar (Super Admin and Team Lead only)." },
      { text: "View the current system rate, denomination, and price control percentage displayed at the top." },
      { text: "Click 'Update' to enter editing mode. Three editable fields appear: New Rate (NGN per CNY), New Denomination, and New Price Control (%)." },
      { text: "Enter a new rate — must be between 99 and 299. Values outside this range will be rejected.", tip: "The rate is validated strictly: below 99 or above 299 triggers an error toast." },
      { text: "Enter a new Price Control percentage — must be between 1.00% and 100.00%." },
      { text: "Provide a reason for the change (e.g., 'Market adjustment', 'Daily update') for audit purposes." },
      { text: "Click 'Save & Broadcast' — the change is immediately broadcast to all active sessions and the Customer App." },
      { text: "A broadcasting indicator shows progress: 'Broadcasting...' then 'All sessions updated'." },
      { text: "Scroll down to see the rate change history with timestamps, old/new values, who made the change, and the reason.", tip: "All new orders will use the updated values. Existing orders retain their locked-in rate." },
    ],
  },
  {
    id: "users",
    title: "Managing Users",
    icon: Users,
    description: "View and manage admin team members, their roles, and statuses.",
    roles: ["Super Admin"],
    steps: [
      { text: "Navigate to 'User Management' from the sidebar (Super Admin only)." },
      { text: "View all admin users with their Name, Email, Role, Status, and Last Login." },
      { text: "Roles include: Super Admin (full access), Team Lead (team oversight), Agent (chat & orders), and Finance (wallet & rates)." },
      { text: "User statuses are shown as Active (online) or Offline." },
      { text: "Use this page to monitor team activity and identify who is currently available." },
    ],
  },
  {
    id: "team",
    title: "Team Dashboard",
    icon: BarChart3,
    description: "Monitor team performance metrics and agent activity in real time.",
    roles: ["Team Lead", "Super Admin"],
    steps: [
      { text: "Navigate to 'Team Dashboard' from the sidebar (Team Lead and Super Admin only)." },
      { text: "The top stats grid shows four KPIs: Active Chats, Online Agents, Orders Today, and Avg Response time." },
      { text: "The Agent Performance table lists each agent with their TTV (Total Trade Volume), TMTV (Total Merchant Trade Volume), active chats, and resolution rate." },
      { text: "TTV and TMTV are now grouped in a single column for compact comparison — the badge color indicates relative performance.", tip: "Use this single-column view to quickly spot agents whose TMTV diverges from TTV." },
      { text: "The Active Escalations panel shows ongoing escalated chats requiring supervisor attention, with the originating agent and the customer alias." },
      { text: "Click any agent row to drill into their full chat history and order log.", tip: "Check the dashboard at the start and end of each shift for best oversight." },
    ],
  },
  {
    id: "volume-ranking",
    title: "Volume Ranking (Bi-Weekly Leaderboard)",
    icon: BarChart3,
    description: "View customer trading rankings by bi-weekly cycle.",
    roles: ["Super Admin", "Team Lead", "Agent"],
    steps: [
      { text: "Navigate to 'Volume Ranking' from the sidebar." },
      { text: "Use the bi-weekly period selector (24 entries covering the past year) to choose H1 (1st–15th) or H2 (16th–end of month) for any month." },
      { text: "Combine the period filter with From/To DateTimePicker filters for granular slicing within the selected cycle." },
      { text: "The leaderboard ranks customers by trading volume for the period, with achievement icons for the top 3 (gold, silver, bronze)." },
      { text: "Six reward tiers are applied based on volume thresholds — see the Rewards Management section for the exact payout amounts." },
      { text: "Click 'Export CSV' to download the current filtered leaderboard for external reporting.", tip: "Bi-weekly cycles align with the Rewards distribution flow — distribute rewards only after all orders for that period are settled." },
    ],
  },
  {
    id: "team-chat",
    title: "Team Chat & Direct Messages",
    icon: MessagesSquare,
    description: "Internal collaboration channels and 1:1 DMs between admins.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Team Chat' from the sidebar to access internal collaboration channels." },
      { text: "Use the channel list on the left to switch between team channels and 1:1 direct messages with other admins." },
      { text: "Message bubbles are color-coded by sender role (Super Admin, Team Lead, Agent, Finance) for at-a-glance attribution." },
      { text: "System notifications appear automatically for key events: customer reassignments, escalations, and reward distributions." },
      { text: "Unread badges on the channel list and sidebar item indicate new messages.", tip: "Use Team Chat for sensitive coordination — it is not visible to customers." },
    ],
  },
  {
    id: "transaction-pin",
    title: "Transaction PIN (Sensitive Operations)",
    icon: KeyRound,
    description: "Configure and use the 6-digit PIN required for sensitive actions.",
    roles: ["All Roles"],
    steps: [
      { text: "Sensitive operations — fund adjustments, ranking reward distribution, and other financial actions — require a 6-digit Transaction PIN." },
      { text: "Set or change your PIN from your Admin Profile page under the Transaction PIN section." },
      { text: "Super Admin: You can configure the platform-wide PIN policy and reset other admins' PINs from the Profile page." },
      { text: "When prompted, enter your 6-digit PIN. The action is only committed after a successful PIN match.", tip: "PIN entry is gated by a fundPinStep modal — never share your PIN with anyone." },
      { text: "All PIN-protected actions are logged with the admin alias, action type, and timestamp for audit." },
    ],
  },
  {
    id: "ip-restrictions",
    title: "IP & Country Restrictions",
    icon: Globe,
    description: "Control access by IP address and geographic location.",
    roles: ["Super Admin"],
    steps: [
      { text: "Navigate to 'IP & Country' from the sidebar (Super Admin only)." },
      { text: "The page has two sections: Country Rules and IP Address Rules, each with Allow/Block mode." },
      { text: "Add country rules by selecting a country and choosing whether to allow or block access." },
      { text: "Add IP rules using CIDR notation (e.g., 192.168.1.0/24) with a descriptive label." },
      { text: "Toggle individual rules on/off using the switch without deleting them." },
      { text: "An audit log at the bottom tracks all changes with timestamps and the admin who made them.", tip: "Test new IP restrictions carefully — blocking the wrong range can lock out legitimate users." },
    ],
  },
  {
    id: "sensitive-words",
    title: "Sensitive Words Filter",
    icon: Shield,
    description: "Manage word filters for chat content moderation.",
    roles: ["Super Admin"],
    steps: [
      { text: "Navigate to 'Sensitive Words' from the sidebar (Super Admin only)." },
      { text: "Words are categorized into three types: Profanity, Competitor, and PII Pattern." },
      { text: "Each word has a detection mode: 'Exact' (whole word match) or 'Partial' (substring match)." },
      { text: "Add new words by entering the word, selecting a category and detection mode, then clicking 'Add'." },
      { text: "Edit or delete existing words using the pencil and trash icons on each row." },
      { text: "Use the search bar and category filter to find specific words quickly.", tip: "Use 'Partial' mode for PII patterns (e.g., 'credit card number') and 'Exact' mode for specific competitor names." },
      { text: "Bulk import words from a .txt file (one word per line) using the Upload button." },
    ],
  },
  {
    id: "api-config",
    title: "API Configuration",
    icon: Globe,
    description: "Configure merchant API endpoints and webhook settings.",
    roles: ["Super Admin"],
    steps: [
      { text: "Navigate to 'API Config' from the sidebar (Super Admin only)." },
      { text: "Configure the merchant API endpoint URL for card verification." },
      { text: "Set up webhook callback URLs for receiving verification results." },
      { text: "Test API connectivity to ensure proper integration." },
      { text: "Save changes — all verification requests will use the updated configuration.", tip: "Always test the connection after changing API settings." },
    ],
  },
  {
    id: "broadcast",
    title: "SMS Broadcast",
    icon: Send,
    description: "Send bulk SMS notifications to customers.",
    roles: ["Super Admin"],
    steps: [
      { text: "Navigate to 'SMS Broadcast' from the sidebar (Super Admin only)." },
      { text: "Compose your broadcast message in the text area." },
      { text: "Select the target audience — all customers or specific segments." },
      { text: "Preview the message before sending." },
      { text: "Click 'Send Broadcast' to dispatch the SMS to all selected recipients.", tip: "Keep messages concise and include a clear call-to-action." },
    ],
  },
  {
    id: "roles",
    title: "Understanding Role-Based Access",
    icon: Shield,
    description: "Learn what each admin role can see and do.",
    roles: ["All Roles"],
    steps: [
      { text: "Super Admin: Full access to all features including Naira Rate, User Management, IP & Country Restrictions, Sensitive Words, API Config, SMS Broadcast, and ranking reward distribution." },
      { text: "Team Lead: Access to Messages, Customers, Card Rates, Orders, Naira Rate, Volume Ranking, Rewards (view only), and the Team Dashboard." },
      { text: "Agent: Access to Messages, Customers, Card Rates, Orders, Volume Ranking, and Rewards (view only) — focused on customer interaction and order processing." },
      { text: "Finance: Access to Orders (read-only), Platform Wallet, Naira Rate, and Team Chat. No access to Volume Ranking or Rewards." },
      { text: "Use the 'View as' switcher at the bottom of the sidebar to preview the experience for each role.", tip: "The 'View as' switcher is for demo purposes — in production, roles are assigned by a Super Admin." },
      { text: "Navigation items are automatically hidden based on your role — you'll only see what you have access to." },
    ],
  },
  {
    id: "wallets",
    title: "Wallet Management",
    icon: DollarSign,
    description: "View wallet balances, filter transactions, and export data.",
    roles: ["Super Admin", "Team Lead", "Finance"],
    steps: [
      { text: "Navigate to 'Wallets' from the sidebar." },
      { text: "Each customer's total wallet balance is split into Trading Balance (from card trades) and Rewards Balance (from ranking + referrals)." },
      { text: "Use the search bar to filter transactions by ID or description." },
      { text: "Filter by transaction type using the dropdown: All, Deposit, or Disbursement." },
      { text: "Use the From/To date-time pickers to narrow down transactions by date range." },
      { text: "Click 'Export CSV' to download the currently filtered transaction records as a CSV file.", tip: "Total Balance = Trading Balance + Rewards Balance. Both are maintained independently." },
    ],
  },
  {
    id: "rewards",
    title: "Rewards Management",
    icon: BarChart3,
    description: "Distribute ranking rewards and monitor all reward activity.",
    roles: ["Super Admin", "Team Lead", "Agent"],
    steps: [
      { text: "Navigate to 'Rewards' from the sidebar (not available to Finance role)." },
      { text: "Summary cards show Total Rewards Given, Ranking Rewards, and Referral Rewards across all customers." },
      { text: "Referral rewards are automated — they are generated when an invited user completes their first trade." },
      { text: "Ranking rewards require manual distribution by a Super Admin. Click 'Distribute Ranking Rewards' to begin.", tip: "Only Super Admins can distribute ranking rewards. Other roles can view but not distribute." },
      { text: "Select a bi-weekly period (H1: 1st–15th, H2: 16th–end of month) to distribute rewards for." },
      { text: "The system checks that all orders in the selected period are closed/settled. If any orders are still open, distribution is blocked and pending orders are shown." },
      { text: "Once all orders are settled, confirm distribution. Rewards are generated based on the leaderboard rankings for that period." },
      { text: "Use the date/time range filters (From/To) to narrow down reward records by date." },
      { text: "Use the search bar to filter by alias and the type dropdown to filter by Ranking or Referral.", tip: "Monitor reward trends to understand customer engagement and referral effectiveness." },
    ],
  },
  {
    id: "search",
    title: "Using Global Search",
    icon: Search,
    description: "Quickly find customers, orders, and card rates.",
    roles: ["All Roles"],
    steps: [
      { text: "Click on the search bar in the top header (visible on all pages)." },
      { text: "Type a customer alias (e.g., 'A7X3KP'), order ID, or card type." },
      { text: "Recent searches appear immediately for quick access." },
      { text: "Results are grouped by category: Customers, Orders, and Card Rates — each with relevant badges." },
      { text: "Click on any result to navigate directly to that customer's chat, order list, or card rates page." },
    ],
  },
];

export default function AdminGuide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["messages"]));

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedSections(new Set(guides.map(g => g.id)));
  const collapseAll = () => setExpandedSections(new Set());

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">Admin User Guide</h1>
              <p className="text-sm text-muted-foreground">Step-by-step instructions for every feature in the admin panel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-accent hover:underline">Expand All</button>
            <span className="text-xs text-muted-foreground">|</span>
            <button onClick={collapseAll} className="text-xs text-accent hover:underline">Collapse All</button>
          </div>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-6">
          {guides.map(g => (
            <button
              key={g.id}
              onClick={() => {
                setExpandedSections(prev => new Set(prev).add(g.id));
                document.getElementById(`guide-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-accent/10 hover:text-accent transition-colors font-medium"
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* Guide sections */}
        <div className="space-y-3">
          {guides.map(guide => {
            const isExpanded = expandedSections.has(guide.id);
            const Icon = guide.icon;
            return (
              <div key={guide.id} id={`guide-${guide.id}`} className="border rounded-xl bg-card overflow-hidden">
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{guide.title}</h3>
                      {guide.roles.map(r => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{r}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1">
                    <div className="ml-4 border-l-2 border-accent/20 pl-5 space-y-3">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-accent">{i + 1}</span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">{step.text}</p>
                          {step.tip && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-accent bg-accent/5 rounded-md px-3 py-2">
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span><strong>Tip:</strong> {step.tip}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
