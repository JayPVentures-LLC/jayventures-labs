# Launch Checklist for jaypventuresllc.com

Repo status as of 2026-04-09:
- Website preview trust links are wired to `GOVERNANCE.md`, and booking placeholders have been replaced with the live Microsoft Bookings URL.
- The homepage draft export has been corrected for broken anchors, contact email, and current Next `Image` usage.
- The items below still require staging or production validation before the site should be treated as launch-ready.

## Accessibility Audit (Black/Red/White Scheme)
- [ ] Run automated contrast checks on all pages (minimum WCAG AA).
- [ ] Manually verify black/red/white contrast for headings, buttons, links, and callouts.
- [ ] Confirm every image includes descriptive alt text.
- [ ] Validate keyboard navigation order and visible focus states across all pages.
- [ ] Test with a screen reader for core flows (home, services, pricing, contact).
- [ ] Ensure form labels and error messages are programmatically associated.

## Analytics and Uptime Monitoring
- [ ] Install analytics (Google Analytics or Plausible) on all pages.
- [ ] Verify pageview tracking in real time on the live domain.
- [ ] Configure conversion events (CTA clicks, bookings, form submissions).
- [ ] Set up uptime monitoring with alerts (email + SMS).
- [ ] Document monitoring endpoints and escalation contacts.

## Trust Signals and Contact Verification
- [ ] Ensure working links to `SECURITY.md` and `GOVERNANCE.md` on the Trust page and footer of the deployed site.
- [ ] Confirm `venture@jaypventuresllc.com` is visible on Contact and Footer in the deployed site.
- [ ] Verify the mailto link opens correctly and routes to the correct mailbox.
- [ ] Validate any trust badges or certifications are accurate and current.

## Branding Consistency (All Pages)
- [ ] Logo usage is consistent (size, spacing, and placement).
- [ ] Navigation items are identical across pages and in correct order.
- [ ] Black/red/white color palette applied consistently across headers, buttons, and links.
- [ ] Typography hierarchy is consistent (headings, body, captions).
- [ ] Favicon and social share images match current brand assets.

## Services and Pricing Plan Functionality
- [ ] Essential plan page loads and displays correct scope and pricing.
- [ ] Growth plan page loads and displays correct scope and pricing.
- [ ] Pro plan page loads and displays correct scope and pricing.
- [ ] Enterprise plan page loads and displays correct scope and pricing.
- [ ] Each plan page includes a working booking or discovery-call CTA.
- [ ] CTA tracking events are firing for each plan page.

## Legal Pages (U.S./Kentucky Alignment)
- [ ] Privacy policy is published and linked in the footer.
- [ ] Terms of service are published and linked in the footer.
- [ ] Cookie policy and consent banner are active and accurate.
- [ ] Contact address and company identity are stated clearly.
- [ ] Data handling language aligns with U.S. and Kentucky expectations.

## Publish Readiness
- [ ] Final content review for accuracy, tone, and spelling.
- [ ] Backup site before publishing.
- [ ] Confirm staging and production environments are configured correctly.
- [ ] Publish site and verify live status on `jaypventuresllc.com`.

## Post-Launch Monitoring (First 24 Hours)
- [ ] Review analytics dashboards hourly for anomalies.
- [ ] Confirm form submissions and booking flows are received.
- [ ] Verify product sales or downloads complete successfully.
- [ ] Check uptime alerts and error logs.
- [ ] Capture initial performance metrics and document issues.

## Post-Launch Monitoring (Weekly)
- [ ] Review analytics for traffic sources, engagement, and conversions.
- [ ] Audit CTA performance and adjust copy if needed.
- [ ] Review form submissions, sales, and support requests.
- [ ] Run an accessibility spot-check on key pages.
- [ ] Confirm `SECURITY.md` and `GOVERNANCE.md` links remain live.
