export type AssistiveTechItem = {
  id: string;
  title: string;
  summary: string;
  heroImageUrl: string;
  tags: string[];
};

export const ASSISTIVE_TECH_ITEMS: AssistiveTechItem[] = [
  {
    id: "power-assist-wheels",
    title: "Power-Assist Wheels",
    summary:
      "Reduce push effort and shoulder strain without switching to a power chair.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
    tags: ["manual-chair", "power-assist", "upper-limb"],
  },
  {
    id: "voice-control-smart-home",
    title: "Voice-Controlled Smart Home",
    summary:
      "Control lights, doors, and devices using voice assistants.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827",
    tags: ["voice-control", "smart-home"],
  },
  {
    id: "wheelchair-mounting-systems",
    title: "Mounting Systems",
    summary:
      "Secure phones, tablets, and controls directly to your chair.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1581092919534-3c8c0f6b09c3",
    tags: ["mounting", "mobility"],
  },
];