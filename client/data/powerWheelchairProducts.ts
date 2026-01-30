export type PowerWheelchairProduct = {
  id: string;
  title: string;
  description: string;
  image: any; // local require() or URL string
  tags: string[];
  category:
    | "power-mobility"
    | "seating"
    | "controls"
    | "environmental";
  whatItIs?: string;
  whatItDoes?: string;
  whoItsFor?: string;
  productUrl?: string;
};

/* ───────────────────────── Power & Mobility Accessories ───────────────────────── */

export const POWER_WHEELCHAIR_ACCESSORIES: PowerWheelchairProduct[] = [
  {
    id: "permobil-power-assist",
    title: "Permobil Power Module",
    description:
      "Integrated drive system with enhanced motors for outdoor terrain and inclines.",
    image:
      "https://www.permobil.com/globalassets/media/images/products/power-wheelchairs.jpg",
    tags: ["power-wheelchair", "mobility", "outdoor"],
    category: "power-mobility",
    whatItIs:
      "The Permobil Power Module is an advanced drive system that integrates with compatible power wheelchairs. It features high-torque motors, intelligent suspension, and optimised battery management designed to handle demanding terrain and extended use.",
    whatItDoes:
      "This system significantly improves outdoor performance by providing extra torque for hills, grass, gravel, and uneven surfaces. The intelligent power distribution extends battery life while the suspension system absorbs bumps and vibrations, reducing fatigue during longer journeys.",
    whoItsFor:
      "Ideal for power wheelchair users who frequently travel outdoors, need to navigate inclines, or want improved performance on varied terrain. Particularly beneficial for those who feel limited by standard wheelchair motors in challenging environments.",
    productUrl: "https://www.permobil.com/en-us/products/power-wheelchairs",
  },
  {
    id: "tilt-recline",
    title: "Tilt & Recline System",
    description:
      "Motorised positioning system to manage pressure, posture, and fatigue throughout the day.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    tags: ["power-wheelchair", "seating", "pressure-relief"],
    category: "power-mobility",
    whatItIs:
      "A tilt and recline system is a motorised seating mechanism integrated into power wheelchairs that allows the entire seat to tilt backwards (maintaining hip angle) or recline (opening the seat-to-back angle). Most systems offer both functions independently.",
    whatItDoes:
      "Tilting redistributes pressure from your seat bones across a larger body surface area, reducing pressure injury risk. Reclining opens the hip angle to relieve muscle tension and fatigue. Together they allow you to change position throughout the day, manage spasticity, improve circulation, and rest without transferring out of your chair.",
    whoItsFor:
      "Essential for users who sit for extended periods, have limited ability to shift weight independently, are at risk of pressure injuries, or experience fatigue and discomfort from prolonged sitting. Also valuable for those with spasticity or orthostatic hypotension.",
    productUrl: "https://www.quantumrehab.com/power-positioning.asp",
  },
  {
    id: "elevation-seat",
    title: "Seat Elevation System",
    description:
      "Raises seating position up to 14 inches for improved reach and social interaction.",
    image:
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400",
    tags: ["power-wheelchair", "independence", "accessibility"],
    category: "power-mobility",
    whatItIs:
      "Seat elevation is a powered function that raises the entire seat and user vertically by 10-14 inches (25-35cm) while maintaining the chair's mobility. The system uses a scissor lift or linear actuator mechanism beneath the seat.",
    whatItDoes:
      "Elevation allows you to reach higher surfaces like kitchen counters, store shelves, and tables. It brings you to standing eye level with others, improving social interaction and reducing neck strain in conversations. Many systems allow driving while elevated, providing better visibility in crowds or traffic.",
    whoItsFor:
      "Beneficial for any power wheelchair user who wants greater independence in daily tasks, improved reach in the kitchen or workplace, better social interaction at eye level, or enhanced visibility in public spaces. Particularly valuable for those living independently.",
    productUrl: "https://www.permobil.com/en-us/products/power-wheelchairs/standing-and-elevating",
  },
  {
    id: "standing-system",
    title: "Standing Wheelchair System",
    description:
      "Power function that transitions from sitting to a fully supported standing position.",
    image:
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400",
    tags: ["power-wheelchair", "standing", "health"],
    category: "power-mobility",
    whatItIs:
      "A standing wheelchair features an integrated mechanism that raises the user from a seated position to a fully supported standing position. The system includes knee blocks, chest supports, and footplates that work together to provide safe standing.",
    whatItDoes:
      "Standing regularly provides numerous health benefits: improved bone density, better circulation, reduced spasticity, improved bowel and bladder function, and reduced risk of pressure injuries. It also offers functional benefits like reaching high places, face-to-face interaction, and performing tasks that require standing.",
    whoItsFor:
      "Designed for users who can safely tolerate supported standing and want the health and functional benefits of regular weight-bearing. Requires medical evaluation to ensure cardiovascular stability and bone health can support standing. Particularly beneficial for those with spinal cord injury who benefit from weight-bearing exercise.",
    productUrl: "https://www.permobil.com/en-us/products/power-wheelchairs/standing",
  },
];

