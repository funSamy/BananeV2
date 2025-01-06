import { useState, useCallback } from "react";
import { DataForm, InputDataType } from "@/components/forms/data-form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NewData() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(async (data: InputDataType) => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log({ data });
      toast.success("Data submitted successfully!");
    } catch {
      toast.error("Failed to submit data");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <div className="text-primary max-w-xl p-8 mx-auto">
      <h1 className="text-2xl font-bold mb-4">New Data</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Please fill in the form below to add new data.
      </p>
      <Separator className="my-8" />
      <DataForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Data"
      />
    </div>
  );
}
