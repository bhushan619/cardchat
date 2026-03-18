import { useState, useCallback, DragEvent } from "react";
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Upload, Loader2, XCircle, Clock, RefreshCw, ShieldCheck, ChevronDown, ChevronUp, PartyPopper, Image, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cardRates, systemNairaRate, bankAccounts } from "@/data/mock";

type VerificationStatus = "pending" | "submitted" | "processing" | "verified" | "failed" | "expired";

interface CardEntry {
  id: number;
  code: string;
  hasImage: boolean;
  cardType: string;
  denomination: string;
  unitPrice: string;
  verificationStatus: VerificationStatus;
  verificationMessage?: string;
}

export interface CompletedOrder {
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

interface OrderWizardModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (order: CompletedOrder) => void;
}

const STEPS = ["Create Order", "Verify", "Initiate Transfer"];

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:    { label: "Pending",    icon: Clock,        color: "text-muted-foreground", bg: "bg-muted" },
  submitted:  { label: "Submitted",  icon: Loader2,      color: "text-primary",          bg: "bg-primary/10" },
  processing: { label: "Processing", icon: Loader2,      color: "text-warning",          bg: "bg-warning/10" },
  verified:   { label: "Verified",   icon: CheckCircle2, color: "text-success",          bg: "bg-success/10" },
  failed:     { label: "Failed",     icon: XCircle,      color: "text-destructive",      bg: "bg-destructive/10" },
  expired:    { label: "Expired",    icon: AlertTriangle, color: "text-warning",          bg: "bg-warning/10" },
};

// Mock chat images from conversation
const chatImages = [
  { id: "img-1", label: "Card front #1", time: "10:35 AM", thumbnail: "front" },
  { id: "img-2", label: "Card back #1", time: "10:35 AM", thumbnail: "back" },
  { id: "img-3", label: "Card front #2", time: "10:36 AM", thumbnail: "front" },
  { id: "img-4", label: "Card back #2", time: "10:36 AM", thumbnail: "back" },
  { id: "img-5", label: "Receipt photo", time: "10:37 AM", thumbnail: "receipt" },
];

const makeCard = (): CardEntry => ({
  id: Date.now() + Math.random(),
  code: "",
  hasImage: false,
  cardType: "iTunes US",
  denomination: "100",
  unitPrice: "680",
  verificationStatus: "pending",
});

