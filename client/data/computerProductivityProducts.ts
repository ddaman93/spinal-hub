/* ───────────────────────── types ───────────────────────── */

export type ComputerProductivityCategory =
  | "alternative-mice"
  | "voice-dictation"
  | "on-screen-keyboards"
  | "pointer-cursor-tools"
  | "remote-bridging";

export type AlternativeMiceSubcategory =
  | "ergonomic-mice"
  | "head-mounted-target-mice"
  | "joysticks"
  | "mouse-adapters"
  | "mouse-control-software"
  | "specialist-mice"
  | "trackballs";

export type ComputerProductivityProduct = {
  id: string;
  title: string;
  description: string;
  image: string; // URL string
  tags: string[];
  category: ComputerProductivityCategory;
  subcategory?: AlternativeMiceSubcategory;
  whatItIs: string;
  whatItDoes: string;
  whoItsFor: string;
  productUrl?: string;
  productUrlMac?: string;
  contentFit?: "cover" | "contain";
  imageBackground?: string;
};

/* ───────────────────────── categories ───────────────────────── */

export const COMPUTER_PRODUCTIVITY_CATEGORIES: {
  id: ComputerProductivityCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "alternative-mice",
    label: "Alternative Mice",
    description: "Ergonomic mice, trackballs, joysticks, head-mounted devices, and adaptive mouse solutions.",
  },
  {
    id: "on-screen-keyboards",
    label: "On-Screen Keyboards & Text Entry",
    description: "Virtual keyboards and text prediction tools for typing without a physical keyboard.",
  },
  {
    id: "voice-dictation",
    label: "Voice Control & Dictation",
    description: "Speech recognition and voice command software for hands-free computer use.",
  },
  {
    id: "pointer-cursor-tools",
    label: "Pointer & Cursor Tools",
    description: "Dwell click, cursor stabilization, and pointer assistance utilities.",
  },
  {
    id: "remote-bridging",
    label: "Remote Access & Device Bridging",
    description: "Control computers remotely or bridge devices for seamless access.",
  },
];

/* ───────────────────────── Alternative Mice ───────────────────────── */

export const ALTERNATIVE_MICE: ComputerProductivityProduct[] = [
  {
    id: "tobii-dynavox-pc-eye",
    title: "Tobii Dynavox PCEye & EyeMobile",
    description:
      "Eye tracking technology for computer control using only eye movements.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Mice/tobii-pc-eye.webp",
    contentFit: "cover",
    tags: ["eye-tracking", "alternative-mice", "computer-access"],
    category: "alternative-mice",
    subcategory: "specialist-mice",
    whatItIs:
      "A professional-grade eye tracking system that mounts to monitors or laptops to enable computer control via eye gaze.",
    whatItDoes:
      "Allows users to move the mouse cursor, click, type, and control Windows/macOS using only their eyes.",
    whoItsFor:
      "People with limited or no hand function who need reliable computer access (common with high-level SCI, ALS, or MS).",
    productUrl: "https://us.tobiidynavox.com/products/pceye",
  },
  {
    id: "quha-zono-x",
    title: "Quha Zono X",
    description:
      "Wireless gyroscopic mouse worn on the head for hands-free cursor control.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Mice/quha-zono-x.jpg",
    contentFit: "cover",
    tags: ["head-tracking", "wireless", "alternative-mice", "gyroscope"],
    category: "alternative-mice",
    subcategory: "head-mounted-target-mice",
    whatItIs:
      "A compact gyroscopic wireless mouse worn on the head, glasses, or headband that translates head movements into cursor control.",
    whatItDoes:
      "Moves the mouse cursor via subtle head tilts and rotations, with dwell-click or external switch support for clicking.",
    whoItsFor:
      "People with limited or no hand function who have reliable head movement — particularly suited for SCI, MS, and ALS users.",
    productUrl: "https://www.quha.com/products/quha-zono-x/",
  },
  {
    id: "glassouse-pro",
    title: "GlassOuse Pro Head Mouse",
    description:
      "Wearable head mouse with bite-click functionality for computer and mobile.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Mice/glassouse-head-mouse.jpg",
    contentFit: "cover",
    tags: ["head-tracking", "wearable", "alternative-mice", "bluetooth"],
    category: "alternative-mice",
    subcategory: "head-mounted-target-mice",
    whatItIs:
      "A Bluetooth head-worn device that tracks head movements and uses a bite sensor for clicking.",
    whatItDoes:
      "Connects wirelessly to computers, tablets, and phones to provide hands-free cursor control and clicking.",
    whoItsFor:
      "Users who want portable, wireless head-based mouse control across multiple devices.",
    productUrl: "https://glassouse.com/",
  },
];

