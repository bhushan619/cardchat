import { useState, useCallback, DragEvent } from "react";
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Upload, Loader2, XCircle, Clock, RefreshCw, ShieldCheck, ChevronDown, ChevronUp, Image, GripVertical, ExternalLink, Package, CreditCard, Send, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cardRates, systemNairaRate, bankAccounts } from "@/data/mock";

type CardlightStatus = "pending" | "submitted" | "buyer_received" | "buyer_checking" | "settled" | "negotiation" | "cancelled" | "failed";

interface CardEntry {
  id: number;
  code: string;
  hasImage: boolean;
  cardType: string;
  cardFormat: "Physical" | "E-Code";
  currency: string;
  denomination: string;
  unitPrice: string;
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

const STEPS = ["Upload Card Image", "Create Order", "Sell to Cardlight", "Payment"];

const CARDLIGHT_STATUS_CONFIG: Record<CardlightStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending:         { label: "Pending",          icon: Clock,         color: "text-muted-foreground", bg: "bg-muted" },
  submitted:       { label: "Submitted",        icon: Loader2,       color: "text-primary",          bg: "bg-primary/10" },
  buyer_received:  { label: "Buyer Received",   icon: Package,       color: "text-primary",          bg: "bg-primary/10" },
  buyer_checking:  { label: "Buyer Checking",   icon: Loader2,       color: "text-warning",          bg: "bg-warning/10" },
  settled:         { label: "Settled",           icon: CheckCircle2,  color: "text-success",          bg: "bg-success/10" },
  negotiation:     { label: "Negotiation",       icon: AlertTriangle, color: "text-warning",          bg: "bg-warning/10" },
  cancelled:       { label: "Cancelled",         icon: XCircle,       color: "text-destructive",      bg: "bg-destructive/10" },
  failed:          { label: "Failed",            icon: XCircle,       color: "text-destructive",      bg: "bg-destructive/10" },
};

// Mock AD listings on Cardlight
const adListings = [
  { id: "ad-1", name: "iTunes US - High Rate", buyer: "Buyer_Alpha", rate: "₦690/$1", status: "active" },
  { id: "ad-2", name: "iTunes US - Fast Settlement", buyer: "Buyer_Beta", rate: "₦680/$1", status: "active" },
  { id: "ad-3", name: "Amazon US - Premium", buyer: "Buyer_Gamma", rate: "₦630/$1", status: "active" },
  { id: "ad-4", name: "Steam US - Standard", buyer: "Buyer_Delta", rate: "₦610/$1", status: "active" },
];

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
  cardFormat: "Physical",
  currency: "USD",
  denomination: "100",
  unitPrice: "680",
});

