/* ───────────────────────── types ───────────────────────── */

export type PowerWheelchairCategory =
  | "seating"
  | "mounts"
  | "safety"
  | "power-charging"
  | "smart-tech"
  | "alternative-controls";

export type PowerWheelchairProduct = {
  id: string;
  title: string;
  description: string;
  image: string; // URL string
  tags: string[];
  category: PowerWheelchairCategory;
  whatItIs: string;
  whatItDoes: string;
  whoItsFor: string;
  productUrl?: string;
};

/* ───────────────────────── categories ───────────────────────── */

export const POWER_WHEELCHAIR_CATEGORIES: {
  id: PowerWheelchairCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "seating",
    label: "Seating & Positioning",
    description: "Pressure relief, posture support, head/trunk stability.",
  },
  {
    id: "mounts",
    label: "Mounts & Carrying",
    description: "Phone/tablet mounts, trays, bags, and everyday carry add-ons.",
  },
  {
    id: "safety",
    label: "Safety & Awareness",
    description: "Reverse camera, proximity sensors, mirrors, and visibility upgrades.",
  },
  {
    id: "power-charging",
    label: "Power & Charging",
    description: "USB charging adaptors and controller-based charging options.",
  },
  {
    id: "smart-tech",
    label: "Smart Tech & Connectivity",
    description: "Bluetooth/IR integrations to control phones, tablets, and environments.",
  },
  {
    id: "alternative-controls",
    label: "Alternative Drive Controls",
    description: "Chin, head array, sip & puff, and other access methods.",
  },
];

/* ───────────────────────── Seating & Positioning ───────────────────────── */

export const SEATING_AND_POSITIONING: PowerWheelchairProduct[] = [
  {
    id: "roho-hybrid-select-cushion",
    title: "ROHO Hybrid Select Cushion",
    description:
      "Air + foam hybrid cushion for pressure management and stability.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/roho%20hybrid.webp",
    tags: ["power-wheelchair", "cushion", "pressure-relief"],
    category: "seating",
    whatItIs:
      "A hybrid cushion combining ROHO air cells with a foam base to balance pressure relief with postural stability.",
    whatItDoes:
      "Helps reduce pressure injury risk while improving pelvic stability for more efficient sitting and driving.",
    whoItsFor:
      "People at risk of pressure injuries or who need a more stable sitting base (common with higher-level SCI).",
    productUrl:
      "https://www.permobil.com/en-nz/products/seating-positioning/cushioning-products/roho/hybrid-series/roho-hybrid-select-cushion",
  },
  {
    id: "jay-j3-back-support",
    title: "JAY J3 Back Support",
    description: "Contoured back support for posture, stability, and comfort.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/J3-1back.png",
    tags: ["power-wheelchair", "back-support", "posture"],
    category: "seating",
    whatItIs:
      "A contoured wheelchair back system designed to support trunk posture and distribute pressure.",
    whatItDoes:
      "Improves upright alignment, reduces fatigue, and can enhance head/arm function by stabilising the torso.",
    whoItsFor:
      "Users who need stronger trunk support to sit upright comfortably for long periods.",
    productUrl: "https://medifab.com/nz/product/jay-j3-back-support/",
  },
  {
    id: "spex-fixed-lateral-trunk-support",
    title: "Spex Fixed Lateral Trunk Support",
    description: "Lateral supports to improve trunk stability and midline posture.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/Spex-Lateral-Bracket-Fixed-medium.png",
    tags: ["power-wheelchair", "lateral-support", "trunk"],
    category: "seating",
    whatItIs:
      "Side (lateral) trunk supports that mount to the seating system to help maintain midline posture.",
    whatItDoes:
      "Reduces leaning, improves breathing mechanics and arm reach by stabilising the trunk.",
    whoItsFor:
      "People with reduced trunk control, scoliosis tendency, or fatigue-related leaning.",
    productUrl: "https://medifab.com/nz/product/spex-fixed-lateral-trunk-support/",
  },
  {
    id: "spex-comfort-head-support",
    title: "Spex Comfort Head Support",
    description: "Adjustable head support for alignment, comfort, and fatigue reduction.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/Spex-Comfort-250-Head-Support-Pad-1-Chilli-Red-medium.png",
    tags: ["power-wheelchair", "head-support", "positioning"],
    category: "seating",
    whatItIs:
      "A modular head support system designed to help position and support the head comfortably.",
    whatItDoes:
      "Helps maintain head alignment for driving, communication, and reducing neck fatigue.",
    whoItsFor:
      "Users with limited neck strength/endurance or those using alternative drive controls.",
    productUrl: "https://medifab.com/nz/product/spex-comfort-head-support/",
  },
];

