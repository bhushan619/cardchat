import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, RefreshCw, ShieldCheck, Copy, Check } from "lucide-react";
import { buildOtpAuthUri, generateBase32Secret, renderQrDataUrl } from "@/lib/totpDemo";
import { bindMfa } from "@/lib/mfaEnrollment";

interface MfaEnrollProps {
  account: string;
  onEnrolled: () => void;
  onBack: () => void;
  compact?: boolean;
}

const CODE_LENGTH = 6;

export default function MfaEnroll({ account, onEnrolled, onBack, compact }: MfaEnrollProps) {
  const [secret, setSecret] = useState(() => generateBase32Secret());
  const [qr, setQr] = useState<string>("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let active = true;
    renderQrDataUrl(buildOtpAuthUri({ issuer: "Cardlight", account, secret })).then((url) => {
      if (active) setQr(url);
    });
    return () => {
      active = false;
    };
  }, [account, secret]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    const next = [...code];
    if (!digits) {
      next[index] = "";
      setCode(next);
      return;
    }
    for (let i = 0; i < digits.length && index + i < CODE_LENGTH; i++) next[index + i] = digits[i];
    setCode(next);
    inputs.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.join("").length !== CODE_LENGTH) {
      setError("Enter the 6-digit code shown in your authenticator app.");
      return;
    }
    setError("");
    setLoading(true);
    // Prototype: any 6-digit code binds. Production must verify server-side.
    setTimeout(() => {
      bindMfa(account);
      setLoading(false);
      onEnrolled();
    }, 700);
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      <div className="text-center space-y-1">
        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-5 h-5 text-accent" />
        </div>
        <h4 className="font-heading font-bold text-base">Enable MFA</h4>
        <p className="text-xs text-muted-foreground">
          Scan the QR code and enter a verification code to bind your authenticator.
        </p>
        <p className="text-xs text-muted-foreground">
          Account: <span className="font-medium text-foreground">{account}</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-foreground">1</span>
          <span className="text-xs font-semibold text-foreground">Scan QR code</span>
        </div>
        <p className="text-[11px] text-muted-foreground pl-5">
          Use an authenticator app or browser extension to scan the QR code.
        </p>
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="rounded-xl bg-white p-3 border border-border shadow-sm">
            {qr ? (
              <img src={qr} alt="MFA authenticator QR code" className="w-[160px] h-[160px]" />
            ) : (
              <div className="w-[160px] h-[160px] flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSecret(generateBase32Secret())}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button
              type="button"
              onClick={copySecret}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy setup key
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-foreground">2</span>
          <span className="text-xs font-semibold text-foreground">Enter verification code</span>
        </div>
        <div className="flex gap-1.5 pt-1">
          {code.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-11 w-full px-0 text-center text-lg font-heading font-bold"
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
        Verify and enable MFA
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="block w-full text-xs text-muted-foreground hover:text-foreground"
      >
        Back to password login
      </button>
    </form>
  );
}