/* ───────────────────────── On-Screen Keyboards ───────────────────────── */

export const ON_SCREEN_KEYBOARDS: ComputerProductivityProduct[] = [
  {
    id: "windows-osk",
    title: "Windows On-Screen Keyboard",
    description:
      "Built-in Windows virtual keyboard for mouse, touch, or switch access.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Microsoft_Windows-Logo.wine.png",
    imageBackground: "#FFFFFF",
    tags: ["on-screen-keyboard", "windows", "free", "built-in"],
    category: "on-screen-keyboards",
    whatItIs:
      "A free virtual keyboard built into every version of Windows. No download required.",
    whatItDoes:
      "How to open it:\n\n1. Press Windows key + Ctrl + O\n\nOR\n\n1. Open the Start Menu\n2. Search \"On-Screen Keyboard\"\n3. Click the result to launch it\n\nOR\n\n1. Go to Settings\n2. Accessibility → Keyboard\n3. Toggle On-Screen Keyboard on\n\nThe keyboard stays on screen and can be used with a mouse, head mouse, eye tracker, or switch.",
    whoItsFor:
      "Any Windows user who cannot use a physical keyboard — works with all pointing devices and switch access.",
    productUrl: "https://support.microsoft.com/en-us/windows/use-the-on-screen-keyboard-osk-to-type-dcd61b31-338a-3b82-0b62-3cc68edeefbc",
  },
  {
    id: "macos-accessibility-keyboard",
    title: "macOS Accessibility Keyboard",
    description:
      "Built-in macOS on-screen keyboard for full text entry and system control.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/macos-logo.png",
    tags: ["on-screen-keyboard", "macos", "free", "built-in"],
    category: "on-screen-keyboards",
    whatItIs:
      "A free virtual keyboard built into macOS. Supports panels, word prediction, and customisable layouts.",
    whatItDoes:
      "How to enable it:\n\n1. Open System Settings (or System Preferences on older Macs)\n2. Go to Accessibility\n3. Select Keyboard\n4. Turn on Accessibility Keyboard\n\nThe keyboard will appear on screen. You can resize it, customise panel layouts, and use it with any pointer device or switch.",
    whoItsFor:
      "Mac users who cannot use a physical keyboard — compatible with head mouse, eye tracking, and switch access.",
    productUrl: "https://support.apple.com/guide/mac-help/type-with-the-accessibility-keyboard-mh43176/mac",
  },
  {
    id: "optikey",
    title: "OptiKey",
    description:
      "Free open-source on-screen keyboard designed for eye tracking, head mouse, and switch access.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/optikey_logo-blue.svg",
    imageBackground: "#FFFFFF",
    tags: ["on-screen-keyboard", "windows", "free", "eye-tracking", "open-source"],
    category: "on-screen-keyboards",
    whatItIs:
      "A free, open-source on-screen keyboard for Windows built specifically for people with motor disabilities. Works well for typing code and long-form writing.",
    whatItDoes:
      "Provides full keyboard and mouse control via eye tracker, head mouse, or switch. Includes word prediction, multi-key shortcuts, and symbol/number layers — making it well-suited for programming and technical writing.",
    whoItsFor:
      "Windows users who need a more capable keyboard than the built-in OSK, particularly those using eye tracking or head tracking devices.",
    productUrl: "https://optikey.org/",
  },
];

/* ───────────────────────── Voice Control & Dictation ───────────────────────── */

