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
  /* ────────────────── MOBILITY & WHEELCHAIR TECH ────────────────── */
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
    id: "handcycle-attachments",
    title: "Handcycle & Trike Attachments",
    summary: "Hand-powered vehicles for independent mobility.",
    description:
      "Handcycles and tricycle attachments provide an alternative propulsion method for people with limited lower limb function. Available in various configurations including recumbent and upright designs.",
    tags: ["mobility", "alternative-propulsion", "independence"],
    category: "mobility",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    eligibility: ["Manual wheelchair users", "Adequate upper body strength"],
    sources: [
      {
        label: "Physiopedia – Handcycles",
        url: "https://www.physio-pedia.com/Handcycles",
      },
    ],
  },
  {
    id: "wheelchair-cushions-positioning",
    title: "Wheelchair Cushions & Positioning",
    summary: "Pressure relief and comfort seating systems.",
    description:
      "Specialized wheelchair cushions designed to prevent pressure sores and provide optimal support and comfort for extended wheelchair use.",
    tags: ["mobility", "comfort", "pressure-relief"],
    category: "mobility",
    heroImageUrl:
      "https://images.unsplash.com/photo-1563050487-ee8c3646d02a?w=400&h=300&fit=crop",
    eligibility: ["Wheelchair users", "High pressure sore risk"],
    sources: [
      {
        label: "Spinal Cord Injury Australia",
        url: "https://scia.org.au",
      },
    ],
  },

  /* ────────────────── SMART HOME & IOT ────────────────── */
  {
    id: "voice-controlled-smart-home",
    title: "Voice-Controlled Smart Home",
    summary:
      "Control lights, doors, and appliances using voice or switches.",
    description:
      "Smart home systems allow people with limited hand function to control their environment using voice assistants, switches, or mobile apps. These setups can significantly increase independence at home.",
    tags: ["smart-home", "voice", "environment"],
    category: "smart-home",
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
    category: "smart-home",
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
    id: "smart-door-openers",
    title: "Smart Door Openers & Access Control",
    summary: "Automatic doors activated by buttons, sensors, or voice.",
    description:
      "Automated door opening systems that can be triggered by switches, motion sensors, or voice commands, enabling independent access to rooms and buildings.",
    tags: ["smart-home", "access", "independence"],
    category: "smart-home",
    heroImageUrl:
      "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop",
    eligibility: ["Limited hand function", "Wheelchair users"],
    sources: [
      {
        label: "ADA – Automatic Door Openers",
        url: "https://www.ada.gov",
      },
    ],
  },

  /* ────────────────── COMPUTER & PRODUCTIVITY TECH ────────────────── */
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
      "Good head control",
    ],
    sources: [
      {
        label: "AbilityNet – Head Tracking Technology",
        url: "https://abilitynet.org.uk",
      },
    ],
  },
  {
    id: "eye-gaze-computer-access",
    title: "Eye-Gaze Computer Control",
    summary:
      "Control computers and devices using eye movement.",
    description:
      "Eye-gaze tracking systems detect where you're looking on a screen and allow selection of controls, text input, and device operation through eye movement.",
    tags: ["computer-access", "hands-free", "eye-tracking"],
    category: "computer-access",
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
  {
    id: "speech-recognition-software",
    title: "Speech Recognition & Voice Dictation",
    summary: "Control your computer and create documents by speaking.",
    description:
      "Advanced voice recognition software that allows hands-free typing, document creation, and computer control through natural speech and voice commands.",
    tags: ["computer-access", "hands-free", "voice"],
    category: "computer-access",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599062072519-5fcb64cf35e1?w=400&h=300&fit=crop",
    eligibility: ["Clear speech", "Limited hand function"],
    sources: [
      {
        label: "Dragon NaturallySpeaking",
        url: "https://www.nuance.com/dragon.html",
      },
    ],
  },
  {
    id: "switch-access-computing",
    title: "Switch Access for Computing",
    summary: "Operate computers with one or more adaptive switches.",
    description:
      "Switch-based scanning systems that allow computer control using adaptive switches (button, sip-and-puff, head switches, etc.) without requiring hand or eye movement.",
    tags: ["computer-access", "switches", "hands-free"],
    category: "computer-access",
    heroImageUrl:
      "https://images.unsplash.com/photo-1503387762519-52582b742d55?w=400&h=300&fit=crop",
    eligibility: ["Limited hand/arm function", "Basic mobility control"],
    sources: [
      {
        label: "Physiopedia – Switch Access",
        url: "https://www.physio-pedia.com/Switch_Access",
      },
    ],
  },

  /* ────────────────── COMMUNICATION AIDS ────────────────── */
  {
    id: "eye-gaze-communication",
    title: "Eye-Gaze Communication Devices",
    summary:
      "Use eye movement to type, communicate, and share thoughts.",
    description:
      "Eye-gaze AAC (Augmentative and Alternative Communication) devices allow people with severe speech or motor impairments to communicate by looking at letters, words, or phrases displayed on a screen.",
    tags: ["communication", "eye-tracking", "aac"],
    category: "communication",
    heroImageUrl:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc",
    eligibility: [
      "Speech impairment",
      "Good eye control",
      "Severely limited motor function",
    ],
    sources: [
      {
        label: "Tobii Dynavox AAC Devices",
        url: "https://www.tobiidynavox.com",
      },
    ],
  },
  {
    id: "switch-aac-devices",
    title: "Switch-Based AAC Devices",
    summary: "Communicate using one or more adaptive switches.",
    description:
      "Augmentative and alternative communication devices controlled through adaptive switches, allowing non-verbal individuals to express themselves through pre-recorded messages or generated speech.",
    tags: ["communication", "switches", "aac"],
    category: "communication",
    heroImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f70db51ca?w=400&h=300&fit=crop",
    eligibility: ["Speech impairment", "Limited motor control"],
    sources: [
      {
        label: "Physiopedia – AAC Devices",
        url: "https://www.physio-pedia.com/AAC_Devices",
      },
    ],
  },
  {
    id: "text-to-speech-software",
    title: "Text-to-Speech Software",
    summary: "Convert written text into natural-sounding speech.",
    description:
      "Software that reads written text aloud with natural-sounding voices, allowing people with speech impairments to communicate through typing or word selection.",
    tags: ["communication", "speech", "software"],
    category: "communication",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599062072519-5fcb64cf35e1?w=400&h=300&fit=crop",
    eligibility: ["Speech impairment", "Ability to type or select words"],
    sources: [
      {
        label: "NVDA – Free Screen Reader",
        url: "https://www.nvaccess.org",
      },
    ],
  },

  /* ────────────────── PHONE & TABLET ACCESS ────────────────── */
  {
    id: "switch-access-mobile",
    title: "Switch Access for Mobile Devices",
    summary: "Control phones and tablets using adaptive switches.",
    description:
      "Adaptive switch configurations and software that enable people with limited hand function to control smartphones and tablets using switches, head tracking, or eye-gaze.",
    tags: ["phone-tablet", "switches", "mobile"],
    category: "phone-tablet",
    heroImageUrl:
      "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&h=300&fit=crop",
    eligibility: ["Limited hand function", "iOS or Android device"],
    sources: [
      {
        label: "iOS Accessibility – Switch Control",
        url: "https://www.apple.com/accessibility/switch-control/",
      },
    ],
  },
  {
    id: "voice-control-mobile",
    title: "Voice Control for Mobile Devices",
    summary: "Control your phone or tablet entirely by voice.",
    description:
      "Voice control features built into iOS and Android that allow hands-free operation of smartphones and tablets through voice commands and voice typing.",
    tags: ["phone-tablet", "voice", "mobile"],
    category: "phone-tablet",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599062072519-5fcb64cf35e1?w=400&h=300&fit=crop",
    eligibility: ["Clear speech", "Any smartphone or tablet"],
    sources: [
      {
        label: "Apple Voice Control",
        url: "https://www.apple.com/accessibility/voicecontrol/",
      },
      {
        label: "Android Voice Access",
        url: "https://play.google.com/store/apps/details?id=com.google.android.voiceaccess",
      },
    ],
  },
  {
    id: "one-handed-mobile-operation",
    title: "One-Handed Mobile Operation",
    summary: "Operate your phone or tablet with one hand.",
    description:
      "Accessibility features and cases designed for one-handed phone/tablet operation, including reachability modes, one-handed keyboards, and specialized grips.",
    tags: ["phone-tablet", "one-handed", "accessibility"],
    category: "phone-tablet",
    heroImageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
    eligibility: ["Limited use of one hand", "Smartphone/tablet user"],
    sources: [
      {
        label: "iOS One-Handed Keyboard",
        url: "https://support.apple.com/en-us/HT202612",
      },
    ],
  },

  /* ────────────────── ENVIRONMENTAL CONTROLS ────────────────── */
  {
    id: "smart-lighting-systems",
    title: "Smart Lighting Systems",
    summary: "Control lights with voice, apps, or adaptive switches.",
    description:
      "Smart lighting solutions that can be controlled hands-free through voice assistants, mobile apps, or adaptive switch interfaces, enabling independent control of home lighting.",
    tags: ["environment", "smart-home", "lighting"],
    category: "environment",
    heroImageUrl:
      "https://images.unsplash.com/photo-1565636192335-14c46fa1120e?w=400&h=300&fit=crop",
    eligibility: ["Limited hand function", "Smart home compatible device"],
    sources: [
      {
        label: "Philips Hue Smart Lights",
        url: "https://www.philips-hue.com",
      },
    ],
  },
  {
    id: "smart-bed-systems",
    title: "Smart Bed Systems",
    summary: "Adjustable beds controlled by switches or voice.",
    description:
      "Electric adjustable beds with smart controls that can be operated through switches, remotes, mobile apps, or voice commands, allowing independent positioning and comfort.",
    tags: ["environment", "positioning", "comfort"],
    category: "environment",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    eligibility: ["Limited mobility", "Positioning needs"],
    sources: [
      {
        label: "Smart Adjustable Beds",
        url: "https://www.bedsforless.com",
      },
    ],
  },
  {
    id: "adaptive-kitchen-appliances",
    title: "Adaptive Kitchen Appliances",
    summary: "Hands-free or adaptive control for cooking and food prep.",
    description:
      "Kitchen appliances adapted for one-handed or voice-controlled operation, including adaptive utensils, one-handed pots, and voice-controlled cooking devices.",
    tags: ["environment", "kitchen", "daily-living"],
    category: "environment",
    heroImageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    eligibility: ["Limited hand function", "Kitchen independence"],
    sources: [
      {
        label: "Adaptive Cooking Aids",
        url: "https://www.rehabmart.com",
      },
    ],
  },
];