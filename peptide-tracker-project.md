# Project: Personal Peptide Tracker (mobile app)

## About me and how I want to work

This is my first time ever using Claude Code, so please walk me through *everything* step by step. Assume I don't know the terminology. Whenever you run a command, tell me what it does and why. Before any big change, briefly explain what you're about to do and check in with me. If I have to install something or make a choice (a framework, a tool, etc.), explain the options in plain language and recommend one. Teach me as we go — I'd rather understand it than just have it work.

## What this is

A peptide-tracking app for my own personal use. I am **not** selling this and not publishing it commercially. It only needs to work for me, on my **iPhone**. I do not want to deal with the App Store unless it's truly the only option — a web app I can "Add to Home Screen" so it looks and feels like a real app is totally fine and preferred. Recommend the simplest path that gets a real app-like experience on my iPhone without a Mac, Xcode, or developer fees. Note that I'm on iOS, so keep iOS limitations in mind (especially around notifications) and tell me what works and what doesn't.

## Core features (in priority order)

### 1. Peptide library (searchable)

A reference database of peptides. I want to search via a search bar and pick from a dropdown. Each peptide entry should hold reference info: what it is / general purpose, common reconstitution and storage practices, typical dosing *ranges*, common timing, frequency, and typical cycle-length ranges — all clearly labeled as general reference information with sources where possible, not prescriptive medical advice. Start with a curated starter set (including the ones I currently run — retatrutide, CJC-1295/Ipamorelin, MOTS-c, BPC-157/TB-500), and make it easy to add new peptides later, either by hand or by having you research one on request and add it.

### 2. My Stack

Let me add a peptide from the library into a saved list called my "Stack." When I add it, I enter *my* actual protocol — my dose, timing, frequency, and cycle length. The library ranges can pre-fill as a starting point, but my entered values are what the app tracks. The Stack should clearly show, for each peptide, when I'm supposed to take it and how far into the cycle I am.

### 3. Schedule / reminders

Based on my Stack, show me what to take and when, and tell me how many days I have left on each cycle (e.g., "Day 18 of a 30-day cycle"). Reminders/notifications would be a bonus if feasible on iPhone — since iOS limits web-app notifications, if full notifications aren't reliable, a clear in-app "today" dashboard is fine.

### 4. Reconstitution tracker

This is important. When I reconstitute a vial, I log the date. The app then shows how many days it's been since reconstitution and warns me as it approaches or passes its beyond-use window, so I know if a vial may have gone bad. Let me set the shelf-life per peptide (with a sensible default and a reference note) since it varies by compound and by storage (fridge vs. freezer).

### 5. Injection-site rotation (body panel)

I want a visual body panel where I log where I last injected so I don't reuse a spot too soon. The rule: **the same site should not be reused for at least 5 days, ideally 7.** When I log an injection, I tap the site on the panel; the app records the date and then visually flags that site as "resting" until enough days have passed (color-code it — e.g., red = too soon, yellow = getting close, green = clear to use). It should also suggest which site is "most rested" next.

The sites are subcutaneous spots on my abdomen/flank, arranged as **left and right pairs across four rows**:

- **Row 1 – Lower abdomen:** left and right
- **Row 2 – Mid (between lower abdomen and love handles):** left and right
- **Row 3 – Love handles:** left and right
- **Row 4 – Upper (above the mid zone):** left and right

So eight sites total (4 rows × left/right). Show them on a simple front-of-body diagram I can tap, each with its own "last injected" date and rest-timer.

**Frequency check:** With only 8 sites and a 7-day rest rule, daily injections cycle through every site in about 8 days — and adding a second daily injection will outpace the available rested sites. The app should warn me when my injection frequency is too high for the number of rested sites available, so I'm not forced to reuse a site too soon.

### 6. Data persistence

All my data saves on my device and survives closing/reopening the app. Keep my health data private and local — no accounts or cloud unless I ask.

## Constraints / notes

- Personal use only, not for distribution.
- iPhone / iOS is the only target device.
- Include a clear disclaimer that the app is a personal tracking tool and reference info is general, not medical advice.
- Build it iteratively: get a basic working version on my iPhone first, then add features. Explain each milestone.

---

# Build log & decisions (kept up to date)

