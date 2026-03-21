// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface Trade {
  // << Make sure 'export' is here
  id?: string;
  userId: string;
  assetName: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  pricePerUnit: number;
  tradeDate: Timestamp;
  fees: number;
  totalCost: number;
  totalProceeds: number;
}

export interface CalculatedMetrics {
  // << Make sure 'export' is here
  totalPL: number;
  totalROI: number;
  totalInvested: number;
  totalTrades: number;
}

// --- NEW UserProfile Interface ---
export type KycStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | "PendingVerification";

export interface UserProfile {
  // id?: string; // Usually the doc ID is the user's UID, so not needed inside
  email?: string; // Optional: Store email here too, synced from Auth
  kycStatus: KycStatus; // Use the defined type
  mt5AccountId?: string | null; // Optional, allow null if explicitly cleared
  mt5Server?: string | null; // Optional, allow null if explicitly cleared
  is2FAEnabled?: boolean; // Optional, default could be false
  lastUpdated?: Timestamp; // Optional: Track when the profile was last saved

  // SECURITY WARNING: Storing sensitive data like passwords directly is highly discouraged.
  // This field is included based on previous code but consider secure alternatives.
  // It should ideally NOT be read back into the client state after setting.
  mt5Password?: string | null; // Only used for writing, marked optional/nullable
}
