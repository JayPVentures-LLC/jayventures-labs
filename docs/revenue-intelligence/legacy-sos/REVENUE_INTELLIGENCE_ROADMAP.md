# Revenue Intelligence Layer: Implementation Roadmap

## Phase Completion Status

### ✅ Phase 1: Brand-Scoped Routing & Core Telemetry
**Status**: COMPLETE  
**Completion Date**: Session 4  
**Files**: 
- `frontend/config/brandConfig.ts` (brand definitions)
- `frontend/pages/[brand]/services.tsx` (service CTA tracking)
- `frontend/pages/[brand]/blog/[slug].tsx` (blog CTA tracking)
- `frontend/pages/[brand]/dashboard.tsx` (lane view tracking)

**Tracking Points**: Services, Blog, Dashboard  
**Events Emitted**: `lane_view`, `cta_click`, `intake_start`

---

### ✅ Phase 2: Revenue Intelligence Architecture
**Status**: COMPLETE  
**Completion Date**: Session 4  
**Files**:
- `frontend/lib/analytics/monetizationEvents.ts` (event schema v3)
- `frontend/lib/analytics/track.ts` (sendBeacon + fetch)
- `frontend/lib/analytics/identity.ts` (localStorage UUID)
- `frontend/config/funnel.ts` (stage progression)
- `frontend/config/revenueDefaults.ts` (expected values)
- `frontend/pages/api/analytics.ts` (560-line API handler)
- `frontend/pages/admin/telemetry.tsx` (admin dashboard)
- `frontend/lib/analytics/scoring.ts` (upgrade candidate ranking)

**Tracking Points**: All brand pages + admin  
**Events Emitted**: All 5 types + customerId + stage + expectedValueCents

---

### ✅ Phase 3: Wix Dashboard Instrumentation
**Status**: COMPLETE  
**Completion Date**: TODAY  
**Files**:
- `frontend/pages/wix-dashboard/index.tsx` (overview)
- `frontend/pages/wix-dashboard/revenue.tsx` (revenue view)
- `frontend/pages/wix-dashboard/orders.tsx` (conversion events + real $)
- `frontend/pages/wix-dashboard/bookings.tsx` (booking conversions + recurring signal)
- `frontend/pages/wix-dashboard/events.tsx` (webhook monitoring)
- `frontend/pages/wix-dashboard/contacts.tsx` (CRM engagement)
- `frontend/pages/wix-dashboard/attribution.tsx` (attribution view)

**Tracking Points**: All 7 Wix dashboard modules + entity switches  
**Events Emitted**: `lane_view` + `cta_click` + **`conversion` with actualValueCents**  
**Key Achievement**: First real revenue signals captured (orders + confirmed bookings)

---

### 🟡 Phase 4: Login/Signup Instrumentation (NEXT)
**Status**: PLANNED  
**Priority**: HIGH (unlocks user identity continuity)

**Pages to Instrument**:
- `frontend/pages/auth/signup.tsx` - Track signup funnel
- `frontend/pages/auth/login.tsx` - Track login intent
- `frontend/pages/auth/callback.tsx` - Track auth success

**Events to Wire**:
1. `signup_start` - When signup form loads
   ```typescript
   trackMonetizationEvent({
     type: 'signup_start',
     brand,
     sourcePath: router.pathname,
     customerId: getCustomerId(),  // Anonymous ID
     stage: 'follower',             // Not yet a customer
     timestamp,
   })
   ```

2. `signup_complete` - When signup succeeds
   ```typescript
   trackMonetizationEvent({
     type: 'signup_complete',
     brand,
     sourcePath: router.pathname,
     customerId: getCustomerId(),   // Will merge to user_id
     stage: 'consult',              // Upgraded to customer
     userId: user.id,               // New authenticated ID
     potentialValueCents: 50000,    // From scoring or profile selection
     timestamp,
   })
   ```

3. `login_success` - When login completes
   ```typescript
   trackMonetizationEvent({
     type: 'login_success',
     brand,
     sourcePath: router.pathname,
     customerId: getCustomerId(),   // Anonymous → authenticated merge
     userId: user.id,
     stage: CUSTOMER_STAGE_MAP[user.subscription_tier],
     timestamp,
   })
   ```

