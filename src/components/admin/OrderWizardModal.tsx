import { useState, useCallback, DragEvent } from "react";
import {
  X, Plus, Trash2, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft,
  Upload, Loader2, XCircle, Clock, ShieldCheck, ChevronDown, ChevronUp,
  Image, GripVertical, Send as SendIcon, Camera, FileWarning, Scale,
  DollarSign, Globe, Ban, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cardRates, systemNairaRate, adListings, cardSources, type OrderStatus, type DisputeReason, type OrderRecord, type OrderCard } from "@/data/mock";

export interface CompletedOrder {
  orderId: string;
  customerAlias: string;
  cards: OrderCard[];
  totalPayout: number;
  totalFaceValue: number;
  status: OrderStatus;
  adListing?: string;
  timestamp: string;
  dailyRate: number;
  settlement?: { amountCNY: number; convertedNGN: number; rate: number };
  dispute?: OrderRecord["dispute"];
  cancellation?: OrderRecord["cancellation"];
  timeline: { event: string; time: string; status?: OrderStatus }[];
}

interface OrderWizardModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (order: CompletedOrder) => void;
}

const STEPS = ["Create Order", "Submit to Buyer", "Order Tracking", "Settlement", "Payment"];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  created: { label: "Created", icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  submitted: { label: "Submitted", icon: SendIcon, color: "text-primary", bg: "bg-primary/10" },
  under_review: { label: "Under Review", icon: Eye, color: "text-warning", bg: "bg-warning/10" },
  settled: { label: "Settled", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  disputed: { label: "Disputed", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  cancelled: { label: "Cancelled", icon: Ban, color: "text-muted-foreground", bg: "bg-muted" },
};

const DISPUTE_LABELS: Record<DisputeReason, { label: string; icon: typeof Scale }> = {
  amount_mismatch: { label: "Amount Mismatch", icon: DollarSign },
  rate_drop: { label: "Rate Drop", icon: Scale },
  currency_mismatch: { label: "Currency Mismatch", icon: Globe },
};

const chatImages = [
  { id: "img-1", label: "Card front #1", time: "10:35 AM", thumbnail: "front" },
  { id: "img-2", label: "Card back #1", time: "10:35 AM", thumbnail: "back" },
  { id: "img-3", label: "Card front #2", time: "10:36 AM", thumbnail: "front" },
  { id: "img-4", label: "Card back #2", time: "10:36 AM", thumbnail: "back" },
  { id: "img-5", label: "Receipt photo", time: "10:37 AM", thumbnail: "receipt" },
];

interface CardEntry extends OrderCard {
  unitPrice: string;
}

const makeCard = (): CardEntry => ({
  id: Date.now() + Math.random(),
  code: "",
  hasImage: false,
  cardType: "iTunes US",
  cardFormat: "Physical",
  currency: "USD",
  denomination: "100",
  unitPrice: "680",
});

export default function OrderWizardModal({ open, onClose, onComplete }: OrderWizardModalProps) {
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState<CardEntry[]>([makeCard()]);
  const [customerAlias, setCustomerAlias] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [cardSource, setCardSource] = useState(cardSources[0]);
  const [dailyRate, setDailyRate] = useState(String(systemNairaRate));

  // Step 2
  const [selectedAd, setSelectedAd] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("created");
  const [timeline, setTimeline] = useState<{ event: string; time: string; status?: OrderStatus }[]>([]);

  // Step 4 - Settlement/Negotiation
  const [settlementCNY, setSettlementCNY] = useState("");
  const [disputeReason, setDisputeReason] = useState<DisputeReason | "">("");
  const [disputeBuyerAmount, setDisputeBuyerAmount] = useState("");
  const [disputeNewRate, setDisputeNewRate] = useState("");
  const [disputeDetectedCurrency, setDisputeDetectedCurrency] = useState("");
  const [disputeProofUploaded, setDisputeProofUploaded] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationProofUploaded, setCancellationProofUploaded] = useState(false);
  const [buyerOutcome, setBuyerOutcome] = useState<"settled" | "disputed" | "cancelled" | "">("");

  // Step 5 - Payment confirmation
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Drag-drop
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [dropTargetCard, setDropTargetCard] = useState<number | null>(null);
  const [cardImageMap, setCardImageMap] = useState<Record<number, string>>({});

  // Completed
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const totalAmount = cards.reduce((sum, c) => sum + Number(c.denomination), 0);
  const nairaTotal = cards.reduce((sum, c) => sum + Number(c.denomination) * Number(c.unitPrice), 0);
  const settlementNGN = Number(settlementCNY) * Number(dailyRate);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const validateAlias = (val: string) => {
    const trimmed = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (trimmed.length !== 6) {
      setAliasError("Must be exactly 6 characters (A-Z, 0-9)");
      return false;
    }
    setAliasError("");
    return true;
  };

  const handleDragStart = (imageId: string) => setDraggingImage(imageId);
  const handleDragOver = (e: DragEvent, cardId: number) => { e.preventDefault(); setDropTargetCard(cardId); };
  const handleDragLeave = () => setDropTargetCard(null);
  const handleDrop = (e: DragEvent, cardId: number) => {
    e.preventDefault();
    if (draggingImage) {
      setCardImageMap(prev => ({ ...prev, [cardId]: draggingImage }));
      updateCard(cardId, { hasImage: true, imageId: draggingImage });
    }
    setDraggingImage(null);
    setDropTargetCard(null);
  };

  const detachImage = (cardId: number) => {
    setCardImageMap(prev => { const c = { ...prev }; delete c[cardId]; return c; });
    updateCard(cardId, { hasImage: false, imageId: undefined });
  };

  const updateCard = (id: number, updates: Partial<CardEntry>) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCard = () => { if (cards.length >= 15) return; setCards([...cards, makeCard()]); };
  const removeCard = (id: number) => { if (cards.length <= 1) return; setCards(cards.filter(c => c.id !== id)); };

  const handleCreateOrder = () => {
    if (!validateAlias(customerAlias)) return;
    if (cards.some(c => !c.code.trim())) return;
    const t = now();
    setTimeline([{ event: "Order created", time: t, status: "created" }]);
    setOrderStatus("created");
    setStep(1);
  };

  const handleSubmitToBuyer = () => {
    if (!selectedAd) return;
    const t = now();
    const adName = adListings.find(a => a.id === selectedAd)?.name || selectedAd;
    setTimeline(prev => [...prev, { event: `Submitted to Cardlight (AD: ${adName})`, time: t, status: "submitted" }]);
    setOrderStatus("submitted");
    // Simulate buyer reviewing
    setTimeout(() => {
      setTimeline(prev => [...prev, { event: "Under review by buyer", time: now(), status: "under_review" }]);
      setOrderStatus("under_review");
      setStep(2);
    }, 1200);
  };

  const handleBuyerOutcome = (outcome: "settled" | "disputed" | "cancelled") => {
    setBuyerOutcome(outcome);
    const t = now();
    if (outcome === "settled") {
      setTimeline(prev => [...prev, { event: "Buyer settled the order", time: t, status: "settled" }]);
      setOrderStatus("settled");
    } else if (outcome === "disputed") {
      setTimeline(prev => [...prev, { event: "Buyer raised a dispute", time: t, status: "disputed" }]);
      setOrderStatus("disputed");
    } else {
      setTimeline(prev => [...prev, { event: "Buyer cancelled the order", time: t, status: "cancelled" }]);
      setOrderStatus("cancelled");
    }
    setStep(3);
  };

  const handleResolveDispute = (action: "accept" | "reject") => {
    const t = now();
    if (action === "accept") {
      setTimeline(prev => [...prev, { event: "Agent accepted negotiation terms", time: t }]);
      setOrderStatus("settled");
      setBuyerOutcome("settled");
      setStep(4);
    } else {
      setTimeline(prev => [...prev, { event: "Agent rejected — order cancelled", time: t, status: "cancelled" }]);
      setOrderStatus("cancelled");
      setShowConfirmation(true);
      finalizeOrder("cancelled");
    }
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    const t = now();
    setTimeline(prev => [...prev, { event: "Payment confirmed to customer", time: t }]);
    finalizeOrder("settled");
    setShowConfirmation(true);
  };

  const finalizeOrder = (finalStatus: OrderStatus) => {
    const order: CompletedOrder = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerAlias: customerAlias.toUpperCase(),
      cards: cards.map(c => ({ id: c.id, cardType: c.cardType, cardFormat: c.cardFormat, currency: c.currency, denomination: c.denomination, code: c.code, hasImage: c.hasImage, imageId: c.imageId })),
      totalPayout: buyerOutcome === "settled" ? settlementNGN || nairaTotal : nairaTotal,
      totalFaceValue: totalAmount,
      status: finalStatus,
      adListing: selectedAd,
      timestamp: now(),
      dailyRate: Number(dailyRate),
      settlement: buyerOutcome === "settled" ? { amountCNY: Number(settlementCNY) || totalAmount, convertedNGN: settlementNGN || nairaTotal, rate: Number(dailyRate) } : undefined,
      dispute: buyerOutcome === "disputed" ? { reason: disputeReason as DisputeReason, buyerAmount: Number(disputeBuyerAmount), submittedAmount: totalAmount, originalRate: Number(dailyRate), newRate: Number(disputeNewRate), detectedCurrency: disputeDetectedCurrency, proofUploaded: disputeProofUploaded } : undefined,
      cancellation: buyerOutcome === "cancelled" ? { reason: cancellationReason, proofUploaded: cancellationProofUploaded } : undefined,
      timeline,
    };
    setCompletedOrder(order);
    onComplete?.(order);
  };

  const handleClose = () => {
    setStep(0); setShowConfirmation(false); setCompletedOrder(null);
    setCustomerAlias(""); setAliasError(""); setCards([makeCard()]); setSelectedAd("");
    setOrderStatus("created"); setTimeline([]); setBuyerOutcome("");
    setSettlementCNY(""); setDisputeReason(""); setDisputeBuyerAmount("");
    setDisputeNewRate(""); setDisputeDetectedCurrency("");
    setDisputeProofUploaded(false); setCancellationReason("");
    setCancellationProofUploaded(false); setPaymentConfirmed(false);
    setCardImageMap({});
    onClose();
  };

  if (!open) return null;

  // Confirmation/completion screen
  if (showConfirmation && completedOrder) {
    const stCfg = STATUS_CONFIG[completedOrder.status];
    const StIcon = stCfg.icon;
    return (
      <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
        <div className="bg-card rounded-xl w-[520px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-full ${stCfg.bg} flex items-center justify-center mx-auto`}>
                <StIcon className={`w-7 h-7 ${stCfg.color}`} />
              </div>
              <h3 className="font-heading font-bold text-lg">
                {completedOrder.status === "settled" ? "Order Complete" : completedOrder.status === "cancelled" ? "Order Cancelled" : "Order Updated"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {completedOrder.status === "settled" ? "Payment has been confirmed and sent to the customer." : "This order has been closed."}
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Order Summary</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.color}`}>{stCfg.label}</span>
              </div>
              <div className="space-y-2">
                {[
                  ["Order ID", completedOrder.orderId],
                  ["Customer Alias", completedOrder.customerAlias],
                  ["Cards", `${completedOrder.cards.length} card${completedOrder.cards.length > 1 ? "s" : ""}`],
                  ["Total Face Value", `$${completedOrder.totalFaceValue}`],
                  ...(completedOrder.settlement ? [
                    ["Settlement (CNY)", `¥${completedOrder.settlement.amountCNY}`],
                    ["Converted (NGN)", `₦${completedOrder.settlement.convertedNGN.toLocaleString()}`],
                  ] : []),
                  ["Daily Rate", `₦${completedOrder.dailyRate.toLocaleString()}/CNY`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="border rounded-lg p-4 space-y-2">
              <span className="text-xs font-semibold">Timeline</span>
              <div className="space-y-2 pl-3 border-l-2 border-accent/20">
                {completedOrder.timeline.map((t, i) => (
                  <div key={i} className="relative pl-3">
                    <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-accent border-2 border-accent" />
                    <p className="text-xs font-medium">{t.event}</p>
                    <p className="text-[10px] text-muted-foreground">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t">
            <Button onClick={handleClose} className="w-full text-xs bg-accent text-accent-foreground hover:bg-accent/90">Done</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = orderStatus === "created" ? 0 : orderStatus === "submitted" ? 1 : orderStatus === "under_review" ? 2 : orderStatus === "settled" || orderStatus === "disputed" || orderStatus === "cancelled" ? 3 : 0;
  const displayStep = Math.min(step, 4);

  return (
    <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-[580px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base">{STEPS[displayStep]}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Step {displayStep + 1} of {STEPS.length}</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= displayStep ? "bg-accent" : "bg-muted"}`} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

          {/* ===== STEP 1: Create Order ===== */}
          {step === 0 && (
            <>
              {/* Customer Alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Customer Alias <span className="text-destructive">*</span></label>
                <Input
                  placeholder="e.g. A7X3KP (6 characters)"
                  value={customerAlias}
                  onChange={e => { setCustomerAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)); setAliasError(""); }}
                  className={`text-sm uppercase tracking-wider ${aliasError ? "border-destructive" : ""}`}
                  maxLength={6}
                />
                {aliasError && <p className="text-[10px] text-destructive">{aliasError}</p>}
              </div>

              {/* Card Type & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Card Source</label>
                  <select
                    value={cardSource}
                    onChange={e => setCardSource(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {cardSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Daily Rate (CNY → NGN)</label>
                  <Input value={dailyRate} onChange={e => setDailyRate(e.target.value)} className="text-xs h-9" />
                  <p className="text-[9px] text-muted-foreground">₦{Number(dailyRate).toLocaleString()}/CNY</p>
                </div>
              </div>

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">{cards.length} card{cards.length > 1 ? "s" : ""}</span>
                <span className="text-xs font-semibold">Total: ${totalAmount} · ₦{nairaTotal.toLocaleString()}</span>
              </div>

              {/* Chat Images Panel */}
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Image className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">Chat Images</span>
                  <span className="text-[10px] text-muted-foreground">— drag to attach</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {chatImages.map(img => {
                    const isUsed = Object.values(cardImageMap).includes(img.id);
                    return (
                      <div
                        key={img.id}
                        draggable={!isUsed}
                        onDragStart={() => handleDragStart(img.id)}
                        onDragEnd={() => { setDraggingImage(null); setDropTargetCard(null); }}
                        className={`shrink-0 w-20 rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all ${draggingImage === img.id ? "opacity-50 scale-95" : ""} ${isUsed ? "opacity-40 cursor-not-allowed grayscale" : "hover:border-accent"}`}
                      >
                        <div className="h-14 bg-muted flex items-center justify-center relative">
                          <Image className="w-5 h-5 text-muted-foreground/60" />
                          {!isUsed && <GripVertical className="w-3 h-3 text-muted-foreground/40 absolute top-0.5 right-0.5" />}
                          {isUsed && <div className="absolute inset-0 bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-success" /></div>}
                        </div>
                        <div className="px-1.5 py-1">
                          <p className="text-[9px] font-medium truncate">{img.label}</p>
                          <p className="text-[8px] text-muted-foreground">{img.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card entries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Cards ({cards.length}/15)</label>
                  <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={addCard} disabled={cards.length >= 15}>
                    <Plus className="w-3 h-3" /> Add Card
                  </Button>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {cards.map((card, idx) => {
                    const attachedImg = cardImageMap[card.id];
                    const attachedLabel = attachedImg ? chatImages.find(i => i.id === attachedImg)?.label : null;
                    const isDropTarget = dropTargetCard === card.id;
                    return (
                      <div
                        key={card.id}
                        onDragOver={(e) => handleDragOver(e, card.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, card.id)}
                        className={`border rounded-lg p-3 space-y-2 transition-all ${isDropTarget ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-border"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">Card #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            {card.hasImage && attachedLabel && (
                              <span className="text-[10px] text-accent flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> {attachedLabel}
                                <button onClick={() => detachImage(card.id)} className="ml-0.5 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                              </span>
                            )}
                            {cards.length > 1 && (
                              <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <select
                            value={card.cardType}
                            onChange={e => {
                              const selected = cardRates.find(r => r.cardType === e.target.value);
                              updateCard(card.id, { cardType: e.target.value, currency: selected?.currency || card.currency, unitPrice: String(selected?.buyRate || card.unitPrice) });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring col-span-2"
                          >
                            {[...new Set(cardRates.map(r => r.cardType))].map(ct => <option key={ct} value={ct}>{ct}</option>)}
                          </select>
                          <select
                            value={card.cardFormat}
                            onChange={e => {
                              const fmt = e.target.value as "Physical" | "E-Code";
                              const matched = cardRates.find(r => r.cardType === card.cardType && r.cardFormat === fmt);
                              updateCard(card.id, { cardFormat: fmt, unitPrice: String(matched?.buyRate || card.unitPrice) });
                            }}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="Physical">Physical</option>
                            <option value="E-Code">E-Code</option>
                          </select>
                          <Input placeholder="Amt ($)" value={card.denomination} onChange={e => updateCard(card.id, { denomination: e.target.value })} className="text-xs h-9" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{card.currency}</span>
                          <span className="text-[10px] text-muted-foreground">Rate: ₦{card.unitPrice}/$1</span>
                        </div>
                        <Input placeholder="Card code / PIN" value={card.code} onChange={e => updateCard(card.id, { code: e.target.value })} className="text-sm" />
                        {!card.hasImage ? (
                          <div className={`flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-md border border-dashed transition-all w-full justify-center ${isDropTarget ? "border-accent bg-accent/10 text-accent scale-[1.02]" : "border-muted-foreground/30 text-muted-foreground"}`}>
                            <Upload className="w-3.5 h-3.5" />
                            {isDropTarget ? "Drop image here" : "Drag a chat image here"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-accent/30 bg-accent/5 text-accent">
                            <Image className="w-3.5 h-3.5" /><span className="flex-1">{attachedLabel || "Image attached"}</span>
                            <button onClick={() => detachImage(card.id)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 2: Submit to Buyer ===== */}
          {step === 1 && (
            <>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold">Order Summary</h4>
                <div className="space-y-2">
                  {[
                    ["Customer Alias", customerAlias],
                    ["Cards", `${cards.length} card${cards.length > 1 ? "s" : ""}`],
                    ["Total Face Value", `$${totalAmount}`],
                    ["Estimated Payout", `₦${nairaTotal.toLocaleString()}`],
                    ["Daily Rate", `₦${Number(dailyRate).toLocaleString()}/CNY`],
                    ["Source", cardSource],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 space-y-1">
                  {cards.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-muted-foreground">Card #{i + 1}: {c.cardType} · {c.cardFormat}</span>
                      <span className="font-medium">${c.denomination}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AD Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Select AD / Listing <span className="text-destructive">*</span></label>
                <p className="text-[10px] text-muted-foreground">Choose the correct buyer listing on Cardlight</p>
                <div className="space-y-1.5">
                  {adListings.filter(a => a.active).map(ad => (
                    <button
                      key={ad.id}
                      onClick={() => setSelectedAd(ad.id)}
                      className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedAd === ad.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{ad.name}</p>
                          <p className="text-[10px] text-muted-foreground">{ad.id} · {ad.platform}</p>
                        </div>
                        {selectedAd === ad.id && <CheckCircle2 className="w-4 h-4 text-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 3: Order Tracking ===== */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${STATUS_CONFIG[orderStatus].bg} flex items-center justify-center`}>
                  {(() => { const I = STATUS_CONFIG[orderStatus].icon; return <I className={`w-5 h-5 ${STATUS_CONFIG[orderStatus].color}`} />; })()}
                </div>
                <div>
                  <p className="text-sm font-semibold">Status: {STATUS_CONFIG[orderStatus].label}</p>
                  <p className="text-[10px] text-muted-foreground">Waiting for buyer response from Cardlight</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                {[
                  ["Customer", customerAlias],
                  ["Cards", `${cards.length} · $${totalAmount}`],
                  ["AD Listing", adListings.find(a => a.id === selectedAd)?.name || selectedAd],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="border rounded-lg p-4 space-y-2">
                <span className="text-xs font-semibold">Timeline</span>
                <div className="space-y-2 pl-3 border-l-2 border-accent/20">
                  {timeline.map((t, i) => {
                    const stCfg = t.status ? STATUS_CONFIG[t.status] : null;
                    return (
                      <div key={i} className="relative pl-3">
                        <div className={`absolute -left-[7px] top-0.5 w-3 h-3 rounded-full border-2 ${stCfg ? `${stCfg.bg} border-current ${stCfg.color}` : "bg-accent border-accent"}`} />
                        <p className="text-xs font-medium">{t.event}</p>
                        <p className="text-[10px] text-muted-foreground">{t.time}</p>
                      </div>
                    );
                  })}
                  {orderStatus === "under_review" && (
                    <div className="relative pl-3">
                      <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-warning/20 border-2 border-warning animate-pulse" />
                      <p className="text-xs font-medium text-warning flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Awaiting buyer decision...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulate buyer outcomes */}
              {orderStatus === "under_review" && (
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Simulate Buyer Response</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-9 gap-1 border-success/30 text-success hover:bg-success/10" onClick={() => handleBuyerOutcome("settled")}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-9 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleBuyerOutcome("disputed")}>
                      <AlertTriangle className="w-3.5 h-3.5" /> Disputed
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-9 gap-1 border-muted-foreground/30 text-muted-foreground hover:bg-muted" onClick={() => handleBuyerOutcome("cancelled")}>
                      <Ban className="w-3.5 h-3.5" /> Cancelled
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STEP 4: Settlement / Negotiation / Cancellation ===== */}
          {step === 3 && (
            <>
              {/* A. Settled */}
              {buyerOutcome === "settled" && (
                <>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <h4 className="text-sm font-semibold text-success">Order Settled</h4>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Settlement Amount (CNY)</label>
                      <Input value={settlementCNY} onChange={e => setSettlementCNY(e.target.value)} placeholder="e.g. 1360" className="text-sm" />
                    </div>
                    {settlementCNY && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">CNY Amount</span>
                          <span className="font-medium">¥{Number(settlementCNY).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-medium">₦{Number(dailyRate).toLocaleString()}/CNY</span>
                        </div>
                        <div className="flex justify-between text-xs border-t pt-1">
                          <span className="text-muted-foreground">NGN Payout</span>
                          <span className="font-bold text-success">₦{settlementNGN.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* B. Disputed */}
              {buyerOutcome === "disputed" && (
                <>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <h4 className="text-sm font-semibold text-destructive">Order Disputed</h4>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Dispute Reason <span className="text-destructive">*</span></label>
                      <select
                        value={disputeReason}
                        onChange={e => setDisputeReason(e.target.value as DisputeReason)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select reason...</option>
                        <option value="amount_mismatch">Amount Mismatch</option>
                        <option value="rate_drop">Rate Drop</option>
                        <option value="currency_mismatch">Currency Mismatch</option>
                      </select>
                    </div>

                    {disputeReason === "amount_mismatch" && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-medium">Amount Mismatch</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Submitted Amount</label>
                            <Input value={`$${totalAmount}`} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Buyer's Amount</label>
                            <Input value={disputeBuyerAmount} onChange={e => setDisputeBuyerAmount(e.target.value)} placeholder="e.g. 180" className="mt-0.5 h-8 text-xs" />
                          </div>
                        </div>
                        {disputeBuyerAmount && (
                          <div className="bg-warning/10 rounded-md p-2 text-xs text-warning">
                            Difference: ${totalAmount - Number(disputeBuyerAmount)} ({((1 - Number(disputeBuyerAmount) / totalAmount) * 100).toFixed(1)}% less)
                          </div>
                        )}
                      </div>
                    )}

                    {disputeReason === "rate_drop" && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-medium">Rate Drop</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Original Rate</label>
                            <Input value={`₦${dailyRate}`} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">New Rate (Buyer)</label>
                            <Input value={disputeNewRate} onChange={e => setDisputeNewRate(e.target.value)} placeholder="e.g. 1520" className="mt-0.5 h-8 text-xs" />
                          </div>
                        </div>
                        {disputeNewRate && (
                          <div className="bg-warning/10 rounded-md p-2 text-xs text-warning">
                            Rate change: ₦{Number(dailyRate) - Number(disputeNewRate)} drop ({((1 - Number(disputeNewRate) / Number(dailyRate)) * 100).toFixed(1)}% decrease)
                          </div>
                        )}
                      </div>
                    )}

                    {disputeReason === "currency_mismatch" && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-destructive" />
                          <span className="text-xs font-medium">Currency Mismatch</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">Expected Currency</label>
                            <Input value={cards[0]?.currency || "USD"} readOnly className="mt-0.5 bg-muted h-8 text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Detected Currency</label>
                            <Input value={disputeDetectedCurrency} onChange={e => setDisputeDetectedCurrency(e.target.value)} placeholder="e.g. CAD" className="mt-0.5 h-8 text-xs" />
                          </div>
                        </div>
                      </div>
                    )}

                    {disputeReason && (
                      <>
                        {/* Proof upload */}
                        <div className="border-t pt-3 space-y-2">
                          <label className="text-xs font-medium">Upload Proof <span className="text-destructive">*</span></label>
                          {!disputeProofUploaded ? (
                            <button
                              onClick={() => setDisputeProofUploaded(true)}
                              className="w-full flex items-center gap-2 justify-center border border-dashed rounded-lg p-3 text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                            >
                              <Camera className="w-4 h-4" /> Upload screenshot proof
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-lg p-2">
                              <CheckCircle2 className="w-4 h-4" /> Proof screenshot uploaded
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* C. Cancelled */}
              {buyerOutcome === "cancelled" && (
                <div className="bg-muted border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Ban className="w-5 h-5 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Order Cancelled by Buyer</h4>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Cancellation Reason</label>
                    <Input value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} placeholder="Reason provided by buyer..." className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Upload Proof <span className="text-destructive">*</span></label>
                    {!cancellationProofUploaded ? (
                      <button
                        onClick={() => setCancellationProofUploaded(true)}
                        className="w-full flex items-center gap-2 justify-center border border-dashed rounded-lg p-3 text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Upload screenshot proof
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-success bg-success/10 rounded-lg p-2">
                        <CheckCircle2 className="w-4 h-4" /> Proof screenshot uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STEP 5: Payment Confirmation ===== */}
          {step === 4 && (
            <>
              <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h4 className="text-sm font-semibold text-success">Confirm Payment to Customer</h4>
                </div>
                <div className="space-y-2">
                  {[
                    ["Customer Alias", customerAlias],
                    ["Settlement (CNY)", `¥${Number(settlementCNY).toLocaleString()}`],
                    ["Converted (NGN)", `₦${settlementNGN.toLocaleString()}`],
                    ["Rate Used", `₦${Number(dailyRate).toLocaleString()}/CNY`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-warning">This action confirms payout to the customer. Please verify the amounts before proceeding.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button variant="ghost" onClick={step === 0 ? handleClose : () => setStep(step - 1)} className="text-xs">
            {step === 0 ? "Cancel" : <><ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back</>}
          </Button>
          <div className="flex gap-2">
            {step === 0 && (
              <Button onClick={handleCreateOrder} disabled={!customerAlias || cards.some(c => !c.code.trim())} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                Create Order <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {step === 1 && (
              <Button onClick={handleSubmitToBuyer} disabled={!selectedAd} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                Submit to Buyer <SendIcon className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {step === 2 && orderStatus !== "under_review" && (
              <Button onClick={() => setStep(3)} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {step === 3 && buyerOutcome === "settled" && (
              <Button onClick={() => setStep(4)} disabled={!settlementCNY} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                Proceed to Payment <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
            {step === 3 && buyerOutcome === "disputed" && disputeReason && disputeProofUploaded && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs h-9 text-destructive border-destructive/30" onClick={() => handleResolveDispute("reject")}>
                  Reject & Cancel
                </Button>
                <Button size="sm" className="text-xs h-9 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleResolveDispute("accept")}>
                  Accept Terms
                </Button>
              </div>
            )}
            {step === 3 && buyerOutcome === "cancelled" && cancellationProofUploaded && (
              <Button onClick={() => { finalizeOrder("cancelled"); setShowConfirmation(true); }} className="text-xs bg-muted text-foreground hover:bg-muted/80">
                Close Order
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleConfirmPayment} className="text-xs bg-success text-success-foreground hover:bg-success/90">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
