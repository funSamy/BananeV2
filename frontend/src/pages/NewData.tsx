import { useRef } from "react";
import {
  DataForm,
  InputDataType,
  DataFormRef,
} from "@/components/forms/data-form";
import { Separator } from "@/components/ui/separator";
import { useCreateProduction } from "@/hooks/production/use-production-data";
import { ProductionData } from "@/types/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { parseApiError } from "@/lib/utils/error-parser";
import { formatDateForAPI } from "@/lib/utils/date-utils";
import { FieldPath } from "react-hook-form";

export default function NewData() {
  const createMutation = useCreateProduction();
  const { t } = useTranslation();
  const formRef = useRef<DataFormRef>(null);

  const onSubmit = async (data: InputDataType) => {
    try {
      const finalData = {
        date: formatDateForAPI(new Date(data.date)),
        purchased: data.purchased,
        produced: data.produced,
        sales: data.sales,
        expenditures: data.expenditures,
      } satisfies Omit<ProductionData, "id" | "stock" | "remains">;

      await createMutation.mutateAsync(finalData);
      toast.success(t("newData.success"));

      // Clear the form on successful submission
      if (formRef.current) {
        formRef.current.reset({
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          purchased: 0,
          produced: 0,
          sales: 0,
          expenditures: [],
        });
      }
    } catch (error) {
      // Parse the API error
      const parsedError = parseApiError(error);

      // Set field-level validation errors
      if (formRef.current && Object.keys(parsedError.fieldErrors).length > 0) {
        Object.entries(parsedError.fieldErrors).forEach(([field, message]) => {
          // react-hook-form accepts dot-notation strings for nested fields
          // e.g., "date", "purchased", "expenditures.0.name"
          formRef.current?.setError(
            field as unknown as FieldPath<InputDataType>,
            {
              type: "server",
              message: message,
            }
          );
        });
      }

      // Show toast for general errors (conflict exceptions, etc.)
      if (parsedError.generalError) {
        toast.error(parsedError.generalError);
      } else if (Object.keys(parsedError.fieldErrors).length === 0) {
        // Fallback to generic error if no specific error was parsed
        toast.error(t("newData.failed"));
      }

      console.error("Error: ", error);
    }
  };

  return (
    <div className="text-primary max-w-xl p-8 mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t("newData.title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t("newData.subtitle")}
      </p>
      <Separator className="my-8" />
      <DataForm
        ref={formRef}
        onSubmit={onSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel={t("form.addData")}
      />
    </div>
  );
}
