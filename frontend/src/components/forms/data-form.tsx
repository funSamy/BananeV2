import {
  memo,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { CalendarIcon, Loader, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import {
  Control,
  useFieldArray,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";

// Move constants outside component
const MIN_DATE = new Date("2016-01-01");
const MAX_DATE = new Date(new Date().setHours(23, 59, 59, 999));
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
  purchased: z.coerce
    .number({
      coerce: true,
      message: "Amount must be a number",
      invalid_type_error: "Amount must be a number",
      required_error: "The amount is required",
    })
    .gte(0, "The amount can't be less than 0"),
  produced: z.coerce
    .number({
      coerce: true,
      message: "Amount must be a number",
      invalid_type_error: "Amount must be a number",
      required_error: "The amount is required",
    })
    .gte(0, "The amount can't be less than 0"),
  sales: z.coerce
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
  t: (key: string) => string;
}

const ExpenditureField = memo(
  ({ index, control, remove, t }: ExpenditureFieldProps) => {
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
              <FormLabel>{t("form.expenditureName")}</FormLabel>
              <FormControl>
                <MemoizedInput
                  type="text"
                  placeholder={t("form.enterName")}
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
              <FormLabel>{t("form.expenditureAmount")}</FormLabel>
              <FormControl>
                <MemoizedInput
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onKeyDown={handleNumericInput}
                  placeholder={t("form.enterAmount")}
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

type TDataInput = InputDataType & { id?: number };
interface DataFormProps {
  onSubmit: (data: TDataInput) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<TDataInput>;
  submitLabel?: string;
}

export interface DataFormRef {
  setError: UseFormReturn<InputDataType>["setError"];
  reset: UseFormReturn<InputDataType>["reset"];
}

export const DataForm = forwardRef<DataFormRef, DataFormProps>(
  function DataForm(
    { onSubmit, isSubmitting = false, defaultValues, submitLabel = "Submit" },
    ref
  ) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || "en";
    const locale = language === "fr" ? fr : enUS;
    const form = useForm<InputDataType>({
      resolver: zodResolver(formSchema),
      defaultValues: useMemo(
        () => ({
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          remains: 0,
          produced: 0,
          ...defaultValues,
        }),
        [defaultValues]
      ),
    });

    const { fields, append, remove } = useFieldArray({
      name: "expenditures",
      control: form.control,
    });

    // Expose form methods via ref
    useImperativeHandle(ref, () => ({
      setError: form.setError,
      reset: form.reset,
    }));

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit((d) => onSubmit({ ...d, id: defaultValues?.id }))(
              e
            );
          }}
          className="space-y-8"
        >
          {/* Date Field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-primary">{t("form.date")}</FormLabel>
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
                          format(field.value, "PPP", { locale })
                        ) : (
                          <span>{t("form.pickDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <MemoizedCalendar
                      locale={locale}
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
          {["purchased", "produced", "sales"].map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as "purchased" | "produced" | "sales"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(`form.${fieldName}`)}</FormLabel>
                  <FormControl>
                    <MemoizedInput
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      onKeyDown={handleNumericInput}
                      placeholder={t("form.enterAmountFor", {
                        field: fieldName,
                      })}
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
              <FormLabel>{t("form.expenditures")}</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => append({ name: "", amount: 0 })}
              >
                <Plus className="h-4 w-4" />
                {t("form.addExpenditure")}
              </Button>
            </div>

            {fields.map((field, index) => (
              <ExpenditureField
                key={field.id}
                index={index}
                control={form.control}
                remove={remove}
                t={t}
              />
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin text-primaryForeground" />
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </Form>
    );
  }
);
