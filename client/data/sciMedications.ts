/* ───────────────────────── types ───────────────────────── */

export type PharmacStatusLabel = "Funded" | "Special Authority" | "Private" | "Unknown";

export type SciMedication = {
  id: string;
  name: string;
  category: string;
  usedFor: string[];
  shortSideEffects: string;
  sideEffects: {
    common: string[];
    lessCommon: string[];
    serious: string[];
  };
  pharmacStatus: {
    label: PharmacStatusLabel;
    details: string;
  };
  notes: string;
  forms: string[];
};

/* ───────────────────────── filter options ───────────────────────── */

export const SCI_MEDICATION_CATEGORIES = [
  "Spasticity Management",
  "Neuropathic Pain",
  "Musculoskeletal Pain",
  "Bladder Management",
  "Bowel Management",
  "Autonomic Dysreflexia",
  "DVT / Anticoagulation",
  "Bone Health",
  "Mood / Sleep",
  "Gastric Protection",
  "UTI Antibiotics",
] as const;

export const PHARMAC_LABELS: PharmacStatusLabel[] = [
  "Funded",
  "Special Authority",
  "Private",
  "Unknown",
];

/* ───────────────────────── tag colours ───────────────────────── */

export const CATEGORY_COLORS: Record<string, string> = {
  "Spasticity Management":  "#8B5CF6",
  "Neuropathic Pain":       "#EC4899",
  "Musculoskeletal Pain":   "#3B82F6",
  "Bladder Management":     "#06B6D4",
  "Bowel Management":       "#F59E0B",
  "Autonomic Dysreflexia":  "#EF4444",
  "DVT / Anticoagulation":  "#DC2626",
  "Bone Health":            "#78716C",
  "Mood / Sleep":           "#14B8A6",
  "Gastric Protection":     "#16A34A",
  "UTI Antibiotics":        "#EA580C",
};

/* ───────────────────────── data ───────────────────────── */

