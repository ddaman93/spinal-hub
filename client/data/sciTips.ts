export type SciTip = {
  text: string;
  category: string;
};

export const SCI_TIPS: SciTip[] = [
  // Pressure care
  { category: "Pressure Care", text: "Perform a pressure relief every 15–30 minutes when seated. Even a 30-second lean or lift significantly reduces ischial pressure." },
  { category: "Pressure Care", text: "Check your skin every morning and night using a mirror or ask your carer. Redness that doesn't fade within 30 minutes is an early pressure injury." },
  { category: "Pressure Care", text: "Shift your weight regularly when in bed too — not just in your chair. Repositioning every 2–4 hours at night reduces sacral and heel risk." },
  { category: "Pressure Care", text: "Keep your cushion cover clean and dry. Moisture from sweat or spills dramatically increases pressure injury risk on bony prominences." },
  { category: "Pressure Care", text: "Your cushion has a lifespan. Most foam and gel cushions need replacing every 1–2 years — a worn cushion offers far less protection than it looks." },
  { category: "Pressure Care", text: "Sitting posture affects pressure distribution. A forward pelvic tilt or slouch can shift load onto the coccyx instead of spreading it across the ischials." },
  { category: "Pressure Care", text: "During transfers, avoid dragging across surfaces. Shear force tears skin capillaries beneath the surface before any visible wound appears." },

  // Hydration
  { category: "Hydration", text: "Aim for 1.5–2 litres of fluid daily. Adequate hydration reduces UTI risk, keeps mucus thin for easier airway clearance, and supports bowel motility." },
  { category: "Hydration", text: "Dark yellow urine is a warning sign. Pale straw colour indicates good hydration — monitor this as a simple daily health check." },
  { category: "Hydration", text: "Herbal teas and water-rich foods count toward your daily fluid intake. Watermelon, cucumber, and broth all contribute meaningfully." },
  { category: "Hydration", text: "Caffeine and alcohol are diuretics — they increase urine output. If you drink either, offset with extra water to stay in balance." },
  { category: "Hydration", text: "If you self-catheterise, hydration directly affects catheterisation frequency and UTI risk. Consistent fluid intake keeps volumes predictable." },

  // Bladder & UTI prevention
  { category: "Bladder Health", text: "Signs of a UTI include cloudy or smelly urine, increased spasticity, fever, or feeling generally unwell. Don't wait — contact your GP or SCI nurse early." },
  { category: "Bladder Health", text: "If you use an indwelling catheter, check the drainage bag position is always below bladder level to prevent backflow and infection." },
  { category: "Bladder Health", text: "Cranberry extract (as supplement, not juice) has some evidence for reducing UTI frequency in SCI. Ask your nurse if it's appropriate for you." },
  { category: "Bladder Health", text: "Keep catheter supplies clean and dry. Store them away from direct sunlight and humidity to maintain sterility." },

  // Bowel health
  { category: "Bowel Health", text: "Consistency is everything in bowel management. Same time, same position, same routine — your bowel responds best to predictability." },
  { category: "Bowel Health", text: "Upright positioning with feet supported activates gravity and pelvic floor mechanics. Even partial upright positioning improves bowel emptying." },
  { category: "Bowel Health", text: "Warm drinks in the morning — especially coffee or warm water — stimulate the gastrocolic reflex and can help trigger bowel activity." },
  { category: "Bowel Health", text: "Fibre intake matters. Aim for 25–35g daily from fruits, vegetables, and wholegrains. Sudden increases can cause bloating — build up gradually." },
  { category: "Bowel Health", text: "Track your bowel programme outcomes over time. Changes in consistency, frequency, or difficulty can be early signs of a dietary or medical issue." },

  // Respiratory
  { category: "Respiratory", text: "For cervical and high thoracic injuries, respiratory muscle weakness is real. Deep breathing exercises and breath stacking daily help maintain lung capacity." },
  { category: "Respiratory", text: "Assisted coughing techniques (manual or mechanical insufflation-exsufflation) reduce pneumonia risk significantly. Work with your physio to learn your best technique." },
  { category: "Respiratory", text: "Stay up to date with flu and pneumococcal vaccinations. Respiratory infections are one of the leading causes of hospitalisation after SCI." },
  { category: "Respiratory", text: "Postural drainage — lying in positions that use gravity to clear secretions — can be done at home with instruction from a respiratory physiotherapist." },

  // Spasticity
  { category: "Spasticity", text: "Spasticity often has a trigger. Pain, infection, pressure injury, full bowel or bladder, or tight clothing can all cause sudden increases. Check these first." },
  { category: "Spasticity", text: "Regular stretching — even if passive — reduces baseline spasticity and helps maintain joint range of motion. Consistency matters more than duration." },
  { category: "Spasticity", text: "Temperature affects spasticity. Cold environments often increase tone. Warm showers or heated rooms can offer temporary relief." },
  { category: "Spasticity", text: "Spasticity isn't always bad — some people use extensor tone to assist with transfers or standing. Discuss with your physio before eliminating it entirely." },

  // Mental health
  { category: "Mental Health", text: "Depression affects up to 30% of people with SCI. If you're feeling persistently low, hopeless, or withdrawn, please talk to your GP or SCI team — it's treatable." },
  { category: "Mental Health", text: "Peer support is one of the most powerful tools after SCI. Connecting with someone who has lived experience can shift your perspective in ways clinical care cannot." },
  { category: "Mental Health", text: "Setting small, achievable goals helps rebuild a sense of agency and progress. They don't need to be rehabilitation goals — anything meaningful counts." },
  { category: "Mental Health", text: "Sleep quality directly affects mood, pain, spasticity, and cognition. If you're sleeping poorly, raise it with your SCI nurse — many causes are treatable." },
  { category: "Mental Health", text: "Grief after SCI is normal and may come in waves over years, not just in the acute phase. You don't need to 'be over it' on anyone else's timeline." },

  // Pain
  { category: "Pain Management", text: "Neuropathic pain (burning, stabbing, electric sensations) is common after SCI. It often responds to specific medications — talk to your doctor if it's affecting your life." },
  { category: "Pain Management", text: "Keeping a pain diary (time, intensity, triggers, what helped) gives your medical team far more useful information than a verbal summary." },
  { category: "Pain Management", text: "Heat and cold therapy can relieve musculoskeletal pain above the level of injury. Be cautious below — impaired sensation means burn risk is real." },
  { category: "Pain Management", text: "Overuse injuries of the shoulders are very common in manual wheelchair users. Protect your rotator cuffs — they are your most important joints." },

  // Nutrition
  { category: "Nutrition", text: "Caloric needs after SCI are typically lower than pre-injury due to reduced muscle mass and activity. Weight gain increases pressure injury risk and reduces independence." },
  { category: "Nutrition", text: "Protein is essential for tissue repair and pressure injury prevention. Aim for 1.2–1.5g per kg of body weight daily, especially if recovering from a wound." },
  { category: "Nutrition", text: "Zinc, Vitamin C, and Vitamin D all support skin integrity and immune function. Ask your doctor if supplementation is appropriate for you." },
  { category: "Nutrition", text: "Constipation is often linked to low fibre, low fluid, or opioid medications. Addressing diet before escalating laxatives is usually the right first step." },

  // Exercise & fitness
  { category: "Fitness", text: "Exercise after SCI has proven benefits for cardiovascular health, spasticity, mood, and bone density. Even 20 minutes of functional electrical stimulation cycling counts." },
  { category: "Fitness", text: "Upper body strength directly affects transfer safety, pressure relief ability, and long-term independence. Resistance training is investment in your future self." },
  { category: "Fitness", text: "Aquatic therapy reduces the effect of gravity on spastic muscles and allows movement that may be difficult on land. Many SCI centres offer hydrotherapy." },
  { category: "Fitness", text: "Hand cycling, wheelchair sports, and adaptive gym equipment are all accessible options. Your SCI team or local disability sport organisation can connect you to programmes." },

  // Assistive technology
  { category: "Assistive Tech", text: "Power assist wheels like the SmartDrive can dramatically reduce shoulder strain for manual wheelchair users. Ask your OT if you're eligible through your funder." },
  { category: "Assistive Tech", text: "Eye-gaze and head-tracking technology has advanced significantly. If hand control is limited, a current assessment may reveal options that weren't available at your last review." },
  { category: "Assistive Tech", text: "Smart home automation — voice-controlled lights, locks, and appliances — can restore significant independence for high-level injuries. Many are now affordable off-the-shelf." },
  { category: "Assistive Tech", text: "Environmental control units (ECUs) can integrate phone, TV, bed controls, and doors into a single interface. Ask your OT for a technology assessment." },

  // Wheelchair maintenance
  { category: "Equipment", text: "Check your tyre pressure weekly. Low pressure increases rolling resistance, causes fatigue, and changes your sitting position in ways that affect pressure distribution." },
  { category: "Equipment", text: "Inspect your wheelchair frame, footrests, and anti-tippers monthly for cracks, loose bolts, or wear. Catching issues early prevents failures at the worst moment." },
  { category: "Equipment", text: "Keep a small repair kit at home — tyre levers, a pump, spare inner tube, and allen keys. Many common wheelchair issues can be fixed without a technician." },

  // Independence & community
  { category: "Independence", text: "Know your funding entitlements. ACC, MOH, and disability organisations each have different funding streams — an experienced SCI social worker can map what you're eligible for." },
  { category: "Independence", text: "Accessible travel is more possible than you might think. The SCI community online is full of first-hand route knowledge for destinations worldwide." },
  { category: "Independence", text: "Advocate for your needs in medical appointments. You are the expert on your own body — if something feels wrong, push for answers." },
  { category: "Independence", text: "Driving after SCI is often possible with hand controls or other adaptations. A driving assessment through a specialist rehab service can open up significant independence." },
];

export function getTodaysTip(): SciTip {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return SCI_TIPS[dayOfYear % SCI_TIPS.length];
}
