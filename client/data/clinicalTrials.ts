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
      "Research exploring spinal cord stimulation to restore voluntary movement in people with chronic spinal cord injury.",
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
      {
        label: "Nature Reviews Neurology",
        url: "https://www.nature.com",
      },
    ],
  },
  {
    id: "transcutaneous-spinal-stimulation",
    title: "Transcutaneous Spinal Cord Stimulation",
    summary:
      "Non-invasive electrical stimulation applied through the skin to improve movement and function after spinal cord injury.",
    stage: "Early Human",
    location: "United States",
    tags: ["stimulation", "non-invasive"],
    eligibility: [
      "Incomplete SCI",
      "Chronic injury",
    ],
    sources: [
      {
        label: "ClinicalTrials.gov",
        url: "https://clinicaltrials.gov",
      },
    ],
  },
  {
    id: "brain-computer-interface-sci",
    title: "Brain–Computer Interface Research for SCI",
    summary:
      "Experimental systems using brain signals to control external devices or bypass spinal cord injury.",
    stage: "Pre-clinical",
    location: "Europe",
    tags: ["bci", "neurotechnology"],
    eligibility: [
      "Severe motor impairment",
      "Research participants only",
    ],
    sources: [
      {
        label: "NIH – Brain Computer Interfaces",
        url: "https://www.nih.gov",
      },
    ],
  },
  {
    id: "robotic-gait-training",
    title: "Robotic Gait Training After SCI",
    summary:
      "Studies examining robotic-assisted walking devices as part of rehabilitation following spinal cord injury.",
    stage: "Recruiting",
    location: "Europe",
    tags: ["rehabilitation", "robotics"],
    eligibility: [
      "Incomplete SCI",
      "Able to tolerate assisted standing",
    ],
    sources: [
      {
        label: "ClinicalTrials.gov",
        url: "https://clinicaltrials.gov",
      },
    ],
  },
  {
    id: "stem-cell-safety-sci",
    title: "Stem Cell Safety Studies in SCI",
    summary:
      "Early research focused on evaluating the safety of stem cell therapies for spinal cord injury.",
    stage: "Pre-clinical",
    location: "Asia",
    tags: ["stem-cells", "safety"],
    eligibility: [
      "Research stage only",
      "No human participants yet",
    ],
    sources: [
      {
        label: "World Health Organization – Stem Cell Research",
        url: "https://www.who.int",
      },
    ],
  },
];
