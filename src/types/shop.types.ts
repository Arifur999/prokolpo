export interface IShopLine {
  name: string;
  amount: number;
}

export interface IShopDay {
  id: string;
  date: string;
  cash: number;
  mobile: number;
  // Sold on credit that day, and credit paid back on that date.
  credit: number;
  collect: number;
  other: number;
  note: string | null;
  counted: number | null;
  by: string;
  cashAccountId: string;
  mobileAccountId: string;
  credits: IShopLine[];
  collects: IShopLine[];
}

export interface IKhataPerson {
  id: string;
  name: string;
  due: number;
  since: string | null;
  last: string | null;
}

export interface IShopBook {
  days: IShopDay[];
  khata: IKhataPerson[];
  expenses: { month: string; amount: number }[];
}

export interface IShopDayPayload {
  date: string;
  cash: number;
  mobile: number;
  other: number;
  note: string;
  counted: number | null;
  cashAccountId: string;
  mobileAccountId: string;
  credits: IShopLine[];
  collects: IShopLine[];
}
