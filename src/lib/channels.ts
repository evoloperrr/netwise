export const CHANNELS = ["GCash", "Maya", "GoTyme", "QRPH", "Card"] as const;

export type Channel = (typeof CHANNELS)[number];
