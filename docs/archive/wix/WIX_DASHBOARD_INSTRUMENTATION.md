# Wix Dashboard Instrumentation Guide

## Overview

All Wix dashboard pages have been instrumented with comprehensive telemetry tracking to capture:
- **Page views** (lane_view) - when users open each dashboard module
- **Navigation actions** (cta_click) - when users switch between creator/enterprise entities
- **Conversion events** - when orders and bookings are confirmed (highest-value signals)

This completes the telemetry spine for the Revenue Intelligence Layer, closing the critical loop: **Awareness → Interest → Booking → Order → Revenue**.

---

## Event Types Emitted

### 1. Lane View Events (`type: 'lane_view'`)
**When**: Page loads for each dashboard module  
**Purpose**: Measure engagement with each dashboard section  
**Frequency**: Once per page load  
**Stage**: Always `'member'` (users viewing Wix dashboard are established customers)

```typescript
// Emitted on mount in useEffect
trackMonetizationEvent({
  type: 'lane_view',
  brand,
  lane: 'wix-dashboard-{module}',  // e.g., 'wix-dashboard-revenue'
  sourcePath: router.pathname,      // e.g., '/wix-dashboard/revenue'
  customerId: getCustomerId(),
  stage: 'member',
  currency: 'USD',
  timestamp: new Date().toISOString(),
})
```

### 2. CTA Click Events (`type: 'cta_click'`)
**When**: User clicks entity switch button (creator ↔ enterprise)  
**Purpose**: Track navigation patterns between creator and enterprise views  
**Frequency**: Each entity switch  
**Stage**: Always `'member'`

```typescript
trackMonetizationEvent({
  type: 'cta_click',
  brand,
  lane: 'wix-dashboard-{module}',
  ctaLabel: 'Switch to {entity}',    // e.g., 'Switch to enterprise'
  sourcePath: router.pathname,
  customerId: getCustomerId(),
  stage: 'member',
  currency: 'USD',
  timestamp: new Date().toISOString(),
})
```

### 3. Conversion Events (`type: 'conversion'`)
**When**: Orders are loaded from Wix OR bookings are confirmed  
**Purpose**: Capture actual revenue and booking outcomes with monetary value  
**Frequency**: Once per unique order/booking  
**Stage**: `'member'` for orders, `'inner_circle'` for confirmed bookings

#### Orders (High-Value Transactions)
```typescript
// Emitted in useMemo when data loads
trackMonetizationEvent({
  type: 'conversion',
  brand,
  lane: 'wix-dashboard-orders',
  sourcePath: router.pathname,
  customerId: getCustomerId(),
  stage: 'member',
  currency: order.currency || 'USD',
  actualValueCents: Math.round(order.total_amount * 100),  // Real $ amount
  isRecurring: false,
  conversionId: `wix-order-${order.id}`,  // Prevents duplicates
  timestamp: new Date(order.created_at).toISOString(),
})
```

#### Bookings (Recurring Commitments)
```typescript
// Emitted in useMemo when data loads (only if status === 'confirmed')
trackMonetizationEvent({
  type: 'conversion',
  brand,
  lane: 'wix-dashboard-bookings',
  sourcePath: router.pathname,
  customerId: getCustomerId(),
  stage: 'inner_circle',  // Confirmed bookings = more committed customer
  currency: 'USD',
  actualValueCents: 10000,  // $100 default (booking amount not in schema)
  isRecurring: true,        // Bookings are recurring by nature
  conversionId: `wix-booking-${booking.id}`,
  timestamp: new Date(booking.created_at || booking.start_time).toISOString(),
})
```

---

## Pages Instrumented

### 1. Dashboard Overview (`/wix-dashboard`)
- **File**: [frontend/pages/wix-dashboard/index.tsx](frontend/pages/wix-dashboard/index.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch)
- **Purpose**: Track entry point and entity switching behavior

### 2. Revenue Dashboard (`/wix-dashboard/revenue`)
- **File**: [frontend/pages/wix-dashboard/revenue.tsx](frontend/pages/wix-dashboard/revenue.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch)
- **Purpose**: Track which users focus on revenue metrics

### 3. Orders (`/wix-dashboard/orders`)
- **File**: [frontend/pages/wix-dashboard/orders.tsx](frontend/pages/wix-dashboard/orders.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch) + **conversion (real revenue)**
- **Purpose**: Capture actual order conversions with exact amounts
- **Key Feature**: Emits conversion event for each order when page loads (deduplication via conversionId)

