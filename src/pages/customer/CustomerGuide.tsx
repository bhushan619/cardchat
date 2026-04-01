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
    description: "Create your account and begin trading in minutes.",
    steps: [
      { text: "Open the app — a 5-second splash animation introduces CardChat's trust pillars: safety, speed, and reliability." },
      { text: "Swipe through the onboarding slides (up to 5 pages) highlighting security, fast settlements, dedicated support, and transaction history. Tap 'Skip' at any time." },
      { text: "On the Welcome screen, tap 'Get Started' to create an account or 'I already have an account' to sign in." },
      { text: "Choose your sign-in method: Continue with Apple, Continue with Google, or enter your email to receive a one-time passcode (OTP)." },
      { text: "Enter the 4-digit OTP sent to your email. You have 3 attempts and the code expires in 5 minutes.", tip: "Tap 'Resend' if you didn't receive the code. Check your spam folder too." },
      { text: "Your unique 6-character alias (e.g., A7X3KP) is displayed. This is your identity across all support interactions — agents never see your real name." },
      { text: "Tap 'Continue to Home' to enter the app. On your first visit, a Beginner's Guide overlay walks you through the basics.", tip: "Your alias is permanent and used for all trades. Only system administrators can see your real identity." },
      { text: "To enter an invite code, go to the Rewards screen from the Me tab — invite codes are no longer part of the registration flow.", tip: "You can enter an invite code at any time via the Rewards screen." },
    ],
  },
  {
    id: "home",
    title: "Exploring the Home Screen",
    icon: Home,
    description: "Navigate the minimalist dashboard with core actions and live rates.",
    steps: [
      { text: "The Home tab features a clean, modular grid layout inspired by iOS — four core action tiles are front and center." },
      { text: "The four core actions are: 'Sell Cards' (start a trade), 'Live Rates' (real-time pricing), 'Chat' (talk to agents), and 'Guide' (how-to reference)." },
      { text: "Use the search bar to quickly filter cards by name (e.g., 'iTunes', 'Amazon')." },
      { text: "Below the grid, 'Live Rates' displays current buy rates for supported gift cards with card type, format, currency, and rate per $1.", tip: "Rates auto-refresh every 60 seconds — always check the latest rate before initiating a trade." },
      { text: "At the bottom, the 'Ready to trade?' banner provides a quick shortcut to start chatting with an agent." },
    ],
  },
  {
    id: "sell-card",
    title: "How to Sell a Gift Card",
    icon: Gift,
    description: "Step-by-step process to sell your gift card for Naira.",
    steps: [
      { text: "Check the current rate for your card on the Home screen under 'Live Rates'." },
      { text: "Tap 'Sell Cards' or navigate to the 'Chat' tab to connect with an agent." },
      { text: "Tap on any available agent from the Contacts list to start a conversation." },
      { text: "Tell the agent what card you want to sell (e.g., 'I have 2x iTunes $100 cards to sell')." },
      { text: "Take clear photos of your gift card — front and back — and send them using the image icon next to the send button. You can send multiple images per card (up to 10).", tip: "Make sure the card code/PIN and any barcodes are clearly visible in the photos." },
      { text: "The agent will verify your cards using the merchant API — this usually takes a few seconds." },
      { text: "Once verified, the agent creates an order and locks in your rate. You'll see a system message confirming the details." },
      { text: "The agent processes the payout to your registered bank account. Funds typically arrive within minutes.", tip: "If a card fails verification, the agent will let you know the reason. You can try a different card." },
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
      { text: "Type your message in the input field at the bottom and tap the Send button." },
      { text: "Use the image and emoji icons beside the send button to attach card photos or add reactions.", tip: "Always send clear, well-lit photos for faster verification." },
      { text: "System messages (styled differently) show only key updates you need: Order Created, Order Processing, Success, Pending Payment, and Payment Completed." },
      { text: "If your chat has been escalated to a group, you'll see multiple agent names on messages." },
    ],
  },
  {
    id: "contacts",
    title: "Finding Available Agents",
    icon: Users,
    description: "Browse agents and start a new conversation.",
    steps: [
      { text: "Tap the 'Contacts' tab at the bottom of the screen." },
      { text: "You'll see a list of available agents with their online status." },
      { text: "Green dot = Online and available, Yellow dot = Away (may respond slower)." },
      { text: "Use the search bar to filter agents by name." },
      { text: "Tap on any agent to start a new conversation with them.", tip: "For fastest response, choose an agent with 'Online' status." },
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
    ],
  },
  {
    id: "profile",
    title: "Managing Your Profile",
    icon: User,
    description: "View your alias, wallet balances, and transaction history.",
    steps: [
      { text: "Tap the 'Me' tab at the bottom of the screen." },
      { text: "Your 6-character alias is displayed prominently at the top — this is your trading identity." },
      { text: "Your total wallet balance is shown with a breakdown: Trading Balance (earnings from card trades) and Rewards Balance (earnings from ranking + referrals)." },
      { text: "Your registered bank accounts are listed here — these are used for receiving payouts." },
      { text: "Review your transaction history to track past trades and payments." },
      { text: "Check your account status and any VIP/Repeat customer badges.", tip: "Keep your bank details up-to-date to avoid payout delays." },
    ],
  },
  {
    id: "beginner-guide",
    title: "Beginner's Guide",
    icon: BookOpen,
    description: "The 3-step onboarding that appears on your first login.",
    steps: [
      { text: "On your first visit to the Home screen, a Beginner's Guide overlay appears at the bottom of the screen." },
      { text: "Step 1 — Connect with an Agent: Browse verified agents on the Contacts page and start a conversation." },
      { text: "Step 2 — Start a Chat: Tap on an agent to open a secure chat. Share your card details and get a real-time rate quote." },
      { text: "Step 3 — Complete Your Trade: Submit your card, track the order live, and receive your payout directly to your bank account." },
      { text: "Tap 'Next' to advance, or 'Skip' to dismiss the guide at any time.", tip: "You can revisit these steps anytime from the Guide tab." },
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
    id: "wallet",
    title: "Wallet & Withdrawals",
    icon: Banknote,
    description: "Manage your wallet balance and cash withdrawals.",
    steps: [
      { text: "Your total wallet balance is the sum of your Trading Balance and Rewards Balance — both are visible on the Me tab." },
      { text: "Trading Balance reflects earnings from completed card trades. Rewards Balance reflects earnings from ranking achievements and referral bonuses." },
      { text: "To withdraw funds, navigate to your wallet and tap 'Withdraw'." },
      { text: "The minimum withdrawal amount is ₦2,000 per transaction.", tip: "Amounts below ₦2,000 will be rejected — accumulate a balance first." },
      { text: "The maximum withdrawal amount is ₦790,000 per transaction." },
      { text: "For larger amounts, split your withdrawal into multiple transactions of up to ₦790,000 each." },
      { text: "Withdrawals are sent to your verified bank account. Processing time depends on your bank." },
    ],
  },
  {
    id: "rewards",
    title: "Rewards & Referrals",
    icon: Gift,
    description: "Earn rewards through ranking achievements and referrals.",
    steps: [
      { text: "Tap 'Rewards' from the Me tab to view your total rewards earned — broken down into Ranking and Referral earnings." },
      { text: "Ranking rewards are based on bi-weekly trading volume periods (H1: 1st–15th, H2: 16th–end of month). After all orders are settled, rankings are generated and rewards are distributed by the platform." },
      { text: "Referral rewards are automatic — earned instantly when someone you invite completes their first trade. Share your alias as your referral code." },
      { text: "You can enter an invite code from another user on the Rewards screen — this links you to their referral.", tip: "Invite codes can be entered at any time via the Rewards screen." },
      { text: "Tap the info icon (ℹ) in the Rewards header to see 'How it Works' — a step-by-step explanation of the rewards program." },
      { text: "Your reward history lists every bonus received, with type, description, date, and amount." },
    ],
  },
  {
    id: "safety",
    title: "Safety & Security Tips",
    icon: ShieldCheck,
    description: "Stay safe while trading gift cards.",
    steps: [
      { text: "Never share your login password with anyone — CardChat agents will never ask for it." },
      { text: "Only trade through the official CardChat app — avoid sharing card codes outside the platform." },
      { text: "Always verify the agent's identity — official agents are marked in the Contacts list." },
      { text: "Do not share card photos or codes on social media or other platforms." },
      { text: "If something seems suspicious, report it immediately through the chat.", tip: "CardChat encrypts all your data — your card codes and bank details are secure." },
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
      { text: "Check the Home screen for the latest rate changes and 'Ready to trade?' shortcut." },
      { text: "The Chat tab shows unread message counts on its icon." },
      { text: "Visit the app regularly — rates change frequently!", tip: "Turn on notifications to never miss a rate drop or special offer." },
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
              <p className="text-[11px] text-muted-foreground">Learn how to use CardChat</p>
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
