// ---------------------------------------------------------------------------
// Dose & cycle math
// ---------------------------------------------------------------------------
//
// Pure functions only — no React, no side effects. Keeping the math in one
// small file means it's easy to read, trust, and reuse later (the schedule
// screen in Feature 5 will use the same cycle helpers).
//
// The injection assumption is a U-100 insulin syringe: 100 units = 1 mL.
// ---------------------------------------------------------------------------

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Convert any dose to milligrams so the rest of the math has one unit.
export function toMg(value, unit) {
  if (unit === "mcg") return value / 1000;
  return value; // already mg
}

// After reconstitution, how concentrated is the solution? (mg per mL)
export function concentrationMgPerMl(vialMg, waterMl) {
  if (!vialMg || !waterMl) return 0;
  return vialMg / waterMl;
}

// The core calculator: given the vial, the water added, and your target dose,
// work out how much liquid to draw and how many syringe units that is.
// Returns null if there isn't enough info to compute (e.g. 0 mL water).
export function calcDraw({ vialMg, waterMl, doseValue, doseUnit }) {
  const concentration = concentrationMgPerMl(vialMg, waterMl); // mg/mL
  if (!concentration || !doseValue) return null;

  const doseMg = toMg(doseValue, doseUnit);
  const volumeMl = doseMg / concentration; // how much liquid holds that dose
  const units = volumeMl * 100; // U-100 syringe: 100 units per mL

  if (!isFinite(units)) return null;
  return { concentration, doseMg, volumeMl, units };
}

// ----- Cycle helpers --------------------------------------------------------

// Build a local-time Date at midnight from a "yyyy-mm-dd" string. Parsing the
// string directly would treat it as UTC and could shift the day by one,
// depending on the time zone — so we split it into parts ourselves.
function parseLocalDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Strip the time off a Date, keeping only the local calendar day.
function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Which day of the cycle is it? The start date counts as Day 1.
export function dayOfCycle(startISO, today = new Date()) {
  if (!startISO) return null;
  const start = parseLocalDate(startISO);
  const now = startOfLocalDay(today);
  const diffDays = Math.round((now - start) / MS_PER_DAY);
  return diffDays + 1;
}

// How many days are left in the cycle? Negative means the cycle is over.
export function daysRemaining(startISO, cycleLengthDays, today = new Date()) {
  const day = dayOfCycle(startISO, today);
  if (day == null || !cycleLengthDays) return null;
  return cycleLengthDays - day;
}

// ----- Dose-log helpers -----------------------------------------------------

// Today as a local "yyyy-mm-dd" string (matches the format used for site and
// dose dates). Shifting by the timezone offset before slicing keeps the day
// correct in every zone, the same trick parseLocalDate uses in reverse.
export function todayISO(today = new Date()) {
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

// Has this stack item already been logged on the given local day?
export function isLoggedToday(doses, stackItemId, today) {
  return doses.some((d) => d.stackItemId === stackItemId && d.date === today);
}

// ----- Reconstitution helpers -----------------------------------------------

// Days elapsed since a reconstitution date (null if no date set).
export function daysSinceRecon(reconDateISO, today = new Date()) {
  if (!reconDateISO) return null;
  const [y, m, d] = reconDateISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((now - start) / (1000 * 60 * 60 * 24));
}

// "fresh" | "warning" | "expired" — thresholds: warn at 80% of shelf life.
export function reconStatus(daysSince, shelfLifeDays) {
  if (daysSince == null || !shelfLifeDays) return null;
  if (daysSince > shelfLifeDays) return "expired";
  if (daysSince >= shelfLifeDays * 0.8) return "warning";
  return "fresh";
}
