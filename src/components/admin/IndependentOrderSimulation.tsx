import { useState } from "react";
import { CheckCircle2, FlaskConical, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { agentStatusLabels, agentStatusStyles, type AgentOrderStatus } from "@/lib/orderStateMachine";
import { createSimulationOrders, loadOrderSimulation, saveOrderSimulation, transitionSimulationOrder } from "@/lib/independentOrderSimulation";

export default function IndependentOrderSimulation({ customer }: { customer: string }) {
  const [state, setState] = useState(() => loadOrderSimulation(customer));
  const completed = state.orders.filter((order) => order.status === "success").length;
  const unfinished = state.orders.length - completed;

  function transition(id: string, status: AgentOrderStatus) {
    const orders = transitionSimulationOrder(state.orders, id, status);
    if (orders === state.orders) return;
    const remaining = orders.filter((order) => order.status !== "success").length;
    const entry = status === "success"
      ? `${id} completed independently · ${remaining} other order${remaining === 1 ? "" : "s"} unfinished`
      : `${id} started trading`;
    const next = { orders, activity: [entry, ...state.activity] };
    saveOrderSimulation(customer, next);
    setState(next);
  }

  function reset() {
    const next = { orders: createSimulationOrders(), activity: [] };
    saveOrderSimulation(customer, next);
    setState(next);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs">
          <FlaskConical /> Simulate independent orders
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-accent" /> Independent order simulation</DialogTitle>
          <DialogDescription>Sample orders only · No payments or wallet changes</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
          <div className="text-sm">Customer <span className="font-semibold">{customer}</span></div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw /> Reset simulation</Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-live="polite">
          <span className="text-success">Completed: <strong>{completed}</strong></span>
          <span className="text-muted-foreground">Unfinished: <strong>{unfinished}</strong></span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {state.orders.map((order) => {
            const style = agentStatusStyles[order.status];
            return (
              <article key={order.id} aria-label={`Order ${order.id}`} className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{order.id}</div>
                  <h3 className="mt-1 text-base font-semibold">{order.card}</h3>
                </div>
                <span className={`self-start rounded px-2 py-1 text-xs font-medium ${style.bg} ${style.color}`}>
                  {order.status === "success" ? "Completed" : agentStatusLabels[order.status]}
                </span>
                {order.status === "pending" && <Button size="sm" className="mt-auto w-full" variant="outline" onClick={() => transition(order.id, "in_trade")}><Play /> Start trade</Button>}
                {order.status === "in_trade" && <Button size="sm" className="mt-auto w-full" onClick={() => transition(order.id, "success")}><CheckCircle2 /> Complete Order</Button>}
                {order.status === "success" && <div className="mt-auto flex h-9 items-center justify-center gap-2 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Completed</div>}
              </article>
            );
          })}
        </div>
        <section className="border-t pt-4" aria-label="Simulation activity">
          <h3 className="mb-3 text-sm font-semibold">Order activity</h3>
          <div role="log" aria-live="polite" className="space-y-2 text-sm">
            {state.activity.length === 0 ? <p className="text-muted-foreground">No order activity yet.</p> : state.activity.map((entry, index) => <p key={`${index}-${entry}`} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{entry}</span></p>)}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}