import { useState, useRef } from "react";
import { X, Plus, Trash2, LogIn, RefreshCw, Image as ImageIcon, ShoppingCart, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cardRates } from "@/data/mock";

// Card brands with their available currencies
const cardBrands: { name: string; currencies: string[] }[] = [
  { name: "AMEX", currencies: ["USD", "CAD", "AED", "INR", "NGN"] },
  { name: "VISA", currencies: ["USD", "CAD", "GBP", "EUR", "AUD"] },
  { name: "Sephora", currencies: ["USD", "CAD"] },
  { name: "Nordstrom", currencies: ["USD"] },
  { name: "Nike", currencies: ["USD", "GBP", "EUR"] },
  { name: "iTunes", currencies: ["USD", "GBP", "CAD", "AUD", "EUR"] },
  { name: "Amazon", currencies: ["USD", "GBP", "CAD", "EUR"] },
  { name: "Steam", currencies: ["USD", "EUR", "GBP"] },
  { name: "Google Play", currencies: ["USD", "GBP"] },
  { name: "eBay", currencies: ["USD"] },
];

interface CardEntry {
  id: number;
  cardImage: string;
  cardNo: string;
  cardRate: string;
  cardAmount: string;
}

interface OrderEntry {
  id: string;
  cardCode: string;
  description: string;
  denom: number;
  purchaseRate: number;
  supplier: string;
  status: string;
  date: string;
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

interface CardlightPanelProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (order: CompletedOrder) => void;
  customerAlias?: string;
  embedded?: boolean;
}

const makeCard = (): CardEntry => ({
  id: Date.now() + Math.random(),
  cardImage: "",
  cardNo: "",
  cardRate: "",
  cardAmount: "",
});

// Order list starts empty — only orders created via "Create Now" appear here

interface SellerEntry {
  id: string;
  seller: string;
  rate: number;
  information: string;
  transactions: number;
}

const mockSellers: SellerEntry[] = [
  { id: "s1", seller: "GRTEAM", rate: 5.88, information: "Physical||Fast card||Accepts Multiples of 5||Clear Picture Required||and One Card Only||Cards Only", transactions: 0 },
  { id: "s2", seller: "GRTEAM", rate: 5.65, information: "Physical||Fast card||Accepts Multiples of 5||Clear Picture Required||Horizontal Cards Only", transactions: 1344793 },
  { id: "s3", seller: "GRTEAM", rate: 5.25, information: "E-codes||Fast card||Accepts Multiples of 5", transactions: 0 },
  { id: "s4", seller: "GRTEAM", rate: 5, information: "Physical||Single Card Only||Fast card||Vertical Cards Only", transactions: 1344793 },
];

const cardSources = ["W", "E", "M"];

