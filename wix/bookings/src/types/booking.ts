export type Lane =
  | "JayPVentures LLC"
  | "jaypventures creator"
  | "All Ventures Access"
  | "JayPVentures Music"
  | "JayPVentures Travel"
  | "UNKNOWN";

export type Tier =
  | "Core"
  | "Plus"
  | "Inner Circle"
  | null;

export interface BookingPayload {
  serviceName: string;
  customerName: string;
  customerEmail: string;
  startDateTime: string;
  endDateTime: string;
  price?: string | number;
}

export interface NormalizedBooking {
  lane: Lane;
  tier: Tier;
  expectedRevenue: number;
  fullName: string;
  email: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}
