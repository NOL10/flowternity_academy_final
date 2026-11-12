# Metrics Flow Investigation Report

## Summary (Root Cause First)

Leadership metrics **are** being saved correctly to the database, but they **never appear** on the user dashboard due to **two field-name mismatches** between what the API returns and what the dashboard reads.

| Location | What it reads | What the API actually returns |
|---|---|---|
| `dashboard/page.js:652` | `m.metric_id === category.id` | Each object has `m.id`, **not** `m.metric_id` |
| `dashboard/page.js:653` | `metric?.score` | Each object has `metric.average` (a number), **not** `score` |

Additionally, the "no data" guard (`leadershipData.metrics.length === 0`) **never triggers**: the API always returns exactly 7 objects (one per dimension), even when no scores have been recorded — so the empty-state message never shows, and all 7 cards render with `score = 0` (from `undefined || 0`).

---

## 1. How the Admin Saves Performance Metrics

**Endpoint:** `PATCH /api/admin/athletes/:targetId/metrics`  
**File:** `app/api/[[...path]]/route.js` lines 2993–3045  

**Request body:**
```json
{ "sport_id": "basketball", "scores": { "dribbling": 8, "shooting": 7 } }
```

**DB collection:** `athlete_metrics`  
**Document fields stored:**

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Record ID |
| `user_id` | uuid | Parent user ID (resolved from child profile if applicable) |
| `child_profile_id` | uuid or null | Child profile ID when target is a child |
| `sport_id` | string | e.g. `"basketball"` |
| `scores` | object | Key-value map of metric key → numeric score (0–10) |
| `created_at` | Date | — |
| `updated_at` | Date | — |
| `updated_by` | uuid | Admin user ID |

**Admin UI call** (`admin/page.js:3905`):
```js
fetch(`/api/admin/athletes/${selected.id}/metrics`, {
  method: 'PATCH',
  body: JSON.stringify({ sport_id: activeSport, scores: dirty }),
})
```
`selected.id` is either a `child_profile_id` or `user.id` depending on the athlete type. The API resolves it correctly.

---

## 2. How the Admin Saves Leadership Metrics

**Endpoint:** `POST /api/leadership-metrics`  
**File:** `app/api/[[...path]]/route.js` lines 4663–4683  

**Request body:**
```json
{ "user_id": "...", "sport_id": "basketball", "metric_id": "discipline", "score": 8, "notes": "" }
```

**DB collection:** `leadership_metrics`  
**Document fields stored:**

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Record ID |
| `user_id` | uuid | The athlete/child ID passed by the admin UI |
| `sport_id` | string | e.g. `"basketball"` |
| `metric_id` | string | One of the 7 LEADERSHIP_METRICS ids |
| `score` | int | 1–10 |
| `notes` | string | Optional notes |
| `recorded_by` | uuid | Admin user ID |
| `recorded_at` | Date | — |

**Admin UI call** (`admin/page.js:3945–3959`):
```js
// Called once per scored metric via Promise.all
fetch('/api/leadership-metrics', {
  method: 'POST',
  body: JSON.stringify({
    user_id: selected.id,   // child profile ID (or user ID)
    sport_id: activeSport,
    metric_id: metricId,    // e.g. "discipline"
    score: parseInt(score),
    notes: leadershipNotes || '',
  }),
})
```

---

## 3. How the User Dashboard Fetches Performance Metrics

**Endpoint called:** `GET /api/athletes/:subject_id/performance?history=true`  
**File:** `app/dashboard/page.js` lines 72–82  

```js
const subject_id = activeChild?.id || user.id;
fetch(`/api/athletes/${subject_id}/performance?history=true`, { credentials: 'include' })
  .then(d => setPerformanceData(d))
```

**Data expected by dashboard:** `d.sports[]` — each sport has `{ sport_id, scores: {}, level }`.

**Component that renders it:** Inline JSX within `dashboard/page.js`, iterating over `metricsForSport(activeSport)` and reading `current_perf.scores[metric.key]`.

---

## 4. How the User Dashboard Fetches Leadership Metrics

**Endpoint called:** `GET /api/leadership-metrics?user_id=:subject_id&sport_id=:sport`  
**File:** `app/dashboard/page.js` lines 83–87  

```js
const subject_id = activeChild?.id || user.id;
fetch(`/api/leadership-metrics?user_id=${subject_id}&sport_id=${activeSport}`, { credentials: 'include' })
  .then(d => setLeadershipData(d))
```

**Data expected by component** (`dashboard/page.js:652–653`):
```js
const metric = leadershipData.metrics.find(m => m.metric_id === category.id);
const score  = metric?.score || 0;
```

The dashboard expects each item in `metrics[]` to have:
- a `metric_id` field
- a `score` field (a number)