export default function CardlightPanel({ open, onClose, onComplete, customerAlias, embedded }: CardlightPanelProps) {
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Order form state
  const [cardType, setCardType] = useState("");
  const [cardCurrency, setCardCurrency] = useState("");
  const [cardSource, setCardSource] = useState("W");
  const [supplier, setSupplier] = useState("");
  const [nairaPrice, setNairaPrice] = useState("");
  const [cardRate, setCardRate] = useState("");
  const [cards, setCards] = useState<CardEntry[]>([makeCard()]);
  const [cardTypeOpen, setCardTypeOpen] = useState(false);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  // Order list
  const [orderList, setOrderList] = useState<OrderEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(orderList.length / pageSize);
  const pagedOrders = orderList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Seller modal state
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [saleOrderId, setSaleOrderId] = useState<string | null>(null);
  const [confirmSeller, setConfirmSeller] = useState<SellerEntry | null>(null);

  const handleLogin = () => {
    if (!account.trim() || !password.trim()) return;
    setLoginLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoginLoading(false);
    }, 800);
  };

  const addCard = () => {
    setCards(prev => [...prev, makeCard()]);
  };

  const removeCard = (id: number) => {
    if (cards.length <= 1) return;
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const updateCard = (id: number, updates: Partial<CardEntry>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleCreateOrder = () => {
    if (!cardType) return;

    const alias = customerAlias || supplier || "";
    const newOrder: OrderEntry = {
      id: Date.now().toString(),
      cardCode: Math.random().toString().slice(2, 22),
      description: `${cardType} / ${cardSource}`,
      denom: cards.length,
      purchaseRate: Number(cardRate) || 0,
      supplier: alias,
      status: "Wait For Sale",
      date: new Date().toISOString().replace("T", " ").slice(0, 19),
    };

    setOrderList(prev => [newOrder, ...prev]);
    // Reset form
    setCards([makeCard()]);
    setCardRate("");
    setNairaPrice("");
    setSupplier("");

    // Also notify parent
    if (onComplete) {
      const order: CompletedOrder = {
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
        cards: cards.map(c => ({ cardType, denomination: c.cardAmount || "0", unitPrice: cardRate, status: "Wait For Sale" })),
        totalPayout: cards.reduce((sum, c) => sum + (Number(c.cardAmount) || 0), 0) * (Number(cardRate) || 0),
        totalFaceValue: cards.reduce((sum, c) => sum + (Number(c.cardAmount) || 0), 0),
        bank: "",
        bankAccount: "",
        holderName: "",
        transferAmount: "0",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "processing",
      };
      onComplete(order);
    }
  };

  const handleSale = (orderId: string) => {
    setSaleOrderId(orderId);
    setSellerModalOpen(true);
  };

  const handleChooseSeller = (seller: SellerEntry) => {
    setConfirmSeller(seller);
  };

  const handleConfirmSell = () => {
    if (saleOrderId) {
      setOrderList(prev => prev.map(o => o.id === saleOrderId ? { ...o, status: "Selling" } : o));
    }
    setConfirmSeller(null);
    setSellerModalOpen(false);
    setSaleOrderId(null);
  };

  if (!open) return null;

  const content = (
    <>
      {/* Header - only shown in standalone mode */}
      {!embedded && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Sales Order</h3>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <span className="text-[10px] text-success font-medium">● Connected</span>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {embedded && isLoggedIn && (
        <div className="flex items-center justify-end px-4 py-1.5 border-b bg-muted/30">
          <span className="text-[10px] text-success font-medium">● Connected</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Login Screen */}
        {!isLoggedIn ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <h4 className="font-heading font-bold text-base">Login Sales System</h4>
              <p className="text-xs text-muted-foreground">Connect to Cardlight to create orders</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account</label>
                <Input
                  placeholder="Please enter account"
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Input
                  type="password"
                  placeholder="Please enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-9 text-sm"
                  onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
                />
              </div>
              <Button
                className="w-full h-9 text-sm"
                onClick={handleLogin}
                disabled={loginLoading || !account.trim() || !password.trim()}
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Order Creation Form */}
            <div className="p-4 border-b space-y-3">
              {/* Row 1: Card Type + Card Source */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-destructive">* Card Type</label>
                  <Popover open={cardTypeOpen} onOpenChange={setCardTypeOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs ring-offset-background hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <span className={cardType ? "text-foreground" : "text-muted-foreground"}>
                          {cardType ? `${cardType} / ${cardCurrency}` : "Select"}
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                      <div className="flex">
                        {/* Brand list */}
                        <div className="w-[130px] border-r max-h-[240px] overflow-y-auto">
                          {cardBrands.map(brand => (
                            <button
                              key={brand.name}
                              onMouseEnter={() => setHoveredBrand(brand.name)}
                              onClick={() => setHoveredBrand(brand.name)}
                              className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-accent transition-colors ${hoveredBrand === brand.name ? "bg-accent text-primary font-semibold" : "text-foreground"}`}
                            >
                              {brand.name}
                              <ChevronRight className="h-3 w-3 opacity-50" />
                            </button>
                          ))}
                        </div>
                        {/* Currency list */}
                        <div className="w-[90px] max-h-[240px] overflow-y-auto">
                          {(cardBrands.find(b => b.name === (hoveredBrand || cardBrands[0].name))?.currencies || []).map(cur => (
                            <button
                              key={cur}
                              onClick={() => {
                                setCardType(hoveredBrand || cardBrands[0].name);
                                setCardCurrency(cur);
                                setCardTypeOpen(false);
                              }}
                              className={`flex w-full items-center px-3 py-2 text-xs hover:bg-accent transition-colors ${cardType === (hoveredBrand || cardBrands[0].name) && cardCurrency === cur ? "text-primary font-semibold" : "text-foreground"}`}
                            >
                              {cur}
                            </button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-destructive">* Card Source</label>
                  <Select value={cardSource} onValueChange={setCardSource}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cardSources.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Naira Price, Card Rate */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Naira Price</label>
                  <Input
                    value={nairaPrice}
                    onChange={e => setNairaPrice(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Card Rate</label>
                  <Input
                    value={cardRate}
                    onChange={e => setCardRate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Card entries */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-destructive">* Card Image</label>
                <p className="text-[9px] text-muted-foreground -mt-1">Accept JPG, PNG, WebP formats only. Max 10MB per image, up to 10 images at once.</p>

                {cards.map((card, idx) => (
                  <div key={card.id} className="border rounded-lg p-3 relative">
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="grid grid-cols-[35%_1fr] gap-3">
                      {/* Left: Square image upload (50%) */}
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id={`card-image-${card.id}`}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              updateCard(card.id, { cardImage: url });
                            }
                          }}
                        />
                        <label
                          htmlFor={`card-image-${card.id}`}
                          className="block aspect-square w-full border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors overflow-hidden"
                        >
                          {card.cardImage ? (
                            <img src={card.cardImage} alt="Card" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-[9px]">Click to upload</span>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Right: Card Rate + Card Amount + Card No stacked */}
                      <div className="space-y-2 flex flex-col justify-center">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-destructive">Card Rate *</label>
                          <Input
                            placeholder="Enter rate"
                            value={card.cardRate}
                            onChange={e => updateCard(card.id, { cardRate: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-destructive">Card Amount *</label>
                          <Input
                            placeholder="Enter amount"
                            value={card.cardAmount}
                            onChange={e => updateCard(card.id, { cardAmount: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Card No.</label>
                          <Input
                            placeholder="Enter card No."
                            value={card.cardNo}
                            onChange={e => updateCard(card.id, { cardNo: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add button */}
                <button
                  onClick={addCard}
                  className="w-full border-2 border-dashed rounded-lg py-2.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Create Now button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleCreateOrder}
                  disabled={!cardType}
                  className="h-8 px-6 text-xs"
                >
                  Create Now
                </Button>
              </div>
            </div>

            {/* Order List */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-sm">Order List</h4>
                  <button className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">Total {orderList.length}</span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Alias</th>
                      <th className="text-left py-2 px-1 font-medium text-muted-foreground">Card Code</th>
                      <th className="text-left py-2 px-1 font-medium text-muted-foreground">Denom.</th>
                      <th className="text-left py-2 px-1 font-medium text-muted-foreground">Rate</th>
                      <th className="text-left py-2 px-1 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 px-1 font-medium text-muted-foreground">Operate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map(o => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-2">{o.supplier || "—"}</td>
                        <td className="py-2 px-1">
                          <div className="font-medium">{o.cardCode.slice(0, 12)}...</div>
                          <div className="text-muted-foreground">{o.description}</div>
                          <div className="text-muted-foreground">{o.date}</div>
                        </td>
                        <td className="py-2 px-1">{o.denom}</td>
                        <td className="py-2 px-1">{o.purchaseRate}</td>
                        <td className="py-2 px-1">
                          <span className={`text-[9px] font-medium ${
                            o.status === "Negotiation" ? "text-warning" :
                            o.status === "Selling" ? "text-primary" :
                            "text-muted-foreground"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2 px-1">
                          {o.status === "Wait For Sale" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSale(o.id)}
                              className="h-6 px-3 text-[10px]"
                            >
                              Sale
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`text-xs w-6 h-6 rounded ${
                        currentPage === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Choose Seller Modal */}
      <Dialog open={sellerModalOpen} onOpenChange={(open) => { if (!open) { setSellerModalOpen(false); setSaleOrderId(null); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose seller and sell</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Seller</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Rate</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Information</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Transactions</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Operate</th>
                </tr>
              </thead>
              <tbody>
                {mockSellers.map(seller => (
                  <tr key={seller.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{seller.seller}</td>
                    <td className="py-3 px-4">{seller.rate}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px]">
                      {seller.information.split("||").join(" | ")}
                    </td>
                    <td className="py-3 px-4">{seller.transactions || "—"}</td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChooseSeller(seller)}
                        className="h-7 px-3 text-xs"
                      >
                        Choose &amp; Sell
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert */}
      <AlertDialog open={!!confirmSeller} onOpenChange={(open) => { if (!open) setConfirmSeller(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sell?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sell to <span className="font-semibold text-foreground">{confirmSeller?.seller}</span> at rate <span className="font-semibold text-foreground">{confirmSeller?.rate}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSell}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col h-full overflow-hidden">{content}</div>;
  }

  return (
    <div className="w-[630px] border-l bg-card flex flex-col h-full shrink-0 overflow-hidden">
      {content}
    </div>
  );
}
