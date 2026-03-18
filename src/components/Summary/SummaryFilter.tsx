import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, FilterX } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface FilterProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  groupBy: string;
  setGroupBy: (val: string) => void;
  onReset: () => void;
}

export function SummaryFilter({
  date,
  setDate,
  groupBy,
  setGroupBy,
  onReset,
}: FilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl border shadow-sm">
      {/* Date Range Picker */}
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-65 justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {" "}
                    {format(date.from, "LLL dd, y")}-{" "}
                    {format(date.to, "LLL dd, y")}{" "}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pilih Rentang Tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Group By Select */}
      <Select value={groupBy} onValueChange={setGroupBy}>
        <SelectTrigger className="w-37.5">
          <SelectValue placeholder="Group By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hour">Per Jam</SelectItem>
          <SelectItem value="day">Per Hari (Daily)</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Button */}
      <Button
        variant="ghost"
        onClick={onReset}
        className="text-muted-foreground"
      >
        <FilterX className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
