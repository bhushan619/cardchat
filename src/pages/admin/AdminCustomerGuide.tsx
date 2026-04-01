import AdminLayout from "@/components/admin/AdminLayout";
import { useState } from "react";
import { ChevronDown, ChevronRight, Home, MessageCircle, Users, User, CreditCard, Gift, BookOpen, CheckCircle2, ShieldCheck, Bell, Banknote } from "lucide-react";

interface GuideStep {
  text: string;
  tip?: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: typeof Home;
  description: string;
  steps: GuideStep[];
}

const guides: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: ShieldCheck,
    description: "How customers create accounts and sign in.",
    steps: [
      { text: "Customers see a 5-second splash animation highlighting trust pillars: safety, speed, and reliability." },
      { text: "They swipe through up to 5 onboarding slides about security, fast settlements, dedicated support, and platform history. They can 'Skip' at any time." },
      { text: "On the Welcome screen, they tap 'Get Started' (new) or 'I already have an account' (returning)." },
      { text: "Sign-in options: Continue with Apple, Continue with Google, or email-based OTP (4-digit code, 5-min expiry, 3 attempts max)." },
      { text: "After OTP verification, customers can optionally enter a 6-character invite code or WS alias. They have 7 days to add one; after that, source defaults to 'App Ad'." },
      { text: "A system-generated 6-character alphanumeric alias (e.g., A7X3KP) is displayed. This is their permanent identity across all interactions — agents never see real names.", tip: "If a customer asks about their alias, direct them to the 'Me' tab where it's prominently displayed." },
    ],
  },
  {
    id: "home",
    title: "Customer Home Screen",
    icon: Home,
    description: "Minimalist dashboard with modular grid layout.",
    steps: [
      { text: "The Home tab features a clean, iOS-inspired modular grid with four core actions: Sell Cards, Live Rates, Chat, and Guide." },
      { text: "A search bar allows filtering cards by name (e.g., 'iTunes', 'Amazon')." },
      { text: "A search bar allows filtering cards by name (e.g., 'iTunes', 'Amazon')." },
      { text: "Live Rates section below the grid displays current buy rates with card type, format, currency, and ₦ per $1." },
      { text: "A 'Ready to trade?' CTA at the bottom directs customers to start chatting with an agent.", tip: "If a customer can't find a card, remind them to use the search bar — it filters in real-time." },
    ],
  },
  {
    id: "sell-card",
    title: "How Customers Sell Gift Cards",
    icon: Gift,
    description: "The customer's perspective of the trading process.",
    steps: [
      { text: "Customer checks the current rate on the Home screen under 'Live Rates'." },
      { text: "They tap 'Sell Cards' or go to the Chat tab and select an agent from Contacts." },
      { text: "They tell the agent what card they want to sell and send multiple clear photos per card using the image icon beside the send button (up to 10 images per card entry)." },
      { text: "The agent (you) verifies the cards, creates an order, and locks the rate." },
      { text: "A system message confirms the order details. The agent processes payout to the customer's registered bank account." },
      { text: "Customer receives a confirmation and funds typically arrive within minutes.", tip: "Remind customers to send clear, well-lit photos with visible codes/PINs for faster verification." },
    ],
  },
  {
    id: "chat",
    title: "Customer Chat Interface",
    icon: MessageCircle,
    description: "How the chat works from the customer's side.",
    steps: [
      { text: "The Chat tab lists all active and past conversations." },
      { text: "Customers type messages in the input field and tap Send." },
      { text: "Image and emoji icons are placed inline beside the send button for quick access." },
      { text: "System messages (styled differently) show only customer-relevant updates: Order Created, Order Processing, Success, Pending Payment, and Payment Completed. Internal agent transitions are not shown." },
      { text: "Escalated chats show multiple agent names above message bubbles." },
      { text: "All interactive buttons provide immediate visual feedback (scale-down animation) on tap.", tip: "If a customer reports the app feels unresponsive, verify they're on the latest version." },
    ],
  },
  {
    id: "contacts",
    title: "Finding Agents",
    icon: Users,
    description: "How customers browse and connect with agents.",
    steps: [
      { text: "The Contacts tab shows a list of available agents with online/away status indicators." },
      { text: "Green dot = Online, Yellow dot = Away." },
      { text: "Customers can search agents by name using the filter bar." },
      { text: "Tapping an agent starts a new conversation.", tip: "Direct customers to choose agents with 'Online' status for fastest response." },
    ],
  },
  {
    id: "beginner-guide",
    title: "Beginner's Guide (First Login)",
    icon: BookOpen,
    description: "The 3-step onboarding overlay for new customers.",
    steps: [
      { text: "On first visit to Home, a bottom-sheet overlay walks new customers through 3 steps." },
      { text: "Step 1 — Connect with an Agent: Browse verified agents on the Contacts page and start a conversation." },
      { text: "Step 2 — Start a Chat: Tap on an agent to open a secure chat, share card details, get a rate quote." },
      { text: "Step 3 — Complete Your Trade: Submit the card, track the order live, receive payout to bank account." },
      { text: "Customers tap 'Next' to advance (max 2 taps) or 'Skip' to dismiss.", tip: "If a new customer seems confused, remind them to check the Guide tab for detailed instructions." },
    ],
  },
  {
    id: "profile",
    title: "Customer Profile (Me Tab)",
    icon: User,
    description: "What customers see in their profile.",
    steps: [
      { text: "The 'Me' tab displays the customer's 6-character alias prominently at the top." },
      { text: "Total wallet balance is shown with a breakdown: Trading Balance (from card trades) and Rewards Balance (from ranking + referrals)." },
      { text: "Registered bank accounts are listed — used for receiving payouts." },
      { text: "Transaction history shows past trades and payment statuses." },
      { text: "VIP and Repeat customer badges are visible here.", tip: "If a customer needs to update bank details, direct them to the Me tab." },
    ],
  },
  {
    id: "rewards",
    title: "Rewards & Referrals",
    icon: Gift,
    description: "How the rewards system works for customers.",
    steps: [
      { text: "Customers access Rewards from the Me tab — it shows total rewards earned with a breakdown of Ranking vs. Referral earnings." },
      { text: "Ranking rewards are earned by achieving higher tiers through consistent trading." },
      { text: "Referral rewards are earned when an invited user completes their first trade." },
      { text: "Customers can enter an invite code on the Rewards screen at any time." },
      { text: "Tapping the info icon (ℹ) in the Rewards header shows a 'How it Works' modal explaining the program.", tip: "If a customer asks about invite codes, direct them to the Rewards screen — it's no longer part of registration." },
    ],
  },
  {
    id: "payments",
    title: "Customer Payments",
    icon: Banknote,
    description: "How customers receive payouts.",
    steps: [
      { text: "After card verification, the agent initiates a bank transfer to the customer's registered account." },
      { text: "A confirmation message appears in the chat with the exact transfer amount." },
      { text: "Most transfers complete within minutes — some banks may take up to 30 minutes." },
      { text: "Customers can check the 'Me' tab for full transaction history and statuses.", tip: "If a customer reports a failed payment, escalate to a Team Lead immediately." },
    ],
  },
  {
    id: "safety",
    title: "Customer Safety Tips",
    icon: ShieldCheck,
    description: "Security guidance for customers.",
    steps: [
      { text: "Customers should never share login credentials — CardChat agents will never ask for passwords." },
      { text: "All trading should happen through the official app only — no sharing card codes outside the platform." },
      { text: "Official agents are marked in the Contacts list." },
      { text: "Suspicious activity should be reported immediately through chat.", tip: "CardChat uses end-to-end encryption. Reassure concerned customers about data security." },
    ],
  },
  {
    id: "dark-theme",
    title: "App Design & Dark Theme",
    icon: Bell,
    description: "The customer app's visual design approach.",
    steps: [
      { text: "The customer app uses a dark luxury theme by default — reducing device power consumption and providing a premium feel." },
      { text: "All interactive elements provide immediate visual feedback with a subtle scale-down animation on tap." },
      { text: "The minimalist iOS-inspired layout reduces visual clutter and highlights core trading functions." },
      { text: "Navigation uses a 5-tab bottom bar: Home, Chat, Contacts, Me, and Guide.", tip: "The dark theme is designed for comfort during extended use — especially for night trading." },
    ],
  },
];

export default function AdminCustomerGuide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["getting-started"]));

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
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">Customer User Guide</h1>
              <p className="text-sm text-muted-foreground">Reference guide for assisting customers · Read-only</p>
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
                document.getElementById(`cguide-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            >
              {g.title}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {guides.map(guide => {
            const isExpanded = expandedSections.has(guide.id);
            const Icon = guide.icon;
            return (
              <div key={guide.id} id={`cguide-${guide.id}`} className="border rounded-xl bg-card overflow-hidden">
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1">
                    <div className="ml-4 border-l-2 border-primary/20 pl-5 space-y-3">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">{step.text}</p>
                          {step.tip && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-primary bg-primary/5 rounded-md px-3 py-2">
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
