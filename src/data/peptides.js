// ---------------------------------------------------------------------------
// Peptide reference library
// ---------------------------------------------------------------------------
//
// This file is the single source of truth for the searchable peptide library.
//
// IMPORTANT: Everything in here is GENERAL REFERENCE INFORMATION compiled from
// public sources. It is NOT medical advice and not a prescription. Dosing is
// given as commonly cited *ranges*, not recommendations.
//
// ---------------------------------------------------------------------------
// Object shape (designed so a future reconstitution calculator can reuse it)
// ---------------------------------------------------------------------------
//
//   id           string   stable key for React lists / saved stacks later
//   name         string   primary display name
//   aliases      string[] other names people search by
//   category     string   short tag, e.g. "GLP-1 / weight loss"
//   purpose      string   1–2 sentence plain-language "what it is"
//
//   vial: {                // structured so a calculator can do the math later
//     typicalMg    number  // common amount of peptide per vial, in mg
//     commonMg     number[]// other vial sizes seen on the market (optional)
//     reconSolvent string  // what it's mixed with (e.g. bacteriostatic water)
//     reconMl      number  // a common amount of solvent to add, in mL
//   }
//
//   dose: {                // structured ranges so a calculator can reuse them
//     min          number  // low end of a commonly cited range
//     max          number  // high end of a commonly cited range
//     unit         string  // "mcg" or "mg" — the unit min/max are expressed in
//     perDose      boolean // true if the range is "per injection"
//   }
//
//   reconstitutionNotes string  human-readable notes (caveats, slow inject, etc.)
//   storageNotes        string  fridge/freezer guidance
//   timing              string  common time-of-day practice
//   frequency           string  how often it's commonly taken
//   cycleLength         string  typical on/off cycle range
//
//   shelfLife: {                  // beyond-use estimates after reconstitution
//     reconstitutedFridgeDays number   default beyond-use window in fridge
//     lyophilizedNote         string   how long the dry powder keeps
//     note                    string   extra context
//   }
//
//   sources      { label, url }[]   where the info came from
//
// ---------------------------------------------------------------------------

