export type CarerCompany = {
  id: string;
  name: string;
  phone: string;
  website?: string;
  email?: string;
  regions: string[];
  specialties: ("tetraplegia" | "paraplegia")[];
  fundingTypes?: string[];
  notes?: string;
};

export const carerCompanies: CarerCompany[] = [
  // Auckland
  {
    id: "accessable-carer-auckland",
    name: "Accessable",
    phone: "09 636 4700",
    website: "https://www.accessable.co.nz",
    email: "info@accessable.co.nz",
    regions: ["Auckland"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Specialist disability support provider. Experienced with high-level SCI. ACC and NASC funded.",
  },
  {
    id: "geneva-healthcare-auckland",
    name: "Geneva Healthcare Auckland",
    phone: "09 363 3388",
    website: "https://www.genevahealthcare.co.nz",
    regions: ["Auckland"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC", "Ministry of Health"],
    notes:
      "Nationwide home health provider. SCI-experienced carers. ACC and Ministry of Health contracted.",
  },
  {
    id: "nurse-maude-auckland",
    name: "Nurse Maude Auckland",
    phone: "0800 867 837",
    website: "https://www.nursemaude.org.nz",
    regions: ["Auckland"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "Ministry of Health"],
    notes:
      "Community nursing and personal care. Specialised SCI carer training available.",
  },
  {
    id: "presbyterian-support-northland-auckland",
    name: "Presbyterian Support Northland",
    phone: "09 438 7460",
    website: "https://www.psn.org.nz",
    regions: ["Auckland"],
    specialties: ["paraplegia"],
    fundingTypes: ["NASC", "Ministry of Health"],
    notes: "Community-based personal care services. Serving north Auckland and Northland.",
  },

  // Wellington
  {
    id: "enable-nz-wellington",
    name: "Enable New Zealand",
    phone: "0800 171 981",
    website: "https://www.enable.co.nz",
    email: "info@enable.co.nz",
    regions: ["Wellington", "Palmerston North", "Kapiti Coast", "Lower Hutt", "Upper Hutt"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Provides equipment and support coordination for people with disabilities including SCI. Key ACC partner.",
  },
  {
    id: "geneva-healthcare-wellington",
    name: "Geneva Healthcare Wellington",
    phone: "04 916 3200",
    website: "https://www.genevahealthcare.co.nz",
    regions: ["Wellington", "Lower Hutt", "Upper Hutt", "Kapiti Coast"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC", "Ministry of Health"],
    notes:
      "Home health and personal care. Experienced with complex SCI needs including tetraplegic care.",
  },
  {
    id: "home-instead-wellington",
    name: "Home Instead Wellington",
    phone: "04 496 5153",
    website: "https://www.homeinstead.co.nz",
    regions: ["Wellington"],
    specialties: ["paraplegia"],
    fundingTypes: ["Private", "NASC"],
    notes: "In-home care services. Personal care, companionship and daily living support.",
  },
  {
    id: "hcs-wellington",
    name: "Health Care Solutions (HCS)",
    phone: "04 801 6777",
    website: "https://www.hcs.co.nz",
    regions: ["Wellington", "Lower Hutt", "Upper Hutt"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "Ministry of Health"],
    notes:
      "Specialist SCI carer support. Experienced with ventilator-dependent and high-level cervical injury.",
  },

  // Christchurch
  {
    id: "nurse-maude-christchurch",
    name: "Nurse Maude Christchurch",
    phone: "03 375 4200",
    website: "https://www.nursemaude.org.nz",
    regions: ["Christchurch"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "Ministry of Health"],
    notes:
      "Longest-established home nursing and personal care in Canterbury. SCI-experienced care teams.",
  },
  {
    id: "presbyterian-support-canterbury",
    name: "Presbyterian Support Canterbury",
    phone: "03 379 0440",
    website: "https://www.psc.org.nz",
    regions: ["Christchurch"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["NASC", "Ministry of Health"],
    notes:
      "Community care including personal assistance and disability support. SCI carer experience.",
  },
  {
    id: "ccs-disability-action-christchurch",
    name: "CCS Disability Action Canterbury",
    phone: "03 366 6189",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: ["Christchurch"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Support coordination and in-home disability support. Experienced with SCI at all levels.",
  },
  {
    id: "geneva-healthcare-christchurch",
    name: "Geneva Healthcare Christchurch",
    phone: "03 338 9001",
    website: "https://www.genevahealthcare.co.nz",
    regions: ["Christchurch"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC", "Ministry of Health"],
    notes:
      "Personal care and complex nursing support. Contracted ACC provider for SCI clients.",
  },

  // Hamilton
  {
    id: "ccs-disability-action-waikato",
    name: "CCS Disability Action Waikato",
    phone: "07 839 1664",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: ["Hamilton"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Support coordination and personal care for disabled people. Tetraplegia and paraplegia experience.",
  },
  {
    id: "geneva-healthcare-hamilton",
    name: "Geneva Healthcare Waikato",
    phone: "07 839 2029",
    website: "https://www.genevahealthcare.co.nz",
    regions: ["Hamilton"],
    specialties: ["paraplegia"],
    fundingTypes: ["ACC", "Ministry of Health"],
    notes: "Home health and personal care in the Waikato region.",
  },

  // Tauranga
  {
    id: "ccs-disability-action-bay-of-plenty",
    name: "CCS Disability Action Bay of Plenty",
    phone: "07 578 1881",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: ["Tauranga"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Support coordination and disability support services across the Bay of Plenty.",
  },

  // Dunedin
  {
    id: "presbyterian-support-otago",
    name: "Presbyterian Support Otago",
    phone: "03 477 7116",
    website: "https://www.psotago.org.nz",
    regions: ["Dunedin"],
    specialties: ["paraplegia"],
    fundingTypes: ["NASC", "Ministry of Health"],
    notes:
      "Community support and personal care services across Otago.",
  },
  {
    id: "nurse-maude-otago",
    name: "Geneva Healthcare Otago",
    phone: "03 477 0900",
    website: "https://www.genevahealthcare.co.nz",
    regions: ["Dunedin"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "Ministry of Health"],
    notes: "Home health and personal care across the Otago region.",
  },

  // Palmerston North
  {
    id: "ccs-disability-action-manawatu",
    name: "CCS Disability Action Manawatu",
    phone: "06 356 1487",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: ["Palmerston North"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Disability support and coordination in Manawatu / Palmerston North.",
  },

  // Napier / Hastings
  {
    id: "ccs-disability-action-hawkes-bay",
    name: "CCS Disability Action Hawke's Bay",
    phone: "06 835 8839",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: ["Napier / Hastings"],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "Support coordination and personal care across Hawke's Bay. SCI experienced.",
  },

  // Nationwide
  {
    id: "geneva-healthcare-national",
    name: "Geneva Healthcare (National)",
    phone: "0800 436 382",
    website: "https://www.genevahealthcare.co.nz",
    regions: [
      "Auckland",
      "Wellington",
      "Christchurch",
      "Hamilton",
      "Tauranga",
      "Napier / Hastings",
      "Dunedin",
      "Palmerston North",
      "Kapiti Coast",
      "Lower Hutt",
      "Upper Hutt",
    ],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC", "Ministry of Health"],
    notes:
      "Largest home health provider in NZ. Experienced with all levels of SCI. ACC and Government contracted.",
  },
  {
    id: "ccs-disability-action-national",
    name: "CCS Disability Action (National)",
    phone: "0800 227 200",
    website: "https://www.ccsdisabilityaction.org.nz",
    regions: [
      "Auckland",
      "Wellington",
      "Christchurch",
      "Hamilton",
      "Tauranga",
      "Napier / Hastings",
      "Dunedin",
      "Palmerston North",
      "Kapiti Coast",
      "Lower Hutt",
      "Upper Hutt",
    ],
    specialties: ["tetraplegia", "paraplegia"],
    fundingTypes: ["ACC", "NASC"],
    notes:
      "National disability support network. Extensive SCI carer experience at all injury levels.",
  },
];
