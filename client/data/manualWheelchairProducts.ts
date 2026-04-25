export type ManualWheelchairBrand = {
  id: string;
  title: string;
  description: string;
  image: any; // local require()
  externalUrl?: string;
  contentFit?: "cover" | "contain";
};

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
    | "transfer"
    | "storage"
    | "device-mount"
    | "gloves";
  whatItIs?: string;
  whatItDoes?: string;
  whoItsFor?: string;
  productUrl?: string;
  videoUrl?: string;
  contentFit?: "cover" | "contain";
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
    productUrl: "https://www.permobil.com/en-nz/products/power-assist/smartdrive-mx2plus",
    contentFit: "contain",
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
    productUrl: "https://invacareonline.co.nz/products/alber-e-motion-m25-power-add-on?srsltid=AfmBOoq0AXynzA4BZA5J3wH3dVnziO5fguCPsN1JluwBVvaL_SFIAJDA",
  },
  {
    id: "quickie-xtender",
    title: "Quickie Xtender",
    description:
      "Rear-mounted power assist wheels that replace standard wheels for intuitive push-sensing propulsion.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/Quickie-Xtender.png",
    tags: ["manual-wheelchair", "power-assist"],
    category: "power-assist",
    whatItIs:
      "The Quickie Xtender is a power assist wheel system from Sunrise Medical that replaces your existing manual wheelchair wheels. Each wheel contains a built-in motor and battery that senses your push and adds power, transforming your manual chair into a power-assisted one without changing its profile.",
    whatItDoes:
      "The Xtender detects each push stroke and amplifies your effort with motor assistance, reducing the force required to propel your chair. It helps you tackle inclines, rough terrain, and longer distances with significantly less shoulder strain. The system is designed to feel natural and responsive, closely matching your intended direction and speed.",
    whoItsFor:
      "Ideal for manual wheelchair users who want in-wheel power assistance while keeping their chair's existing form factor and manoeuvrability. A strong option for those with upper limb fatigue, shoulder injuries, or anyone who wants extra help on hills and longer distances without switching to a full power chair.",
    productUrl: "https://medifab.com/nz/product/quickie-xtender-wheelchair-power-assist-wheels/",
    videoUrl: "https://www.youtube.com/embed/3V1uDbt7fOE",
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
    productUrl: "https://www.trirideitalia.com/en/",
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
    productUrl: "https://www.permobil.com/en-nz/products/power-assist/batec/batec-electric-2",
  },
  {
    id: "sirocco-power-add-on",
    title: "Sirocco Power Add-On",
    description:
      "Lightweight front-wheel power add-on for manual wheelchairs with intuitive push-sensing control.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/medifab/Sirocco%20Power%20Add-On.png",
    tags: ["manual-wheelchair", "handcycle", "outdoor", "portable"],
    category: "handcycle",
    whatItIs:
      "The Sirocco Power Add-On is a compact front-wheel attachment from Medifab that connects to your manual wheelchair, converting it into a power-assisted three-wheeler. Designed for everyday use, it combines a lightweight frame with an integrated motor and battery in a streamlined package that's quick to attach and detach.",
    whatItDoes:
      "The Sirocco provides electric propulsion through a front drive wheel, allowing you to travel further with less effort. It handles inclines, varied terrain, and longer distances that would be challenging in a standard manual chair. The intuitive controls let you manage speed comfortably, and the system is designed to attach and detach quickly so you can switch between powered and manual use as needed.",
    whoItsFor:
      "Well suited to manual wheelchair users who want powered outdoor mobility without the bulk of a full power wheelchair. A practical option for those who need help with hills and longer distances but still prefer a manual chair for indoor use. Available through Medifab NZ, making it an accessible option for New Zealand users.",
    productUrl: "https://medifab.com/au/product/sirocco-power-add-on/",
    videoUrl: "https://www.youtube.com/embed/nQoz54bhBcs",
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
    id: "wooden-transfer-board-nz",
    title: "Wooden Transfer Boards",
    description:
      "Curved and straight wooden boards for safe, low-effort transfers between wheelchair and other surfaces.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/Transfer-boards/Wood_Transfer_Boards_Curved_Straight.jpg",
    tags: ["manual-wheelchair", "transfer", "NZ"],
    category: "transfer",
    whatItIs:
      "Wooden transfer boards from Mobility Centre NZ. Available in curved and straight designs, these boards bridge the gap between your wheelchair and another surface such as a bed, car seat, shower bench, or toilet.",
    whatItDoes:
      "Creates a stable sliding surface so you can move across rather than lift your full body weight. Position one end under your thigh and the other on the target surface, then use your arms to scoot across in small movements — reducing effort and protecting your shoulders.",
    whoItsFor:
      "Wheelchair users who perform lateral transfers and have limited lower body function. Particularly useful for those who transfer independently or want to reduce strain on their shoulders and carers.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/daily-living-kitchen-aids/transferring-aids/wooden-transfer-boards/",
  },
];

/* ───────────────────────── Storage & Carry Accessories ───────────────────────── */

