export type ClinicalTrialItem = {
  id: string;
  title: string;
  summary: string;
  stage: "Pre-clinical" | "Recruiting" | "Early Human" | "Ongoing";
  location: string;
  tags: string[];
  eligibility: string[];
  sources: {
    label: string;
    url: string;
  }[];
};

export const CLINICAL_TRIALS: ClinicalTrialItem[] = [
  {
    id: "epidural-stimulation-chronic-sci",
    title: "Epidural Stimulation for Chronic SCI",
    summary:
      "Research exploring spinal cord stimulation to restore voluntary movement in chronic spinal cord injury.",
    stage: "Ongoing",
    location: "United States",
    tags: ["stimulation", "motor-recovery"],
    eligibility: [
      "Chronic SCI",
      "Thoracic injuries",
      "Wheelchair users",
    ],
    sources: [
      {
        label: "ClinicalTrials.gov",
        url: "https://clinicaltrials.gov",
      },
    ],
  },
  {
    id: "stem-cell-sci-japan",
    title: "Stem Cell Therapy for SCI",
    summary:
      "Early-stage trials investigating stem cell transplantation following spinal cord injury.",
    stage: "Early Human Trial",
    location: "Japan",
    tags: ["stem-cells", "regeneration"],
  },
  {
    id: "brain-computer-interface",
    title: "Brain–Computer Interfaces for SCI",
    summary:
      "Research into neural interfaces that bypass spinal cord injury to restore function.",
    stage: "Preclinical",
    location: "Global",
    tags: ["bci", "neurotech"],
  },
  {
    id: "transcutaneous-spinal-stimulation",
    title: "Transcutaneous Spinal Cord Stimulation",
    summary:
      "Non-invasive electrical stimulation applied through the skin to improve movement and function.",
    stage: "Early Human",
    location: "United States",
    tags: ["stimulation", "non-invasive"],
  },
  {
    id: "stem-cell-safety-sci",
    title: "Stem Cell Safety Studies in SCI",
    summary:
      "Research evaluating the safety of stem cell therapies for spinal cord injury.",
    stage: "Pre-clinical",
    location: "Asia",
    tags: ["stem-cells", "safety"],
  },
  {
    id: "robotic-gait-training-sci",
    title: "Robotic Gait Training After SCI",
    summary:
      "Studies examining robotic-assisted walking devices for rehabilitation after spinal cord injury.",
    stage: "Ongoing",
    location: "Europe",
    tags: ["rehabilitation", "robotics"],
  },
  {
    id: "brain-spine-interface",
    title: "Brain–Spine Interface Research",
    summary:
      "Experimental systems linking brain signals directly to spinal stimulation.",
    stage: "Pre-clinical",
    location: "Switzerland",
    tags: ["neurotechnology", "interfaces"],
  },
  {
    id: "respiratory-support-sci",
    title: "Respiratory Support Innovations in SCI",
    summary:
      "Research into new methods for supporting breathing in high-level spinal cord injury.",
    stage: "Early Human",
    location: "United Kingdom",
    tags: ["respiratory", "high-level-sci"],
  },
];