export default function OrderWizardModal({ open, onClose, onComplete }: OrderWizardModalProps) {
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState<CardEntry[]>([makeCard()]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  // Step 1 - Upload images
  const [draggingImage, setDraggingImage] = useState<string | null>(null);
  const [dropTargetCard, setDropTargetCard] = useState<number | null>(null);
  const [cardImageMap, setCardImageMap] = useState<Record<number, string>>({});

  // Step 2 - Create order (AD selection)
  const [selectedAd, setSelectedAd] = useState<string | null>(null);

  // Step 3 - Cardlight status tracking
  const [cardlightStatus, setCardlightStatus] = useState<CardlightStatus>("pending");
  const [statusLog, setStatusLog] = useState<{ time: string; status: string; message: string }[]>([]);

  // Step 4 - Payment
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  // Derived
  const totalAmount = cards.reduce((sum, c) => sum + Number(c.denomination), 0);
  const nairaTotal = cards.reduce((sum, c) => sum + Number(c.denomination) * Number(c.unitPrice), 0);
  const allCardsHaveImages = cards.every(c => c.hasImage);

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
  };

  // Drag-drop handlers
  const handleDragStart = (imageId: string) => setDraggingImage(imageId);
  const handleDragOver = (e: DragEvent, cardId: number) => { e.preventDefault(); setDropTargetCard(cardId); };
  const handleDragLeave = () => setDropTargetCard(null);
  const handleDrop = (e: DragEvent, cardId: number) => {
    e.preventDefault();
    if (draggingImage) {
      setCardImageMap(prev => ({ ...prev, [cardId]: draggingImage }));
      updateCard(cardId, { hasImage: true });
    }
    setDraggingImage(null);
    setDropTargetCard(null);
  };
  const detachImage = (cardId: number) => {
    setCardImageMap(prev => { const copy = { ...prev }; delete copy[cardId]; return copy; });
    updateCard(cardId, { hasImage: false });
  };

  // Simulate Cardlight submission flow
  const simulateCardlightFlow = useCallback(() => {
    const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    setCardlightStatus("submitted");
    setStatusLog([{ time: now(), status: "Submitted", message: "Order submitted to Cardlight platform" }]);

    setTimeout(() => {
      setCardlightStatus("buyer_received");
      setStatusLog(prev => [...prev, { time: now(), status: "Buyer Received", message: "Buyer has received the order on Cardlight" }]);
    }, 1500);

    setTimeout(() => {
      setCardlightStatus("buyer_checking");
      setStatusLog(prev => [...prev, { time: now(), status: "Buyer Checking", message: "Buyer is checking order information..." }]);
    }, 3000);

    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.75) {
        setCardlightStatus("settled");
        setStatusLog(prev => [...prev, { time: now(), status: "Settled", message: "Order settled by buyer. Ready for payment." }]);
      } else if (rand < 0.9) {
        setCardlightStatus("negotiation");
        setStatusLog(prev => [...prev, { time: now(), status: "Negotiation", message: "Buyer raised a negotiation — check Cardlight for details (amount/rate/currency mismatch)" }]);
      } else {
        setCardlightStatus("cancelled");
        setStatusLog(prev => [...prev, { time: now(), status: "Cancelled", message: "Order was cancelled by buyer. Check reason on Cardlight." }]);
      }
    }, 5000);
  }, []);

  const handleNext = () => {
    if (step === 0 && !allCardsHaveImages) return;
    if (step === 1 && !selectedAd) return;
    if (step === 1) {
      // Moving to step 2 triggers Cardlight submission
      setStep(2);
      simulateCardlightFlow();
      return;
    }
    if (step === 2 && cardlightStatus !== "settled") return;
    if (step < 3) {
      setStep(step + 1);
      if (step === 2 && !transferAmount) {
        setTransferAmount(nairaTotal.toLocaleString());
      }
    }
  };

  const handleInitiateTransfer = () => {
    const bank = bankAccounts.find(a => a.id === selectedBank);
    if (!bank) return;
    const order: CompletedOrder = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      cards: cards.map(c => ({ cardType: c.cardType, denomination: c.denomination, unitPrice: c.unitPrice, status: "settled" })),
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
    setCardlightStatus("pending");
    setStatusLog([]);
    setSelectedAd(null);
    onClose();
  };

  if (!open) return null;

  // Confirmation screen
  if (showConfirmation && completedOrder) {
    return (
      <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
        <div className="bg-card rounded-xl w-[520px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-heading font-bold text-lg">Transfer Initiated</h3>
              <p className="text-sm text-muted-foreground">Payment has been submitted based on the buyer's settled order.</p>
            </div>
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
            <Button onClick={handleClose} className="w-full text-xs bg-accent text-accent-foreground hover:bg-accent/90">Done</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-[580px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base">{STEPS[step]}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Step {step + 1} of 4</p>
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

          {/* ===== STEP 1: Upload Card Image ===== */}
          {step === 0 && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-primary">Customer has sent cards. Drag chat images to attach them to each card entry below.</p>
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
                        className={`shrink-0 w-20 rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                          draggingImage === img.id ? "opacity-50 scale-95" : ""
                        } ${isUsed ? "opacity-40 cursor-not-allowed grayscale" : "hover:border-accent"}`}
                      >
                        <div className="h-14 bg-muted flex items-center justify-center relative">
                          <Image className="w-5 h-5 text-muted-foreground/60" />
                          {!isUsed && <GripVertical className="w-3 h-3 text-muted-foreground/40 absolute top-0.5 right-0.5" />}
                          {isUsed && (
                            <div className="absolute inset-0 bg-success/10 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            </div>
                          )}
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

              {/* Card entries for image attachment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Cards ({cards.length}/15)</label>
                  <Button size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={addCard} disabled={cards.length >= 15}>
                    <Plus className="w-3 h-3" /> Add Card
                  </Button>
                </div>

                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
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
                        className={`border rounded-lg p-3 transition-all ${
                          isDropTarget ? "border-accent bg-accent/5 ring-2 ring-accent/20" : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Card #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            {card.hasImage && attachedLabel && (
                              <span className="text-[10px] text-accent flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> {attachedLabel}
                                <button onClick={() => detachImage(card.id)} className="ml-0.5 hover:text-destructive">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            )}
                            {cards.length > 1 && (
                              <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {!card.hasImage ? (
                          <div className={`flex items-center gap-1.5 text-xs px-3 py-3 rounded-md border border-dashed transition-all w-full justify-center ${
                            isDropTarget ? "border-accent bg-accent/10 text-accent scale-[1.02]" : "border-muted-foreground/30 text-muted-foreground"
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            {isDropTarget ? "Drop image here" : "Drag a chat image here to attach"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border border-accent/30 bg-accent/5 text-accent">
                            <Image className="w-3.5 h-3.5" />
                            <span className="flex-1">{attachedLabel || "Image attached"}</span>
                            <button onClick={() => detachImage(card.id)} className="hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!allCardsHaveImages && (
                <p className="text-[10px] text-muted-foreground text-center">Attach images to all cards to proceed</p>
              )}
            </>
          )}

          {/* ===== STEP 2: Create Order ===== */}
          {step === 1 && (
            <>
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">{cards.length} card{cards.length > 1 ? "s" : ""}</span>
                <span className="text-xs font-semibold">Total: ${totalAmount}</span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {cards.map((card, idx) => (
                  <div key={card.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Card #{idx + 1}</span>
                      {cards.length > 1 && (
                        <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <select
                        value={card.cardType}
                        onChange={e => {
                          const selected = cardRates.find(r => r.cardType === e.target.value);
                          updateCard(card.id, {
                            cardType: e.target.value,
                            currency: selected?.currency || card.currency,
                            unitPrice: String(selected?.buyRate || card.unitPrice),
                          });
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring col-span-2"
                      >
                        {[...new Set(cardRates.map(r => r.cardType))].map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
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
                      <Input placeholder="Denom ($)" value={card.denomination} onChange={e => updateCard(card.id, { denomination: e.target.value })} className="text-xs h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{card.currency}</span>
                      <span className="text-[10px] text-muted-foreground">Rate: ₦{card.unitPrice}/$1</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">Naira Rate: ₦{systemNairaRate.toLocaleString()}</span>
                    </div>
                    <Input placeholder="Enter card code / PIN" value={card.code} onChange={e => updateCard(card.id, { code: e.target.value })} className="text-sm" />
                  </div>
                ))}
              </div>

              <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 w-full" onClick={addCard} disabled={cards.length >= 15}>
                <Plus className="w-3 h-3" /> Add Another Card
              </Button>

              {/* AD Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="text-xs font-medium">Select AD to Upload</label>
                </div>
                <p className="text-[10px] text-muted-foreground">Choose the Cardlight advertisement listing to submit this order to.</p>
                <div className="space-y-1.5">
                  {adListings.map(ad => (
                    <button
                      key={ad.id}
                      onClick={() => setSelectedAd(ad.id)}
                      className={`w-full text-left border rounded-lg px-3 py-2.5 transition-colors ${
                        selectedAd === ad.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">{ad.name}</p>
                          <p className="text-[10px] text-muted-foreground">Buyer: {ad.buyer} · {ad.rate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success">{ad.status}</span>
                          {selectedAd === ad.id && <CheckCircle2 className="w-4 h-4 text-accent" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!selectedAd && (
                <p className="text-[10px] text-muted-foreground text-center">Select an AD listing to proceed</p>
              )}
            </>
          )}

          {/* ===== STEP 3: Sell to Cardlight (Status Tracking) ===== */}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">Cardlight Order Status</h4>
                </div>
                {(() => {
                  const cfg = CARDLIGHT_STATUS_CONFIG[cardlightStatus];
                  const Icon = cfg.icon;
                  const isSpinning = ["submitted", "buyer_received", "buyer_checking"].includes(cardlightStatus);
                  return (
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                      <Icon className={`w-3 h-3 ${isSpinning ? "animate-spin" : ""}`} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>

              {/* Order summary */}
              <div className="bg-muted rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cards</span>
                  <span className="font-medium">{cards.length} card{cards.length > 1 ? "s" : ""} · ${totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AD Listing</span>
                  <span className="font-medium">{adListings.find(a => a.id === selectedAd)?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Expected Payout</span>
                  <span className="font-bold text-accent">₦{nairaTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Status timeline */}
              <div className="space-y-0">
                {statusLog.map((log, i) => {
                  const isLast = i === statusLog.length - 1;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${isLast ? "bg-accent" : "bg-muted-foreground/30"}`} />
                        {!isLast && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{log.status}</span>
                          <span className="text-[10px] text-muted-foreground">{log.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{log.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cardlightStatus === "settled" && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <p className="text-xs text-success">Order settled by buyer. You can now proceed to make payment to the customer.</p>
                </div>
              )}

              {cardlightStatus === "negotiation" && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <p className="text-xs text-warning">Buyer raised a negotiation. Check Cardlight for details on amount, rate, or currency mismatch.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => {
                      setCardlightStatus("settled");
                      setStatusLog(prev => [...prev, {
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                        status: "Settled",
                        message: "Negotiation resolved. Order settled."
                      }]);
                    }}>
                      <CheckCircle2 className="w-3 h-3" /> Accept & Settle
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-destructive border-destructive/30" onClick={() => {
                      setCardlightStatus("cancelled");
                      setStatusLog(prev => [...prev, {
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                        status: "Cancelled",
                        message: "Order cancelled after negotiation."
                      }]);
                    }}>
                      <XCircle className="w-3 h-3" /> Cancel Order
                    </Button>
                  </div>
                </div>
              )}

              {cardlightStatus === "cancelled" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">Order was cancelled. Check Cardlight for the cancellation reason. You may close this wizard.</p>
                </div>
              )}

              {["submitted", "buyer_received", "buyer_checking"].includes(cardlightStatus) && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Waiting for buyer response on Cardlight...</p>
                </div>
              )}
            </>
          )}

          {/* ===== STEP 4: Payment ===== */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-accent" />
                <p className="text-sm font-semibold">Payment to Customer</p>
              </div>
              <p className="text-xs text-muted-foreground">Payment is made to the customer based on the order information settled by the buyer.</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Customer</span><span className="font-medium">A7X3KP</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Settled Amount</span><span className="font-medium text-accent">₦{nairaTotal.toLocaleString()}</span></div>
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
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success">Verified</span>
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
          <Button variant="ghost" onClick={step === 0 ? handleClose : () => setStep(step - 1)} className="text-xs" disabled={step === 2 && ["submitted", "buyer_received", "buyer_checking"].includes(cardlightStatus)}>
            {step === 0 ? "Cancel" : <><ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back</>}
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 0 && !allCardsHaveImages) ||
                  (step === 1 && !selectedAd) ||
                  (step === 2 && cardlightStatus !== "settled")
                }
                className="text-xs bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {step === 1 ? "Submit to Cardlight" : step === 2 && cardlightStatus !== "settled" ? "Waiting..." : "Next"}
                {((step === 0 && allCardsHaveImages) || (step === 2 && cardlightStatus === "settled")) && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                {step === 1 && selectedAd && <Send className="w-3.5 h-3.5 ml-1" />}
              </Button>
            ) : (
              <Button
                disabled={!selectedBank}
                onClick={handleInitiateTransfer}
                className="text-xs bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Initiate Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
