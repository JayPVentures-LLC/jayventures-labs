type DivisionStatus = "Active" | "Growing" | "Accelerating" | "Cooling";

type DivisionView = {
  name: string;
  status: DivisionStatus;
  signal: string;
};

type InnerCircleView = {
  month: string;
  memberId: string | null;
  divisions: DivisionView[];
  systemStatus: {
    intakeEngine: "Online" | "Offline";
    bookingPipeline: "Online" | "Offline";
    membershipGate: "Online" | "Offline";
    vaultDelivery: "Online" | "Offline";
  };
};

function statusFromTrend(current: number, previous: number): DivisionStatus {
  if (current === 0 && previous === 0) return "Active";
  if (current === 0 && previous > 0) return "Cooling";
  if (current < previous) return "Cooling";

  if (current > previous) {
    const delta = current - previous;
    if (previous === 0 && current >= 2) return "Accelerating";
    if (current >= previous * 2 || delta >= 3) return "Accelerating";
    return "Growing";
  }

  return "Active";
}

export function toInnerCircleView(
  month: string,
  byLane: Record<string, { current: number; previous: number }> | undefined,
  memberId: string | null
): InnerCircleView {
  const laneActivity = (laneName: string) => byLane?.[laneName] ?? { current: 0, previous: 0 };

  const divisions: DivisionView[] = [
    {
      name: "JayPVentures LLC",
      status: statusFromTrend(
        laneActivity("JayPVentures LLC").current,
        laneActivity("JayPVentures LLC").previous
      ),
      signal: "Systems builds and consulting operations running",
    },
    {
      name: "jaypventures creator",
      status: statusFromTrend(
        laneActivity("jaypventures creator").current,
        laneActivity("jaypventures creator").previous
      ),
      signal: "Creator monetization and strategy lane active",
    },
    {
      name: "All Ventures Access",
      status: statusFromTrend(
        laneActivity("All Ventures Access").current,
        laneActivity("All Ventures Access").previous
      ),
      signal: "Membership operations and delivery active",
    },
    {
      name: "JayPVentures Music",
      status: statusFromTrend(
        laneActivity("JayPVentures Music").current,
        laneActivity("JayPVentures Music").previous
      ),
      signal: "Music lane building collaborations and creative systems",
    },
    {
      name: "JayPVentures Travel",
      status: statusFromTrend(
        laneActivity("JayPVentures Travel").current,
        laneActivity("JayPVentures Travel").previous
      ),
      signal: "Travel planning and partnerships operations active",
    },
  ];

  return {
    month,
    memberId,
    divisions,
    systemStatus: {
      intakeEngine: "Online",
      bookingPipeline: "Online",
      membershipGate: "Online",
      vaultDelivery: "Online",
    },
  };
}
