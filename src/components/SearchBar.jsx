// A controlled search input. "Controlled" means React owns the value:
// the parent passes the current text in via `value` and gets every
// keystroke back via `onChange`, so filtering can happen as you type.
export default function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar">
      <input
        type="search"
        className="searchbar-input"
        placeholder="Search peptides (name or alias)…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
