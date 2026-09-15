import {
  calcDraw,
  dayOfCycle,
  daysRemaining,
  daysSinceRecon,
  isLoggedToday,
  reconStatus,
  todayISO,
} from "../lib/doseCalc.js";
import {
  cycleStatusOf,
  isDueToday,
  nextCycleDate,
  restDayOf,
  restDaysRemaining,
  scheduleLabel,
} from "../lib/scheduleCalc.js";

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

// "2026-10-04" → "Oct 4", parsed as parts so the local day never shifts.
function fmtShort(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Bacteriostatic water warning — silent unless the bottle is close to or past
// its beyond-use window, so it only interrupts when it matters.
function BacWaterBanner({ bacWater }) {
  const punctureDate = bacWater?.punctureDate ?? null;
  const expiryDays = bacWater?.expiryDays ?? 28;
  const days = daysSinceRecon(punctureDate);
  const status = reconStatus(days, expiryDays);
  if (status !== "warning" && status !== "expired") return null;

  return (
    <div className="today-recon-warn today-bac-banner">
      {status === "expired"
        ? `Bacteriostatic water is ${days} days old — past its ${expiryDays}-day window. Replace the bottle before reconstituting.`
        : `Bacteriostatic water is ${days} days old — ${expiryDays}-day window, replace it soon.`}
    </div>
  );
}

export default function TodayScreen({
  stack,
  doses,
  setDoses,
  bacWater,
  onStartLog,
  onStartNextCycle,
}) {
  if (stack.length === 0) {
    return (
      <div>
        <p className="today-date muted">{todayLabel()}</p>
        <BacWaterBanner bacWater={bacWater} />
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
  const resting  = [];
  const complete = [];
  const upcoming = [];

  for (const item of stack) {
    const status = cycleStatusOf(item, today);
    if (status === "complete") { complete.push(item); continue; }
    if (status === "resting")  { resting.push(item);  continue; }
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

      <BacWaterBanner bacWater={bacWater} />

      {dueToday.length === 0 && onBreak.length === 0 && (
        <div className="card today-empty">
          <p className="muted" style={{ margin: 0 }}>
            {complete.length + resting.length > 0 && upcoming.length === 0
              ? "Nothing due today — everything in your stack is resting or finished."
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

      {resting.length > 0 && (
        <section className="today-section">
          <h2 className="today-section-title muted">Resting</h2>
          <div className="today-inactive">
            {resting.map((item) => {
              const restDay = restDayOf(item, today);
              const left    = restDaysRemaining(item, today);
              const next    = fmtShort(nextCycleDate(item));
              return (
                <div key={item.id} className="today-rest-item">
                  <div>
                    <span className="today-inactive-name">{item.name}</span>
                    <span className="muted">
                      {" — "}rest day {restDay} of {item.restDays}
                      {left != null && `, ${left} day${left === 1 ? "" : "s"} left`}
                      {next && `, next cycle ${next}`}
                    </span>
                  </div>
                  <button
                    className="link-button today-restart-btn"
                    onClick={() => onStartNextCycle(item)}
                  >
                    Start early
                  </button>
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
              const restDays = Number(item.restDays) || 0;
              const overBy = day != null && item.cycleLengthDays
                ? day - item.cycleLengthDays - restDays
                : null;
              return (
                <div key={item.id} className="today-rest-item">
                  <div>
                    <span className="today-inactive-name">{item.name}</span>
                    <span className="muted">
                      {restDays > 0
                        ? " — rest complete, ready to start"
                        : overBy != null
                          ? ` — ended ${overBy} day${overBy === 1 ? "" : "s"} ago`
                          : " — cycle complete"}
                    </span>
                  </div>
                  <button
                    className="primary-button today-restart-btn"
                    onClick={() => onStartNextCycle(item)}
                  >
                    Start next cycle
                  </button>
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

      {item.continuous ? (
        <div className="today-card-cycle muted">Running continuously</div>
      ) : (
        day != null && (
          <div className="today-card-cycle muted">
            Cycle {item.cycleNumber ?? 1} &middot; Day {day} of {item.cycleLengthDays}
            {remaining != null && remaining >= 0 && (
              <> &mdash; {remaining} day{remaining === 1 ? "" : "s"} remaining</>
            )}
          </div>
        )
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
