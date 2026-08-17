// Reference list of supported banks/e-wallets for the withdrawal form's
// dropdown, paired with the VLPAY bank code/name each one maps to (see
// "Payout Bank List and Code" in VLPAY API Documentation_v1.pdf).
export const banks = [
  "GCash",
  "Maya",
  "GoTyme Bank",
  "Maya Bank",
  "BDO Unibank",
  "BPI",
  "UnionBank",
];

export type VlpayBankInfo = {
  bankCode: string;
  bankName: string;
  // E-wallet destinations use the recipient's mobile number as the account
  // number: a leading "0" instead of "63", e.g. 09985701224.
  isEwallet: boolean;
};

export const VLPAY_BANK_INFO: Record<string, VlpayBankInfo> = {
  GCash: { bankCode: "36677", bankName: "Gcash", isEwallet: true },
  Maya: { bankCode: "36726", bankName: "Maya Wallet", isEwallet: true },
  "GoTyme Bank": { bankCode: "36676", bankName: "GoTYme Bank", isEwallet: false },
  "Maya Bank": { bankCode: "36686", bankName: "Maya Bank", isEwallet: false },
  "BDO Unibank": { bankCode: "02061", bankName: "BDO Unibank", isEwallet: false },
  BPI: { bankCode: "36735", bankName: "Bank Of The Philippine Islands", isEwallet: false },
  UnionBank: { bankCode: "36711", bankName: "Union Bank of the Philippines", isEwallet: false },
};
