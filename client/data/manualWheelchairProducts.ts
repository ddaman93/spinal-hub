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
  {
    id: "smoov-one",
    title: "SMOOV one",
    description:
      "Hands-free electric wheelchair attachment providing power assistance up to 20km range.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/smoov/smoov-woman-no-limits.jpg",
    tags: ["manual-wheelchair", "power-assist", "portable", "outdoor"],
    category: "power-assist",
    whatItIs:
      "The SMOOV one is a lightweight (7.2kg) electric drive unit that attaches to manual wheelchairs, transforming them into powered mobility devices. It features a hub drive motor, integrated lithium-ion battery, Bluetooth wireless control, and can be easily docked and undocked with a releasing device and carrying handle.",
    whatItDoes:
      "This device provides hands-free power assistance with speeds up to 10 km/h and a range of up to 20km on a single charge. The Bluetooth ergonomic control unit allows wireless operation, while the 360° swivel fork enables smooth kerb and edge navigation. It can handle slopes up to 16% and supports users up to 140kg. The USB-C socket lets you charge smartphones or the control unit on the go, and the integrated LED light improves visibility.",
    whoItsFor:
      "Ideal for manual wheelchair users who want to reduce physical strain and extend their range without committing to a full power wheelchair. Perfect for those who travel frequently (compatible with bus, train, car, plane), need to navigate varied terrain including slopes and outdoor surfaces, or want the flexibility to switch between manual and powered mobility. Particularly beneficial for users experiencing fatigue or wanting to conserve energy for activities.",
    productUrl: "https://smoov.com/gb-en/smoov-one/",
  },
  {
    id: "empulse-m90",
    title: "Empulse M90",
    description:
      "Lightweight in-wheel power assist system with dual control modes and up to 9.3 miles range.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/m90-power-assist/m90%20power%20assist.png",
    tags: ["manual-wheelchair", "power-assist", "portable"],
    category: "power-assist",
    whatItIs:
      "The Empulse M90 is an innovative in-wheel power assist system that transforms your manual wheelchair into a power-assisted one without bulky components or tangled wires. Each wheel weighs only 11.7 lbs and houses a 150-watt motor and lithium-ion battery within the hub. The system uses a quick-release mechanism, allowing you to keep your preferred tires and handrims while switching effortlessly between manual and powered propulsion.",
    whatItDoes:
      "The M90 offers two drive modes: All-Way Toggle for power wheelchair-style joystick control, and Speed Controller with Handrim Steering for a cruise control-like experience. It provides power assistance for up to 9.3 miles per charge with intelligent features including cruise control, smart hill handling, and indoor/outdoor profile settings. The dual controller system gives you flexibility to choose between joystick or handrim steering based on your preference and environment. The flight-friendly batteries can be charged on or off the chair.",
    whoItsFor:
      "Perfect for manual wheelchair users who want the lightest possible power assist solution (up to 40% lighter than similar devices) without sacrificing functionality. Ideal for those who travel frequently and need portable, flight-friendly power assistance, experience shoulder fatigue or pain from manual propulsion, or want the flexibility to switch between manual and powered modes seamlessly. Particularly beneficial for users up to 220 lbs who value maintaining their wheelchair's original look and feel.",
    productUrl: "https://www.sunrisemedical.com/power-assist/empulse/add-on-devices/m90",
  },
  {
    id: "empulse-r90",
    title: "Empulse R90",
    description:
      "Below-the-seat power assist with up to 19.5 miles range and retractable wheel design.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/r90-sunrise/r90.png",
    tags: ["manual-wheelchair", "power-assist", "long-range"],
    category: "power-assist",
    whatItIs:
      "The Empulse R90 is a rear-mounted power assist system that sits discreetly below the seat of your manual wheelchair. Weighing only 14.5-15.6 lbs depending on battery choice, it preserves your wheelchair's original footprint and turning radius while maintaining excellent maneuverability. The system is compatible with most rigid and folding wheelchairs, with receiver brackets that don't interfere with chair components and still allow folding chairs to fold.",
    whatItDoes:
      "The R90 provides power assistance for up to 19.5 miles on a single charge with a top speed of 5.5 mph and supports riders up to 275 lbs. It features intelligent technology that automatically reduces speed when cornering and adjusts power output when detecting slopes or obstacles to help maintain consistent speed. Control is wireless via Bluetooth with push-button propulsion for easy speed control, and the Sunrise Intelligence app lets you select performance profiles for different environments. A unique feature allows you to raise the wheel up with the push of a button when power assist isn't needed, providing zero rolling resistance for true manual propulsion.",
    whoItsFor:
      "Ideal for manual wheelchair users who need long-range power assistance without changing their wheelchair's dimensions or handling characteristics. Perfect for those who want the flexibility to switch between powered and pure manual modes instantly, need to maintain their chair's folding capability, or travel longer distances regularly. Particularly beneficial for users up to 275 lbs who value extended range and smart assistance features that adapt to terrain automatically.",
    productUrl: "https://www.sunrisemedical.com/power-assist/empulse/add-on-devices/r90",
  },
  {
    id: "wijit-power-assist",
    title: "Wijit",
    description:
      "Compact lever-operated power assist device that clips to wheelchair frame for easy propulsion.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/wijit/wijit.jpg",
    tags: ["manual-wheelchair", "power-assist", "portable"],
    category: "power-assist",
    whatItIs:
      "The Wijit is a lightweight, portable power assist device that attaches to the frame of most manual wheelchairs. It features a simple lever mechanism connected to a motorised drive wheel that can be engaged or disengaged as needed. The compact design weighs only a few pounds and can be easily removed for transport or storage.",
    whatItDoes:
      "When engaged, the Wijit provides power assistance through a lever-operated control. Simply move the lever forward to propel yourself, making it easier to navigate slopes, rough terrain, and long distances. The device multiplies your pushing effort, significantly reducing strain on your shoulders and arms. It can be quickly disengaged when you want to use your manual wheelchair normally or need to fold it for transport.",
    whoItsFor:
      "Ideal for manual wheelchair users who experience fatigue or shoulder pain from prolonged pushing, need assistance on hills and inclines, or want to conserve energy during longer outings. Particularly beneficial for those with limited upper body strength, repetitive strain injuries, or anyone looking to extend their independent mobility range without converting to a full power wheelchair.",
    productUrl: "https://www.gowijitnow.com/",
  },
  {
    id: "pride-power-assist-hd",
    title: "Pride Power Assist HD",
    description:
      "Heavy-duty power assist with dual-wheel design, supporting up to 182kg and 16km range.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/pride/pridepa.jpg",
    tags: ["manual-wheelchair", "power-assist", "heavy-duty"],
    category: "power-assist",
    whatItIs:
      "The Pride Power Assist HD is a heavy-duty power assist device that attaches directly to most manual wheelchairs. It features a robust dual-wheel design for enhanced traction and stability, with a discreet profile that preserves your wheelchair's original footprint. The system is compatible with manual wheelchairs ranging from 16\" to 24\" in width and offers sturdy construction built for everyday use.",
    whatItDoes:
      "The Power Assist HD provides electronic propulsion with speeds up to 6.4 km/h and a range of up to 16 kilometers (10 miles) per charge. It features an easy-to-use controller with a speed dial for customizable speed settings and a hand-controlled lever for precise maneuverability around corners and obstacles. The dual-wheel design delivers superior traction and stability, especially beneficial for heavier users or challenging terrain. The system supports a combined user and wheelchair weight of up to 182kg.",
    whoItsFor:
      "Designed for heavier manual wheelchair users or those requiring extra durability and stability. Ideal for people who need reliable power assistance for daily use, longer distances, or varied terrain. Perfect for users seeking a heavy-duty solution that can handle demanding conditions while maintaining precise control. Particularly beneficial for those who need a high weight capacity power assist system without compromising on performance or reliability.",
    productUrl: "https://alliedmedical.co.nz/products/pride-power-assist-hd",
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
  {
    id: "empulse-f35",
    title: "Empulse F35",
    description:
      "Ultra-portable handbike attachment with one-motion docking and speeds up to 9.3 mph.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/f35-trike/f35.png",
    tags: ["manual-wheelchair", "handcycle", "portable", "outdoor"],
    category: "handcycle",
    whatItIs:
      "The Empulse F35 is a lightweight (16.5 lbs) electric handbike attachment that connects to the front of most manual wheelchairs. It features a 250-watt motor, 36V lithium-ion battery, one-motion docking system, and foldable handles for easy transport. The innovative design integrates the battery and cabling inside the frame tube for a clean, streamlined appearance.",
    whatItDoes:
      "The F35 provides electric propulsion with speeds up to 9.3 mph and a range of up to 9.3 miles per charge. It offers three speed modes (3.7, 6.2, and 9.3 mph) with adjustable acceleration profiles, cruise control, and dual braking systems (electronic and mechanical). The LCD control panel allows easy speed adjustment, and the bright LED headlight ensures visibility. It handles inclines up to 6° and supports users up to 242 lbs. The quick-charging battery recharges in just 2-2.5 hours and is IATA approved for air travel.",
    whoItsFor:
      "Perfect for manual wheelchair users who need versatile powered mobility for urban commuting, outdoor recreation, and travel. Ideal for those who value portability and want a handbike that's easy to attach, detach, and transport. Particularly beneficial for active users who want to cover longer distances, navigate varied terrain, or maintain independence without the bulk of a traditional power wheelchair. The travel-friendly design makes it excellent for frequent travelers.",
    productUrl: "https://www.sunrisemedical.com/power-assist/empulse/add-on-devices/f35",
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
  {
    id: "freewheel",
    title: "FreeWheel",
    description:
      "All-terrain wheelchair attachment with 12.5\" wheel for easily crossing rough ground, gravel, and grass.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/freewheel/freewheel-piranha.jpg",
    tags: ["manual-wheelchair", "propulsion", "terrain", "outdoor"],
    category: "propulsion",
    whatItIs:
      "The FreeWheel is a single large pneumatic castor attachment that connects to your wheelchair's footplate. Weighing only 2.35 kg with a 12.5\" pneumatic tire, it features an adjustable clamp suitable for most fixed footrests and can be quickly attached or removed in seconds. When not in use, it mounts conveniently on the wheelchair back. Made in the USA with a black satin powdercoat finish and backed by a one-year warranty.",
    whatItDoes:
      "The FreeWheel lifts your front castors off the ground and rides on its large wheel to provide a comfortable and stable ride over challenging terrain. It easily traverses gravel, grass, dirt, and other rough surfaces that would otherwise prove difficult or impossible. The device features adjustable castor tracking (return to center), adjustable centering position (offset), and adjustable lift height for the front castors. This tracking adjustment makes it effective not just for off-road use but also for distance training on roads and pathways. Optional mountain bike tires expand its capability to handle sand and snow conditions.",
    whoItsFor:
      "Ideal for fixed-frame wheelchair users who want to explore outdoor environments and tackle rough terrain that standard casters cannot handle. Perfect for those who enjoy outdoor activities like trails, parks, beaches, or unpaved paths. Particularly beneficial for users seeking enhanced off-road mobility without converting to a specialized all-terrain wheelchair, as well as those who want a lightweight, removable solution that can be easily stored when not needed.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/freewheel.html",
  },
  {
    id: "carbolife-pushrims",
    title: "CarboLife Ergonomic Push Rims",
    description:
      "Anatomically optimized push rims with multiple models designed for different hand functions and grip strengths.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/carbolife/carbolife2.jpg",
    tags: ["manual-wheelchair", "propulsion", "ergonomics", "accessibility"],
    category: "propulsion",
    whatItIs:
      "CarboLife manufactures ergonomically optimized push rims designed around the natural anatomy of the human hand. Available in sizes from 22\" to 26\", they offer four distinct product lines tailored to different functional abilities: GEKKO (complete hand function with silicon comfort strip), CURVE (complete hand function and strength with powder coat or anodised finish), CURVE TETRA (limited hand strength with anti-slip plastic coating), and QUADRO (limited hand function without triceps capability with anti-slip coating).",
    whatItDoes:
      "The ergonomically optimized profile guarantees a controlled and effortless grip while stabilizing the wrist during propulsion. This design significantly reduces hand muscle fatigue and cramping, minimizes pain during extended use, and enables a more relaxed riding experience. Multiple surface options including anodised, powder coated, and anti-slip plastic coatings provide appropriate grip levels for different functional needs. The anatomical design distributes force more naturally across the hand, reducing strain on joints and muscles.",
    whoItsFor:
      "Designed for wheelchair users with varying levels of hand capability, from unaffected hands to tetra hands, low grip strength, and reduced wrist strength. Particularly beneficial for those experiencing hand fatigue, wrist pain, or cramping during propulsion. Ideal for users with tetraplegia or limited triceps function who need enhanced grip surfaces, as well as anyone seeking to reduce repetitive strain injuries and improve long-term shoulder health through better propulsion mechanics.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/carbolife.html",
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