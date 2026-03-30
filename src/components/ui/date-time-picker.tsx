import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Pick date & time", className }: DateTimePickerProps) {
  const hours = value ? String(value.getHours()).padStart(2, "0") : "";
  const minutes = value ? String(value.getMinutes()).padStart(2, "0") : "";

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) { onChange(undefined); return; }
    const next = new Date(day);
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0);
    }
    onChange(next);
  };

  const handleTimeChange = (type: "hours" | "minutes", val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const base = value ? new Date(value) : new Date();
    if (!value) { base.setHours(0, 0, 0, 0); }
    if (type === "hours" && num >= 0 && num <= 23) base.setHours(num);
    if (type === "minutes" && num >= 0 && num <= 59) base.setMinutes(num);
    onChange(base);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-52 justify-start text-left text-xs font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
          {value ? format(value, "dd/MM/yyyy, HH:mm") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
        <div className="flex items-center gap-2 border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">Time:</span>
          <Input
            type="number"
            min={0}
            max={23}
            placeholder="HH"
            value={hours}
            onChange={(e) => handleTimeChange("hours", e.target.value)}
            className="h-7 w-14 text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">:</span>
          <Input
            type="number"
            min={0}
            max={59}
            placeholder="MM"
            value={minutes}
            onChange={(e) => handleTimeChange("minutes", e.target.value)}
            className="h-7 w-14 text-xs text-center"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
