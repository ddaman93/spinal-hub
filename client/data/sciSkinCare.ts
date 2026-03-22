const R2 = "https://pub-f8dc6a60de674bf8972179fad120cdb9.r2.dev/skin-care";

export type SkinCareImage = { url: string; alt: string };

export const SKIN_CARE_IMAGES: Record<string, SkinCareImage> = {
  healthySkinDark:        { url: `${R2}/healthy-skin-dark.jpg`,         alt: "Healthy skin anatomy – dark pigment" },
  healthySkinLight:       { url: `${R2}/healthy-skin-light.jpg`,        alt: "Healthy skin anatomy – light pigment" },
  pressureAreas1:         { url: `${R2}/pressure-areas-1.png`,          alt: "Body areas susceptible to pressure injury (front)" },
  pressureAreas2:         { url: `${R2}/pressure-areas-2.png`,          alt: "Body areas susceptible to pressure injury (back)" },
  pressureAreas3:         { url: `${R2}/pressure-areas-3.png`,          alt: "Body areas susceptible to pressure injury (side)" },
  stage1Dark:             { url: `${R2}/stage-1-dark.jpg`,              alt: "Stage 1 pressure injury – dark pigment" },
  stage1Light:            { url: `${R2}/stage-1-light.jpg`,             alt: "Stage 1 pressure injury – light pigment" },
  stage2:                 { url: `${R2}/stage-2.jpg`,                   alt: "Stage 2 pressure injury" },
  stage3:                 { url: `${R2}/stage-3.jpg`,                   alt: "Stage 3 pressure injury" },
  stage3Epibole:          { url: `${R2}/stage-3-epibole.jpg`,           alt: "Stage 3 pressure injury with epibole" },
  stage4:                 { url: `${R2}/stage-4.jpg`,                   alt: "Stage 4 pressure injury" },
  unstageableNoSlough:    { url: `${R2}/unstageable-no-slough.jpg`,     alt: "Unstageable pressure injury – no slough" },
  unstageableHalfSlough:  { url: `${R2}/unstageable-half-slough.jpg`,   alt: "Unstageable pressure injury – partial slough" },
  deepTissue:             { url: `${R2}/deep-tissue.jpg`,               alt: "Deep tissue pressure injury" },
  blanchTest:             { url: `${R2}/blanch-test.jpg`,               alt: "Blanchable vs non-blanchable comparison" },
};

export type SkinCareSection = {
  id: string;
  title: string;
  color: string;
  intro?: string;
  bullets?: string[];
  subsections?: { title: string; body: string; images?: SkinCareImage[] }[];
  images?: SkinCareImage[];
  warning?: string;
  source?: string;
};

