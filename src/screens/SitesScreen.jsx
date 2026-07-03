import { useEffect, useRef, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState.js";

const VW = 200;
const VH = 480;

// Per-tap step (in the 200x480 space) for the mobile arrow-pad "nudge" controls.
const NUDGE = 3;

// Widen the drawn silhouette around its vertical center line (x = 100) so there's
// more surface area to place and separate sites. This only reshapes the artwork —
// the 200x480 coordinate space and every saved site coordinate stay untouched, so
// previously hand-placed sites remain valid.
const WIDEN = 1.2;
const wx = (x) => +(100 + (x - 100) * WIDEN).toFixed(1);

// Build a smooth, closed outline through a set of points (Catmull-Rom -> cubic
// bezier). Keeps the body silhouette clean and continuous.
function catmullRomClosed(points) {
  const n = points.length;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < n; i++) {
    const [p0x, p0y] = points[(i - 1 + n) % n];
    const [p1x, p1y] = points[i];
    const [p2x, p2y] = points[(i + 1) % n];
    const [p3x, p3y] = points[(i + 2) % n];
    const c1x = p1x + (p2x - p0x) / 6;
    const c1y = p1y + (p2y - p0y) / 6;
    const c2x = p2x - (p3x - p1x) / 6;
    const c2y = p2y - (p3y - p1y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
  }
  return `${d} Z`;
}

// Left half of the body outline, traced clockwise from the neck down to the
// inner thigh. The right half is mirrored around the horizontal center so the
// figure stays symmetric about x = 100.
const BODY_HALF = [
  [93, 54],  [88, 68],   // neck (top, base)
  [56, 77],  [48, 100],  // shoulder tip, deltoid
  [46, 155], [45, 212],  // elbow outer, wrist outer
  [47, 250], [54, 261], [61, 250], // hand (outer, tip, inner)
  [58, 210], [61, 155],  // wrist inner, elbow inner
  [63, 106], // armpit
  [65, 140], [68, 198],  // ribs, waist (narrowest)
  [58, 240], // hip / pelvis (widest)
  [60, 264], [62, 312],  // upper thigh, thigh
  [67, 362],             // knee
  [63, 404], [71, 448],  // calf, ankle
  [60, 462], [90, 462],  // foot (toe, inner)
  [89, 448], [90, 404], [91, 362], // ankle inner, calf inner, knee inner
  [95, 300], // inner thigh
];

const BODY_POINTS = [
  ...BODY_HALF.map(([x, y]) => [wx(x), y]),
  [100, 262], // crotch (center)
  ...[...BODY_HALF].reverse().map(([x, y]) => [VW - wx(x), y]),
];

const BODY_PATH = catmullRomClosed(BODY_POINTS);

const DEFAULT_SITE_LIST = [
  { id: "upper-left",   label: "Upper left",     x: 76,  y: 156, view: "front" },
  { id: "upper-right",  label: "Upper right",    x: 124, y: 156, view: "front" },
  { id: "loveh-left",   label: "Love handles L", x: 66,  y: 196, view: "front" },
  { id: "loveh-right",  label: "Love handles R", x: 134, y: 196, view: "front" },
  { id: "mid-left",     label: "Mid left",       x: 78,  y: 214, view: "front" },
  { id: "mid-right",    label: "Mid right",      x: 122, y: 214, view: "front" },
  { id: "lower-left",   label: "Lower abd. L",   x: 80,  y: 242, view: "front" },
  { id: "lower-right",  label: "Lower abd. R",   x: 120, y: 242, view: "front" },
  { id: "glute-left",   label: "Glute L",        x: 80,  y: 270, view: "back" },
  { id: "glute-right",  label: "Glute R",        x: 120, y: 270, view: "back" },
  { id: "thigh-left",   label: "Upper thigh L",  x: 76,  y: 324, view: "back" },
  { id: "thigh-right",  label: "Upper thigh R",  x: 124, y: 324, view: "back" },
];

const STATUS_C = {
  clear: { fill: "rgba(34,197,94,0.20)",  stroke: "#22c55e", text: "#22c55e" },
  close: { fill: "rgba(234,179,8,0.20)",  stroke: "#eab308", text: "#eab308" },
  soon:  { fill: "rgba(239,68,68,0.18)",  stroke: "#ef4444", text: "#ef4444" },
};

function newId() {
  return `site-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function daysSince(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const past = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - past) / (1000 * 60 * 60 * 24));
}

function siteStatus(days) {
  if (days == null) return "clear";
  if (days < 5) return "soon";
  if (days < 7) return "close";
  return "clear";
}

export default function SitesScreen({
  dates,
  setDates,
  doses,
  setDoses,
  logTarget,
  onFinishLog,
  onCancelLog,
}) {
  const [siteList, setSiteList] = useLocalStorageState("site-list", DEFAULT_SITE_LIST);
  const [view, setView]         = useState("front");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, setPending]   = useState(null);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    migrated.current = true;
    const needsViewTag = siteList.some((s) => !s.view);
    const existingIds  = new Set(siteList.map((s) => s.id));
    const missingBack  = DEFAULT_SITE_LIST.filter((s) => s.view === "back" && !existingIds.has(s.id));
    if (needsViewTag || missingBack.length) {
      const tagged = siteList.map((s) => (s.view ? s : { ...s, view: "front" }));
      setSiteList([...tagged, ...missingBack]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewSites = siteList.filter((s) => (s.view ?? "front") === view);

  function switchView(v) {
    setView(v); setSelected(null); setPending(null); setDragging(null); setConfirmDel(false);
  }

  function toSvg(e) {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * VW, y: ((e.clientY - rect.top) / rect.height) * VH };
  }

  function onSvgPointerDown(e) {
    if (!editMode) return;
    const pt  = toSvg(e);
    const hit = viewSites.find((s) => Math.hypot(pt.x - s.x, pt.y - s.y) < 18);
    if (!hit) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging({ id: hit.id, startX: pt.x, startY: pt.y, origX: hit.x, origY: hit.y, moved: false });
  }

  function onSvgPointerMove(e) {
    if (!dragging) return;
    const pt = toSvg(e);
    const dx = pt.x - dragging.startX;
    const dy = pt.y - dragging.startY;
    if (!dragging.moved && Math.hypot(dx, dy) < 3) return;
    const newX = Math.max(18, Math.min(182, dragging.origX + dx));
    const newY = Math.max(90, Math.min(460, dragging.origY + dy));
    setSiteList((prev) => prev.map((s) => (s.id === dragging.id ? { ...s, x: newX, y: newY } : s)));
    if (!dragging.moved) setDragging((d) => ({ ...d, moved: true }));
  }

  function onSvgPointerUp() {
    if (dragging && !dragging.moved) { setSelected(dragging.id); setConfirmDel(false); }
    setDragging(null);
  }

  function handleCircleTap(site) {
    // Logging mode takes priority: one tap records the dose and returns to Today.
    // No re-log confirmation, and edit interactions don't apply here.
    if (logTarget) { logDoseAtSite(site.id); return; }
    if (editMode) return;
    const date = dates[site.id] ?? null;
    if (!date) { logSite(site.id); } else { setPending({ ...site, days: daysSince(date), date }); }
  }

  function logSite(id) { setDates((prev) => ({ ...prev, [id]: todayISO() })); setPending(null); }

  // Record a dose against this site: stamp the site with today's date and append
  // an entry to the shared dose log, then hand control back to the Today screen.
  function logDoseAtSite(siteId) {
    const today = todayISO();
    setDates((prev) => ({ ...prev, [siteId]: today }));
    setDoses((prev) => [
      ...prev,
      {
        id: `dose-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stackItemId: logTarget.id,
        date: today,
        siteId,
      },
    ]);
    onFinishLog();
  }

  function resetDate(id, e) { e.stopPropagation(); setDates((prev) => ({ ...prev, [id]: null })); }

  function renameSelected(label) {
    setSiteList((prev) => prev.map((s) => (s.id === selected ? { ...s, label } : s)));
  }

  // Move the selected site a small step via the arrow pad. Clamped to the exact
  // same bounds the drag code uses, and persisted to peptide:site-list.
  function nudgeSelected(dx, dy) {
    if (!selected) return;
    setSiteList((prev) =>
      prev.map((s) =>
        s.id === selected
          ? {
              ...s,
              x: Math.max(18, Math.min(182, s.x + dx)),
              y: Math.max(90, Math.min(460, s.y + dy)),
            }
          : s
      )
    );
  }

  function deleteSelected() {
    setSiteList((prev) => prev.filter((s) => s.id !== selected));
    setDates((prev) => { const next = { ...prev }; delete next[selected]; return next; });
    setSelected(null); setConfirmDel(false);
  }

  function addSite() {
    const id = newId();
    const startY = view === "back" ? 280 : 190;
    setSiteList((prev) => [...prev, { id, label: "New site", x: 100, y: startY, view }]);
    setSelected(id); setConfirmDel(false);
  }

  function exitEdit() { setEditMode(false); setSelected(null); setConfirmDel(false); setDragging(null); }

  const clearCount = siteList.filter((s) => siteStatus(daysSince(dates[s.id] ?? null)) === "clear").length;
  const mostRested = [...siteList].map((s) => ({ ...s, days: daysSince(dates[s.id] ?? null) }))
    .sort((a, b) => (b.days ?? 9999) - (a.days ?? 9999))[0];
  const mrDaysText = !mostRested ? "" : mostRested.days == null ? "never used" : `${mostRested.days}d ago`;
  const selectedSite = siteList.find((s) => s.id === selected);

  const bodyPath = BODY_PATH;

  return (
    <div>
      {logTarget && (
        <div className="sites-log-banner">
          <span>
            Logging <strong>{logTarget.name}</strong> — tap the site where you
            injected
          </span>
          <button className="link-button" onClick={onCancelLog}>
            Cancel
          </button>
        </div>
      )}

      <div className="sites-topbar">
        {mostRested && (
          <div className="sites-banner">
            <span className="sites-banner-label muted">Most rested</span>
            <strong>{mostRested.label}</strong>
            <span className="muted">({mrDaysText})</span>
          </div>
        )}
        {!logTarget && (
          <div className="sites-topbar-actions">
            {editMode && (<button className="link-button site-edit-btn" onClick={addSite}>+ New site</button>)}
            <button className={editMode ? "primary-button" : "link-button site-edit-btn"}
                    onClick={editMode ? exitEdit : () => setEditMode(true)}>
              {editMode ? "Done" : "Edit"}
            </button>
          </div>
        )}
      </div>

      <div className="body-view-toggle">
        <button className={`body-view-btn${view === "front" ? " active" : ""}`} onClick={() => switchView("front")}>Front</button>
        <button className={`body-view-btn${view === "back" ? " active" : ""}`} onClick={() => switchView("back")}>Back</button>
      </div>

      {editMode && !selected && (
        <p className="muted sites-edit-hint">Drag circles to reposition · tap a circle to rename or delete · tap x to clear its date</p>
      )}

      {!editMode && clearCount <= 2 && siteList.length > 0 && (
        <div className={`sites-warning ${clearCount === 0 ? "sites-warning-red" : "sites-warning-yellow"}`}>
          {clearCount === 0 ? "No sites are clear — all need more rest before reuse."
            : `Only ${clearCount} site${clearCount === 1 ? "" : "s"} clear. Space injections further if possible.`}
        </div>
      )}

      {pending && (
        <div className="sites-confirm">
          <p className="sites-confirm-text">
            <strong>{pending.label}</strong> was last used{" "}
            {pending.days === 0 ? "today" : `${pending.days} day${pending.days === 1 ? "" : "s"} ago`}{" "}
            ({pending.date}). Re-log this site?
          </p>
          <div className="sites-confirm-actions">
            <button className="primary-button" onClick={() => logSite(pending.id)}>Yes, log it</button>
            <button className="link-button" style={{ color: "var(--text)" }} onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="body-svg-wrap">
        <svg ref={svgRef} viewBox="0 0 200 480" width="100%"
          aria-label={`Injection site body diagram — ${view} view`}
          style={{ display: "block", touchAction: editMode ? "none" : "auto" }}
          onPointerDown={onSvgPointerDown} onPointerMove={onSvgPointerMove}
          onPointerUp={onSvgPointerUp} onPointerLeave={onSvgPointerUp}>

          <ellipse cx="100" cy="34" rx="21" ry="22" fill="#1e293b" stroke="#4a5568" strokeWidth="1.5"/>
          <path d={bodyPath} fill="#1e293b" stroke="#4a5568" strokeWidth="1.5"/>

          {view === "front" && <>
            {/* collarbone */}
            <path d="M 100 76 C 86.8 79, 76 80, 61.6 82" fill="none" stroke="#334155" strokeWidth="1"/>
            <path d="M 100 76 C 113.2 79, 124 80, 138.4 82" fill="none" stroke="#334155" strokeWidth="1"/>
            {/* chest / pectoral hint */}
            <path d="M 68.8 98 C 80.8 110, 91.6 112, 100 110" fill="none" stroke="#334155" strokeWidth="0.8"/>
            <path d="M 131.2 98 C 119.2 110, 108.4 112, 100 110" fill="none" stroke="#334155" strokeWidth="0.8"/>
            {/* sternum / centerline down to navel */}
            <path d="M 100 84 C 101.2 118, 98.8 158, 100 190" fill="none" stroke="#334155" strokeWidth="0.7"/>
            {/* navel */}
            <ellipse cx="100" cy="196" rx="2.4" ry="3.4" fill="none" stroke="#4a5568" strokeWidth="1.3"/>
            {/* knee creases */}
            <path d="M 54.4 356 C 59.2 362, 61.6 368, 59.2 374" fill="none" stroke="#334155" strokeWidth="0.7"/>
            <path d="M 145.6 356 C 140.8 362, 138.4 368, 140.8 374" fill="none" stroke="#334155" strokeWidth="0.7"/>
          </>}

          {view === "back" && <>
            {/* spine */}
            <path d="M 100 74 C 101.2 130, 98.8 195, 100 252" fill="none" stroke="#334155" strokeWidth="1.1"/>
            {/* shoulder blades */}
            <path d="M 80.8 102 C 70 110, 68.8 126, 79.6 138" fill="none" stroke="#334155" strokeWidth="0.9"/>
            <path d="M 119.2 102 C 130 110, 131.2 126, 120.4 138" fill="none" stroke="#334155" strokeWidth="0.9"/>
            {/* lower-back dimples */}
            <circle cx="88" cy="244" r="1.3" fill="#334155"/>
            <circle cx="112" cy="244" r="1.3" fill="#334155"/>
            {/* gluteal cleft */}
            <path d="M 100 254 L 100 292" stroke="#334155" strokeWidth="1.1" fill="none"/>
            {/* gluteal folds */}
            <path d="M 59.2 292 C 71.2 302, 88 302, 98.8 293" fill="none" stroke="#334155" strokeWidth="0.9"/>
            <path d="M 140.8 292 C 128.8 302, 112 302, 101.2 293" fill="none" stroke="#334155" strokeWidth="0.9"/>
            {/* knee creases */}
            <path d="M 54.4 356 C 59.2 362, 61.6 368, 59.2 374" fill="none" stroke="#334155" strokeWidth="0.7"/>
            <path d="M 145.6 356 C 140.8 362, 138.4 368, 140.8 374" fill="none" stroke="#334155" strokeWidth="0.7"/>
          </>}

          <text x="22" y="150" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">L</text>
          <text x="178" y="150" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">R</text>

          {viewSites.map((site) => {
            const days   = daysSince(dates[site.id] ?? null);
            const status = siteStatus(days);
            const c      = STATUS_C[status];
            const isActive = pending?.id === site.id;
            const isDrag   = dragging?.id === site.id;
            const isSel    = selected === site.id;
            return (
              <g key={site.id} onClick={() => handleCircleTap(site)}
                 style={{ cursor: editMode ? (isDrag ? "grabbing" : "grab") : "pointer" }}>
                <circle cx={site.x} cy={site.y} r={18} fill="transparent"/>
                <circle cx={site.x} cy={site.y} r={12} fill={c.fill}
                  stroke={isSel ? "#38bdf8" : isDrag || isActive ? "#38bdf8" : c.stroke}
                  strokeWidth={isSel || isDrag || isActive ? 2 : 1.5}
                  strokeDasharray={editMode && !isDrag && !isSel ? "3 2" : undefined}/>
                <text x={site.x} y={site.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={c.text} fontSize="7" fontWeight="700"
                  fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
                  style={{ pointerEvents: "none", userSelect: "none" }}>
                  {days == null ? "—" : `${days}d`}
                </text>
                {editMode && (
                  <g onPointerDown={(e) => resetDate(site.id, e)} style={{ cursor: "pointer" }}>
                    <circle cx={site.x + 9} cy={site.y - 9} r={6} fill="#ef4444" stroke="#0f172a" strokeWidth="1"/>
                    <text x={site.x + 9} y={site.y - 8} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="8" fontWeight="bold"
                      fontFamily="-apple-system,BlinkMacSystemFont,sans-serif"
                      style={{ userSelect: "none", pointerEvents: "none" }}>{"×"}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {editMode && selectedSite && (
        <div className="site-nudge-panel" role="group" aria-label={`Edit ${selectedSite.label}`}>
          <div className="site-nudge-row">
            <input className="form-input site-nudge-name" value={selectedSite.label}
              onChange={(e) => renameSelected(e.target.value)} placeholder="Site name"/>
            <button className="primary-button site-nudge-done"
              onClick={() => { setSelected(null); setConfirmDel(false); }}>Done</button>
          </div>

          <div className="site-nudge-controls">
            <div className="nudge-pad" role="group" aria-label="Move site">
              <button className="nudge-btn nudge-up"    onClick={() => nudgeSelected(0, -NUDGE)} aria-label="Move up">{"▲"}</button>
              <button className="nudge-btn nudge-left"  onClick={() => nudgeSelected(-NUDGE, 0)} aria-label="Move left">{"◀"}</button>
              <span   className="nudge-center" aria-hidden="true">{"✚"}</span>
              <button className="nudge-btn nudge-right" onClick={() => nudgeSelected(NUDGE, 0)}  aria-label="Move right">{"▶"}</button>
              <button className="nudge-btn nudge-down"  onClick={() => nudgeSelected(0, NUDGE)}  aria-label="Move down">{"▼"}</button>
            </div>

            <div className="site-nudge-side">
              {!confirmDel ? (
                <button className="danger-button" onClick={() => setConfirmDel(true)}>Delete site</button>
              ) : (
                <div className="danger-confirm">
                  <p className="muted" style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>
                    Delete "{selectedSite.label}"? This will clear its injection history.
                  </p>
                  <div className="sites-confirm-actions">
                    <button className="danger-button" onClick={deleteSelected}>Yes, delete</button>
                    <button className="link-button" style={{ color: "var(--text)" }} onClick={() => setConfirmDel(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!editMode && (
        <div className="sites-legend">
          <span className="legend-dot legend-clear"/>
          <span className="muted">Clear (7+ days)</span>
          <span className="legend-dot legend-close"/>
          <span className="muted">Almost (5-6)</span>
          <span className="legend-dot legend-soon"/>
          <span className="muted">Rest (&lt;5)</span>
        </div>
      )}

      <p className="muted sites-hint">
        {editMode ? "Tap Done when finished." : "Tap a site to log an injection. Same site needs at least 5 days rest; 7 is ideal."}
      </p>
    </div>
  );
}
