import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataEntry } from "@/types/data";

const numberFormatter = new Intl.NumberFormat("en-CM", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const columns: ColumnDef<DataEntry>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center text-primary font-medium">
        {format(row.getValue("date"), "PPP")}
      </div>
    ),
    filterFn: "dateRange" as const,
  },
  {
    accessorKey: "purchased",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchased
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchased"));
      return (
        <div className="text-center text-primary font-medium">
          {numberFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "produced",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produced
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("produced"));
      return (
        <div className="text-center text-primary font-medium">
          {numberFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("stock"));
      return (
        <div className="text-center text-primary font-medium">
          {numberFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "sales",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sales
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sales"));
      return (
        <div className="text-center text-primary font-medium">
          {numberFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "remains",
    header: ({ column }) => (
      <div className="text-center text-muted-foreground">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Remains
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("remains"));
      return (
        <div className="text-center text-primary font-medium">
          {numberFormatter.format(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "expenditures",
    header: () => (
      <div className="text-center text-muted-foreground">Expenditures</div>
    ),
    cell: ({ row }) => {
      const expenditures = row.getValue(
        "expenditures"
      ) as DataEntry["expenditures"];
      const total = expenditures!.reduce((sum, exp) => sum + exp.amount, 0);

      return (
        <div className="text-center text-primary">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                {numberFormatter.format(total)}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-primary">
                  Expenditures Details
                </DialogTitle>
                <DialogDescription className="text-secondaryForeground">
                  List of all expenditures for{" "}
                  {format(row.getValue("date"), "PPP")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {expenditures!.map((exp, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-secondaryForeground items-center"
                  >
                    <span className="font-medium">{exp.name}</span>
                    <span>{numberFormatter.format(exp.amount)}</span>
                  </div>
                ))}
                <div className="flex text-primary justify-between items-center border-t pt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    {numberFormatter.format(total)}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const { handleEditRow } = table.options.meta as {
        handleEditRow: (row: Row<DataEntry>) => void;
      };
      return (
        <div className="text-center text-primary">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => handleEditRow(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