export const STORAGE_ACCESSORIES: ManualWheelchairProduct[] = [
  {
    id: "wheelchair-bag-mobility-centre",
    title: "Deluxe Wheelchair Bag",
    description:
      "Heavy-duty Oxford nylon bag with reflective strip that attaches to push handles for secure storage.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/storage-acc/wheelchair-bag.jpg",
    tags: ["manual-wheelchair", "storage", "NZ"],
    category: "storage",
    whatItIs:
      "The Deluxe Wheelchair Bag is a convenient storage solution made from heavy-duty Oxford nylon that slides over the back of your wheelchair. It attaches securely to push handles with two strong adjustable straps that fit most wheelchair sizes, and features handlebar hooks for added security.",
    whatItDoes:
      "This bag provides weather-resistant storage (37 x 43 x 10cm) with easy-grip zip fobs and a reflective strip for visibility in dark conditions. It keeps your essentials secure and accessible while protecting them from short showers. Available in sizes to fit either wire or plastic baskets.",
    whoItsFor:
      "Perfect for wheelchair users needing reliable daily storage for essentials like phones, wallets, keys, and small personal items. Particularly beneficial for those who need visibility in low-light conditions or want weather-resistant protection for their belongings.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/mobility-scooters-power-chairs/scooter-wheelchair-accessories/storage-covers-carry-bags-ponchos/deluxe-wheelchair-bag/",
  },
  {
    id: "wheelchair-bag-mobility-man",
    title: "Multi-Compartment Wheelchair Bag",
    description:
      "Versatile wheelchair bag with multiple compartments, bottle holder, and walking stick slot.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/storage-acc/multi-bag.webp",
    tags: ["manual-wheelchair", "storage", "NZ"],
    category: "storage",
    whatItIs:
      "A general-purpose wheelchair storage bag made from heavy-duty Oxford nylon that's both tear-resistant and water-resistant. It features adjustable straps that fit over push handles and is compatible with most wheelchair brands and small scooters.",
    whatItDoes:
      "This bag provides organized storage with multiple compartments for different items, including a dedicated bottle holder to keep drinks accessible and a walking stick slot for storing mobility aids. The heavy-duty construction protects your belongings while the multiple compartments keep everything organized and easy to find.",
    whoItsFor:
      "Ideal for wheelchair and small scooter users who need versatile, organized storage for daily outings. Particularly useful for those who carry drinks and need quick access to hydration, or anyone who uses a walking stick and needs a secure place to store it while seated.",
    productUrl: "https://mobilitywarehouse.co.nz/product/wheelchair-bag/",
  },
  {
    id: "karma-pouch-bag",
    title: "Karma Wheelchair Pouch Bag",
    description:
      "Multi-functional three-in-one bag that works as wheelchair pocket, side pack, or waist pack.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/storage-acc/Karma%20Wheelchair%20Pouch%20Bag%20%E2%80%93%20Allied%20Medical%20Limited.jpeg",
    tags: ["manual-wheelchair", "storage", "versatile", "NZ"],
    category: "storage",
    whatItIs:
      "The Karma Pouch Bag is a multi-functional storage solution that offers three carry options in one design. It can be attached to your wheelchair as a pocket, removed to carry as a side pack, or worn as a waist pack, providing flexibility for different situations and activities.",
    whatItDoes:
      "This versatile bag protects your personal valuables while adapting to your needs throughout the day. Attach it to your wheelchair for hands-free storage during wheeling, detach it to carry as a side pack when transferring or moving away from your chair, or wear it as a waist pack for activities where you need your belongings close but portable.",
    whoItsFor:
      "Perfect for wheelchair users who need flexible storage that transitions seamlessly between wheelchair use and other activities. Ideal for those who frequently transfer in and out of their chair, want to keep valuables close when away from the wheelchair, or appreciate multi-purpose accessories that adapt to different situations.",
    productUrl: "https://alliedmedical.co.nz/products/karma-pouch-bag",
  },
  {
    id: "bodypoint-mobility-bag",
    title: "Bodypoint Under-Seat Mobility Bag",
    description:
      "Discreet under-seat bag with bright orange interior and two attachment options for keeping essentials out of sight.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/power-wheelchairs/storage-acc/Bodypoint_underseat-bag.jpg",
    tags: ["manual-wheelchair", "storage", "under-seat", "NZ"],
    category: "storage",
    whatItIs:
      "The Bodypoint Mobility Bag is a compact under-seat storage solution (8\" x 7.5\" x 4.25\") that keeps necessities and valuables close yet out of sight. It features two large zippered pockets with no-jingle loops, mesh front pockets for quick access, and a bright orange interior for easy visibility of contents. Made from basic black fabric that holds its shape with reversed zipper pulls for easy access.",
    whatItDoes:
      "This bag attaches discreetly under your wheelchair seat using either detachable seat clips or Velcro-style tabs, keeping your personal items secure and accessible without adding bulk to your chair's profile. The machine-washable design (delicate cycle, cold water, air dry) makes it easy to maintain, while the bright interior and mesh pockets help you quickly locate items without rummaging.",
    whoItsFor:
      "Ideal for wheelchair users who prefer discreet storage that doesn't advertise their belongings, want easy access to frequently used items without visible bags, or need a low-profile solution that won't interfere with transfers or chair folding. Particularly beneficial for those who value organization and want a washable, durable storage option backed by a Limited Lifetime warranty.",
    productUrl: "https://alliedmedical.co.nz/products/bodypoint-mobility-bag",
  },
  {
    id: "melrose-under-seat-netting",
    title: "Melrose Under-Seat Bag",
    description:
      "Durable under-seat storage with stiff bottom and front pocket for fixed frame wheelchairs.",
    image: "", // TODO: Add image URL
    tags: ["manual-wheelchair", "storage", "under-seat", "NZ"],
    category: "storage",
    whatItIs:
      "The Melrose Under-Seat Bag is designed specifically for fixed frame wheelchairs, constructed from durable close-weave polymer fabric that lasts for several years. It features one large compartment with a stiff bottom for structure, a front pocket with secure zips, and Velcro straps that wrap around the seat sling for a secure hold. Available in Small (up to 14\" wide chairs) and Fixed Frame (13.5\" wide) sizes.",
    whatItDoes:
      "This bag provides reliable under-seat cargo storage that stays securely attached via Velcro straps around your seat sling. The stiff bottom maintains the bag's shape even when loaded, while the tapered design (6\" deep front / 4.5\" rear in small model) maximizes storage without interfering with wheel clearance. Some models can remain attached even when folding your chair, making it convenient for transport and storage.",
    whoItsFor:
      "Perfect for fixed frame wheelchair users who need substantial under-seat storage for daily essentials, shopping, or longer outings. Ideal for those who want durable construction that won't sag or lose shape over time, and particularly beneficial for users who need storage that can stay attached during chair folding and transport.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/under_seat_netting_carry_all.html",
  },
  {
    id: "melrose-hanger-bag",
    title: "Melrose Front Hanger Bag",
    description:
      "Front-mounted bag for wheelchair hangers providing accessible storage for phones and small items.",
    image: "", // TODO: Add image URL
    tags: ["manual-wheelchair", "storage", "front-mount", "NZ"],
    category: "storage",
    whatItIs:
      "The Melrose Front Hanger Bag is a compact storage solution (9.5\" length, 5.5\" wide bottom, 2\" depth) that attaches to the front hangers of your wheelchair—the bar that runs from the seat rails to the footplate. Made from durable close-weave polymer fabric, it features one compartment with a soft bottom and secure zip closure, attached via Velcro straps around the seat rail and front hanger.",
    whatItDoes:
      "This bag provides easily accessible front storage that's perfect for items you need to grab frequently without reaching behind you. The front-mounted position keeps your phone, keys, wallet, or other small essentials within easy view and reach. The secure Velcro strap system ensures it stays firmly in place even over rough terrain or during active use.",
    whoItsFor:
      "Ideal for wheelchair users who want quick, convenient access to frequently used items without the need to reach behind or to the side. Perfect for those who need their phone readily accessible for navigation or communication, or anyone who prefers to keep essential items in their line of sight for security and convenience.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/hanger_bag.html",
  },
  {
    id: "melrose-back-bag-small",
    title: "Melrose Small Back Bag",
    description:
      "Compact back-mounted storage bag for essential items with durable construction.",
    image: "", // TODO: Add image URL
    tags: ["manual-wheelchair", "storage", "back-mount", "NZ"],
    category: "storage",
    whatItIs:
      "The Melrose Small Back Bag is a compact back-mounted storage solution made from durable close-weave polymer fabric designed for several years of use. It attaches securely to the back of your wheelchair using a Velcro strap attachment system, providing convenient storage without interfering with chair operation.",
    whatItDoes:
      "This bag offers discrete back-mounted storage for essential items you want to keep secure but don't need constant access to during wheeling. The compact size is ideal for items like a light jacket, extra supplies, or backup essentials. The durable construction ensures it withstands daily use while the Velcro attachment allows for easy installation and removal when needed.",
    whoItsFor:
      "Perfect for wheelchair users who want minimal back storage for essential items without the bulk of a larger bag. Ideal for those who carry just the basics or want a secondary storage option in addition to other bags. Particularly beneficial for users who value durability and want a simple, reliable storage solution.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/back_bag_small.html",
  },
  {
    id: "melrose-back-bag-large",
    title: "Melrose Large Back Bag",
    description:
      "Spacious back-mounted bag for groceries, travel items, and larger cargo needs.",
    image: "", // TODO: Add image URL
    tags: ["manual-wheelchair", "storage", "back-mount", "capacity", "NZ"],
    category: "storage",
    whatItIs:
      "The Melrose Large Back Bag is a substantial back-mounted storage solution offering significantly more capacity than the small version. Constructed from the same durable close-weave polymer fabric with Velcro strap attachment, it's designed to handle heavier loads and larger items while maintaining the durability expected from Melrose products.",
    whatItDoes:
      "This bag provides ample storage for groceries, travel necessities, extra clothing, or any larger cargo you need to transport. The increased capacity makes it practical for shopping trips, day outings, or travel where you need to bring more than just essentials. Despite its larger size, the secure Velcro attachment system keeps it stable even when fully loaded.",
    whoItsFor:
      "Ideal for wheelchair users who need substantial storage capacity for shopping, travel, or carrying larger items. Perfect for those who want to maintain independence during grocery shopping or errands, need to transport equipment or supplies for longer outings, or simply prefer having extra carrying capacity for peace of mind.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/back_bag_large.html",
  },
  {
    id: "melrose-bottle-holder",
    title: "Melrose Bottle Holder",
    description:
      "Dedicated single-compartment bottle holder for convenient beverage access during wheeling.",
    image: "", // TODO: Add image URL
    tags: ["manual-wheelchair", "storage", "hydration", "NZ"],
    category: "storage",
    whatItIs:
      "The Melrose Bottle Holder is a purpose-built single-compartment pouch with a reinforced 95mm diameter opening designed specifically for carrying water bottles or drinks. Made from durable close-weave polymer fabric, it attaches to the front of your wheelchair using a secure strap attachment system.",
    whatItDoes:
      "This holder keeps your beverage secure and accessible while wheeling, preventing spills and ensuring you can stay hydrated without stopping to retrieve a bottle from a bag. The reinforced opening maintains its shape for easy bottle insertion and removal with one hand, while the front-mounted position keeps your drink within easy reach throughout your day.",
    whoItsFor:
      "Essential for wheelchair users who need to stay hydrated during daily activities, outdoor excursions, or exercise. Particularly beneficial for those in warm climates or with medical conditions requiring regular hydration, anyone who struggles with accessing bottles from bags while wheeling, or users who simply want the convenience of always having their drink within easy reach.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/bottle_holder.html",
  },
];

