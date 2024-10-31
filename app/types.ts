export const CurrencySymbol = '$' //  No universal way of determining currency symbol from user locale, so just hardcode $

export enum TransferType {
  SEND = 0,
  REQUEST = 1,
}

export enum ScreenType {
  SCREEN_TOP_LEVEL = 0,
  SCREEN_PAYMENT_TRANSFER = 1,
  SCREEN_CHAT = 2,
  SCREEN_RECEIPT = 3
}

export enum ToastType {
    INFO = 0,
    CHECK = 1,
    ERROR = 2,
  }

  export enum PresenceIcon {
    NOT_SHOWN = -1,
    OFFLINE = 0,
    ONLINE = 1,
  }