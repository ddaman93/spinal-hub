export type CareAgency = {
  id: string;
  name: string;
  phone: string;
  regions: string[];
  website: string;
  sciExperienced: boolean;
  ventSupport: boolean;
  overnightCare: boolean;
  bowelRoutineCare: boolean;
};

export const sciCareAgencies: CareAgency[] = [
  {
    id: "custom-care-nursing",
    name: "Custom Care Nursing",
    phone: "0508 687 737",
    regions: ["All"],
    website: "https://www.customcarenursing.co.nz",
    sciExperienced: true,
    ventSupport: true,
    overnightCare: true,
    bowelRoutineCare: true,
  },
  {
    id: "access-community-health",
    name: "Access Community Health",
    phone: "0800 284 663",
    regions: ["All"],
    website: "https://access.org.nz",
    sciExperienced: true,
    ventSupport: true,
    overnightCare: true,
    bowelRoutineCare: true,
  },
  {
    id: "geneva-healthcare",
    name: "Geneva Healthcare",
    phone: "0800 436 382",
    regions: ["All"],
    website: "https://www.genevahealth.com",
    sciExperienced: true,
    ventSupport: true,
    overnightCare: true,
    bowelRoutineCare: true,
  },
  {
    id: "healthcare-nz",
    name: "HealthCare NZ",
    phone: "0800 002 722",
    regions: ["All"],
    website: "https://www.healthcarenz.co.nz",
    sciExperienced: true,
    ventSupport: false,
    overnightCare: true,
    bowelRoutineCare: true,
  },
  {
    id: "nurse-maude",
    name: "Nurse Maude",
    phone: "0800 687 739",
    regions: ["Christchurch", "Wellington", "Lower Hutt", "Upper Hutt"],
    website: "https://www.nursemaude.org.nz",
    sciExperienced: true,
    ventSupport: false,
    overnightCare: false,
    bowelRoutineCare: true,
  },
  {
    id: "rdns-nz",
    name: "Royal District Nursing Service (RDNS)",
    phone: "0800 736 769",
    regions: ["Auckland", "Hamilton", "Tauranga", "Christchurch", "Dunedin", "Queenstown"],
    website: "https://www.rdns.org.nz",
    sciExperienced: true,
    ventSupport: false,
    overnightCare: false,
    bowelRoutineCare: true,
  },
  {
    id: "visionwest-home-healthcare",
    name: "Visionwest Home Healthcare",
    phone: "0800 222 040",
    regions: ["Auckland", "Hamilton", "Tauranga"],
    website: "https://visionwest.org.nz/home-healthcare",
    sciExperienced: false,
    ventSupport: false,
    overnightCare: false,
    bowelRoutineCare: true,
  },
];