/* ───────────────────────── Device Mounts & Holders ───────────────────────── */

export const DEVICE_MOUNTS: ManualWheelchairProduct[] = [
  {
    id: "ram-mounts",
    title: "Ram Mounts",
    description:
      "Mount virtually anything to your wheelchair for convenient, hands-free access to your phone or tablet. Wheelchair options include armrest and seat track mounting options, with various features such as quick disconnect and ease of adjustability.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/phone-mounts/RAM-Mount.webp", // TODO: Add image URL
    tags: ["manual-wheelchair", "device-mount", "phone", "NZ"],
    category: "device-mount",
    whatItIs:
      "Adjustable phone holders designed to attach securely to wheelchair armrests, providing a stable mount for smartphones of various sizes. Available through NZ Etsy sellers, these mounts typically feature adjustable clamps or straps that fit different armrest styles and phone dimensions.",
    whatItDoes:
      "This mount keeps your phone easily visible and accessible while wheeling, allowing hands-free viewing for navigation, communication, or entertainment. The adjustable design accommodates different phone sizes and armrest configurations, while the secure attachment prevents your device from falling during movement or transfers.",
    whoItsFor:
      "Ideal for wheelchair users who rely on their phones for GPS navigation, need hands-free access for calls or messages, or want to use their device for entertainment while wheeling. Particularly beneficial for those who struggle to retrieve phones from pockets or bags while seated, or anyone wanting to use navigation apps during outdoor mobility.",
    productUrl: "https://rammount.com/collections/accessibility-wheelchair-mounts?srsltid=AfmBOor2Lgia5OFs2c2EQt3c2Rfb0hQHThhpFrPRnMlywCRcp87fbkzp",
  },
  {
    id: "quokka-cupholder",
    title: "Quokka Cupholder",
    description:
      "Wheelchair-mounted cup holder attachment for the Quokka manual wheelchair, keeping drinks within easy reach.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/phone-mounts/Quokka-Cupholder.jpg",
    tags: ["manual-wheelchair", "device-mount", "cup-holder", "NZ", "brand:mobility-centre"],
    category: "device-mount",
    whatItIs:
      "A dedicated cup holder accessory designed to attach to the Quokka manual wheelchair. Sold by Mobility Centre, New Zealand's specialist mobility aid retailer.",
    whatItDoes:
      "Keeps your drink securely within reach while wheeling, so you can stay hydrated without needing to stop or ask for assistance. The holder mounts to the wheelchair frame and holds standard cup and bottle sizes.",
    whoItsFor:
      "Ideal for Quokka wheelchair users who want convenient, hands-free access to a drink during daily use or outings.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/wheelchairs/manual-wheelchairs/quokka-cupholder/",
  },
  {
    id: "quad-lock",
    title: "Quad Lock",
    description:
      "Australian brand making modular 360° phone mounting systems that can be configured to attach to wheelchair frames.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/phone-mounts/quadlock.webp",
    tags: ["manual-wheelchair", "device-mount", "phone", "AU"],
    category: "device-mount",
    whatItIs:
      "Quad Lock is an Australian company specialising in secure, modular phone mounting systems. Their Quad Lock 360™ range lets you mix and match heads, arms, and bases to build a custom mount suited to your wheelchair setup.",
    whatItDoes:
      "Locks your smartphone securely in place on your wheelchair so it stays visible and accessible hands-free. The twist-lock mechanism holds the phone firmly during movement, while the modular system lets you swap components for different use cases or chair configurations.",
    whoItsFor:
      "Great for wheelchair users who want a robust, customisable phone mount. Particularly useful for navigation, communication apps, or hands-free viewing during daily use or outdoor outings.",
    productUrl: "https://www.quadlockcase.com.au/",
  },
];

