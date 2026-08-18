import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import TransferReceiptCard, { type TransferReceipt } from "@/components/admin/TransferReceiptCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Renders the receipt card off-screen, rasterizes it to a PNG and shows it as a
 * real image bubble in the chat thread (mirrors the media message the gateway
 * would send over WhatsApp in production).
 */
export function TransferReceiptImage({ receipt }: { receipt: TransferReceipt }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const node = sourceRef.current;
    if (!node) return;
    const bg = getComputedStyle(document.body).backgroundColor;
    const raf = requestAnimationFrame(() => {
      toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: bg, skipFonts: true })
        .then((dataUrl) => {
          if (!cancelled) setUrl(dataUrl);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [receipt]);

  if (failed) return <TransferReceiptCard receipt={receipt} />;

  return (
    <>
      {/* off-screen source */}
      {!url && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden>
          <div ref={sourceRef} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            <TransferReceiptCard receipt={receipt} className="w-[340px]" />
          </div>
        </div>
      )}

      {url ? (
        <div className="relative group">
          <img
            src={url}
            alt={`Transfer receipt ${receipt.transactionNumber}`}
            className="w-[280px] rounded-xl border shadow-sm cursor-zoom-in"
            onClick={() => setOpen(true)}
          />
          <a
            href={url}
            download={`receipt-${receipt.transactionNumber}.png`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 w-7 h-7 rounded-md bg-background/80 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Download receipt"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="w-[280px] h-[300px] rounded-xl border bg-muted/40 animate-pulse" />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-4">
          {url && <img src={url} alt={`Transfer receipt ${receipt.transactionNumber}`} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TransferReceiptImage;
