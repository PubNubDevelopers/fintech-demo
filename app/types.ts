export const CurrencySymbol = '$' //  No universal way of determining currency symbol from user locale, so just hardcode $

export enum TransferType {
  SEND = 0,
  REQUEST = 1,
}

export enum ToastType {
    INFO = 0,
    CHECK = 1,
    ERROR = 2,
  }