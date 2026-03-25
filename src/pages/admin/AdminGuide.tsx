import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, CreditCard, FileText, DollarSign, Users, BarChart3, Globe, Send, Shield, Search, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

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
      { text: "Conversations are organized into 3 columns: Consulting (new inquiries), Trading (active card trades), and Pending (awaiting action)." },
      { text: "Click on any conversation to open the full chat view with a responsive tabbed sidebar (Orders + Sales Order). The left panel (25%), chat area, and right panel (35%) scale fluidly across screen sizes." },
      { text: "Type your response in the message input at the bottom and press Send or hit Enter." },
      { text: "Use the status dropdown at the top of a chat to move conversations between Consulting, Trading, and Pending.", tip: "Moving to 'Trading' signals an active deal is in progress." },
      { text: "Only customer-facing status changes appear as system messages in chat (e.g., Order Created, Order Processing, Success, Payment Completed). Internal agent transitions like Pending → In Trade are silent.", tip: "This keeps the customer's chat clean — they only see statuses relevant to them." },
      { text: "Look for unread count badges on each conversation card to prioritize responses." },
      { text: "VIP and Repeat customer tags are shown on conversation cards — prioritize these customers." },
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
      { text: "For each card, select Card Type, Format (Physical/E-Code), enter Denomination. Currency and rate auto-populate." },
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
    description: "Monitor live gift card buy and sell rates from the merchant API.",
    roles: ["All Roles"],
    steps: [
      { text: "Navigate to 'Card Rates' from the sidebar." },
      { text: "The table shows all supported cards with Card Type, Format (Physical/E-Code), Currency, Buy Rate, Sell Rate, and Last Updated." },
      { text: "Use the search bar to filter by card type or currency (e.g., type 'iTunes' or 'GBP')." },
      { text: "Click 'Refresh' to manually refresh rates — rates also auto-refresh every 60 seconds.", tip: "E-Code rates are typically higher than Physical card rates." },
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
    title: "Setting the System Naira Rate",
    icon: DollarSign,
    description: "Update the global NGN/CNY rate used for all order calculations.",
    roles: ["Super Admin", "Team Lead"],
    steps: [
      { text: "Navigate to 'Naira Rate' from the sidebar (Super Admin and Team Lead)." },
      { text: "View the current system rate prominently displayed at the top." },
      { text: "Enter a new rate in the input field and provide a reason for the change." },
      { text: "Click 'Update Rate' to apply — the change takes effect immediately for all new orders." },
      { text: "Scroll down to see the rate change history with timestamps, old/new values, who made the change, and the reason.", tip: "Always provide a clear reason (e.g., 'Market adjustment', 'Daily update') for audit purposes." },
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
      { text: "Roles include: Super Admin (full access), Team Lead (team oversight), and Agent (chat & orders)." },
      { text: "User statuses are shown as Active (online) or Offline." },
      { text: "Use this page to monitor team activity and identify who is currently available." },
    ],
  },
  {
    id: "team",
    title: "Team Dashboard",
    icon: BarChart3,
    description: "Monitor team performance metrics and agent activity.",
    roles: ["Team Lead", "Super Admin"],
    steps: [
      { text: "Navigate to 'Team Dashboard' from the sidebar (Team Lead and Super Admin)." },
      { text: "View aggregate team performance metrics and individual agent statistics." },
      { text: "Monitor active conversations, resolution times, and customer satisfaction indicators." },
      { text: "Use this data to identify bottlenecks and optimize team workload distribution.", tip: "Check the dashboard at the start and end of each shift for best oversight." },
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
      { text: "Super Admin: Full access to all features including Naira Rate, User Management, IP & Country Restrictions, Sensitive Words, API Config, and SMS Broadcast." },
      { text: "Team Lead: Access to Messages, Customers, Card Rates, Orders, Naira Rate, and the Team Dashboard for monitoring agents." },
      { text: "Agent: Access to Messages, Customers, Card Rates, and Orders — focused on customer interaction and order processing." },
      { text: "Use the 'View as' switcher at the bottom of the sidebar to preview the experience for each role.", tip: "The 'View as' switcher is for demo purposes — in production, roles are assigned by a Super Admin." },
      { text: "Navigation items are automatically hidden based on your role — you'll only see what you have access to." },
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
