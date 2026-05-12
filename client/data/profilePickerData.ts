// Shared picker data for profile + onboarding forms

export const NZ_REHAB_CENTRES = [
  "Auckland Spinal Rehabilitation Unit — Middlemore Hospital",
  "Burwood Spinal Unit — Burwood Hospital, Christchurch",
  "Wellington Hospital Spinal Service — Wellington Regional Hospital",
  "Other",
  "None / Community rehab",
];

export const NZ_CARE_COMPANY_NAMES = [
  "Accessable",
  "CCS Disability Action",
  "Enable New Zealand",
  "Geneva Healthcare",
  "Health Care Solutions (HCS)",
  "Home Instead",
  "Nurse Maude",
  "Presbyterian Support",
  "Other",
];

// ---------------------------------------------------------------------------
// Wheelchair models grouped by wheelchair type
// ---------------------------------------------------------------------------

export const MANUAL_WHEELCHAIR_MODELS = [
  // TiLite
  "TiLite Aero X",
  "TiLite Aero T",
  "TiLite Aero Z",
  "TiLite ZR",
  "TiLite ZRA",
  "TiLite TRA",
  "TiLite TR",
  "TiLite 2GX",
  "TiLite Pilot",
  "TiLite TWIST",
  "TiLite CR1",
  // Panthera
  "Panthera U3",
  "Panthera U3 Light",
  "Panthera X3",
  "Panthera S3",
  "Panthera S3 Swing",
  "Panthera Micro 3",
  "Panthera Bambino 3",
  // Quickie
  "Quickie Life",
  "Quickie Argon 2",
  "Quickie Xenon FA",
  "Quickie NEON BT",
  "Quickie Nitrum",
  // Küschall
  "Küschall Compact Attract",
  "Küschall K-Series",
  // Ki Mobility
  "Ki Mobility Rogue",
  "Ki Mobility Catalyst E",
  // Invacare / Rea
  "Invacare Action 1R",
  "Invacare Action 3NG",
  "Rea Azalea",
  // Other
  "Other / Custom",
];

export const POWER_WHEELCHAIR_MODELS = [
  // Permobil
  "Permobil M1",
  "Permobil M3 Corpus",
  "Permobil M5 Corpus",
  "Permobil M300 Corpus HD",
  "Permobil F3 Corpus",
  "Permobil F5 Corpus VS",
  "Permobil K450 MX",
  "Permobil K300 PS Jr.",
  "Permobil Explorer Mini",
  "Permobil X850 Corpus",
  // Quickie
  "Quickie Q400 M",
  "Quickie Q500 M",
  "Quickie Q700 M",
  "Quickie Q700 UP",
  "Quickie Pulse 6",
  // Magic Mobility
  "Magic Mobility Frontier V6",
  "Magic Mobility Extreme X8 4x4",
  // Invacare
  "Invacare TDX SP2 NB",
  "Invacare TDX SP2",
  // Other
  "Other / Custom",
];

export const POWER_ASSIST_MODELS = [
  "SmartDrive MX2+",
  "e-motion Wheels",
  "Quickie Xtender",
  "SMOOV one",
  "Empulse M90",
  "Empulse R90",
  "Empulse F35",
  "Other / Custom",
];

export const SPORT_RACING_MODELS = [
  "TiLite Pilot",
  "TiLite ZRA (sport config)",
  "Panthera X3",
  "Quickie Match Point",
  "RGK High Point",
  "Küschall K-Series Sport",
  "Other / Custom",
];

export const TILT_IN_SPACE_MODELS = [
  "Permobil M5 Corpus (tilt)",
  "Permobil M3 Corpus (tilt)",
  "Quickie Sedeo Pro",
  "Invacare TDX SP",
  "Jay J3 with tilt",
  "Other / Custom",
];

export const SCOOTER_MODELS = [
  "Pride Go-Go",
  "Pride Victory 10",
  "Pride Wrangler",
  "Shoprider Jimmie",
  "Drive Medical Scout",
  "Other / Custom",
];

export const WHEELCHAIR_MODELS_BY_TYPE: Record<string, string[]> = {
  "Manual Chair": MANUAL_WHEELCHAIR_MODELS,
  "Power Chair": POWER_WHEELCHAIR_MODELS,
  "Power Assist": POWER_ASSIST_MODELS,
  "Sport / Racing Chair": SPORT_RACING_MODELS,
  "Tilt-in-Space Chair": TILT_IN_SPACE_MODELS,
  "Mobility Scooter": SCOOTER_MODELS,
};
