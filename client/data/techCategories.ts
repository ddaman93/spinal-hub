export type TechCategory = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export type TechSubsection = {
  id: string;
  title: string;
  filterTag: string;
  navigationRoute: "ManualWheelchairTech" | "PowerWheelchairTech";
};

export const TECH_SUBSECTIONS: Record<string, TechSubsection[]> = {
  mobility: [
    {
      id: "manual-wheelchair",
      title: "Manual Wheelchair Tech",
      filterTag: "manual-wheelchair",
      navigationRoute: "ManualWheelchairTech",
    },
    {
      id: "power-wheelchair",
      title: "Power Wheelchair Tech",
      filterTag: "power-wheelchair",
      navigationRoute: "PowerWheelchairTech",
    },
  ],
};

export const TECH_CATEGORIES: TechCategory[] = [
  {
    id: "mobility",
    title: "Mobility & Wheelchair Tech",
    subtitle: "Power assist, handcycles, propulsion aids",
    description:
      "Assistive technology designed to improve mobility, reduce fatigue, and increase independence for manual and power wheelchair users.",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07b?w=400&h=200&fit=crop",
  },
  {
    id: "smart-home",
    title: "Smart Home & IoT",
    subtitle: "Voice controls, ECUs, smart lighting",
    description:
      "Smart home systems and environmental control units that let you control lights, doors, appliances, and other devices through voice, switches, or mobile apps.",
    image:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=200&fit=crop",
  },
  {
    id: "computer-access",
    title: "Computer & Productivity Tech",
    subtitle: "Head tracking, eye-gaze, speech recognition",
    description:
      "Hands-free computing solutions including head tracking systems, eye-gaze control, and voice dictation for accessing computers and productivity software.",
    image:
      "https://images.unsplash.com/photo-1581091012184-5c8f1cdd4b1f?w=400&h=200&fit=crop",
  },
  {
    id: "communication",
    title: "Communication Aids",
    subtitle: "AAC devices, speech generation, eye-gaze",
    description:
      "Augmentative and alternative communication (AAC) devices and software that help people with speech difficulties communicate effectively.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=200&fit=crop",
  },
  {
    id: "phone-tablet",
    title: "Phone & Tablet Access",
    subtitle: "Switch access, voice control, settings",
    description:
      "Adaptive solutions for using smartphones and tablets, including switch access, voice commands, and accessibility settings for people with limited hand function.",
    image:
      "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&h=200&fit=crop",
  },
  {
    id: "environment",
    title: "Environmental Controls",
    subtitle: "Smart switches, ECUs, device control",
    description:
      "Specialized interfaces and controls for managing household devices, including environmental control units (ECUs) and smart switches.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=200&fit=crop",
  },
];
