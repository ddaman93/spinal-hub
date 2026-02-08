import { ImageSource } from "expo-image";

export type TechCategory = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string | ImageSource;
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
    image: require("@/assets/images/assistive-tech/Electric-Wheelchair-Vs.-Manual-Wheelchair.webp"),
  },
  {
    id: "smart-home",
    title: "Smart Home & IoT",
    subtitle: "Voice controls, ECUs, smart lighting",
    description:
      "Smart home systems and environmental control units that let you control lights, doors, appliances, and other devices through voice, switches, or mobile apps.",
    image: require("@/assets/images/assistive-tech/smart-home-tech.jpg"),
    },
  {
    id: "computer-access",
    title: "Computer & Productivity Tech",
    subtitle: "Head tracking, eye-gaze, speech recognition",
    description:
      "Hands-free computing solutions including head tracking systems, eye-gaze control, and voice dictation for accessing computers and productivity software.",
    image: require("@/assets/images/assistive-tech/computer-tech.jpg"),
  },
  {
    id: "communication",
    title: "Communication Aids",
    subtitle: "AAC devices, speech generation, eye-gaze",
    description:
      "Augmentative and alternative communication (AAC) devices and software that help people with speech difficulties communicate effectively.",
    image: require("@/assets/images/assistive-tech/Communication-Devices.png"),
  },
  {
    id: "phone-tablet",
    title: "Phone & Tablet Access",
    subtitle: "Switch access, voice control, settings",
    description:
      "Adaptive solutions for using smartphones and tablets, including switch access, voice commands, and accessibility settings for people with limited hand function.",
    image: require("@/assets/images/assistive-tech/phone-tablet-access.webp"),
  },
];