### 4. Bookings (`/wix-dashboard/bookings`)
- **File**: [frontend/pages/wix-dashboard/bookings.tsx](frontend/pages/wix-dashboard/bookings.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch) + **conversion (confirmed bookings only)**
- **Purpose**: Capture booking commitments with recurring revenue signal
- **Key Feature**: Only emits conversion for bookings with `status === 'confirmed'`

### 5. Events (`/wix-dashboard/events`)
- **File**: [frontend/pages/wix-dashboard/events.tsx](frontend/pages/wix-dashboard/events.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch)
- **Purpose**: Track webhook event monitoring engagement

### 6. Contacts (`/wix-dashboard/contacts`)
- **File**: [frontend/pages/wix-dashboard/contacts.tsx](frontend/pages/wix-dashboard/contacts.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch)
- **Purpose**: Track CRM engagement and contact database usage

### 7. Attribution (`/wix-dashboard/attribution`)
- **File**: [frontend/pages/wix-dashboard/attribution.tsx](frontend/pages/wix-dashboard/attribution.tsx)
- **Events**: lane_view (on load) + cta_click (entity switch)
- **Purpose**: Track analytics/reporting engagement

---

## Data Flow & Deduplication

### How Conversions Are Deduplicated
1. **API Level**: The [analytics.ts](frontend/pages/api/analytics.ts) handler deduplicates by `conversionId + type=conversion`
2. **Naming Convention**:
   - Orders: `wix-order-{order.id}`
   - Bookings: `wix-booking-{booking.id}`
3. **Effect**: Multiple page loads with same orders won't create duplicate conversion events

### Timestamp Strategy
- **lane_view**: Current time (when page loads)
- **cta_click**: Current time (when clicked)
- **conversion**: Order/booking creation time (historical accuracy)
  - Orders: `order.created_at`
  - Bookings: `booking.created_at` or `booking.start_time`

---

## Analytics Intelligence Enabled

### Attribution Queries
```
SELECT COUNT(*), SUM(actualValueCents) FROM events
WHERE type='conversion' AND lane='wix-dashboard-orders'
GROUP BY brand, entity  -- → "Which brand/entity generates most order revenue?"

SELECT COUNT(*), SUM(actualValueCents) FROM events
WHERE type='conversion' AND isRecurring=true
-- → "How much recurring monthly revenue from bookings?"
```

### Funnel Analysis
```
Events: layout.view → services.cta_click → intake.start → dashboard.lane_view → orders.conversion
        (awareness)    (interest)           (evaluation)  (engagement)         (revenue)
```

### Cohort Performance
```
-- Which first-seen month cohorts produced the most bookings?
SELECT DATE_TRUNC('month', first_seen),
       COUNT(*),
       SUM(actualValueCents)
FROM customers_first_seen
JOIN conversions ON customer_id
WHERE type='conversion' AND lane LIKE 'wix-dashboard-%'
GROUP BY 1
ORDER BY 3 DESC
```

### Upgrade Candidate Scoring
```
-- Customers with high dashboard engagement but no conversion yet
SELECT customer_id, score, reasons
FROM scoring
WHERE type='conversion' IS NULL
  AND lane_view_count_wix_dashboard > 5
ORDER BY score DESC
LIMIT 25
```

---

## Implementation Details

### Imports Added to Each Page
```typescript
import { useEffect } from 'react'                          // For useEffect
import { trackMonetizationEvent } from '../../lib/analytics/track'     // Emit events
import { getCustomerId } from '../../lib/analytics/identity'           // Get stable ID
```

### Pattern: useEffect on Mount
```typescript
useEffect(() => {
  if (router.isReady) {
    trackMonetizationEvent({
      type: 'lane_view',
      brand,
      lane: 'wix-dashboard-{module}',
      sourcePath: router.pathname,
      customerId: getCustomerId(),
      stage: 'member',
      currency: 'USD',
      timestamp: new Date().toISOString(),
    })
  }
}, [router.isReady, brand, router.pathname])
```