/* ───────────────────────── Mounts & Carrying ───────────────────────── */

export const MOUNTS_AND_CARRYING: PowerWheelchairProduct[] = [
  {
    id: "rehadapt-wheelchair-mounts",
    title: "Rehadapt Wheelchair Mounts",
    description:
      "Modular mounting system for phones, tablets, switches, AAC, and more.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/rehadapt-wheelchair-mounts-3a1aa55609.jpg",
    tags: ["power-wheelchair", "mount", "tablet", "phone", "aac"],
    category: "mounts",
    whatItIs:
      "A high-quality modular mounting ecosystem used to position devices securely on a wheelchair.",
    whatItDoes:
      "Lets you place a phone/tablet/AAC/switch where you can see and reach it reliably without constant re-adjustment.",
    whoItsFor:
      "Anyone using a phone/tablet, AAC device, switch access, or needing consistent device placement.",
    productUrl: "https://assistive.co.nz/product/rehadapt-wheelchair-mounts/",
  },
  {
    id: "tru-balance-phone-holder",
    title: "TRU-Balance Phone Holder",
    description: "Arm-mounted phone holder to keep your phone secure and accessible.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/tru-balance-phone-holder-838fc1cc9c.png",
    tags: ["power-wheelchair", "phone", "mount"],
    category: "mounts",
    whatItIs:
      "A wheelchair phone mounting option designed to keep a phone stable while driving.",
    whatItDoes:
      "Supports navigation, calls, music, and smart-home controls without needing to hold the phone.",
    whoItsFor:
      "Users who want phone access without risking drops or awkward positioning.",
    productUrl: "https://alliedmedical.co.nz/products/tru-balance-3-phone-holder",
  },
  {
    id: "powerchair-wheelchair-trays",
    title: "Powerchair / Wheelchair Tray",
    description: "Clear tray surface for eating, work, or holding devices.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/powerchair-wheelchair-trays-1cbf757fe1.png",
    tags: ["power-wheelchair", "tray", "work-surface"],
    category: "mounts",
    whatItIs:
      "A tray surface fitted to your chair to create a stable platform for daily activities.",
    whatItDoes:
      "Makes it easier to use devices, eat, write, or carry items while seated.",
    whoItsFor:
      "Anyone who wants a stable surface for day-to-day independence or device use.",
    productUrl: "https://alliedmedical.co.nz/products/aml-trays",
  },
  {
    id: "quantum-personal-item-pouch",
    title: "Quantum Personal Item Pouch",
    description: "Wheelchair-mounted pouch to keep essentials within reach.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/quantum-personal-item-pouch-7217e4841d.jpg",
    tags: ["power-wheelchair", "storage", "pouch"],
    category: "mounts",
    whatItIs:
      "A durable pouch that mounts to the chair to carry personal items securely.",
    whatItDoes:
      "Keeps essentials (keys, meds, charger, wallet) accessible without needing a backpack.",
    whoItsFor:
      "Anyone who wants better carry capacity without items falling out or dangling.",
    productUrl: "https://alliedmedical.co.nz/products/personal-item-pouch",
  },
];

/* ───────────────────────── Safety & Awareness ───────────────────────── */