export const VOICE_DICTATION: ComputerProductivityProduct[] = [
  {
    id: "dragon-professional",
    title: "Dragon Professional",
    description:
      "Industry-leading speech recognition software for dictation and voice commands.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/dragon-logo.png",
    imageBackground: "#FFFFFF",
    tags: ["voice-control", "dictation", "windows", "professional"],
    category: "voice-dictation",
    whatItIs:
      "Professional-grade speech recognition software that converts spoken words into text and computer commands.",
    whatItDoes:
      "Enables full computer control through voice—dictate documents, navigate software, and execute macros hands-free.",
    whoItsFor:
      "Users who need highly accurate voice typing and comprehensive hands-free computer control.",
    productUrl: "https://www.nuance.com/dragon.html",
  },
  {
    id: "windows-voice-access",
    title: "Windows Voice Access",
    description:
      "Built-in Windows voice control for hands-free navigation and dictation.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Microsoft_Windows-Logo.wine.png",
    imageBackground: "#FFFFFF",
    tags: ["voice-control", "dictation", "windows", "built-in", "free"],
    category: "voice-dictation",
    whatItIs:
      "A free accessibility feature built into Windows 11 that enables voice-based computer control.",
    whatItDoes:
      "Allows users to dictate text, open apps, click buttons, and navigate Windows using voice commands.",
    whoItsFor:
      "Windows 11 users who need basic voice control without installing third-party software.",
    productUrl: "https://support.microsoft.com/en-us/topic/get-started-with-voice-access-bd2aa2dc-46c2-486c-93ae-3d75f7d053a4",
  },
  {
    id: "macos-voice-control",
    title: "macOS Voice Control",
    description:
      "Built-in macOS voice navigation and dictation system.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/macos-logo.png",
    tags: ["voice-control", "dictation", "macos", "built-in", "free"],
    category: "voice-dictation",
    whatItIs:
      "Apple's built-in accessibility feature for controlling Mac computers entirely by voice.",
    whatItDoes:
      "Provides dictation, full navigation, and click-by-voice functionality across all macOS apps.",
    whoItsFor:
      "Mac users who want native, deeply integrated voice control without additional software.",
    productUrl: "https://support.apple.com/guide/mac-help/voice-control-mh40719/mac",
  },
  {
    id: "talon-voice",
    title: "Talon Voice",
    description:
      "Hands-free coding and computer control via voice and eye tracking.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    tags: ["voice-control", "coding", "eye-tracking", "advanced"],
    category: "voice-dictation",
    whatItIs:
      "An advanced voice control system designed specifically for programmers and power users.",
    whatItDoes:
      "Enables hands-free coding, terminal use, and precise computer control with optimized voice commands and eye tracking integration.",
    whoItsFor:
      "Developers, power users, or anyone needing highly customizable voice-based workflows.",
    productUrl: "https://talonvoice.com/",
  },
  {
    id: "otter-ai",
    title: "Otter.ai",
    description:
      "Real-time transcription and note-taking with speaker identification.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/otto-ai.jpg",
    tags: ["dictation", "transcription", "notes", "cloud"],
    category: "voice-dictation",
    whatItIs:
      "A cloud-based transcription service that captures and transcribes live conversations and meetings.",
    whatItDoes:
      "Converts speech to text in real time, identifies speakers, and creates searchable, shareable notes.",
    whoItsFor:
      "Users who need accurate transcription for meetings, lectures, or note-taking without typing.",
    productUrl: "https://otter.ai/",
  },
  {
    id: "lilyspeech",
    title: "LilySpeech",
    description:
      "Free Windows dictation app that lets you type with your voice anywhere.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/lilyspeecyhlogo.png",
    tags: ["voice-control", "dictation", "windows", "free"],
    category: "voice-dictation",
    whatItIs:
      "A free Windows speech-to-text app powered by Google's voice recognition engine. No setup fee, no word limits.",
    whatItDoes:
      "Press Ctrl+D to activate voice typing in any Windows application — emails, documents, web searches, and more. Claims 99.5% accuracy and can handle custom terminology.",
    whoItsFor:
      "Windows users who want a free, simple dictation tool without paying for Dragon or a subscription service.",
    productUrl: "https://lilyspeech.com/",
  },
];

/* ───────────────────────── Pointer & Cursor Tools ───────────────────────── */

