import { useState } from "react";
import { daysSinceRecon, reconStatus, todayISO } from "../lib/doseCalc.js";

// Tracks the ONE bacteriostatic water bottle currently in use. Peptide vials
// each track their own reconstitution date, but the water they're mixed from
// has its own beyond-use window once the stopper is punctured — a fresh vial
// mixed with month-old water isn't actually fresh.
//
// Default window is 28 days, the commonly cited beyond-use date for a
// preserved multi-dose vial after first puncture. Editable to anything.
//
// The date math is not new: daysSinceRecon and reconStatus in lib/doseCalc.js
// are already generic ("days since a date", "status against a window"), so this
// card reuses them rather than duplicating the logic. reconStatus warns at 80%
// of the window, which on 28 days means "Expiring soon" from day 23.

const STATUS_LABEL = { fresh: "Fresh", warning: "Expiring soon", expired: "Expired" };

export default function BacWaterCard({ bacWater, setBacWater }) {
  const [editingDate, setEditingDate] = useState(false);

  const punctureDate = bacWater?.punctureDate ?? null;
  const expiryDays = bacWater?.expiryDays ?? 28;

  const daysSince = daysSinceRecon(punctureDate);
  const status = reconStatus(daysSince, expiryDays);

  function set(changes) {
    setBacWater((prev) => ({ ...prev, ...changes }));
  }

  return (
    <div className="card bac-card">
      <div className="recon-label">Bacteriostatic water</div>

      {!punctureDate ? (
        <>
          <button
            className="link-button"
            style={{ color: "var(--accent)", paddingLeft: 0 }}
            onClick={() => set({ punctureDate: todayISO() })}
          >
            + Log puncture date
          </button>
          <p className="muted bac-hint">
            Log the day you first punctured the bottle. Default beyond-use
            window is {expiryDays} days.
          </p>
        </>
      ) : (
        <>
          <div className="recon-row">
            <span>{punctureDate}</span>
            <span className="muted">·</span>
            <span>Day {daysSince}</span>
            {status && (
              <span className={`recon-status recon-${status}`}>
                {STATUS_LABEL[status]}
              </span>
            )}
            {editingDate ? (
              <input
                className="recon-date-input"
                type="date"
                defaultValue={punctureDate}
                onChange={(e) => {
                  if (e.target.value) {
                    set({ punctureDate: e.target.value });
                    setEditingDate(false);
                  }
                }}
                onBlur={() => setEditingDate(false)}
                autoFocus
              />
            ) : (
              <button className="link-button" onClick={() => setEditingDate(true)}>
                Change date
              </button>
            )}
          </div>

          <div className="bac-row">
            <label className="bac-expiry-field">
              <span className="form-label">Expires after (days)</span>
              <input
                className="form-input bac-expiry-input"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={expiryDays}
                onChange={(e) => set({ expiryDays: Number(e.target.value) })}
              />
            </label>
            <button
              className="link-button bac-new-btn"
              onClick={() => set({ punctureDate: todayISO() })}
            >
              New bottle (reset to today)
            </button>
          </div>

          {status === "expired" && (
            <div className="today-recon-warn">
              This bottle is {daysSince} days old — past its {expiryDays}-day
              window. Don&apos;t reconstitute with it.
            </div>
          )}
          {status === "warning" && (
            <div className="today-recon-warn">
              This bottle is {daysSince} days old — {expiryDays}-day window,
              replace it soon.
            </div>
          )}
        </>
      )}
    </div>
  );
}