_Last updated: June 30, 2026 (dose logging + stack editing)_

## Decisions locked in

- **Tech stack:** React + Vite. (Chosen over a single-file app so the six features stay organized and maintainable.)
- **How it gets on the iPhone:** deploy to **GitHub Pages** (free, I already have a GitHub account), open in Safari, "Add to Home Screen." Public code is fine; only my health *data* must stay local on the device.
- **Data persistence:** must request **persistent storage** and run as an installed Home Screen app, because iOS Safari otherwise wipes local web-app data after ~7 days of non-use.
- **Syringes:** U-100 insulin syringes (100 units = 1 mL).
- **Dose calculator:** the app does the math — I enter vial mg + bacteriostatic water mL + target dose, and it tells me the units to draw. (The reference data is structured with numeric vial/dose fields to support this.)
- **Blends:** multi-ingredient blends (GLOW, KLOW, Tesamorelin/Ipamorelin, GHK-Cu/KPV) are flagged `isBlend: true` so the calculator can handle them by volume instead of treating them as a single compound.

## How I'm working

- I drive **Claude Code** in the VS Code terminal (hands-on practice); Claude in **Cowork** acts as coach/planner/reviewer and hands me copy-paste prompts.
- Default model: **Sonnet** (both Cowork and Claude Code). Use Opus only for genuinely hard problems (stubborn bugs, tricky design, big refactors), then switch back.

## Progress

