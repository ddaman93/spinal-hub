export type UserRole = "sci_patient" | "caregiver" | "health_professional" | "family_member";

export type UserProfile = {
  id: string;
  role?: UserRole;
  name: string;
  email: string;
  phone: string;
  location: string;
  photo?: string;

  // injury
  injuryLevel: string;
  injuryType?: string;       // "Complete" | "Incomplete"
  injuryDate: string;
  rehabCentre: string;

  // mobility
  wheelchairType: string;
  wheelchairModel: string;
  assistiveTech: string;       // comma-joined string (legacy / display)
  assistiveTechList?: string[]; // multi-select array

  // care
  emergencyContact: string;    // combined "Name — Phone" (legacy / display)
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  careCompanies: string;
  caregiverNotes: string;
  careNotes?: string;

  // medical card
  medications?: string;
  allergies?: string;
  medicalNotes?: string;
};
