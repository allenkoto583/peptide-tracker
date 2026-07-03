import { useState } from "react";
import { calcDraw } from "../lib/doseCalc.js";

// A unique id for each saved stack item (so React lists and "remove" work).
function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Today as "yyyy-mm-dd" in local time, ready for an <input type="date">.
function todayISO() {
  const d = new Date();
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

// Pull a peptide's library values in as starting points for the form.
function defaultsFor(p) {
  return {
    vialMg: p.vial?.typicalMg ?? "",
    waterMl: p.vial?.reconMl ?? "",
    doseValue: p.dose?.min ?? "",
    doseUnit: p.dose?.unit ?? "mg",
    timing: p.timing ?? "",
    frequency: p.frequency ?? "",
    cycleLengthDays: 30,
    cycleStart: todayISO(),
    notes: "",
    schedule: { type: "daily" },
  };
}

const DAY_OPTS = [
  ["Sun", 0], ["Mon", 1], ["Tue", 2], ["Wed", 3],
  ["Thu", 4], ["Fri", 5], ["Sat", 6],
];

// Small panel that shows the live calculator result as you type.
function DrawResult({ draw, isBlend }) {
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
      {isBlend && (
        <div className="calc-note muted">
          This is a blend — the dose is the total blend volume; the components
          stay in their fixed vial ratio.
        </div>
      )}
    </div>
  );
}

// The full "add a peptide to my stack" form. It owns its own draft state and
// only hands a finished item up to the parent via onAdd when you submit.
export default function AddToStackForm({ peptides, onAdd, onCancel }) {
  const [peptideId, setPeptideId] = useState("");
  const [fields, setFields] = useState(null);

  const selected = peptides.find((p) => p.id === peptideId) || null;

  function choosePeptide(id) {
    setPeptideId(id);
    const p = peptides.find((x) => x.id === id);
    setFields(p ? defaultsFor(p) : null);
  }

  // Update a single field by name (works for every input below).
  function set(name, value) {
    setFields((f) => ({ ...f, [name]: value }));
  }

  // Recompute the draw on every render so it stays in sync with the inputs.
  const draw =
    fields &&
    calcDraw({
      vialMg: Number(fields.vialMg),
      waterMl: Number(fields.waterMl),
      doseValue: Number(fields.doseValue),
      doseUnit: fields.doseUnit,
    });

  function handleSubmit(e) {
    e.preventDefault();
    if (!selected || !fields) return;
    onAdd({
      id: newId(),
      peptideId: selected.id,
      name: selected.name,
      category: selected.category,
      isBlend: !!selected.isBlend,
      vialMg: Number(fields.vialMg),
      waterMl: Number(fields.waterMl),
      doseValue: Number(fields.doseValue),
      doseUnit: fields.doseUnit,
      timing: fields.timing,
      frequency: fields.frequency,
      cycleLengthDays: Number(fields.cycleLengthDays),
      cycleStart: fields.cycleStart,
      notes: fields.notes.trim(),
      schedule: fields.schedule ?? { type: "daily" },
      shelfLifeDays: selected.shelfLife?.reconstitutedFridgeDays ?? 28,
      reconDate: null,
    });
  }

  return (
    <div>
      <button className="back-button" onClick={onCancel}>
        ← Cancel
      </button>

      <form className="card stack-form" onSubmit={handleSubmit}>
        <h2>Add to my stack</h2>

        <label className="form-field">
          <span className="form-label">Peptide</span>
          <select
            className="form-input"
            value={peptideId}
            onChange={(e) => choosePeptide(e.target.value)}
          >
            <option value="">Choose a peptide…</option>
            {peptides.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {selected && fields && (
          <>
            <p className="form-hint muted">
              Fields are pre-filled from the library as a starting point — edit
              them to match <em>your</em> actual protocol.
            </p>

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

            <DrawResult draw={draw} isBlend={selected.isBlend} />

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
              <span className="form-label">Frequency (display label)</span>
              <input
                className="form-input"
                type="text"
                value={fields.frequency}
                onChange={(e) => set("frequency", e.target.value)}
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
              <span className="form-label">Notes (optional)</span>
              <textarea
                className="form-input"
                rows="2"
                value={fields.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>

            <button className="primary-button full" type="submit">
              Add to stack
            </button>
          </>
        )}
      </form>
    </div>
  );
}