/* ───────────────────────── Wheelchair Gloves & Hand Protection ───────────────────────── */

export const WHEELCHAIR_GLOVES: ManualWheelchairProduct[] = [
  // ── RehaDesign ──
  {
    id: "rehadesign-ultra-grrrip",
    title: "RehaDesign Ultra-Grrrip Half-Finger Gloves",
    description:
      "Premium leather half-finger gloves with special grip material for exceptional control, even in wet conditions.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/ultra-grip.webp",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:rehadesign", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Premium quality leather half-finger wheelchair gloves engineered with special anti-slip grip material in the palm. Constructed with high-quality leather and stretch neoprene backing, featuring a soft textile inner lining that prevents dye transfer and keeps hands comfortable. The non-slip rubberized palm prevents grip loss even during involuntary hand motions.",
    whatItDoes:
      "These gloves provide exceptional pushrim traction and control while protecting your thumbs and palms with strategic padding. The specially engineered grip material maintains performance even in rain, while the open-finger design preserves unrestricted movement and tactile sensation. Machine or hand washable for easy care, they improve grip consistency and reduce the risk of blisters during manual propulsion.",
    whoItsFor:
      "Ideal for active wheelchair users, sports enthusiasts, and anyone needing superior pushrim traction in all weather conditions. Particularly beneficial for those who push in wet environments, experience grip inconsistency, or want to protect their hands while maintaining full finger dexterity. Available in sizes XS to XXL to fit different hand sizes.",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/ultra-grip-wheelchair-gloves-rdults",
  },
  {
    id: "rehadesign-4-seasons",
    title: "RehaDesign 4 Seasons Full-Finger Gloves",
    description:
      "Full-finger version with year-round protection and high-performance grip technology for all weather use.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/full-seasons.webp",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:rehadesign", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Full-finger wheelchair gloves featuring the same Ultra-Grrrip technology as the half-finger version but with complete hand coverage. Made from quality leather with stretch neoprene backing and soft inner lining, these gloves provide full-hand protection while maintaining excellent grip performance. The textured palm surface offers more grip fabric area than half-finger models.",
    whatItDoes:
      "These gloves deliver anti-slip palm performance for improved grip while protecting your entire hand from cold, abrasion, and weather exposure. The full-finger coverage provides warmth in colder months while remaining breathable in warmer weather, making them suitable for year-round use. Padded thumbs and palms reduce pressure points and blister risk, while the textured surface ensures consistent traction on pushrims.",
    whoItsFor:
      "Perfect for year-round wheelchair users who need full hand protection across all seasons, those pushing in cold climates, or anyone experiencing hand pain or skin sensitivity requiring complete coverage. Particularly beneficial for users who wheel outdoors frequently and need weather protection without sacrificing grip performance. Available in sizes Small (6.1-7.0 cm) to XX-Large (10.1-12 cm).",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/rehadesign-four-seasons-wheelchair-gloves",
  },
  {
    id: "rehadesign-gel-palm",
    title: "RehaDesign Gel-Palm Gloves",
    description:
      "Leather gloves with gel pad inserts for maximum comfort, impact protection, and hand pain relief.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/gel-palm.webp",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:rehadesign", "filter:palm-protection", "filter:pain-circulation"],
    category: "gloves",
    whatItIs:
      "Leather wheelchair gloves featuring gel pad inserts in the palm compartment for superior comfort and impact absorption. Made from quality soft leather with special non-slip fabric on the palm, these gloves include reflective piping on the back for nighttime visibility, finger loops for easy removal, and absorbent terry material backing. The bright orange or contrasting interior enhances visibility of the glove interior.",
    whatItDoes:
      "The gel padding helps protect your hands from the impact of hitting pushrims during propulsion, significantly reducing hand pain and fatigue. The gel inserts absorb shock and distribute pressure more evenly across your palms, while the special non-slip fabric ensures easier pushing despite the cushioning. The ultra-light gel-padded design maintains comfort without adding bulk, and the reflective piping improves safety during low-light wheeling.",
    whoItsFor:
      "Essential for wheelchair users experiencing hand pain, those needing impact protection from repeated pushrim contact, or anyone seeking maximum comfort for everyday wheeling. Particularly beneficial for users with sensitive hands, carpel tunnel symptoms, or conditions causing hand pain, as well as those who wheel at night and need visibility features.",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/rehadesign-gel-palm-wheelchair-gloves",
  },
  {
    id: "rehadesign-strap-n-roll",
    title: "RehaDesign Strap N Roll Gloves",
    description:
      "Fingerless gloves designed for quadriplegics with wide opening and simple strap closure for easy donning.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/strap-roll.webp",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:rehadesign", "filter:easy-on-off", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Specialized fingerless gloves designed specifically for quadriplegics/tetraplegics and people with limited hand mobility. Features a wide opening for easy hand insertion, no finger holes for unrestricted finger movement, and a simple strap closure system. Made from quality leather with special grip fabric built into the palm using a patented \"hinge\" design that divides the grip into two parts for natural closing around the pushrim.",
    whatItDoes:
      "These gloves provide exceptional ease of use for people with limited hand function, featuring a user-friendly mechanism that allows independent donning without assistance. The wide opening accommodates hands with limited dexterity, while the hinge-effect grip design naturally conforms to the pushrim shape for improved traction and performance. The textured rubbery palm material enhances grip even with limited hand strength or control.",
    whoItsFor:
      "Designed specifically for quadriplegics, tetraplegics, and wheelchair users with limited hand dexterity or grip strength who need maximum ease of application and removal. Ideal for those who want to maintain independence in putting on and taking off their gloves without caregiver assistance. Available in sizes XS through 2XL, with a children's version fitting ages 4-9.",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/rehadesign-strap-n-roll-wheelchair-gloves-rdsnrm",
  },
  {
    id: "rehadesign-gator",
    title: "RehaDesign Gator Gloves",
    description:
      "Fingerless gloves with extremely wide 'alligator mouth' opening for severely limited hand function.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/gator.avif",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:rehadesign", "filter:easy-on-off", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Fingerless gloves featuring an extremely wide opening that resembles an alligator's mouth, specifically designed for quadriplegics/tetraplegics and those with severely limited hand function. Constructed from high-quality leather with internal lining to prevent dye transfer, these gloves use hook-and-loop fasteners and feature dual textured grip pads on the palm with a hinge-like separation between them.",
    whatItDoes:
      "The ultra-wide opening allows easy hand insertion even with very limited mobility, enabling independent application and removal without assistance. The dual grip pads with hinge-like effect provide improved traction and control on pushrims despite limited hand function. The gloves become softer and more comfortable with use, while the fastener system ensures secure fit once in place. Enhanced comfort and functionality features make these among the most accessible wheelchair gloves available.",
    whoItsFor:
      "Essential for quadriplegics, tetraplegics, and wheelchair users with severely limited hand function who require maximum ease of donning and doffing. Perfect for those who struggle with conventional gloves due to limited finger movement or hand opening capability, or anyone who values complete independence in glove use without needing caregiver assistance. Available in sizes XS through 2XL.",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/rehadesign-gator-gloves",
  },
  {
    id: "compression-fingerless",
    title: "Compression Fingerless Gloves",
    description:
      "Lightweight slip-on compression gloves for pain relief and joint support during daily tasks.",
    image: "",
    tags: ["manual-wheelchair", "gloves", "NZ", "filter:pain-circulation"],
    category: "gloves",
    whatItIs:
      "Lightweight slip-on compression gloves made from a blend of cotton, nylon, and spandex. These gloves provide gentle compression therapy for hands while maintaining open fingertips for freedom of motion and tactile sensation. Not wheelchair-specific but suitable for wheelchair use, they feature a simple slip-on design with no closures.",
    whatItDoes:
      "These gloves relieve muscle pain, joint pain, stiffness, and soreness through gentle compression therapy. The soft and breathable fabric provides support while making daily tasks easier and more comfortable. The open fingertips preserve dexterity and touch sensitivity, allowing you to perform detailed tasks while receiving therapeutic compression for your hands and palms.",
    whoItsFor:
      "Ideal for wheelchair users with arthritis, general hand pain, joint stiffness, or those needing compression therapy while maintaining finger dexterity. Particularly beneficial for users who experience hand fatigue or discomfort but still need full finger function for tasks like operating phones, handling small items, or performing transfers. Suitable for anyone seeking pain relief without the bulk or grip features of traditional wheelchair gloves.",
    productUrl: "https://mobilitysolutionscentre.co.nz/products/compression-fingerless-gloves-small-liv-glovess",
  },

  // ── Melrose ──
  {
    id: "melrose-cat-gloves",
    title: "Melrose Cat Gloves",
    description: "Durable wheelchair gloves with palm protection and pushrim traction for everyday use.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/cat-gloves.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:traction", "filter:palm-protection"],
    category: "gloves",
    whatItIs:
      "The Melrose Cat Gloves are purpose-built wheelchair gloves offering durable palm protection and reliable pushrim grip for daily wheelchair use.",
    whatItDoes:
      "These gloves protect your palms from friction and abrasion while providing traction on pushrims, reducing fatigue and preventing blisters during regular wheeling.",
    whoItsFor:
      "Suitable for manual wheelchair users seeking durable everyday hand protection with dependable grip for pushrim propulsion.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-palm-suede",
    title: "Melrose Palm Gloves — Suede",
    description: "Suede palm gloves offering natural grip and comfortable hand protection for wheelchair users.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/palm-gloves-suede.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:palm-protection", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Suede-palm wheelchair gloves that use natural suede leather for a comfortable, breathable grip surface against pushrims.",
    whatItDoes:
      "The suede palm material provides natural friction for traction while cushioning the hand during propulsion, reducing blister risk and hand fatigue.",
    whoItsFor:
      "Manual wheelchair users who prefer a natural leather feel with good pushrim grip and palm protection.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-palm-twin-strap",
    title: "Melrose Palm Gloves — Twin Strap",
    description: "Palm protection gloves with twin strap closure for a secure, adjustable fit.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/palm-gloves-twin-strap.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:palm-protection", "filter:easy-on-off"],
    category: "gloves",
    whatItIs:
      "Wheelchair palm gloves featuring a twin strap hook-and-loop closure system for a secure and easily adjustable fit.",
    whatItDoes:
      "The dual strap design allows quick donning and doffing with one hand, while the palm protection reduces friction and abrasion from pushrim contact.",
    whoItsFor:
      "Wheelchair users who need palm protection with an easy, adjustable strap closure that can be applied and removed independently.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-palm-double-strap",
    title: "Melrose Palm Gloves — Double Strap",
    description: "Reinforced double strap gloves for a firm fit and reliable palm protection during propulsion.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/palm-gloves-double-strap.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:palm-protection", "filter:easy-on-off"],
    category: "gloves",
    whatItIs:
      "Wheelchair palm gloves with a reinforced double strap closure for a firmer, more secure fit than single-strap models.",
    whatItDoes:
      "The double strap closure keeps the glove firmly in place during active wheeling while protecting the palm from pushrim friction and impact.",
    whoItsFor:
      "Active wheelchair users who need a secure-fitting palm protection glove that won't shift during propulsion.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-palm-leather",
    title: "Melrose Palm Gloves — Leather",
    description: "Durable leather palm gloves for long-lasting grip and hand protection.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/palm-gloves-leather.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:palm-protection", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Full leather palm wheelchair gloves offering robust durability and reliable traction for everyday and demanding use.",
    whatItDoes:
      "The leather palm protects hands from abrasion and provides consistent grip on pushrims, developing a natural fit over time as the leather moulds to the hand.",
    whoItsFor:
      "Wheelchair users who want long-lasting, durable hand protection with reliable pushrim traction across a variety of conditions.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-high-wrist",
    title: "Melrose High Wrist Gloves",
    description: "Extended wrist coverage gloves for added wrist support and protection during wheelchair use.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/high-wrist-gloves.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:wrist-support", "filter:palm-protection"],
    category: "gloves",
    whatItIs:
      "Wheelchair gloves with an extended high-wrist design that covers and supports the wrist joint in addition to protecting the palm.",
    whatItDoes:
      "The high wrist cuff provides additional support and coverage, reducing wrist strain and protecting against abrasion during propulsion and transfers.",
    whoItsFor:
      "Wheelchair users with wrist pain, weakness, or injury, or anyone who wants additional wrist protection alongside standard palm coverage.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },
  {
    id: "melrose-e-gloves",
    title: "Melrose E Gloves",
    description: "Specialist wheelchair gloves designed for enhanced pushrim traction and hand protection.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/e-gloves.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:melrose", "filter:traction"],
    category: "gloves",
    whatItIs:
      "Melrose E Gloves are a specialist wheelchair glove model designed to provide enhanced pushrim grip and hand protection for manual wheelchair users.",
    whatItDoes:
      "These gloves improve traction on pushrims to reduce effort and improve propulsion efficiency, while protecting the palms from friction and impact.",
    whoItsFor:
      "Manual wheelchair users looking for a reliable, grip-focused glove from a trusted NZ wheelchair accessories brand.",
    productUrl: "https://melrosewheelchairs.co.nz/parts_accessories/gloves.html",
  },

  // ── Mobility Centre ──
  {
    id: "active-hand-relief-gloves",
    title: "Active Hand Relief Gloves",
    description: "Compression gloves for soothing hand pain and improving circulation during daily tasks.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/mob-center/Active_Gloves.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:mobility-centre", "filter:pain-circulation"],
    category: "gloves",
    whatItIs:
      "Active Hand Relief Gloves are therapeutic compression gloves designed to relieve hand pain and improve circulation for people with arthritis, neuropathy, or general hand discomfort.",
    whatItDoes:
      "The graduated compression gently reduces swelling and pain, improves blood flow, and provides warmth to stiff joints, making daily activities and wheelchair propulsion more comfortable.",
    whoItsFor:
      "Wheelchair users experiencing hand pain, arthritis, circulation issues, or hand fatigue who need gentle compression therapy throughout the day.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/daily-living-kitchen-aids/skin-hand-care/skin-care-products/active-hand-relief-gloves/",
  },
  {
    id: "arthritis-hand-relief-gloves",
    title: "Arthritis & Hand Relief Gloves",
    description: "Wrist-supporting compression gloves for arthritis pain relief and daily hand comfort.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/mob-center/ARTHRITIS-GLOVE-_V-BMI-A2017_.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:mobility-centre", "filter:pain-circulation", "filter:wrist-support"],
    category: "gloves",
    whatItIs:
      "Arthritis & Hand Relief Gloves combine compression therapy with light wrist support to address both hand joint pain and wrist discomfort from arthritis or repetitive strain.",
    whatItDoes:
      "These gloves apply therapeutic compression to reduce swelling and joint pain while the wrist panel provides mild stabilisation, helping users perform daily tasks and propel their wheelchair with less pain.",
    whoItsFor:
      "Manual wheelchair users with arthritis, rheumatic conditions, or wrist pain who need combined hand and wrist support for more comfortable everyday use.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/daily-living-kitchen-aids/skin-hand-care/gloves/arthritis-hand-relief-gloves/",
  },
  {
    id: "imak-smartglove-wrist-support",
    title: "IMAK SmartGlove Daytime Wrist Support",
    description: "Ergonomic wrist support glove with therapeutic cotton padding for daytime wear.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/mob-center/imak.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:mobility-centre", "filter:wrist-support", "filter:pain-circulation"],
    category: "gloves",
    whatItIs:
      "The IMAK SmartGlove is an ergonomic daytime wrist support that holds the wrist in a comfortable, slightly extended position to reduce carpal tunnel and repetitive strain symptoms.",
    whatItDoes:
      "The glove maintains a therapeutic wrist position during activity, reducing nerve compression and pain associated with carpal tunnel syndrome, while the open-finger design preserves full hand dexterity for wheeling and daily tasks.",
    whoItsFor:
      "Wheelchair users experiencing carpal tunnel symptoms, wrist pain from repetitive propulsion, or any condition causing wrist discomfort during daytime use.",
    productUrl: "https://www.mobilitycentre.co.nz/shop/daily-living-kitchen-aids/skin-hand-care/skin-care-products/imak-smart-glove-day-time-wrist-support/",
  },

  // ── Active Hands ──
  {
    id: "active-hands-outdoor-gripping-aids",
    title: "AH Outdoor Gripping Aids",
    description: "Gripping aids for wheelchair users with weak or limited hand function, designed for outdoor activity.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/ah/active-hands-outdoor.jpg",
    tags: ["manual-wheelchair", "gloves", "NZ", "brand:active-hands", "filter:easy-on-off"],
    category: "gloves",
    whatItIs:
      "Active Hands Outdoor Gripping Aids are specialist gripping aids — not traditional pushrim gloves — designed to help people with limited or absent hand function grip objects and wheelchair pushrims. Made from durable neoprene with a robust Velcro fastening system.",
    whatItDoes:
      "These aids strap securely to the hand and provide a gripping surface that compensates for weak or absent grip strength, enabling users to hold onto pushrims, tools, or sports equipment during outdoor activities.",
    whoItsFor:
      "People with tetraplegia, limited hand function, or absent grip strength who need an alternative to conventional gloves to participate in outdoor wheelchair activities or daily tasks requiring hand function.",
    productUrl: "https://www.c1south.co.nz/shop/active-hands/107-active-hands-outdoor.html",
  },
];

