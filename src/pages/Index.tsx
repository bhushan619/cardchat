import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, Globe } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-lg px-6 space-y-8">
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mx-auto">
          <span className="text-accent-foreground font-heading font-bold text-2xl">CC</span>
        </div>
        <div>
          <h1 className="font-heading text-4xl font-bold mb-3">CardChat</h1>
          <p className="text-muted-foreground">Gift card trading platform — interactive UI prototype</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 px-6"
            onClick={() => navigate("/customer/auth")}
          >
            <Smartphone className="w-5 h-5" /> Customer App
          </Button>
          <Button size="lg" variant="outline" className="gap-2 h-12 px-6" onClick={() => navigate("/admin/login")}>
            <Monitor className="w-5 h-5" /> Admin Panel
          </Button>
          <Button size="lg" variant="outline" className="gap-2 h-12 px-6" onClick={() => navigate("/landing")}>
            <Globe className="w-5 h-5" /> Website
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">All screens use mock data · No backend connected</p>
      </div>
    </div>
  );
}