export const SAFETY_AND_AWARENESS: PowerWheelchairProduct[] = [
  {
    id: "quantum-backup-camera",
    title: "Quantum Backup Camera",
    description:
      "Rear-view camera kit to improve reversing safety and obstacle awareness.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/quantum-backup-camera-8380f3501f.png",
    tags: ["power-wheelchair", "camera", "safety"],
    category: "safety",
    whatItIs:
      "A mounted rear-view camera system designed for powerchair use.",
    whatItDoes:
      "Improves reversing confidence and helps avoid backing into people/objects.",
    whoItsFor:
      "People who struggle to turn or look behind (common with higher-level tetraplegia).",
    productUrl: "https://alliedmedical.co.nz/products/quantum-s-wheelchair-backup-camera",
  },
  {
    id: "braze-sentina-sensor-system",
    title: "Braze Sentina Sensor System",
    description:
      "Blind-spot/proximity sensor system for rear obstacle awareness.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/braze-sentina-sensor-system-37050f9119.png",
    tags: ["power-wheelchair", "proximity", "sensor", "safety"],
    category: "safety",
    whatItIs:
      "A sensor system that detects obstacles behind (and potentially around) the chair.",
    whatItDoes:
      "Provides alerts to reduce collisions and improve confidence in tight spaces.",
    whoItsFor:
      "Users who often reverse in busy environments (hospitals, malls, footpaths).",
    productUrl: "https://alliedmedical.co.nz/products/braze-sentina-sensor-system",
  },
  {
    id: "wing-mirror-wheelchair",
    title: "Wheelchair Wing Mirror",
    description: "Simple mirror accessory for rear/side visibility.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/wing-mirror-wheelchair-9e99f0db01.png",
    tags: ["power-wheelchair", "mirror", "safety"],
    category: "safety",
    whatItIs:
      "A mountable mirror designed to give better awareness of what’s behind you.",
    whatItDoes:
      "Reduces accidental bumps and improves situational awareness when reversing or turning.",
    whoItsFor:
      "Anyone who can’t easily look back or wants quick ‘at a glance’ awareness.",
    productUrl: "https://kyleeandco.nz/products/wing-mirror-for-wheelchair",
  },
  {
    id: "safety-flag",
    title: "Safety Flag",
    description: "High-visibility flag to help others see you outdoors.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/safety-flag-6bc4a7dd36.jpg",
    tags: ["power-wheelchair", "visibility", "outdoors"],
    category: "safety",
    whatItIs:
      "A bright flag that mounts to the chair to increase visibility around traffic/pedestrians.",
    whatItDoes:
      "Makes you more visible in carparks, crossings, shared paths, and low-light environments.",
    whoItsFor:
      "Outdoor users, especially near driveways, roads, or busy shared footpaths/cycleways.",
    productUrl: "https://alliedmedical.co.nz/products/safety-flag",
  },
];

/* ───────────────────────── Power & Charging ───────────────────────── */

export const POWER_AND_CHARGING: PowerWheelchairProduct[] = [
  {
    id: "usb-adaptors-chargers",
    title: "USB Adaptors / Chargers (Powerchair)",
    description:
      "Charge devices directly from the wheelchair’s charging port.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/usbada.png",
    tags: ["power-wheelchair", "charging", "usb", "phone"],
    category: "power-charging",
    whatItIs:
      "USB charging adaptors designed to run off your chair’s power/charging interface.",
    whatItDoes:
      "Keeps phone/tablet powered for calls, navigation, AAC, and smart-home control throughout the day.",
    whoItsFor:
      "Anyone relying on a device for communication/control who can’t risk running out of battery.",
    productUrl: "https://medifab.com/product/usb-adaptors-chargers/",
  },
  {
    id: "q-logic-3e-hand-control",
    title: "Q-Logic 3e Hand Control (USB-C + XLR)",
    description:
      "Controller upgrade with built-in USB-C and charging port options.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/q-logic-3e-hand-control-643dd76cd9.jpg",
    tags: ["power-wheelchair", "controller", "usb-c", "charging"],
    category: "power-charging",
    whatItIs:
      "A powerchair hand control/display that includes modern charging ports and simplified access to functions.",
    whatItDoes:
      "Can make it easier to access seating functions and keep devices charged via the controller’s ports.",
    whoItsFor:
      "Users who want more accessible function control and integrated device charging.",
    productUrl: "https://alliedmedical.co.nz/products/q-logic-3e-hand-control",
  },
];

/* ───────────────────────── Smart Tech & Connectivity ───────────────────────── */

export const SMART_TECH_AND_CONNECTIVITY: PowerWheelchairProduct[] = [
  {
    id: "q-logic-3-bluetooth",
    title: "Q-Logic 3 Bluetooth",
    description:
      "Use your powerchair joystick to control Bluetooth-enabled devices.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/q-logic-3-bluetooth-76ad843be2.jpg",
    tags: ["power-wheelchair", "bluetooth", "phone", "tablet", "mouse"],
    category: "smart-tech",
    whatItIs:
      "Bluetooth capability within the Q-Logic 3 ecosystem to interact with phones/tablets/computers.",
    whatItDoes:
      "Enables joystick-based control of paired devices (useful when hand function is limited).",
    whoItsFor:
      "Users who want to control a phone/tablet/computer through chair controls rather than direct touch.",
    productUrl: "https://alliedmedical.co.nz/products/q-logic-3-bluetooth",
  },
  {
    id: "q-logic-3-drive-control-system",
    title: "Q-Logic 3 Drive Control System (incl. IR/ECU options)",
    description:
      "Expandable electronics platform that can integrate advanced inputs and environmental control.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/q-logic-3-drive-control-system-2dbd7de8e8.jpg",
    tags: ["power-wheelchair", "electronics", "ecu", "ir", "access"],
    category: "smart-tech",
    whatItIs:
      "An advanced drive control electronics system that supports custom inputs and add-on modules.",
    whatItDoes:
      "Provides a platform for higher-level customisation (e.g., linking access methods and environment control).",
    whoItsFor:
      "People with complex access needs (common in high-level SCI) or those adding environmental control.",
    productUrl:
      "https://alliedmedical.co.nz/products/q-logic-3-drive-control-system-electronics-etc",
  },
];

