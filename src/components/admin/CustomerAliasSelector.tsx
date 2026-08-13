import { useState } from "react";
import { Check, ChevronsUpDown, Search, X, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { maskName } from "@/lib/utils";
import { customerDirectory, type DirectoryCustomer } from "@/data/mock";

/**
 * Searchable customer selector used in WhatsApp GROUP chats, where the customer
 * behind an order/transfer cannot be auto-resolved from the conversation.
 */
export default function CustomerAliasSelector({
  value,
  onChange,
  label = "Customer",
  required = true,
  className = "",
}: {
  value: string | null;
  onChange: (alias: string | null) => void;
  label?: string;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected: DirectoryCustomer | undefined = customerDirectory.find((c) => c.alias === value);
  const q = query.trim().toLowerCase();
  const results = q ? customerDirectory.filter((c) => c.alias.toLowerCase().includes(q)) : customerDirectory;


  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-[11px]">
        {required && <span className="text-destructive">*</span>} {label}
      </Label>
      {selected ? (
        <div className="h-9 flex items-center gap-2 rounded-md border bg-muted/40 px-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-semibold">
            {selected.alias}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="hover:text-destructive"
              title="Clear customer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {maskName(selected.name)} · {selected.phone}
          </span>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-9 w-full flex items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm text-muted-foreground hover:border-accent transition-colors"
            >
              <span className="truncate text-[13px]">Search customer by alias, name, or phone...</span>
              <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[280px]" align="start">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer by alias, name, or phone..."
                className="h-9 border-0 px-0 shadow-none focus-visible:ring-0 text-[13px]"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">No customer found</p>
              )}
              {results.map((c) => (
                <button
                  key={c.alias}
                  type="button"
                  onClick={() => {
                    onChange(c.alias);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{c.alias}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{maskName(c.name)}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{c.phone}</p>
                  </div>
                  {value === c.alias && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