- [x] **Environment:** Node v24 / npm 11 installed.
- [x] **Project scaffolded:** React + Vite app created, runs locally via `npm run dev` (http://localhost:5173).
- [x] **Feature 1 — Searchable peptide library:** built and the reference data accuracy-reviewed. Components in `src/components/` (SearchBar, PeptideList, PeptideDetail), screen in `src/screens/LibraryScreen.jsx`, data in `src/data/peptides.js`. Search matches name/category/aliases; detail view shows reference fields, sources, and a "not medical advice" banner.
  - Library contents (~14 entries): Retatrutide, CJC-1295/Ipamorelin, MOTS-c, BPC-157/TB-500, Tesamorelin, Semaglutide, GHK-Cu, plus blends GLOW, KLOW, Tesamorelin/Ipamorelin, GHK-Cu/KPV, and Glutathione, Epithalon, NAD+.
  - Data corrections made during review: MOTS-c dose clarified as a weekly total (~5 mg/injection), Tesamorelin reconstituted shelf-life softened to match label guidance.
- [x] **Feature 2 — My Stack + reconstitution-to-units calculator:** built. Bottom tab nav (Library / My Stack) added in `App.jsx`. Stack screen in `src/screens/StackScreen.jsx`; add flow in `src/components/AddToStackForm.jsx` (picks a peptide, pre-fills from library, edit to your own protocol, with a live dose calculator); saved items shown by `src/components/StackItemCard.jsx` with a cycle-progress bar ("Day X of N").
  - Dose math lives in `src/lib/doseCalc.js` (pure functions): concentration = vial mg ÷ water mL; draw volume = dose ÷ concentration; units = volume × 100 (U-100 syringe). Converts mcg→mg. Cycle helpers (`dayOfCycle`, `daysRemaining`) parse dates in local time to avoid timezone day-shift.
  - Persistence: `src/hooks/useLocalStorageState.js` saves the stack to localStorage under the `peptide:` namespace, so it survives closing/reopening.
- [x] **Feature 3 — Reconstitution tracker:** built as a section on each stack item card (`src/components/StackItemCard.jsx`). "Log recon date" button stamps today; thereafter shows date, days elapsed, and a color-coded badge (green = fresh, yellow = expiring soon ≥80% of window, red = expired). "Change date" reveals an inline date picker. Shelf-life window stored on each stack item (`shelfLifeDays`) pulled from library data at add-time. New helpers `daysSinceRecon` and `reconStatus` added to `src/lib/doseCalc.js`.
- [x] **Feature 4 — Injection-site rotation body panel:** built as a new **Sites** tab (`src/screens/SitesScreen.jsx`). Default 12 sites across a **Front/Back view toggle** — front: Upper, Love handles, Mid, Lower abdomen (× left/right); back: Glutes and Upper thighs (× left/right) — rendered as color-coded circles overlaid on the body illustration. Green = clear (7+ days or never used), yellow = almost (5–6 days), red = rest (<5 days). Day count shown inside each circle. Tap to log; re-tapping an already-logged site shows a confirmation card before updating. Banner shows the most-rested site. Warning appears automatically when ≤2 sites are clear. Color legend below the diagram.
  - **SVG body:** separate front and back body illustrations, viewBox `0 0 200 480`. Circles use a small visible radius with a larger invisible tap target so the diagram doesn't feel cluttered.
  - **Edit mode** (Edit / Done button in top-right): circles get dashed borders to signal they're moveable. Drag any circle to reposition it on the body. Tap a circle (short tap, no drag movement) to open an edit popover for that site — shows a live-editable name field and a "Delete this site" button (with inline confirm step before deleting). Red × badge on each circle resets that site's date to null (turns it green/clear). Touch-action disabled during edit so dragging doesn't scroll the page.
  - **+ New site** button appears in edit mode toolbar — drops a new circle at the center of the body and immediately opens its popover for naming, then the user drags it into position.
  - **Data model:** site configuration (id, label, x/y position, and front/back `view`) all stored together in one array in `peptide:site-list`. Injection dates stored separately in `peptide:sites` as `{ [id]: "yyyy-mm-dd" }`. A one-time migration tags older saved sites with `view:"front"` and adds the back-view sites so existing data upgrades cleanly. Everything else is in site-list so add/rename/delete/move all touch one place.

- [x] **Feature 5 — Daily "Today" dashboard:** built as the default landing tab (`src/screens/TodayScreen.jsx`). Sorts the stack into Due Today, Not Due Today, Cycle Complete, and Upcoming. Each due dose is a card showing dose + units to draw (U-100), timing, schedule label, Day X of N with days remaining, and a color-coded reconstitution status/warning. Schedule logic in `src/lib/scheduleCalc.js` (`isDueToday`, `cycleStatusOf`, `scheduleLabel`) supports schedule types daily / everyOtherDay / weeklyDays / timesPerWeek. Stack items gained a structured `schedule` field with a one-time migration defaulting old items to daily. Notifications intentionally deferred (iOS limits) — the dashboard is the reliable "today" view.

- [x] **Enhancement — Dose logging:** a "Log dose" button on each due Today card starts a logging flow. App.jsx owns an ephemeral `logTarget` and switches to the Sites tab in logging mode; a banner ("Logging {name} — tap the site where you injected") appears, and tapping a site stamps that site with today's date AND appends an entry to a new `peptide:doses` store, then returns to Today. Once logged, the Today card shows a green "Logged today" badge with an Undo. Doses live in a `peptide:doses` array of `{ id, stackItemId, date, siteId }`.
  - **Bug fixed during this step:** site "last injected" dates (`peptide:sites`) used to live inside SitesScreen, so logging-then-navigating unmounted the screen before its save ran and the site never turned red. Fixed by lifting the `sites` dates store up to App.jsx (always mounted), passed into SitesScreen as props — matching how `doses` is handled.
- [x] **Enhancement — In-place protocol editing:** each Stack card has an Edit button opening an inline form pre-filled with current values (dose, vial mg, water mL, timing, schedule, cycle, shelf-life, notes). Saving applies only changed fields via the existing `updateItem(id, changes)`; the item id, reconstitution date, and logged history are preserved. Lets you bump a dose mid-cycle (e.g. 2 mg → 4 mg) with draw-units recomputing automatically.

## Remaining milestones (in order)

1. **Polish** — PWA manifest + icons, persistent storage prompt, disclaimer banner ← next
2. **Deploy to iPhone** via GitHub Pages, then end-to-end verification on Safari / Home Screen

## How to resume a session

1. Open the "Peptide App" folder in VS Code.
2. To preview locally: open a terminal and run `npm run dev`, then open the localhost link.
3. To build: open a second terminal and run `claude`.
4. In a new Cowork chat (Sonnet), say "continue the peptide app — Features 1–5 plus dose logging and in-place stack editing are all done. Next is Polish (PWA manifest/icons, persistent storage, disclaimer), then deploy to iPhone via GitHub Pages."
