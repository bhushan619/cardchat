import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Apple, Chrome, Shield } from "lucide-react";
import SplashScreen from "@/components/customer/SplashScreen";
import OnboardingSlides from "@/components/customer/OnboardingSlides";

type Phase = "splash" | "onboarding" | "auth";
type Step = "welcome" | "method" | "otp" | "alias";

export default function CustomerAuth() {
  const [phase, setPhase] = useState<Phase>("splash");
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const navigate = useNavigate();

  const handleSplashComplete = useCallback(() => setPhase("onboarding"), []);
  const handleOnboardingComplete = useCallback(() => setPhase("auth"), []);

  if (phase === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (phase === "onboarding") {
    return <OnboardingSlides onComplete={handleOnboardingComplete} />;
  }

  if (step === "welcome") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
          <span className="text-accent-foreground font-heading font-bold text-2xl">CC</span>
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2">CardChat</h1>
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
          <Button variant="outline" className="w-full h-12 justify-start gap-3 text-sm" onClick={() => setStep("otp")}>
            <Apple className="w-5 h-5" /> Continue with Apple
          </Button>
          <Button variant="outline" className="w-full h-12 justify-start gap-3 text-sm" onClick={() => setStep("otp")}>
            <Chrome className="w-5 h-5" /> Continue with Google
          </Button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t" />
          </div>
          <div>
            <label className="text-sm font-medium">Email Address</label>
            <Input className="mt-1" placeholder="Enter your email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12" onClick={() => setStep("otp")}>
            <Mail className="w-4 h-4 mr-2" /> Send OTP
          </Button>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x p-8">
        <h2 className="font-heading text-2xl font-bold mb-2">Enter OTP</h2>
        <p className="text-muted-foreground text-sm mb-8">We sent a 4-digit code to your email</p>
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((d, i) => (
            <Input
              key={i}
              className="w-14 h-14 text-center text-2xl font-heading font-bold"
              maxLength={1}
              value={d}
              onChange={e => { const next = [...otp]; next[i] = e.target.value; setOtp(next); }}
            />
          ))}
        </div>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12" onClick={() => setStep("alias")}>
          Verify
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Didn't receive? <button className="text-accent font-medium">Resend in 60s</button>
        </p>
        <p className="text-center text-[10px] text-muted-foreground mt-2">OTP expires in 5 minutes · Max 3 attempts</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-accent" />
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2">Your Alias</h2>
      <p className="text-muted-foreground text-sm mb-6">For your privacy, support agents will only see your alias — never your real name.</p>
      <div className="bg-muted rounded-xl px-6 py-4 mb-6 w-full">
        <p className="font-heading text-2xl font-bold tracking-wider">A7X3KP</p>
      </div>
      <p className="text-[11px] text-muted-foreground mb-8 leading-relaxed">
        This alias is used across all support interactions.
      </p>
      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12" onClick={() => navigate("/customer")}>
        Continue to Home
      </Button>
    </div>
  );
}
