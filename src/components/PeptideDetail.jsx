// Full reference view for a single peptide. Pure presentation: it just
// reads fields off the peptide object and lays them out. `onBack` returns
// to the list.

// Small helper to render one labeled section only if it has content.
function Field({ label, children }) {
  if (!children) return null;
  return (
    <div className="detail-field">
      <div className="detail-label muted">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

// Turn the structured dose/vial blocks into readable text.
function formatDose(dose) {
  if (!dose) return null;
  const per = dose.perDose ? " per dose" : "";
  if (dose.min === dose.max) return `${dose.min} ${dose.unit}${per}`;
  return `${dose.min}–${dose.max} ${dose.unit}${per}`;
}

function formatVial(vial) {
  if (!vial) return null;
  const sizes =
    vial.commonMg && vial.commonMg.length
      ? `Common vial sizes: ${vial.commonMg.join(", ")} mg. `
      : "";
  const recon =
    vial.reconMl && vial.reconSolvent
      ? `A common mix is ~${vial.reconMl} mL of ${vial.reconSolvent.toLowerCase()} per ${vial.typicalMg} mg vial.`
      : "";
  return `${sizes}${recon}`.trim();
}

export default function PeptideDetail({ peptide, onBack }) {
  const p = peptide;

  return (
    <div>
      <button className="back-button" onClick={onBack}>
        ← Back to library
      </button>

      <div className="card">
        <h2>{p.name}</h2>
        <div className="detail-category">{p.category}</div>

        {p.aliases && p.aliases.length > 0 && (
          <div className="alias-row">
            {p.aliases.map((a) => (
              <span key={a} className="alias-chip">
                {a}
              </span>
            ))}
          </div>
        )}

        <p className="reference-tag">
          ⓘ General reference information, not medical advice.
        </p>

        <Field label="What it is / purpose">{p.purpose}</Field>
        <Field label="Typical dose range">{formatDose(p.dose)}</Field>
        <Field label="Vial & reconstitution amounts">{formatVial(p.vial)}</Field>
        <Field label="Reconstitution notes">{p.reconstitutionNotes}</Field>
        <Field label="Storage">{p.storageNotes}</Field>
        <Field label="Common timing">{p.timing}</Field>
        <Field label="Typical frequency">{p.frequency}</Field>
        <Field label="Typical cycle length">{p.cycleLength}</Field>

        {p.shelfLife && (
          <Field label="Beyond-use / shelf life">
            <>
              Reconstituted, refrigerated: ~
              {p.shelfLife.reconstitutedFridgeDays} days (default estimate).
              {p.shelfLife.lyophilizedNote
                ? ` ${p.shelfLife.lyophilizedNote}`
                : ""}
              {p.shelfLife.note ? ` ${p.shelfLife.note}` : ""}
            </>
          </Field>
        )}

        {p.sources && p.sources.length > 0 && (
          <Field label="Sources">
            <ul className="source-list">
              {p.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Field>
        )}
      </div>
    </div>
  );
}
