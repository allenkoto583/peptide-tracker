import { useState } from "react";
import { peptides } from "../data/peptides.js";
import AddToStackForm from "../components/AddToStackForm.jsx";
import StackItemCard from "../components/StackItemCard.jsx";
import BacWaterCard from "../components/BacWaterCard.jsx";

// The My Stack screen renders the saved stack and the bacteriostatic water
// tracker. The stack itself lives in App.jsx (Today can write it too, so one
// owner avoids two states racing the same localStorage key); this screen only
// owns the flag for whether the "add" form is open.
export default function StackScreen({
  stack,
  onAdd,
  onRemove,
  onUpdate,
  onStartNextCycle,
  bacWater,
  setBacWater,
}) {
  const [adding, setAdding] = useState(false);

  function handleAdd(item) {
    onAdd(item);
    setAdding(false);
  }

  // While adding, the form takes over the whole screen.
  if (adding) {
    return (
      <AddToStackForm
        peptides={peptides}
        onAdd={handleAdd}
        onCancel={() => setAdding(false)}
      />
    );
  }

  return (
    <div>
      {/* Pinned above the stack so it's visible whether or not you have
          peptides saved — the water bottle ages either way. */}
      <BacWaterCard bacWater={bacWater} setBacWater={setBacWater} />

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
            <StackItemCard
              key={item.id}
              item={item}
              onRemove={onRemove}
              onUpdate={onUpdate}
              onStartNextCycle={onStartNextCycle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
