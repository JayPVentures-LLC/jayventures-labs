import type { CRMRecord } from "../types/crm";

export type IntegrationPlan = {
  sharepoint: boolean;
  stripe: boolean;
  email: boolean;
  dataLake: boolean;
};

export function planIntegrations(record: CRMRecord): IntegrationPlan {
  const lane = record.lane;

  if (record.eventType.startsWith("payment.") || record.eventType.startsWith("subscription.")) {
    return { sharepoint: true, stripe: true, email: false, dataLake: true };
  }

  if (lane === "All Ventures Access") {
    return { sharepoint: true, stripe: true, email: true, dataLake: true };
  }

  if (lane === "JayPVentures Travel") {
    return { sharepoint: true, stripe: false, email: true, dataLake: true };
  }

  if (lane === "JayPVentures Music") {
    return { sharepoint: true, stripe: false, email: true, dataLake: true };
  }

  if (lane === "jaypventures creator") {
    return { sharepoint: true, stripe: false, email: true, dataLake: true };
  }

  return { sharepoint: true, stripe: true, email: true, dataLake: true };
}
