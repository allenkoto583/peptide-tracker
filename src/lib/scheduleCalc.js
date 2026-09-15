// ---------------------------------------------------------------------------
// Schedule logic — pure functions, no React, no side effects
// ---------------------------------------------------------------------------
//
// A stack item's `schedule` field controls which days it's due:
//   { type: "daily" }
//   { type: "everyOtherDay" }
//   { type: "weeklyDays", days: [1,4] }   // 0=Sun … 6=Sat (calendar days)
//   { type: "timesPerWeek", count: 2 }    // evenly spread across each 7-day
//                                         // window of the cycle
//
// Two other fields on a stack item shape the on/off cycle:
//   continuous  boolean  true = never cycles; always active, never rests
//   restDays    number   days off after the "on" block finishes (0 = none)
// ---------------------------------------------------------------------------

import { dayOfCycle, daysRemaining } from "./doseCalc.js";

// "upcoming" | "active" | "resting" | "complete"
//
// "resting" is the off phase of a cycle — the on block is done but the rest
// period hasn't finished yet. Once rest is over the item becomes "complete",
// which now reads as "ready to start the next cycle".
//
// Items with no restDays skip "resting" entirely and behave exactly as they
// did before off-cycle tracking existed.
export function cycleStatusOf(item, today = new Date()) {
  // Continuously-run compounds (the GLP-1s) never cycle or rest.
  if (item.continuous) return "active";

  const day = dayOfCycle(item.cycleStart, today);
  if (day == null) return "active"; // no start date → treat as always active
  if (day < 1) return "upcoming";

  const rem = daysRemaining(item.cycleStart, item.cycleLengthDays, today);
  if (rem == null || rem >= 0) return "active"; // day 60 of 60 is still active

  const restDay = restDayOf(item, today);
  const restDays = Number(item.restDays) || 0;
  if (restDays > 0 && restDay != null && restDay <= restDays) return "resting";
  return "complete";
}

// ----- Rest-phase helpers ---------------------------------------------------

// Which day of the rest period is it? The first day after the cycle ends is
// rest day 1. Returns null before the on-block is over (or with no dates).
export function restDayOf(item, today = new Date()) {
  const day = dayOfCycle(item.cycleStart, today);
  if (day == null || !item.cycleLengthDays) return null;
  const restDay = day - item.cycleLengthDays;
  return restDay > 0 ? restDay : null;
}

// How many rest days are left? 0 means rest finishes today.
export function restDaysRemaining(item, today = new Date()) {
  const restDay = restDayOf(item, today);
  const restDays = Number(item.restDays) || 0;
  if (restDay == null || !restDays) return null;
  return Math.max(0, restDays - restDay);
}

// The calendar date the next cycle can start: cycleStart + onDays + restDays.
// Returned as a local "yyyy-mm-dd" string, or null if it can't be worked out.
export function nextCycleDate(item) {
  if (!item.cycleStart || !item.cycleLengthDays) return null;
  const restDays = Number(item.restDays) || 0;
  const [y, m, d] = item.cycleStart.split("-").map(Number);
  // cycleStart is day 1, so the day after the whole on+off block is
  // start + onDays + restDays.
  const next = new Date(y, m - 1, d + item.cycleLengthDays + restDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

// Is today an injection day for this item?
// Only call this when cycleStatusOf === "active".
export function isDueToday(item, today = new Date()) {
  const schedule = item.schedule ?? { type: "daily" };
  switch (schedule.type) {
    case "daily":
      return true;

    case "everyOtherDay": {
      const day = dayOfCycle(item.cycleStart, today);
      // Day 1, 3, 5 … are "on" days
      return day != null && (day - 1) % 2 === 0;
    }

    case "weeklyDays": {
      const dow = today.getDay(); // 0=Sun … 6=Sat
      return (schedule.days ?? []).includes(dow);
    }

    case "timesPerWeek": {
      const n = Math.max(1, Math.min(7, schedule.count ?? 1));
      const day = dayOfCycle(item.cycleStart, today);
      if (day == null) return false;
      const posInWeek = (day - 1) % 7; // 0–6 position within current week
      // Spread n slots evenly across a 7-day window
      const slots = Array.from({ length: n }, (_, i) => Math.round((i * 7) / n));
      return slots.includes(posInWeek);
    }

    default:
      return true;
  }
}

// Short, human-readable string describing the schedule
export function scheduleLabel(schedule) {
  if (!schedule) return "Daily";
  switch (schedule.type) {
    case "daily":       return "Daily";
    case "everyOtherDay": return "Every other day";
    case "weeklyDays": {
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days  = (schedule.days ?? []).slice().sort((a, b) => a - b).map((d) => names[d]);
      return days.length ? days.join("/") : "No days set";
    }
    case "timesPerWeek":
      return `${schedule.count ?? 1}× per week`;
    default:
      return "Daily";
  }
}