**Component that renders it:** `LeadershipCard` component (`dashboard/page.js:832`), receiving `score` prop.

---

## 5. The Bug — Why Leadership Metrics Do NOT Appear

### Bug 1: Wrong field name — `metric_id` vs `id`

**Where:** `dashboard/page.js` line 652  

The dashboard does:
```js
leadershipData.metrics.find(m => m.metric_id === category.id)
```

But the API endpoint (`route.js:4697–4712`) builds grouped objects from `LEADERSHIP_METRICS` like this:
```js
grouped[m.id] = { ...m, scores: [], latest: null, average: 0 };
// spreads the LEADERSHIP_METRICS entry which has:  id, name, description, why, emoji, color
```

It then spreads the `LEADERSHIP_METRICS` config entry (which has field `id`, NOT `metric_id`) into the grouped object. So every returned metric object has field `id = "discipline"`, **never** a `metric_id` field. The `.find()` always returns `undefined`, so `score = undefined || 0 = 0` for every card.

### Bug 2: Wrong field name — `score` vs `average`

**Where:** `dashboard/page.js` line 653  

Even if the `.find()` above were fixed (by matching `m.id`), the dashboard still reads `metric?.score`. But the API returns `metric.average` (computed at lines 4709–4711):
```js
m.average = Math.round((m.scores.reduce((a, b) => a + b, 0) / m.scores.length) * 10) / 10;
```

There is no `score` property on the grouped objects — only `average`, `scores` (array), `latest`.

### Bug 3: "No data" guard never triggers

**Where:** `dashboard/page.js` line 643  
```js
!leadershipData || !leadershipData.metrics || leadershipData.metrics.length === 0
```

The API **always** returns `metrics` as an array of 7 items (one per dimension from `LEADERSHIP_METRICS.forEach(...)`). When no scores have been recorded, `average` is 0 and `scores` is `[]`, but the array still has 7 elements. So `metrics.length` is never 0, the guard never triggers, and the user sees 7 cards all showing 0 instead of the "not yet recorded" placeholder.

### Bug 4: `activeSport` may be `null` on first render

**Where:** `dashboard/page.js` line 83  
```js
fetch(`/api/leadership-metrics?user_id=${subject_id}&sport_id=${activeSport}`, ...)
```
`activeSport` is initialized to `'basketball'` at line 25. This is fine in practice — but the leadership fetch fires before `performanceData` resolves, so `activeSport` could be `'basketball'` even when the athlete has no basketball data. This is minor but worth noting.

---

## 6. The Exact Query Used to Fetch Leadership Metrics for the Dashboard

**File:** `app/api/[[...path]]/route.js` lines 4686–4695

```js
const url = new URL(request.url);
const user_id  = url.searchParams.get('user_id');
const sport_id = url.searchParams.get('sport_id');

if (!user_id) return err('user_id required', 400);

const filter = { user_id };
if (sport_id) filter.sport_id = sport_id;

const records = await db.collection('leadership_metrics')
  .find(filter)
  .sort({ recorded_at: -1 })
  .toArray();
```

Then grouped:
```js
const grouped = {};
LEADERSHIP_METRICS.forEach(m => {
  grouped[m.id] = { ...m, scores: [], latest: null, average: 0 };
});

records.forEach(m => {
  if (grouped[m.metric_id]) {
    grouped[m.metric_id].scores.push(m.score);
    if (!grouped[m.metric_id].latest) grouped[m.metric_id].latest = clean(m);
  }
});

Object.values(grouped).forEach(m => {
  if (m.scores.length > 0)
    m.average = Math.round((m.scores.reduce((a, b) => a + b, 0) / m.scores.length) * 10) / 10;
});

return j({ metrics: Object.values(grouped), all_records: records.map(clean) });
```

---

## 7. Where `LEADERSHIP_METRICS` Is Defined and What Each Entry Has

**File:** `lib/flowternity/config.js` lines 54–103  

```js
export const LEADERSHIP_METRICS = [
  {
    id: 'discipline',           // string — unique identifier
    name: 'Discipline & Professionalism',
    description: '...',         // long text
    why: '...',                 // rationale
    emoji: '⏰',
    color: 'bg-blue-500',
  },
  // ... 6 more with ids:
  // 'effort', 'skill', 'teamwork', 'leadership', 'community', 'consistency'
];
```

All 7 entries have exactly: `id`, `name`, `description`, `why`, `emoji`, `color`.  
There is **no** `metric_id` field, and **no** `score` field — confirming both bugs above.

---

## 8. Side-by-Side: Athlete Metrics vs Leadership Metrics

### Save flow

