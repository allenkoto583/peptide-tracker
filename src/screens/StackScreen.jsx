import { useState } from "react";
import { peptides } from "../data/peptides.js";
import { useLocalStorageState } from "../hooks/useLocalStorageState.js";
import AddToStackForm from "../components/AddToStackForm.jsx";
import StackItemCard from "../components/StackItemCard.jsx";

// The My Stack screen owns the saved stack (persisted to localStorage) and a
// flag for whether the "add" form is open.
export default function StackScreen() {
  const [stack, setStack] = useLocalStorageState("stack", []);
  const [adding, setAdding] = useState(false);

  function addItem(item) {
    setStack((prev) => [...prev, item]);
    setAdding(false);
  }

  function removeItem(id) {
    setStack((prev) => prev.filter((it) => it.id !== id));
  }

  function updateItem(id, changes) {
    setStack((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...changes } : it))
    );
  }

  // While adding, the form takes over the whole screen.
  if (adding) {
    return (
      <AddToStackForm
        peptides={peptides}
        onAdd={addItem}
        onCancel={() => setAdding(false)}
      />
    );
  }

  return (
    <div>
      <div className="stack-header">
        <p className="muted" style={{ margin: 0 }}>
          {stack.length === 0
            ? "Your stack is empty."
            : `${stack.length} peptide${stack.length === 1 ? "" : "s"} in your stack`}
        </p>
        <button className="primary-button" onClick={() => setAdding(true)}>
          + Add peptide
        </button>
      </div>

      {stack.length === 0 ? (
        <p className="muted empty-hint">
          Tap “Add peptide” to choose one from the library and enter your own
          protocol — your dose, timing, frequency, and cycle length.
        </p>
      ) : (
        <div className="stack-list">
          {stack.map((item) => (
            <StackItemCard key={item.id} item={item} onRemove={removeItem} onUpdate={updateItem} />
          ))}
        </div>
      )}
    </div>
  );
}
