import { useEffect, useRef, useState } from "react";
import { useLocalStorageState } from "./hooks/useLocalStorageState.js";
import { peptides } from "./data/peptides.js";
import { todayISO } from "./lib/doseCalc.js";
import TodayScreen from "./screens/TodayScreen.jsx";
import LibraryScreen from "./screens/LibraryScreen.jsx";
import StackScreen from "./screens/StackScreen.jsx";
import SitesScreen from "./screens/SitesScreen.jsx";

const TABS = [
  { id: "today",   label: "Today",    title: "Today" },
  { id: "library", label: "Library",  title: "Peptide Library" },
  { id: "stack",   label: "My Stack", title: "My Stack" },
  { id: "sites",   label: "Sites",    title: "Injection Sites" },
];

// Fallbacks when a peptide has no researched cycle block (or was added before
// the library carried one).
const FALLBACK_REST_DAYS = 30;

export default function App() {
  const [tab, setTab] = useState("today");
  const active = TABS.find((t) => t.id === tab) || TABS[0];

  // Logged doses live here (not inside a screen) so Today and Sites share one
  // source of truth as the user hops between the two tabs mid-flow.
  const [doses, setDoses] = useLocalStorageState("doses", []);

  // Site "last injected" dates live here too: logging a dose writes them and
  // then switches tabs in the same tick, which would unmount SitesScreen before
  // its persist effect ran. Keeping them in App (always mounted) avoids that.
  const [siteDates, setSiteDates] = useLocalStorageState("sites", {});

  // The stack lives here for the same reason. Today and My Stack both read it,
  // and both can now write it (Today has a "Start next cycle" button), so two
  // separate useLocalStorageState copies would be two states racing one key.
  const [stack, setStack] = useLocalStorageState("stack", []);

  // Bacteriostatic water: one punctured bottle at a time. My Stack shows the
  // full card; Today shows a warning banner when it's close to or past its
  // beyond-use window, so this has to be shared state too.
  const [bacWater, setBacWater] = useLocalStorageState("bacwater", {
    punctureDate: null,
    expiryDays: 28,
  });

  // Ephemeral: which stack item, if any, we're currently logging a dose for.
  const [logTarget, setLogTarget] = useState(null);

  // One-time migration for stacks saved by older versions of the app. Only
  // fills fields that are missing — it never overwrites a value you've set.
  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    migrated.current = true;
    setStack((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const patch = {};
        // Pre-schedule items predate the Today dashboard.
        if (!item.schedule) patch.schedule = { type: "daily" };
        // Pre-rest items predate off-cycle tracking: seed from library research.
        const lib = peptides.find((p) => p.id === item.peptideId);
        if (item.restDays == null) {
          patch.restDays = lib?.cycle?.offDays ?? FALLBACK_REST_DAYS;
        }
        if (item.continuous == null) patch.continuous = !!lib?.cycle?.continuous;
        if (item.cycleNumber == null) patch.cycleNumber = 1;

        if (Object.keys(patch).length === 0) return item;
        changed = true;
        return { ...item, ...patch };
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addItem(item) {
    setStack((prev) => [...prev, item]);
  }
  function removeItem(id) {
    setStack((prev) => prev.filter((it) => it.id !== id));
  }
  function updateItem(id, changes) {
    setStack((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...changes } : it))
    );
  }

  // Begin a fresh cycle: today becomes Day 1, the cycle counter ticks up, and
  // the cycle we just finished is archived. Deliberately leaves reconDate alone
  // — you may be resuming on the same vial, and the recon card has its own
  // date control for when you aren't.
  function startNextCycle(item) {
    updateItem(item.id, {
      cycleStart: todayISO(),
      cycleNumber: (item.cycleNumber ?? 1) + 1,
      cycleHistory: [
        ...(item.cycleHistory ?? []),
        {
          start: item.cycleStart,
          lengthDays: item.cycleLengthDays,
          restDays: item.restDays,
        },
      ],
    });
  }

  function startLog(item) {
    setLogTarget({ id: item.id, name: item.name });
    setTab("sites");
  }
  function finishLog() {
    setLogTarget(null);
    setTab("today");
  }
  function cancelLog() {
    setLogTarget(null);
    setTab("today");
  }

  function renderScreen() {
    if (tab === "today")
      return (
        <TodayScreen
          stack={stack}
          doses={doses}
          setDoses={setDoses}
          bacWater={bacWater}
          onStartLog={startLog}
          onStartNextCycle={startNextCycle}
        />
      );
    if (tab === "stack")
      return (
        <StackScreen
          stack={stack}
          onAdd={addItem}
          onRemove={removeItem}
          onUpdate={updateItem}
          onStartNextCycle={startNextCycle}
          bacWater={bacWater}
          setBacWater={setBacWater}
        />
      );
    if (tab === "sites")
      return (
        <SitesScreen
          dates={siteDates}
          setDates={setSiteDates}
          doses={doses}
          setDoses={setDoses}
          logTarget={logTarget}
          onFinishLog={finishLog}
          onCancelLog={cancelLog}
        />
      );
    return <LibraryScreen />;
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>{active.title}</h1>
      </header>

      <main className="content">{renderScreen()}</main>

      <footer className="disclaimer">
        Personal tracking tool. Reference information is general and not medical
        advice.
      </footer>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${t.id === tab ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
