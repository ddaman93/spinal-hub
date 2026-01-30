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
  whatItIs?: string;
  whatItDoes?: string;
  whoItsFor?: string;
  productUrl?: string;
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
    whatItIs:
      "The SmartDrive MX2+ is a compact, lightweight power assist device that attaches to the rear of most manual wheelchairs. It uses a single motorised wheel that sits behind the chair and provides on-demand propulsion assistance.",
    whatItDoes:
      "When you push your wheels, the SmartDrive detects the motion and provides a boost to help you travel further with less effort. It can be controlled via a wristband tap or push-sensor, letting you accelerate, coast, and brake hands-free. It handles inclines, rough terrain, and long distances that would otherwise cause fatigue.",
    whoItsFor:
      "Ideal for manual wheelchair users who want to preserve shoulder health, reduce repetitive strain injuries, or need extra assistance on hills and longer distances. Particularly beneficial for those with limited upper body strength or endurance, or anyone looking to stay active without overexertion.",
    productUrl: "https://www.permobil.com/en-us/products/power-assist/smartdrive-mx2-plus",
  },
  {
    id: "emotion-m25",
    title: "e-motion Wheels",
    description:
      "Motorised wheels that assist each push stroke for smoother propulsion and control.",
    image: require("@/assets/images/manual/emotion.jpg"),
    tags: ["manual-wheelchair", "power-assist"],
    category: "power-assist",
    whatItIs:
      "e-motion wheels are power-assist wheels that replace your standard manual wheelchair wheels. Each wheel contains an integrated motor, battery, and sensor system housed within the hub, giving your chair powered assistance while maintaining its manual wheelchair form factor.",
    whatItDoes:
      "The wheels sense every push you make and multiply your effort with motor assistance. Push gently and get a gentle boost; push harder for more power. They provide smooth, intuitive propulsion that feels natural, help you tackle slopes and uneven surfaces, and significantly reduce the strain on your shoulders and arms.",
    whoItsFor:
      "Perfect for manual wheelchair users who want power assistance without converting to a power chair. Great for those experiencing shoulder pain or fatigue, people who travel frequently (the wheels are relatively easy to transport), and users who value the manoeuvrability of a manual chair but need extra help with propulsion.",
    productUrl: "https://www.alber.de/en/products/wheelchair-drives/e-motion/",
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
    whatItIs:
      "The Triride is an electric-powered front attachment that clips onto your manual wheelchair, converting it into a three-wheeled electric vehicle. It features a powerful motor, long-range battery, and handlebar steering with throttle control.",
    whatItDoes:
      "Once attached, the Triride lifts your front casters off the ground and takes over propulsion entirely. You steer using the handlebars and control speed with a thumb throttle. It allows you to travel long distances at higher speeds (up to 20+ km/h), tackle hills effortlessly, and navigate outdoor terrain that would be impossible in a standard manual chair.",
    whoItsFor:
      "Designed for manual wheelchair users who want to cover longer distances outdoors, commute independently, or enjoy recreational outings like trails and parks. Excellent for those with limited pushing ability who still want the flexibility of a manual chair indoors while having powered outdoor mobility.",
    productUrl: "https://www.triride.com/",
  },
  {
    id: "batec",
    title: "Batec Electric Handbike",
    description:
      "High-performance clip-on handbike for outdoor and urban environments.",
    image: require("@/assets/images/manual/batec.jpg"),
    tags: ["manual-wheelchair", "handcycle", "terrain"],
    category: "handcycle",
    whatItIs:
      "The Batec is a premium electric handbike attachment that connects to the front of your manual wheelchair. It features a robust motor, responsive controls, and a sporty design built for both urban commuting and off-road adventures.",
    whatItDoes:
      "The Batec transforms your wheelchair into a powered trike. It provides full electric propulsion with intuitive handlebar controls, allowing you to travel at speeds up to 25 km/h with a range of 30-40 km per charge. The suspension system absorbs bumps, making it comfortable on varied terrain including gravel paths, grass, and city streets.",
    whoItsFor:
      "Ideal for active manual wheelchair users who want freedom to explore outdoors, commute to work, or keep up with friends and family on outings. Suited for those who need reliable powered mobility over longer distances but prefer to use their manual chair indoors or in tight spaces.",
    productUrl: "https://www.batec-mobility.com/",
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
    whatItIs:
      "Ergonomic push rims are specially designed wheel rims that replace standard push rims on manual wheelchairs. They feature contoured shapes, textured coatings, or extended surfaces that provide a more natural grip angle and better contact with your hands.",
    whatItDoes:
      "These push rims reduce the strain on your wrists, thumbs, and shoulders by allowing a more natural pushing motion. The ergonomic design distributes force more evenly across your palm, reducing pressure points and repetitive stress. Many models also provide better grip in wet conditions or for users with reduced hand function.",
    whoItsFor:
      "Beneficial for any manual wheelchair user, but especially valuable for those experiencing wrist or hand pain, carpal tunnel symptoms, or reduced grip strength. Also recommended for users with tetraplegia or limited hand function who need maximum contact surface for effective propulsion.",
    productUrl: "https://www.sunrisemedical.com/manual-wheelchairs/quickie/wheelchair-accessories/wheels-and-handrims",
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
    whatItIs:
      "A transfer board (also called a sliding board) is a smooth, flat board typically made from wood, plastic, or carbon fibre. It acts as a bridge between your wheelchair and another surface like a bed, car seat, shower bench, or toilet.",
    whatItDoes:
      "The board creates a stable, low-friction surface that allows you to slide across rather than lift your full body weight during transfers. You position one end under your thigh and the other on the target surface, then use your arms to scoot across in small movements. This significantly reduces the physical effort and risk involved in transferring.",
    whoItsFor:
      "Essential for wheelchair users who perform lateral (sideways) transfers and have limited lower body function. Particularly helpful for those with reduced upper body strength, anyone wanting to protect their shoulders from transfer-related strain, and people who transfer independently without a carer's assistance.",
    productUrl: "https://www.performancehealth.com/transfer-boards",
  },
];

/* ───────────────────────── Optional Aggregate Export ───────────────────────── */

export const MANUAL_WHEELCHAIR_PRODUCTS: ManualWheelchairProduct[] = [
  ...POWER_ASSIST_WHEELS,
  ...HANDCYCLE_ATTACHMENTS,
  ...PROPULSION_AIDS,
  ...TRANSFER_AND_SETUP_AIDS,
];