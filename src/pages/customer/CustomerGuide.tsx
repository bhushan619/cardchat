import CustomerLayout from "@/components/customer/CustomerLayout";
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
    description: "Create your account and log in to start trading.",
    steps: [
      { text: "Open the app and tap 'Create Account' on the login screen." },
      { text: "Enter your phone number or email address." },
      { text: "Create a strong password and confirm it." },
      { text: "Verify your account using the OTP sent to your phone/email." },
      { text: "You're now logged in and ready to trade!", tip: "Keep your login credentials safe — never share them with anyone." },
    ],
  },
  {
    id: "home",
    title: "Exploring the Home Screen",
    icon: Home,
    description: "Understand the main dashboard with rates, services, and promotions.",
    steps: [
      { text: "The Home tab is your main dashboard — it opens by default when you launch the app." },
      { text: "At the top, you'll see promotional banners — swipe left/right to browse current offers and deals." },
      { text: "The 'Services' section shows available actions: Sell Cards, Live Rates, and Rewards." },
      { text: "Scroll down to see 'Live Card Prices' — these are the current buy rates for all supported gift cards." },
      { text: "Each card shows the type, format (Physical or E-Code), currency, and rate per $1 in Naira.", tip: "Rates auto-refresh every 60 seconds — always check the latest rate before initiating a trade." },
      { text: "Use the search bar at the top to quickly filter cards by name (e.g., 'iTunes', 'Amazon')." },
      { text: "At the bottom, you'll find the 'Invite Friends' banner — tap 'Share Invite Code' to earn ₦500 per referral." },
    ],
  },
  {
    id: "sell-card",
    title: "How to Sell a Gift Card",
    icon: Gift,
    description: "Step-by-step process to sell your gift card for Naira.",
    steps: [
      { text: "Check the current rate for your card on the Home screen under 'Live Card Prices'." },
      { text: "Navigate to the 'Chat' tab to start a conversation with an agent." },
      { text: "Tap on 'LightChat Support' or any available agent from the contacts list." },
      { text: "Tell the agent what card you want to sell (e.g., 'I have 2x iTunes $100 cards to sell')." },
      { text: "Take clear photos of your gift card — front and back — and send them in the chat.", tip: "Make sure the card code/PIN and any barcodes are clearly visible in the photos." },
      { text: "The agent will verify your cards using the merchant API — this usually takes a few seconds." },
      { text: "Once verified, the agent will create an order and lock in your rate." },
      { text: "You'll see a system message confirming the order details: card type, quantity, and locked rate." },
      { text: "The agent will process the payout to your registered bank account." },
      { text: "You'll receive a confirmation once the transfer is initiated — funds typically arrive within minutes.", tip: "If a card fails verification, the agent will let you know the reason. You can try a different card." },
    ],
  },
  {
    id: "chat",
    title: "Using the Chat",
    icon: MessageCircle,
    description: "Communicate with agents to complete your trades.",
    steps: [
      { text: "Tap the 'Chat' tab at the bottom of the screen." },
      { text: "Your active and past conversations are listed here." },
      { text: "Tap on a conversation to open it and continue chatting." },
      { text: "Type your message in the input field at the bottom and tap Send." },
      { text: "To send images (card photos), use the image/attachment button.", tip: "Always send clear, well-lit photos for faster verification." },
      { text: "System messages (in a different style) show order confirmations and status updates." },
      { text: "If your chat has been escalated to a group, you'll see multiple agent names on messages." },
    ],
  },
  {
    id: "contacts",
    title: "Finding Available Agents",
    icon: Users,
    description: "See which agents are online and start a new conversation.",
    steps: [
      { text: "Tap the 'Contacts' tab at the bottom of the screen." },
      { text: "You'll see a list of available agents with their online status." },
      { text: "Green dot = Online and available, Yellow dot = Away (may respond slower)." },
      { text: "Tap on any agent to start a new conversation with them." },
      { text: "'LightChat Support' is the main support channel — use this for general inquiries.", tip: "For fastest response, choose an agent with 'Online' status." },
    ],
  },
  {
    id: "rates",
    title: "Understanding Card Rates",
    icon: CreditCard,
    description: "Learn how gift card pricing works.",
    steps: [
      { text: "Card rates show how much you'll receive in Naira (₦) for every $1 of card value." },
      { text: "For example, a rate of ₦680 means a $100 card is worth ₦68,000." },
      { text: "Rates vary by card type — popular cards like iTunes typically have higher rates." },
      { text: "Physical cards and E-Code cards may have different rates — E-Codes often have slightly higher rates." },
      { text: "Rates are updated every 60 seconds based on market conditions.", tip: "Lock in your rate by initiating a trade quickly — rates can change!" },
      { text: "The currency (USD, GBP, etc.) is shown next to each card to help identify the card region." },
    ],
  },
  {
    id: "profile",
    title: "Managing Your Profile",
    icon: User,
    description: "View and update your account information.",
    steps: [
      { text: "Tap the 'Me' tab at the bottom of the screen." },
      { text: "View your profile information including your alias and account details." },
      { text: "Your registered bank accounts are listed here — these are used for receiving payouts." },
      { text: "Review your transaction history to track past trades and payments." },
      { text: "Check your account status and any VIP/Repeat customer badges.", tip: "Keep your bank details up-to-date to avoid payout delays." },
    ],
  },
  {
    id: "payments",
    title: "Receiving Payments",
    icon: Banknote,
    description: "How payouts work after a successful trade.",
    steps: [
      { text: "After your cards are verified, the agent initiates a bank transfer to your registered account." },
      { text: "You'll see a confirmation in the chat with the exact transfer amount." },
      { text: "Payments are sent to the bank account you have on file." },
      { text: "Most transfers complete within a few minutes — some banks may take up to 30 minutes." },
      { text: "Check your 'Me' tab for a full history of all your transactions and their statuses.", tip: "If a payment shows as 'Failed', contact support immediately through the chat." },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security Tips",
    icon: ShieldCheck,
    description: "Stay safe while trading gift cards.",
    steps: [
      { text: "Never share your login password with anyone — LightChat agents will never ask for it." },
      { text: "Only trade through the official LightChat app — avoid sharing card codes outside the platform." },
      { text: "Always verify the agent's identity — official agents are marked in the Contacts list." },
      { text: "Do not share card photos or codes on social media or other platforms." },
      { text: "If something seems suspicious, report it immediately through the chat.", tip: "LightChat encrypts all your data — your card codes and bank details are secure." },
    ],
  },
  {
    id: "notifications",
    title: "Staying Updated",
    icon: Bell,
    description: "Get notified about trades, rates, and promotions.",
    steps: [
      { text: "Enable push notifications to receive real-time updates about your trades." },
      { text: "You'll be notified when: your cards are verified, payment is sent, or an agent replies." },
      { text: "Check the Home screen for the latest promotional banners and rate changes." },
      { text: "The chat tab shows unread message counts on its icon." },
      { text: "Visit the app regularly — rates and promotions change frequently!", tip: "Turn on notifications to never miss a rate drop or special offer." },
    ],
  },
];

export default function CustomerGuide() {
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
    <CustomerLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold">User Guide</h1>
              <p className="text-[11px] text-muted-foreground">Learn how to use LightChat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-[10px] text-accent hover:underline">All</button>
            <button onClick={collapseAll} className="text-[10px] text-accent hover:underline">None</button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {guides.map(guide => {
            const isExpanded = expandedSections.has(guide.id);
            const Icon = guide.icon;
            return (
              <div key={guide.id} className="border rounded-xl bg-card overflow-hidden">
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">{guide.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{guide.description}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0.5">
                    <div className="ml-3 border-l-2 border-accent/20 pl-4 space-y-2.5">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[22px] top-0.5 w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-accent">{i + 1}</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">{step.text}</p>
                          {step.tip && (
                            <div className="mt-1 flex items-start gap-1 text-[10px] text-accent bg-accent/5 rounded-md px-2.5 py-1.5">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
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
    </CustomerLayout>
  );
}