/* ───────────────────────── Seating & Positioning ───────────────────────── */

export const SEATING_AND_POSITIONING: PowerWheelchairProduct[] = [
  {
    id: "roho-air-cushion",
    title: "ROHO Air Cushion",
    description:
      "Air-cell cushion that distributes pressure evenly to prevent pressure injuries.",
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400",
    tags: ["power-wheelchair", "cushion", "pressure-relief"],
    category: "seating",
    whatItIs:
      "The ROHO cushion is an air-filled seating surface made up of interconnected rubber cells arranged in rows. When you sit on it, air flows between cells to conform to your body shape, creating a custom-contoured support surface.",
    whatItDoes:
      "The interconnected air cells automatically adjust to distribute your weight evenly across the entire seating surface. This eliminates high-pressure points under bony prominences (like sit bones), significantly reducing the risk of pressure injuries. The cushion also provides stability and can be adjusted by adding or removing air.",
    whoItsFor:
      "Essential for users at moderate to high risk of pressure injuries, those who sit for extended periods, and anyone with reduced sensation who cannot feel early warning signs of pressure damage. Also beneficial for users who need customisable support that adapts to position changes.",
    productUrl: "https://www.permobil.com/en-us/products/seating-and-positioning/roho",
  },
  {
    id: "jay-backrest",
    title: "JAY Back Support",
    description:
      "Modular back support system with customisable contours for optimal posture.",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    tags: ["power-wheelchair", "backrest", "posture"],
    category: "seating",
    whatItIs:
      "JAY back supports are professional-grade wheelchair backrests featuring aluminium frames with customisable foam or fluid padding. They come in various depths and contours, with options for lateral supports, lumbar adjustment, and specialised configurations.",
    whatItDoes:
      "These backs provide significantly better support than standard sling upholstery. The contoured shape supports your spine's natural curves, reducing fatigue and preventing slouching. Adjustable components allow therapists to fine-tune the fit for your specific posture needs, improving comfort and function throughout the day.",
    whoItsFor:
      "Recommended for any power wheelchair user who spends significant time in their chair. Particularly valuable for those with postural issues, back pain, scoliosis, or limited trunk control. Users who have outgrown basic sling backs or need more support will benefit greatly.",
    productUrl: "https://www.sunrisemedical.com/seating-positioning/jay/wheelchair-backs",
  },
  {
    id: "lateral-supports",
    title: "Lateral Trunk Supports",
    description:
      "Adjustable side supports that improve trunk stability and reduce fatigue.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
    tags: ["power-wheelchair", "positioning", "trunk-support"],
    category: "seating",
    whatItIs:
      "Lateral trunk supports are padded supports that mount to the sides of a wheelchair backrest. They come in various shapes and sizes, from simple flat pads to contoured thoracic supports, and can be positioned at different heights and angles.",
    whatItDoes:
      "These supports prevent sideways leaning and provide stability for users with reduced core strength. They keep your trunk aligned, reducing fatigue from constantly correcting posture. For users with scoliosis or asymmetrical tone, they can help maintain a more centred position and improve breathing and upper limb function.",
    whoItsFor:
      "Essential for users with limited trunk control due to high-level spinal cord injury, neurological conditions, or muscle weakness. Also helpful for those who tend to lean to one side, experience fatigue from holding themselves upright, or have scoliosis requiring positional management.",
    productUrl: "https://www.sunrisemedical.com/seating-positioning/jay/positioning-components",
  },
  {
    id: "headrest-system",
    title: "Headrest Support System",
    description:
      "Adjustable head support for users with limited neck control or fatigue.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    tags: ["power-wheelchair", "positioning", "head-support"],
    category: "seating",
    whatItIs:
      "Headrest systems range from simple curved pads to complex multi-adjustable supports with occipital, temporal, and forehead components. They mount to the wheelchair backrest via adjustable hardware that allows positioning in multiple planes.",
    whatItDoes:
      "A properly fitted headrest supports the weight of your head, reducing neck muscle fatigue and strain. For users with limited neck control, it provides safety and positioning. Advanced systems can accommodate different head shapes and provide anterior support to prevent forward head drop.",
    whoItsFor:
      "Necessary for users with limited neck strength or control due to high cervical injury, ALS, muscular dystrophy, or other conditions. Also beneficial for those who experience neck fatigue during long periods of use, need support during tilt/recline, or have fluctuating tone affecting head position.",
    productUrl: "https://www.sunrisemedical.com/seating-positioning/jay/head-supports",
  },
];

