import { useState } from "react";
import { calcDraw, dayOfCycle, daysRemaining, daysSinceRecon, reconStatus } from "../lib/doseCalc.js";
import {
  cycleStatusOf,
  nextCycleDate,
  restDayOf,
  restDaysRemaining,
} from "../lib/scheduleCalc.js";
import EditStackItemForm from "./EditStackItemForm.jsx";

function todayISO() {
  const d = new Date();
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

// "2026-10-04" → "Oct 4". Parsed as parts so the local day never shifts.
function fmtShort(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const STATUS_LABEL = { fresh: "Fresh", warning: "Expiring soon", expired: "Expired" };

// Displays one saved peptide in the stack: your dose, the units to draw, the
// timing/frequency you entered, where you are in the on/off cycle, and the
// recon tracker.
export default function StackItemCard({ item, onRemove, onUpdate, onStartNextCycle }) {
  const draw = calcDraw({
    vialMg: item.vialMg,
    waterMl: item.waterMl,
    doseValue: item.doseValue,
    doseUnit: item.doseUnit,
  });

  const status = cycleStatusOf(item);
  const len = Number(item.cycleLengthDays) || 0;
  const restDays = Number(item.restDays) || 0;
  const day = dayOfCycle(item.cycleStart);
  const remaining = daysRemaining(item.cycleStart, len);
  const restDay = restDayOf(item);
  const cycleNo = item.cycleNumber ?? 1;

  // Two-phase progress bar: the track spans the whole on+off block, so the
  // "on" segment takes len/(len+restDays) of the width and the rest segment
  // takes the remainder. Each fills independently as its phase progresses.
  const twoPhase = !item.continuous && len > 0 && restDays > 0;
  const totalDays = twoPhase ? len + restDays : len;
  const onSegPct = totalDays ? (len / totalDays) * 100 : 0;
  const restSegPct = 100 - onSegPct;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const onFillPct = (len && day != null ? clamp01(day / len) : 0) * onSegPct;
  const restFillPct =
    (restDays && restDay != null ? clamp01(restDay / restDays) : 0) * restSegPct;

  let cycleText = null;
  if (item.continuous) {
    cycleText = "Running continuously — no cycle or rest period";
  } else if (status === "upcoming") {
    cycleText = `Cycle ${cycleNo} · starts ${fmtShort(item.cycleStart)}`;
  } else if (status === "resting") {
    const next = fmtShort(nextCycleDate(item));
    const left = restDaysRemaining(item);
    cycleText =
      `Cycle ${cycleNo} · Rest day ${restDay} of ${restDays}` +
      (left != null ? ` — ${left} day${left === 1 ? "" : "s"} left` : "") +
      (next ? `, next cycle ${next}` : "");
  } else if (status === "complete") {
    cycleText =
      restDays > 0
        ? `Cycle ${cycleNo} · Rest complete — ready to start the next cycle`
        : `Cycle ${cycleNo} · Cycle finished (${-remaining} day${
            -remaining === 1 ? "" : "s"
          } over)`;
  } else if (day != null && len) {
    cycleText =
      `Cycle ${cycleNo} · Day ${day} of ${len}` +
      (remaining >= 0
        ? ` — ${remaining} day${remaining === 1 ? "" : "s"} left`
        : "");
  }

  const canRestart = status === "resting" || status === "complete";

  const [editingRecon, setEditingRecon] = useState(false);
  const [editing, setEditing] = useState(false);

  const daysSince = daysSinceRecon(item.reconDate);
  const reconState = reconStatus(daysSince, item.shelfLifeDays);

  const meta = [item.frequency, item.timing].filter(Boolean).join(" · ");

  // Editing changes only the protocol fields the form reports — id, reconDate,
  // cycleNumber, and any logged dose/site history are never part of `changes`.
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
          {!item.continuous && len > 0 && (
            <div className={`cycle-bar${twoPhase ? " cycle-bar-2phase" : ""}`}>
              <div className="cycle-fill" style={{ width: `${onFillPct}%` }} />
              {twoPhase && (
                <div
                  className="cycle-fill-rest"
                  style={{ width: `${restFillPct}%` }}
                />
              )}
            </div>
          )}
          <div className="cycle-text muted">{cycleText}</div>
          {canRestart && (
            <button
              className="primary-button cycle-restart-btn"
              onClick={() => onStartNextCycle(item)}
            >
              {status === "resting" ? "Start next cycle early" : "Start next cycle"}
            </button>
          )}
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
            {reconState && (
              <span className={`recon-status recon-${reconState}`}>
                {STATUS_LABEL[reconState]}
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
