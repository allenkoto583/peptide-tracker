import { useState } from "react";
import { calcDraw } from "../lib/doseCalc.js";

const DAY_OPTS = [
  ["Sun", 0], ["Mon", 1], ["Tue", 2], ["Wed", 3],
  ["Thu", 4], ["Fri", 5], ["Sat", 6],
];

// Live draw panel — same markup/classes the add form uses.
function DrawResult({ draw }) {
  if (!draw) {
    return (
      <p className="form-hint muted">
        Enter vial mg, water mL, and your dose to see how much to draw.
      </p>
    );
  }
  return (
    <div className="calc-panel">
      <div className="calc-headline">
        Draw <strong>{draw.units.toFixed(1)} units</strong> on a U-100 syringe
      </div>
      <div className="calc-detail muted">
        ≈ {draw.volumeMl.toFixed(3)} mL · concentration{" "}
        {draw.concentration.toFixed(2)} mg/mL
      </div>
    </div>
  );
}

// Pull the current item values into an editable draft. Only the protocol fields
// listed here are editable; id, reconDate, and any logged history stay untouched
// because they're never part of the draft or the diff we hand back.
function draftFrom(item) {
  return {
    doseValue: item.doseValue ?? "",
    doseUnit: item.doseUnit ?? "mg",
    vialMg: item.vialMg ?? "",
    waterMl: item.waterMl ?? "",
    timing: item.timing ?? "",
    schedule: item.schedule ?? { type: "daily" },
    cycleStart: item.cycleStart ?? "",
    cycleLengthDays: item.cycleLengthDays ?? "",
    shelfLifeDays: item.shelfLifeDays ?? "",
    notes: item.notes ?? "",
  };
}

// Inline form for editing a stack item's protocol in place. Owns its own draft
// and only reports the fields that actually changed via onSave(changes).
export default function EditStackItemForm({ item, onSave, onCancel }) {
  const [fields, setFields] = useState(() => draftFrom(item));

  function set(name, value) {
    setFields((f) => ({ ...f, [name]: value }));
  }

  const draw = calcDraw({
    vialMg: Number(fields.vialMg),
    waterMl: Number(fields.waterMl),
    doseValue: Number(fields.doseValue),
    doseUnit: fields.doseUnit,
  });

  // Build a changes object containing only the fields that differ from the
  // saved item, so onUpdate merges nothing it doesn't need to.
  function buildChanges() {
    const changes = {};
    const numFields = ["doseValue", "vialMg", "waterMl", "cycleLengthDays", "shelfLifeDays"];
    for (const key of numFields) {
      if (Number(fields[key]) !== Number(item[key])) changes[key] = Number(fields[key]);
    }
    if (fields.doseUnit !== (item.doseUnit ?? "mg")) changes.doseUnit = fields.doseUnit;
    if (fields.timing !== (item.timing ?? "")) changes.timing = fields.timing;
    if (fields.cycleStart !== (item.cycleStart ?? "")) changes.cycleStart = fields.cycleStart;
    const notes = fields.notes.trim();
    if (notes !== (item.notes ?? "")) changes.notes = notes;
    if (JSON.stringify(fields.schedule) !== JSON.stringify(item.schedule ?? { type: "daily" })) {
      changes.schedule = fields.schedule;
    }
    return changes;
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(buildChanges());
  }

  return (
    <form className="stack-form stack-edit-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="form-field">
          <span className="form-label">Vial amount (mg)</span>
          <input
            className="form-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fields.vialMg}
            onChange={(e) => set("vialMg", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Bac. water (mL)</span>
          <input
            className="form-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fields.waterMl}
            onChange={(e) => set("waterMl", e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label className="form-field">
          <span className="form-label">Your dose</span>
          <input
            className="form-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={fields.doseValue}
            onChange={(e) => set("doseValue", e.target.value)}
          />
        </label>
        <label className="form-field form-field-narrow">
          <span className="form-label">Unit</span>
          <select
            className="form-input"
            value={fields.doseUnit}
            onChange={(e) => set("doseUnit", e.target.value)}
          >
            <option value="mg">mg</option>
            <option value="mcg">mcg</option>
          </select>
        </label>
      </div>

      <DrawResult draw={draw} />

      <label className="form-field">
        <span className="form-label">Timing</span>
        <input
          className="form-input"
          type="text"
          value={fields.timing}
          onChange={(e) => set("timing", e.target.value)}
        />
      </label>

      <label className="form-field">
        <span className="form-label">Schedule (used by Today dashboard)</span>
        <select
          className="form-input"
          value={fields.schedule?.type ?? "daily"}
          onChange={(e) => {
            const type = e.target.value;
            const next = { type };
            if (type === "weeklyDays")   next.days  = [];
            if (type === "timesPerWeek") next.count = 3;
            set("schedule", next);
          }}
        >
          <option value="daily">Daily</option>
          <option value="everyOtherDay">Every other day</option>
          <option value="weeklyDays">Specific days of the week</option>
          <option value="timesPerWeek">Times per week</option>
        </select>
      </label>

      {fields.schedule?.type === "weeklyDays" && (
        <div className="form-field">
          <span className="form-label">Days</span>
          <div className="schedule-days">
            {DAY_OPTS.map(([label, val]) => {
              const on = (fields.schedule.days ?? []).includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  className={`day-chip${on ? " day-chip-on" : ""}`}
                  onClick={() => {
                    const days = fields.schedule.days ?? [];
                    const next = on
                      ? days.filter((d) => d !== val)
                      : [...days, val];
                    set("schedule", { ...fields.schedule, days: next });
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {fields.schedule?.type === "timesPerWeek" && (
        <label className="form-field">
          <span className="form-label">Times per week (1–7)</span>
          <input
            className="form-input"
            type="number"
            inputMode="numeric"
            min="1"
            max="7"
            value={fields.schedule?.count ?? 3}
            onChange={(e) =>
              set("schedule", { ...fields.schedule, count: Number(e.target.value) })
            }
          />
        </label>
      )}

      <div className="form-row">
        <label className="form-field">
          <span className="form-label">Cycle length (days)</span>
          <input
            className="form-input"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={fields.cycleLengthDays}
            onChange={(e) => set("cycleLengthDays", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-label">Cycle start</span>
          <input
            className="form-input"
            type="date"
            value={fields.cycleStart}
            onChange={(e) => set("cycleStart", e.target.value)}
          />
        </label>
      </div>

      <label className="form-field">
        <span className="form-label">Shelf life (days)</span>
        <input
          className="form-input"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={fields.shelfLifeDays}
          onChange={(e) => set("shelfLifeDays", e.target.value)}
        />
      </label>

      <label className="form-field">
        <span className="form-label">Notes (optional)</span>
        <textarea
          className="form-input"
          rows="2"
          value={fields.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </label>

      <div className="stack-edit-actions">
        <button className="primary-button" type="submit">
          Save changes
        </button>
        <button
          className="link-button"
          type="button"
          style={{ color: "var(--text)" }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
