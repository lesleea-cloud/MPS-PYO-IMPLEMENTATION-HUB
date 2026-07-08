# Sprout PYO Implementation Hub — Enhancement Blueprint
**File:** `index.html`
**Session date:** May 10, 2026
**Scope:** Implementer Dashboard + My Clients → Implementation Phases tab

---

## Overview

This document captures all UI/UX enhancements agreed upon during this brainstorming session. It covers three areas:

1. **Implementer Dashboard — Needs Attention panel** (coded ✅)
2. **Implementer Dashboard — general layout improvements** (designed, not yet coded)
3. **My Clients → Implementation Phases tab** (designed, not yet coded)

---

## 1. Needs Attention Panel — Enhanced Alert Logic ✅ Coded

### What changed
The Needs Attention panel was redesigned from a simple two-section list (Overdue / Upcoming) into a fully prioritized alert feed that covers all key implementation phases — not just live run.

### New alert types

| Priority | Color | Trigger | Badge |
|---|---|---|---|
| 0 | Red `#dc2626` | Live run date has passed but `live` phase not ticked | Overdue |
| 1 | Red `#dc2626` | KOM done but Simulation not started — 15+ days idle | Overdue |
| 2 | Red `#dc2626` | Simulation done but Parallel Run not started — 15+ days idle **(PYO only)** | Overdue |
| 2 | Red `#dc2626` | Simulation done but Project Checklist not started — 15+ days idle **(PS only)** | Overdue |
| 3 | Orange `#ea580c` | Live run date within **7 days** | X days |
| 4 | Yellow `#f59e0b` | Live run date within **8–14 days** | X days |
| 5 | Blue `#2563eb` | KOM done, Simulation not yet scheduled (no live run date) | Schedule |
| 6 | Blue `#2563eb` | Simulation done, Parallel Run not yet scheduled **(PYO only)** | Schedule |
| 6 | Blue `#2563eb` | Simulation done, Project Checklist not yet scheduled **(PS only)** | Schedule |

### What was removed
- Section sub-headers ("OVERDUE", "UPCOMING — LIVE RUN", etc.) — redundant since each row badge communicates the same thing
- "On track" / "All clear" section — only projects needing action appear
- Completed projects (all phases done) are excluded — PS uses `kom+sim+checklist+live+post`; PYO uses `kom+sim+par+live+post`
- Churned projects are excluded

### New row anatomy
Each alert row now shows:
- **Colored dot** — urgency color at a glance
- **Client name** — bold
- **Sub-text** — plain-language description of the issue
- **Date line** — the relevant date (live run, KOM, etc.) highlighted in color if overdue
- **Right column:**
  - Badge (Overdue / X days / Schedule)
  - Phase tag (Simulation / Parallel run / Live run)
  - Days label (Xd past / Xd idle) for overdue items

### New UI elements added
- **Alert count badge** in the panel header (e.g. "5 alerts") — hidden when no alerts
- **Legend strip** at the bottom of the panel — color key for dot meanings, shown only when alerts exist

### CSS classes added
```
.impl-attn-date       — date line in each row
.impl-attn-right      — right-side column wrapper (badge + phase + days)
.impl-attn-phase      — small gray phase tag
.impl-attn-days       — days past/idle counter
.impl-attn-legend     — legend strip at panel bottom
.impl-attn-leg-item   — single legend item
.impl-attn-leg-dot    — legend color dot
```

### CSS classes removed
```
.impl-attn-sublbl     — section sub-headers (no longer needed)
```

### JS function updated
`implRenderAttention(myD)` — fully rewritten. New behavior:
- Builds a flat `alerts[]` array, sorted by `priority` (0 = most urgent)
- Skips clients where all 5 phase flags (`kom sim par live post`) are 1
- Skips churned clients
- Updates `#impl-attn-count` badge with live count
- Shows/hides `#impl-attn-legend` based on whether alerts exist

### Priority 2 — service-aware
Priority 2 is gated on `d.simDate` and branches by `d.service`:
- PYO clients: fires when `d.sim===1 && d.par!==1 && simDate 15+ days ago`
- PS clients: fires when `d.sim===1 && d.checklist!==1 && simDate 15+ days ago`
PS clients are never flagged for missing Parallel Run.

---

## 2. Implementer Dashboard — Layout Improvements 🔲 Not yet coded

### 2a. Stacked priority layout
The full dashboard was redesigned with these principles:

**Problems solved:**
- "My Projects" was buried at the bottom — now anchors the top-left
- Project Status panel took up too much space — moved below My Projects, more compact
- Right panel was empty until a project was clicked — now always populated
- KPI cards were tall and repetitive — replaced with a compact inline stat bar

**New layout structure:**
```
┌─────────────────────────────────────────────────────┐
│  App header (logo, role pill, sign out)             │
├──────────────┬──────────────────────────────────────┤
│              │  Greeting + Search bar               │
│   Sidebar    ├──────────────────────────────────────┤
│              │  KPI inline bar                      │
│  - Overview  ├────────────────────┬─────────────────┤
│  - My Dash   │  My Projects       │ Needs Attention │
│  - My Clients│  (scrollable list) ├─────────────────┤
│  ──────────  │                    │ Selected Project│
│  - System    │  ──────────────────│ (scrollable     │
│  - Admin Tool│  Project Status    │  detail panel)  │
│  - Settings  │  by Module         │                 │
└──────────────┴────────────────────┴─────────────────┘
```

**Column widths:**
- Sidebar: 190px fixed
- Left column (My Projects + Project Status): flex 1.2, fluid
- Right column (Needs Attention + Selected Project): 280px fixed

### 2b. My Projects panel enhancements

**Filter pills** — filter the list by:
- All (default)
- Live
- Ongoing
- Not started
- PYO
- Payroll Starter

**Sort button** — toggles go-live date ascending/descending

**Project ordering** (within each filter):
1. Ongoing
2. Not yet started / On-Hold / For Turnover
3. Live
4. Churned

*(Group labels removed — status badge on each row does the labeling)*

**Each project row shows:**
- Initials avatar (deterministic color from client name)
- Client name + status badge
- Month · service · go-live date
- Progress bar + percentage

**Selected row:** Green left border + green background fill. Clicking a row updates the Selected Project panel (fade-in transition).

### 2c. Project Status by Module panel

**Changes from original:**
- Tabs (Payroll Starter / PYO) replaced with side-by-side columns — both visible at once
- Date range shown prominently above the bars ("Week of May 4 – May 8, 2026")
- Horizontal bars with count shown inside (white text on colored fill)

### 2d. Administration Tool → sidebar

**Moved** from the top-right button of the dashboard into the sidebar under **System**, above Settings. Only visible when logged in as Implementer role.

### 2e. Selected Project panel

**Fixed header** (always visible, does not scroll):
- Client initials avatar
- Client name, month, service
- Status badge
- Progress bar + percentage

**Scrollable detail sections:**

| Section | Color dot | Fields |
|---|---|---|
| Overview | Green | Implementor, PM, Status, Service, Duration |
| Implementation phases | Blue | KOM, Simulation, Parallel Run, Live Run, Post Live — Done/Pending |
| Add-on services | Purple | Sprout Gov, Benefits Admin, Salary Disbursement, Statutory Disbursement, Outsourced Timekeeping, Payroll Disbursement |
| Milestone dates | Orange | KOM date, Hand over date, Live run date, Churn date, Billing month, Month completed |
| After hand over | Gray | CSM, Processor |

**Interaction:**
- Clicking a row in **My Projects** highlights it + fades in that client's details
- Clicking a row in **Needs Attention** does the same, and syncs the highlight in My Projects
- No project is auto-selected on login — right panel shows a "Select a client" placeholder until the user clicks a row in My Projects
- Transition: fade-in (`@keyframes implFadeIn`)

---

## 3. My Clients → Implementation Phases Tab ✅ Coded

### 3a. Base layout: Checkbox + date stacked (Option A) ✅ Coded

Each phase column keeps its existing checkbox with a **date below it**, editable inline.

**Date fields per phase:** KOM → `d.komDate`, Simulation → `d.simDate`, Project Checklist (PS only) → `d.checklistDate`, Parallel Run → `d.parDate`, Live Run → `d.liveRun`. Post Live has no date field.

**New data fields added:**
- `simDate` — Simulation date (string, MM/DD/YYYY format)
- `checklistDate` — Project Checklist date (Payroll Starter only)
- `checklist` — Project Checklist checkbox (int 0/1, Payroll Starter only)
- `parDate` — Parallel Run date

These were added to:
- Excel upload parser (`stHandleFile` + `handleImport`)
- Export logic (Milestone Dates sheet, 11 columns)
- Implementation Phases tab rendering (`clPhaseBox`)

**Column structure — PYO clients:**
```
# | CLIENT NAME | KOM | SIMULATION | PARALLEL RUN | LIVE RUN
```
**Column structure — Payroll Starter clients:**
```
# | CLIENT NAME | KOM | SIMULATION | PROJECT CHECKLIST | LIVE RUN
```
Project Checklist column (`ph-th-checklist`) is shown only when `CL_TYPE==='ps'`; Parallel Run column (`ph-th-par`) is hidden for PS. PS phase sequence: `['kom','sim','checklist','live']`. Progress percentage for PS uses 4 phases (KOM, SIM, Checklist, Live Run).

**Each phase cell:**
```
[ ✓ checkbox ]          ← .cl-cb (toggleable)
  MM/DD/YYYY            ← .ph-date (click to edit inline)
```

Empty dates show `—`. Clicking the date opens a native `<input type="date">` in-place; blur/Enter saves it. Saving calls `autoSave()`.

**CSS classes added:**
- `.ph-cell` — flex column wrapper (checkbox + date)
- `.ph-date` — date area: 10px mono, clickable, hover turns green

**JS functions added:**
- `clPhaseBox(no, field, val, service, dateVal)` — updated signature, wraps checkbox + date in `.ph-cell`
- `phDateEdit(no, field)` — swaps date div for inline date input
- `phDateSave(no, field, isoVal)` — saves to D record, restores display

### 3b. Enhancement 1: Active phase column highlight ✅ Coded (June 18, 2026)

The column representing the **most commonly active phase** across the implementor's clients gets:
- **Green tinted header** (`.col-active-hdr` — `background:#EAF3DE; color:#27500A`)
- **Subtle green background** on cells in that column (`.col-active`)
- **Dashed checkbox border** for cells where that phase is "next up" (`.cb-next`)
- **"Next" micro-badge** below the dashed checkbox

**Logic for determining active column:**
- Count how many clients have each phase as their next pending step
- The phase with the highest count = active column
- Per cell: if the phase is done → normal checked box; if it's the active phase and not done → dashed "Next" box; if it's beyond the current phase → empty unchecked box

**CSS classes needed:**
```css
.col-active     { background: rgba(99,153,34,0.05); }
.col-active-hdr { background: #EAF3DE; color: #27500A; }
.cb-next        { border: 1.5px dashed #639922; background: #f1f9e6; }
.next-badge     { font-size: 9px; background: #EAF3DE; color: #27500A;
                  padding: 1px 5px; border-radius: 10px; font-weight: 500; }
```

---

## Data Schema Changes Required

To fully implement all enhancements, the following new fields need to be added to each client record:

| Field | Type | Description | Used by | Status |
|---|---|---|---|---|
| `simDate` | String (MM/DD/YYYY) | Simulation phase date | Phases tab, Needs Attention | ✅ Added |
| `parDate` | String (MM/DD/YYYY) | Parallel Run phase date | Phases tab, Needs Attention | ✅ Added |

Both fields are now included in:
- **Download template** (`stDownloadTemplate`) — `Simulation Date` and `Parallel Run Date` columns in the Milestone Dates sheet, positioned between KOM Date and Hand Over Date
- **Record push** in `stHandleFile` — initialized as `''`
- **Milestone Dates parser** in `stHandleFile` — reads and maps via `parseImportDate()`

Priority 2 alert in `implRenderAttention` will activate automatically once `simDate` is populated from an upload.

---

## Bug Fixes Applied

| Fix | Files | Details |
|---|---|---|
| **`_snap` undefined on page load** | index.html | `var _snap` was declared after the IIFE that calls `_takeFullSnapshot()` — moved declaration above the IIFE so it is initialized before use (June 19, 2026) |
| **`_supa` undefined on Google Sign-In click** | index.html | Supabase CDN URL changed from `@supabase/supabase-js@2` (resolves to ESM) to explicit UMD path `/dist/umd/supabase.js`; null guard added in `doGoogleLogin()` (June 19, 2026) |
| **Header date shows "Mar 30, 2026"** | Both HTML | `startApp()` now sets `#hdr-date` and `#last-updated` dynamically using `new Date()` on every login. HTML placeholders are overwritten at runtime. |
| **Masterfile data missing in output** | Both HTML | Three root causes fixed: (1) `colMap` header row detection is now dynamic (scans for the row with 'Status'+'Employee ID') instead of hardcoded `r:1`; (2) `mfInjectRows` now handles namespace-prefixed XML tags (`</x:sheetData>`, `<x:row>`) from Excel-generated templates; (3) `colMap` now built directly from `xlRaw[hdrIdx]` array instead of `xlRange` cell lookup — ensures column indices match exactly. |
| **Generated file has no source data + header formatting not preserved** | index.html | Reverted all `mfDownload` rewrites back to original 8PM code. `mfInjectRows`, `mfColLetter`, `mfEscXml`, and `mapped['Previous Employer Taxable Salaries']` all restored to original. |
| **Implementer dashboard bleeds into Clients page** | Both HTML | Fixed in `go()` using inline styles (`pg.style.display='none'/'flex'`), which beat ID-selector CSS specificity. `#page-impl` keeps `display:flex` in CSS — removing it changes `main`'s scroll height and distorts all other pages' grid proportions. |
| **Admin tool menu never closes on outside click** | index.html | Click-outside handler was targeting `#admin-tool-wrap` (non-existent ID) — corrected to `#nav-admin-tool-wrap`. |
| **`mfNormBankType` incorrectly mapped non-bank values to 'Savings'** | index.html | Removed redundant `includes('savings')` branch — simplified to: 'current' → `Current`, any other non-empty string → `Savings`. |
| **Dashboard "Resource Workload" and "Avg Progress by Resource" panels empty for Admin** | index.html | `renderDashboard()` had `var rl=['Ana','Bea','Carl','Dana','Eli']` hardcoded — replaced with `TEAM_CONFIG.implementers`. Also added inline RC color refresh so new implementers get a color even if team config was never re-saved. (June 19, 2026) |
| **Upload Project Timeline extracts no dates** | index.html | Two bugs in `tlParseFile`: (1) `raw:false` caused SheetJS to format Excel date serials as plain number strings like `"46207"` instead of keeping the numeric value; (2) `String(row[4]||'')` converted any number to a string before `parseImportDate`, defeating its `typeof val==='number'` branch. Fixed: changed to `raw:true` and pass `row[4]` directly to `parseImportDate`. (June 19, 2026) |
| **Audit Trail page always empty — changes never appeared** | index.html | `go()` handled `page==='audit'` with a standalone `if` that only added the nav active class — `renderAudit()` was never in the `else if` render chain. Every other page had a render call; audit was the only one missing. Fixed by adding `else if(page==='audit')renderAudit()` to the chain. (June 19, 2026) |
| **Client table row spacing improved across all tabs** | index.html | `.ctd` and `.cth` padding increased from `8px 12px` to `10px 14px`. `.ph-cell` given `min-height:44px` + `justify-content:center` so Implementation Phases rows are uniform height whether or not a date exists. (June 19, 2026) |
| **"Turned Over" checkbox not persisting after logout** | index.html + Supabase | `_supaFlush()` afterho upsert only saved `csm` and `processor` — `turned_over` was silently dropped. Load code also never read it back. Fixed: added `turned_over: !!a.turnedOver` to upsert payload, added `turnedOver: a.turned_over?1:0` to load. Also added `_supaFlush()` call in `ahToggleCb` for immediate persistence. Supabase: requires `ALTER TABLE client_afterho ADD COLUMN IF NOT EXISTS turned_over BOOLEAN DEFAULT FALSE`. (June 19, 2026) |
| **Dead mapped key `'Previous Employer Taxable Salaries'`** | index.html | Removed — no matching column in MF_COLUMNS or PayrollPie template; was silently dropped on every export. |
| **Inactive/terminated employees exported as `Status=ADD`** | index.html | Reverted — early employment status filter was causing data transfer issues in testing. Deferred pending further investigation. |
| **Generate button enabled before output template columns parsed (race condition)** | index.html | Moved button enable into the `reader.onload` callback for the 'out' file, so it only fires after `MF.outCols` is populated. When 'ref' is uploaded second, it checks `MF.outCols !== null` before enabling. |
| **CSV source files failed to parse** | index.html | `mfReadXlsx` now detects `.csv` by extension and uses `readAsText` + `XLSX.read({type:'string'})` instead of the binary array path. |
| **Duplicate `display:none` on download button** | index.html | Removed the second `display:none` from the `#mf-download-btn` inline style (the property appeared twice; `align-items` and `gap` were unreachable). |
| **Dead outer `TOOLS` object** | index.html | Removed unused `var TOOLS={...}` at the top of the admin tools section — `openTool()` already redefines it locally. |

---

## Supabase Integration ✅ Coded (June 5, 2026) — Google OAuth wired June 18, 2026

### Project
- **Supabase project:** SPROUT IMPLEMENTATION PYO HUB
- **URL:** `https://jchqgxyectvsqfmrnype.supabase.co`
- **Auth provider:** Google OAuth (restricted to `@sprout.ph` org)
- **Google OAuth Client ID:** `645223084491-2ai2av0bql15nr0hstnln461usjohfpj.apps.googleusercontent.com`
- **Authorized JS origin:** `https://mps-pyo-implementation-hub.vercel.app`
- **Redirect URI:** `https://jchqgxyectvsqfmrnype.supabase.co/auth/v1/callback`

