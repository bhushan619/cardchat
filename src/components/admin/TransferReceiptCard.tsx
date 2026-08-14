import { CreditCard } from "lucide-react";

export type TransferReceipt = {
  amount: number;
  fee: number;
  status: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  transactionNumber: string;
};

const pts = (n: number) => `Pts ${n.toLocaleString()}`;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 py-1">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    <span className="text-[11px] font-medium text-right break-all">{value}</span>
  </div>
);

/** Transaction receipt bubble sent to the customer after a successful transfer. */
export function TransferReceiptCard({ receipt }: { receipt: TransferReceipt }) {
  return (
    <div className="w-[280px] rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-semibold truncate">Transfer to bank</span>
        </div>
        <span className="text-xs font-semibold shrink-0">−{pts(receipt.amount)}</span>
      </div>
      <div className="pt-1.5 pb-2 border-b">
        <Row label="Order amount" value={pts(receipt.amount)} />
        <Row label="Fee" value={`− ${pts(receipt.fee)}`} />
      </div>
      <div className="pt-1.5">
        <Row label="Status" value={receipt.status} />
        <Row label="Bank name" value={receipt.bankName} />
        <Row label="Account number" value={receipt.accountNumber} />
        <Row label="Account name" value={receipt.accountName} />
        <Row label="Balance" value={pts(receipt.balance)} />
        <Row label="Transaction number" value={receipt.transactionNumber} />
      </div>
      <p className="mt-2 pt-2 border-t text-[10px] leading-snug text-destructive">
        Note: Due to the settlement relationship between banks, the actual payment time is subject to the receiving
        bank. Please check your receiving bank account in time.
      </p>
    </div>
  );
}

export default TransferReceiptCard;
