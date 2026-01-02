export type AssistiveTechItem = {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  category: string;
  heroImageUrl: string;
  eligibility: string[];
  sources: {
    label: string;
    url: string;
  }[];
};

export const ASSISTIVE_TECH_ITEMS: AssistiveTechItem[] = [
  {
    id: "power-assist-wheels",
    title: "Power-Assist Wheels",
    summary:
      "Reduce push effort and shoulder strain without switching to a power chair.",
    description:
      "Power-assist wheels replace standard manual wheelchair wheels and provide motorised support when you push. They can help reduce fatigue and shoulder overuse injuries while keeping the chair lightweight and familiar.",
    tags: ["mobility", "manual-wheelchair", "shoulders"],
    category: "mobility",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07b",
    eligibility: [
      "Manual wheelchair users",
      "Limited hand function",
      "Shoulder pain or fatigue",
    ],
    sources: [
      {
        label: "Physiopedia – Power Assist Wheelchairs",
        url: "https://www.physio-pedia.com/Power_Assist_Wheelchairs",
      },
      {
        label: "Spinal Cord Injury NZ",
        url: "https://www.spinalcordinjury.org.nz",
      },
    ],
  },
  {
    id: "voice-controlled-smart-home",
    title: "Voice-Controlled Smart Home",
    summary:
      "Control lights, doors, and appliances using voice or switches.",
    description:
      "Smart home systems allow people with limited hand function to control their environment using voice assistants, switches, or mobile apps. These setups can significantly increase independence at home.",
    tags: ["smart-home", "voice", "environment"],
    category: "environment",
    heroImageUrl:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    eligibility: [
      "Limited hand function",
      "High-level SCI",
      "Independent living",
    ],
    sources: [
      {
        label: "Spinal Cord Injury Australia – Smart Home Tech",
        url: "https://scia.org.au",
      },
    ],
  },
  {
    id: "environmental-control-units",
    title: "Environmental Control Units (ECUs)",
    summary:
      "Control lights, TV, doors, and other devices from one interface.",
    description:
      "Environmental Control Units allow people with limited hand function to operate multiple household devices from a single system. They can be controlled via switches, voice, mobile apps, or wheelchair controls.",
    tags: ["environment", "accessibility", "smart-home"],
    category: "environment",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827",
    eligibility: [
      "Limited hand function",
      "Power or manual wheelchair users",
    ],
    sources: [
      {
        label: "Physiopedia – Environmental Control Units",
        url: "https://www.physio-pedia.com/Environmental_Control_Units",
      },
    ],
  },
  {
    id: "head-tracking-computer-access",
    title: "Head Tracking for Computer Access",
    summary:
      "Control a computer using head movement instead of hands.",
    description:
      "Head tracking systems use cameras or sensors to translate head movement into cursor control. They are often combined with on-screen keyboards or voice dictation.",
    tags: ["computer-access", "hands-free"],
    category: "computer-access",
    heroImageUrl:
      "https://images.unsplash.com/photo-1581091012184-5c8f1cdd4b1f",
    eligibility: [
      "Limited hand function",
      "Full arm mobility",
    ],
    sources: [
      {
        label: "AbilityNet – Head Tracking Technology",
        url: "https://abilitynet.org.uk",
      },
    ],
  },
  {
    id: "eye-gaze-communication",
    title: "Eye Gaze Communication",
    summary:
      "Use eye movement to type, communicate, and control devices.",
    description:
      "Eye gaze systems track where a person is looking on a screen, allowing selection of letters, words, or controls. Often used for communication and computer access.",
    tags: ["eye-tracking", "communication"],
    category: "communication",
    heroImageUrl:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc",
    eligibility: [
      "Severely limited hand function",
      "Good head and eye control",
    ],
    sources: [
      {
        label: "Physiopedia – Eye Gaze Technology",
        url: "https://www.physio-pedia.com/Eye_Gaze_Technology",
      },
    ],
  },
];