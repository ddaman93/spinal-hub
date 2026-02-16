/* ───────────────────────── types ───────────────────────── */

export type ComputerProductivityCategory =
  | "alternative-input"
  | "voice-dictation"
  | "on-screen-keyboards"
  | "pointer-cursor-tools"
  | "remote-bridging";

export type ComputerProductivityProduct = {
  id: string;
  title: string;
  description: string;
  image: string; // URL string
  tags: string[];
  category: ComputerProductivityCategory;
  whatItIs: string;
  whatItDoes: string;
  whoItsFor: string;
  productUrl?: string;
};

/* ───────────────────────── categories ───────────────────────── */

export const COMPUTER_PRODUCTIVITY_CATEGORIES: {
  id: ComputerProductivityCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "alternative-input",
    label: "Alternative Input Devices",
    description: "Eye tracking, head mice, sip-and-puff, and switch interfaces for computer control.",
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

/* ───────────────────────── Alternative Input Devices ───────────────────────── */

export const ALTERNATIVE_INPUT: ComputerProductivityProduct[] = [
  {
    id: "tobii-dynavox-pc-eye",
    title: "Tobii Dynavox PCEye & EyeMobile",
    description:
      "Eye tracking technology for computer control using only eye movements.",
    image:
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400",
    tags: ["eye-tracking", "alternative-input", "computer-access"],
    category: "alternative-input",
    whatItIs:
      "A professional-grade eye tracking system that mounts to monitors or laptops to enable computer control via eye gaze.",
    whatItDoes:
      "Allows users to move the mouse cursor, click, type, and control Windows/macOS using only their eyes.",
    whoItsFor:
      "People with limited or no hand function who need reliable computer access (common with high-level SCI, ALS, or MS).",
    productUrl: "https://us.tobiidynavox.com/products/pceye",
  },
  {
    id: "smartnav-head-mouse",
    title: "SmartNav Head Mouse",
    description:
      "Head-tracking mouse alternative for hands-free computer control.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    tags: ["head-tracking", "alternative-input", "mouse"],
    category: "alternative-input",
    whatItIs:
      "A head-tracking device that uses a reflective dot on glasses/headset to translate head movements into cursor control.",
    whatItDoes:
      "Moves the mouse cursor precisely in response to small head movements, with dwell-clicking or switch options.",
    whoItsFor:
      "Users with reliable head control but limited hand function who need precise mouse navigation.",
    productUrl: "https://www.naturalpoint.com/smartnav/",
  },
  {
    id: "glassouse-pro",
    title: "GlassOuse Pro Head Mouse",
    description:
      "Wearable head mouse with bite-click functionality for computer and mobile.",
    image:
      "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400",
    tags: ["head-tracking", "wearable", "alternative-input", "bluetooth"],
    category: "alternative-input",
    whatItIs:
      "A Bluetooth head-worn device that tracks head movements and uses a bite sensor for clicking.",
    whatItDoes:
      "Connects wirelessly to computers, tablets, and phones to provide hands-free cursor control and clicking.",
    whoItsFor:
      "Users who want portable, wireless head-based mouse control across multiple devices.",
    productUrl: "https://glassouse.com/",
  },
  {
    id: "pretorian-sip-puff-mouse",
    title: "Pretorian Sip & Puff Mouse Interface",
    description:
      "Breath-controlled mouse interface for hands-free computer access.",
    image:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
    tags: ["sip-and-puff", "alternative-input", "breath-control"],
    category: "alternative-input",
    whatItIs:
      "A sip-and-puff device that translates breath input into mouse movements and clicks.",
    whatItDoes:
      "Enables full computer control through controlled inhaling and exhaling patterns, replacing mouse and keyboard functions.",
    whoItsFor:
      "People with very limited movement who can control breathing but not hands or head reliably.",
    productUrl: "https://www.pretorianuk.com/",
  },
  {
    id: "ablenet-hitch-blue2",
    title: "AbleNet Hitch & Blue2 Switch Interface",
    description:
      "Bluetooth switch adapters to use accessibility switches with computers and tablets.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tags: ["switch-access", "bluetooth", "alternative-input"],
    category: "alternative-input",
    whatItIs:
      "Wireless adapters that connect accessibility switches to computers, tablets, and phones via Bluetooth.",
    whatItDoes:
      "Allows users to control devices using external switches (buttons, pads, or other adaptive switches).",
    whoItsFor:
      "Users who rely on switch scanning or single-switch access for device control.",
    productUrl: "https://www.ablenetinc.com/blue2-bluetooth-switch/",
  },
];

/* ───────────────────────── On-Screen Keyboards ───────────────────────── */

export const ON_SCREEN_KEYBOARDS: ComputerProductivityProduct[] = [
  {
    id: "click-n-type",
    title: "Click-N-Type",
    description:
      "Free on-screen keyboard for Windows with word prediction and scanning.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    tags: ["on-screen-keyboard", "windows", "free", "word-prediction"],
    category: "on-screen-keyboards",
    whatItIs:
      "A free virtual keyboard for Windows designed for mouse, touch, or switch access.",
    whatItDoes:
      "Provides typing functionality with word prediction, phrase macros, and multiple scanning modes for switch users.",
    whoItsFor:
      "Windows users who can't use a physical keyboard and need accessible text entry options.",
    productUrl: "https://www.softpedia.com/get/Desktop-Enhancements/Other-Desktop-Enhancements/Click-N-Type.shtml",
  },
  {
    id: "optikey",
    title: "OptiKey",
    description:
      "Free eye-controlled on-screen keyboard for Windows with full mouse emulation.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
    tags: ["on-screen-keyboard", "eye-tracking", "windows", "free", "open-source"],
    category: "on-screen-keyboards",
    whatItIs:
      "An open-source assistive on-screen keyboard designed for eye gaze and other pointing devices.",
    whatItDoes:
      "Enables typing, mouse control, and even speech output entirely through gaze or dwell-clicking.",
    whoItsFor:
      "Eye tracking users or anyone using alternative pointing methods who need comprehensive keyboard and mouse replacement.",
    productUrl: "https://github.com/OptiKey/OptiKey",
  },
  {
    id: "dasher",
    title: "Dasher",
    description:
      "Predictive text entry interface using continuous pointing gestures.",
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
    tags: ["on-screen-keyboard", "predictive-text", "cross-platform", "free"],
    category: "on-screen-keyboards",
    whatItIs:
      "A unique text entry system that uses continuous gestures to 'zoom' through predicted letters and words.",
    whatItDoes:
      "Allows fast typing with minimal precision—ideal for head mice, eye tracking, or joystick input.",
    whoItsFor:
      "Users with imprecise pointing control who want faster text entry than traditional on-screen keyboards.",
    productUrl: "https://github.com/ipomoena/dasher",
  },
  {
    id: "keystrokes-mac",
    title: "Keystrokes (macOS)",
    description:
      "On-screen keyboard for macOS with customizable layouts and scanning support.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    tags: ["on-screen-keyboard", "macos", "customizable"],
    category: "on-screen-keyboards",
    whatItIs:
      "A professional on-screen keyboard application designed specifically for macOS users.",
    whatItDoes:
      "Provides flexible keyboard layouts, word prediction, macro support, and switch scanning modes.",
    whoItsFor:
      "Mac users who need an accessible alternative to the physical keyboard with advanced customization.",
    productUrl: "https://www.assistiveware.com/legacy-apps",
  },
  {
    id: "phrase-express",
    title: "PhraseExpress",
    description:
      "Text expander and phrase library tool to reduce typing effort.",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
    tags: ["text-expansion", "productivity", "windows", "macos"],
    category: "on-screen-keyboards",
    whatItIs:
      "A text expansion and auto-completion tool that stores frequently used phrases and templates.",
    whatItDoes:
      "Reduces typing burden by auto-completing long phrases, emails, or form fields from short abbreviations.",
    whoItsFor:
      "Users with fatigue or limited typing endurance who want to minimize keystrokes.",
    productUrl: "https://www.phraseexpress.com/",
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
      "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400",
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
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400",
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
      "https://images.unsplash.com/photo-1611532736570-e8e5e45e4c5f?w=400",
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
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400",
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
    tags: ["mouse-alternative", "built-in", "keyboard", "free"],
    category: "pointer-cursor-tools",
    whatItIs:
      "An accessibility feature built into Windows and macOS that moves the mouse cursor using the numeric keypad.",
    whatItDoes:
      "Provides precise cursor movement and clicking without needing a physical mouse or trackpad.",
    whoItsFor:
      "Users who can use a keyboard but struggle with mouse or trackpad control.",
    productUrl: "https://support.microsoft.com/en-us/windows/use-mouse-keys-to-move-the-mouse-pointer-9e0c72c8-b882-7918-8e7b-391fd62adf33",
  },
  {
    id: "steady-mouse",
    title: "SteadyMouse Cursor Stabilization",
    description:
      "Reduces hand tremor and smooths cursor movement for more accurate pointing.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
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
      "https://images.unsplash.com/photo-1611532736570-e8e5e45e4c5f?w=400",
    tags: ["macos", "click-assist", "built-in", "free"],
    category: "pointer-cursor-tools",
    whatItIs:
      "macOS accessibility settings that make clicking, double-clicking, and dragging easier.",
    whatItDoes:
      "Provides spring-loaded delays, drag lock, and other click assistance to reduce accidental actions.",
    whoItsFor:
      "Mac users with limited dexterity who need help with precise clicking and dragging.",
    productUrl: "https://support.apple.com/guide/mac-help/change-pointer-control-preferences-mh27449/mac",
  },
  {
    id: "pointing-magnifier",
    title: "Pointing Magnifier / Target Assist",
    description:
      "Magnifies areas around the cursor to improve click accuracy on small targets.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
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
    id: "teamviewer",
    title: "TeamViewer",
    description:
      "Remote desktop software for accessing computers from anywhere.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400",
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
    id: "chrome-remote-desktop",
    title: "Chrome Remote Desktop",
    description:
      "Free remote access via Chrome browser to control computers remotely.",
    image:
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400",
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
    id: "microsoft-remote-desktop",
    title: "Microsoft Remote Desktop",
    description:
      "Built-in Windows remote desktop protocol (RDP) for PC access.",
    image:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400",
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
    id: "barrier",
    title: "Barrier",
    description:
      "Open-source software KVM to share one keyboard and mouse across multiple computers.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    tags: ["kvm", "keyboard-sharing", "open-source", "free"],
    category: "remote-bridging",
    whatItIs:
      "A software KVM (keyboard-video-mouse) switch that lets one keyboard/mouse control multiple networked computers.",
    whatItDoes:
      "Seamlessly move your cursor between computers on the same desk—no hardware switch needed.",
    whoItsFor:
      "Users with multiple computers who want to use a single adaptive keyboard/mouse setup across all devices.",
    productUrl: "https://github.com/debauchee/barrier",
  },
  {
    id: "apple-universal-control",
    title: "Apple Universal Control",
    description:
      "Built-in macOS/iPadOS feature to use one keyboard/mouse across Apple devices.",
    image:
      "https://images.unsplash.com/photo-1611532736570-e8e5e45e4c5f?w=400",
    tags: ["macos", "ipad", "device-bridging", "built-in", "free"],
    category: "remote-bridging",
    whatItIs:
      "Apple's native feature for seamlessly controlling Mac and iPad with a single keyboard and mouse.",
    whatItDoes:
      "Move the cursor across devices, drag and drop files, and use one input setup for your entire Apple ecosystem.",
    whoItsFor:
      "Apple users who want effortless control across Mac/iPad without switching keyboards or mice.",
    productUrl: "https://support.apple.com/guide/mac-help/use-universal-control-mchl8be95421/mac",
  },
];

/* ───────────────────────── export all ───────────────────────── */

export const COMPUTER_PRODUCTIVITY_PRODUCTS: ComputerProductivityProduct[] = [
  ...ALTERNATIVE_INPUT,
  ...ON_SCREEN_KEYBOARDS,
  ...VOICE_DICTATION,
  ...POINTER_CURSOR_TOOLS,
  ...REMOTE_BRIDGING,
];
