import { DataForm, InputDataType } from "@/components/forms/data-form";
import { Separator } from "@/components/ui/separator";
import { useCreateProduction } from "@/hooks/production/use-production-data";
import { ProductionData } from "@/types/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function NewData() {
  const createMutation = useCreateProduction();
  const { t } = useTranslation();

  const onSubmit = async (data: InputDataType) => {
    try {
      const finalData = {
        date: new Date(data.date).toISOString().split("T")[0],
        purchased: data.purchased,
        produced: data.produced,
        sales: data.sales,
        expenditures: data.expenditures,
      } satisfies Omit<ProductionData, "id" | "stock" | "remains">;

      await createMutation.mutateAsync(finalData);
      toast.success(t("newData.success"));
    } catch (error) {
      toast.error(t("newData.failed"));
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
        onSubmit={onSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel={t("form.addData")}
      />
    </div>
  );
}