### Database tables — complete (no localStorage-only gaps as of June 20, 2026)
| Table | Purpose |
|---|---|
| `clients` | Main D[] array — all client records |
| `client_addons` | CL_ADDONS (sg, ba, sd, std, otk, pd) |
| `client_milestones` | CL_MILESTONES (churnDate, billingMonth, monthCompleted) |
| `client_afterho` | CL_AFTERHO (csm, processor, turnedOver) |
| `team_config` | TEAM_CONFIG implementers + pms arrays |
| `user_roles` | Maps @sprout.ph email → role + implementer_name |
| `vault_items` | Implementation Vault entries (links + file metadata) |
| `impl_moms` | MOMs synced from Gmail via Apps Script |
| `client_issues` | CL_ISSUES — Issue Log entries |
| `audit_log` | CL_AUDIT — append-only audit trail |
| `pending_bank` | PENDING_BANK — shared library of pending item templates |
| `client_pending` | CLIENT_PENDING — per-client pending checklists (JSONB array per client_no) |

### Storage buckets
| Bucket | Purpose |
|---|---|
| `vault-files` | File uploads from Implementation Vault (private, signed URLs) |

### Login flow
- Login screen replaced with "Sign in with Google" button — dark green-black background (`#0f1f0c`), Sprout green text and G icon (`#32CE13`), matching the sidebar aesthetic
- On auth: looks up user email in `user_roles` to get role + name
- Unauthorized emails shown error; Supabase session signed out

### Data strategy (hybrid)
- **Load:** Supabase first → localStorage fallback → baked defaults
- **Save:** localStorage immediately (sync) + Supabase 1.5s debounced (async)
- Both stay in sync; localStorage serves as offline/error backup

### Code changes in index.html
- Added `@supabase/supabase-js@2` CDN
- Added Supabase integration block (before `doLogin()`): `_supa`, `doGoogleLogin()`, `onAuthSuccess()`, `loadFromSupabase()`, `supabaseSave()`, `initAuth()`
- `_authHandled` flag added to `initAuth()` — prevents `onAuthSuccess()` from firing twice when both `getSession()` and `onAuthStateChange` resolve on page load
- `#login-screen` CSS hardened — added `flex-direction:row`, `min-height:100vh`, `width:100vw` to prevent layout collapse
- `.login-right` CSS hardened — added `min-width:0`, `height:100%` to ensure right panel always fills its flex space and centers the card correctly
- `autoSave()` now calls `supabaseSave()` after localStorage save
- `supabaseSave()` debounces 800ms; save logic is in `_supaFlush()` (async, called directly for critical ops)
- All upserts now check `result.error` before updating `_snap` — if Supabase returns an error silently (no throw), the snapshot is NOT updated so the next save retries the data (June 19, 2026)
- Removed `updated_at` from clients upsert payload — if that column didn't exist in Supabase, it was silently rejecting every single client write (June 19, 2026)
- `submitAddClient` now logs an audit entry: "Client Added — [name] ([service], [month], Implementer: [impl])" (June 19, 2026)
- `clDeleteRow` now logs an audit entry: "Client Removed — [name]" and also calls `_supaFlush()` immediately (June 19, 2026)
- `clUpdateStatus()` and `submitAddClient()` call `_supaFlush()` immediately (fire-and-forget) in addition to the debounced save — ensures status changes and new clients reach Supabase right away
- `doSignOut()` is async — cancels debounce timer and `await _supaFlush()` before signing out as a final safety net (June 19, 2026)

---

## Deployment Files

| File | Status |
|---|---|
| `index.html` | ✅ Ready |
| `vercel.json` | ✅ Created (`buildCommand: null, outputDirectory: ".", framework: null`) |

Push both files + `vercel.json` to GitHub root. On Vercel: Framework → Other, Build Command → blank, Output Directory → `.`

---

## 4. Settings — Add Client Panel ✅ Coded

### What was added
A new **"Add New Client"** panel (`id="st-panel-addclient"`) was added to the Settings page, visible to **Admin** and **Implementer** logins only (hidden for Manager).

### Panel location
Inserted between the **Data Management** panel and the **Team Configuration** panel.

### Behavior
- The panel contains a green **"Add Client" button** that opens the existing `#add-client-modal`.
- The modal is already fully featured: Month, PM, Company Name, Availed Service, Implementer, Days, Add-on Services checkboxes.
- Both **Admin** and **Implementer** roles can see and use the Add Client button (June 19, 2026). **Manager** role cannot.
- For **Implementer** logins, `openAddClientModal()` auto-selects and disables the Implementer dropdown, locking it to `IMPL_USER` — implementers can only add clients assigned to themselves.
- For **Admin** logins, the Implementer dropdown remains editable.
- Implementers still cannot Import — that button remains hidden for their role.

### Changes made
| Area | Change |
|---|---|
| Settings HTML | Added `#st-panel-addclient` panel with button |
| `renderSettings()` | Added `st-panel-addclient` visibility control: shown for admin and implementer |
| `openAddClientModal()` | Added implementer role check — auto-sets and disables `acm-impl` when `CURRENT_ROLE === 'implementer'` |

---

## 5. All Clients — Editable PM Field in Overview Tab ✅ Coded

### What changed
The **Project Manager** column in the All Clients → Overview tab was changed from static text to a dropdown select, consistent with the Month, Status, and Service columns.

### PM options source
Populated from `TEAM_CONFIG.pms` (same list used in the Add Client modal and Settings → Team Configuration).

### Changes made
| Area | Change |
|---|---|
| CSS | Added `.cl-pm-sel` — same style as other table selects |
| Overview tab row renderer | PM `<td>` replaced with a `<select class="cl-pm-sel">` built from `TEAM_CONFIG.pms` |
| New JS function | `clUpdatePm(no, val)` — updates `d.pm`, calls `autoSave()` only (no re-render, matches inline-input pattern) |

---

## 6. All Clients Overview — HR-I Column ✅ Coded

### What was added
A new **HR-I** column was added to the All Clients → Overview tab, positioned between PM and Status.

### Field key
`d.hri` (string) — stored on each client record. Defaults to `''` for existing records (backward compatible).

### Dropdown source
`TEAM_CONFIG.implementers` — same pool as the Implementer (Resource) field.

### Changes made
| Area | Change |
|---|---|
| CSS | Added `.cl-hri-sel` |
| Overview tab header | Added "HR-I" `<th>` between PM and Status |
| Overview tab row | PM and HR-I are inline text inputs (same style as CSM/Processor): save on blur/Enter, no re-render |
| New JS function | `clUpdateHrI(no, val)` — updates `d.hri`, calls `autoSave()` only |
| Add Client modal | Top row expanded from 2-column to 3-column: Month · PM · HR-I (all text inputs) |
| `openAddClientModal` | `acm-hri` added to the reset list |
| `submitAddClient` | Reads `acm-hri`, writes `hri` to new D record |
| Export (Overview sheet) | Added `HR-I` column after `Project Manager`; column width 12 |
| Download template | Added `HR-I` column in Overview sheet |
| `stHandleFile` (Settings import) | Reads `row['HR-I']` into `hri` on `newD.push` |
| `handleImport` (Clients page import) | Reads `row['HR-I']` on new record push; updates `d.hri` on existing record update |

---

## Implementation Order (Recommended)

1. ✅ **Needs Attention panel** — coded
2. ✅ **Add `simDate` + `parDate` fields** — added to schema, upload template, import parser, and export
3. ✅ **Implementation Phases tab — checkbox + date stacked** — coded (`clPhaseBox` updated, `phDateEdit`/`phDateSave` added)
4. ✅ **Settings — Add Client panel** — coded (admin + implementer)
5. ✅ **All Clients Overview — editable PM dropdown** — coded
6. ✅ **All Clients Overview — HR-I column** — coded
7. ✅ **Implementation Phases tab — active column highlight** — coded (June 18, 2026)
8. 🔲 **Dashboard layout overhaul** — larger effort, can be done independently

---

## 7. Client Type Split — PYO vs Payroll Starter ✅ Coded (June 6, 2026)

### What changed
All 5 client tabs (Overview, Implementation Phases, Add On Services, Milestone Dates, After Hand Over) now show data split by client type — either **PYO** or **Payroll Starter** — controlled by a toggle at the top of the Clients page.

### Toggle behavior
- Two pill buttons **PYO** | **Payroll Starter** appear above the filter bar
- Default view: PYO
- Selecting a type filters ALL 5 tabs to show only matching clients
- Page title and subtitle update to reflect the active type
- Count label shows number of clients in the selected type

### Client grouping logic
- **PYO**: any client whose `service` field is not `"Payroll Starter"` (covers PYO, PYO + HR, PYO + HR + Sprout Gov, PYO + Sprout Gov, Sprout Gov, Statutory Disbursement)
- **Payroll Starter**: `service === "Payroll Starter"` only

