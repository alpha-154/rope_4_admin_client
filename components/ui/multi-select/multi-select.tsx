"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover/popover";

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options = [],
  selected = [],
  onSelect,
  placeholder = "Select...",
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // --- SAFETY: prevent "undefined.length" error
  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleSelect = (currentValue: string) => {
    const isSelected = safeSelected.includes(currentValue);
    if (isSelected) {
      onSelect(safeSelected.filter((item) => item !== currentValue));
    } else {
      onSelect([...safeSelected, currentValue]);
    }
  };

  const getButtonText = () => {
    if (safeSelected.length === 0) {
      return placeholder;
    } else if (safeSelected.length === 1) {
      const selectedOption = options.find(
        (opt) => opt.value === safeSelected[0]
      );
      return selectedOption ? selectedOption.label : "";
    } else {
      return `${safeSelected.length} selected`;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {getButtonText()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      safeSelected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
