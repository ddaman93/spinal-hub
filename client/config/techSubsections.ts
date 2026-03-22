import { ASSISTIVE_TECH_ITEMS } from "@/data/assistiveTech";

export type TechSubsection = {
  id: string;
  title: string;
  filterTags: string[];
  seeAllRoute?: "ManualWheelchairTech" | "PowerWheelchairTech";
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
      id: "alternative-mice",
      title: "Alternative Mice",
      filterTags: [],
    },
    {
      id: "on-screen-keyboards",
      title: "On-Screen Keyboards & Text Entry",
      filterTags: [],
    },
    {
      id: "voice-dictation",
      title: "Voice Control & Dictation",
      filterTags: [],
    },
    {
      id: "pointer-cursor-tools",
      title: "Pointer & Cursor Tools",
      filterTags: [],
    },
    {
      id: "remote-bridging",
      title: "Remote Access & Device Bridging",
      filterTags: [],
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
      id: "built-in-ios-android",
      title: "Built into iOS & Android",
      filterTags: [],
    },
    {
      id: "switch-access",
      title: "Switch Access",
      filterTags: [],
    },
    {
      id: "wheelchair-control",
      title: "Wheelchair / Joystick Control",
      filterTags: [],
    },
    {
      id: "mounting",
      title: "Mounting & Positioning",
      filterTags: [],
    },
    {
      id: "stylus",
      title: "Stylus & Touch Aids",
      filterTags: [],
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
