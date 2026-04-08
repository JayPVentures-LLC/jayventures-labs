export function estimatePriceFromServiceName(serviceName?: string): number {
  if (!serviceName) return 0;

  const name = serviceName.trim();

  // JayPVentures LLC
  if (name.startsWith("JayPVentures LLC - Fit Call 15 Minutes")) return 0;
  if (name.startsWith("JayPVentures LLC - Consultation 30 Minutes")) return 175;
  if (name.startsWith("JayPVentures LLC - Strategy Session 60 Minutes")) return 350;
  if (name.startsWith("JayPVentures LLC - Systems Deep Dive 90 Minutes")) return 500;
  if (name.startsWith("JayPVentures LLC - Business Growth Sprint")) return 5000;
  if (name.startsWith("JayPVentures LLC - Done For You Systems Build")) return 15000;

  // jaypventures creator
  if (name.startsWith("jaypventures creator - Fit Call 15 Minutes")) return 0;
  if (name.startsWith("jaypventures creator - Strategy Session 30 Minutes")) return 125;
  if (name.startsWith("jaypventures creator - Monetization Session 60 Minutes")) return 250;
  if (name.startsWith("jaypventures creator - Creator Build Sprint")) return 1250;
  if (name.startsWith("jaypventures creator - Monthly Creator Operations")) return 300;

  // All Ventures Access
  if (name.startsWith("All Ventures Access - Core")) return 39;
  if (name.startsWith("All Ventures Access - Plus")) return 79;
  if (name.startsWith("All Ventures Access - Inner Circle")) return 199;

  // JayPVentures Music
  if (name.startsWith("JayPVentures Music - Fit Call 15 Minutes")) return 0;
  if (name.startsWith("JayPVentures Music - Production Strategy 30 Minutes")) return 125;
  if (name.startsWith("JayPVentures Music - Creative Systems Session 60 Minutes")) return 250;
  if (name.startsWith("JayPVentures Music - Collaboration Session 60 Minutes")) return 175;
  if (name.startsWith("JayPVentures Music - Project Build Sprint")) return 1500;
  if (name.startsWith("JayPVentures Music - Monthly Creative Direction")) return 300;

  // JayPVentures Travel
  if (name.startsWith("JayPVentures Travel - Trip Inquiry 15 Minutes")) return 0;
  if (name.startsWith("JayPVentures Travel - Travel Planning Session 30 Minutes")) return 150;
  if (name.startsWith("JayPVentures Travel - Group Strategy Session 60 Minutes")) return 300;
  if (name.startsWith("JayPVentures Travel - Custom Itinerary Build")) return 500;
  if (name.startsWith("JayPVentures Travel - Group Trip Operations Management")) return 2500;

  return 0;
}
