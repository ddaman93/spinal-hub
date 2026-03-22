/* ───────────────────────── types ───────────────────────── */

export type MountingBrand = {
  id: string;
  title: string;
  description: string;
  image: string;
  externalUrl: string;
  contentFit?: "cover" | "contain";
};

export type PhoneTabletAccessSubsection =
  | "built-in-ios-android"
  | "switch-access"
  | "wheelchair-control"
  | "mounting"
  | "stylus";

export type PhoneTabletAccessProduct = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  subsection: PhoneTabletAccessSubsection;
  productUrl: string;
  imageBackground?: string;

  whatItIs: string;
  whatItDoes: string;
  whoItsFor: string;
};

/* ───────────────────────── constants ───────────────────────── */

const PLACEHOLDER =
  "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/placeholders/placeholder.webp";

/* ───────────────────────── products ───────────────────────── */

export const PHONE_TABLET_ACCESS_PRODUCTS: PhoneTabletAccessProduct[] = [
  // Built-in iOS & Android
  {
    id: "ios-voice-control",
    title: "iOS Voice Control (Built-in)",
    description:
      "Hands-free control of iPhone/iPad using voice: open apps, tap, swipe, scroll, and dictate.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/apple-logo.webp",
    imageBackground: "#FFFFFF",
    tags: ["ios", "hands-free", "voice-control", "accessibility"],
    subsection: "built-in-ios-android",
    productUrl: "https://support.apple.com/en-us/111778",
    whatItIs:
      "Apple's built-in accessibility feature that lets you control your device with voice commands.",
    whatItDoes:
      "Enables full navigation and interaction without touch—tapping buttons, scrolling, launching apps, dictation, and using overlays like numbers/names/grid for precision.",
    whoItsFor:
      "Anyone who needs low-effort, hands-free phone/tablet control—especially people with limited hand function or fatigue.",
  },
  {
    id: "android-voice-access",
    title: "Android Voice Access",
    description:
      "Hands-free voice control for Android: tap, scroll, open apps, and dictate without touching the screen.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/Android_logo_2023.svg.png",
    imageBackground: "#FFFFFF",
    tags: ["android", "hands-free", "voice-access", "accessibility"],
    subsection: "built-in-ios-android",
    productUrl:
      "https://support.google.com/accessibility/android/answer/6151848?hl=en",
    whatItIs:
      "Google's built-in accessibility app for Android that lets you control your phone or tablet entirely by voice.",
    whatItDoes:
      "Overlays numbered labels, grid, or named targets on the screen so you can say commands like \"tap 3\", \"scroll down\", \"open Settings\", or dictate text—no touch required.",
    whoItsFor:
      "Android users with limited hand function or fatigue who need hands-free access to their device.",
  },

  // Switch Access
  {
    id: "ios-switch-control-setup",
    title: "iOS Switch Control (Built-in)",
    description:
      "Scan and select items using one or more switches (Bluetooth switches, head switches, etc.).",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/apple-logo.webp",
    imageBackground: "#FFFFFF",
    tags: ["ios", "switch-access", "scanning", "accessibility"],
    subsection: "switch-access",
    productUrl: "https://support.apple.com/en-nz/guide/iphone/iph400b2f114/ios",
    whatItIs:
      "Apple's built-in switch scanning system for iPhone/iPad (Accessibility > Switch Control).",
    whatItDoes:
      "Lets you navigate UI elements by scanning and activate selections using a switch (or multiple switches). Supports different scanning styles and custom actions.",
    whoItsFor:
      "People who can reliably activate a switch (any body part), but can't use touch reliably or at all.",
  },
  {
    id: "ios-switch-control-usage",
    title: "iOS Switch Control (How it works)",
    description:
      "Apple's guide to selecting items, performing actions, and controlling your device with Switch Control.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/apple-logo.webp",
    imageBackground: "#FFFFFF",
    tags: ["ios", "switch-access", "guide"],
    subsection: "switch-access",
    productUrl: "https://support.apple.com/en-nz/guide/iphone/iph8de250c54/ios",
    whatItIs: "Apple's official reference guide for everyday Switch Control use.",
    whatItDoes:
      "Explains common workflows: scanning, selecting, performing gestures, and configuring actions for real-world use.",
    whoItsFor:
      "Users and carers setting up Switch Control for the first time or optimizing an existing setup.",
  },
  {
    id: "android-switch-access",
    title: "Android Switch Access",
    description:
      "Control Android using one or more switches (scanning + select) instead of touch.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/Android_logo_2023.svg.png",
    imageBackground: "#FFFFFF",
    tags: ["android", "switch-access", "scanning", "accessibility"],
    subsection: "switch-access",
    productUrl: "https://support.google.com/accessibility/android/answer/6122836?hl=en",
    whatItIs:
      "Android's built-in accessibility feature for controlling your device with one or more external switches instead of touch.",
    whatItDoes:
      "Scans through on-screen elements automatically and lets you select them with a switch tap. Supports auto-scanning, manual scanning, and custom switch actions.",
    whoItsFor:
      "People who can reliably activate a switch (any body part) but can't use touch reliably or at all on an Android device.",
  },
  {
    id: "ablenet-blue2ft-assistive",
    title: "AbleNet Blue2 FT — Assistive Tech NZ",
    description:
      "Bluetooth switch interface for iPhone/iPad Switch Control; light-touch switch ports.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/blue2-ft.jpg",
    tags: ["switch", "bluetooth", "ios", "nz-available"],
    subsection: "switch-access",
    productUrl: "https://assistive.co.nz/product/blue2-ft-bluetooth-switch/",
    whatItIs:
      "A Bluetooth switch interface that connects to iOS as a switch input device.",
    whatItDoes:
      "Pairs to iPhone/iPad and lets you use one or two switches to control Switch Control scanning and selection.",
    whoItsFor:
      "People using iOS Switch Control who need a reliable Bluetooth switch interface and very light activation options.",
  },

  // Wheelchair / joystick control
  {
    id: "pretorian-jpad-joystick-ipad",
    title: "Pretorian J-Pad Joystick for iPad — Assistive Tech NZ",
    description:
      "Joystick interface designed for iPad/iOS Switch Control (often easier than scanning).",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/input-devices/j-pad-1.jpg",
    imageBackground: "#FFFFFF",
    tags: ["joystick", "ios", "switch-control", "nz-available"],
    subsection: "wheelchair-control",
    productUrl: "https://assistive.co.nz/product/jpad-joystick-for-ipad/",
    whatItIs:
      "A joystick accessory built to give iPad users joystick-style navigation through iOS access methods.",
    whatItDoes:
      "Provides directional control for on-screen navigation and selection workflows, reducing reliance on single-switch scanning for many tasks.",
    whoItsFor:
      "People who can use a joystick (hand, chin, mouth, or mountable setups) and want faster navigation than scan-only switch control.",
  },
  {
    id: "mo-vis-controls-medifab",
    title: "Mo-Vis Electric Wheelchair Controls — Medifab NZ",
    description:
      "Wheelchair control ecosystem (joysticks/switch inputs) that can support device access workflows.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/input-devices/mo-vis.png",
    imageBackground: "#FFFFFF",
    tags: ["wheelchair", "controls", "nz-available"],
    subsection: "wheelchair-control",
    productUrl: "https://medifab.com/nz/product/mo-vis-electric-wheelchair-controls/",
    whatItIs:
      "A family of wheelchair control solutions and alternative input options used in complex seating/mobility setups.",
    whatItDoes:
      "Enables tailored control methods (joystick variants / alternative controls) that can be part of a broader access strategy for interacting with tech.",
    whoItsFor:
      "Users with complex needs already working with a seating/mobility team—particularly those exploring alternative control methods.",
  },
  {
    id: "tecla-e",
    title: "Tecla-e (Device Access Hub)",
    description:
      "Premium hub that can connect switches/joysticks to phones/tablets for broader hands-free control.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/input-devices/tecla-logo.avif",
    imageBackground: "#FFFFFF",
    tags: ["switch", "joystick", "device-access", "premium"],
    subsection: "wheelchair-control",
    productUrl: "https://gettecla.com/pages/tecla-e",
    whatItIs:
      "A dedicated assistive access hub that bridges alternative inputs (switches/joysticks) to smartphones and tablets.",
    whatItDoes:
      "Expands options for controlling iOS/Android devices using accessible inputs when built-in methods aren't enough on their own.",
    whoItsFor:
      "People who need a robust access setup beyond Voice Control, especially when combining multiple inputs or using wheelchair-mounted controls.",
  },

  // Stylus
  {
    id: "apple-pencil-nz",
    title: "Apple Pencil — Apple NZ",
    description:
      "High-precision stylus for iPad: drawing, notes, precise tapping/dragging.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/apple%20pencil.jpg",
    tags: ["stylus", "ipad", "apple"],
    subsection: "stylus",
    productUrl: "https://www.apple.com/nz/apple-pencil/",
    whatItIs: "Apple's first-party stylus line for iPad.",
    whatItDoes:
      "Enables more accurate touch interactions than fingers—useful for small UI targets, writing, and creative tasks.",
    whoItsFor:
      "People who can manage a stylus grip or mount/strap but struggle with precise finger taps.",
  },
  {
    id: "logitech-crayon-usbc-pbtech",
    title: "Logitech Crayon (USB-C) — PB Tech NZ",
    description:
      "Popular Apple Pencil alternative; mainstream NZ availability and durable build.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/logitech%20crayon.jpg",
    imageBackground: "#FFFFFF",
    tags: ["stylus", "ipad", "nz-available"],
    subsection: "stylus",
    productUrl:
      "https://www.pbtech.co.nz/product/TAALOG5665255/Logitech-Crayon-Digital-Pencil-For-iPad-with-USB-C",
    whatItIs:
      "A third-party iPad stylus designed as a practical alternative to Apple Pencil.",
    whatItDoes:
      "Gives more control than finger touch for taps/dragging and handwriting workflows.",
    whoItsFor:
      "People wanting a robust, readily purchasable stylus option in NZ for iPad access and productivity.",
  },
  {
    id: "logitech-crayon-2-jbhifi",
    title: "Logitech Crayon 2 — JB Hi-Fi NZ",
    description:
      "Another NZ retailer option for Logitech Crayon (helpful for stock/price).",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/logitech%20crayon.jpg",
    imageBackground: "#FFFFFF",
    tags: ["stylus", "ipad", "nz-available"],
    subsection: "stylus",
    productUrl: "https://www.jbhifi.co.nz/products/logitech-crayon-2-for-ipad-silver",
    whatItIs: "A retail listing for Logitech Crayon 2 via JB Hi-Fi NZ.",
    whatItDoes:
      "Provides an alternative purchase route; same core benefit—more precise iPad interaction than finger touch.",
    whoItsFor:
      "Users comparing NZ suppliers or looking for local availability/returns support.",
  },
];

/* ───────────────────────── mounting brands ───────────────────────── */

export const MOUNTING_BRANDS: MountingBrand[] = [
  {
    id: "ram-phone-mounts",
    title: "RAM Phone Mounts",
    description: "Modular RAM phone mounting systems — Mounts NZ",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/mounts/ram%20logo.png",
    contentFit: "contain",
    externalUrl: "https://www.mounts.net.nz/collections/ram-phone-mounts",
  },
  {
    id: "ram-tablet-mounts",
    title: "RAM Tablet Mounts",
    description: "Adjustable RAM tablet mounting systems for wheelchairs — Mounts NZ",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/mounts/ram%20logo.png",
    contentFit: "contain",
    externalUrl: "https://www.mounts.net.nz/collections/ram-tablet-mounts",
  },
  {
    id: "quad-lock-mounts",
    title: "Quad Lock Mounts",
    description: "Premium lockable phone & tablet mounts for active use — Evo Cycles NZ",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/phone-access/mounts/quad-lock-logo.png",
    externalUrl:
      "https://www.evocycles.co.nz/quad+lock?srsltid=AfmBOopplzCUL1AKCKEBvOsgpTcW_TF1B559mH1_JWKFLTrH4EiQVi3-",
  },
];