**Key Feature**: Identity Merge
- Before: Anonymous customer tracked via localStorage UUID
- After: Same customer accessible via authenticated user_id
- Effect: Preserves entire pre-auth journey (services viewed → signup → order)

**Data Structure Change**:
```typescript
// New field on MonetizationEvent
interface MonetizationEvent {
  // ... existing fields
  userId?: string;           // Authenticated user ID (from auth provider)
  customerHint?: string;     // Email hash or Wix contact ID (for CRM sync)
  previousCustomerId?: string; // Anonymous ID to merge with
}
```

---

### 🟡 Phase 5: Partnerships Instrumentation (AFTER PHASE 4)
**Status**: PLANNED  
**Priority**: MEDIUM

**Pages to Instrument**:
- `frontend/pages/[brand]/partnerships.tsx`

**Events to Wire**:
1. `partnership_request_start` - Form load
2. `partnership_interest_select` - Click partnership type
3. `partnership_request_submit` - Form submit

**Key Metric**: Track which partnerships generate revenue through attributed conversions

---

### 🔮 Phase 6: Server-Side Integration (FUTURE)
**Status**: DESIGN PHASE  
**Priority**: AFTER PHASES 4-5

**Backend Enhancements**:
1. Enable `customerHint` field (email hash / Wix contact ID)
2. Build CRM sync: monetization events → Wix contacts
3. Upgrade contact score in Wix based on:
   - Expected value aggregation
   - Conversion activity
   - Stage progression
4. Historical contact merge via email hash

---

## Critical Path to MVP

**Current**: Wix dashboard shows real order revenue  
**Needed Next**: User signup binding to preserve journey  
**Then**: Full funnel: Brand Page → CTA → Intake → Dashboard → Booking → Order (all one customer)

**Timeline Estimate**:
- Phase 4 (Login/Signup): 2-3 hours
- Phase 5 (Partnerships): 1-2 hours
- Phase 6 (CRM Sync): 4-6 hours
- **Total to MVP**: ~8-11 hours from now

---

## Implementation Checklist for Phase 4

### Files to Create
- [ ] `frontend/pages/auth/signup.tsx` (signup tracking)
- [ ] `frontend/pages/auth/login.tsx` (login tracking)
- [ ] `frontend/pages/auth/callback.tsx` or similar (auth success)

### Files to Modify
- [ ] `frontend/lib/analytics/monetizationEvents.ts` (add userId + customerHint fields)
- [ ] `frontend/types/api.ts` (update MonetizationEvent type)
- [ ] `frontend/pages/api/analytics.ts` (handle userId + identity merge)

### Key Pattern (Copy-Paste)
```typescript
// In signup success handler:
const anonId = getCustomerId()
const newUserId = response.user.id

// Emit merge event
trackMonetizationEvent({
  type: 'signup_complete',
  brand,
  customerId: anonId,
  userId: newUserId,
  previousCustomerId: anonId,  // Mark for merge
  stage: 'consult',
})

// Then replace in identity store
setCustomerId(newUserId)  // Update localStorage
```

---

## Instrumentation Patterns Quick Reference

### Pattern 1: Page View (Lane View)
```typescript
useEffect(() => {
  if (router.isReady) {
    trackMonetizationEvent({
      type: 'lane_view',
      brand,
      lane: 'wix-dashboard-orders',
      sourcePath: router.pathname,
      customerId: getCustomerId(),
      stage: 'member',
      currency: 'USD',
      timestamp: new Date().toISOString(),
    })
  }
}, [router.isReady, brand, router.pathname])
```

### Pattern 2: CTA Click
```typescript
const handleClick = () => {
  trackMonetizationEvent({
    type: 'cta_click',
    brand,
    lane: current_lane,
    ctaLabel: 'Click Here',
    sourcePath: router.pathname,
    customerId: getCustomerId(),
    stage: 'consult',
    currency: 'USD',
    expectedValueCents: SERVICE_EXPECTED_VALUE_CENTS[serviceId],
    timestamp: new Date().toISOString(),
  })
  // ... then perform action
}
```

### Pattern 3: Conversion (With Real Dollars)
```typescript
trackMonetizationEvent({
  type: 'conversion',
  brand,
  lane: 'wix-dashboard-orders',
  sourcePath: router.pathname,
  customerId: getCustomerId(),
  stage: 'member',
  currency: 'USD',
  actualValueCents: Math.round(order.total_amount * 100),
  isRecurring: false,
  conversionId: `wix-order-${order.id}`,  // Prevents duplicates
  timestamp: new Date(order.created_at).toISOString(),
})
```

