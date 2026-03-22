import { ImageSource } from "expo-image";

export type WheelchairCategory = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string | ImageSource;
};

export const WHEELCHAIR_CATEGORIES: WheelchairCategory[] = [
  {
    id: "manual-wheelchairs",
    title: "Manual Wheelchairs",
    subtitle: "Lightweight, rigid, folding options",
    description:
      "Manual wheelchairs designed for everyday use, including ultralight rigid frames, folding chairs, and active lifestyle models.",
    image: "https://melrosewheelchairs.co.nz/images/wheelchairs/slider/slider-hawk10.jpg",
  },
  {
    id: "power-wheelchairs",
    title: "Power Wheelchairs",
    subtitle: "Electric mobility, advanced features",
    description:
      "Powered mobility solutions with customizable seating, control systems, and advanced features for independence and comfort.",
    image: "https://permobilwebcdn.azureedge.net/media/aryo4bma/permobil_m1_isoleft.png",
  },
  {
    id: "sports-wheelchairs",
    title: "Sports Wheelchairs",
    subtitle: "Basketball, tennis, racing, adaptive sports",
    description:
      "Specialized wheelchairs designed for athletic performance in basketball, tennis, racing, rugby, and other adaptive sports.",
    image: "https://melrosewheelchairs.co.nz/images/wheelchairs/slider/slider-torpedo1.jpg",
  },
  {
    id: "specialty-chairs",
    title: "Specialty Chairs",
    subtitle: "Standing, beach, all-terrain models",
    description:
      "Specialized wheelchairs including standing frames, beach wheelchairs, all-terrain models, and chairs for specific medical needs.",
    image: "https://melrosewheelchairs.co.nz/images/wheelchairs/slider/slider-beach1.jpg",
  },
  {
    id: "airline-chairs",
    title: "Airline Chairs",
    subtitle: "Travel-friendly, FAA compliant, portable",
    description:
      "Lightweight, compact wheelchairs designed for air travel with FAA-compliant batteries and easy folding for aircraft storage.",
    image: "https://melrosewheelchairs.co.nz/images/wheelchairs/slider/slider-aisle1.jpg",
  },
];
