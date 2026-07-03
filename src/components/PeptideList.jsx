// Renders the filtered list of peptides. Each row is a button so it's
// tappable on a phone and accessible. Tapping calls onSelect(peptide).
export default function PeptideList({ peptides, onSelect }) {
  if (peptides.length === 0) {
    return (
      <p className="muted" style={{ textAlign: "center", marginTop: 32 }}>
        No peptides match your search.
      </p>
    );
  }

  return (
    <ul className="peptide-list">
      {peptides.map((p) => (
        <li key={p.id}>
          <button className="peptide-row" onClick={() => onSelect(p)}>
            <span className="peptide-row-name">{p.name}</span>
            <span className="peptide-row-category muted">{p.category}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