export default function OrderWizardModal({ open, onClose, onComplete }: OrderWizardModalProps) {
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState<CardEntry[]>([makeCard()]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  // Step 3 - Transfer
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  // Derived
  const totalAmount = cards.reduce((sum, c) => sum + Number(c.denomination), 0);
  const nairaTotal = cards.reduce((sum, c) => sum + Number(c.denomination) * Number(c.unitPrice), 0);
  const allCardsVerified = cards.every(c => c.verificationStatus === "verified");
  const hasFailedCards = cards.some(c => c.verificationStatus === "failed" || c.verificationStatus === "expired");
  const verifiedCount = cards.filter(c => c.verificationStatus === "verified").length;
  const pendingVerification = cards.some(c => ["submitted", "processing"].includes(c.verificationStatus));

  const simulateVerification = useCallback((cardId: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, verificationStatus: "submitted" as VerificationStatus } : c));
    setTimeout(() => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, verificationStatus: "processing" as VerificationStatus, verificationMessage: "API checking card validity..." } : c));
    }, 800);
    const delay = 2000 + Math.random() * 1000;
    setTimeout(() => {
      const rand = Math.random();
      let finalStatus: VerificationStatus;
      let msg: string;
      if (rand < 0.8) { finalStatus = "verified"; msg = "Card verified via webhook callback"; }
      else if (rand < 0.95) { finalStatus = "failed"; msg = "Invalid card code or already redeemed"; }
      else { finalStatus = "expired"; msg = "Verification timed out — retry"; }
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, verificationStatus: finalStatus, verificationMessage: msg } : c));
    }, delay);
  }, []);

  const verifyAllCards = () => {
    const unverified = cards.filter(c => c.verificationStatus !== "verified");
    unverified.forEach((card, i) => {
      setTimeout(() => simulateVerification(card.id), i * 300);
    });
  };

  const updateCard = (id: number, updates: Partial<CardEntry>) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCard = () => {
    if (cards.length >= 15) return;
    setCards([...cards, makeCard()]);
  };

  const removeCard = (id: number) => {
    if (cards.length <= 1) return;
    setCards(cards.filter(c => c.id !== id));
    if (expandedCard === id) setExpandedCard(null);
  };

  const handleNext = () => {
    if (step === 1 && !allCardsVerified) return;
    if (step < 2) setStep(step + 1);
    if (step === 1 && !transferAmount) {
      setTransferAmount(nairaTotal.toLocaleString());
    }
  };

  const handleInitiateTransfer = () => {
    const bank = bankAccounts.find(a => a.id === selectedBank);
    if (!bank) return;

    const order: CompletedOrder = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      cards: cards.map(c => ({ cardType: c.cardType, denomination: c.denomination, unitPrice: c.unitPrice, status: "verified" })),
      totalPayout: nairaTotal,
      totalFaceValue: totalAmount,
      bank: bank.bankName,
      bankAccount: bank.accountNumber,
      holderName: bank.holderName,
      transferAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "processing",
    };

    setCompletedOrder(order);
    setShowConfirmation(true);
    onComplete?.(order);
  };

  const handleClose = () => {
    setStep(0);
    setShowConfirmation(false);
    setCompletedOrder(null);
    onClose();
  };

  if (!open) return null;

  // Confirmation screen
  if (showConfirmation && completedOrder) {
    return (
      <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
        <div className="bg-card rounded-xl w-[480px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Success header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-heading font-bold text-lg">Transfer Initiated</h3>
              <p className="text-sm text-muted-foreground">Your transfer has been submitted for processing.</p>
            </div>

            {/* Order summary */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Order Details</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Processing</span>
              </div>
              <div className="space-y-2">
                {[
                  ["Order ID", completedOrder.orderId],
                  ["Cards", `${completedOrder.cards.length} card${completedOrder.cards.length > 1 ? "s" : ""}`],
                  ["Total Face Value", `$${completedOrder.totalFaceValue}`],
                  ["Total Payout", `₦${completedOrder.totalPayout.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank details */}
            <div className="border rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold">Transfer Details</span>
              <div className="space-y-2">
                {[
                  ["Bank", completedOrder.bank],
                  ["Account", completedOrder.bankAccount],
                  ["Holder", completedOrder.holderName],
                  ["Amount", `₦${completedOrder.transferAmount}`],
                  ["Time", completedOrder.timestamp],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card breakdown */}
            <div className="border rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold">Cards ({completedOrder.cards.length})</span>
              {completedOrder.cards.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>{c.cardType} · ${c.denomination}</span>
                  </div>
                  <span className="text-muted-foreground">₦{(Number(c.denomination) * Number(c.unitPrice)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t">
            <Button onClick={handleClose} className="w-full text-xs bg-accent text-accent-foreground hover:bg-accent/90">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-[560px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base">{STEPS[step]}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Step {step + 1} of 3</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-muted"}`} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          {/* ===== STEP 1: Create Order ===== */}
          {step === 0 && (
            <>
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">{cards.length} card{cards.length > 1 ? "s" : ""}</span>
                <span className="text-xs font-semibold">Total: ${totalAmount}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Cards ({cards.length}/15)</label>
                  <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={addCard} disabled={cards.length >= 15}>
                    <Plus className="w-3 h-3" /> Add Card
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {cards.map((card, idx) => (
                    <div key={card.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          {card.hasImage && (
                            <span className="text-[10px] text-accent flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Image
                            </span>
                          )}
                          {cards.length > 1 && (
                            <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={card.cardType}
                          onChange={e => updateCard(card.id, { cardType: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {cardRates.map(r => (
                            <option key={r.id} value={r.cardType}>{r.cardType}</option>
                          ))}
                        </select>
                        <Input
                          placeholder="Denomination ($)"
                          value={card.denomination}
                          onChange={e => updateCard(card.id, { denomination: e.target.value })}
                          className="text-xs h-9"
                        />
                      </div>
                      <Input
                        placeholder="Enter card code / PIN"
                        value={card.code}
                        onChange={e => updateCard(card.id, { code: e.target.value })}
                        className="text-sm"
                      />
                      <button
                        onClick={() => updateCard(card.id, { hasImage: !card.hasImage })}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-dashed transition-colors w-full justify-center ${
                          card.hasImage
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-muted-foreground/30 text-muted-foreground hover:border-accent hover:text-accent"
                        }`}
                      >
                        {card.hasImage ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                        {card.hasImage ? "Image attached" : "Attach card image"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 2: Verify (per card) ===== */}
          {step === 1 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">Billing & Verification</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{verifiedCount}/{cards.length} verified</span>
                  <Button
                    size="sm" variant="outline" className="text-xs h-7 gap-1"
                    onClick={verifyAllCards}
                    disabled={allCardsVerified || pendingVerification}
                  >
                    {pendingVerification ? <><Loader2 className="w-3 h-3 animate-spin" /> Verifying...</>
                      : allCardsVerified ? <><CheckCircle2 className="w-3 h-3" /> All Verified</>
                      : <><ShieldCheck className="w-3 h-3" /> Verify All</>}
                  </Button>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full transition-all duration-500" style={{ width: `${(verifiedCount / cards.length) * 100}%` }} />
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {cards.map((card, idx) => {
                  const cfg = STATUS_CONFIG[card.verificationStatus];
                  const Icon = cfg.icon;
                  const isSpinning = card.verificationStatus === "submitted" || card.verificationStatus === "processing";
                  const canRetry = ["failed", "expired", "pending"].includes(card.verificationStatus);
                  const isFailed = card.verificationStatus === "failed" || card.verificationStatus === "expired";
                  const cardCostUnit = (Number(card.unitPrice) / systemNairaRate).toFixed(5);
                  const cardPayout = Number(card.denomination) * Number(card.unitPrice);
                  const isExpanded = expandedCard === card.id;

                  return (
                    <div key={card.id} className={`border rounded-lg overflow-hidden transition-colors ${
                      card.verificationStatus === "verified" ? "border-success/30" :
                      isFailed ? "border-destructive/30" : "border-border"
                    }`}>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${cfg.color} ${isSpinning ? "animate-spin" : ""}`} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-medium">
                              Card #{idx + 1}
                              <span className="text-muted-foreground font-normal ml-1">· {card.cardType} · ${card.denomination}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              ₦{card.unitPrice}/unit · Payout: ₦{cardPayout.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {canRetry && !pendingVerification && (
                            <button
                              onClick={e => { e.stopPropagation(); simulateVerification(card.id); }}
                              className="text-muted-foreground hover:text-primary"
                              title="Verify"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Delete button for failed/expired cards */}
                          {isFailed && cards.length > 1 && (
                            <button
                              onClick={e => { e.stopPropagation(); removeCard(card.id); }}
                              className="text-muted-foreground hover:text-destructive"
                              title="Remove card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground">Card Type</label>
                              <Input value={card.cardType} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Denomination</label>
                              <Input value={`$${card.denomination}`} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Naira Rate</label>
                              <Input value={`₦${systemNairaRate.toLocaleString()}`} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                              <p className="text-[9px] text-accent mt-0.5">🔒 From system config</p>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Unit Price (₦)</label>
                              <Input
                                value={card.unitPrice}
                                onChange={e => updateCard(card.id, { unitPrice: e.target.value })}
                                className="mt-0.5 h-8 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Cost Unit Price</label>
                              <Input value={cardCostUnit} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                              <p className="text-[9px] text-muted-foreground mt-0.5">= Unit Price ÷ Naira Rate</p>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground">Card Payout</label>
                              <Input value={`₦${cardPayout.toLocaleString()}`} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                              <p className="text-[9px] text-muted-foreground mt-0.5">= Denomination × Unit Price</p>
                            </div>
                          </div>

                          {Number(cardCostUnit) < 0.45 && (
                            <div className="bg-warning/10 border border-warning/30 rounded-md p-2 flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                              <p className="text-[10px] text-warning-foreground">Low cost unit price. This card may result in a loss.</p>
                            </div>
                          )}

                          {card.verificationMessage && (
                            <p className={`text-[10px] ${cfg.color} flex items-center gap-1`}>
                              <Icon className={`w-3 h-3 ${isSpinning ? "animate-spin" : ""}`} />
                              {card.verificationMessage}
                            </p>
                          )}

                          {/* Inline delete for failed cards */}
                          {isFailed && cards.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 w-full"
                              onClick={() => removeCard(card.id)}
                            >
                              <Trash2 className="w-3 h-3" /> Remove This Card
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Totals summary */}
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Payout ({cards.length} cards)</span>
                  <span className="font-bold text-base">₦{nairaTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Total Face Value</span>
                  <span>${totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {(["pending", "submitted", "processing", "verified", "failed", "expired"] as VerificationStatus[]).map(s => {
                  const c = STATUS_CONFIG[s];
                  const I = c.icon;
                  return <span key={s} className="flex items-center gap-1 text-[10px] text-muted-foreground"><I className={`w-3 h-3 ${c.color}`} /> {c.label}</span>;
                })}
              </div>

              {!allCardsVerified && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-primary">All cards must be verified before proceeding. Verification is done via API & webhook callbacks.</p>
                </div>
              )}

              {hasFailedCards && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">Some cards failed verification. Retry or remove them to proceed.</p>
                </div>
              )}
            </>
          )}

          {/* ===== STEP 3: Initiate Transfer ===== */}
          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Select a verified bank account to initiate the transfer.</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Customer</span><span className="font-medium">User-A7X3</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Payout</span><span className="font-medium text-accent">₦{nairaTotal.toLocaleString()}</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Verified Bank Accounts</label>
                {bankAccounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedBank(a.id); setTransferAmount(nairaTotal.toLocaleString()); }}
                    className={`w-full text-left border rounded-lg p-3 space-y-1 transition-colors ${selectedBank === a.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{a.bankName} · {a.accountNumber}</p>
                      <div className="flex items-center gap-2">
                        <span className="status-badge bg-success/10 text-success text-[10px]">Verified</span>
                        {selectedBank === a.id && <CheckCircle2 className="w-4 h-4 text-accent" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Holder: {a.holderName}</p>
                  </button>
                ))}
              </div>
              {selectedBank && (
                <div>
                  <label className="text-xs text-muted-foreground">Transfer Amount (₦)</label>
                  <Input value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="mt-1" />
                </div>
              )}
              <p className="text-[10px] text-destructive">⚠ Transfer will be executed immediately via 3rd-party merchant API. This action cannot be undone.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button variant="ghost" onClick={step === 0 ? handleClose : () => setStep(step - 1)} className="text-xs">
            {step === 0 ? "Cancel" : <><ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back</>}
          </Button>
          <div className="flex gap-2">
            {step < 2 ? (
              <Button onClick={handleNext} disabled={step === 1 && !allCardsVerified} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                {step === 1 && !allCardsVerified ? "Verify Cards First" : "Next"}
                {(step !== 1 || allCardsVerified) && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
              </Button>
            ) : (
              <Button
                disabled={!selectedBank}
                onClick={handleInitiateTransfer}
                className="text-xs bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Initiate Transfer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