### After Hand Over — Processor column removed
The `Processor` column was removed from the After Hand Over tab:
- Removed from HTML `<thead>` 
- Removed from JS row rendering (`renderClients`)
- Removed from Excel export (sheet now has 4 columns: #, Client Name, Resource, CSM)
- Data field `processor` is retained in `CL_AFTERHO` and import handler for backward compatibility

### New CSS classes
- `.cl-type-bar` — wrapper row for the toggle
- `.cl-type-toggle` — pill container (gray background)
- `.cl-type-btn` — individual toggle button
- `.cl-type-btn.active` — active state (white card, green text, shadow)

### New JS additions
- `var CL_TYPE = 'pyo'` — state variable (added after `CL_TAB`)
- `setClType(type)` — switches type, resets to page 1, re-renders
- `renderClients()` modified — applies type filter before `fdFull()`, updates count label and page title/subtitle

### Implementation Phases — Parallel Run hidden for Payroll Starter
When `CL_TYPE === 'ps'`, the Parallel Run column is fully hidden:
- `<th id="ph-th-par">` gets `display:none` so the column header disappears
- The Parallel Run `<td>` is skipped entirely in row rendering (`CL_TYPE==='ps'?'':...`)
- When switching back to PYO, the column reappears automatically

---

---

## 8. Implementer Dashboard — Priority-Based Collapsible Layout ✅ Coded (June 6, 2026)

### Priority order (user-defined)
1. Alerts / Needs Attention — most important, always visible
2. Project Status by Module (stats/bar chart) — second, collapsible
3. My Projects list — third, collapsible (currently hidden for layout preview)
4. Selected Project detail — fourth, collapsible, hidden until a project is clicked

### Layout
Two scrollable columns side by side:

**Left column:**
- Needs Attention panel — prominent orange header, always visible, body scrolls up to 280px
- My Projects panel — collapsible; ✅ restored (June 18, 2026)

**Right column:**
- Project Status by Module — collapsible (default open), bar chart breakdown by service
- Selected Project — ✅ restored (June 18, 2026); hidden on login, shown only when user clicks a project from My Projects (June 19, 2026)

### KPI bar — clickable drill-down (June 6, 2026)
Each KPI segment (My Projects, Live, Ongoing, Not Started, Churned, Avg Progress) is now clickable with a two-mode dashboard:

**Default mode** (on load): Needs Attention (left) + Project Status by Module (right)

**Drill mode** (on KPI click):
- Needs Attention panel **hides**
- Project Status by Module **hides**
- Filtered client list **fills the left column** (title updates to match KPI, e.g. "Live")
- Right column shows a "Select a client" placeholder (`#impl-drill-placeholder`)
- "← Overview" back button appears in the client list panel header

**On client row click** (drill mode): placeholder hides, Selected Project detail panel fills the right column

**Back to default**: click "← Overview" button OR click the same active KPI again

**Avg Progress** always returns to default overview (filter key `'overview'`) — it does not drill down
New JS: `implKpiClick(filter, label, el)`, `implSetMode(mode)`, `implKpiBack()`
New HTML: `id="cpanel-attn"` on Needs Attention panel, `#impl-drill-placeholder` in right column, `#impl-kpi-back` back button

### Bug fix — Needs Attention body not showing (June 6, 2026)
**Root cause:** Two conflicting `.impl-attn-body` CSS rules existed. The second rule (from the old dashboard layout, line 348) overrode the first with `flex:1;min-height:0;` and no `background` or `max-height`. This caused the body styling to be stripped.
**Fix:** Removed the conflicting second `.impl-attn-body` rule and the unused `.impl-attn-panel` rule. The canonical rule at line 290 (`max-height:280px;background:#fffaf7;`) now applies cleanly.

### Collapsible behavior
- Each collapsible panel has a header row with title + chevron icon
- Clicking the header toggles the `.collapsed` CSS class
- When collapsed: body is `display:none`, chevron rotates -90°
- When expanded: body shows, chevron points down

### Alerts panel design (priority 1 — NOT collapsible)
- Border: 1.5px solid `#fdba74` with orange-tinted box-shadow for glow effect
- Header: solid gradient `#ea580c → #c2410c` (orange to deep orange), white text, bell icon
- Alert count badge: white semi-transparent pill on the colored header
- Body: subtle warm tint (`#fffaf7`), scrollable up to 280px
- Legend: warm tinted background `#fff3e8`

### New CSS classes
- `.impl-cpanel` — collapsible panel base (white, rounded, shadow)
- `.impl-cpanel-hdr` — clickable header row with hover state
- `.impl-cpanel-title` — uppercase label with dot indicator
- `.impl-cpanel-body` — panel content (hidden when `.collapsed`)
- `.impl-chev` — chevron SVG icon, rotates when collapsed
- `.impl-alerts-panel` — extends `.impl-cpanel` with orange left border
- `.impl-alerts-hdr` — warm orange-tinted header background
- `.impl-alerts-title` — orange-tinted title text

### New JS
- `toggleCPanel(id)` — toggles `.collapsed` on `#cpanel-{id}`
- `selProject()` — now shows `#cpanel-project`, removes `.collapsed`, updates title to client name

---

## 9. Sprout Brand Color & Font Update ✅ Coded (June 6, 2026)

Applied Sprout's official design system (https://sprout-design.figma.site/) across the full app.

### Color tokens updated in `:root`
| Variable | Before | After (Sprout brand) |
|---|---|---|
| `--g` (primary green) | `#16a34a` | `#32CE13` Green Apple |
| `--g0` | `#f0fdf4` | `#E9FAE5` Green Apple-50 |
| `--g1` | `#dcfce7` | `#C9F3BE` Green Apple-100 |
| `--g2` | `#86efac` | `#A6EB93` Green Apple-200 |
| `--g4` (dark green text) | `#14532d` | `#239A0D` Green Apple-800 |
| `--b` (blue) | `#2563eb` | `#1679FA` Blueberry |
| `--b0` | `#eff6ff` | `#EEF7FF` Blueberry-50 |
| `--b1` | `#dbeafe` | `#D8EBFF` Blueberry-100 |
| `--o` (orange) | `#ea580c` | `#FF7F00` Carrot |
| `--o0` | `#fff7ed` | `#FFFAEC` Carrot-50 |
| `--o1` | `#fed7aa` | `#FFE5A5` Carrot-200 |
| `--v` (purple) | `#7c3aed` | `#8139EE` Ubas |
| `--v1` | `#ddd6fe` | `#DED6FE` Ubas-200 |
| `--s9` (header bg) | `#0f172a` | `#092903` Deep Green Apple |
| `--bg` (page bg) | `#f0f4f8` | `#F7F5F2` BG 01 |

### Font
- Body font changed from **DM Sans** → **Rubik** (Sprout's body typeface, loaded via Google Fonts)
- Monospace remains DM Mono

### Other updates
- Needs Attention panel gradient: `#ea580c→#c2410c` → `#FF7F00→#CC5C02` (Carrot)
- `SC` status color map updated to Sprout palette
- KPI bar value colors updated to Sprout palette

*Generated from brainstorming session — Sprout PYO Implementation Hub*
*All layout previews were approved before coding began*

---

## 12. Data Migration from PS Implementation Monitoring Excel ✅ Coded (June 6, 2026)

### What was done

#### One-time migration
- Read `PS - Implementation Monitoring (2).xlsx` → sheet `2026 Implem` (37 records)
- Converted all data into the app's internal format and baked into `D_DEFAULT`, `ADDONS_DEFAULT`, `MILESTONES_DEFAULT`, `AFTERHO_DEFAULT`
- `DATA_VERSION` bumped from `0` → `1` to force cache refresh for all users on next load

#### Column mapping (source Excel → app)
| Excel column | Header | App field |
|---|---|---|
| A | (row#) | `no` |
| B | Month (NPN) | `month` |
| C | Client Name | `client` |
| D | Resource | `resource` |
| E | Project Manager | `pm` |
| F | Remarks | `remarks` (status-mapped) |
| G | Availed Service | `service` |
| H | Implem Days | `days` |
| I | KOM DATE | `komDate` (serial→mm/dd/yyyy) |
| J–N | KOM / Sim / Par / Live / Post | `kom sim par live post` (TRUE→1) |
| O–S | Sprout Gov? / BenAd? / Salary / Statutory / OTK? | `CL_ADDONS.sg/ba/sd/std/otk` |
| T | Hand Over Date | `handOver` |
| U | CSM | `CL_AFTERHO.csm` |
| V | Live Run Date | `liveRun` |
| W | Churn Date | `CL_MILESTONES.churnDate` |
| X | Billing Month | `CL_MILESTONES.billingMonth` |
| Y | Month Completed | `CL_MILESTONES.monthCompleted` |
| AB | Processor | `CL_AFTERHO.processor` |

#### Status mapping
`OnHold` → `On-Hold` · `Cancelled`/`Downgraded Subscription` → `Churned` · `Completed` → `Live`

#### Sync Source button (ongoing re-import)
- Added **Sync Source** button (purple, refresh icon) in the My Clients toolbar next to the existing Import button
- Triggers `handleSourceImport(event)` — reads the "2026 Implem" sheet from any uploaded PS Implementation Monitoring xlsx file
- Replaces all D, CL_ADDONS, CL_AFTERHO, CL_MILESTONES with fresh data from the file
- Shows success/error toast after import
- Hidden file input: `#src-import-input`

---

## 11. Overview Tab — Service Column Chips + Add-On Headers Shortened ✅ Coded (June 6, 2026)

### Problem
- **Overview tab**: "Service" column rendered as a `<select>` dropdown with long values like `PYO + HR + Sprout Gov`, causing overflow and crowding out the Days column.
- **Add On Services tab**: Column headers (`Salary Disbursement`, `Statutory Disbursement`, `Outsourced Timekeeping`) were too wide relative to their checkbox content.

### Changes

#### Service column — stacked color chips
- Added CSS classes `.svc-chip` and `.svc-chips-wrap`
- Added `svcChips(svc)` function: converts service string to compact colored badges
  - `PYO` → green chip
  - `+HR` → blue chip
  - `+Gov` / `Gov` → purple chip
  - `Payroll Starter` (full label, not abbreviated) → gray chip
  - `Stat.` (Statutory Disbursement) → orange chip
- Added `svcEditStart(no)` / `svcEditEnd(no)` functions: click-to-edit pattern — chips show normally, clicking reveals the hidden `<select>` to change the value, blur hides it again
- Row rendering updated: chips `<div id="sc-{no}">` + hidden `<select id="ss-{no}">`; on `onchange` → `clUpdateSvc()` → `renderClients()` re-renders with updated chips automatically

#### Add On Services headers — short labels
- `Sprout Gov` → `S. Gov` (title="Sprout Gov")
- `Benefits Admin` → `Benefits` (title="Benefits Administration")
- `Salary Disbursement` → `Salary` (title="Salary Disbursement")
- `Statutory Disbursement` → `Statutory` (title="Statutory Disbursement")
- `Outsourced Timekeeping` → `Timekeep.` (title="Outsourced Timekeeping")
- Full names remain visible on hover via native browser tooltip

---

## 10. Post Live — Moved from Implementation Phases to After Hand Over ✅ Coded (June 6, 2026)

### What changed
**Post Live** was removed from the Implementation Phases tab and the progress percentage calculation, and relocated to the **After Hand Over** tab where it is more contextually relevant.

### Progress percentage (`pct()`)
- **Before:** PYO used 5 phases — KOM, Simulation, Parallel Run, Live Run, Post Live → denominator was 5
- **After:** PYO uses 4 phases — KOM, Simulation, Parallel Run, Live Run → denominator is 4
- Payroll Starter unchanged (3 phases: KOM, Simulation, Live Run)

### Implementation Phases tab
- Removed `<th>Post Live</th>` column header from `<thead>`
- Removed Post Live `<td>` cell from row rendering in `renderClients()`
- Removed `<option value="post">Post Live done</option>` from the phase filter dropdown
- Dashboard phase rings array: removed `{l:'Post Live',k:'post',c:'#94a3b8'}`
- Selected Project side panel phases list: removed `{k:'post',l:'Post Live'}`

### After Hand Over tab
- Added `<th class="cth">Post Live</th>` column header (between CSM and Remarks)
- Added Post Live checkbox cell in row rendering using `clPhaseBox(d.no,'post',d.post,d.service,'')` — same toggle mechanism as Phases tab, data stored in `D[no].post`
- Excel export (`Sheet 4: After Hand Over`): added `Post Live` column header and `d.post===1?'Done':''` value; column widths updated to `[5,38,12,22,12]`

### Selected Project detail panel (Implementer Dashboard)
- Post Live status now appears in the **After hand over** section:
  - Shows `Done` (green) if `d.post === 1`, otherwise `Pending` (gray)
- Removed from Implementation phases section in the same panel

---

## 13. Sidebar Redesign — Dark Nav + Phase-Organized Administration ✅ Coded (June 6, 2026)

### Sidebar appearance
- Background changed from white to `#0b1e08` (deep Sprout green-black)
- Nav group labels: `rgba(255,255,255,.35)` uppercase
- Nav items: `rgba(255,255,255,.65)` text, `rgba(255,255,255,.08)` hover, active item has solid white left border + full green `var(--g)` background
- Dividers: `rgba(255,255,255,.1)`

### Nav group structure (June 8, 2026, updated June 8, 2026)
Dashboard is always the first visible item for every role. Groups:

| Group | Items | Who sees it |
|---|---|---|
| *(no label — top)* | Dashboard | Manager, Admin |
| *(no label — top)* | My Dashboard | Implementer |
| **Reports** | Weekly Status, Monthly Stats | All roles |
| **Clients** *(collapsible dropdown)* | PYO, Payroll Starter | All roles |
| **Clients** *(collapsible dropdown)* | Issue Log | Implementer, God only |
| **Resources** | Implementation Vault | All roles |
| **System** | Administration, Settings | All roles |

Previous structure had "Overview" at top (with Weekly Status first for implementers), "Projects" second — which buried My Dashboard. Now the dashboard item is always the first visible nav entry.

### Clients — collapsible inline dropdown (June 8, 2026)
The "Clients" nav group was converted to an inline collapsible section (`#nav-clients-section`) matching the Administration section pattern:
- Always visible for **all roles** — implementers see their own filtered clients, all others see all clients
- Header row shows "Clients" label + chevron; clicking calls `toggleClientsSection()` which toggles `.open` on `#nav-clients-body` and `#nav-clients-hdr`
- Starts expanded (`open` class on both header and body on page load)
- Sub-items:
  - **PYO** (green dot) — calls `goClients('pyo')` → sets `CL_TYPE='pyo'` then `go('clients')`
  - **Payroll Starter** (teal/blue dot) — calls `goClients('ps')` → sets `CL_TYPE='ps'` then `go('clients')`
  - **Issue Log** (alert circle icon) — calls `go('issues')`; shown only for implementer and god, hidden for manager/admin
- Active state: `.active` class on `#nav-cl-pyo` or `#nav-cl-ps` depending on `CL_TYPE`; synced in both `go()` and `setClType()`
- `go()` also ensures the dropdown stays open (adds `.open`) when navigating to clients or issues
- Legacy `#nav-clients`, `#nav-my-clients`, `#nav-issues` items retained as hidden (`display:none`) for `go()` internal loop compatibility — they are never shown
- The `startApp()` / `godSwitch()` nav loop was updated to `['dashboard','weekly','monthly','impl','vault','settings']` — removing `clients`, `my-clients`, `issues` since these are now handled by the dropdown
- The in-page **PYO / Payroll Starter toggle bar** (`.cl-type-bar`) is hidden (`display:none`) — the sidebar dropdown is the sole entry point for switching between client types. The underlying `#ctb-pyo` / `#ctb-ps` buttons remain in the DOM (hidden) so `setClType()` can still toggle their `.active` class for state tracking without errors

### Administration — collapsible inline section
- Replaced the old floating dropdown (`#nav-admin-tool-wrap` + `#admin-tool-menu`) with an inline collapsible block (`#nav-admin-section`)
- Section is hidden by default; shown only for `CURRENT_ROLE === 'implementer'` users
- Header row shows "Administration" label + chevron; clicking calls `toggleAdminSection()` which toggles `.open` on both `#nav-admin-body` and `#nav-admin-hdr`
- `.nav-admin-hdr.open` rotates the chevron 180°; `.nav-admin-body.open` sets `display:block`
- Removed old `toggleAdminMenu()`, `pickTool()`, and click-outside listener

### Tools organized by phase

| Section | Tools |
|---|---|
| **Common** (pinned band, `rgba(255,255,255,.05)` bg) | MOM Generator |
| **Phase 1 — Setup** (amber dot) | Payroll Account Creator, Masterfile Creator |
| **Phase 2 — Simulation** (blue dot) | Simulation Variance Analysis, CRF Generator (Repli Accts), Sandbox Account Creator, Payroll Calendar Generator |
| **Phase 3 — Parallel Run** (purple dot) | Parallel Run Variance Analysis, Payroll Policy Excel Generator |
| **Phase 4 — Go Live** (green dot) | SLA Generator |

### MOM Generator placement
- Placed in a "Common" pinned section at the top of the Administration body — rationale: MOM is used across all implementation phases (KOM, SIM, parallel run, go live), so it doesn't belong to any single phase.

### New tool keys added to `openTool()` TOOLS object
- `sim-variance` — Simulation Variance Analysis (blue, coming soon)
- `sandbox` — Sandbox Account Creator (blue, coming soon)
- `payroll-policy` — Payroll Policy Excel Generator (purple, coming soon)

### Each tool has a dedicated SVG icon (no emojis)
- MOM Generator: document with lines
- Payroll Account Creator: credit card rect
- Masterfile Creator: document with lines + extra line
- Simulation/Parallel Run Variance: pulse/waveform
- CRF Generator: clipboard
- Sandbox Account Creator: monitor screen
- Payroll Calendar Generator: calendar rect
- Payroll Policy Generator: checklist/task
- SLA Generator: shield

---

## 14. Sidebar Scrollbar + Nav Icon Improvements ✅ Coded (June 6, 2026)

### Sidebar scrollbar styling
- Added custom scrollbar CSS for `nav` element
- 4px-wide thumb on transparent track — visible against dark background without taking space
- `rgba(255,255,255,.2)` default, `rgba(255,255,255,.38)` on hover
- Firefox handled via `scrollbar-width:thin` + `scrollbar-color`

### Distinct icons for My Dashboard and My Clients
- **My Dashboard** (`#nav-impl`): changed from generic person silhouette → ascending 3-bar chart (signals personal metrics/performance)
- **My Clients** (`#nav-my-clients`): changed from single person → person silhouette with checkmark badge (distinct from All Clients which uses a two-person group icon)

---

## 15. God Mode — Developer Full Access ✅ Coded (June 6, 2026)

### What was done
Added a `god` role for the developer account (`lesleea@sprout.ph`) that grants unrestricted access to all role views without re-logging in.

### How it works
- `onAuthSuccess` checks if `user.email === 'lesleea@sprout.ph'` → overrides role to `god`, sets `_IS_GOD = true`
- `ROLE_CONFIG.god`: `hideNav:[]` (no nav items hidden), purple pill label "God Mode"
- All nav items visible + Administration section always shown
- A **role-switcher** (MGR / ADM / IMPL) appears in the header — only visible when `_IS_GOD === true`
- Clicking a tab calls `godSwitch(role)` which:
  - Changes `CURRENT_ROLE` to the selected role
  - Updates pill, avatar color, nav visibility
  - Navigates to that role's default page
  - Highlights the active switcher tab
- Switching to IMPL defaults `IMPL_USER` to the first implementer in `TEAM_CONFIG` if not already set
- `doSignOut()` resets `_IS_GOD = false`

### Role perspectives
| Tab | Pill | Default page | Data filter |
|---|---|---|---|
| MGR | Manager (orange) | Dashboard | All clients |
| ADM | Admin (blue) | Weekly Status | All clients |
| IMPL | Implementer (green) | My Dashboard | Filtered by CURRENT_NAME (god user's own projects) |

### IMPL view — own projects only
When switching to IMPL, `IMPL_USER` is set to `CURRENT_NAME` (the god user's display name from Supabase `implementer_name` field) so the data filters to their own assigned projects — not the first implementer in the team config.

---

## 16. Issue Log Tab + Pending Items Bank Tool ✅ Coded (June 6, 2026)

### Issue Log — standalone sidebar nav item

**Nav location:** Sidebar below "My Clients" (`nav-issues`, `page-issues`) — visible to implementer and god mode only; hidden for manager/admin via `hideNav`
**Icon:** Alert circle (exclamation in circle)
**Renders via:** `renderIssuesPage()` → calls `renderIssueLog(myD)` with implementer's filtered clients
**Nav visibility fix:** `'issues'` added to the nav loop in both `startApp()` and `godSwitch()` — without this, the nav item stays permanently hidden since it initializes as `display:none`

**Data structure:** `CL_ISSUES` array in localStorage (`pyo_issues`)
```
{id, clientNo, clientName, date, description, priority:'high'|'medium'|'low', status:'open'|'resolved', resolution, createdBy}
```

**Fields per issue:** Client (dropdown from current view's clients), Date (auto-filled today), Description (textarea), Priority (High/Medium/Low), Status (Open/Resolved toggle), Resolution notes (shown when resolved)

**Tab count badge:** Shows count of **open** issues only for clients in current view

**Needs Attention integration:** All open issues for the implementer's assigned clients appear as alerts in the Needs Attention panel:
- High → red (priority -1, sorts above phase alerts)
- Medium → orange (priority 0)
- Low → amber (priority 1)
- Each alert shows client name, description, date logged, and priority badge

**CRUD functions:** `ilSave()`, `ilToggleStatus(id)`, `ilUpdateRes(id,val)`, `ilDelete(id)` — all save to localStorage and refresh both the issue log and the Needs Attention panel

### Pending Items Bank — new Administration tool (Common band)

**Nav location:** Common band alongside MOM Generator

**Data structures:**
- `PENDING_BANK` array — standard reusable templates: `{id, label, phase, category}`; phases use real names (`kom`,`sim`,`par`,`checklist`,`live`,`general`); saved to `pyo_pending_bank`
- `CLIENT_PENDING` object — per-client assignments: `{clientNo: [{label, phase, done}]}`; saved to `pyo_client_pending`
- Old phase keys ('1','2','3','4','Common') are migrated to new names on load

**Redesigned single-view UI (no tabs):**

**Header bar:**
- "Pending Items" title on the left
- "⚙ Manage Library" button on the right (toggles to library view)

**Main view (default):**
- Client dropdown — filtered by role: implementers see only their assigned clients (`d.resource === IMPL_USER`); admins/managers see all. Each option shows `ClientName (done/total)` count at a glance.
- Progress bar (green fill, 0–100%) + "X / Y done" counter shown when client has items
- Pending items grouped by phase with colored phase dot headers (KOM, Simulation, Parallel Run, Project Checklist, Live Run, General)
- Done items collapsed under a "✓ Completed" section (strikethrough + 45% opacity)
- Two action buttons: **+ Add from Library** (→ picker view) | **+ Custom Item** (reveals inline input with phase selector)

**Picker view (replaces main content):**
- Shows all library items grouped by phase with checkboxes
- Already-assigned items shown greyed out and pre-checked (disabled)
- "Add Selected" applies checked items; "Cancel" returns to main

**Library view (replaces main content):**
- Lists all library templates grouped by phase with delete buttons
- "Add to library" form: label + phase + category
- "← Back" returns to main (client selection preserved)

**Phase system:**

| Key | Label | Color |
|---|---|---|
| `kom` | KOM | `#2563eb` |
| `sim` | Simulation | `#7c3aed` |
| `par` | Parallel Run | `#ea580c` |
| `checklist` | Project Checklist | `#0e7490` |
| `live` | Live Run | `#16a34a` |
| `general` | General | `#64748b` |

**Key functions:** `renderPendingBankUI(view)`, `pibAddTemplate()`, `pibDeleteTemplate(id)`, `pibToggleItem(clientNo, idx, done)`, `pibDeleteItem(clientNo, idx)`, `pibShowCustom()`, `pibAddCustom()`, `pibAddSelected()`

---

## Section 17 — MOM Generator Improvements

### Auto-populate Sprout staff from team

`renderMOMUI()` default staff list changed from hardcoded `['Ana','Bea','Carl','Dana','Eli']` to:
```javascript
var defaultStaff=(TEAM_CONFIG.implementers||[]).concat(TEAM_CONFIG.pms||[]).filter(Boolean);
if(!defaultStaff.length) defaultStaff=['Ana','Bea','Carl','Dana','Eli'];
```
This pre-fills the staff tag field with the real team (implementers + PMs from `TEAM_CONFIG`) so speaker attribution works immediately without manual entry.

### Slides (.pdf) made optional

- Info banner updated: transcript required, slides optional but recommended
- Slides upload card label changed from required `*` to `(optional)` in grey
- `momCheckReady()` now only requires transcript (`var ready=hasTranscript`)
- `momGenerate()` removed the `if(!MOM_STATE.slides)` error check
- PDF extraction guarded: `var pdfText=MOM_STATE.slides?await momReadPdfText(MOM_STATE.slides):''`

### Copy to clipboard button

- `📋 Copy` button added to footer next to `⬇️ Download .docx` — hidden until MOM is built
- Shown in `momConfirmAndBuild()` alongside download button
- `momCopyToClipboard()` — copies `MOM_STATE.result` text using `navigator.clipboard` with `execCommand` fallback; button label flashes `✅ Copied!` for 1.8s

### Inline editing in review panel

Each item text span in `momRenderReviewPanel()` is now `contenteditable="true"`:
- Click to focus → orange underline appears
- Type to edit
- Press Enter or click away → `momSaveItemEdit(bucket, idx, this.textContent)` saves to `MOM_STATE.extracted.reviewItems[bucket][idx].text` without re-rendering (preserves focus)

### Manual add items per bucket

Each bucket section in the review panel now has an add row below the items:
- `<input>` with "Add item…" placeholder + `+` button colored per bucket
- Press Enter or click `+` → `momAddManualItem(bucket)` pushes `{text, conf:3, label:'HIGH', source:'✍️ Manual'}` and re-renders the panel

**New functions:** `momSaveItemEdit(bucket,idx,text)`, `momAddManualItem(bucket)`, `momCopyToClipboard()`

---

## Section 18 — Weekly Implementation Meeting Report ✅ Coded (June 7, 2026)

### What was added
The **Weekly Status** page now opens with a **Weekly Implementation Meeting Report** table — matching the format used in the team's weekly sync (screenshot 32 from the 06.05.2026 folder). This is the first panel shown, above the existing monthly breakdown.

### Table layout
- **Columns:** Data (label) + one column per implementer (from `TEAM_CONFIG.implementers`, dynamically populated)
- **Row header style:** Yellow background (`#fef08a`), matching the spreadsheet
- **Section dividers:** Gray (`#f1f5f9`) spanning all columns — Starter, PYO, For Turnover, Gov, BenAd, Disbursement, OTK
- **Values:** Auto-calculated from live `D` + `CL_ADDONS` data; green if > 0, gray dash if 0

### Row definitions (all auto-calculated)

| Section | Row | Logic |
|---|---|---|
| Starter | On going implem | service contains "Payroll Starter" AND status = Ongoing |
| Starter | Not yet started / On Hold | service Starter AND (status = Not yet started OR On-Hold) |
| Starter | # of accounts you process | service Starter AND **Live Run ticked** (`d.live===1`) AND Turned Over NOT ticked |
| Starter | Need to turnover – still unassigned | service Starter AND Live AND turnedOver NOT ticked AND no CSM assigned |
| PYO | on going Implem | service contains "PYO" AND status = Ongoing |
| PYO | not yet started / on hold | service PYO AND (Not yet started OR On-Hold) |
| PYO | # of accounts you process | service PYO AND **Live Run ticked** (`d.live===1`) AND Turned Over NOT ticked |
| PYO | Need to turnover – still unassigned | service PYO AND Live AND turnedOver NOT ticked AND no CSM assigned |
| For Turnover | Assigned PYO | service PYO AND status = **Live** AND turnedOver NOT ticked |
| For Turnover | Assigned Starter | service Starter AND status = **Live** AND turnedOver NOT ticked |
| Gov | with PYO under Implem | isPYO AND CL_ADDONS.sg=1 AND active |
| Gov | stand alone | service = "Sprout Gov" (no PYO) AND active |
| BenAd | Under Implem | CL_ADDONS.ba=1 AND active |
| Disbursement | Under Implem | CL_ADDONS.sd OR std =1 AND active |
| OTK | Under Implem | CL_ADDONS.otk=1 AND active |
| OTK | Under Live | CL_ADDONS.otk=1 AND status = Live |

### Turnover removal rule
Once a client's **Turned Over** checkbox (in After Hand Over tab) is ticked → `CL_AFTERHO[no].turnedOver = 1` → that client disappears from **# of accounts you process**, **For Turnover**, and **Need to turnover** rows entirely. The **# of accounts you process** rows count clients where the Live Run phase checkbox is ticked (`d.live===1`) AND Turned Over is not yet ticked.

### Issue List section
Below the main table, an **Issue List** is rendered using `CL_ISSUES`:
- Columns: #, Summary (with client name sub-line), Raised By, Status (Open/Resolved badge), Remarks (resolution notes)
- If no issues exist, 5 empty numbered rows are shown (matching spreadsheet blank rows)
- An "Open Issue Log →" link navigates to the Issues page

### Code changes
- `renderWeekly()` fully rewritten — meeting report table prepended before snap cards
- Implementer columns (for admin/manager) now derived from **distinct `resource` values in `D`** — sorted alphabetically, only implementers who actually have clients assigned appear as columns (June 8, 2026)
- Implementer role: `rl` is always `[IMPL_USER]` (single column, their own name)
- Fallback chain: real data → `TEAM_CONFIG.implementers` → `['Ana','Bea','Carl','Dana','Eli']`

---

## Section 20 — Weekly Status 3-Tab Layout + Monthly Stats Separate Page ✅ Coded (June 7, 2026)

### What was added
The **Weekly Status** page was redesigned into a **3-tab layout**. Monthly Stats was moved out to its own sidebar nav item and page. Tabs replace the previous single-scroll layout.

### Weekly Status tabs

| Tab | Label | Contents |
|---|---|---|
| `report` | Weekly Report | Weekly meeting table (collapsible sections) + Issue List — **default tab** |
| `resource` | By Resource | Per-implementer status breakdown (chips + colored status badges) |
| `dates` | Key Dates | Upcoming KOM / Live Run / Hand Over — **timeline grouped by time proximity** |

### Key Dates tab redesign
Events are grouped into three time buckets (not a grid of cards):
- **This Week** — events ≤ 7 days away
- **Next 2 Weeks** — events 8–21 days away
- **Later** — events > 21 days (capped at 10)

Each event row shows:
- Colored left border + type badge (KOM / LR / HO)
- Formatted day/date (e.g. "Mon, Jun 9")
- Client name (truncated)
- Days-until pill (Today / Tomorrow / "in Nd")
- Resource chip

### Collapsible sections in Weekly Report tab
- Each section header row (Starter, PYO, For Turnover, Gov, BenAd, Disbursement, OTK) is clickable
- Click toggles `WK_COLLAPSED[lbl]` — when `true`, that section's data rows are hidden
- A ▶/▼ chevron indicates collapsed/expanded state

### Monthly Stats — separate peer nav item
- Sidebar nav item **Monthly Stats** is a **peer item** of Weekly Status — same padding, same font size, same icon size (14×14px)
- **Not** a sub-item (no indentation). Both Weekly Status and Monthly Stats are top-level nav entries.
- It is a **completely separate page** — not a tab inside Weekly Status
- Visible to: manager, admin, implementer, god mode (all roles)
- Implementer sees only their own clients' data (filtered by `IMPL_USER`)
- Routes to `page-monthly` via `go('monthly')` → calls `renderMonthlyStats()`
- Content: **summary table** — one row per month, columns for Total + each status + Avg % (June 8, 2026 redesign)
  - Only status columns with at least one client are shown (no empty columns)
  - Color-coded counts: green for Live, blue for Ongoing, orange for Not Started, etc. Dashes for zero.
  - Avg % column color: green ≥75%, blue ≥40%, gray otherwise
  - Totals footer row at the bottom — replaces the old snap cards
  - Hover highlight on rows for readability
  - Previous layout (snap cards + variable-width colored card grid per month) was removed — it was hard to compare months because card count and width changed per row

### State variables added
```javascript
var WK_TAB = 'report';      // active tab id
var WK_COLLAPSED = {};       // { [sectionLabel]: boolean }
```

### Helper functions added
```javascript
function wkTab(t) { WK_TAB = t; renderWeekly(); }
function wkToggleSection(lbl) { WK_COLLAPSED[lbl] = !WK_COLLAPSED[lbl]; renderWeekly(); }
function renderMonthlyStats() { ... }   // renders into #monthly-out
```

### Code changes
- `WK_TAB` and `WK_COLLAPSED` state variables declared before `renderWeekly()`
- `wkTab()`, `wkToggleSection()`, `renderMonthlyStats()` added
- `renderWeekly()` rewritten: 3-tab bar + conditional tab content
- `ROLE_CONFIG`: `implementer.hideNav` no longer includes `'weekly'` or `'monthly'`
- `go()`, `startApp()`, `godSwitch()` nav loops updated to include `'monthly'`
- `page-monthly` div added to HTML after `page-weekly`
- `nav-monthly` nav item added below `nav-weekly` in sidebar as a peer (not sub-item)

### Implementer data scoping (June 8, 2026)
Both `renderWeekly()` and `renderMonthlyStats()` now filter data to the implementer's own projects when `CURRENT_ROLE === 'implementer'`:
- `myD` = `D.filter(resource === IMPL_USER)` used throughout both functions
- Weekly Report table: `rl` (resource column list) restricted to `[IMPL_USER]` — shows only their column
- Key Dates tab: uses `myD` instead of all `D`
- Issue List in report tab: filters `CL_ISSUES` to only issues belonging to the implementer's clients
- By Resource tab: shows only the implementer's own row (since `rl = [IMPL_USER]`)
- Monthly Stats: snap cards and monthly breakdown scoped to implementer's clients only

---

## Section 24 — Gov Resource Column in Overview Tab ✅ Coded (June 7, 2026)

A "Gov Resource" column was added after the "Resource" column in the All Clients Overview tab. It shows an editable text input for the assigned Gov Implementer only when the client has gov-related services or addons; otherwise it displays "—".

### Trigger conditions (cell is editable when ANY of these are true)
- `d.service` contains "gov" (case-insensitive) — e.g. "Gov", "PYO +HR +Gov"
- `CL_ADDONS[d.no].sg` is truthy (S.Gov addon ticked)
- `CL_ADDONS[d.no].ba` is truthy (Benefits Admin addon ticked)
- `CL_ADDONS[d.no].std` is truthy (Statutory Disbursement addon ticked)

### Data model
- New field `d.gov` (string) stored on each client record in `D[]`
- `clUpdateGov(no, val)` — saves `d.gov` and calls `autoSave()`
- `supabaseSave()` includes `gov: d.gov||''` in the clients upsert row
- `loadFromSupabase()` maps `r.gov||''` to `d.gov`
- **Supabase `clients` table**: add `gov text` column

---

## Section 23 — Team Configuration: Unlimited Slots + 4 Implementer Categories ✅ Coded (June 7, 2026)

The Team Configuration panel in Settings was redesigned from fixed 5-slot grids to a fully dynamic add/remove list with no upper limit, split into four implementer categories.

### Four implementer categories
| Category | `TEAM_CONFIG` key | List container ID | Row input class |
|---|---|---|---|
| PYO / PY Starter | `implPYO` | `#st-pyo-list` | `.tc-pyo-inp` |
| Gov Implementer | `implGov` | `#st-gov-list` | `.tc-gov-inp` |
| HRI / SI Implementer | `implHR` | `#st-hr-list` | `.tc-hr-inp` |
| OTK Resource | `implOTK` | `#st-otk-list` | `.tc-otk-inp` |
| Project Managers | `pms` | `#st-pm-list` | `.tc-pm-inp` |

`TEAM_CONFIG.implementers` is rebuilt as `implPYO.concat(implGov).concat(implHR).concat(implOTK)` whenever saved or loaded.

### TEAM_CONFIG default
```javascript
var TEAM_CONFIG = {
  implPYO: ['Ana','Bea','Carl','Dana','Eli'],
  implGov: [],
  implHR:  [],
  implOTK: [],
  implementers: ['Ana','Bea','Carl','Dana','Eli'],
  pms: ['Marcus','Sofia','Javier','Isabel','Diego']
};
```

### Lookup maps
```javascript
var TC_MAP={pyo:'implPYO',gov:'implGov',hr:'implHR',otk:'implOTK',pm:'pms'};
var TC_LIST_ID={pyo:'st-pyo-list',gov:'st-gov-list',hr:'st-hr-list',otk:'st-otk-list',pm:'st-pm-list'};
```

### Functions
| Function | Purpose |
|---|---|
| `tcRenderTeam()` | Iterates `['pyo','gov','hr','otk','pm']`, renders each list |
| `tcAddRow(type)` | Pushes empty string to `TEAM_CONFIG[TC_MAP[type]]`, re-renders, focuses |
| `tcRemoveRow(type, idx)` | Splices from `TEAM_CONFIG[TC_MAP[type]]`, re-renders |
| `stSaveTeam()` | Collects each input class, saves arrays, rebuilds `implementers`, saves to Supabase |

### Supabase `team_config` table columns required
Add these columns to the `team_config` table (type: `text[]` / jsonb array):
- `impl_pyo` — PYO / PY Starter names
- `impl_gov` — Gov Implementer names
- `impl_hr` — HRI / SI Implementer names
- `impl_otk` — OTK Resource names
- `pms` — Project manager names (existing)

`loadFromSupabase()` reads all four `impl_*` columns and rebuilds `TEAM_CONFIG.implementers`.

---

## Section 22 — Remove User Management from Settings ✅ Coded (June 7, 2026)

The local User Management panel has been removed from Settings for all roles. All users now log in exclusively via Google Work Email (Supabase OAuth). User access is managed directly in the Supabase `user_roles` table.

### What was removed
- `st-panel-users` HTML panel (user table + Add New User form + Save to file button)
- `document.getElementById('st-panel-users')` visibility line from `renderSettings()`
- `if(isAdmin) stRenderUsers()` call from `renderSettings()`
- `stRenderUsers()`, `stAddUser()`, `stDeleteUser()` functions

### Where users are now managed
All user access is controlled via the `user_roles` table in Supabase:

| Column | Purpose |
|---|---|
| `email` | Google Workspace email — must match exactly |
| `role` | `implementer`, `admin`, or `manager` |
| `implementer_name` | Display name used in the app (required for implementers; set for dual-role users like Zona) |

---

## Section 19 — After Hand Over: "Turned Over" Column ✅ Coded (June 7, 2026)

### What was added
A **Turned Over** checkbox column was added to the **After Hand Over** tab, inserted between **Post Live** and **Remarks** (per screenshot 33).

### Column details
- **Type:** Checkbox — same visual style as Post Live (`cl-cb` / `chk` classes, green checkmark SVG)
- **Storage:** `CL_AFTERHO[no].turnedOver` — saved to `pyo_afterho` in localStorage via `autoSave()`
- **Toggle:** `ahToggleCb(no, field, curVal)` — flips 0↔1 and calls `renderClients()`
- **Render helper:** `ahCheckbox(no, field, val)` — returns the ph-cell/cl-cb markup reusing existing checkbox CSS

### Files changed
| Location | Change |
|---|---|
| Static HTML header (line ~1353) | Added `<th class="cth">Turned Over</th>` between Post Live and Remarks |
| `renderClients()` afterho branch | Added `ahCheckbox(d.no,'turnedOver',a.turnedOver)` cell between Post Live and Remarks cells |
| After `ahUpdateField()` | Added `ahCheckbox()` and `ahToggleCb()` functions |
| Excel export `ahHeaders` | Added `'Turned Over'` column; exports `'Done'` or `''` |

---

## Section 21 — Role-Based Edit Permissions for All Clients Tab ✅ Coded (June 7, 2026)

### Permission matrix

| Tab | Admin | Manager | Implementer |
|---|---|---|---|
| Overview | read-only | **fully read-only** | edit |
| Implementation Phases | read-only (no Edit button) | read-only (no Edit button) | edit |
| Add On Services | **edit** | read-only | edit |
| Milestone Dates — dates | read-only | read-only | edit |
| Milestone Dates — Month Completed | read-only | read-only | edit |
| Milestone Dates — Billing Month | **edit** (only this field) | read-only | edit |
| After Hand Over | read-only | read-only | edit |

### Changes

**`TAB_EDITABLE`** — controls which tabs show the Edit button:
- Manager: `[]` → fully read-only, Edit button hidden on all tabs
- Admin: `['addons']` → Edit button only on Add On Services
- Implementer: `['phases','addons','milestones']` (unchanged)

**Overview tab — Manager is fully read-only** (`ovRO = CURRENT_ROLE === 'manager'`):
- Month: static `<span>` instead of `<select>`
- Gov Resource: static `<span>` (or "—") instead of `<input>`
- PM: static `<span>` instead of `<input>`
- HR-I: static `<span>` instead of `<input>`
- Status: static `<span>` instead of `<select>`
- Service chips: static display (no `onclick` or edit `<select>`)
- Days: read-only plain text (editable only for admin/god — fixed wrong condition that previously allowed manager to edit)
- Delete ✕ button: hidden (empty cell)
- Add Client / Import buttons: hidden for manager

**Milestones tab** — `mDateCell()` and `mMonthCell()` now check `CURRENT_ROLE`:
- `mlCanEditDates` = `true` only for implementer/god
- `mDateCell`: renders static text for admin/manager (no click-to-edit)
- `mMonthCell`: renders `<select>` only when `mlCanEditDates` OR (`CURRENT_ROLE === 'admin'` AND `field === 'billingMonth'`); otherwise static text

**After Hand Over tab** — `ahCanEdit` = `true` only for implementer/god:
- `ahInp()`: renders plain text for non-editable roles
- Post Live checkbox: renders `ahReadCb()` (static, `cursor:default`) for non-editable roles
- Turned Over checkbox: renders `ahReadCb()` for non-editable roles

**Milestone column order** — moved "Month Completed" before "Billing Month" (both in static header `<th>` and in `mMonthCell` render order)

### God mode role switcher — implementer view
When `_IS_GOD` switches to implementer role via `godSwitch('implementer')`:
- `IMPL_USER` is set to `CURRENT_NAME` (the god user's own name from Supabase `implementer_name`) so they see their own assigned projects
- Falls back to `TEAM_CONFIG.implementers[0]` only if `CURRENT_NAME` is empty
- **Bug fix (June 8, 2026):** Previous code used `TEAM_CONFIG.implementers[0]` first, which showed Ana's (empty) projects instead of Leslee's own projects

---

## Section 18b — Administration Tool Sample Templates ✅ Coded (June 7, 2026)

All administration tools that require file uploads now show a **"Download sample template"** button so users always know exactly what format to upload.

### Tools updated

| Tool | Upload(s) | Sample button |
|---|---|---|
| MOM Generator | Transcript (.docx) | "📥 Download sample transcript (.docx)" — generates a real `.docx` meeting transcript template |
| Masterfile Creator | Source file + Output template | "📥 Sample source file (.xlsx)" + "📥 Sample output template (.xlsx)" |
| CRF Generator | Impl. Monitoring (.xlsx) | "📥 Download sample template" — in the upload zone |
| Payroll Account Creator | Impl. Monitoring (.xlsx) | "📥 Download sample template" — in the upload zone |
| Simulation Variance Analysis | Client CSV + Sprout CSV | "📥 Download sample client CSV" + "📥 Download sample Sprout CSV" — row below cards |

### Shared helper functions (added before MASTERFILE CREATOR block)

| Function | What it generates |
|---|---|
| `adminDownloadSampleTranscript()` | A `.docx` meeting transcript template (participants, dialogue, action items) using the docx.js library |
| `adminDownloadSampleImplemenMonitoring()` | An `.xlsx` file with a `2026 Implem` sheet and all required columns for CRF + PAC |
| `adminDownloadSampleSourceFile()` | An `.xlsx` Sprout HR bulk upload file with typical employee data columns |
| `adminDownloadSampleOutputTemplate()` | An `.xlsx` PayrollPie template using `MF_COLUMNS` as headers |
| `adminDownloadSamplePayrollCSV(type)` | A `.csv` payroll register — pass `'client'` or `'sprout'` for matching column naming |

### UI placement rules
- **Info banner tools** (MOM, Masterfile): buttons added as a sub-row inside the info banner `<div>`, styled to match banner accent color
- **Upload zone tools** (CRF, PAC): button inserted inside the zone `<div>` with `event.stopPropagation()` so clicking it doesn't also trigger the file picker
- **Card grid tools** (VA): a second grid row added below the card grid with matching column widths and accent colors per card

---

## Section 25 — Implementation Vault ✅ Coded (June 8, 2026)

Central reference bank for all implementation files and links.

### Nav location
- Sidebar nav item `nav-vault` → `page-vault`, under a new **Resources** group between Clients and System
- Visible to all roles (no `hideNav` exclusion)
- Lock icon (SVG) used for the nav item

### Permissions
| Action | Admin | Manager | Implementer |
|---|---|---|---|
| View all entries | ✅ | ✅ | ✅ |
| Add entries | ✅ | ✗ | ✅ |
| Delete any entry | ✅ | ✗ | ✗ |
| Delete own entry | ✅ | ✗ | ✅ (own only) |

### Data structure
Stored in `localStorage` key `pyo_vault` as `VAULT_ITEMS` array:
```javascript
{
  id,          // 'v_' + Date.now()
  name,        // display name
  category,    // 'Proposals' | 'MOMs' | 'Decks' | 'Payroll Policy' | 'Templates' | 'Other'
  type,        // 'link' | 'file'
  url,         // for link type
  fileName,    // for file type
  fileData,    // base64 data URL for file type
  fileType,    // MIME type for file type
  notes,       // optional description
  uploadedBy,  // CURRENT_NAME at time of save
  uploadedAt,  // MM/DD/YYYY
}
```

### Categories and colors
| Category | Color | Background |
|---|---|---|
| Proposals | Blueberry `#1679FA` | `#EEF7FF` |
| MOMs | Green Apple `#239A0D` | `#E9FAE5` |
| Decks | Ubas `#8139EE` | `#F5F3FF` |
| Payroll Policy | Carrot `#FF7F00` | `#FFFAEC` |
| Templates | Teal `#0891b2` | `#ecfeff` |
| Other | Slate `#64748b` | `#f1f5f9` |

### UI layout
- **Filter pills** — All · Proposals · MOMs · Decks · Payroll Policy · Templates · Other
- **Add File button** — visible to admin/implementer; hidden for manager
- **Add form** (inline panel, shown on click): Name, Category, Type toggle (Link/Upload), URL or file picker, Notes
- **Card grid** — `auto-fill` responsive grid, min 280px per card
- Each card: category icon + name, category badge, notes, uploader + date + type meta, Open/Download + Delete buttons

### Key functions
| Function | Purpose |
|---|---|
| `renderVault()` | Renders filter pills state + card grid |
| `vaultShowForm()` / `vaultHideForm()` | Toggle add form |
| `vaultTypeToggle()` | Swaps between URL input and file picker |
| `vaultSaveItem()` | Validates + saves new entry (uses FileReader for file uploads) |
| `vaultDelete(id)` | Deletes entry after confirm — checks role/ownership |
| `vaultFilter(cat, btn)` | Filters displayed cards by category |
| `vaultOpenFile(id)` | Triggers download for uploaded file entries |

### Supabase integration ✅ Coded (June 20, 2026)

Vault items are now synced to Supabase so all users see the same shared vault in real time.

**`vault_items` table** (run in Supabase SQL Editor):
```sql
CREATE TABLE IF NOT EXISTS vault_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  client_name TEXT,
  type TEXT NOT NULL,
  url TEXT,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  notes TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT
);
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vault_read" ON vault_items FOR SELECT USING (auth.role()='authenticated');
CREATE POLICY "vault_insert" ON vault_items FOR INSERT WITH CHECK (auth.role()='authenticated');
CREATE POLICY "vault_update" ON vault_items FOR UPDATE USING (auth.role()='authenticated');
CREATE POLICY "vault_delete" ON vault_items FOR DELETE USING (auth.role()='authenticated');
```

**`vault-files` Storage bucket** (Supabase Dashboard → Storage → New bucket):
- Name: `vault-files`
- Public: No (private — signed URLs used for downloads)
- Add policies: allow authenticated INSERT, SELECT, DELETE

**Architecture:**
- Link items: immediately upserted to `vault_items` on save
- File items: base64 saved to localStorage first (instant), then uploaded to `vault-files` Storage, then upserted to `vault_items` with `file_path` set
- On login: `loadFromSupabase()` fetches all `vault_items` and merges with localStorage (preserving local `fileData` for offline file access)
- Delete: removes from localStorage + deletes from Supabase table + removes from Storage bucket

**New/updated functions:**
| Function | Purpose |
|---|---|
| `_vaultSupaUpsert(item)` | Async — upserts one vault item to `vault_items` table |
| `_vaultSupaDelete(id, filePath)` | Async — deletes from `vault_items` table + removes file from `vault-files` Storage |
| `vaultOpenFile(id)` | Updated — tries signed Storage URL first; falls back to local base64 |
| `vaultSaveItem()` | Updated — calls `_vaultSupaUpsert` after localStorage save; file uploads go to Storage |
| `vaultDelete(id)` | Updated — calls `_vaultSupaDelete` after localStorage delete |
| `loadFromSupabase()` | Updated — fetches `vault_items` and merges with VAULT_ITEMS |

### Category filter — sidebar sub-navigation ✅ Coded (June 19, 2026)
Filter pills removed from `page-vault`. Categories are now an indented sub-panel under **Implementation Vault** in the sidebar, matching the Clients dropdown pattern.

| Sub-item | ID | Dot color |
|---|---|---|
| Proposals | `nav-vault-proposals` | `#1679FA` |
| MOMs | `nav-vault-moms` | `#239A0D` |
| Decks | `nav-vault-decks` | `#8139EE` |
| Payroll Policy | `nav-vault-policy` | `#FF7F00` |
| Templates | `nav-vault-templates` | `#0891b2` |
| Other | `nav-vault-other` | `#64748b` |

**New functions:** `toggleVaultSection()`, `goVault(cat)`, `vaultSyncNav()`
**`renderVault()`**: calls `vaultSyncNav()` on every render; updates `#vault-cat-label` with active category name
**Main content**: filter pills replaced with `#vault-cat-label` (bold category name) + `#vault-count`

---

## 22. Settings — Upload Project Timeline ✅ Coded (June 19, 2026)

### What was added
A new **"Upload Project Timeline"** panel (`id="st-panel-timeline"`) in the Settings page allows Admin and Implementer users to upload one or more Sprout project timeline Excel files (.xlsx) and automatically populate implementation phase dates for matching clients.

### Panel location
Inserted just before the GitHub Auto-Commit panel in Settings.

### File format supported
The standard Sprout PYO project timeline Excel file:
- **Filename pattern:** `[Client Name] - Project Timeline.xlsx`
- **Sheet:** First sheet (any name — e.g. `60 HR and PYO_V1`)
- **Column layout:**
  - Column A (index 0): Phase headers (e.g. `PHASE 1: KICK OFF MEETING`)
  - Column B (index 1): Sub-task names
  - Column E (index 4): Target Start Date (MM/DD/YYYY)
  - Column F (index 5): Target End Date

### Date extraction logic
The parser (`tlParseFile`) scans all rows and detects phase headers by keyword matching in Column A:

| Phase keyword | Target date field |
|---|---|
| `PHASE 1` or `KICK OFF` | `komDate` — first sub-task with a Target Start Date |
| `PHASE 3` or `SIMULATION` | `simDate` — **last** sub-task with a Target Start Date (e.g. "Payroll Discussion") |
| `PHASE 5` or `PROJECT REVIEW` | `checklistDate` (Payroll Starter only) — last sub-task with a Target Start Date (e.g. "Sprout Payroll Outsourcing Project Review Checklist") |
| `PHASE 6` or `PARALLEL RUN` | `parDate` (PYO only) — **last** sub-task with a Target Start Date (e.g. "Variance Analysis Discussion"). For PS timelines Phase 6 is "Implementation Sign Off" — caught by the SIGN OFF rule below. |
| `PHASE 7` or `SIGN OFF` | `handOver` — "Project Handover" task, or first task with a date |

### Client matching
1. Strip ` - Project Timeline[...].xlsx` from the filename → candidate client name
2. Exact match against `D[].client` (case-insensitive)
3. Fallback: substring match (either name contains the other)

### UX flow
1. User clicks **Choose File(s)** — supports `multiple` selection
2. Files are read and parsed client-side (no server)
3. Preview table shows: Extracted Client Name | Matched To | KOM | Simulation | Parallel Run | Hand Over
4. Unmatched files shown in orange, errors in red
5. **"Apply dates to N client(s)"** button confirms changes
6. On confirm: dates written to matching D[] records, `logAudit()` called, `autoSave()` + `_supaFlush()` fired

### Visibility
- Shown for **Admin** and **Implementer** roles; hidden for Manager
- Controlled in `renderSettings()` alongside other panel visibility rules

### New JS functions
| Function | Purpose |
|---|---|
| `tlHandleFiles(e)` | File input handler — reads all selected files with FileReader |
| `tlParseFile(binaryStr, filename)` | Parses one xlsx, extracts dates + matches client |
| `tlShowPreview()` | Renders preview table + confirm button |
| `tlConfirm()` | Applies extracted dates to D[], logs audit, saves |

### Uses existing infrastructure
- `XLSX.read()` / `XLSX.utils.sheet_to_json()` — SheetJS already loaded
- `parseImportDate()` — existing date normalizer (handles MM/DD/YYYY, YYYY-MM-DD, Excel serials)
- `logAudit()`, `autoSave()`, `_supaFlush()` — standard save pipeline

---

## 23. Project Timeline — Last Task Date Extraction ✅ Coded (June 19, 2026)

### What changed
`tlParseFile` was updated so that **Simulation** and **Parallel Run** dates are taken from the **last** sub-task in the phase (not the first). This ensures the date reflects the final activity (e.g. "Payroll Discussion" for Simulation, "Variance Analysis Discussion" for Parallel Run) rather than the kickoff task.

### Before
```js
else if(phase==='sim'&&!filled.sim){dates.simDate=d;filled.sim=true;}
else if(phase==='par'&&!filled.par){dates.parDate=d;filled.par=true;}
```

### After
```js
else if(phase==='sim'){dates.simDate=d;}   // always overwrite → last task wins
else if(phase==='par'){dates.parDate=d;}   // always overwrite → last task wins
```

KOM and Hand Over continue to use the **first** task (first KOM task, first Sign Off task).

---

## 24. Payroll Starter — Project Checklist Phase ✅ Coded (June 19, 2026)

### What was added
Payroll Starter clients have a different implementation flow than PYO. After Simulation, PS clients do a **Project Checklist** (not a Parallel Run). A new phase was introduced for PS clients throughout the app.

### New field: `checklist` and `checklistDate`
| Field | Type | Description |
|---|---|---|
| `checklist` | int (0/1) | Project Checklist phase checkbox — PS only |
| `checklistDate` | string (MM/DD/YYYY) | Project Checklist date — PS only |

These are persisted in `D[]` alongside existing phase fields, included in all save/load paths.

### Implementation Phases tab changes
When `CL_TYPE === 'ps'`:
- **Parallel Run column** (`ph-th-par`) → `display:none`
- **Project Checklist column** (`ph-th-checklist`) → shown (normally `display:none`)
- Phase sequence: `['kom','sim','checklist','live']`
- Row rendering: `phCell('checklist', d.checklist||0, d.checklistDate||'')` replaces `phCell('par', ...)`

### Project Timeline parser (`tlParseFile`) — PS mapping
Phase 5 (`PROJECT REVIEW`) → `checklistDate` (PS only — guarded by `isPS` flag)

### Needs Attention — PS-aware alerts
All alert rules in `implRenderAttention` were made service-aware via `var isPS = d.service === 'Payroll Starter'`:
- Completion check: PS uses `kom+sim+checklist+live+post`; PYO uses `kom+sim+par+live+post`
- Priority 2 overdue alert: PS → "Project Checklist not started"; PYO → "Parallel Run not started"
- Priority 6 nudge: PS → "Project Checklist not yet scheduled"; PYO → "Parallel Run not yet scheduled"
- PS clients are **never** flagged for missing Parallel Run

### Supabase SQL required
```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS checklist INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS checklist_date TEXT DEFAULT '';
```

---

## 25. Pending Items Bank — Redesign ✅ Coded (June 19, 2026)

### Problem with old design
The old UI had two tabs ("Manage Library" / "Client Items") that were confusing — it wasn't obvious how to go from a library template to a specific client's checklist.

### New three-view single-page layout

**View 1 — Main** (default): Client dropdown + per-client checklist
- Client dropdown shows only the implementer's own clients (admin/manager see all)
- Each option shows `ClientName (done/total)` count
- Progress bar + "X / Y done" counter
- Items grouped by phase with colored dot headers
- Done items collapsed under "✓ Completed" section (strikethrough + 45% opacity)
- Two action buttons: **+ Add from Library** → Picker view | **+ Custom Item** → inline form with phase selector

**View 2 — Picker**: Select library items to add to current client
- All library templates grouped by phase
- Already-assigned items greyed out + pre-checked (disabled)
- "Add Selected" applies; "Cancel" returns

**View 3 — Library**: Manage the master template list
- All templates grouped by phase + delete buttons
- "Add to library" form: label + phase + category
- "← Back" returns to main (preserves selected client)

### State variables
```js
var PIB_VIEW = 'main';    // 'main' | 'picker' | 'library'
var PIB_CLIENT = 0;       // selected client no
var PIB_PHASES = ['kom','sim','par','checklist','live','general'];
var PIB_PHASE_LBL = {kom:'KOM', sim:'Simulation', par:'Parallel Run', checklist:'Project Checklist', live:'Live Run', general:'General'};
var PIB_PHASE_CLR = {kom:'#2563eb', sim:'#7c3aed', par:'#ea580c', checklist:'#0e7490', live:'#16a34a', general:'#64748b'};
```

### Data migration
Old phase keys (`'1'`,`'2'`,`'3'`,`'4'`,`'Common'`) are migrated to new names on load:
```js
var OLD_PIB_MAP = {'1':'kom','2':'sim','3':'par','4':'live','Common':'general'};
```

---

## 26. Implementer Dashboard — Pending Items Reminder Panel ✅ Coded (June 19, 2026)

### What was added
A collapsible **Pending Items** panel in the left column of the Implementer Dashboard, between Needs Attention and My Projects. It surfaces unresolved CLIENT_PENDING items for the implementer's own clients so they are not forgotten.

### Panel visibility
- Hidden (`display:none`) when there are no unresolved items for the implementer's clients
- Shown automatically when any unresolved items exist
- Amber badge in the header shows total unresolved count

### Content
- Items grouped by client name
- Each item shows: checkbox (check off directly), label text, phase tag (e.g. "Simulation")
- Checking an item calls `dashPendingToggle(clientNo, idx, checked)` → updates `CLIENT_PENDING` + re-renders panel
- "Manage in Pending Items Bank →" link opens the full Pending Items Bank tool (`openTool('pending-bank')`)

### HTML panel
```html
<div class="impl-followup-panel impl-cpanel" id="cpanel-pending" style="display:none;">
  <div class="impl-followup-hdr" onclick="toggleCPanel('pending')">
    <div class="impl-followup-title">
      <svg><!-- chat bubble icon --></svg>
      Follow up with the client
      <span id="impl-pending-badge" ...white pill style...></span>
    </div>
    <svg class="impl-chev" style="stroke:#fff;" ...></svg>
  </div>
  <div class="impl-cpanel-body" id="cpbody-pending"></div>
</div>
```

### CSS — amber follow-up panel (mirrors Needs Attention)
```css
@keyframes followup-pulse { /* amber glow pulse */ }
.impl-followup-panel   { border:1.5px solid #FDE68A; box-shadow: amber glow; }
.impl-followup-panel.has-items { border-color:#f59e0b; animation:followup-pulse 2.4s infinite; }
.impl-followup-hdr     { background: linear-gradient(135deg,#d97706,#b45309); padding:.85rem 1rem; }
.impl-followup-title   { font-size:11px; font-weight:700; color:#fff; uppercase; }
```

`renderPendingPanel` adds `.has-items` class when items exist (drives pulse), removes it when none.

### New JS functions
| Function | Purpose |
|---|---|
| `renderPendingPanel(myD)` | Shows/hides panel, renders grouped checklist per client |
| `dashPendingToggle(clientNo, idx, done)` | Checks/unchecks an item inline from the dashboard |
| `openPendingBank()` | Opens Pending Items Bank tool via `openTool('pending-bank')` |

### Wiring in `renderImpl()`
```js
implRenderAttention(myD);
renderPendingPanel(myD);   // ← added
implRenderProjects();
```

---

## 27. Implementer Dashboard — Clean Sign-In State ✅ Coded (June 19, 2026)

### What changed
`cpanel-project` (Selected Project panel) now has `style="display:none;"` in the HTML itself, not only hidden by `renderImpl()`. This prevents a brief flash where the empty panel was visible before JavaScript ran.

### Sign-in layout (canonical) — screenshot 26
On every sign-in (and when clicking Avg Progress), the dashboard shows exactly these panels and nothing else:

| Column | Panel | Condition |
|---|---|---|
| Left | Needs Attention | Always visible |
| Left | Pending Items | Only if unresolved items exist for this implementer's clients |
| Right | Project Status by Module | Always visible, expanded |

`cpanel-projects` (My Projects) and `impl-drill-placeholder` are **hidden** in default mode.

### KPI drill mode — clicking any KPI except Avg Progress
| Column | Panel |
|---|---|
| Left | My Projects (with filter pre-set to clicked KPI, e.g. Live / Ongoing) |
| Right | "Select a client" placeholder → replaced by Selected Project on row click |
| Left | Needs Attention — **hidden** in drill mode |
| Right | Project Status by Module — **hidden** in drill mode |

### Show/hide triggers
| Trigger | Action |
|---|---|
| `renderImpl()` | Calls `implSetMode('default')` — shows Needs Attention + Follow-up + Project Status, hides My Projects + placeholder |
| `implKpiClick('overview')` (Avg Progress) | `implSetMode('default')` — same as sign-in |
| `implKpiClick(filter)` (My Projects / Live / Ongoing / Not Started / Churned) | `implSetMode('drill')` + `implRenderProjects()` — shows filtered project list, **hides** Follow-up panel |
| `selProject(no)` | Hides placeholder, shows Selected Project detail panel |
| `implKpiBack()` | `implSetMode('default')` — returns to sign-in state, re-runs `renderPendingPanel` to restore Follow-up panel |

### Drill mode — Follow-up panel excluded
`implSetMode('drill')` explicitly hides `cpanel-pending`. On return to default, `implSetMode('default')` calls `renderPendingPanel(myD)` to restore it only if unresolved items exist.

### Selected Project detail — PS-aware phases
`selProject()` now checks `d.service === 'Payroll Starter'` and shows:
- **PYO**: KOM · Simulation · Parallel Run · Live Run
- **PS**: KOM · Simulation · Project Checklist · Live Run

### Code changes
- `renderImpl()` ending replaced: removed `implRenderProjects()` + manual display manipulation; now calls `implSetMode('default')` + resets `SELECTED_PROJECT=null`
- `implSetMode('drill')`: added `if(pend)pend.style.display='none'`
- `implSetMode('default')`: added `renderPendingPanel(myD)` call to restore Follow-up panel
- `selProject()`: phases array now branches on `isPS`
- `cpanel-projects` HTML: added `style="display:none;"` to prevent pre-JS flash
- `cpanel-project` HTML: added `style="display:none;"` to prevent pre-JS flash

---

## 29. Implementation Vault — MOMs Gmail Auto-Sync ✅ Coded (June 19, 2026)

### Overview
MOMs are synced automatically from Gmail to Supabase via a Google Apps Script. No copy-pasting required. Once set up, labeling any email `MOM` in Gmail is the only manual step needed.

### Architecture
```
Gmail (label: MOM) → Google Apps Script (every 30 min) → Supabase impl_moms → App vault
```

### Supabase table: `impl_moms`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | Gmail message ID — deduplication key |
| `subject` | TEXT | Email subject |
| `sender` | TEXT | Full From: header |
| `sent_date` | TEXT | M/D/YYYY |
| `body_text` | TEXT | Plain text body, capped at 8000 chars |
| `client_name` | TEXT | Auto-extracted from subject |
| `synced_at` | TEXT | ISO timestamp of when Apps Script ran |

### Gmail subject convention (for auto client extraction)
`MOM - [Client Name] - [Meeting Type]`
e.g. `MOM - CIS Bayad Center - KOM Meeting`

The Apps Script tries these patterns in order:
1. `MOM - Client - Type` → extracts "Client"
2. `MOM - Client` (no second dash) → extracts "Client"
3. `[MOM] Client ...` → extracts first segment

### Apps Script (`MOM_Gmail_Sync.gs`)
- Reads threads with label `MOM` (up to 100 threads per run)
- Pushes each message to Supabase with `Prefer: resolution=ignore-duplicates`
- Runs on a 30-minute time trigger in Google Apps Script
- Uses Supabase anon key (server-side only — never in HTML)

### App changes
| Change | Detail |
|---|---|
| `MOM_ITEMS = []` | Global array populated from Supabase |
| `fetchMOMs()` | Async — `_supa.from('impl_moms').select('*').order(sent_date)` |
| `refreshMOMs()` | Called by Refresh button — fetches then re-renders |
| `vaultExpandMOM(id)` | Toggles body preview ↔ full body on MOM cards |
| `goVault('MOMs')` | Calls `fetchMOMs().then(renderVault)` after navigating |
| `vaultFilter('MOMs')` | Same fetch-then-render pattern |
| `renderVault()` | When `VAULT_FILTER === 'MOMs'`: hides Add File, shows Refresh, renders MOM cards from `MOM_ITEMS` |

### MOM card UI
- Blue envelope icon, `MOM` badge (blue)
- Subject as card title
- Client name row (if extracted) — person icon + name
- Meta row: sender name (cleaned), sent date
- Body preview (220 chars) with "Read more" expand → scrollable full body

### Setup files (in project folder)
- `MOM_Gmail_Sync.gs` — paste into script.google.com
- `MOM_Supabase_Table.sql` — run in Supabase SQL Editor

---

## 28. Implementation Vault — Proposals Google Drive Link ✅ Coded (June 19, 2026)

### What changed
Proposals (and all vault entries) now support an optional **Client** field. The form auto-selects the current category filter when opened, and the URL input now prompts for Google Drive links.

### Form changes
| Field | Change |
|---|---|
| **Client** (`#vf-client`) | New optional text input, row placed between Category and Type. Placeholder: "e.g. CIS Bayad Center" |
| **Type label** | "Link (URL)" → "Link (Google Drive / URL)" |
| **URL placeholder** | `https://...` → "Paste Google Drive link or any URL..." |

### Auto-select category
`vaultShowForm()` now pre-sets `#vf-cat` to `VAULT_FILTER` when the form opens (as long as filter is not `'all'`). Opening the form from Proposals view auto-selects "Proposals".

### Data structure
Both link and file item objects now include `clientName: string | null` field:
```js
{id, name, category, clientName, type:'link', url, notes, uploadedBy, uploadedAt}
{id, name, category, clientName, type:'file', fileName, fileData, fileType, notes, uploadedBy, uploadedAt}
```
Old entries without `clientName` display without the client row (backward compatible).

### Card rendering
When `v.clientName` is set, a small person-icon + client name appears below the vault item name and above the category badge.

### Code changes
- Form HTML: added `#vf-client` input row; updated type radio label; updated URL placeholder
- `vaultShowForm()`: pre-sets `#vf-cat` from `VAULT_FILTER`
- `vaultHideForm()`: added `'vf-client'` to the fields cleared on close
- `vaultSaveItem()`: reads `vf-client`, stores as `clientName` on both link and file items
- `renderVault()` card: conditionally renders client name row when `v.clientName` is truthy

---

## 21. Google Login — Open Access for @sprout.ph Emails ✅ Coded (June 19, 2026)

### What changed
Any `@sprout.ph` Google account can now sign in — even if not registered in `USERS` or `USERS_DEFAULT`. Previously, unregistered emails were blocked with "Your account is not authorized."

### Behavior
| User type | Result |
|---|---|
| Registered in USERS/USERS_DEFAULT | Signs in with their assigned role (manager, admin, implementer, god) |
| `@sprout.ph` email NOT in USERS | Signs in as **Implementer** — sees My Dashboard with empty project list |
| Non-`@sprout.ph` email | Blocked — error message shown, Supabase session signed out |

### Empty dashboard for unassigned users
Since the implementer dashboard filters projects by `IMPL_USER` matching the `resource` field in client records, an unregistered user will naturally see zero projects — no extra code needed.

### Display name for unregistered users
- **OAuth flow** (`onAuthSuccess`): reads from `user.user_metadata.full_name` → `user.user_metadata.name` → email prefix before `@`
- **One-tap GSI flow** (`handleGoogleCredential`): reads from `payload.name` → `payload.given_name` → email prefix before `@`

### Functions changed
| Function | Change |
|---|---|
| `onAuthSuccess(user)` | Added `@sprout.ph` fallback before the "not authorized" block — extracts display name from Google metadata, sets `CURRENT_ROLE='implementer'`, calls `loadFromSupabase()` then `startApp()` |
| `handleGoogleCredential(response)` | Added `@sprout.ph` fallback; also now checks `USERS_DEFAULT` in addition to `USERS` (was inconsistent before) |

---

## 22. Resource Dropdowns — Always Synced from Team Configuration ✅ Coded (June 19, 2026)

### Problem
Resource dropdowns (`cr` filter, Add Client modal, edit selects) and the resource color map (`RC`) were only updated when a user visited Settings and saved the Team Configuration. On every fresh login, the app showed stale or placeholder names (Ana, Bea, Carl, Dana, Eli).

### Root causes
1. `RC` was hardcoded as `{Ana:'#32CE13', Bea:'#1679FA', Carl:'#8139EE', Dana:'#FF7F00', Eli:'#D2F612'}`
2. The `cr` resource filter dropdown had hardcoded `<option>` tags in the HTML
3. The dropdown sync code existed only inside `saveTeamConfig()` — never called on login
4. Weekly view (`renderWeekly`) and MOM Generator had hardcoded fallback arrays `['Ana','Bea','Carl','Dana','Eli']`

### Fix

#### New shared function: `_syncTeamDropdowns()`
Extracted from `saveTeamConfig()` into a standalone function. Called in two places:
- `startApp()` — runs on every login after Supabase data loads
- `saveTeamConfig()` — runs when the user saves team config (unchanged behavior)

What `_syncTeamDropdowns()` does:
1. Clears and rebuilds `RC` from `TEAM_CONFIG.implementers` using the standard 10-color palette
2. Repopulates `#cr` (resource filter dropdown) from `TEAM_CONFIG.implementers`
3. Repopulates `#login-impl-name` (login implementer selector) from `TEAM_CONFIG.implementers`
4. Repopulates `#acm-impl` (Add Client modal — implementer) from `TEAM_CONFIG.implPYO`
5. Repopulates `#acm-pm` (Add Client modal — PM) from `TEAM_CONFIG.pms`
6. Repopulates `#acm-hri` (Add Client modal — HR-I) from `TEAM_CONFIG.implHR`
7. Repopulates `#acm-gov` (Add Client modal — Gov) from `TEAM_CONFIG.implGov`
8. Repopulates `#acm-otk-impl` (Add Client modal — OTK) from `TEAM_CONFIG.implOTK`

#### HTML changes
- `#cr` dropdown: removed hardcoded `<option>` tags (Ana, Bea, Carl, Dana, Eli) — now populated dynamically

#### JS variable changes
- `var RC` initial value changed from hardcoded name→color map to `{}` (empty; filled by `_syncTeamDropdowns()` on login)

#### Fallback changes
| Location | Before | After |
|---|---|---|
| `renderWeekly()` — no-data fallback | `['Ana','Bea','Carl','Dana','Eli']` | Removed — falls back to `TEAM_CONFIG.implementers` only |
| `renderMOMUI()` — default staff | `['Ana','Bea','Carl','Dana','Eli']` | Removed — uses `TEAM_CONFIG.implementers + pms` only |
| `momExtract()` — sproutStaff param | `['Ana','Bea','Carl','Dana','Eli']` | `TEAM_CONFIG.implementers` |
| MOM parse step | `['Ana','Bea','Carl','Dana','Eli']` | `TEAM_CONFIG.implementers` |

---

## 30. Supabase — Full Data Sync (All Remaining Data) ✅ Coded (June 20, 2026)

All data that was previously stored only in localStorage is now synced to Supabase. Every table below has RLS enabled; all policies require `auth.role() = 'authenticated'`.

### Tables added / confirmed

| Table | Primary key | Purpose | localStorage key |
|---|---|---|---|
| `client_issues` | `id TEXT` | Issue Log entries | `pyo_issues` |
| `audit_log` | `id BIGSERIAL` | Audit trail (append-only) | `pyo_audit` |
| `pending_bank` | `id TEXT` | Pending Items Bank templates | `pyo_pending_bank` |
| `client_pending` | `client_no INT` | Per-client pending checklists (JSONB) | `pyo_client_pending` |
| `vault_items` | `id TEXT` | Implementation Vault entries | `pyo_vault` |

### Generic Supabase helpers added
```javascript
async function _supaUpsert(table, row, conflict) { ... }   // upserts one row
async function _supaInsert(table, row) { ... }             // inserts one row (audit_log)
async function _supaDelete(table, col, val) { ... }        // deletes by column=value
```

### Per-table write wiring

**client_issues** — helper `_ilSupaUpsert(issue)` called from `ilSave()`, `ilToggleStatus()`, `ilUpdateRes()`; `_supaDelete('client_issues','id',id)` called from `ilDelete()`.

**audit_log** — `logAudit()` calls `_supaInsert('audit_log', {...})`; `clearAudit()` calls `_supa.from('audit_log').delete().gte('id',0)` (Supabase requires a filter for delete).

**pending_bank** — `pibAddTemplate()` calls `_supaUpsert('pending_bank', row, 'id')`; `pibDeleteTemplate(id)` calls `_supaDelete('pending_bank','id',id)`.

**client_pending** — helper `_cpSupaSave(clientNo)` upserts `{client_no, items:[...]}` to `client_pending`; called from `pibToggleItem()`, `pibDeleteItem()`, `pibAddCustom()`, `pibAddSelected()`, `dashPendingToggle()`.

**vault_items** — `_vaultSupaUpsert(item)` and `_vaultSupaDelete(id, filePath)` (see Section 25).

### loadFromSupabase() additions
```javascript
// vault_items — merge with local VAULT_ITEMS, preserving local fileData
var rv = await _supa.from('vault_items').select('id,name,...').order('uploaded_at',{ascending:false});

// client_issues
var ris = await _supa.from('client_issues').select('*').order('date',{ascending:false});

// audit_log
var rau = await _supa.from('audit_log').select('ts,...').order('ts',{ascending:false}).limit(2000);

// pending_bank
var rpb = await _supa.from('pending_bank').select('*');

// client_pending
var rcp = await _supa.from('client_pending').select('*');
```

### Supabase SQL (run once)
```sql
-- client_issues
CREATE TABLE IF NOT EXISTS client_issues (
  id TEXT PRIMARY KEY, client_no INT, client_name TEXT,
  date TEXT, description TEXT, priority TEXT, status TEXT,
  resolution TEXT, created_by TEXT
);
ALTER TABLE client_issues ENABLE ROW LEVEL SECURITY;
-- (add SELECT/INSERT/UPDATE/DELETE policies for authenticated)

-- audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY, ts TEXT, user_name TEXT,
  action TEXT, detail TEXT
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- pending_bank
CREATE TABLE IF NOT EXISTS pending_bank (
  id TEXT PRIMARY KEY, label TEXT, phase TEXT, category TEXT
);
ALTER TABLE pending_bank ENABLE ROW LEVEL SECURITY;

-- client_pending  (one row per client; items stored as JSONB array)
CREATE TABLE IF NOT EXISTS client_pending (
  client_no INT PRIMARY KEY, items JSONB DEFAULT '[]'
);
ALTER TABLE client_pending ENABLE ROW LEVEL SECURITY;
```

---

## 31. Issue Log — Manager and Admin Visibility ✅ Coded (June 20, 2026)

### Problem
The Issue Log was only visible to `implementer` and `god` roles. Managers and Admins had no way to see issues that implementers logged against their shared clients.

### Fix

**`ROLE_CONFIG.hideNav` updated:**

| Role | Before | After |
|---|---|---|
| `manager` | `['impl','my-clients','settings','issues']` | `['impl','my-clients','settings']` |
| `admin` | `['impl','my-clients','issues']` | `['impl','my-clients']` |

**`startApp()` and `godSwitch()`** — `clIssuesBtn` (the Issue Log sidebar item) is always set to `display:flex` regardless of role; the `hideNav` loop still hides it for manager/admin if left in the list, so this removal is the correct fix.

**`renderIssueLog()` — role-aware edit gating:**
```javascript
var canEdit = CURRENT_ROLE==='implementer' || CURRENT_ROLE==='admin' || CURRENT_ROLE==='god';
```
- `canEdit = true` → Add Issue form shown, status toggles and delete buttons active
- `canEdit = false` (manager) → read-only view; no Add form, no delete buttons, no status toggle

### Visibility matrix (updated)
| Role | Issue Log tab | Can add | Can delete | Can toggle status |
|---|---|---|---|---|
| God | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ (read-only) | ✗ | ✗ | ✗ |
| Implementer | ✅ | ✅ | own only | ✅ |

---

## 32. Client Subpanels — Four-Way Split ✅ Coded (June 20, 2026)

The Clients sidebar section was expanded from two subpanels (PYO, Payroll Starter) to four.

### Four subpanels

| Subpanel | `CL_TYPE` value | Nav ID | Dot color | Filter logic |
|---|---|---|---|---|
| PYO | `'pyo'` | `nav-cl-pyo` | Green `#32CE13` | `service` is not Payroll Starter, Sprout Gov, or Statutory Disbursement |
| Payroll Starter | `'ps'` | `nav-cl-ps` | Teal `#0891b2` | `service === 'Payroll Starter'` |
| Sprout Gov | `'gov'` | `nav-cl-gov` | Purple `#8139EE` | `service === 'Sprout Gov'` OR `service === 'Statutory Disbursement'` |
| Payroll Disbursement | `'pd'` | `nav-cl-pd` | Carrot `#FF7F00` | `CL_ADDONS[d.no].pd` is truthy |

### Sidebar HTML additions (after `#nav-cl-ps`)
```html
<button class="nav-tool-item" id="nav-cl-gov" onclick="goClients('gov')">
  <span style="...background:#8139EE;..."></span>Sprout Gov
</button>
<button class="nav-tool-item" id="nav-cl-pd" onclick="goClients('pd')">
  <span style="...background:#FF7F00;..."></span>Payroll Disbursement
</button>
```

### `renderClients()` filter logic
```javascript
if(CL_TYPE==='ps')  return d.service==='Payroll Starter';
if(CL_TYPE==='gov') return d.service==='Sprout Gov' || d.service==='Statutory Disbursement';
if(CL_TYPE==='pd')  return !!(CL_ADDONS[d.no] && CL_ADDONS[d.no].pd);
// default (PYO): exclude PS, Sprout Gov, and Statutory Disbursement
return d.service!=='Payroll Starter' && d.service!=='Sprout Gov' && d.service!=='Statutory Disbursement';
```

### Active state wiring
- `go()` — clears active on all four buttons, then adds `.active` to the button matching `CL_TYPE`
- `setClType(type)` — toggles `.active` on all four buttons when switching types

### Gov Resource column trigger — Statutory Disbursement added
The Gov Implementer column (Overview and By Resource tabs of Weekly Status) now also lights up for `Statutory Disbursement` service:
```javascript
// Before:
var isGov = (d.service && d.service.toLowerCase().indexOf('gov') >= 0) || (a.sg || a.ba || a.std);

// After:
var isGov = (d.service && (/gov/i.test(d.service) || /statutory/i.test(d.service))) || (a.sg || a.ba || a.std);
```
This change was applied with `replace_all: true` because the same expression appears in both Overview tab and Resource tab rendering.

---

## 33. Team Configuration — Payroll Disbursement Implementer ✅ Coded (June 20, 2026)

### What was added
A fifth implementer category — **Payroll Disbursement Implementer** — was added to the Team Configuration panel in Settings, alongside the existing PYO, Gov, HRI/SI, and OTK categories.

### TEAM_CONFIG default (updated)
```javascript
var TEAM_CONFIG = {
  implPYO: ['Ana','Bea','Carl','Dana','Eli'],
  implGov: [],
  implHR:  [],
  implOTK: [],
  implPD:  [],                          // ← new
  implementers: ['Ana','Bea','Carl','Dana','Eli'],
  pms: ['Marcus','Sofia','Javier','Isabel','Diego']
};
```

### Lookup maps (updated)
```javascript
var TC_MAP    = {pyo:'implPYO', gov:'implGov', hr:'implHR', otk:'implOTK', pd:'implPD', pm:'pms'};
var TC_LIST_ID = {pyo:'st-pyo-list', gov:'st-gov-list', hr:'st-hr-list', otk:'st-otk-list', pd:'st-pd-list', pm:'st-pm-list'};
```

### `tcRenderTeam()` loop updated
```javascript
['pyo','gov','hr','otk','pd','pm']   // ← 'pd' added before 'pm'
```

### `stSaveTeam()` updated
- Collects `.tc-pd-inp` inputs into `implPD`
- `TEAM_CONFIG.implementers` rebuilt as `implPYO.concat(implGov).concat(implHR).concat(implOTK).concat(implPD)`
- Supabase upsert includes `impl_pd: TEAM_CONFIG.implPD`
- localStorage save includes `implPD`

### `loadFromSupabase()` updated
- Reads `r.impl_pd` (TEXT[] column) into `TEAM_CONFIG.implPD`
- `TEAM_CONFIG.implementers` rebuilt to include `implPD` in the concat chain

### Settings HTML addition
A "Payroll Disbursement Implementer" panel with `id="st-pd-list"` was inserted between the OTK Resource and Project Managers panels. Uses the same `nav-tool-item` + `tcAddRow`/`tcRemoveRow` pattern as the other categories.

### Supabase SQL required
```sql
ALTER TABLE team_config ADD COLUMN IF NOT EXISTS impl_pd TEXT[] DEFAULT '{}';
```

---

## 34. Clients Table — Sequential Row Numbering ✅ Coded (June 20, 2026)

### Problem
The `#` column in all client tabs displayed the internal record ID (`d.no`) — a non-sequential number assigned when the client was added. With filtered views (e.g. PYO only, or page 2), gaps like `2, 3, 11, 12, 16...` appeared instead of `1, 2, 3, 4...`.

### Fix
All six tab render functions were updated to use the map index instead of `d.no` for the display number:

```javascript
// Before (all tabs):
slice.map(function(d){ ... d.no ... })

// After (all tabs):
slice.map(function(d,i){ ... ((clPg-1)*PS+i+1) ... })
```

The formula `(clPg-1)*PS+i+1` produces correct sequential numbers across pages:
- Page 1: 1, 2, 3 … 20
- Page 2: 21, 22, 23 … 40

### Tabs updated
Overview, Resource Team, Implementation Phases, Add On Services, Milestone Dates, After Hand Over — all 6 branches inside `renderClients()`.

---

## 35. Implementer Dashboard — New Assignments Notification Panel ✅ Coded (June 20, 2026)

### What was added
A **New Assignments** panel in the implementer dashboard that notifies an implementer when a client has been assigned to them but not yet acknowledged. Checking the box (or clicking "Acknowledge All") dismisses the notification.

### Panel design
- **Position:** Top of the left column, above Needs Attention — it's the first thing seen on login
- **Color:** Blueberry blue (`#1679FA`) gradient header — distinct from orange (Needs Attention) and amber (Follow-up)
- **Pulse animation:** `newassign-pulse` — blue glow, same rhythm as the amber follow-up panel
- **Badge:** White pill in header showing count of unacknowledged clients
- **Hidden** when all assignments are acknowledged (no empty-state shown)

### UX flow
1. Admin/implementer adds a new client and assigns it to an implementer
2. On the implementer's next login, the blue panel appears at the top of their dashboard
3. Each row shows: client name, service type, month, and a **New** badge
4. Checking the checkbox next to a client dismisses that row immediately
5. When only one client remains, "Acknowledge All" button is hidden (no need)
6. When multiple unacknowledged clients exist, **Acknowledge All** button appears at the bottom
7. Once all are acknowledged, the panel disappears

### Detection logic
- `IMPL_ACK[implName]` holds an array of acknowledged client numbers
- Any client in `myD` (implementer's filtered clients) whose `d.no` is **not** in `IMPL_ACK[IMPL_USER]` is treated as a new assignment
- On first deploy, all current clients appear as "new" — use **Acknowledge All** to clear them

### Data structure
```javascript
// Global variable (localStorage key: pyo_impl_ack)
var IMPL_ACK = {};  // { 'Ana': [1, 5, 12], 'Bea': [3, 7] }
```

### Supabase table: `impl_ack`
```sql
CREATE TABLE IF NOT EXISTS impl_ack (
  impl_name TEXT PRIMARY KEY,
  acked_nos INT[] DEFAULT '{}'
);
ALTER TABLE impl_ack ENABLE ROW LEVEL SECURITY;
-- add SELECT/INSERT/UPDATE/DELETE policies for authenticated
```

### `loadFromSupabase()` addition
```javascript
var rack = await _supa.from('impl_ack').select('impl_name,acked_nos');
if(!rack.error && rack.data) rack.data.forEach(r => { IMPL_ACK[r.impl_name] = r.acked_nos||[]; });
```

### `implSetMode()` changes
- `drill` mode: `cpanel-newassign` hidden alongside Needs Attention and Follow-up
- `default` mode: `renderNewAssignPanel(myD)` called to restore panel (only shows if unacknowledged items exist)

### New JS functions
| Function | Purpose |
|---|---|
| `renderNewAssignPanel(myD)` | Shows/hides panel, renders per-client acknowledgment rows |
| `ackProject(no)` | Acknowledges one client, saves to localStorage + Supabase, re-renders panel |
| `ackAll()` | Acknowledges all unacknowledged clients at once |
| `_ackSupaSave()` | Upserts `{impl_name, acked_nos}` to `impl_ack` table |

### `pyo_impl_ack` added to `HUB_BACKUP_KEYS`
Ensures the acknowledgment state is included in the hub data export/backup.

---

## 36. Client Dropdowns — Role-Filtered Across All Tools ✅ Coded (June 20, 2026)

### Principle
Every place in the tool where a user selects an existing client must use a `<select>` dropdown (never a free-text input), and implementers must only see the clients assigned to them.

### Status per tool section

| Section | Element | Type | Implementer filter | Notes |
|---|---|---|---|---|
| Issue Log | `#il-client` | `<select>` | ✅ `d.resource === IMPL_USER` | Already done |
| Pending Items Bank | client select in `renderPendingBankUI()` | `<select>` | ✅ `d.resource === IMPL_USER` | Already done |
| Implementation Vault — Add form | `#vf-client` | `<select>` ← changed from `<input type="text">` | ✅ populated in `vaultShowForm()` | **Changed this session** |
| MOM Generator | `#mom-client-name` | `<input type="text">` | n/a — auto-extracted from transcript | Left as text (auto-detect context) |

### Vault `vf-client` change

**Before:** `<input type="text" placeholder="e.g. CIS Bayad Center">`

**After:** `<select id="vf-client">` populated on form open via `vaultShowForm()`:
```javascript
var clientList = CURRENT_ROLE==='implementer'
  ? D.filter(d => d.resource.trim().toLowerCase() === IMPL_USER.trim().toLowerCase())
  : D;
vfClient.innerHTML = '<option value="">— Select client (optional) —</option>'
  + clientList.map(d => '<option value="'+d.client+'">'+d.client+'</option>').join('');
```
- Implementer: only their assigned clients appear
- Admin / God / Manager: all clients appear
- Field remains optional (blank first option) — vault entries can still be created without a client tag

### Implementation Vault — role permission matrix

| Action | God | Admin | Manager | Implementer |
|---|---|---|---|---|
| View all entries | ✅ | ✅ | ✅ (read-only) | ✅ |
| Add / upload files | ✅ | ✅ | ✗ | ✅ |
| Delete any entry | ✅ | ✅ | ✗ | ✗ |
| Delete own entry | ✅ | ✅ | ✗ | ✅ |

Manager read-only is enforced via:
- `canAdd = admin \|\| implementer \|\| god` — Add File button hidden for manager
- `canDel = admin \|\| god \|\| (implementer && own)` — Delete button not rendered for manager

---

## 37. Implementation Vault — Links Only (Upload File Removed) ✅ Coded (June 20, 2026)

### What changed
The "Upload File" option was removed from the vault Add form. The vault now only supports Google Drive / URL links.

### Rationale
Proposals and documents are stored in individual client folders in Google Drive. File uploads to Supabase Storage would be redundant and accumulate storage costs. Pasting a Drive link is faster and costs nothing.

### Changes
- **HTML form:** TYPE radio buttons (`Link` / `Upload File`) removed entirely; `vf-file-row` and `vf-file` input removed; URL input always visible, relabelled "Google Drive / URL *"
- **`vaultSaveItem()`:** Removed file upload branch; always saves as `type:'link'`
- **`vaultHideForm()`:** Removed `vf-file` clear, radio reset, and `vaultTypeToggle()` call
- **`vaultTypeToggle()`:** Function removed entirely

---

## 38. Implementation Vault — Name Field Removed + Category Auto-Select Fix ✅ Coded (June 20, 2026)

### Name field removed
The NAME * field was removed from the vault Add form. Entry names are now auto-generated on save:
- If a client is selected: `[ClientName] — [Category]` (e.g. "CIS Bayad Center — Proposals")
- If no client: `[Category] — [date]` (e.g. "Proposals — 6/20/2026")

Form now only requires: **Category** and **Google Drive URL**. Client and Notes remain optional.

### Category auto-select bug fixed
When a user had the form open on one category (e.g. MOMs) and clicked a different category in the sidebar (e.g. Proposals), the form stayed open with the old category.

**Fix:** `goVault(cat)` now calls `vaultHideForm()` before navigating, so the form always resets cleanly when switching categories. The form reopens fresh with the correct category auto-selected when the user clicks "+ Add File".

---

## 39. Implementation Vault — Client-Grouped Display + Optional Name Field ✅ Coded (June 20, 2026)

### Problem
When multiple entries were uploaded for the same client (e.g. two Proposals for "CIS Bayad Center"), each appeared as a separate card with an auto-generated name like "CIS Bayad Center — Proposals". This made the vault look like duplicate entries rather than organized records per client.

### Solution: Client-grouped display
Vault entries are now displayed grouped by client instead of as a flat card grid:
- Each client gets one **group card** with a header showing the client name and item count
- All entries for that client are listed as rows inside the group card
- Entries with no client selected appear under a **"General"** group at the bottom
- Groups are sorted alphabetically by client name

Each row shows: category icon, entry name, notes (if any), category badge, uploaded-by + date, and Open/Delete buttons.

### Name field restored as optional
The NAME field is back in the vault form (optional, no asterisk) as the first field:
- If the user fills in a name, that name is used as-is
- If left blank, the name is auto-generated as `[Category] — [date]` (e.g. "Proposals — 6/20/2026")
- The client name is **not** used in auto-generation to avoid duplicate-looking names

### New CSS classes
- `.vault-cgroup` — outer group card container
- `.vault-cgroup-hdr` — client header row with person icon + client name + item count badge
- `.vault-cgroup-count` — pill badge showing item count
- `.vault-entry-row` — individual entry row within a group
- `.vault-cat-icon-sm` — smaller 28px category icon for entry rows
- `.vault-entry-name` — truncating entry name label
- `.vault-entry-meta` — small uploader + date text
- `.vault-entry-acts` — Open + Delete button container

### Helper function
`_vaultEntryRow(v)` — inline helper defined inside `renderVault()` to build the HTML for one entry row (avoids repeating the row template for both grouped and ungrouped entries).

---

## 40. Implementation Vault — Client-First Tile Dashboard ✅ Coded (June 20, 2026)

### Design (reference: screenshot 14)
Vault categories (Proposals, Decks, etc.) now open in a **client-first tile view** instead of a flat list. Each client that has files appears as a clickable tile card. Clicking a tile drills into that client's files; a back button returns to the tile view.

### Tile view layout
- Section label changes to: `● N — CLIENT-FIRST DASHBOARD` (N = number of client tiles)
- Subtitle hint: "Client tiles, click to drill in"
- 2-column grid of tiles, one per client
- Each tile shows: colored initials avatar | client name | category label | file count
- A "General" tile appears at the end for entries with no client assigned

### Drill view layout
- Back button: `← All Clients`
- Shows client name + item count in the back bar
- Lists all files for that client using the same entry-row format (category icon, name, notes, badge, uploader/date, Open + Delete)

### Avatar color system
- `_TILE_COLORS` — array of 8 pastel color pairs (bg + text), matching Tailwind color palette
- `_tileColor(name)` — hashes client name to consistently pick one of the 8 colors
- `_tileInitials(name)` — takes first letter of first and last word, uppercase (e.g. "Harmony Workforce" → "HW")

### New global state
- `VAULT_DRILL_CLIENT` — null = tile view; string = drill into that client; `'__general__'` = drill into General (no-client entries)
- Reset to null on every category switch (in `goVault()` and `vaultFilter()`)

### New CSS classes
- `.vault-tile-grid` — 2-column grid container
- `.vault-tile` — clickable client tile card with hover effect
- `.vault-tile-avatar` — colored initials circle (36px, rounded)
- `.vault-tile-name` — truncating client name label
- `.vault-tile-cat` — category sub-label in green
- `.vault-tile-count` — large number + "file/files" label, right-aligned
- `.vault-drill-bar` — back button row in drill view
- `.vault-drill-back` — styled back button

### New JS functions
- `vaultDrillIn(cn)` — sets `VAULT_DRILL_CLIENT` and re-renders
- `vaultDrillBack()` — clears `VAULT_DRILL_CLIENT` and re-renders
- `_tileColor(name)` — deterministic color picker from `_TILE_COLORS`
- `_tileInitials(name)` — 2-letter initials from client name

---

## 41. Vault Upload Reminders — Dashboard Panel + Needs Attention Alerts ✅ Coded (June 20, 2026)

### Missing Proposals Panel (implementer dashboard)
A new amber collapsible panel `cpanel-missproposal` appears in the implementer dashboard between the New Assignments panel and Needs Attention, whenever an implementer has clients with no Proposals uploaded in the vault.

- Amber gradient header (matches warning urgency without being as critical as red)
- Lists each client without a proposal, with service + month, and an "+ Upload" button that navigates to Vault → Proposals
- Hides automatically when all clients have proposals on file
- Panel is hidden in "drill" mode (when viewing project detail)
- New CSS: `.impl-missprop-panel`, `.impl-missprop-hdr`, `.impl-missprop-title`, `@keyframes missprop-pulse`

### Vault Document Alerts in Needs Attention
Four new alert types added to `implRenderAttention()` that fire when key meeting dates are within 14 days and the corresponding vault document has not yet been uploaded:

| Alert | Triggers when | Vault check |
|---|---|---|
| KOM Deck missing | `komDate` ≤ 14 days away, KOM not done | `Decks` count for client < 1 |
| Payroll Discussion Deck missing | `simDate` ≤ 14 days away, Simulation not done | `Decks` count for client < 2 |
| Parallel Run Deck missing | `parDate` ≤ 14 days away, Parallel Run not done (non-PS only) | `Decks` count for client < 3 |
| Payroll Policy missing | `handOver` ≤ 14 days away | `Payroll Policy` count for client < 1 |

- Alert color: purple (`#7c3aed`) with `background:#f3e8ff;color:#6b21a8` badge
- Badge shows days remaining (e.g. "7d") or "Today" if due today
- Clicking any alert row selects the client in the project list
- Priority 3.5 — appears after orange "due within 7 days" alerts, before yellow 14-day alerts
- Deck count logic: decks are expected to be uploaded sequentially (KOM → Payroll Discussion → Parallel Run), so count thresholds of 1/2/3 are used

### New JS functions/helpers
- `_vaultCount(clientName, category)` — counts vault entries for a given client + category (used by both the panel and the alerts)
- `renderMissingProposalPanel(myD)` — renders the amber proposals panel; auto-hides when no clients are missing proposals

---

## 42. Minor Removals ✅ Coded (June 20, 2026)

### Audit Trail — Clear Log button removed
The "Clear Log" button was removed from the Audit Trail page. The search bar remains. Reason: the button allowed permanent deletion of the audit history which should be preserved.

### Vault form — Name field removed (final)
The NAME (optional) field added in Section 39 was removed from the vault New Entry form after user review (screenshots 16 & 17 — visible in both Decks and Payroll Policy categories). Entry names continue to auto-generate as `[Category] — [date]` (e.g. "Decks — 6/20/2026"). The form now opens with focus on the URL field. `vf-name` references removed from `vaultHideForm()`, `vaultSaveItem()`, and `vaultShowForm()`.

---

## 43. Payroll Policy Excel Generator ✅ Coded (June 20, 2026)

### What was built
A new administration tool — **Payroll Policy Excel Generator** — integrated into the existing tool modal under Phase 3 — Parallel Run in the sidebar. No new page was added; the tool opens in the standard #tool-modal overlay used by all other admin tools.

### How it works
1. User opens the tool via **Administration → Phase 3 → Payroll Policy Excel Generator**
2. Tool modal opens (max-width 780px) with:
   - **Claude API Key** input — stored in localStorage under key sprout_ai_key (shared across AI tools). Pre-fills if previously saved.
   - **PDF upload zone** — drag & drop or click to browse. Accepts .pdf files. FileReader reads the file as base64 (pdfB64).
   - **Extract Policy with AI** button — disabled until a PDF is uploaded. On click, sends the PDF as a base64 document attachment to Claude (claude-sonnet-4-6) via https://api.anthropic.com/v1/messages and requests a structured JSON extraction of all 27 policy fields.
   - **Status bar** — shows loading spinner, success, or error messages.
   - **Review form** (appears after extraction) — scrollable (max-height 380px) grid with all 27 editable fields grouped into 4 sections: Company Information, Payroll Computation, Government Deductions, Others.
   - **Download Excel** button (appears after extraction) — loads the embedded base64 template, fills all 27 cells using SheetJS (XLSX.read / XLSX.writeFile), and downloads as Payroll Policy — [Company Name].xlsx.

### Field-to-cell mapping (Policy for handover Standard Template.xlsx)
| Field | Cell | Field | Cell |
|---|---|---|---|
| company_name | C4 | payroll_frequency | D11 |
| company_code | D5 | payroll_cutoff | D12 |
| payroll_accounts | D6 | cutoff_remarks | D13 |
| work_days_per_year | D7 | employee_type | D14 |
| work_hours_per_day | D8 | new_hire_proration | D15 |
| work_months_per_year | D9 | allowances | D16 |
| absent_deduction | D17 | sss_contribution | D23 |
| late_deduction | D18 | sss_loans | D24 |
| overtime | D19 | phic_contribution | D25 |
| thirteenth_month | D20 | hdmf_contribution | D26 |
| final_pay | D21 | hdmf_loans | D27 |
| company_deductions | D30 | bir_tax | D28 |
| reports | D32 | services | D34 |
| poc | D36 | | |

### New global variables
- PP_STATE — {pdfFile, pdfB64, apiKey, extracted} — reset on closeTool()
- PP_TEMPLATE_B64 — base64-encoded Policy for handover Standard Template.xlsx (~22.5 KB, embedded inline)
- PP_FIELDS — ordered array of the 27 field keys
- PP_CELL_MAP — maps field keys to Excel cell addresses

### New JS functions
| Function | Purpose |
|---|---|
| enderPayrollPolicyUI() | Renders full tool modal body HTML |
| ppReviewFormHTML() | Returns the review form HTML (4 sections, 27 fields) |
| ppHandleFile(f) | Reads uploaded PDF file as base64 via FileReader |
| ppDragOver(e) / ppDragLeave() / ppDrop(e) | Drag-and-drop handlers for upload zone |
| ppSaveKey() | Saves API key to localStorage |
| ppSetStatus(msg, type) | Shows loading/success/error status bar |
| ppExtract() | Async — calls Claude API, parses JSON response, populates form |
| ppPopulateForm(data) | Fills all form fields from extracted JSON data |
| ppDownload() | Loads template, fills cells with form values, downloads xlsx |

### Changes to existing functions
- openTool('payroll-policy') — added else if branch: sets max-width 780px, resets PP_STATE, calls enderPayrollPolicyUI()
- closeTool() — resets PP_STATE on close

### No Supabase changes required
Entirely client-side. No data persisted to the database.

### Standalone tool
A standalone version was also created at C:\Users\lesleea_sprout\Desktop\Claude AI Project\payroll-policy-generator.html for offline or out-of-app use.

---

## 44. Needs Attention — Redesigned Row Layout ✅ Coded (June 20, 2026)

### What changed
The Needs Attention panel alert rows were redesigned to match screenshot 19. Instead of a simple colored dot + text list, each alert now shows a distinct icon-block layout grouped under urgency section headers.

### New row design
Each alert row has three parts:
1. **Left icon block** (62px wide) — tinted background matching the alert color, with an action-relevant SVG icon and a short action label below it (e.g., "START SIMULATION", "UPLOAD KOM DECK")
2. **Center content** — bold action title, client name in muted text, description + date merged into one line
3. **Right badge** — pill badge showing days idle or days remaining (e.g., "93d idle", "5d")

### Section grouping
Alerts are now grouped under colored section headers instead of displayed as a flat list:

| Section header | Color | Triggers |
|---|---|---|
| OVERDUE — IMMEDIATE ACTION REQUIRED | #991b1b (dark red) | color: #dc2626 alerts |
| DUE SOON — ACT WITHIN 7 DAYS | #c2410c (dark orange) | color: #ea580c alerts |
| VAULT — UPLOAD NEEDED | #5b21b6 (deep purple) | color: #7c3aed alerts |
| DUE IN 14 DAYS | #92400e (brown-amber) | color: #f59e0b alerts |
| SCHEDULE NEXT PHASE | #1e40af (deep blue) | color: #2563eb alerts |

### Icon mapping
| Phase | Icon | Label |
|---|---|---|
| Simulation, Parallel run, Project Checklist | ▶ play triangle | START SIMULATION / START PARALLEL RUN / START CHECKLIST |
| Live run | flag | LIVE RUN |
| KOM Deck, PD Deck, PR Deck, Payroll Policy | upload arrow | UPLOAD KOM DECK / etc. |
| Issue | warning triangle | OPEN ISSUE |

### CSS changes
- .impl-attn-body — padding removed (section headers span full width), max-height increased to 310px
- .impl-attn-row — changed from dot+text to stretch layout (no internal gap/padding)
- Removed: .impl-attn-dot, .impl-attn-txt, .impl-attn-sub, .impl-attn-date, .impl-attn-right, .impl-attn-phase, .impl-attn-days
- Added: .impl-attn-section-hdr, .impl-attn-icon-block, .impl-attn-icon-lbl, .impl-attn-content, .impl-attn-title, .impl-attn-client, .impl-attn-desc, .impl-attn-badge-wrap
- .impl-attn-badge — changed to pill shape (border-radius:20px), font-weight:700

### New JS helpers inside implRenderAttention()
- _attnIcon(phase) — returns SVG icon string for the left block
- _attnLbl(phase) — returns short action label (with line break) for under the icon
- _attnTitle(phase) — returns full title string for the row heading
- _ATTN_SECS array — defines section groupings with colors and filters

### Legend update
Added "Vault upload needed" (purple #7c3aed) as a 4th legend item between "Due within 14 days" and "Next phase unscheduled".

---

## 45. Follow Up with Client Panel — Redesigned Layout ✅ Coded (June 20, 2026)

### What changed
The Follow Up with the Client panel was redesigned to match screenshot 20. Each pending item now shows a structured card row instead of a plain checkbox list.

### New item row design
Each pending item has three parts:
1. **Left avatar** — 28px green circle with the implementer's first initial (from IMPL_USER)
2. **Center content** — bold item label, "No updates yet • {phase} phase" subtitle, and an "↩ Add update" link (green, opens Pending Items Bank)
3. **Right** — today's date (e.g., "Jun 20") + checkbox to mark as resolved

### Client group header
Each client group now shows: orange dot + client name (orange uppercase) + "• N items" count — replacing the old gray dot + muted text style.

### Footer
Replaced the plain "Manage in Pending Items Bank →" link with a two-part footer:
- Left: "👆 Click a checkbox to mark as resolved" hint
- Right: "Manage in Pending Items Bank →" green link

### CSS added
.pend-client-hdr, .pend-client-dot, .pend-client-name, .pend-client-count, .pend-item-row, .pend-item-av, .pend-item-content, .pend-item-title, .pend-item-sub, .pend-item-addupd, .pend-item-right, .pend-item-date, .pend-item-cb, .pend-footer, .pend-footer-hint, .pend-footer-link

### Panel header color
.impl-followup-hdr background updated from amber (#d97706) to Sprout Carrot orange (#FF7F00 → #CC5C02) to match the Needs Attention panel style.

### No data model changes
Uses the existing CLIENT_PENDING[clientNo] array. "No updates yet" is always shown (updates per item not yet tracked). "Add update" opens the Pending Items Bank tool.

---

## 46. MOM Vault — Manual Entry ✅ Coded (June 21, 2026)

### What changed
The MOMs section of the Implementation Vault now supports manually adding past MOMs (previously only showed email-synced MOMs from Gmail via Supabase).

### Add MOM button
The "Add File" button is now visible in the MOMs view for admin/implementer/god roles (previously hidden). When clicked, the vault form opens with "MOMs" pre-selected and MOM-specific fields shown.

### MOM-specific form fields (shown when category = MOMs)
- **Meeting Type** (required) — dropdown: KOM (Kick-off Meeting), Simulation, Parallel Run, Handover / Go-live, General Meeting
- **Meeting Date** (required) — date input (YYYY-MM-DD format)
- **URL** — becomes optional (label changes to show "(optional)", asterisk hidden)
- Client is still optional
- Notes is still optional

### Auto-generated name
`{momType} MOM — {clientName} — {meetingDate}` e.g., `KOM MOM — AlterCore — 6/21/2026`

### Data model
Manual MOMs stored in VAULT_ITEMS (localStorage `pyo_vault`) with extra fields:
```
{id, name, category:'MOMs', clientName, type:'link', url (nullable), notes, uploadedBy, uploadedAt, momType, momDate}
```

### Rendering (combined view)
MOMs section now renders both sources:
1. **Manual Entries** subsection (from VAULT_ITEMS where category='MOMs') — green document icon, shows momType badge + "Manual entry" italic label, meeting date, uploader, notes, "Open Document" link (if URL provided), delete button
2. **From Gmail Sync** subsection (from MOM_ITEMS from Supabase) — existing blue email card style, unchanged

Subsection headers only appear when both sources have items. Count in header includes both sources.

### New JS
- `vaultCatChange(cat)` — shows/hides vf-mom-extra and vf-deck-extra panels, toggles URL required/optional markers
- Updated `vaultSaveItem()` — validates MOM-specific fields, generates auto-name, stores momType/momDate
- Updated `vaultHideForm()` — clears vf-mom-type, vf-mom-date, vf-deck-type; calls vaultCatChange('')
- Updated `vaultShowForm()` — calls vaultCatChange after pre-setting category from VAULT_FILTER

### Form HTML additions
- `onchange="vaultCatChange(this.value)"` on vf-cat select
- `#vf-mom-extra` div (hidden by default) containing vf-mom-type select + vf-mom-date input
- `#vf-deck-extra` div (hidden by default) containing vf-deck-type select
- `#vf-url-req` span (asterisk, hidden when MOM selected)
- `#vf-url-opt` span ("(optional)", shown when MOM selected)

---

## 47. Decks Vault — Deck Type Dropdown ✅ Coded (June 21, 2026)

### What changed
When adding an item to the Decks category in the vault, a new required "Deck Type" dropdown appears.

### Deck type options
- Kick-Off Meeting Deck
- Payroll Discussion Deck
- Parallel Run Deck
- Fitgap Deck
- Fitgap Results Deck

### Auto-generated name
`{deckType} — {clientName} — {date}` e.g., `KOM Deck — AlterCore — 6/21/2026`

### Badge display
In the vault entry row, the category badge shows the specific deckType value instead of the generic "Decks" label, so users can quickly identify which deck type an entry is.

### Storage
Extra field `deckType` saved on the VAULT_ITEMS entry alongside the standard fields.

---

## 48. Follow Up Panel — "Add Update" Resolution Logging ✅ Coded (June 21, 2026)

### What changed
The "↩ Add update" link in the Follow Up with Client panel now opens a dedicated overlay form to enter a resolution or update note for that specific pending item. Previously it just opened the Pending Items Bank.

### User flow
1. Click "↩ Add update" on a specific item in the Follow Up panel
2. A centered overlay appears showing the item label and client name
3. User types a resolution/update note (required)
4. Optional: "Mark this item as Resolved" checkbox (checked by default)
5. Save — note is saved to the item, panel re-renders

### Data changes
Three new optional fields added to CLIENT_PENDING items:
- `resolution` (string) — the update/resolution text
- `resolvedBy` (string) — IMPL_USER name who added the note
- `resolvedAt` (string) — date in M/D/YYYY format

### Follow Up panel sub-text
- When resolution exists: shows the first 70 chars of the resolution text
- When no resolution: shows "No updates yet • {phase} phase" (unchanged)

### Pending Items Bank — ✓ Completed section
Resolved items now show the resolution note below the strikethrough label:
- Green left-bordered note block with italic resolution text
- Metadata line: "resolvedBy · resolvedAt"

### New HTML
`#pend-upd-overlay` — fixed-position overlay div (z-index 10000) with the form. Initially `display:none`, shown as `display:flex` when active.

### New JS
- `PEND_UPD = {clientNo, idx}` — state for the open overlay
- `pendAddUpdate(clientNo, idx)` — opens overlay, loads item data
- `pendCloseUpdate()` — hides overlay
- `pendSaveUpdate()` — validates, saves note + done flag, re-renders Follow Up panel, shows toast

### CSS added
- `.pib-res-note` — green left-bordered note block inside resolved items
- `.pib-res-meta` — small metadata line (who/when) under resolution note
- `.pib-check-item.done` opacity raised from 0.45 to 0.6 for better readability of resolution text

### No Supabase schema changes needed
`_cpSupaSave(clientNo)` serializes the full CLIENT_PENDING[clientNo] array as JSON, so the new fields (resolution, resolvedBy, resolvedAt) are included automatically.

---

## 49. Settings — Generic Integrations Panel (PM Tool) 🟡 Coded, needs manual setup (July 6, 2026)

### What changed
Added a generic "Integrations" card to Settings (admin only), modeled after a reference screenshot: tool name + description, a status badge (Not configured / ✓ Configured), an input to paste an API key, a masked-key display once saved, and a Remove Key button. Built as a reusable pattern — "PM Tool" is the first entry (`intg-pm_tool-*` DOM ids), more tools can be added the same way later.

### Why this needed a real backend
Unlike the GitHub Auto-Commit panel (token stored in `localStorage`, calls GitHub's API directly from the browser), this integration's data flow is the PM Tool **pushing** data into Sprout PYO Hub. A browser page can't receive an inbound webhook, and the key must never be readable from the client ("stored securely on the server, never shown in full"). That requires an actual server component — this app previously had none (pure static `index.html` + Supabase browser SDK).

### New backend: Vercel serverless functions (`/api/integrations/`)
| File | Method | Purpose |
|---|---|---|
| `api/_lib/supabaseAdmin.js` | — | Shared helper — calls Supabase's REST API directly with the `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). Not a route (underscore-prefixed folder). |
| `api/integrations/save.js` | POST | Upserts `{id, toolName, apiKey, configuredBy}` into `integrations`. Returns only `{status, last4}` — never the raw key. |
| `api/integrations/status.js` | GET `?id=` | Returns `{status, last4, configuredBy, configuredAt}` for display. |
| `api/integrations/remove.js` | POST | Deletes the row for `{id}`. |
| `api/integrations/webhook.js` | POST `?id=` | Receiving endpoint. Validates `Authorization: Bearer <key>` (or `x-api-key`) against the stored key, then logs the raw JSON payload into `integration_events`. **Field mapping into Clients/Implementation Projects is NOT implemented yet — this only logs.** |

Uses global `fetch` (Node 18+ runtime on Vercel) against Supabase PostgREST — no new npm dependency, no build step added.

### New Supabase tables — `PM_Tool_Integrations_Table.sql`
| Table | Purpose |
|---|---|
| `integrations` | `id, tool_name, api_key, key_last4, status, configured_by, configured_at, updated_at`. RLS enabled with **no** anon/authenticated policies — only the service-role key (server-side only) can read/write. |
| `integration_events` | Append-only log of pushed payloads (`integration_id, payload jsonb, received_at`). Same RLS lockout. |

### ⚠️ Manual setup required before this works
1. Run `PM_Tool_Integrations_Table.sql` in Supabase → SQL Editor.
2. In Vercel → Project Settings → Environment Variables, add `SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Project Settings → API → `service_role` key — **not** the anon key already baked into `index.html`). Redeploy after adding it.
3. Give the PM Tool the webhook URL shown in the UI (`{origin}/api/integrations/webhook?id=pm_tool`) and whatever key you paste into the "PM Tool" card, so it can authenticate its pushes.

### Frontend changes (`index.html`)
- New panel `#st-panel-integrations` in Settings (admin-only, same gating as GitHub panel), added right after `st-panel-github`.
- `renderSettings()` now calls `intgLoadStatus('pm_tool')` when admin.
- New JS: `intgWebhookUrl()`, `intgSetUI()`, `intgLoadStatus()`, `intgConnect()`, `intgRemove()`, `intgCopyWebhook()`.

### Not done yet (next steps)
- No UI to view logged `integration_events` payloads — they land in Supabase only.
- No mapping of pushed PM Tool data into `D[]` / Clients — webhook only logs.
- Only one integration ("PM Tool") wired up; framework supports adding more by repeating the card markup + calling `intgLoadStatus('<new-id>')`.

---

## 50. Settings — External API Access (issue keys for other tools to pull stats) 🟡 Coded, needs manual setup (July 6, 2026)

### What changed
Added the reverse of Section 49: instead of an external tool pushing data in, this lets **other tools pull live project stats out** of Sprout PYO Hub. New panel in Settings (admin only), modeled after a reference screenshot: an "Active Key(s)" count badge, the endpoint contract shown inline, a metrics checklist, a list of issued keys with a Revoke button each, and a "Generate New Key" form.

### Metrics exposed
Adapted from the reference (which used Customer Onboarding/Success + MRR — not applicable here) to fields that actually exist on `clients` (`service`, `remarks`):
| Metric | Definition |
|---|---|
| PYO — Active Projects | `service` contains "PYO" AND `remarks` not in (Live, Churned) |
| PYO — Live Projects | `service` contains "PYO" AND `remarks` = Live |
| Payroll Starter — Active Projects | `service` = "Payroll Starter" AND not Live/Churned |
| Payroll Starter — Live Projects | `service` = "Payroll Starter" AND `remarks` = Live |
| All Clients — Active Projects | any service, not Live/Churned |
| All Clients — Live Projects | any service, `remarks` = Live |

**Note (matches the reference behavior deliberately):** the endpoint always returns all six metrics regardless of which checkboxes are ticked. The checkboxes are a consent record for the admin ("what I told this consumer they could use"), not a server-side filter. If real per-key filtering is wanted later, `api/stats/summary.js` would need to read the key's stored `metrics` JSON and omit unchecked fields from the response.

### New backend
| File | Method | Purpose |
|---|---|---|
| `api/keys/generate.js` | POST `{label, metrics}` | Generates `sk-sprout-<48 hex chars>`, stores only its SHA-256 hash + 20-char prefix + label + metrics record. Returns the raw key **once** — it is never stored or returned again. |
| `api/keys/list.js` | GET | Returns active keys' `{id, label, prefix, createdAt, lastUsedAt}` — never the hash or raw key. |
| `api/keys/revoke.js` | POST `{id}` | Sets `status='revoked'` (soft delete, keeps history). |
| `api/stats/summary.js` | GET, header `X-Api-Key` | Public consumer-facing endpoint. Hashes the provided key, looks up an active match, computes the six metrics from `clients`, stamps `last_used_at`, returns JSON. |

### New Supabase table — `External_API_Keys_Table.sql`
`external_api_keys(id, label, key_hash UNIQUE, key_prefix, metrics jsonb, status, created_at, last_used_at)`. RLS enabled, no anon/authenticated policies — service-role only (same lockdown pattern as `integrations` in Section 49).

### ⚠️ Manual setup required
1. Run `External_API_Keys_Table.sql` in Supabase → SQL Editor.
2. Same `SUPABASE_SERVICE_ROLE_KEY` env var from Section 49 covers this too — no additional env var needed if that's already set.

### Frontend changes (`index.html`)
- New panel `#st-panel-extapi` in Settings, admin-only, placed after `st-panel-integrations`.
- `renderSettings()` now hides the one-time key-reveal box and calls `extapiLoadKeys()` when admin.
- New JS: `extapiMetricIds()`, `extapiSelectedMetrics()`, `extapiLoadKeys()`, `extapiRenderKeys()`, `extapiGenerate()`, `extapiCopyRevealed()`, `extapiRevoke()`.

### Not done yet (next steps)
- No usage/rate-limit dashboard beyond `last_used_at`.
- No expiry dates on keys (revoke is manual only).
- No actual response filtering by the metrics checkboxes (see note above).