/* ───────────────────────── Control Interfaces ───────────────────────── */

export const CONTROL_INTERFACES: PowerWheelchairProduct[] = [
  {
    id: "joystick-control",
    title: "Proportional Joystick",
    description:
      "Standard control offering precise speed and direction through hand movement.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tags: ["power-wheelchair", "controls", "joystick"],
    category: "controls",
    whatItIs:
      "A proportional joystick is the standard control input for power wheelchairs. It consists of a small stick mounted on a control module that responds proportionally to the direction and force you apply—move it slightly for slow speed, push further for faster movement.",
    whatItDoes:
      "The joystick provides intuitive control over wheelchair speed and direction. Push forward to go forward, pull back to reverse, move sideways to turn. The proportional response means gentle inputs result in gentle movements, giving precise control for manoeuvring in tight spaces while still allowing faster travel when needed.",
    whoItsFor:
      "Suitable for most power wheelchair users who have sufficient hand function to grip and manipulate a small stick. Various handle shapes (goal post, ball, T-bar) and mounting positions accommodate different hand abilities. The standard choice for users with functional hand movement.",
    productUrl: "https://www.quantumrehab.com/quantum-electronics/joysticks.asp",
  },
  {
    id: "compact-joystick",
    title: "Compact Joystick",
    description:
      "Smaller joystick requiring minimal force, ideal for limited hand function.",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
    tags: ["power-wheelchair", "controls", "accessibility"],
    category: "controls",
    whatItIs:
      "A compact or mini joystick is a smaller version of the standard proportional joystick, typically requiring less force and smaller movement range to operate. They can be mounted in various positions including on armrests, laptray, or even near the chin.",
    whatItDoes:
      "These joysticks provide the same proportional control as standard joysticks but with reduced physical demands. The smaller throw (movement distance) and lighter force requirements make them accessible to users with limited strength or range of motion. Sensitivity can be adjusted to match individual abilities.",
    whoItsFor:
      "Designed for users with limited hand strength, reduced range of motion, or fine motor difficulties who still have some functional hand movement. Common for users with muscular dystrophy, high-level tetraplegia with partial hand function, or conditions causing weakness.",
    productUrl: "https://www.permobil.com/en-us/products/electronics/joysticks",
  },
  {
    id: "sip-and-puff",
    title: "Sip-and-Puff Controller",
    description:
      "Hands-free control using breath through a straw for users with minimal limb function.",
    image:
      "https://images.unsplash.com/photo-1576091160291-5e286764fb6c?w=400",
    tags: ["power-wheelchair", "controls", "hands-free"],
    category: "controls",
    whatItIs:
      "A sip-and-puff system uses a straw-like tube positioned near the user's mouth. Different breath patterns—soft sip, hard sip, soft puff, hard puff—send commands to the wheelchair. The controller interprets these patterns as directional and mode inputs.",
    whatItDoes:
      "This system provides complete wheelchair control without any limb movement. Typically, soft puffs/sips control speed and direction while hard puffs/sips change modes or execute commands. With practice, users can navigate complex environments entirely through breath control.",
    whoItsFor:
      "Essential for users with no functional arm movement, such as those with high cervical spinal cord injuries (C1-C4), advanced ALS, or severe muscular dystrophy. Requires good breath control and cognitive ability to learn the input patterns.",
    productUrl: "https://www.quantumrehab.com/quantum-electronics/alternative-drive-controls.asp",
  },
  {
    id: "head-array",
    title: "Head Array Control",
    description:
      "Three-switch system using head movements against padded sensors for full control.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    tags: ["power-wheelchair", "controls", "head-control"],
    category: "controls",
    whatItIs:
      "A head array consists of three proximity or pressure switches mounted behind and beside the user's head on their headrest. Pressing the head against each switch triggers specific wheelchair functions.",
    whatItDoes:
      "The rear switch typically controls forward movement, while the two side switches control turning. By combining switch activations (e.g., rear + left), users can move forward while turning. The system often includes proportional sensitivity and adjustable response parameters to match individual head control abilities.",
    whoItsFor:
      "Designed for users with reliable head control but no functional arm movement. Common for high-level spinal cord injury, ALS, and other conditions affecting limb function. Requires sufficient head and neck strength to activate switches and a stable head position.",
    productUrl: "https://www.steelcase.com/products/head-array/",
  },
  {
    id: "chin-control",
    title: "Chin Joystick",
    description:
      "Joystick positioned for chin operation, providing proportional control hands-free.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
    tags: ["power-wheelchair", "controls", "alternative"],
    category: "controls",
    whatItIs:
      "A chin joystick is a compact proportional joystick mounted on a swing-away arm that positions it beneath the user's chin. The joystick is specially designed for chin operation with appropriate cup or contoured handle shapes.",
    whatItDoes:
      "This provides the same proportional control as a hand joystick but operated by chin movement. The swing-away mount allows the joystick to be moved aside for transfers, eating, or social situations. Some systems include an additional switch for mode changes.",
    whoItsFor:
      "Suitable for users with good head control and sufficient chin mobility but no functional arm use. Often preferred by users who find head arrays too tiring or want more precise proportional control than switch-based systems offer.",
    productUrl: "https://www.permobil.com/en-us/products/electronics/alternative-controls",
  },
];

