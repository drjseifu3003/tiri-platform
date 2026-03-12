"use client";

import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value | "") => void;
  };

type InputProps = React.ComponentProps<typeof Input>;

const COUNTRY_PREFIX_RULES: Array<{ prefix: string; country: RPNInput.Country }> = [
  { prefix: "+251", country: "ET" },
  { prefix: "+1", country: "US" },
];

function inferCountryFromValue(value: string): RPNInput.Country | undefined {
  const normalized = value.trim();
  if (!normalized.startsWith("+")) return undefined;

  for (const rule of COUNTRY_PREFIX_RULES) {
    if (normalized.startsWith(rule.prefix)) {
      return rule.country;
    }
  }

  return undefined;
}

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, defaultCountry, country: controlledCountry, onCountryChange, ...props }, ref) => {
      const fallbackCountry = defaultCountry ?? "ET";
      const [autoCountry, setAutoCountry] = React.useState<RPNInput.Country | undefined>(fallbackCountry);

      const handleCountryChange = React.useCallback((nextCountry?: RPNInput.Country) => {
        onCountryChange?.(nextCountry);
        if (!controlledCountry && nextCountry) {
          setAutoCountry(nextCountry);
        }
      }, [controlledCountry, onCountryChange]);

      const handleValueChange = React.useCallback((value: RPNInput.Value | undefined) => {
        const normalized = value ?? "";
        onChange?.(normalized);

        if (controlledCountry) return;
        const inferred = inferCountryFromValue(normalized);
        if (inferred) {
          setAutoCountry(inferred);
        }
      }, [controlledCountry, onChange]);

      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          international
          defaultCountry={fallbackCountry}
          country={controlledCountry ?? autoCountry}
          onCountryChange={handleCountryChange}
          onChange={handleValueChange}
          {...props}
        />
      );
    }
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn("rounded-e-lg rounded-s-none", className)}
      {...props}
      ref={ref}
    />
  )
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("flex gap-1 rounded-e-none rounded-s-lg px-3")}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown className={cn("-mr-2 h-4 w-4 opacity-100")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent
                        country={option.value}
                        countryName={option.label}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-sm text-foreground/50">
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          option.value === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  if (!country) {
    return <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20" />;
  }

  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
