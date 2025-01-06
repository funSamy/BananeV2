import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Move constants outside component
const MIN_DATE = new Date("2016-01-01");
const MAX_DATE = new Date(new Date().setHours(0, 0, 0, 0));
const ALLOWED_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  ".",
  "ArrowLeft",
  "ArrowRight",
];

const formSchema = z.object({
  date: z.coerce
    .date({
      coerce: true,
      message: "Date must be a valid date",
      required_error: "A date is required",
    })
    .min(MIN_DATE, {
      message: "The date can't be earlier the 2016",
    })
    .max(MAX_DATE, { message: "The date can't be in the future" }),
  produced: z.coerce
    .number({
      coerce: true,
      message: "Amount must be a number",
      invalid_type_error: "Amount must be a number",
      required_error: "The amount is required",
    })
    .gte(50, "The amount can't be less than 50"),
  remains: z.coerce
    .number({
      coerce: true,
      message: "Amount must be a number",
      invalid_type_error: "Amount must be a number",
      required_error: "The amount is required",
    })
    .gte(0, "The amount can't be less than 0"),
  expenditures: z.array(
    z.object({
      name: z.string({ message: "The name of the expenditure is reqired" }),
      amount: z.coerce.number({
        coerce: true,
        message: "Amount must be a number",
        invalid_type_error: "Amount must be a number",
        required_error: "The amount is required",
      }),
    })
  ),
});

export type InputDataType = z.infer<typeof formSchema>;

// Memoized components
const MemoizedCalendar = memo(Calendar);
const MemoizedInput = memo(Input);

interface ExpenditureFieldProps {
  index: number;
  control: Control<InputDataType>;
  remove: (index: number) => void;
}

const ExpenditureField = memo(
  ({ index, control, remove }: ExpenditureFieldProps) => {
    const handleNumericInput = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!ALLOWED_KEYS.includes(e.key) && !/[0-9]/.test(e.key)) {
          e.preventDefault();
        }
      },
      []
    );
    return (
      <div className="flex items-start gap-4">
        <FormField
          control={control}
          name={`expenditures.${index}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <MemoizedInput
                  type="text"
                  placeholder="Enter the name of the expenditure"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`expenditures.${index}.amount`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <MemoizedInput
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onKeyDown={handleNumericInput}
                  placeholder="Enter the amount"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-8"
          onClick={() => remove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

ExpenditureField.displayName = "ExpenditureField";

interface DataFormProps {
  onSubmit: (data: InputDataType) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<InputDataType>;
  submitLabel?: string;
}

export function DataForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
  submitLabel = "Submit",
}: DataFormProps) {
  const form = useForm<InputDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        date: new Date(),
        remains: 0,
        produced: 0,
        expenditures: [{ name: "", amount: 0 }],
        ...defaultValues,
      }),
      [defaultValues]
    ),
  });

  const { fields, append, remove } = useFieldArray({
    name: "expenditures",
    control: form.control,
  });

  const handleNumericInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!ALLOWED_KEYS.includes(e.key) && !/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Date Field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <MemoizedCalendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) =>
                      date > MAX_DATE || date < MIN_DATE
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Numeric Fields */}
        {["produced", "remains"].map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName as "produced" | "remains"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                </FormLabel>
                <FormControl>
                  <MemoizedInput
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    onKeyDown={handleNumericInput}
                    placeholder={`Enter the amount ${fieldName}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Expenditures */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Expenditures</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => append({ name: "", amount: 0 })}
            >
              <Plus className="h-4 w-4" />
              Add Expenditure
            </Button>
          </div>

          {fields.map((field, index) => (
            <ExpenditureField
              key={field.id}
              index={index}
              control={form.control}
              remove={remove}
            />
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
