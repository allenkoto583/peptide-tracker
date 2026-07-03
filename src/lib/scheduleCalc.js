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
// ---------------------------------------------------------------------------

import { dayOfCycle, daysRemaining } from "./doseCalc.js";

// "upcoming" | "active" | "complete"
export function cycleStatusOf(item, today = new Date()) {
  const day = dayOfCycle(item.cycleStart, today);
  if (day == null) return "active"; // no start date → treat as always active
  if (day < 1) return "upcoming";
  const rem = daysRemaining(item.cycleStart, item.cycleLengthDays, today);
  if (rem != null && rem < 0) return "complete";
  return "active";
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