export const SCI_MEDICATIONS: SciMedication[] = [
  {
    id: "baclofen",
    name: "Baclofen",
    category: "Spasticity Management",
    usedFor: ["Muscle spasticity", "Muscle spasms", "Stiffness from SCI"],
    shortSideEffects: "Drowsiness, dizziness, weakness",
    sideEffects: {
      common: ["Drowsiness", "Dizziness", "Muscle weakness", "Nausea", "Fatigue"],
      lessCommon: ["Confusion", "Dry mouth", "Constipation", "Low blood pressure"],
      serious: [
        "Sudden withdrawal can cause seizures or dangerously high blood pressure — never stop suddenly without medical advice",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for spasticity management. Available as oral tablets and, in some cases, intrathecal pump solution.",
    },
    notes:
      "One of the most commonly prescribed medications for spasticity after SCI. Oral dose is usually started low and increased gradually. An intrathecal (pump) form exists for severe spasticity — discuss with your spinal team.",
    forms: ["Oral tablets (5 mg, 10 mg, 20 mg)", "Intrathecal pump solution"],
  },

  {
    id: "tizanidine",
    name: "Tizanidine",
    category: "Spasticity Management",
    usedFor: ["Muscle spasticity", "Spasm episodes", "Tone management"],
    shortSideEffects: "Drowsiness, low blood pressure, dry mouth",
    sideEffects: {
      common: ["Drowsiness", "Low blood pressure", "Dry mouth", "Dizziness", "Fatigue"],
      lessCommon: ["Nausea", "Muscle weakness", "Low mood"],
      serious: [
        "Liver problems (rare) — blood tests may be needed periodically",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Available on Special Authority. Prescriber must apply to PHARMAC.",
    },
    notes:
      "An alternative to Baclofen for spasticity. Can sometimes be used alongside it. Works best when taken close to the time of expected spasms.",
    forms: ["Oral tablets (2 mg, 4 mg)", "Oral capsules"],
  },

  {
    id: "diazepam",
    name: "Diazepam",
    category: "Spasticity Management",
    usedFor: ["Muscle spasticity", "Anxiety", "Acute spasm episodes"],
    shortSideEffects: "Drowsiness, confusion, dependence risk",
    sideEffects: {
      common: ["Drowsiness", "Dizziness", "Confusion", "Clumsiness"],
      lessCommon: ["Nausea", "Low mood", "Dry mouth"],
      serious: [
        "Risk of dependence with long-term use",
        "Respiratory depression at high doses",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Typically prescribed short-term for acute spasm episodes.",
    },
    notes:
      "A benzodiazepine most useful for short-term or as-needed spasm relief. Long-term use carries a real risk of dependence. Discuss any ongoing use with your GP or spinal team.",
    forms: ["Oral tablets (2 mg, 5 mg, 10 mg)", "Oral syrup"],
  },

  {
    id: "pregabalin",
    name: "Pregabalin",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic (nerve) pain", "Burning or shooting pain", "Pain below the injury level"],
    shortSideEffects: "Dizziness, drowsiness, swollen ankles",
    sideEffects: {
      common: ["Dizziness", "Drowsiness", "Swollen ankles or feet", "Weight gain", "Blurred vision"],
      lessCommon: ["Memory problems", "Unsteadiness", "Dry mouth", "Constipation"],
      serious: [
        "Suicidal thoughts (rare) — seek help immediately if this happens",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. Prescriber must demonstrate a neuropathic pain diagnosis.",
    },
    notes:
      "Commonly prescribed for central neuropathic pain after SCI. Usually started at a low dose and increased gradually. Can take several weeks to reach full effect.",
    forms: ["Oral capsules (25 mg, 50 mg, 75 mg, 100 mg, 150 mg, 300 mg)", "Oral solution"],
  },

  {
    id: "gabapentin",
    name: "Gabapentin",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic (nerve) pain", "Post-injury pain", "Sensory changes"],
    shortSideEffects: "Drowsiness, dizziness, unsteadiness",
    sideEffects: {
      common: ["Drowsiness", "Dizziness", "Unsteadiness", "Fatigue", "Nausea"],
      lessCommon: ["Memory problems", "Weight gain", "Mood changes", "Dry mouth"],
      serious: [
        "Suicidal thoughts (rare) — seek help immediately if this happens",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for neuropathic pain.",
    },
    notes:
      "Similar mechanism to Pregabalin but usually requires more frequent dosing (up to 3 times daily). A good option if Pregabalin is not tolerated or available on Special Authority.",
    forms: ["Oral capsules (100 mg, 300 mg, 400 mg)", "Oral solution"],
  },

  {
    id: "amitriptyline",
    name: "Amitriptyline",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic pain", "Sleep disturbance", "Low mood"],
    shortSideEffects: "Drowsiness, dry mouth, constipation",
    sideEffects: {
      common: ["Drowsiness", "Dry mouth", "Constipation", "Weight gain", "Blurred vision"],
      lessCommon: ["Low blood pressure", "Urinary retention", "Confusion (especially in older adults)"],
      serious: [
        "Heart rhythm changes — tell your GP if you have chest pain or feel faint",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Often used at a low dose for pain rather than at a full antidepressant dose.",
    },
    notes:
      "A tricyclic antidepressant used at low dose for neuropathic pain after SCI. The drowsiness side effect can be useful if taken at night — it may also help with sleep.",
    forms: ["Oral tablets (10 mg, 25 mg, 50 mg, 100 mg)", "Oral liquid"],
  },

  {
    id: "oxybutynin",
    name: "Oxybutynin",
    category: "Bladder Management",
    usedFor: ["Neurogenic bladder", "Overactive bladder", "Bladder spasms"],
    shortSideEffects: "Dry mouth, constipation, blurred vision",
    sideEffects: {
      common: ["Dry mouth", "Constipation", "Blurred vision", "Drowsiness", "Nausea"],
      lessCommon: ["Confusion", "Urinary retention", "Difficulty sweating"],
      serious: [
        "Heat stroke risk due to reduced sweating — stay cool and hydrated in hot weather",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for neurogenic bladder management.",
    },
    notes:
      "Reduces bladder contractions. Very commonly used after SCI for neurogenic bladder. Dry mouth can often be managed with sugar-free sweets or gum.",
    forms: ["Oral tablets (5 mg)", "Oral syrup", "Transdermal patch"],
  },

  {
    id: "mirabegron",
    name: "Mirabegron",
    category: "Bladder Management",
    usedFor: ["Overactive bladder", "Neurogenic bladder", "Urgency and frequency"],
    shortSideEffects: "Raised blood pressure, headache, nausea",
    sideEffects: {
      common: ["Raised blood pressure", "Headache", "Nausea", "Dizziness"],
      lessCommon: ["Fatigue", "Abdominal discomfort", "Skin rash"],
      serious: [],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. Often used when anticholinergics (e.g. Oxybutynin) are not tolerated.",
    },
    notes:
      "A newer class of bladder medication that relaxes the bladder muscle. Generally fewer cognitive side effects than Oxybutynin, making it a good alternative for some people.",
    forms: ["Oral tablets (25 mg, 50 mg)"],
  },

  {
    id: "docusate",
    name: "Docusate Sodium",
    category: "Bowel Management",
    usedFor: ["Constipation", "Neurogenic bowel", "Stool softening"],
    shortSideEffects: "Stomach cramps, diarrhoea, nausea",
    sideEffects: {
      common: ["Stomach cramps", "Diarrhoea", "Nausea", "Abdominal discomfort"],
      lessCommon: ["Skin rash"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC as a stool softener for constipation management.",
    },
    notes:
      "A stool softener commonly used as part of a bowel management programme after SCI. Works by drawing water into the stool. Often used alongside other bowel medications such as Macrogol.",
    forms: ["Oral capsules (100 mg)", "Oral liquid"],
  },

  {
    id: "macrogol",
    name: "Macrogol (Movicol)",
    category: "Bowel Management",
    usedFor: ["Constipation", "Bowel preparation", "Neurogenic bowel management"],
    shortSideEffects: "Stomach cramps, bloating, diarrhoea",
    sideEffects: {
      common: ["Stomach cramps", "Bloating", "Diarrhoea", "Abdominal discomfort", "Nausea"],
      lessCommon: ["Electrolyte imbalance with prolonged use"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Commonly used for ongoing constipation management.",
    },
    notes:
      "An osmotic laxative that draws water into the bowel to soften stools. A mainstay of neurogenic bowel management after SCI. Dose is usually adjusted based on individual needs.",
    forms: ["Oral powder (sachet — mix with water)", "Oral solution"],
  },

  {
    id: "gtn",
    name: "GTN (Nitroglycerin)",
    category: "Autonomic Dysreflexia",
    usedFor: ["Autonomic dysreflexia (AD)", "Acute high blood pressure episodes", "Emergency BP relief"],
    shortSideEffects: "Headache, dizziness, flushing",
    sideEffects: {
      common: ["Headache", "Dizziness", "Flushing", "Nausea", "Low blood pressure"],
      lessCommon: ["Rapid heartbeat", "Syncope (fainting)"],
      serious: [
        "Severe low blood pressure — sit or lie down if you feel lightheaded",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Used in emergency management of autonomic dysreflexia.",
    },
    notes:
      "GTN spray or tablet is carried as an emergency treatment for autonomic dysreflexia (AD). If you have a history of AD, talk to your spinal team about when and how to use it. Do not use without guidance.",
    forms: ["Sublingual tablet", "Sublingual spray", "Transdermal patch"],
  },

  {
    id: "nifedipine",
    name: "Nifedipine",
    category: "Autonomic Dysreflexia",
    usedFor: ["Autonomic dysreflexia (AD)", "High blood pressure", "Ongoing BP management"],
    shortSideEffects: "Headache, flushing, ankle swelling",
    sideEffects: {
      common: ["Headache", "Flushing", "Ankle swelling", "Dizziness", "Nausea"],
      lessCommon: ["Fatigue", "Rapid heartbeat", "Gum overgrowth (long-term)"],
      serious: [
        "Severe low blood pressure — especially when standing up quickly",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Can be used both for acute AD episodes and for ongoing blood pressure management.",
    },
    notes:
      "A calcium channel blocker that relaxes blood vessels. Used for autonomic dysreflexia — sometimes as an emergency dose, sometimes as ongoing treatment. Your spinal team will advise the right approach for you.",
    forms: ["Oral tablets (10 mg immediate-release, 30 mg / 60 mg extended-release)", "Oral liquid"],
  },

  /* ─── spasticity management ─── */

  {
    id: "dantrolene",
    name: "Dantrolene",
    category: "Spasticity Management",
    usedFor: ["Muscle spasticity", "Severe spasticity", "Spasm reduction"],
    shortSideEffects: "Drowsiness, weakness, nausea",
    sideEffects: {
      common: ["Drowsiness", "Muscle weakness", "Nausea", "Dizziness", "Diarrhoea"],
      lessCommon: ["Dry mouth", "Blurred vision", "Confusion"],
      serious: [
        "Liver damage — blood tests to check liver function are needed regularly",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for spasticity management.",
    },
    notes:
      "Works directly on muscle tissue rather than the nervous system, which can mean less drowsiness than other spasticity medicines. Liver function must be checked with regular blood tests.",
    forms: ["Oral capsules", "Oral suspension"],
  },

  {
    id: "clonazepam",
    name: "Clonazepam",
    category: "Spasticity Management",
    usedFor: ["Muscle spasticity", "Spasm episodes", "Muscle spasm relief"],
    shortSideEffects: "Drowsiness, dizziness, confusion",
    sideEffects: {
      common: ["Drowsiness", "Dizziness", "Confusion", "Unsteadiness", "Fatigue"],
      lessCommon: ["Nausea", "Dry mouth", "Memory problems"],
      serious: [
        "Risk of dependence with prolonged use",
        "Respiratory depression at high doses — do not combine with alcohol",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Typically used at low doses for spasticity.",
    },
    notes:
      "A benzodiazepine sometimes used for spasticity, especially when spasms are frequent or disruptive. Long-term dependence is a real risk — discuss ongoing use with your GP or spinal team.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "onabotulinumtoxin-a",
    name: "OnabotulinumtoxinA (Botox)",
    category: "Spasticity Management",
    usedFor: ["Focal spasticity", "Upper limb spasticity", "Lower limb spasticity"],
    shortSideEffects: "Injection site pain, muscle weakness, fatigue",
    sideEffects: {
      common: ["Injection site pain or bruising", "Weakness near the injection site", "Fatigue", "Nausea"],
      lessCommon: ["Flu-like symptoms", "Dry mouth", "Urinary retention"],
      serious: [
        "Spread of toxin to muscles away from the injection site (rare) — seek help immediately if breathing or swallowing becomes difficult",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. Funded by PHARMAC for spasticity after SCI under specific criteria.",
    },
    notes:
      "Injected into specific muscles by a specialist to reduce spasticity in a targeted area. Effects typically last three to six months. Part of an ongoing treatment programme — discuss goals and timing with your spinal team.",
    forms: ["Intramuscular injection"],
  },

  {
    id: "intrathecal-baclofen",
    name: "Intrathecal Baclofen (Baclofen Pump)",
    category: "Spasticity Management",
    usedFor: ["Severe spasticity", "Spasticity not controlled by oral medicines", "Generalised spasticity"],
    shortSideEffects: "Drowsiness, nausea, low blood pressure",
    sideEffects: {
      common: ["Drowsiness", "Nausea", "Dizziness", "Low blood pressure", "Fatigue"],
      lessCommon: ["Confusion", "Muscle weakness", "Headache"],
      serious: [
        "Pump failure or catheter problems can cause sudden loss of medication — withdrawal symptoms include high fever, muscle rigidity, and agitation. Seek emergency care.",
        "Overdose can cause respiratory depression — the pump dose is set by your specialist and must not be changed without medical involvement",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. Funded by PHARMAC for severe spasticity not adequately managed by oral medicines.",
    },
    notes:
      "Baclofen delivered directly into the fluid around the spinal cord via a surgically implanted pump. Allows much lower doses to be effective compared to oral Baclofen, often with fewer side effects. The pump is managed by a specialist team — never adjust settings yourself.",
    forms: ["Intrathecal pump (surgically implanted)"],
  },

  /* ─── neuropathic pain ─── */

  {
    id: "nortriptyline",
    name: "Nortriptyline",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic pain", "Nerve pain after SCI", "Low mood with pain"],
    shortSideEffects: "Drowsiness, dry mouth, constipation",
    sideEffects: {
      common: ["Drowsiness", "Dry mouth", "Constipation", "Dizziness", "Weight gain"],
      lessCommon: ["Blurred vision", "Urinary retention", "Low blood pressure"],
      serious: [
        "Heart rhythm changes — tell your GP if you have chest pain or feel faint",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Similar to Amitriptyline but may cause less drowsiness for some people.",
    },
    notes:
      "A tricyclic antidepressant used at low dose for neuropathic pain. Often taken at night because of the drowsiness side effect. May also help with sleep. Similar to Amitriptyline but sometimes better tolerated.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "duloxetine",
    name: "Duloxetine",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic pain", "Central pain syndrome", "Pain with low mood"],
    shortSideEffects: "Nausea, drowsiness, dizziness",
    sideEffects: {
      common: ["Nausea", "Drowsiness", "Dizziness", "Dry mouth", "Sweating"],
      lessCommon: ["Constipation", "Headache", "Low blood pressure"],
      serious: [
        "Suicidal thoughts (rare) — seek help immediately if this happens",
        "Liver problems with long-term use — blood tests may be needed",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required for neuropathic pain indications.",
    },
    notes:
      "An SNRI antidepressant that works on both serotonin and noradrenaline. Can help with both pain and low mood. Usually takes a few weeks to reach full effect. Do not stop suddenly — reduce the dose gradually with your GP.",
    forms: ["Oral capsules"],
  },

  {
    id: "venlafaxine",
    name: "Venlafaxine",
    category: "Neuropathic Pain",
    usedFor: ["Neuropathic pain", "Central pain", "Anxiety with pain"],
    shortSideEffects: "Nausea, headache, dizziness",
    sideEffects: {
      common: ["Nausea", "Headache", "Dizziness", "Sweating", "Drowsiness"],
      lessCommon: ["Raised blood pressure", "Weight changes", "Sexual side effects"],
      serious: [
        "Suicidal thoughts (rare) — seek help immediately if this happens",
        "Discontinuation syndrome — stopping suddenly can cause unpleasant withdrawal effects",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An SNRI used for both pain and mood. Stopping suddenly can cause withdrawal symptoms — always reduce the dose gradually with your GP. Blood pressure may be checked periodically.",
    forms: ["Oral capsules (extended-release)", "Oral tablets"],
  },

  {
    id: "carbamazepine",
    name: "Carbamazepine",
    category: "Neuropathic Pain",
    usedFor: ["Central neuropathic pain", "Shooting or stabbing pain", "Sharp nerve pain"],
    shortSideEffects: "Dizziness, drowsiness, unsteadiness",
    sideEffects: {
      common: ["Dizziness", "Drowsiness", "Unsteadiness", "Nausea", "Blurred vision"],
      lessCommon: ["Skin rash", "Low sodium", "Mood changes"],
      serious: [
        "Severe skin rash (Stevens-Johnson syndrome) — seek emergency care immediately if a rash develops, especially in the first few weeks",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An anticonvulsant sometimes used for sharp, shooting neuropathic pain after SCI. The dose must be increased slowly. Blood tests may be needed to monitor levels and check sodium.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  /* ─── musculoskeletal pain ─── */

  {
    id: "paracetamol",
    name: "Paracetamol",
    category: "Musculoskeletal Pain",
    usedFor: ["General pain relief", "Musculoskeletal pain", "Mild to moderate pain"],
    shortSideEffects: "Usually well tolerated at recommended doses",
    sideEffects: {
      common: ["Usually well tolerated"],
      lessCommon: ["Nausea", "Stomach upset"],
      serious: [
        "Liver damage from overdose — never exceed the recommended daily amount, and check all other medicines for hidden paracetamol",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Also available over the counter.",
    },
    notes:
      "The most widely used pain reliever. Safe for most people at the recommended dose. Be careful not to accidentally double up — many combination products (cold and flu medicines, other painkillers) already contain paracetamol.",
    forms: ["Oral tablets", "Oral liquid", "Suppositories"],
  },

  {
    id: "ibuprofen",
    name: "Ibuprofen",
    category: "Musculoskeletal Pain",
    usedFor: ["Musculoskeletal pain", "Inflammation", "Joint or muscle stiffness"],
    shortSideEffects: "Stomach upset, heartburn, nausea",
    sideEffects: {
      common: ["Stomach upset", "Heartburn", "Nausea", "Dizziness"],
      lessCommon: ["Fluid retention", "Raised blood pressure", "Headache"],
      serious: [
        "Increased risk of stomach bleeding or ulcers — especially with long-term use",
        "Kidney problems — stay well hydrated, particularly important after SCI",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Also available over the counter.",
    },
    notes:
      "An anti-inflammatory pain reliever. Always take with food to reduce stomach upset. People managing bladder or bowel programmes should stay well hydrated while taking it. A stomach-protecting medicine (such as Omeprazole) is often prescribed alongside for longer-term use.",
    forms: ["Oral tablets", "Oral liquid", "Topical gel"],
  },

  {
    id: "naproxen",
    name: "Naproxen",
    category: "Musculoskeletal Pain",
    usedFor: ["Musculoskeletal pain", "Inflammation", "Ongoing joint or muscle pain"],
    shortSideEffects: "Stomach upset, headache, dizziness",
    sideEffects: {
      common: ["Stomach upset", "Headache", "Dizziness", "Heartburn"],
      lessCommon: ["Fluid retention", "Skin rash", "Fatigue"],
      serious: [
        "Increased risk of stomach bleeding",
        "Kidney or cardiovascular problems with prolonged use",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "Similar to Ibuprofen but taken less frequently. Take with food. Long-term use should be discussed with your GP, especially regarding stomach protection.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "tramadol",
    name: "Tramadol",
    category: "Musculoskeletal Pain",
    usedFor: ["Moderate to severe pain", "Pain not controlled by other options", "Mixed neuropathic and musculoskeletal pain"],
    shortSideEffects: "Nausea, dizziness, drowsiness",
    sideEffects: {
      common: ["Nausea", "Dizziness", "Drowsiness", "Headache", "Constipation"],
      lessCommon: ["Vomiting", "Dry mouth", "Sweating", "Confusion"],
      serious: [
        "Seizure risk — especially at higher doses or when combined with certain other medicines",
        "Serotonin syndrome if combined with antidepressants — tell your GP about all your medicines",
        "Risk of dependence with prolonged use",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "Works on pain pathways and also affects serotonin and noradrenaline. Constipation can be significant for SCI users — discuss bowel management with your GP. Do not combine with antidepressants without medical advice.",
    forms: ["Oral tablets", "Oral capsules (extended-release)", "Oral liquid"],
  },

  {
    id: "codeine",
    name: "Codeine",
    category: "Musculoskeletal Pain",
    usedFor: ["Moderate pain", "Pain not relieved by paracetamol alone", "Short-term pain relief"],
    shortSideEffects: "Constipation, drowsiness, nausea",
    sideEffects: {
      common: ["Constipation", "Drowsiness", "Nausea", "Dizziness", "Headache"],
      lessCommon: ["Vomiting", "Dry mouth", "Confusion"],
      serious: [
        "Respiratory depression at high doses",
        "Risk of dependence with prolonged use",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Often prescribed in combination with paracetamol.",
    },
    notes:
      "A mild opioid painkiller. The constipation side effect can be particularly problematic for SCI users managing a neurogenic bowel — discuss bowel management with your GP. Usually prescribed for short-term use.",
    forms: ["Oral tablets (often combined with paracetamol)", "Oral liquid"],
  },

  {
    id: "morphine",
    name: "Morphine",
    category: "Musculoskeletal Pain",
    usedFor: ["Severe pain", "Chronic pain not managed by other options", "Breakthrough pain"],
    shortSideEffects: "Drowsiness, constipation, nausea",
    sideEffects: {
      common: ["Drowsiness", "Constipation", "Nausea", "Vomiting", "Dizziness"],
      lessCommon: ["Confusion", "Dry mouth", "Itching", "Low blood pressure"],
      serious: [
        "Respiratory depression — seek help immediately if breathing becomes slow or shallow",
        "Risk of dependence with ongoing use",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Typically prescribed by a specialist or GP with pain management expertise.",
    },
    notes:
      "A strong opioid painkiller, usually reserved for severe pain that cannot be managed with other options. Constipation is almost universal — a bowel management programme is essential. Prescribed and closely monitored by your medical team.",
    forms: ["Oral tablets", "Oral liquid", "Slow-release capsules", "Injection"],
  },

  /* ─── bladder management ─── */

  {
    id: "tolterodine",
    name: "Tolterodine",
    category: "Bladder Management",
    usedFor: ["Overactive bladder", "Neurogenic bladder", "Urgency and leakage"],
    shortSideEffects: "Dry mouth, constipation, drowsiness",
    sideEffects: {
      common: ["Dry mouth", "Constipation", "Drowsiness", "Blurred vision", "Nausea"],
      lessCommon: ["Confusion", "Urinary retention", "Dizziness"],
      serious: [
        "Heart rhythm changes (rare) — tell your GP if your heart feels like it is racing or pounding",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for overactive bladder.",
    },
    notes:
      "An anticholinergic that reduces bladder contractions. Similar mechanism to Oxybutynin but some people find it causes fewer thinking or memory problems. Discuss the best option with your spinal team.",
    forms: ["Oral tablets", "Oral capsules (extended-release)"],
  },

  {
    id: "solifenacin",
    name: "Solifenacin",
    category: "Bladder Management",
    usedFor: ["Overactive bladder", "Urgency", "Bladder overactivity"],
    shortSideEffects: "Constipation, dry mouth, blurred vision",
    sideEffects: {
      common: ["Constipation", "Dry mouth", "Blurred vision", "Nausea"],
      lessCommon: ["Drowsiness", "Urinary retention", "Dizziness", "Confusion"],
      serious: [
        "Heart rhythm changes (rare)",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. May be used when other anticholinergics are not well tolerated.",
    },
    notes:
      "A more selective anticholinergic that acts mainly on the bladder, which may mean fewer side effects elsewhere compared to older options. Discuss with your spinal team whether this is the right choice for you.",
    forms: ["Oral tablets"],
  },

  {
    id: "tamsulosin",
    name: "Tamsulosin",
    category: "Bladder Management",
    usedFor: ["Bladder outlet problems", "Difficulty starting urination", "Incomplete emptying"],
    shortSideEffects: "Dizziness, low blood pressure, headache",
    sideEffects: {
      common: ["Dizziness", "Low blood pressure (especially when standing)", "Headache", "Nausea"],
      lessCommon: ["Fatigue", "Runny nose", "Back pain"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An alpha blocker that relaxes the muscles around the bladder outlet, making it easier to pass urine. Useful for SCI users who have difficulty with bladder emptying. Originally developed for prostate problems but commonly used after SCI.",
    forms: ["Oral capsules (modified-release)"],
  },

  {
    id: "doxazosin",
    name: "Doxazosin",
    category: "Bladder Management",
    usedFor: ["Bladder outlet obstruction", "Difficulty emptying", "Bladder outlet spasm"],
    shortSideEffects: "Dizziness, low blood pressure, fatigue",
    sideEffects: {
      common: ["Dizziness", "Low blood pressure", "Fatigue", "Headache", "Nausea"],
      lessCommon: ["Fluid retention", "Drowsiness", "Back pain"],
      serious: [
        "Severe low blood pressure — especially with the first dose. Take the first dose in bed.",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An alpha blocker used to relax the bladder outlet. Similar to Tamsulosin but also has a blood-pressure-lowering effect. The first dose can cause a significant drop in blood pressure — your GP will advise on how to manage this safely.",
    forms: ["Oral tablets"],
  },

  {
    id: "bethanechol",
    name: "Bethanechol",
    category: "Bladder Management",
    usedFor: ["Bladder emptying problems", "Neurogenic bladder (retention)", "Incomplete emptying"],
    shortSideEffects: "Stomach cramps, sweating, dizziness",
    sideEffects: {
      common: ["Stomach cramps", "Sweating", "Dizziness", "Nausea", "Increased saliva"],
      lessCommon: ["Low blood pressure", "Blurred vision", "Slow heartbeat"],
      serious: [
        "Severe low blood pressure — sit down if you feel faint after taking",
      ],
    },
    pharmacStatus: {
      label: "Unknown",
      details: "Availability in NZ may be limited. Discuss with your GP or spinal team.",
    },
    notes:
      "Stimulates the bladder to contract, which can help with emptying when the bladder is not doing so well on its own. Usually prescribed and supervised by a specialist.",
    forms: ["Oral tablets"],
  },

  {
    id: "desmopressin",
    name: "Desmopressin",
    category: "Bladder Management",
    usedFor: ["Nocturia", "Excessive overnight urine production", "Bladder volume management"],
    shortSideEffects: "Headache, nausea, low sodium",
    sideEffects: {
      common: ["Headache", "Nausea", "Dizziness"],
      lessCommon: ["Abdominal pain", "Back pain"],
      serious: [
        "Low sodium (hyponatraemia) — can cause confusion, seizures, or feeling very unwell. Blood tests are needed to monitor.",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for nocturia under specific criteria.",
    },
    notes:
      "Reduces the amount of urine made overnight. Useful for SCI users who find that getting up to pass urine at night disrupts sleep. Blood sodium levels must be checked with regular blood tests. Not suitable for everyone — your GP will assess.",
    forms: ["Oral tablets", "Nasal spray"],
  },

  /* ─── bowel management ─── */

  {
    id: "senna",
    name: "Senna",
    category: "Bowel Management",
    usedFor: ["Constipation", "Neurogenic bowel", "Stimulating bowel movements"],
    shortSideEffects: "Stomach cramps, diarrhoea, bloating",
    sideEffects: {
      common: ["Stomach cramps", "Diarrhoea", "Bloating", "Abdominal discomfort"],
      lessCommon: ["Nausea", "Electrolyte changes with frequent use"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A stimulant laxative that encourages the bowel to contract more often. Commonly used as part of a neurogenic bowel programme. Often taken the night before to help achieve a bowel movement the following morning.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "bisacodyl",
    name: "Bisacodyl",
    category: "Bowel Management",
    usedFor: ["Constipation", "Bowel preparation", "Neurogenic bowel management"],
    shortSideEffects: "Stomach cramps, diarrhoea, bloating",
    sideEffects: {
      common: ["Stomach cramps", "Diarrhoea", "Bloating", "Abdominal discomfort"],
      lessCommon: ["Nausea", "Electrolyte imbalance with frequent use"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A stimulant laxative available as both tablets and suppositories. The suppository form can be useful for neurogenic bowel management when rectal stimulation is part of the plan. Discuss the best approach with your care team.",
    forms: ["Oral tablets", "Rectal suppositories"],
  },

  {
    id: "glycerol-suppositories",
    name: "Glycerol Suppositories",
    category: "Bowel Management",
    usedFor: ["Constipation", "Rectal stimulation", "Neurogenic bowel"],
    shortSideEffects: "Mild rectal irritation, stomach cramps",
    sideEffects: {
      common: ["Mild rectal irritation", "Mild stomach cramping", "Urgency to pass stool"],
      lessCommon: ["Diarrhoea"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "Inserted rectally to soften stool and stimulate a bowel movement. A common part of neurogenic bowel management. The rectal stimulation effect can work alongside digital stimulation techniques.",
    forms: ["Rectal suppositories"],
  },

  {
    id: "loperamide",
    name: "Loperamide",
    category: "Bowel Management",
    usedFor: ["Diarrhoea", "Loose stools", "Bowel management (too-frequent movements)"],
    shortSideEffects: "Constipation, stomach cramps, drowsiness",
    sideEffects: {
      common: ["Constipation", "Stomach cramps", "Drowsiness", "Nausea"],
      lessCommon: ["Bloating", "Dizziness"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Also available over the counter.",
    },
    notes:
      "Slows bowel movements down. Useful if diarrhoea or too-frequent movements are a problem — this can happen with certain medications or after a bowel illness. Do not use for ongoing constipation without advice from your GP.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  /* ─── autonomic dysreflexia ─── */

  {
    id: "prazosin",
    name: "Prazosin",
    category: "Autonomic Dysreflexia",
    usedFor: ["Autonomic dysreflexia", "High blood pressure", "Ongoing blood pressure management"],
    shortSideEffects: "Dizziness, low blood pressure, headache",
    sideEffects: {
      common: ["Dizziness", "Low blood pressure", "Headache", "Fatigue", "Nausea"],
      lessCommon: ["Drowsiness", "Dry mouth", "Fluid retention"],
      serious: [
        "Severe low blood pressure with the first dose — take the first dose in bed or lying down",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An alpha blocker that relaxes blood vessels. Used by some SCI users for ongoing management of blood pressure problems related to autonomic dysreflexia. The first dose can cause a significant drop in blood pressure — your GP will guide you on how to manage this.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "labetalol",
    name: "Labetalol",
    category: "Autonomic Dysreflexia",
    usedFor: ["Autonomic dysreflexia", "High blood pressure", "Blood pressure management in SCI"],
    shortSideEffects: "Dizziness, drowsiness, fatigue",
    sideEffects: {
      common: ["Dizziness", "Drowsiness", "Fatigue", "Nausea", "Headache"],
      lessCommon: ["Slow heartbeat", "Skin tingling", "Low blood pressure"],
      serious: [
        "Severe low blood pressure — sit or lie down if you feel faint",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for blood pressure management.",
    },
    notes:
      "A combined alpha and beta blocker used for blood pressure control. Can be used for both acute autonomic dysreflexia episodes (under medical guidance) and for ongoing blood pressure management.",
    forms: ["Oral tablets", "Injection"],
  },

  {
    id: "captopril",
    name: "Captopril",
    category: "Autonomic Dysreflexia",
    usedFor: ["Autonomic dysreflexia", "Acute high blood pressure", "Emergency blood pressure reduction"],
    shortSideEffects: "Dizziness, dry cough, low blood pressure",
    sideEffects: {
      common: ["Dizziness", "Low blood pressure", "Dry cough", "Nausea"],
      lessCommon: ["Skin rash", "Metallic taste", "Headache"],
      serious: [
        "Severe low blood pressure — especially with the first dose. Sit down before taking.",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An ACE inhibitor that acts relatively quickly by mouth. Sometimes used for acute autonomic dysreflexia episodes. Should be used as directed by your spinal team — not for routine self-medication without guidance.",
    forms: ["Oral tablets"],
  },

  /* ─── DVT / anticoagulation ─── */

  {
    id: "enoxaparin",
    name: "Enoxaparin (Clexane)",
    category: "DVT / Anticoagulation",
    usedFor: ["DVT prevention after SCI", "Blood clot prevention", "Acute DVT treatment"],
    shortSideEffects: "Bruising, injection site pain, bleeding risk",
    sideEffects: {
      common: ["Bruising", "Bleeding at injection site", "Pain at injection site", "Nausea"],
      lessCommon: ["Raised liver enzymes", "Hair thinning"],
      serious: [
        "Unusual bleeding — from gums, nose, urine, or stools. Seek medical attention.",
        "Heparin-induced thrombocytopaenia (rare but serious) — blood tests will be used to monitor",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Commonly used in the weeks and months after SCI for DVT prevention.",
    },
    notes:
      "An injected blood thinner (low molecular weight heparin). Blood clots are a significant risk after SCI, particularly in the first few months. Usually given as an injection under the skin — your care team will show you or a carer how to do this.",
    forms: ["Subcutaneous injection (pre-filled syringe)"],
  },

  {
    id: "heparin",
    name: "Heparin (Unfractionated)",
    category: "DVT / Anticoagulation",
    usedFor: ["DVT prevention", "Blood clot prevention in hospital", "Acute anticoagulation"],
    shortSideEffects: "Bleeding risk, bruising, injection site pain",
    sideEffects: {
      common: ["Bleeding or bruising", "Injection site pain or bruising", "Nausea"],
      lessCommon: ["Skin rash at injection site", "Raised liver enzymes"],
      serious: [
        "Serious bleeding — seek emergency care if unusual or heavy bleeding occurs",
        "Heparin-induced thrombocytopaenia — blood tests are essential to monitor platelet levels",
        "Osteoporosis risk with prolonged use",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Mainly used in hospital settings for acute anticoagulation.",
    },
    notes:
      "An older form of blood thinner, mostly given in hospital and closely monitored with blood tests. More commonly used in the very early period after SCI or during hospital stays. Enoxaparin has largely replaced it for outpatient use.",
    forms: ["Subcutaneous injection", "Intravenous infusion"],
  },

  {
    id: "apixaban",
    name: "Apixaban (Eliquis)",
    category: "DVT / Anticoagulation",
    usedFor: ["DVT treatment", "Blood clot prevention", "Anticoagulation after SCI"],
    shortSideEffects: "Bleeding risk, bruising, dizziness",
    sideEffects: {
      common: ["Bleeding or bruising", "Dizziness", "Nausea", "Headache"],
      lessCommon: ["Stomach pain", "Skin rash", "Fatigue"],
      serious: [
        "Serious bleeding — seek emergency care immediately if unusual or heavy bleeding occurs",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for DVT treatment and prevention under specific criteria.",
    },
    notes:
      "A direct oral anticoagulant (DOAC) taken by mouth. Does not generally need regular blood tests like Warfarin. Has a reversal agent available in emergencies. Tell all health providers you take it, as it affects bleeding risk during procedures.",
    forms: ["Oral tablets"],
  },

  {
    id: "warfarin",
    name: "Warfarin",
    category: "DVT / Anticoagulation",
    usedFor: ["DVT treatment", "Pulmonary embolism", "Long-term blood clot prevention"],
    shortSideEffects: "Bleeding risk, bruising, nosebleeds",
    sideEffects: {
      common: ["Increased bruising", "Nosebleeds", "Bleeding gums", "Blood in urine or stools"],
      lessCommon: ["Skin rash", "Hair thinning", "Nausea"],
      serious: [
        "Serious bleeding — seek emergency care if you have unusual or heavy bleeding",
        "Many foods and medicines interact with Warfarin — regular INR blood tests are essential to keep the dose right",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Requires regular INR blood tests.",
    },
    notes:
      "An oral blood thinner that has been widely used for many years. Your INR (a blood test) must be checked regularly to make sure the dose is right. Foods high in Vitamin K (such as leafy green vegetables) can change how Warfarin works — keep your intake consistent. Tell all health providers you take it.",
    forms: ["Oral tablets"],
  },

  /* ─── bone health ─── */

  {
    id: "alendronate",
    name: "Alendronate",
    category: "Bone Health",
    usedFor: ["Osteoporosis", "Bone density loss after SCI", "Fracture prevention"],
    shortSideEffects: "Stomach upset, heartburn, jaw pain",
    sideEffects: {
      common: ["Stomach upset", "Heartburn", "Headache", "Nausea"],
      lessCommon: ["Jaw pain or numbness", "Unusual bone pain"],
      serious: [
        "Oesophageal irritation — must be taken with a full glass of water, sitting or standing upright, and you should not lie down for at least 30 minutes afterwards",
        "Jaw problems (rare) — tell your GP if your jaw feels sore",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for osteoporosis.",
    },
    notes:
      "A bisphosphonate taken once weekly. Must be taken on an empty stomach, sitting or standing up, with a full glass of water. Important for reducing fracture risk in people with SCI-related bone loss.",
    forms: ["Oral tablets (once weekly)"],
  },

  {
    id: "risedronate",
    name: "Risedronate",
    category: "Bone Health",
    usedFor: ["Osteoporosis", "Bone loss prevention", "Fracture prevention"],
    shortSideEffects: "Stomach upset, heartburn, headache",
    sideEffects: {
      common: ["Stomach upset", "Heartburn", "Headache", "Nausea", "Dizziness"],
      lessCommon: ["Jaw pain", "Back pain", "Muscle or joint aches"],
      serious: [
        "Oesophageal irritation — same precautions as Alendronate apply",
        "Jaw problems (rare)",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for osteoporosis.",
    },
    notes:
      "A bisphosphonate similar to Alendronate, also taken once weekly or monthly depending on the formulation. Same preparation rules apply — empty stomach, full glass of water, sit upright for 30 minutes after. An alternative if Alendronate is not tolerated.",
    forms: ["Oral tablets (weekly or monthly)"],
  },

  {
    id: "zoledronic-acid",
    name: "Zoledronic Acid",
    category: "Bone Health",
    usedFor: ["Osteoporosis", "Severe bone density loss", "Fracture prevention after SCI"],
    shortSideEffects: "Flu-like symptoms, injection site pain, headache",
    sideEffects: {
      common: ["Flu-like symptoms (fever, chills, body aches)", "Injection site pain", "Headache", "Nausea"],
      lessCommon: ["Dizziness", "Fatigue", "Low calcium"],
      serious: [
        "Kidney problems — kidney function is tested before and after treatment",
        "Jaw problems (rare) — tell your GP if your jaw feels sore or numb",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for osteoporosis under specific criteria.",
    },
    notes:
      "A bisphosphonate given as a yearly intravenous infusion in hospital or clinic. Bone loss is common after SCI due to reduced weight-bearing — this is one option for reducing fracture risk. An alternative for people who cannot take oral bisphosphonates.",
    forms: ["Intravenous infusion (yearly)"],
  },

  {
    id: "denosumab",
    name: "Denosumab (Prolia)",
    category: "Bone Health",
    usedFor: ["Osteoporosis", "Fracture prevention", "Bone density loss after SCI"],
    shortSideEffects: "Injection site pain, back pain, headache",
    sideEffects: {
      common: ["Injection site pain or bruising", "Back pain", "Headache", "Muscle or joint aches"],
      lessCommon: ["Skin rash", "Low calcium"],
      serious: [
        "Jaw problems (rare) — tell your GP if your jaw feels sore",
        "Low calcium — Vitamin D and calcium supplements are usually taken alongside",
      ],
    },
    pharmacStatus: {
      label: "Special Authority",
      details: "Special Authority required. Funded by PHARMAC for osteoporosis under specific criteria.",
    },
    notes:
      "Given as an injection every six months, usually by a GP or specialist. Works differently to bisphosphonates and is an option when those are not suitable. Calcium and Vitamin D supplementation is needed alongside.",
    forms: ["Subcutaneous injection (every 6 months)"],
  },

  {
    id: "colecalciferol",
    name: "Colecalciferol (Vitamin D3)",
    category: "Bone Health",
    usedFor: ["Vitamin D deficiency", "Bone health support", "Osteoporosis prevention"],
    shortSideEffects: "Usually well tolerated",
    sideEffects: {
      common: ["Usually well tolerated at recommended doses"],
      lessCommon: ["Nausea", "Stomach upset"],
      serious: [
        "Vitamin D toxicity with very high doses — blood levels should be checked periodically",
      ],
    },
    pharmacStatus: {
      label: "Unknown",
      details: "Prescription-strength Vitamin D may be funded. Over-the-counter supplements are also widely available. Check with your GP.",
    },
    notes:
      "Many people in New Zealand have low Vitamin D, and this is even more common after SCI due to reduced time outdoors and in the sun. Blood tests can check your levels. Your GP will advise on the right strength and form.",
    forms: ["Oral capsules", "Oral drops", "Oral tablets"],
  },

  {
    id: "calcium-carbonate",
    name: "Calcium Carbonate",
    category: "Bone Health",
    usedFor: ["Calcium supplementation", "Bone health", "Osteoporosis support"],
    shortSideEffects: "Constipation, wind, stomach upset",
    sideEffects: {
      common: ["Constipation", "Wind", "Stomach upset", "Nausea"],
      lessCommon: ["Bloating", "Dry mouth"],
      serious: [],
    },
    pharmacStatus: {
      label: "Unknown",
      details: "Some calcium supplement formulations are funded by PHARMAC; many are available over the counter. Check with your pharmacy.",
    },
    notes:
      "A calcium supplement often recommended alongside Vitamin D for bone health after SCI. Bone loss is very common after spinal cord injury. Often taken with meals, as food helps with absorption. Your GP will advise whether you need a prescription product or an over-the-counter supplement.",
    forms: ["Oral tablets", "Chewable tablets", "Oral liquid"],
  },

  {
    id: "calcitriol",
    name: "Calcitriol",
    category: "Bone Health",
    usedFor: ["Osteoporosis", "Calcium absorption", "Bone health support"],
    shortSideEffects: "Nausea, headache, fatigue",
    sideEffects: {
      common: ["Nausea", "Headache", "Fatigue", "Dizziness"],
      lessCommon: ["Stomach upset", "Metallic taste"],
      serious: [
        "High calcium (hypercalcaemia) — blood tests are needed to monitor levels regularly",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for specific bone health indications.",
    },
    notes:
      "The active form of Vitamin D that the body uses directly. Stronger than standard Vitamin D supplements, so calcium levels in the blood must be checked regularly. Usually prescribed alongside calcium supplements.",
    forms: ["Oral capsules", "Oral liquid"],
  },

  /* ─── mood / sleep ─── */

  {
    id: "sertraline",
    name: "Sertraline",
    category: "Mood / Sleep",
    usedFor: ["Depression", "Anxiety", "Adjustment difficulties after SCI"],
    shortSideEffects: "Nausea, dizziness, headache",
    sideEffects: {
      common: ["Nausea", "Dizziness", "Headache", "Drowsiness", "Diarrhoea"],
      lessCommon: ["Sexual side effects", "Weight changes", "Sweating"],
      serious: [
        "Suicidal thoughts (especially in the early weeks) — seek help immediately if this happens",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for depression and anxiety.",
    },
    notes:
      "An SSRI antidepressant commonly used after SCI for depression or adjustment difficulties. Effects typically take a few weeks to build up. Stopping suddenly can cause withdrawal — reduce the dose gradually with your GP.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "citalopram",
    name: "Citalopram",
    category: "Mood / Sleep",
    usedFor: ["Depression", "Anxiety", "Low mood"],
    shortSideEffects: "Nausea, drowsiness, headache",
    sideEffects: {
      common: ["Nausea", "Drowsiness", "Headache", "Dizziness", "Dry mouth"],
      lessCommon: ["Sexual side effects", "Weight changes", "Sweating"],
      serious: [
        "Suicidal thoughts (especially in the early weeks) — seek help immediately",
        "Heart rhythm changes at higher doses — your GP will monitor",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for depression and anxiety.",
    },
    notes:
      "An SSRI antidepressant. Effects usually take two to four weeks to develop. Do not stop suddenly — reduce gradually with your GP. Tell your doctor about all other medicines you take, as some combinations can affect heart rhythm.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "escitalopram",
    name: "Escitalopram",
    category: "Mood / Sleep",
    usedFor: ["Depression", "Anxiety", "Panic disorder"],
    shortSideEffects: "Nausea, drowsiness, headache",
    sideEffects: {
      common: ["Nausea", "Drowsiness", "Headache", "Dizziness", "Dry mouth"],
      lessCommon: ["Sexual side effects", "Weight changes", "Sweating"],
      serious: [
        "Suicidal thoughts (especially in the early weeks) — seek help immediately",
        "Heart rhythm changes — tell your GP if you feel unwell",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for depression and anxiety.",
    },
    notes:
      "An SSRI with a generally good safety profile and well tolerated by many people. Effects usually take two to four weeks to develop. Do not stop suddenly — reduce the dose gradually with your GP.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "mirtazapine",
    name: "Mirtazapine",
    category: "Mood / Sleep",
    usedFor: ["Depression", "Low mood", "Sleep difficulties with depression"],
    shortSideEffects: "Drowsiness, weight gain, dry mouth",
    sideEffects: {
      common: ["Drowsiness", "Weight gain", "Dry mouth", "Increased appetite", "Dizziness"],
      lessCommon: ["Constipation", "Blurred vision", "Low blood pressure"],
      serious: [
        "Very low white blood cell count (rare) — blood tests may be needed",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for depression.",
    },
    notes:
      "An antidepressant that also promotes sleep, especially when taken at night. May be particularly useful if both depression and sleep problems are present. Weight gain and increased appetite are common side effects — be aware of this when starting.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "melatonin",
    name: "Melatonin",
    category: "Mood / Sleep",
    usedFor: ["Sleep difficulties", "Circadian rhythm disruption", "Insomnia"],
    shortSideEffects: "Drowsiness, headache, dizziness",
    sideEffects: {
      common: ["Drowsiness", "Headache", "Dizziness", "Vivid dreams"],
      lessCommon: ["Nausea", "Mood changes"],
      serious: [],
    },
    pharmacStatus: {
      label: "Unknown",
      details: "Prescription melatonin may be funded for specific indications. It is also available over the counter in NZ. Discuss with your GP.",
    },
    notes:
      "A hormone that helps regulate the body clock and sleep. Sleep disruption is very common after SCI. Usually taken about 30 minutes before bed. Works best alongside a regular sleep routine.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "zopiclone",
    name: "Zopiclone",
    category: "Mood / Sleep",
    usedFor: ["Insomnia", "Short-term sleep difficulties", "Sleep onset problems"],
    shortSideEffects: "Drowsiness, metallic taste, dizziness",
    sideEffects: {
      common: ["Drowsiness", "Metallic or bitter taste", "Dizziness", "Headache"],
      lessCommon: ["Confusion", "Memory problems", "Nausea"],
      serious: [
        "Risk of dependence — usually prescribed for short-term use only, up to two weeks",
        "Respiratory depression at high doses",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC. Usually prescribed for short-term use only.",
    },
    notes:
      "A sleeping tablet for short-term insomnia. Dependence can develop quickly, so it is generally not used for more than two weeks. Sleep problems after SCI are common — discuss longer-term sleep strategies with your GP or spinal team.",
    forms: ["Oral tablets"],
  },

  /* ─── gastric protection ─── */

  {
    id: "omeprazole",
    name: "Omeprazole",
    category: "Gastric Protection",
    usedFor: ["Stomach protection with NSAIDs", "Acid reflux", "Gastric ulcer prevention"],
    shortSideEffects: "Headache, diarrhoea, nausea",
    sideEffects: {
      common: ["Headache", "Diarrhoea", "Nausea", "Stomach pain"],
      lessCommon: ["Dizziness", "Skin rash", "Fatigue"],
      serious: [
        "Long-term use may reduce absorption of calcium, iron and vitamin B12 — discuss ongoing use with your GP",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A proton pump inhibitor (PPI) that reduces stomach acid production. Commonly prescribed alongside anti-inflammatory painkillers (NSAIDs such as Ibuprofen or Naproxen) to protect the stomach lining. Also used for acid reflux and ulcers.",
    forms: ["Oral tablets", "Oral capsules", "Injection"],
  },

  {
    id: "pantoprazole",
    name: "Pantoprazole",
    category: "Gastric Protection",
    usedFor: ["Gastric protection", "Acid reflux", "Stomach ulcer prevention"],
    shortSideEffects: "Headache, diarrhoea, nausea",
    sideEffects: {
      common: ["Headache", "Diarrhoea", "Nausea", "Abdominal pain"],
      lessCommon: ["Dizziness", "Skin rash", "Fatigue"],
      serious: [
        "Long-term use may affect absorption of calcium and vitamins",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A PPI similar to Omeprazole. Often used for longer-term gastric protection. Discuss with your GP whether ongoing use is still needed — sometimes the dose can be reduced once the underlying problem has been treated.",
    forms: ["Oral tablets", "Injection"],
  },

  {
    id: "ondansetron",
    name: "Ondansetron",
    category: "Gastric Protection",
    usedFor: ["Nausea", "Vomiting", "Nausea caused by other medications"],
    shortSideEffects: "Headache, constipation, dizziness",
    sideEffects: {
      common: ["Headache", "Constipation", "Dizziness", "Fatigue"],
      lessCommon: ["Dry mouth", "Abdominal pain"],
      serious: [
        "Heart rhythm changes (QT prolongation) — tell your GP about all other medications you take",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC for nausea and vomiting.",
    },
    notes:
      "An anti-nausea medication. Nausea can be a side effect of many medications commonly used after SCI, including opioid painkillers and antidepressants. Usually reserved for nausea that has not responded to simpler treatments.",
    forms: ["Oral tablets", "Oral liquid", "Injection"],
  },

  {
    id: "famotidine",
    name: "Famotidine",
    category: "Gastric Protection",
    usedFor: ["Gastric protection", "Acid reflux", "Stomach ulcer treatment"],
    shortSideEffects: "Headache, dizziness, nausea",
    sideEffects: {
      common: ["Headache", "Dizziness", "Nausea", "Diarrhoea"],
      lessCommon: ["Constipation", "Fatigue", "Abdominal pain"],
      serious: [],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "An H2 blocker that reduces stomach acid — works differently to proton pump inhibitors (PPIs) like Omeprazole. Sometimes used as an alternative to PPIs or for milder acid-related problems. Also available over the counter in some formulations.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  /* ─── UTI antibiotics ─── */

  {
    id: "nitrofurantoin",
    name: "Nitrofurantoin",
    category: "UTI Antibiotics",
    usedFor: ["Urinary tract infection", "Simple bladder infection", "Recurrent UTI prevention"],
    shortSideEffects: "Nausea, stomach upset, diarrhoea",
    sideEffects: {
      common: ["Nausea", "Stomach upset", "Diarrhoea", "Stomach cramps"],
      lessCommon: ["Headache", "Skin rash", "Dizziness"],
      serious: [
        "Lung inflammation (rare, mainly with long-term use) — tell your GP if you develop a new cough or breathing difficulty",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A first-line antibiotic for simple UTIs in New Zealand. UTIs are very common after SCI due to bladder changes. Symptoms may be different from usual — look for increased spasms, fever, or feeling generally unwell rather than the typical burning sensation. Take with food to reduce stomach upset.",
    forms: ["Oral tablets", "Oral capsules"],
  },

  {
    id: "trimethoprim",
    name: "Trimethoprim",
    category: "UTI Antibiotics",
    usedFor: ["Urinary tract infection", "Recurrent UTI prevention", "Bladder infection"],
    shortSideEffects: "Nausea, stomach upset, skin rash",
    sideEffects: {
      common: ["Nausea", "Stomach upset", "Diarrhoea", "Skin rash"],
      lessCommon: ["Headache", "Dizziness", "Itching"],
      serious: [
        "Severe skin rash (Stevens-Johnson syndrome, rare) — seek help immediately if a rash develops",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "Another first-line antibiotic for UTIs in New Zealand. Sometimes used as ongoing low-dose prevention for people who have frequent UTIs after SCI. Discuss with your spinal team whether preventive antibiotics are appropriate for you.",
    forms: ["Oral tablets", "Oral liquid"],
  },

  {
    id: "amoxicillin-clavulanate",
    name: "Amoxicillin / Clavulanate (Augmentin)",
    category: "UTI Antibiotics",
    usedFor: ["Complicated UTI", "UTI with resistant bacteria", "Mixed infections"],
    shortSideEffects: "Diarrhoea, nausea, stomach upset",
    sideEffects: {
      common: ["Diarrhoea", "Nausea", "Stomach upset", "Abdominal cramps"],
      lessCommon: ["Skin rash", "Headache", "Metallic taste"],
      serious: [
        "Allergic reaction — seek emergency help if you develop swelling of the face, lips, or throat, or difficulty breathing",
        "Liver inflammation (rare) — can occur even after the course has finished",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A broader-spectrum antibiotic used when a UTI has not responded to first-line options or when the bacteria are likely to be resistant. Culture-guided — your GP will usually send a urine sample to check which antibiotic will work best.",
    forms: ["Oral tablets", "Oral liquid (sachets)"],
  },

  {
    id: "ciprofloxacin",
    name: "Ciprofloxacin",
    category: "UTI Antibiotics",
    usedFor: ["Complicated UTI", "Recurrent UTI", "Infection not responding to first-line antibiotics"],
    shortSideEffects: "Nausea, diarrhoea, dizziness",
    sideEffects: {
      common: ["Nausea", "Diarrhoea", "Dizziness", "Headache", "Stomach discomfort"],
      lessCommon: ["Skin rash", "Photosensitivity (sun sensitivity)", "Insomnia"],
      serious: [
        "Tendon problems — especially Achilles tendon. Seek help if you have sudden tendon pain or swelling",
        "Serotonin syndrome if combined with certain antidepressants — tell your GP about all your medicines",
      ],
    },
    pharmacStatus: {
      label: "Funded",
      details: "Funded by PHARMAC.",
    },
    notes:
      "A fluoroquinolone antibiotic used for more complicated UTIs or when first-line options have not worked. Antibiotic resistance is increasing — only take antibiotics as prescribed and finish the full course. Avoid prolonged sun exposure while taking.",
    forms: ["Oral tablets", "Oral liquid", "Injection"],
  },
];
