interface ServerDataModel {
  id: string;
  date: string; // ISO Date string
  purchased: number;
  produced: number;
  stock: number; // auto calculated (remains + produced)
  sales: number;
  remains: number; // auto calculated (stock - sales)
  expenditures: IExpenditure[];
}

interface IExpenditure {
  name: string;
  amount: number;
}

type IsoStringToDate<T> = {
  [K in keyof T]: T[K] extends string ? (K extends "date" ? Date : T[K]) : T[K];
};

export interface DataEntry extends IsoStringToDate<ServerDataModel> {}
