export type MobilityTaxiCompany = {
  id: string;
  name: string;
  phone: string;
  website?: string;
  email?: string;
  regions: string[];
  wheelchairAccessible: boolean;
  notes?: string;
};

export const mobilityTaxiCompanies: MobilityTaxiCompany[] = [
  // Wellington
  {
    id: "wellington-combined-taxis",
    name: "Wellington Combined Taxis",
    phone: "04 384 4444",
    website: "https://www.taxis.co.nz",
    regions: ["Wellington"],
    wheelchairAccessible: true,
    notes: "Wheelchair hoist vans available. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-wellington",
    name: "Driving Miss Daisy Wellington",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Wellington", "Lower Hutt", "Upper Hutt", "Kapiti Coast"],
    wheelchairAccessible: true,
    notes:
      "Companion driving service. Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "corporate-cabs-wellington",
    name: "Corporate Cabs Wellington",
    phone: "04 472 8888",
    website: "https://www.corporatecabs.co.nz",
    regions: ["Wellington"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles available on request.",
  },
  {
    id: "total-mobility-wellington",
    name: "Total Mobility Wellington (WCC)",
    phone: "04 499 4444",
    website: "https://www.totalMobility.org.nz",
    regions: ["Wellington"],
    wheelchairAccessible: true,
    notes:
      "Subsidised taxi scheme for people with disabilities. Contact Wellington City Council to register.",
  },
  {
    id: "kapiti-taxis",
    name: "Kapiti Taxis",
    phone: "04 902 0000",
    regions: ["Kapiti Coast"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },

  // Lower Hutt / Upper Hutt
  {
    id: "hutt-taxis",
    name: "Hutt Taxis",
    phone: "04 570 0000",
    regions: ["Lower Hutt", "Upper Hutt"],
    wheelchairAccessible: true,
    notes: "Covers Lower and Upper Hutt. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-lower-hutt",
    name: "Driving Miss Daisy Lower Hutt",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Lower Hutt"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },

  // Auckland
  {
    id: "auckland-co-op-taxis",
    name: "Auckland Co-op Taxis",
    phone: "09 300 3000",
    website: "https://www.cooptaxi.co.nz",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes:
      "Large fleet with wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "north-shore-taxis",
    name: "North Shore Taxis",
    phone: "09 480 5000",
    website: "https://www.northshoretaxis.co.nz",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes: "Serving North Shore Auckland. Wheelchair hoist vehicles available.",
  },
  {
    id: "driving-miss-daisy-auckland",
    name: "Driving Miss Daisy Auckland",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes:
      "Companion driving and wheelchair accessible transport. Multiple Auckland franchises.",
  },
  {
    id: "corporate-cabs-auckland",
    name: "Corporate Cabs Auckland",
    phone: "09 377 0773",
    website: "https://www.corporatecabs.co.nz",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles available on request.",
  },
  {
    id: "first-direct-taxis-auckland",
    name: "First Direct Taxis Auckland",
    phone: "09 529 5000",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes: "Covers greater Auckland. Accepts Total Mobility.",
  },
  {
    id: "accessable-auckland",
    name: "Accessable",
    phone: "09 636 4700",
    website: "https://www.accessable.co.nz",
    email: "info@accessable.co.nz",
    regions: ["Auckland"],
    wheelchairAccessible: true,
    notes:
      "Specialist disability transport provider. ACC and NASC funded. Fully accessible fleet.",
  },

  // Christchurch
  {
    id: "blue-star-taxis-christchurch",
    name: "Blue Star Taxis Christchurch",
    phone: "03 379 9799",
    website: "https://www.bluestartaxis.co.nz",
    regions: ["Christchurch"],
    wheelchairAccessible: true,
    notes: "Large Christchurch fleet. Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "first-direct-taxis-christchurch",
    name: "First Direct Taxis Christchurch",
    phone: "03 377 5555",
    regions: ["Christchurch"],
    wheelchairAccessible: true,
    notes: "Wheelchair hoist vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-christchurch",
    name: "Driving Miss Daisy Christchurch",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Christchurch"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },
  {
    id: "corporate-cabs-christchurch",
    name: "Corporate Cabs Christchurch",
    phone: "03 379 9979",
    website: "https://www.corporatecabs.co.nz",
    regions: ["Christchurch"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles available on request.",
  },

  // Hamilton
  {
    id: "hamilton-taxis",
    name: "Hamilton Taxis",
    phone: "07 847 7477",
    website: "https://www.hamiltontaxis.co.nz",
    regions: ["Hamilton"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-hamilton",
    name: "Driving Miss Daisy Hamilton",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Hamilton"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },
  {
    id: "corporate-cabs-hamilton",
    name: "Corporate Cabs Hamilton",
    phone: "07 839 0000",
    website: "https://www.corporatecabs.co.nz",
    regions: ["Hamilton"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles on request.",
  },

  // Tauranga
  {
    id: "tauranga-taxis",
    name: "Tauranga Taxis",
    phone: "07 578 6086",
    regions: ["Tauranga"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-tauranga",
    name: "Driving Miss Daisy Tauranga",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Tauranga"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },
  {
    id: "bay-taxis-tauranga",
    name: "Bay Taxis",
    phone: "07 577 0900",
    regions: ["Tauranga"],
    wheelchairAccessible: true,
    notes: "Bay of Plenty region. Wheelchair hoist vehicles available.",
  },

  // Napier / Hastings
  {
    id: "hastings-taxis",
    name: "Hastings Taxis",
    phone: "06 878 5050",
    regions: ["Napier / Hastings"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vans available. Recommended local provider for Hastings and surrounds.",
  },
  {
    id: "hawkes-bay-taxis",
    name: "Hawke's Bay Taxis",
    phone: "06 835 4111",
    regions: ["Napier / Hastings"],
    wheelchairAccessible: true,
    notes: "Serves Napier and Hastings. Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-hawkes-bay",
    name: "Driving Miss Daisy Hawke's Bay",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Napier / Hastings"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },

  // Dunedin
  {
    id: "dunedin-taxis",
    name: "Dunedin Taxis",
    phone: "03 477 7777",
    regions: ["Dunedin"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-dunedin",
    name: "Driving Miss Daisy Dunedin",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Dunedin"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },
  {
    id: "corporate-cabs-dunedin",
    name: "Corporate Cabs Dunedin",
    phone: "03 477 7474",
    website: "https://www.corporatecabs.co.nz",
    regions: ["Dunedin"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles available on request.",
  },

  // Queenstown
  {
    id: "queenstown-taxis",
    name: "Queenstown Taxis",
    phone: "03 450 3000",
    regions: ["Queenstown"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-queenstown",
    name: "Driving Miss Daisy Queenstown",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Queenstown"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport.",
  },
  {
    id: "alpine-taxis-queenstown",
    name: "Alpine Taxis",
    phone: "03 442 6666",
    regions: ["Queenstown"],
    wheelchairAccessible: true,
    notes: "Wheelchair hoist vehicles. Covers Queenstown and surrounds.",
  },

  // Palmerston North
  {
    id: "palmerston-north-taxis",
    name: "Palmerston North Taxis",
    phone: "06 355 5333",
    regions: ["Palmerston North"],
    wheelchairAccessible: true,
    notes: "Wheelchair accessible vehicles. Accepts Total Mobility.",
  },
  {
    id: "driving-miss-daisy-palmerston-north",
    name: "Driving Miss Daisy Palmerston North",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: ["Palmerston North"],
    wheelchairAccessible: true,
    notes: "Companion and wheelchair accessible transport. Accepts Total Mobility.",
  },

  // Nationwide
  {
    id: "driving-miss-daisy-national",
    name: "Driving Miss Daisy (National)",
    phone: "0800 373 347",
    website: "https://www.drivingmissdaisy.co.nz",
    regions: [
      "Wellington",
      "Auckland",
      "Christchurch",
      "Hamilton",
      "Tauranga",
      "Napier / Hastings",
      "Dunedin",
      "Queenstown",
      "Palmerston North",
      "Kapiti Coast",
      "Lower Hutt",
      "Upper Hutt",
    ],
    wheelchairAccessible: true,
    notes:
      "Nationwide franchise network. Companion driving and wheelchair accessible transport. Accepts Total Mobility at many branches.",
  },
];
