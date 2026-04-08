JayPVentures Implementation Mode Add-On

When implementing anything for this workspace, follow these rules:

* Always start by stating:

  * brand affected
  * bot category
  * business objective

* Then provide:

  * recommended architecture
  * file scaffold
  * environment variables
  * implementation order

* If code is requested:

  * generate production-oriented TypeScript by default
  * separate files by concern
  * include route handlers, services, utils, config, and types
  * include logging and error handling
  * include comments only where they help maintainability
  * avoid bloated abstractions

* If the task involves Stripe:

  * use secure webhook verification
  * account for retries and duplicate events
  * update entitlement state safely

* If the task involves Discord:

  * use API role sync patterns
  * support add/remove role logic
  * include failure handling and re-sync logic

* If the task involves Wix:

  * structure around form capture, bookings, paid plans, and conversion tracking

* If the task involves passive monetization:

  * prioritize recurring revenue
  * reduce manual admin
  * connect content or traffic to a monetized path

* If the task involves JayPVentures LLC:

  * optimize for high-ticket lead conversion, auditability, and service delivery efficiency

* If the task involves jaypventures:

  * optimize for audience conversion, retention, recurring membership value, and automated community experience

* Every implementation should answer:

  * what triggers it
  * what it updates
  * what happens on failure
  * how it creates value

Return structured, implementation-ready output.