/* ───────────────────────── Alternative Drive Controls ───────────────────────── */

export const ALTERNATIVE_DRIVE_CONTROLS: PowerWheelchairProduct[] = [
  {
    id: "stealth-idrive-sip-puff-head-array",
    title: "Stealth i-Drive Sip & Puff + Proximity Head Array",
    description:
      "Hands-free drive control using sip & puff plus proximity head array sensors.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/stealth-idrive-sip-puff-head-array-dbd18d9a4e.png",
    tags: ["power-wheelchair", "sip-and-puff", "head-array", "hands-free"],
    category: "alternative-controls",
    whatItIs:
      "A combined system using breath input (sip/puff) and proximity head array sensors for chair control.",
    whatItDoes:
      "Enables independent driving and function access without hand control.",
    whoItsFor:
      "People with very limited/no hand function who need a reliable hands-free drive method.",
    productUrl:
      "https://alliedmedical.co.nz/products/stealth-i-drive-sip-puff-plus-proximity-head-array",
  },
  {
    id: "mo-vis-chin-control",
    title: "mo-vis Light-Touch Chin Control",
    description:
      "Chin-operated joystick solution for powerchair control.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/chincontrol.png",
    tags: ["power-wheelchair", "chin-control", "joystick"],
    category: "alternative-controls",
    whatItIs:
      "A chin-control joystick solution designed for users who can’t use a standard hand joystick.",
    whatItDoes:
      "Allows proportional driving and access to chair functions using chin movement.",
    whoItsFor:
      "Users with limited arm/hand function but reliable head/chin control.",
    productUrl:
      "https://www.cubro.co.nz/healthcare-products/powered-wheelchairs/alternative-controls/mo-vis-all-round-light-touch-chin-control",
  },
  {
    id: "stealth-mini-proportional-joystick",
    title: "Stealth Mini Proportional Joystick",
    description:
      "Low-force specialty joystick for chin/lip/fingertip driving setups.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/stealth-mini-proportional-joystick-34281fecd8.png",
    tags: ["power-wheelchair", "specialty-joystick", "low-force"],
    category: "alternative-controls",
    whatItIs:
      "A compact proportional joystick that requires low activation force for advanced access.",
    whatItDoes:
      "Enables driving for users who can’t manage standard joystick force/throw.",
    whoItsFor:
      "Chin, lip, or minimal-force fingertip driving configurations.",
    productUrl:
      "https://alliedmedical.co.nz/products/stealth-mini-proportional-joystick",
  },
  {
    id: "permobil-sip-puff-system",
    title: "Permobil Sip & Puff System",
    description:
      "Sip & puff drive control option for users with no upper-limb function.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/2_alt_sippuffsystem-min.webp",
    tags: ["power-wheelchair", "sip-and-puff", "hands-free"],
    category: "alternative-controls",
    whatItIs:
      "A sip-and-puff control system designed to operate power wheelchair functions with breath input.",
    whatItDoes:
      "Enables driving/function control through controlled inhaling/exhaling commands.",
    whoItsFor:
      "People with little/no upper extremity function who need a breath-based control method.",
    productUrl:
      "https://www.permobil.com/en-nz/produits/accessoires/commandes-de-conduite/permobil-systeme-sip-puff",
  },
];

/* ───────────────────────── export all ───────────────────────── */

export const POWER_WHEELCHAIR_PRODUCTS: PowerWheelchairProduct[] = [
  ...SEATING_AND_POSITIONING,
  ...MOUNTS_AND_CARRYING,
  ...SAFETY_AND_AWARENESS,
  ...POWER_AND_CHARGING,
  ...SMART_TECH_AND_CONNECTIVITY,
  ...ALTERNATIVE_DRIVE_CONTROLS,
];
