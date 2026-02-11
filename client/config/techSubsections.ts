import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";

export type TechSubsection = {
  id: string;
  title: string;
  filterTags: string[];
  seeAllRoute?: "ManualWheelchairTech" | "PowerWheelchairTech" | "ComputerProductivityTech";
};

export const TECH_SUBSECTIONS: Record<string, TechSubsection[]> = {
  mobility: [
    {
      id: "manual-wheelchair",
      title: "Manual Wheelchair Tech",
      filterTags: ["manual-wheelchair"],
      seeAllRoute: "ManualWheelchairTech",
    },
    {
      id: "power-wheelchair",
      title: "Power Wheelchair Tech",
      filterTags: ["power-wheelchair"],
      seeAllRoute: "PowerWheelchairTech",
    },
  ],
  "smart-home": [
    {
      id: "voice-control",
      title: "Voice & Smart Assistants",
      filterTags: ["voice"],
    },
    {
      id: "smart-devices",
      title: "Smart Lighting & Doors",
      filterTags: ["smart-home"],
    },
  ],
  "computer-access": [
    {
      id: "computer-productivity",
      title: "Computer & Productivity Tech",
      filterTags: ["computer-access", "alternative-input", "voice-dictation"],
      seeAllRoute: "ComputerProductivityTech",
    },
    {
      id: "head-eye-tracking",
      title: "Head & Eye Tracking",
      filterTags: ["eye-tracking"],
    },
    {
      id: "voice-switch",
      title: "Voice & Switch Access",
      filterTags: ["hands-free", "switches"],
    },
  ],
  communication: [
    {
      id: "eye-gaze-aac",
      title: "Eye-Gaze Communication",
      filterTags: ["eye-tracking", "aac"],
    },
    {
      id: "switch-voice-aac",
      title: "Switch & Voice Communication",
      filterTags: ["switches", "aac"],
    },
  ],
  "phone-tablet": [
    {
      id: "switch-access-mobile",
      title: "Switch Access",
      filterTags: ["switches", "mobile"],
    },
    {
      id: "voice-mobile",
      title: "Voice Control",
      filterTags: ["voice", "mobile"],
    },
  ],
  environment: [
    {
      id: "smart-systems",
      title: "Smart Systems",
      filterTags: ["smart-home"],
    },
    {
      id: "adaptive-tools",
      title: "Adaptive Daily Living",
      filterTags: ["kitchen", "daily-living"],
    },
  ],
};

export function getSubsectionItems(
  categoryId: string,
  subsectionId: string
): typeof ASSISTIVE_TECH_ITEMS {
  const subsections = TECH_SUBSECTIONS[categoryId];
  if (!subsections) return [];

  const subsection = subsections.find((s) => s.id === subsectionId);
  if (!subsection) return [];

  return ASSISTIVE_TECH_ITEMS.filter((item) =>
    subsection.filterTags.some((tag) => item.tags.includes(tag))
  );
}
