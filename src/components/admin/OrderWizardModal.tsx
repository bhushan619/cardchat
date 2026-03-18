import { useState } from "react";
import { X, Plus, Trash2, Image, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cardRates, systemNairaRate, bankAccounts } from "@/data/mock";

interface CardEntry {
  id: number;
  code: string;
  hasImage: boolean;
  verified: boolean;
}

interface OrderWizardModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["Create Order", "Auto-Bill", "Execute Transfer"];

export default function OrderWizardModal({ open, onClose }: OrderWizardModalProps) {
  const [step, setStep] = useState(0);

  // Step 1 - Create Order
  const [cardType, setCardType] = useState("iTunes US");
  const [denomination, setDenomination] = useState("100");
  const [cards, setCards] = useState<CardEntry[]>([
    { id: 1, code: "", hasImage: false, verified: false },
  ]);

  // Step 2 - Auto-Bill
  const [unitPrice, setUnitPrice] = useState("680");

  // Step 3 - Transfer
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  const selectedRate = cardRates.find(r => r.cardType === cardType);
  const totalAmount = cards.length * Number(denomination);
  const nairaTotal = cards.length * Number(denomination) * Number(unitPrice);
  const costUnitPrice = (Number(unitPrice) / systemNairaRate).toFixed(5);

  const addCard = () => {
    if (cards.length >= 15) return;
    setCards([...cards, { id: Date.now(), code: "", hasImage: false, verified: false }]);
  };

  const removeCard = (id: number) => {
    if (cards.length <= 1) return;
    setCards(cards.filter(c => c.id !== id));
  };

  const updateCardCode = (id: number, code: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, code } : c));
  };

  const toggleCardImage = (id: number) => {
    setCards(cards.map(c => c.id === id ? { ...c, hasImage: !c.hasImage } : c));
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    if (step === 1 && !transferAmount) {
      setTransferAmount(nairaTotal.toLocaleString());
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-[520px] max-h-[90vh] flex flex-col animate-slide-up shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base">{STEPS[step]}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Step {step + 1} of 3</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 pb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-muted"}`} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          {step === 0 && (
            <>
              {/* Card type & denomination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Card Type</label>
                  <select
                    value={cardType}
                    onChange={e => setCardType(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {cardRates.map(r => (
                      <option key={r.id} value={r.cardType}>{r.cardType}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Denomination ($)</label>
                  <Input value={denomination} onChange={e => setDenomination(e.target.value)} className="mt-1" />
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground">{cards.length} card{cards.length > 1 ? "s" : ""} · ${denomination} each</span>
                <span className="text-xs font-semibold">Total: ${totalAmount}</span>
              </div>

              {/* Card entries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Cards ({cards.length}/15)</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 gap-1"
                    onClick={addCard}
                    disabled={cards.length >= 15}
                  >
                    <Plus className="w-3 h-3" /> Add Card
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                      <Input
                        placeholder="Enter card code / PIN"
                        value={card.code}
                        onChange={e => updateCardCode(card.id, e.target.value)}
                        className="text-sm"
                      />
                      <button
                        onClick={() => toggleCardImage(card.id)}
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

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Card Type</label>
                  <Input value={cardType} readOnly className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cards × Denomination</label>
                  <Input value={`${cards.length} × $${denomination}`} readOnly className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Total Amount</label>
                  <Input value={`$${totalAmount}`} readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-1">= Settlement amount</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Naira Rate</label>
                  <Input value={`₦${systemNairaRate.toLocaleString()}`} readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-accent mt-1">🔒 From system config</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Unit Price (₦)</label>
                  <Input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cost Unit Price</label>
                  <Input value={costUnitPrice} readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-1">= Unit Price ÷ Naira Rate</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payout Total</span>
                  <span className="font-bold text-base">₦{nairaTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{cards.length} cards × ${denomination} × ₦{unitPrice}</p>
              </div>

              {Number(costUnitPrice) < 0.45 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <p className="text-xs text-warning-foreground">Low cost unit price detected. This trade may result in a loss.</p>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Select a verified bank account to initiate the transfer.</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">User-A7X3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Payout</span>
                  <span className="font-medium text-accent">₦{nairaTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Verified Bank Accounts</label>
                {bankAccounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedBank(a.id);
                      setTransferAmount(nairaTotal.toLocaleString());
                    }}
                    className={`w-full text-left border rounded-lg p-3 space-y-1 transition-colors ${
                      selectedBank === a.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
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
          <Button variant="ghost" onClick={step === 0 ? handleClose : handleBack} className="text-xs">
            {step === 0 ? "Cancel" : <><ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back</>}
          </Button>
          <div className="flex gap-2">
            {step < 2 ? (
              <Button onClick={handleNext} className="text-xs bg-accent text-accent-foreground hover:bg-accent/90">
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                disabled={!selectedBank}
                className="text-xs bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Execute Transfer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