### Pattern: useMemo Deduplication for Conversions (Orders/Bookings)
```typescript
const rows = useMemo<OrderRow[]>(() => {
  const orderRows = (data?.orders ?? []).map((order) => ({
    // ... row mapping
  }))

  // Emit conversion for each order
  ;(data?.orders ?? []).forEach((order) => {
    trackMonetizationEvent({
      type: 'conversion',
      brand,
      lane: 'wix-dashboard-orders',
      sourcePath: router.pathname,
      customerId: getCustomerId(),
      stage: 'member',
      currency: order.currency || 'USD',
      actualValueCents: Math.round(order.total_amount * 100),
      isRecurring: false,
      conversionId: `wix-order-${order.id}`,  // KEY: Prevents duplicates
      timestamp: new Date(order.created_at).toISOString(),
    })
  })

  return orderRows
}, [data, brand, router.pathname])
```

---

## Expected Signal Improvements

### Before Wix Instrumentation
- Tracked: Services viewed, CTAs clicked, intakes started, lanes viewed
- Missing: Actual orders, actual bookings, real revenue amounts
- Funnels: Awareness → Interest → Evaluation (stopped here)

### After Wix Instrumentation
- Tracked: **+ Real orders with $ amounts + Confirmed bookings + Dashboard engagement**
- Complete: Awareness → Interest → Evaluation → Engagement → **Revenue**
- New Insights:
  - "Which creator services sell best? Orders: 47, Revenue: $8,400"
  - "Booking conversion from dashboard view: 12% (24 views → 3 confirmed)"
  - "Enterprise customers avg order value: $200 vs creators: $50"
  - "Top upgrade candidate [Jay] has $5k in expected value + 2 confirmed bookings"

---

## Testing Checklist

- [ ] Open `/wix-dashboard` → Check Admin Telemetry for `lane_view` event with lane='wix-dashboard-overview'
- [ ] Click entity switch → Check for `cta_click` event with ctaLabel='Switch to {entity}'
- [ ] Open `/wix-dashboard/orders` → Check for `conversion` events with `actualValueCents` filled in
- [ ] Open `/wix-dashboard/bookings` → Check for `conversion` events only for status='confirmed'
- [ ] Refresh orders page twice → Verify no duplicate conversions (conversionId deduplication working)
- [ ] Admin dashboard: `byLane` should show high revenue for wix-dashboard-orders
- [ ] Admin dashboard: `candidates` should include customers with high booking activity

---

## Next Steps

### Phase 1: ✅ WIRED (Current)
- Wix dashboard pages: Overview, Revenue, Orders, Bookings, Events, Contacts, Attribution

### Phase 2: Login/Signup (Planned)
- Track signup_start on `/auth/signup`
- Track login_success on successful authentication
- Merge localStorage customerID → authenticated user_id
- Emit customer_upgrade when moving from anonymous → authenticated

### Phase 3: Partnerships (Planned)
- Instrument `/[brand]/partnerships` with cta_click for partnership signups
- Track partnership_request events
- Attribute revenue to partnership source

### Phase 4: Server-Side Identity (Future)
- Replace localStorage UUID with Wix contact ID (customerHint field)
- Emit customerHint on all conversion events for CRM sync
- Enable automatic contact merge in Wix

---

## References

- **Telemetry Schema**: [monetizationEvents.ts](frontend/lib/analytics/monetizationEvents.ts)
- **Tracking Utility**: [track.ts](frontend/lib/analytics/track.ts)
- **Analytics API**: [analytics.ts](frontend/pages/api/analytics.ts)
- **Admin Dashboard**: [admin/telemetry.tsx](frontend/pages/admin/telemetry.tsx)
- **Identity Helper**: [identity.ts](frontend/lib/analytics/identity.ts)

---

## FAQ

**Q: Why are bookings assigned to `stage: 'inner_circle'` but orders to `'member'`?**  
A: Booking confirmation = deeper commitment level (scheduled time). Orders might be one-time. Stage progression reflects customer maturity.

**Q: Why default booking amount to $100?**  
A: Booking schema doesn't include price/amount. $100 is reasonable estimate for coaching/consulting session. Real value should be pulled from service catalog once integrated.

**Q: Will duplicate orders cause false revenue?**  
A: No, deduplication works via `conversionId: "wix-order-{order.id}"` in analytics API deduplication logic.

**Q: How does this help with login/signup instrumentation?**  
A: Once we wire signup, we can merge the anonymous `customerId` (from localStorage) with the authenticated user_id, preserving all pre-login behavior in one customer journey.

**Q: What if Wix orders appear again from webhook?**  
A: The API deduplicates by `{conversionId, type='conversion'}`, so webhook ingestion won't double-count dashboard imports.