export const SKIN_CARE_SECTIONS: SkinCareSection[] = [
  {
    id: "overview",
    title: "Why Skin Care Matters After SCI",
    color: "#007AFF",
    intro:
      "Skin is the body's largest organ — it protects against infection, regulates temperature, and provides sensory feedback. After a spinal cord injury, reduced sensation and circulation mean problems can develop quickly and silently. Regular inspection and a consistent routine are essential.",
    bullets: [
      "Skin has two main layers: the epidermis (outer) and dermis (inner), which contains blood vessels, sweat glands, hair follicles, and nerve fibres",
      "Underlying fat and muscle cushion the skin against bony prominences",
      "After SCI, decreased collagen, reduced blood supply, and loss of sensation increase vulnerability significantly",
    ],
    images: [SKIN_CARE_IMAGES.healthySkinDark, SKIN_CARE_IMAGES.healthySkinLight],
  },

  {
    id: "sweating",
    title: "Sweating Changes",
    color: "#5856D6",
    intro:
      "Autonomic dysfunction after SCI disrupts the body's normal sweating response in two opposite ways:",
    subsections: [
      {
        title: "Hyperhidrosis (Excessive Sweating)",
        body: "Some people sweat excessively above the injury level as the nervous system compensates. This can cause skin maceration (softening from prolonged moisture) if not managed. Keep skin dry and change damp clothing promptly.",
      },
      {
        title: "Anhidrosis (Inability to Sweat Below Injury Level)",
        body: "Below the injury level, the body can no longer sweat, making it impossible to cool down normally. This significantly raises the risk of heat illness. Avoid prolonged heat exposure, use cooling vests, and stay hydrated.",
      },
    ],
  },

  {
    id: "friction",
    title: "Friction & Calluses",
    color: "#FF9500",
    subsections: [
      {
        title: "Friction Injury",
        body: "Dragging rather than lifting the body causes the epidermis and dermis to separate — similar to a 'rug burn'. Always lift rather than drag when transferring. Use transfer boards and slide sheets to minimise shear forces.",
      },
      {
        title: "Calluses",
        body: "Repeated friction creates dry, thickened patches of skin. While protective in small amounts, thick calluses can crack and become entry points for infection. Treat by soaking the area with warm water, then gently buffing with a towel or washcloth. Do not cut calluses without medical guidance.",
      },
    ],
  },

  {
    id: "pressure-injury",
    title: "Pressure Injuries",
    color: "#FF3B30",
    intro:
      "Pressure injuries (also called pressure sores or bedsores) are the most serious skin complication after SCI. They affect 25–66% of people with SCI and cost an average of $70,000 per full-thickness wound to treat. They develop when sustained pressure cuts off blood flow to skin over a bony prominence.",
    warning: "A full-thickness pressure injury can take months to heal and may require surgery. Sepsis (life-threatening infection) is a real risk — seek emergency care for signs of systemic infection.",
    images: [SKIN_CARE_IMAGES.pressureAreas1, SKIN_CARE_IMAGES.pressureAreas2, SKIN_CARE_IMAGES.pressureAreas3],
    subsections: [
      {
        title: "Stage 1 — Intact Skin",
        body: "The skin is intact but shows a localised area of non-blanchable redness (or blue/purple discolouration in darker skin tones). The area may feel warm, firm, or tender. Act immediately — this is your warning sign.",
        images: [SKIN_CARE_IMAGES.stage1Dark, SKIN_CARE_IMAGES.stage1Light],
      },
      {
        title: "Stage 2 — Partial Thickness",
        body: "A shallow open wound or intact/ruptured blister. The wound bed is pink or red and moist. At this stage the dermis is exposed. Keep the area offloaded, clean, and covered with an appropriate dressing.",
        images: [SKIN_CARE_IMAGES.stage2],
      },
      {
        title: "Stage 3 — Full Thickness Skin Loss",
        body: "The wound extends into the fat layer, appearing as a crater. Slough (yellow/tan tissue) may be present. Bone, tendon, and muscle are not yet visible. Requires professional wound care.",
        images: [SKIN_CARE_IMAGES.stage3, SKIN_CARE_IMAGES.stage3Epibole],
      },
      {
        title: "Stage 4 — Full Thickness Tissue Loss",
        body: "The deepest category — bone, tendon, or muscle is exposed or directly palpable. Osteomyelitis (bone infection) is a significant risk. Surgical closure is often required.",
        images: [SKIN_CARE_IMAGES.stage4],
      },
      {
        title: "Unstageable",
        body: "The wound base is obscured by dead tissue (eschar) or slough, making it impossible to determine actual depth. Do not attempt to remove eschar without medical guidance — debridement should only be done by a wound care professional.",
        images: [SKIN_CARE_IMAGES.unstageableNoSlough, SKIN_CARE_IMAGES.unstageableHalfSlough],
      },
      {
        title: "Deep Tissue Pressure Injury",
        body: "Appears as a deep red, maroon, or purple area of intact skin, or a blood-filled blister. Damage to underlying muscle and fat may be more extensive than it appears on the surface. Can rapidly progress to a Stage 3 or 4 wound.",
        images: [SKIN_CARE_IMAGES.deepTissue],
      },
    ],
  },

  {
    id: "assessment",
    title: "Assessing a Pressure Injury",
    color: "#34C759",
    intro: "Healthcare teams use several methods to assess pressure injury severity:",
    bullets: [
      "Physical examination — visual inspection and palpation of the wound and surrounding skin",
      "Blood tests — to check for infection markers and nutritional status (low albumin slows healing)",
      "CT or MRI — to assess wound depth and check for bone involvement",
      "Blanch test — pressing on reddened skin for 3 seconds: if colour returns quickly, blood flow is intact (blanchable). If colour does not return, blood vessels may be damaged (non-blanchable = more serious)",
    ],
    images: [SKIN_CARE_IMAGES.blanchTest],
  },

  {
    id: "treatment",
    title: "Treatment Options",
    color: "#AF52DE",
    intro: "Treatment depends on wound stage. Offloading pressure is non-negotiable for all stages.",
    subsections: [
      {
        title: "Offloading",
        body: "Completely removing pressure from the wound is the single most important step. No dressing will work if pressure continues. Repositioning schedules, specialist mattresses, and cushion changes are essential.",
      },
      {
        title: "Wound Dressings",
        body: "A wound care nurse will select dressings based on wound depth, moisture level, and infection status. Never use non-prescribed products or home remedies on open wounds.",
      },
      {
        title: "Debridement",
        body: "Removal of dead tissue to allow healing. Methods include sharp (surgical), chemical, enzymatic, or autolytic (moisture-based). Only performed by trained wound care professionals.",
      },
      {
        title: "Negative Pressure Wound Therapy (NPWT)",
        body: "A foam dressing sealed with film and connected to a vacuum device. Draws fluid from the wound, reduces swelling, and promotes granulation (new tissue growth). Commonly used for Stage 3–4 wounds.",
      },
      {
        title: "Electrical Stimulation",
        body: "Low-level electrical current applied to wound edges to stimulate cell growth. Used for non-healing Stage 3–4 wounds that haven't responded to other treatments.",
      },
      {
        title: "Surgical Closure",
        body: "For deep or large wounds, surgical flap reconstruction may be needed. A plastic surgeon rotates nearby muscle and skin to cover the wound. Requires strict offloading post-operatively.",
      },
    ],
  },

  {
    id: "prevention",
    title: "Daily Prevention Strategies",
    color: "#1C7ED6",
    intro: "Most pressure injuries are preventable. Building these habits into every day dramatically reduces risk:",
    bullets: [
      "Inspect your skin twice daily — use a mirror or ask someone to check areas you can't see",
      "Perform pressure reliefs every 15–30 minutes when sitting (lean forward, side-to-side, or push-up for at least 60 seconds)",
      "Use a pressure-relieving cushion suited to your body and wheelchair — get a pressure mapping assessment",
      "Keep skin clean and dry — bathe with mild soap, top to bottom",
      "Moisturise with an emollient lotion to prevent cracking — especially heels and bony areas",
      "Stay well hydrated — water maintains skin elasticity and supports healing",
      "Eat enough protein, vitamins C and A, and zinc — all critical for skin integrity",
      "Always lift when transferring — never drag across surfaces",
      "Keep bedding and clothing wrinkle-free — even a small crease causes pressure",
      "Ensure proper wheelchair fit and seating alignment",
      "Quit smoking — smoking reduces blood flow to the skin significantly",
      "Maintain a healthy weight — excess weight increases pressure on bony prominences",
    ],
  },

  {
    id: "recovery",
    title: "Recovering from a Pressure Injury",
    color: "#FF6B6B",
    intro:
      "Healed pressure injury skin is scar tissue — it lacks the elasticity and strength of original skin and will always be more vulnerable to re-injury.",
    bullets: [
      "After healing, gradually reintroduce pressure over weeks — start with just 5 minutes on the area, then 2 hours completely off it",
      "Increase sitting or lying time in small increments, checking skin after each session",
      "Never rush return to full activity — a healed wound can break down again in hours",
      "Physiotherapy and range-of-motion exercises help maintain circulation and tissue health",
      "Work with your rehabilitation team to update your pressure relief routine",
    ],
  },

  {
    id: "common-conditions",
    title: "Other Common Skin Conditions",
    color: "#00BCD4",
    intro: "People with paralysis are also more susceptible to a range of other skin conditions:",
    bullets: [
      "Acne and folliculitis — inflammation of hair follicles, common where clothing or equipment rubs",
      "Athlete's foot (tinea pedis) — fungal infection; inspect feet daily and keep dry",
      "Atopic dermatitis — chronic eczema; manage with emollients and avoid triggers",
      "Contact dermatitis — allergic or irritant reaction to equipment materials (latex, adhesives)",
      "Diaper rash / incontinence dermatitis — moisture and chemical irritation from urine or faeces; use barrier creams",
      "Sunburn — reduced or absent sensation means burns can occur without warning; use SPF50+ and cover exposed skin",
      "Herpes zoster (shingles) — painful blistering rash along a nerve path; seek treatment early",
    ],
  },

  {
    id: "team",
    title: "Your Skin Care Team",
    color: "#6B4FA2",
    intro: "Skin care after SCI is a team effort. Key members include:",
    bullets: [
      "Physiatrist — leads your rehabilitation medical team",
      "Wound care nurse or wound care physician — specialist assessment and dressing management",
      "Plastic surgeon — for surgical wound closure when needed",
      "Physical therapist — positioning, pressure relief techniques, and range-of-motion exercises",
      "Dietician — nutritional support to optimise healing",
      "Psychologist — emotional impact of wound management and body image",
      "Equipment / seating specialist — cushion selection and pressure mapping",
    ],
    source: "Content informed by the Christopher & Dana Reeve Foundation Skin Care resource. Source: christopherreeve.org",
  },
];
