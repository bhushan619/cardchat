import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Mail, Apple, Chrome } from "lucide-react";

type Step = "welcome" | "method" | "otp" | "2fa" | "invite";

export default function CustomerAuth() {
  const [step, setStep] = useState<Step>("welcome");
  const [method, setMethod] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  if (step === "welcome") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6">
          <span className="text-accent-foreground font-heading font-bold text-2xl">LC</span>
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2">LightChat</h1>
        <p className="text-muted-foreground mb-8">Buy & sell gift cards securely</p>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base" onClick={() => setStep("method")}>
          Get Started
        </Button>
        <Button variant="ghost" className="w-full mt-2" onClick={() => setStep("method")}>
          I already have an account
        </Button>
      </div>
    );
  }

  if (step === "method") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x p-8">
        <h2 className="font-heading text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-muted-foreground text-sm mb-8">Choose your preferred method</p>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 text-sm"
            onClick={() => { setMethod("apple"); setStep("otp"); }}
          >
            <Apple className="w-5 h-5" /> Continue with Apple
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 text-sm"
            onClick={() => { setMethod("google"); setStep("otp"); }}
          >
            <Chrome className="w-5 h-5" /> Continue with Google
          </Button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <div className="flex gap-2 mt-1">
              <Input className="w-20" defaultValue="+234" />
              <Input className="flex-1" placeholder="Enter phone number" />
            </div>
          </div>
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12"
            onClick={() => { setMethod("phone"); setStep("otp"); }}
          >
            <Smartphone className="w-4 h-4 mr-2" /> Send OTP
          </Button>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x p-8">
        <h2 className="font-heading text-2xl font-bold mb-2">Enter OTP</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {method === "phone" ? "We sent a 4-digit code via SMS" : "We sent a 4-digit code to your email"}
        </p>
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((d, i) => (
            <Input
              key={i}
              className="w-14 h-14 text-center text-2xl font-heading font-bold"
              maxLength={1}
              value={d}
              onChange={e => {
                const next = [...otp];
                next[i] = e.target.value;
                setOtp(next);
              }}
            />
          ))}
        </div>
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12"
          onClick={() => setStep("2fa")}
        >
          Verify
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Didn't receive? <button className="text-accent font-medium">Resend in 60s</button>
        </p>
        <p className="text-center text-[10px] text-muted-foreground mt-2">OTP expires in 5 minutes · Max 3 attempts</p>
      </div>
    );
  }

  if (step === "2fa") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x p-8">
        <h2 className="font-heading text-2xl font-bold mb-2">Bind 2FA</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {method === "phone" ? "Bind your email address for security" : "Bind your phone number for security"}
        </p>
        <div className="space-y-4">
          {method === "phone" ? (
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input placeholder="Enter your email" className="mt-1" type="email" />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <div className="flex gap-2 mt-1">
                <Input className="w-20" defaultValue="+234" />
                <Input className="flex-1" placeholder="Phone number" />
              </div>
            </div>
          )}
          <Button
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12"
            onClick={() => setStep("invite")}
          >
            Verify & Continue
          </Button>
        </div>
      </div>
    );
  }

  // invite
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x p-8">
      <h2 className="font-heading text-2xl font-bold mb-2">Got an Invite Code?</h2>
      <p className="text-muted-foreground text-sm mb-8">Enter a 6-character code or WS alias (optional)</p>
      <Input
        placeholder="e.g. ABC123 or WS alias"
        value={inviteCode}
        onChange={e => setInviteCode(e.target.value)}
        className="mb-4"
      />
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12"
        onClick={() => navigate("/customer")}
      >
        {inviteCode ? "Submit & Continue" : "Skip for Now"}
      </Button>
      {!inviteCode && (
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          You can enter a code within 7 days. After that, source defaults to "App Ad".
        </p>
      )}
    </div>
  );
}
