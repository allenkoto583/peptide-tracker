import { useMemo, useState } from "react";
import { peptides } from "../data/peptides.js";
import SearchBar from "../components/SearchBar.jsx";
import PeptideList from "../components/PeptideList.jsx";
import PeptideDetail from "../components/PeptideDetail.jsx";

// The library screen owns two pieces of state:
//   query    — the current search text
//   selected — the peptide whose detail view is open (null = show the list)
export default function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // Filter as you type. We match against the name AND every alias, all
  // lower-cased, so "reta" or "ozempic" both find the right entry.
  // useMemo just avoids re-filtering on every render when nothing changed.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return peptides;
    return peptides.filter((p) => {
      const haystack = [p.name, p.category, ...(p.aliases || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  // If a peptide is selected, show its detail view instead of the list.
  if (selected) {
    return (
      <PeptideDetail peptide={selected} onBack={() => setSelected(null)} />
    );
  }

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <p className="muted result-count">
        {results.length} {results.length === 1 ? "peptide" : "peptides"}
      </p>
      <PeptideList peptides={results} onSelect={setSelected} />
    </div>
  );
}
