interface ServerDataModel {
  id: number;
  date: string; // ISO Date string
  purchased: number;
  produced: number;
  stock: number; // auto calculated (remains + produced)
  sales: number;
  remains: number; // auto calculated (stock - sales)
  expenditures?: IExpenditure[];
}

interface IExpenditure {
  name: string;
  amount: number;
}

type IsoStringToDate<T> = {
  [K in keyof T]: T[K] extends string ? (K extends "date" ? Date : T[K]) : T[K];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DataEntry extends IsoStringToDate<ServerDataModel> {}

export const isDataEntry = (data: unknown): data is DataEntry => {
  const isObject = (dt: unknown): dt is Record<string, unknown> =>
    typeof dt === "object" && dt !== null;

  if (!isObject(data)) return false;

  return Object.keys(data).every((key) => {
    return typeof data[key] === "number" || typeof data[key] === "string";
  });
};
