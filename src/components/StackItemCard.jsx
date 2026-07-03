import { useState } from "react";
import { calcDraw, dayOfCycle, daysRemaining, daysSinceRecon, reconStatus } from "../lib/doseCalc.js";
import EditStackItemForm from "./EditStackItemForm.jsx";

function todayISO() {
  const d = new Date();
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

const STATUS_LABEL = { fresh: "Fresh", warning: "Expiring soon", expired: "Expired" };

// Displays one saved peptide in the stack: your dose, the units to draw, the
// timing/frequency you entered, how far into the cycle you are, and the recon tracker.
export default function StackItemCard({ item, onRemove, onUpdate }) {
  const draw = calcDraw({
    vialMg: item.vialMg,
    waterMl: item.waterMl,
    doseValue: item.doseValue,
    doseUnit: item.doseUnit,
  });

  const len = item.cycleLengthDays;
  const day = dayOfCycle(item.cycleStart);
  const remaining = daysRemaining(item.cycleStart, len);

  // Progress along the cycle, clamped to 0–100% for the bar width.
  const pct =
    day != null && len ? Math.max(0, Math.min(100, (day / len) * 100)) : 0;

  let cycleText = null;
  if (day != null && len) {
    if (remaining >= 0) {
      cycleText = `Day ${day} of ${len} — ${remaining} day${
        remaining === 1 ? "" : "s"
      } left`;
    } else {
      cycleText = `Cycle finished (${-remaining} day${
        -remaining === 1 ? "" : "s"
      } over)`;
    }
  }

  const [editingRecon, setEditingRecon] = useState(false);
  const [editing, setEditing] = useState(false);

  const daysSince = daysSinceRecon(item.reconDate);
  const status = reconStatus(daysSince, item.shelfLifeDays);

  const meta = [item.frequency, item.timing].filter(Boolean).join(" · ");

  // Editing changes only the protocol fields the form reports — id, reconDate,
  // and any logged dose/site history are never part of `changes`.
  function handleSave(changes) {
    if (Object.keys(changes).length > 0) onUpdate(item.id, changes);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card stack-item">
        <div className="stack-item-top">
          <div>
            <div className="stack-item-name">{item.name}</div>
            <div className="stack-item-category muted">{item.category}</div>
          </div>
        </div>
        <EditStackItemForm
          item={item}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="card stack-item">
      <div className="stack-item-top">
        <div>
          <div className="stack-item-name">{item.name}</div>
          <div className="stack-item-category muted">{item.category}</div>
        </div>
        <div className="stack-item-actions">
          <button className="link-button" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="link-button" onClick={() => onRemove(item.id)}>
            Remove
          </button>
        </div>
      </div>

      <div className="stack-item-dose">
        {item.doseValue} {item.doseUnit}
        {draw && (
          <>
            {" "}
            · draw <strong>{draw.units.toFixed(1)} units</strong> (
            {draw.volumeMl.toFixed(3)} mL)
          </>
        )}
      </div>

      {meta && <div className="stack-item-meta muted">{meta}</div>}

      {cycleText && (
        <div className="cycle">
          <div className="cycle-bar">
            <div className="cycle-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="cycle-text muted">{cycleText}</div>
        </div>
      )}

      {item.notes && <div className="stack-item-notes muted">{item.notes}</div>}

      <div className="recon">
        <div className="recon-label">Reconstitution</div>

        {!item.reconDate ? (
          <button
            className="link-button"
            style={{ color: "var(--accent)", paddingLeft: 0 }}
            onClick={() => onUpdate(item.id, { reconDate: todayISO() })}
          >
            + Log recon date
          </button>
        ) : (
          <div className="recon-row">
            <span>{item.reconDate}</span>
            <span className="muted">·</span>
            <span>Day {daysSince}</span>
            {status && (
              <span className={`recon-status recon-${status}`}>
                {STATUS_LABEL[status]}
              </span>
            )}
            {item.shelfLifeDays && (
              <span className="muted">
                (window: {item.shelfLifeDays} days)
              </span>
            )}
            {editingRecon ? (
              <input
                className="recon-date-input"
                type="date"
                defaultValue={item.reconDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdate(item.id, { reconDate: e.target.value });
                    setEditingRecon(false);
                  }
                }}
                onBlur={() => setEditingRecon(false)}
                autoFocus
              />
            ) : (
              <button
                className="link-button"
                onClick={() => setEditingRecon(true)}
              >
                Change date
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