export const POINTER_CURSOR_TOOLS: ComputerProductivityProduct[] = [
  {
    id: "dwell-clicker",
    title: "Dwell Clicker Utility",
    description:
      "Auto-click software that clicks when cursor pauses (dwell-to-click).",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
    contentFit: "cover",
    tags: ["dwell-click", "accessibility", "free", "windows"],
    category: "pointer-cursor-tools",
    whatItIs:
      "A free utility that automatically performs mouse clicks when the cursor hovers (dwells) over a target.",
    whatItDoes:
      "Eliminates the need for physical clicking—useful with head mice, eye tracking, or limited hand control.",
    whoItsFor:
      "Users who can move a cursor but struggle to click buttons or trackpads.",
    productUrl: "https://dwell-clicker.software.informer.com/",
  },
  {
    id: "mouse-keys-built-in",
    title: "Mouse Keys (Windows/macOS)",
    description:
      "Built-in feature to control mouse pointer using keyboard number pad.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    contentFit: "cover",
    tags: ["mouse-alternative", "built-in", "keyboard", "free"],
    category: "pointer-cursor-tools",
    whatItIs:
      "An accessibility feature built into Windows and macOS that moves the mouse cursor using the numeric keypad.",
    whatItDoes:
      "Provides precise cursor movement and clicking without needing a physical mouse or trackpad.\n\nWindows: Settings → Ease of Access → Mouse → Turn on Mouse Keys\n\nmacOS: System Settings → Accessibility → Pointer Control → Alternate Control Methods → Enable Mouse Keys",
    whoItsFor:
      "Users who can use a keyboard but struggle with mouse or trackpad control.",
    productUrl: "https://support.microsoft.com/en-us/windows/use-mouse-keys-to-move-the-mouse-pointer-9e0c72c8-b882-7918-8e7b-391fd62adf33",
    productUrlMac: "https://support.apple.com/guide/mac-help/control-the-pointer-using-mouse-keys-mh27469/mac",
  },
  {
    id: "steady-mouse",
    title: "SteadyMouse Cursor Stabilization",
    description:
      "Reduces hand tremor and smooths cursor movement for more accurate pointing.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/steadymouse-logo.png",
    imageBackground: "#FFFFFF",
    tags: ["cursor-stabilization", "tremor", "accessibility"],
    category: "pointer-cursor-tools",
    whatItIs:
      "Software that filters out tremor and shaky hand movements to stabilize the mouse cursor.",
    whatItDoes:
      "Smooths cursor motion, reduces accidental clicks, and improves targeting accuracy for users with tremors.",
    whoItsFor:
      "People with hand tremors, Parkinson's, MS, or other conditions affecting fine motor control.",
    productUrl: "https://www.steadymouse.com/",
  },
  {
    id: "macos-click-assist",
    title: "macOS Pointer Control (Click Assist)",
    description:
      "Built-in macOS feature to assist with clicking and dragging precision.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/macos-logo.png",
    tags: ["macos", "click-assist", "built-in", "free"],
    category: "pointer-cursor-tools",
    whatItIs:
      "macOS accessibility settings that make clicking, double-clicking, and dragging easier. Built into every Mac — no download required.",
    whatItDoes:
      "How to enable it:\n\n1. Open System Settings\n2. Go to Accessibility\n3. Select Pointer Control\n4. Under Mouse & Trackpad, enable the options you need:\n   • Ignore built-in trackpad when mouse is present\n   • Spring-loaded delay — prevents accidental drags by requiring a hold before dragging starts\n   • Double-click speed — slow it down to make double-clicking easier\n   • Click Lock — hold a click without holding the button\n\nFor dwell clicking (click automatically by hovering):\n1. In Pointer Control, select Alternate Control Methods\n2. Enable Dwell Control and adjust the delay to suit you",
    whoItsFor:
      "Mac users with limited dexterity who need help with precise clicking, dragging, or who want dwell-based clicking.",
    productUrl: "https://support.apple.com/guide/mac-help/change-pointer-control-preferences-mh27449/mac",
  },
  {
    id: "pointing-magnifier",
    title: "Pointing Magnifier / Target Assist",
    description:
      "Magnifies areas around the cursor to improve click accuracy on small targets.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/freedom-scientific-logo.svg",
    tags: ["magnifier", "accessibility", "precision"],
    category: "pointer-cursor-tools",
    whatItIs:
      "A screen magnification tool that zooms in around the mouse cursor to enlarge click targets.",
    whatItDoes:
      "Makes small buttons, links, and interface elements easier to see and click accurately.",
    whoItsFor:
      "Users with low vision, imprecise pointing control, or anyone struggling with small UI targets.",
    productUrl: "https://support.freedomscientific.com/Downloads/ZoomText",
  },
];