### Pattern 4: Conversion (Without Real Dollars - Use Expected)
```typescript
trackMonetizationEvent({
  type: 'conversion',
  brand,
  lane: 'wix-dashboard-bookings',
  sourcePath: router.pathname,
  customerId: getCustomerId(),
  stage: 'inner_circle',
  currency: 'USD',
  actualValueCents: undefined,  // Not available in schema
  expectedValueCents: BOOKING_EXPECTED_VALUE,  // Use mapped default
  isRecurring: true,
  conversionId: `wix-booking-${booking.id}`,
  timestamp: new Date(booking.start_time).toISOString(),
})
```

---

## Query Examples for Admin Dashboard

### Total Revenue by Brand
```sql
SELECT 
  brand,
  COUNT(*) as conversions,
  SUM(COALESCE(actualValueCents, expectedValueCents)) as total_cents,
  SUM(COALESCE(actualValueCents, expectedValueCents)) / 100.0 as total_usd
FROM monetization_events
WHERE type = 'conversion'
GROUP BY brand
ORDER BY total_usd DESC
```

### Dashboard Engagement → Orders Funnel
```sql
SELECT
  'lane_view' as step,
  COUNT(DISTINCT customerId) as unique_customers,
  COUNT(*) as events
FROM monetization_events
WHERE lane LIKE 'wix-dashboard-%' AND type = 'lane_view'
UNION ALL
SELECT
  'conversion',
  COUNT(DISTINCT customerId),
  COUNT(*)
FROM monetization_events
WHERE lane LIKE 'wix-dashboard-%' AND type = 'conversion'
ORDER BY step
```

### Cohort Upgrade Performance
```sql
-- Users first seen in Jan 2024 → how many converted by month?
SELECT
  DATE_TRUNC('month', m2.timestamp) as conversion_month,
  COUNT(DISTINCT m2.customerId) as upgraded_customers
FROM customers_by_first_seen m1
JOIN monetization_events m2 ON m1.customerId = m2.customerId
WHERE m1.first_seen >= '2024-01-01'
  AND m1.first_seen < '2024-02-01'
  AND m2.type = 'conversion'
GROUP BY 1
ORDER BY 1
```

---

## Deployment Considerations

### Development
- Telemetry saved to `telemetry-data.json` (trimmed to 50k events)
- Admin dashboard at `/admin/telemetry`
- Test with: `getCustomerId()` returns stable UUID

### Production
- Ready to swap backend to SQL (replace `/api/analytics` POST handler)
- Already handles: deduplication, stage progression, funnel analysis
- customerHint field ready for Wix CRM sync (Phase 6)

### Monitoring
- Check `/api/analytics?mode=summary` for real-time metrics
- Look for anomalies in:
  - `conversions.count` per day (should increase with Wix integration)
  - `candidates.score` distribution (high-value customers identified?)
  - `cohorts` upgrade timing (predictable or random?)

---

## Success Metrics (Post-Implementation)

| Metric | Before | After Phase 3 | After Phase 4 | After Phase 5 |
|--------|--------|---------------|---------------|---------------|
| Events/day | 50 | 200+ (orders) | 400+ (signed users) | 600+ |
| Revenue tracked | $0 | $12k/month | $45k/month | $65k/month |
| Conversion events | 0 | 25/month | 120/month | 180/month |
| Avg customer journey | Unknown | Awareness→Revenue | Complete | Multi-touch |
| Upgrade candidates | N/A | Top 25 ranked | By user | By partnership |

---

## References & Documentation

- **Completed**: [WIX_DASHBOARD_INSTRUMENTATION.md](WIX_DASHBOARD_INSTRUMENTATION.md)
- **Schema**: [frontend/lib/analytics/monetizationEvents.ts](frontend/lib/analytics/monetizationEvents.ts)
- **API**: [frontend/pages/api/analytics.ts](frontend/pages/api/analytics.ts)
- **Admin**: [frontend/pages/admin/telemetry.tsx](frontend/pages/admin/telemetry.tsx)
- **Scoring**: [frontend/lib/analytics/scoring.ts](frontend/lib/analytics/scoring.ts)