| Aspect | Performance (`athlete_metrics`) | Leadership (`leadership_metrics`) |
|---|---|---|
| Admin endpoint | `PATCH /api/admin/athletes/:id/metrics` | `POST /api/leadership-metrics` |
| Admin file | `admin/page.js:3905` | `admin/page.js:3946` |
| API handler | `route.js:2993` | `route.js:4663` |
| Collection | `athlete_metrics` | `leadership_metrics` |
| Key field | `scores` (object map) | `metric_id` + `score` per record |
| Update method | Upsert — merge into one doc per athlete+sport | Insert new record each time (history) |
| `user_id` stored | Resolved to parent user ID when target is child | Stored as `selected.id` (child profile ID passed directly) |

### Fetch flow

| Aspect | Performance | Leadership |
|---|---|---|
| Dashboard endpoint | `GET /api/athletes/:id/performance` | `GET /api/leadership-metrics?user_id=:id&sport_id=:sport` |
| Dashboard file | `dashboard/page.js:73` | `dashboard/page.js:83` |
| API handler | `route.js:276` | `route.js:4685` |
| Returns | `{ sports: [{ sport_id, scores:{}, level }] }` | `{ metrics: [{id, name, scores:[], average, latest}] }` |
| Dashboard reads | `current_perf.scores[key]` ✅ correct | `m.metric_id` ❌ (should be `m.id`) + `metric.score` ❌ (should be `metric.average`) |

---

## Conclusions

1. **Performance metrics work end-to-end** — the save and fetch field names align correctly.
2. **Leadership metrics save correctly to the database** — records in `leadership_metrics` collection are valid.
3. **Leadership metrics never display on the user dashboard** — two field-name mismatches in `dashboard/page.js` mean every lookup returns `undefined`, every card shows 0.
4. **The combined score widget is also broken** for leadership because `m.score || 0` always evaluates to 0.
5. **The "no data recorded" empty state never shows** because the API always returns 7 items.

---

## Recommended Fixes (do not implement here — investigation only)

### Fix 1 — `dashboard/page.js` line 652: use `m.id` not `m.metric_id`

```js
// BEFORE
const metric = leadershipData.metrics.find(m => m.metric_id === category.id);
// AFTER
const metric = leadershipData.metrics.find(m => m.id === category.id);
```

### Fix 2 — `dashboard/page.js` line 653: use `average` not `score`

```js
// BEFORE
const score = metric?.score || 0;
// AFTER
const score = metric?.average || 0;
```

### Fix 3 — `dashboard/page.js` lines 370 and 385: Leadership Score header widget uses same wrong field

```js
// BEFORE (line ~371)
leadershipData.metrics.reduce((sum, m) => sum + (m.score || 0), 0) / leadershipData.metrics.length
// AFTER
leadershipData.metrics.reduce((sum, m) => sum + (m.average || 0), 0) / leadershipData.metrics.length
```

### Fix 4 — `dashboard/page.js` line 643: fix "no data" guard

The guard should check if **any metric has been scored** (average > 0), not just whether the array is non-empty:

```js
// BEFORE
!leadershipData || !leadershipData.metrics || leadershipData.metrics.length === 0
// AFTER
!leadershipData || !leadershipData.metrics || leadershipData.metrics.every(m => m.average === 0)
```

### Fix 5 (optional) — API GET `/leadership-metrics`: add `metric_id` alias

Alternatively, the API could add a `metric_id` alias to each grouped entry so the dashboard field name `metric_id` works without changing the UI:
```js
grouped[m.id] = { ...m, metric_id: m.id, scores: [], latest: null, average: 0 };
```
This is less preferred than fixing the dashboard to use `m.id`.

---

## Files and Line Numbers Cited

| File | Lines | Relevance |
|---|---|---|
| `app/api/[[...path]]/route.js` | 2993–3045 | Performance metrics save (PATCH) |
| `app/api/[[...path]]/route.js` | 4663–4683 | Leadership metrics save (POST) |
| `app/api/[[...path]]/route.js` | 4685–4714 | Leadership metrics fetch (GET) — returns `id`+`average` |
| `app/api/[[...path]]/route.js` | 276–340 | Performance metrics fetch (GET) |
| `app/dashboard/page.js` | 25 | `activeSport` state initialized to `'basketball'` |
| `app/dashboard/page.js` | 72–87 | Performance + leadership fetch effects |
| `app/dashboard/page.js` | 349–395 | Combined score widget — reads `m.score` ❌ |
| `app/dashboard/page.js` | 643–668 | Leadership section render — reads `m.metric_id` ❌ and `metric.score` ❌ |
| `app/admin/page.js` | 3905–3912 | Performance metrics save |
| `app/admin/page.js` | 3939–3964 | Leadership metrics save |
| `lib/flowternity/config.js` | 54–103 | `LEADERSHIP_METRICS` definition |
| `lib/flowternity/config.js` | 105–117 | `METRIC_SCORES` scale 1–10 |
