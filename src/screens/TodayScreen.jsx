import { useEffect, useRef } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState.js";
import {
  calcDraw,
  dayOfCycle,
  daysRemaining,
  daysSinceRecon,
  isLoggedToday,
  reconStatus,
  todayISO,
} from "../lib/doseCalc.js";
import { cycleStatusOf, isDueToday, scheduleLabel } from "../lib/scheduleCalc.js";

const STATUS_LABEL = { fresh: "Fresh", warning: "Expiring soon", expired: "Expired" };

function timingPriority(timing) {
  const t = (timing || "").toLowerCase();
  if (/\bam\b|morning|fasted/.test(t)) return 0;
  if (/\bpm\b|afternoon|midday|noon/.test(t)) return 1;
  if (/evening/.test(t)) return 2;
  if (/night|bedtime|bed|sleep/.test(t)) return 3;
  if (!timing) return 5;
  return 4;
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function TodayScreen({ doses, setDoses, onStartLog }) {
  const [stack, setStack] = useLocalStorageState("stack", []);

  // One-time migration: tag pre-schedule items as "daily"
  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    migrated.current = true;
    if (stack.some((it) => !it.schedule)) {
      setStack((prev) =>
        prev.map((it) =>
          it.schedule ? it : { ...it, schedule: { type: "daily" } }
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stack.length === 0) {
    return (
      <div>
        <p className="today-date muted">{todayLabel()}</p>
        <div className="card today-empty">
          <p style={{ margin: "0 0 8px" }}>Your stack is empty.</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Add peptides in <strong>My Stack</strong> to see today&apos;s
            schedule here.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dueToday = [];
  const onBreak  = [];
  const complete = [];
  const upcoming = [];

  for (const item of stack) {
    const status = cycleStatusOf(item, today);
    if (status === "complete") { complete.push(item); continue; }
    if (status === "upcoming") { upcoming.push(item); continue; }
    if (isDueToday(item, today)) {
      dueToday.push(item);
    } else {
      onBreak.push(item);
    }
  }

  dueToday.sort((a, b) => timingPriority(a.timing) - timingPriority(b.timing));

  return (
    <div>
      <p className="today-date muted">{todayLabel()}</p>

      {dueToday.length === 0 && onBreak.length === 0 && (
        <div className="card today-empty">
          <p className="muted" style={{ margin: 0 }}>
            {complete.length > 0 && upcoming.length === 0
              ? "All cycles in your stack are complete."
              : "Nothing scheduled for today."}
          </p>
        </div>
      )}

      {dueToday.length > 0 && (
        <section className="today-section">
          <h2 className="today-section-title">
            Today &mdash; {dueToday.length} dose{dueToday.length === 1 ? "" : "s"}
          </h2>
          <div className="today-list">
            {dueToday.map((item) => (
              <TodayCard
                key={item.id}
                item={item}
                today={today}
                doses={doses}
                setDoses={setDoses}
                onStartLog={onStartLog}
              />
            ))}
          </div>
        </section>
      )}

      {onBreak.length > 0 && (
        <section className="today-section">
          <h2 className="today-section-title muted">Not Due Today</h2>
          <div className="today-inactive">
            {onBreak.map((item) => {
              const day = dayOfCycle(item.cycleStart, today);
              const rem = daysRemaining(item.cycleStart, item.cycleLengthDays, today);
              return (
                <div key={item.id} className="today-inactive-item">
                  <span className="today-inactive-name">{item.name}</span>
                  <span className="muted">
                    {" — "}
                    {scheduleLabel(item.schedule)}
                    {day != null && rem != null && `, Day ${day} of ${item.cycleLengthDays}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {complete.length > 0 && (
        <section className="today-section">
          <h2 className="today-section-title muted">Cycle Complete</h2>
          <div className="today-inactive">
            {complete.map((item) => {
              const day    = dayOfCycle(item.cycleStart, today);
              const overBy = day != null && item.cycleLengthDays
                ? day - item.cycleLengthDays
                : null;
              return (
                <div key={item.id} className="today-inactive-item">
                  <span className="today-inactive-name">{item.name}</span>
                  <span className="muted">
                    {overBy != null
                      ? ` — ended ${overBy} day${overBy === 1 ? "" : "s"} ago`
                      : " — cycle complete"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="today-section">
          <h2 className="today-section-title muted">Upcoming</h2>
          <div className="today-inactive">
            {upcoming.map((item) => {
              const day      = dayOfCycle(item.cycleStart, today); // ≤ 0
              const startsIn = day != null ? 1 - day : null;
              return (
                <div key={item.id} className="today-inactive-item">
                  <span className="today-inactive-name">{item.name}</span>
                  <span className="muted">
                    {startsIn != null
                      ? ` — starts in ${startsIn} day${startsIn === 1 ? "" : "s"} (${item.cycleStart})`
                      : " — upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function TodayCard({ item, today, doses, setDoses, onStartLog }) {
  const todayStr = todayISO(today);
  const logged = isLoggedToday(doses, item.id, todayStr);

  function undo() {
    setDoses((prev) =>
      prev.filter((d) => !(d.stackItemId === item.id && d.date === todayStr))
    );
  }

  const draw = calcDraw({
    vialMg:    item.vialMg,
    waterMl:   item.waterMl,
    doseValue: item.doseValue,
    doseUnit:  item.doseUnit,
  });

  const day       = dayOfCycle(item.cycleStart, today);
  const remaining = daysRemaining(item.cycleStart, item.cycleLengthDays, today);
  const daysSince = daysSinceRecon(item.reconDate);
  const status    = reconStatus(daysSince, item.shelfLifeDays);

  let reconWarn = null;
  if (status === "warning") {
    reconWarn = `Vial is ${daysSince}d old — ${item.shelfLifeDays}d window, use soon`;
  } else if (status === "expired") {
    reconWarn = `Vial is ${daysSince}d old — ${item.shelfLifeDays}d window exceeded`;
  }

  const metaParts = [item.timing, scheduleLabel(item.schedule)].filter(Boolean);

  return (
    <div className="today-card card">
      {logged && <div className="today-logged-badge">✓ Logged today</div>}

      <div className="today-card-header">
        <span className="today-card-name">{item.name}</span>
        {status && (
          <span className={`recon-status recon-${status}`}>
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>

      {metaParts.length > 0 && (
        <div className="today-card-meta muted">{metaParts.join(" · ")}</div>
      )}

      <div className="today-card-dose">
        {item.doseValue} {item.doseUnit}
        {draw && (
          <>
            {" · draw "}
            <strong>{draw.units.toFixed(1)} units</strong>
            <span className="muted"> on U-100</span>
          </>
        )}
      </div>

      {day != null && (
        <div className="today-card-cycle muted">
          Day {day} of {item.cycleLengthDays}
          {remaining != null && remaining >= 0 && (
            <> &mdash; {remaining} day{remaining === 1 ? "" : "s"} remaining</>
          )}
        </div>
      )}

      {reconWarn && <div className="today-recon-warn">{reconWarn}</div>}

      <div className="today-card-action">
        {logged ? (
          <button className="link-button today-undo-btn" onClick={undo}>
            Undo
          </button>
        ) : (
          <button className="primary-button" onClick={() => onStartLog(item)}>
            Log dose
          </button>
        )}
      </div>
    </div>
  );
}