/* ───────────────────────── Environmental Access ───────────────────────── */

export const ENVIRONMENTAL_ACCESS: PowerWheelchairProduct[] = [
  {
    id: "bluetooth-module",
    title: "Bluetooth Control Module",
    description:
      "Enables wheelchair controls to operate phones, tablets, computers, and smart home devices.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    tags: ["power-wheelchair", "technology", "smart-home"],
    category: "environmental",
    whatItIs:
      "A Bluetooth module integrates with your power wheelchair's electronics, allowing the joystick or alternative controls to connect wirelessly to external devices. It essentially turns your wheelchair controls into a universal input device.",
    whatItDoes:
      "With a Bluetooth module, you can use your wheelchair joystick to control smartphone apps, navigate tablets, operate computers as a mouse, and interact with Bluetooth-enabled smart home devices. A simple mode switch toggles between wheelchair driving and device control.",
    whoItsFor:
      "Valuable for any power wheelchair user who wants seamless control of technology without switching input devices. Particularly important for users with limited hand function who cannot easily operate touchscreens or standard mice, enabling independent access to communication, entertainment, and environmental control.",
    productUrl: "https://www.permobil.com/en-us/products/electronics/connectivity",
  },
  {
    id: "wheelchair-mount",
    title: "Device Mounting System",
    description:
      "Secure, adjustable mounts for phones, tablets, and communication devices.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    tags: ["power-wheelchair", "mount", "accessibility"],
    category: "environmental",
    whatItIs:
      "Wheelchair mounting systems consist of articulated arms, clamps, and device holders that attach to various points on a power wheelchair. They range from simple phone holders to complex mounting systems for heavy communication devices.",
    whatItDoes:
      "A good mounting system positions your device at the optimal angle and distance for viewing and interaction, while keeping it secure during movement. Articulated arms allow repositioning for different activities—closer for interaction, swung aside for transfers, or folded away when not needed.",
    whoItsFor:
      "Essential for users who rely on mounted devices for communication (AAC), navigation, or daily tasks. Important for anyone who cannot safely hold devices while driving or needs hands-free access to technology. Quality mounts are especially crucial for expensive AAC devices.",
    productUrl: "https://www.rehadapt.com/products/mounting-systems/",
  },
  {
    id: "environmental-control",
    title: "Environmental Control Unit (ECU)",
    description:
      "System to control lights, doors, TVs, and appliances from wheelchair controls.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=400",
    tags: ["power-wheelchair", "smart-home", "independence"],
    category: "environmental",
    whatItIs:
      "An Environmental Control Unit is a system that integrates with your wheelchair electronics or operates independently to control home appliances and systems. It may use infrared (for TVs), radio frequency (for door openers), or smart home protocols (WiFi/Zigbee).",
    whatItDoes:
      "ECUs allow you to control lights, televisions, door locks, thermostats, beds, and other home devices from your wheelchair controls or a single accessible switch. This eliminates the need to physically reach or operate standard switches and remotes throughout your home.",
    whoItsFor:
      "Crucial for users with limited arm function who cannot independently operate light switches, door handles, or remote controls. Particularly important for those living alone or wanting independence in managing their environment. A key component of accessible smart home setups.",
    productUrl: "https://www.ablenetinc.com/technology/environmental-controls/",
  },
  {
    id: "attendant-control",
    title: "Attendant Control Module",
    description:
      "Secondary control allowing a carer to drive the wheelchair from behind.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    tags: ["power-wheelchair", "caregiver", "safety"],
    category: "environmental",
    whatItIs:
      "An attendant control is a secondary joystick or control panel mounted at the back of a power wheelchair, allowing a caregiver or attendant to drive the chair. It typically connects to the main control system and can be enabled or disabled as needed.",
    whatItDoes:
      "This system allows a carer to take over driving in situations where the user is fatigued, in unfamiliar environments, or during medical appointments. The attendant can navigate tight spaces, manage crowds, or simply give the user a rest while maintaining power wheelchair benefits.",
    whoItsFor:
      "Useful for users who occasionally need assistance with driving due to fatigue, cognitive changes, or complex environments. Important for medical settings where clinicians need to position patients. Also valuable as a training tool for new power wheelchair users.",
    productUrl: "https://www.quantumrehab.com/quantum-electronics/attendant-control.asp",
  },
];

/* ───────────────────────── Aggregate Export ───────────────────────── */

export const POWER_WHEELCHAIR_PRODUCTS: PowerWheelchairProduct[] = [
  ...POWER_WHEELCHAIR_ACCESSORIES,
  ...SEATING_AND_POSITIONING,
  ...CONTROL_INTERFACES,
  ...ENVIRONMENTAL_ACCESS,
];
