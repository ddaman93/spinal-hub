export type ManualWheelchairProduct = {
  id: string;
  title: string;
  description: string;
  image: any; // local require()
  tags: string[];
  category:
    | "power-assist"
    | "handcycle"
    | "propulsion"
    | "transfer";
};

/* ───────────────────────── Power Assist Wheels ───────────────────────── */

export const POWER_ASSIST_WHEELS: ManualWheelchairProduct[] = [
  {
    id: "smartdrive-mx2",
    title: "SmartDrive MX2+",
    description:
      "Rear-mounted power assist unit that reduces push effort and upper-limb fatigue.",
    image: require("@/assets/images/manual/smartdrive.jpg"),
    tags: ["manual-wheelchair", "power-assist"],
    category: "power-assist",
  },
  {
    id: "emotion-m25",
    title: "e-motion Wheels",
    description:
      "Motorised wheels that assist each push stroke for smoother propulsion and control.",
    image: require("@/assets/images/manual/emotion.jpg"),
    tags: ["manual-wheelchair", "power-assist"],
    category: "power-assist",
  },
];

/* ───────────────────────── Handcycle Attachments ───────────────────────── */

export const HANDCYCLE_ATTACHMENTS: ManualWheelchairProduct[] = [
  {
    id: "triride",
    title: "Triride Handcycle",
    description:
      "Front-mounted electric handcycle attachment designed for long-distance mobility.",
    image: require("@/assets/images/manual/triride.jpg"),
    tags: ["manual-wheelchair", "handcycle", "outdoor"],
    category: "handcycle",
  },
  {
    id: "batec",
    title: "Batec Electric Handbike",
    description:
      "High-performance clip-on handbike for outdoor and urban environments.",
    image: require("@/assets/images/manual/batec.jpg"),
    tags: ["manual-wheelchair", "handcycle", "terrain"],
    category: "handcycle",
  },
];

/* ───────────────────────── Propulsion Aids ───────────────────────── */

export const PROPULSION_AIDS: ManualWheelchairProduct[] = [
  {
    id: "ergonomic-pushrims",
    title: "Ergonomic Push Rims",
    description:
      "Shaped push rims designed to reduce wrist strain and improve grip efficiency.",
    image: require("@/assets/images/manual/pushrim.jpg"),
    tags: ["manual-wheelchair", "propulsion", "ergonomics"],
    category: "propulsion",
  },
];

/* ───────────────────────── Transfer & Setup Aids ───────────────────────── */

export const TRANSFER_AND_SETUP_AIDS: ManualWheelchairProduct[] = [
  {
    id: "transfer-board",
    title: "Transfer Board",
    description:
      "Smooth board used to assist transfers between wheelchair and other surfaces.",
    image: require("@/assets/images/manual/transfer-board.jpg"),
    tags: ["manual-wheelchair", "transfer"],
    category: "transfer",
  },
];

/* ───────────────────────── Optional Aggregate Export ───────────────────────── */

export const MANUAL_WHEELCHAIR_PRODUCTS: ManualWheelchairProduct[] = [
  ...POWER_ASSIST_WHEELS,
  ...HANDCYCLE_ATTACHMENTS,
  ...PROPULSION_AIDS,
  ...TRANSFER_AND_SETUP_AIDS,
];