export const peptides = [
  {
    id: "retatrutide",
    name: "Retatrutide",
    aliases: ["Reta", "LY3437943", "Triple-G", "GGG agonist"],
    category: "GLP-1 / GIP / glucagon (weight loss)",
    purpose:
      "An investigational triple agonist (GLP-1, GIP, and glucagon receptors) studied for weight loss and metabolic health. Still in clinical trials; not an approved medication.",
    vial: {
      typicalMg: 10,
      commonMg: [5, 10, 15, 20, 24],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 1,
      max: 12,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute by adding bacteriostatic water slowly down the vial wall; do not shoot the stream directly onto the powder and do not shake — swirl gently until dissolved. Trial protocols titrate the dose upward slowly over many weeks.",
    storageNotes:
      "Keep lyophilized (powder) vials refrigerated. After reconstitution, store in the refrigerator (about 2–8 °C / 36–46 °F) and keep away from light.",
    timing:
      "Commonly taken on a fixed day each week; time of day is flexible. Many take it in the evening to sleep through early nausea.",
    frequency: "Once weekly (long-acting).",
    cycleLength:
      "Run continuously with slow titration in trials; community use often follows multi-month blocks. No standardized cycle.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years when kept cold and dry.",
      note: "Beyond-use windows vary; discard sooner if cloudy, discolored, or contaminated.",
    },
    sources: [
      {
        label: "NEJM — Retatrutide Phase 2 obesity trial (2023)",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2301972",
      },
      {
        label: "ClinicalTrials.gov — Retatrutide (LY3437943)",
        url: "https://clinicaltrials.gov/search?term=retatrutide",
      },
    ],
  },

  {
    id: "cjc1295-ipamorelin",
    name: "CJC-1295 / Ipamorelin",
    aliases: [
      "CJC-1295",
      "CJC 1295",
      "Ipamorelin",
      "Ipa",
      "CJC/Ipa",
      "GHRH + GHRP",
    ],
    category: "Growth hormone secretagogue",
    purpose:
      "A commonly paired combo: CJC-1295 (a GHRH analog) plus Ipamorelin (a selective GHRP). Together they stimulate the body's own growth-hormone release, studied/used for recovery, sleep, and body composition.",
    vial: {
      typicalMg: 5,
      commonMg: [2, 5, 10],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 100,
      max: 300,
      unit: "mcg",
      perDose: true,
    },
    reconstitutionNotes:
      "Often sold as a pre-blended vial or as two vials combined into one. A frequently cited practice is ~100–300 mcg of each per injection. Add solvent slowly down the wall and swirl, don't shake.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for longer-term storage.",
    timing:
      "Commonly injected at night before bed (to align with natural GH pulses) and/or post-workout, on an empty stomach.",
    frequency:
      "Often once to a few times daily depending on goals; nightly is common.",
    cycleLength: "Commonly run in blocks of about 8–12 weeks, then a break.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for many months frozen and protected from light.",
      note: "Modified (DAC) versions are longer-acting than the bare peptide; discard if cloudy or discolored.",
    },
    sources: [
      {
        label: "PubMed — CJC-1295 pharmacokinetics (Teichman et al., 2006)",
        url: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
      },
      {
        label: "PubMed — Ipamorelin, a selective GH secretagogue",
        url: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
      },
    ],
  },

  {
    id: "mots-c",
    name: "MOTS-c",
    aliases: ["MOTSc", "MOTS c", "Mitochondrial ORF of the 12S rRNA-c"],
    category: "Mitochondrial-derived peptide",
    purpose:
      "A mitochondrial-derived peptide studied for effects on metabolism, insulin sensitivity, and exercise capacity. Research is mostly preclinical.",
    vial: {
      typicalMg: 10,
      commonMg: [5, 10],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 5,
      max: 5,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute with bacteriostatic water, adding slowly and swirling gently. Community protocols vary widely; ranges here are illustrative, not prescriptive.",
    storageNotes:
      "Refrigerate after reconstitution. Keep lyophilized vials cold and dry; freezing extends shelf life.",
    timing: "Often dosed in the morning or before exercise.",
    frequency:
      "Common practice is a weekly total of about 5–10 mg, usually split into one or two 5 mg subcutaneous injections on non-consecutive days rather than daily. Human dosing is not established.",
    cycleLength:
      "Frequently run in 8–12 week cycles at roughly 5–10 mg per week, then a break.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder stable for months to years when frozen and protected from light.",
      note: "Discard if the solution becomes cloudy or discolored.",
    },
    sources: [
      {
        label: "PubMed — MOTS-c regulates metabolic homeostasis (Lee et al., 2015)",
        url: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
      },
      {
        label: "PubMed — MOTS-c and exercise (Reynolds et al., 2021)",
        url: "https://pubmed.ncbi.nlm.nih.gov/33558606/",
      },
    ],
  },

  {
    id: "bpc157-tb500",
    name: "BPC-157 / TB-500",
    aliases: [
      "BPC-157",
      "BPC 157",
      "Body Protection Compound",
      "TB-500",
      "TB 500",
      "Thymosin Beta-4",
      "TB4",
      "healing stack",
    ],
    category: "Recovery / healing (research peptides)",
    purpose:
      "A frequently paired 'healing stack': BPC-157 (a synthetic peptide derived from a gastric protein) and TB-500 (a fragment related to Thymosin Beta-4). Studied in animals for tissue repair, tendon/ligament recovery, and gut health. Human evidence is limited.",
    vial: {
      typicalMg: 10,
      commonMg: [5, 10],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 250,
      max: 500,
      unit: "mcg",
      perDose: true,
    },
    reconstitutionNotes:
      "Often sold separately and combined, or as a blend. A commonly cited practice is ~250–500 mcg BPC-157 per dose and TB-500 dosed by weekly total. Add solvent slowly and swirl.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for long-term storage.",
    timing:
      "Timing is flexible; many split BPC-157 into once or twice daily and inject near the injury area when relevant.",
    frequency:
      "BPC-157 often daily (1–2×); TB-500 often a couple times per week with a loading phase, then maintenance.",
    cycleLength:
      "Commonly run for about 4–8 weeks during an acute recovery block, then stopped.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder stable for months to years when frozen and protected from light.",
      note: "Discard if cloudy, discolored, or past its beyond-use window.",
    },
    sources: [
      {
        label: "PubMed — BPC-157 review (Sikiric et al.)",
        url: "https://pubmed.ncbi.nlm.nih.gov/22168166/",
      },
      {
        label: "PubMed — Thymosin Beta-4 in tissue repair (Goldstein et al.)",
        url: "https://pubmed.ncbi.nlm.nih.gov/22356309/",
      },
    ],
  },

  {
    id: "tesamorelin",
    name: "Tesamorelin",
    aliases: ["Egrifta", "TH9507"],
    category: "Growth hormone-releasing hormone (GHRH) analog",
    purpose:
      "An FDA-approved GHRH analog used to reduce excess visceral (abdominal) fat in certain patients. Also studied for body composition more broadly.",
    vial: {
      typicalMg: 5,
      commonMg: [2, 5, 10],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 1,
      max: 2,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute with bacteriostatic water, adding slowly down the wall and swirling. The approved formulation is dosed around 2 mg daily.",
    storageNotes:
      "Refrigerate after reconstitution and use within the labeled window; protect from light.",
    timing: "Commonly injected at night before bed.",
    frequency: "Typically once daily.",
    cycleLength:
      "Often run continuously for several months in clinical use; community use varies.",
    shelfLife: {
      reconstitutedFridgeDays: 14,
      lyophilizedNote:
        "Lyophilized powder is stable refrigerated until its labeled expiry.",
      note: "The approved EGRIFTA label directs using the reconstituted solution promptly rather than storing it; follow the most conservative guidance.",
    },
    sources: [
      {
        label: "FDA — EGRIFTA (tesamorelin) prescribing information",
        url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022505",
      },
      {
        label: "PubMed — Tesamorelin and visceral fat (Falutz et al., 2010)",
        url: "https://pubmed.ncbi.nlm.nih.gov/20554979/",
      },
    ],
  },

  {
    id: "semaglutide",
    name: "Semaglutide",
    aliases: ["Ozempic", "Wegovy", "Rybelsus", "Sema"],
    category: "GLP-1 receptor agonist (weight loss / diabetes)",
    purpose:
      "An FDA-approved GLP-1 receptor agonist used for type 2 diabetes and chronic weight management. Slows gastric emptying and reduces appetite.",
    vial: {
      typicalMg: 5,
      commonMg: [2, 5, 10],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 0.25,
      max: 2.4,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Approved pens come pre-filled; compounded/research lyophilized vials are reconstituted with bacteriostatic water. Doses are titrated upward slowly (often starting near 0.25 mg weekly) to limit GI side effects.",
    storageNotes:
      "Refrigerate. Approved pens have specific in-use windows; reconstituted vials should be kept cold and protected from light.",
    timing: "Any time of day, same day each week; consistency matters more than time.",
    frequency: "Once weekly (long-acting).",
    cycleLength:
      "Generally taken continuously for weight management rather than cycled.",
    shelfLife: {
      reconstitutedFridgeDays: 28,
      lyophilizedNote:
        "Lyophilized powder is stable refrigerated for an extended period when sealed.",
      note: "Approved pens list their own discard windows — follow product labeling when applicable.",
    },
    sources: [
      {
        label: "FDA — Wegovy (semaglutide) prescribing information",
        url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215256",
      },
      {
        label: "NEJM — Semaglutide for weight loss (STEP 1, 2021)",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
      },
    ],
  },

  {
    id: "ghk-cu",
    name: "GHK-Cu",
    aliases: ["GHK-Copper", "Copper peptide", "GHK"],
    category: "Copper peptide (skin / repair)",
    purpose:
      "A naturally occurring copper-binding tripeptide studied for skin regeneration, collagen production, and wound healing. Used topically and (less commonly) by injection.",
    vial: {
      typicalMg: 50,
      commonMg: [50, 100],
      reconSolvent: "Bacteriostatic water",
      reconMl: 5,
    },
    dose: {
      min: 1,
      max: 2,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "For injectable use it is reconstituted with bacteriostatic water; solution typically takes on a blue tint from the copper. Many people use GHK-Cu topically rather than injected.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder keeps well frozen.",
    timing: "Timing is flexible; often dosed in the evening.",
    frequency: "Often daily or several times per week.",
    cycleLength: "Commonly run in blocks of about 4–8 weeks.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years frozen and protected from light.",
      note: "Discard if the color or clarity changes unexpectedly.",
    },
    sources: [
      {
        label: "PubMed — GHK-Cu in skin regeneration (Pickart & Margolina, 2018)",
        url: "https://pubmed.ncbi.nlm.nih.gov/29286324/",
      },
      {
        label: "PubMed — GHK peptide and tissue remodeling (Pickart, 2008)",
        url: "https://pubmed.ncbi.nlm.nih.gov/18505499/",
      },
    ],
  },

  {
    id: "tesamorelin-ipamorelin",
    name: "Tesamorelin / Ipamorelin",
    aliases: ["Tesa/Ipa", "Tesamorelin + Ipamorelin"],
    category: "GH secretagogue blend (GHRH + GHRP)",
    isBlend: true,
    purpose:
      "A premixed growth-hormone secretagogue blend, commonly 10 mg tesamorelin (a GHRH analog) plus 3 mg ipamorelin (a selective GHRP) in one vial. The two are paired to stimulate the body's own growth-hormone release for body composition and recovery.",
    vial: {
      typicalMg: 13,
      commonMg: [13],
      reconSolvent: "Bacteriostatic water",
      reconMl: 3,
    },
    dose: {
      min: 0.25,
      max: 2,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Because the two peptides are premixed at a fixed 10:3 ratio, you can only dose the blend as a whole — the dose range here is for the TESAMORELIN component, and the ipamorelin tracks with it automatically (about 3 mg ipamorelin per 10 mg tesamorelin). A commonly cited practice is ~1 mg tesamorelin + ~300 mcg ipamorelin once daily. Add solvent slowly down the wall and swirl gently, don't shake.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light; use promptly.",
    timing: "Commonly injected in the evening before bed, on an empty stomach.",
    frequency:
      "Often once daily, frequently run 5 days on / 2 days off.",
    cycleLength: "Commonly run in blocks of about 8 weeks on / 8 weeks off.",
    shelfLife: {
      reconstitutedFridgeDays: 14,
      lyophilizedNote:
        "Lyophilized powder is stable for months when kept cold, dry, and protected from light.",
      note: "Use the reconstituted solution promptly; discard if cloudy or discolored.",
    },
    sources: [
      {
        label: "Peptide Dosing Protocols — Tesamorelin / Ipamorelin stack",
        url: "https://www.peptidedosingprotocols.com/stacks/tesamorelin-ipamorelin",
      },
      {
        label: "Jay Campbell — Tesamorelin and Ipamorelin blend benefits",
        url: "https://jaycampbell.com/peptides/tesamorelin-and-ipamorelin-blend-benefits/",
      },
    ],
  },

  {
    id: "glow-blend",
    name: "GLOW blend",
    aliases: ["Glow", "GHK-Cu/BPC-157/TB-500"],
    category: "Recovery / skin / healing blend",
    isBlend: true,
    purpose:
      "A premixed recovery and skin blend, commonly a 70 mg vial containing 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500. Combines a copper peptide with the popular BPC-157/TB-500 healing pair.",
    vial: {
      typicalMg: 70,
      commonMg: [70],
      reconSolvent: "Bacteriostatic water",
      reconMl: 3,
    },
    dose: {
      min: 2,
      max: 3,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Adding 3 mL of bacteriostatic water to a 70 mg vial gives roughly 23.3 mg/mL. The dose range is the TOTAL blend per injection; for example, ~2.33 mg/day delivers roughly 1.7 mg GHK-Cu + 0.33 mg BPC-157 + 0.33 mg TB-500. Add solvent slowly and swirl gently.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for long-term storage.",
    timing: "Timing is flexible; often dosed once daily.",
    frequency: "Often daily.",
    cycleLength: "Commonly run in blocks of about 4–8 weeks.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years frozen and protected from light.",
      note: "Discard if cloudy, discolored, or past its beyond-use window.",
    },
    sources: [
      {
        label: "Peptide Dosages — GLOW peptide blend (70 mg vial) protocol",
        url: "https://peptidedosages.com/peptide-blend-dosages/glow-peptide-blend-70-mg-vial-dosage-protocol/",
      },
    ],
  },

  {
    id: "klow-blend",
    name: "KLOW blend",
    aliases: ["Klow", "GHK-Cu/BPC-157/TB-500/KPV"],
    category: "Recovery / anti-inflammatory blend",
    isBlend: true,
    purpose:
      "A premixed recovery and anti-inflammatory blend, commonly an 80 mg vial containing 50 mg GHK-Cu + 10 mg BPC-157 + 10 mg TB-500 + 10 mg KPV. Adds KPV (an anti-inflammatory tripeptide) to the GLOW-style base.",
    vial: {
      typicalMg: 80,
      commonMg: [80],
      reconSolvent: "Bacteriostatic water",
      reconMl: 3,
    },
    dose: {
      min: 2,
      max: 3,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Adding 3 mL of bacteriostatic water to an 80 mg vial gives roughly 26.7 mg/mL. The dose range is the TOTAL blend per injection; the four components are delivered together in their fixed vial ratio. Add solvent slowly and swirl gently.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for long-term storage.",
    timing: "Timing is flexible; often dosed once daily.",
    frequency: "Often daily.",
    cycleLength: "Commonly run in blocks of about 4–8 weeks.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years frozen and protected from light.",
      note: "Discard if cloudy, discolored, or past its beyond-use window.",
    },
    sources: [
      {
        label: "Bio Longevity Labs — KLOW blend (GHK-Cu, BPC-157, TB-500, KPV)",
        url: "https://biolongevitylabs.com/product/klow-blend-ghk-cu-bpc-157-tb-500-kpv/",
      },
    ],
  },

  {
    id: "ghk-cu-kpv",
    name: "GHK-Cu / KPV blend",
    aliases: ["GHK-Cu/KPV", "GHKPV"],
    category: "Skin / anti-inflammatory blend",
    isBlend: true,
    purpose:
      "A premixed skin and anti-inflammatory blend, commonly 50 mg GHK-Cu (a copper peptide) + 10 mg KPV (an anti-inflammatory tripeptide) in one vial.",
    vial: {
      typicalMg: 60,
      commonMg: [60],
      reconSolvent: "Bacteriostatic water",
      reconMl: 3,
    },
    dose: {
      min: 200,
      max: 300,
      unit: "mcg",
      perDose: true,
    },
    reconstitutionNotes:
      "The dose range is cited as ~200–300 mcg of EACH component per dose (GHK-Cu and KPV), not 200–300 mcg of the blend total. Add bacteriostatic water slowly down the wall and swirl gently; the solution often takes on a blue tint from the copper.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for long-term storage.",
    timing: "Timing is flexible; often dosed in the evening.",
    frequency: "Often daily or 3–5 times per week.",
    cycleLength: "Commonly run in blocks of about 4–8 weeks.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years frozen and protected from light.",
      note: "Discard if the color or clarity changes unexpectedly.",
    },
    sources: [
      {
        label: "Valor Peptides — GHK-Cu / KPV blend",
        url: "https://valorpeptides.com/product/ghk-cu-kpv-blend/",
      },
    ],
  },

  {
    id: "glutathione",
    name: "Glutathione",
    aliases: ["L-Glutathione", "GSH"],
    category: "Antioxidant (tripeptide)",
    isBlend: false,
    purpose:
      "A naturally occurring antioxidant tripeptide (glutamate, cysteine, glycine) used to support oxidative-stress defense, detoxification pathways, and skin tone.",
    vial: {
      typicalMg: 600,
      commonMg: [200, 600, 1500],
      reconSolvent: "Bacteriostatic water",
      reconMl: 3,
    },
    dose: {
      min: 100,
      max: 600,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute with bacteriostatic water, adding slowly and swirling gently. Common practices include ~100 mg subcutaneously daily up to 5x/week, or ~200–600 mg SC/IM 2–3x/week.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder keeps well frozen.",
    timing: "Timing is flexible.",
    frequency: "Commonly daily up to 5x/week (lower dose) or 2–3x/week (higher dose).",
    cycleLength: "Commonly run in blocks of about 4–12 weeks.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months when kept cold, dry, and protected from light.",
      note: "Glutathione oxidizes readily; discard if the solution discolors.",
    },
    sources: [
      {
        label: "Peptides.org — L-Glutathione dosage calculator",
        url: "https://www.peptides.org/l-glutathione-dosage-calculator/",
      },
    ],
  },

  {
    id: "epithalon",
    name: "Epithalon",
    aliases: ["Epitalon", "Epithalon", "AEDG"],
    category: "Longevity / telomere peptide",
    isBlend: false,
    purpose:
      "A synthetic tetrapeptide (Ala-Glu-Asp-Gly) studied for longevity, telomerase activity, and circadian/pineal regulation. Human evidence is limited.",
    vial: {
      typicalMg: 10,
      commonMg: [10, 20],
      reconSolvent: "Bacteriostatic water",
      reconMl: 2,
    },
    dose: {
      min: 5,
      max: 10,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute with bacteriostatic water, adding slowly and swirling gently. Higher doses (up to ~50 mg) have not shown added benefit in cited protocols, so more is not necessarily better.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder can be frozen for long-term storage.",
    timing: "Often dosed once daily, commonly in the evening.",
    frequency: "Once daily during a course.",
    cycleLength:
      "Run as a short course of about 10–20 consecutive days, then a long gap — typically repeated only ~1–2 times per year (roughly 4–6 months between courses).",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months to years frozen and protected from light.",
      note: "Discard if cloudy, discolored, or past its beyond-use window.",
    },
    sources: [
      {
        label: "Peptides.org — Epithalon dosage",
        url: "https://www.peptides.org/epithalon-dosage/",
      },
    ],
  },

  {
    id: "nad-plus",
    name: "NAD+",
    aliases: ["NAD", "NAD+", "Nicotinamide adenine dinucleotide"],
    category: "Coenzyme (cellular energy / longevity)",
    isBlend: false,
    purpose:
      "A coenzyme found in all living cells, central to energy metabolism and DNA repair. Supplemented for cellular energy, metabolic support, and longevity goals.",
    vial: {
      typicalMg: 500,
      commonMg: [100, 500, 1000],
      reconSolvent: "Bacteriostatic water",
      reconMl: 5,
    },
    dose: {
      min: 50,
      max: 200,
      unit: "mg",
      perDose: true,
    },
    reconstitutionNotes:
      "Reconstitute with bacteriostatic water, adding slowly and swirling gently. A commonly cited practice is ~100 mg subcutaneously 2–3x/week; start low (~20–50 mg) and titrate up, with many capping around 300 mg/week. Subcutaneous NAD+ can sting or cause flushing, so inject slowly.",
    storageNotes:
      "Refrigerate after reconstitution and protect from light. Lyophilized powder keeps well frozen.",
    timing: "Timing is flexible; many dose earlier in the day.",
    frequency: "Commonly 2–3 times per week.",
    cycleLength: "Often run continuously or in blocks; no standardized cycle.",
    shelfLife: {
      reconstitutedFridgeDays: 30,
      lyophilizedNote:
        "Lyophilized powder is stable for months when kept cold, dry, and protected from light.",
      note: "Discard if cloudy, discolored, or past its beyond-use window.",
    },
    sources: [
      {
        label: "Empower Pharmacy — NAD+ injection",
        url: "https://www.empowerpharmacy.com/compounding-pharmacy/nad-injection/",
      },
    ],
  },
];

export default peptides;
