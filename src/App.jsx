import { useState } from "react";
import { useLocalStorageState } from "./hooks/useLocalStorageState.js";
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

  // Ephemeral: which stack item, if any, we're currently logging a dose for.
  const [logTarget, setLogTarget] = useState(null);

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
        <TodayScreen doses={doses} setDoses={setDoses} onStartLog={startLog} />
      );
    if (tab === "stack") return <StackScreen />;
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