/* ───────────────────────── Wheelchair Glove Brands ───────────────────────── */

export const WHEELCHAIR_GLOVE_BRANDS: ManualWheelchairBrand[] = [
  {
    id: "rehadesign",
    title: "RehaDesign",
    description: "Grip + quad-friendly wheelchair gloves.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/reha/reha-design-logo.png",
  },
  {
    id: "melrose",
    title: "Melrose",
    description: "Durable palm & wrist protection gloves.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/melrose-logo-white-retina.png",
  },
  {
    id: "mobility-centre",
    title: "Mobility Centre",
    description: "Compression & wrist support gloves.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/mob-center/Mobility-Centre-Hozizontal-on-white-1536x512.jpg",
  },
  {
    id: "active-hands",
    title: "Active Hands",
    description: "Gripping aids for weak hand function.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/ah/activehandstwitter.jpg",
  },
];

/* ───────────────────────── Bags & Carry Brands ───────────────────────── */

export const BAGS_BRANDS: ManualWheelchairBrand[] = [
  {
    id: "melrose-bags",
    title: "Melrose",
    description: "Durable wheelchair bags designed to attach securely to your chair — under-seat, back, hanger, and bottle holders.",
    image: "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/assistive-tech/manual_%20wheelchair_%20tech/gloves/melrose/melrose-logo-white-retina.png",
    externalUrl: "https://melrosewheelchairs.co.nz/parts_accessories/bags.html",
  },
];

/* ───────────────────────── Optional Aggregate Export ───────────────────────── */

export const MANUAL_WHEELCHAIR_PRODUCTS: ManualWheelchairProduct[] = [
  ...POWER_ASSIST_WHEELS,
  ...HANDCYCLE_ATTACHMENTS,
  ...PROPULSION_AIDS,
  ...TRANSFER_AND_SETUP_AIDS,
  ...STORAGE_ACCESSORIES,
  ...DEVICE_MOUNTS,
  ...WHEELCHAIR_GLOVES,
];