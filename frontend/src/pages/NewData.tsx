import { DataForm, InputDataType } from "@/components/forms/data-form";
import { Separator } from "@/components/ui/separator";
import { useCreateProduction } from "@/hooks/production/use-production-data";
import { ProductionData } from "@/types/api";
import { toast } from "sonner";

export default function NewData() {
  const createMutation = useCreateProduction();

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
      toast.success("Data submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit data");
      console.error("Error: ", error);
    }
  };

  return (
    <div className="text-primary max-w-xl p-8 mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Data</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Please fill in the form below to add new data.
      </p>
      <Separator className="my-8" />
      <DataForm
        onSubmit={onSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Add Data"
      />
    </div>
  );
}
