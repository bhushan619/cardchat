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
      { text: "Click on any conversation to open the full chat view with the customer." },
      { text: "Type your response in the message input at the bottom and press Send or hit Enter." },
      { text: "Use the status dropdown at the top of a chat to move conversations between Consulting, Trading, and Pending.", tip: "Moving to 'Trading' signals an active deal is in progress." },
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
    description: "Process a gift card trade from card entry through verification to payout.",
    roles: ["All Roles"],
    steps: [
      { text: "Open a customer's chat and click 'Create Order' in the chat header." },
      { text: "Step 1 — Create Order: You'll see a chat images panel at the top showing images sent by the customer." },
      { text: "Drag any chat image and drop it onto a card entry to attach it (the card will highlight when you hover over it).", tip: "Used images are dimmed with a checkmark — you can detach by clicking the X." },
      { text: "For each card, select the Card Type (e.g., iTunes US), Format (Physical or E-Code), and enter the Denomination." },
      { text: "The currency and rate per dollar are shown automatically based on your selection." },
      { text: "Enter the card code/PIN for each card." },
      { text: "Click 'Add Card' to add more cards (up to 15 per order)." },
      { text: "Click 'Next' to proceed to verification." },
      { text: "Step 2 — Verify: Click 'Verify All Cards' or verify individual cards using the shield icon.", tip: "Verification is simulated — cards can return Verified, Failed, or Expired." },
      { text: "Failed or Expired cards can be removed using the trash icon or 'Remove This Card' button." },
      { text: "All remaining cards must be verified before you can proceed." },
      { text: "Step 3 — Initiate Transfer: Select the customer's bank account for payout." },
      { text: "Review the total payout amount and click 'Initiate Transfer'." },
      { text: "A confirmation screen will display the Order ID, payout summary, bank details, and card breakdown." },
      { text: "Click 'Done' to close — the order appears in the sidebar's Orders section." },
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
      { text: "Browse all orders with details: Order ID, Customer, Card Type, Denomination, Amount, Rate, Unit Price, Status, and Created time." },
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
      { text: "Super Admin: Full access to all features including Naira Rate, User Management, API Config, and SMS Broadcast." },
      { text: "Team Lead: Access to Messages, Card Rates, Orders, and the Team Dashboard for monitoring agents." },
      { text: "Agent: Access to Messages, Card Rates, and Orders — focused on customer interaction and order processing." },
      { text: "Use the 'View as' switcher at the bottom of the sidebar to preview the experience for each role.", tip: "The 'View as' switcher is for demo purposes — in production, roles are assigned by a Super Admin." },
      { text: "Navigation items are automatically hidden based on your role — you'll only see what you have access to." },
    ],
  },
  {
    id: "search",
    title: "Using Global Search",
    icon: Search,
    description: "Quickly find customers, orders, and transactions.",
    roles: ["All Roles"],
    steps: [
      { text: "Click on the search bar in the top header (visible on all pages)." },
      { text: "Type a customer alias (e.g., 'User-A7X3'), order ID, or card type." },
      { text: "Recent searches appear immediately for quick access." },
      { text: "Quick results show matching customers and orders with status badges." },
      { text: "Click on any result to navigate directly to that customer's chat or order details." },
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