/* ───────────────────────── Remote Access & Device Bridging ───────────────────────── */

export const REMOTE_BRIDGING: ComputerProductivityProduct[] = [
  {
    id: "chrome-remote-desktop",
    title: "Chrome Remote Desktop",
    description:
      "Free remote access via Chrome browser to control computers remotely.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Google_Chrome_icon_and_wordmark_(2011).svg.png",
    tags: ["remote-access", "chrome", "free", "cross-platform"],
    category: "remote-bridging",
    whatItIs:
      "A free Google Chrome extension that provides secure remote access to your computers.",
    whatItDoes:
      "Lets you access your computer from any device with a Chrome browser—simple setup, no fees.",
    whoItsFor:
      "Users who want straightforward, free remote access without installing heavy software.",
    productUrl: "https://remotedesktop.google.com/",
  },
  {
    id: "teamviewer",
    title: "TeamViewer",
    description:
      "Remote desktop software for accessing computers from anywhere.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/logo-teamviewer-2.svg",
    imageBackground: "#FFFFFF",
    tags: ["remote-access", "remote-desktop", "cross-platform"],
    category: "remote-bridging",
    whatItIs:
      "A widely-used remote access tool that lets you control another computer over the internet.",
    whatItDoes:
      "Enables remote support, device control, and file transfer—useful for accessing a home PC from a mobile device.",
    whoItsFor:
      "Users who need to control a computer remotely or receive technical support from caregivers/IT staff.",
    productUrl: "https://www.teamviewer.com/",
  },
  {
    id: "microsoft-remote-desktop",
    title: "Microsoft Remote Desktop",
    description:
      "Built-in Windows remote desktop protocol (RDP) for PC access.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/microsoft-logo.jpg",
    contentFit: "cover",
    tags: ["remote-access", "windows", "rdp", "built-in"],
    category: "remote-bridging",
    whatItIs:
      "Microsoft's native remote desktop protocol for connecting to Windows PCs from other devices.",
    whatItDoes:
      "Provides high-quality remote access to Windows computers with full keyboard, mouse, and app support.",
    whoItsFor:
      "Windows users who need reliable, integrated remote access from tablets, phones, or other PCs.",
    productUrl: "https://support.microsoft.com/en-us/windows/how-to-use-remote-desktop-5fe128d5-8fb1-7a23-3b8a-41e636865e8c",
  },
  {
    id: "kensington-expert-mouse-trackball",
    title: "Kensington Expert Mouse Wired Trackball",
    description:
      "Large-ball wired trackball with scroll ring and four programmable buttons for precise, low-effort cursor control.",
    image:
      "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/Computer-Access/Mice/Kensington%20mouse.jpg",
    contentFit: "contain",
    tags: ["trackball", "wired", "alternative-mice", "ergonomic"],
    category: "alternative-mice",
    subcategory: "trackballs",
    whatItIs:
      "A large-format wired trackball with a 55 mm ball, surrounding scroll ring, and four programmable buttons. Compatible with Windows and macOS.",
    whatItDoes:
      "Moves the cursor by rolling the ball rather than moving the whole device, eliminating wrist and arm movement. The scroll ring allows smooth page scrolling without shifting grip, and buttons can be programmed for common actions.",
    whoItsFor:
      "People with limited wrist or arm mobility, repetitive strain injuries, or anyone who benefits from keeping their hand stationary while controlling the cursor. Widely used in assistive technology setups.",
    productUrl: "https://www.kensington.com/en-nz/p/products/control/trackballs/expert-mouse-wired-trackball/",
  },
];

/* ───────────────────────── export all ───────────────────────── */

export const COMPUTER_PRODUCTIVITY_PRODUCTS: ComputerProductivityProduct[] = [
  ...ALTERNATIVE_MICE,
  ...ON_SCREEN_KEYBOARDS,
  ...VOICE_DICTATION,
  ...POINTER_CURSOR_TOOLS,
  ...REMOTE_BRIDGING,
];
