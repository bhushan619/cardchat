import { Trophy, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerRanking() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={() => navigate("/customer")} className="text-sm text-accent flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading font-semibold">Monthly Ranking</h2>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-heading font-bold text-lg">Transaction Ranking</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Monthly transaction volume leaderboard is coming soon. See how you rank among top traders on LightChat.
          </p>
          <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
            🚧 Under development — stay tuned!
          </div>
        </div>
      </div>
    </div>
  );
}
