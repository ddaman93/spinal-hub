import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "@/lib/navigationRef";

export const TOUR_SHOWN_KEY = "spinal_hub_spotlight_tour_shown";

export type Rect = { x: number; y: number; width: number; height: number };

export type TourStep = {
  id: string;
  tab: string;
  title: string;
  description: string;
  tooltipSide: "above" | "below";
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "assistive-tech",
    tab: "HomeTab",
    title: "Assistive Technology",
    description:
      'Browse the latest assistive tech for SCI. Tap "View all →" to explore the full catalog.',
    tooltipSide: "below",
  },
  {
    id: "wheelchairs",
    tab: "HomeTab",
    title: "Wheelchairs",
    description:
      'Compare manual, power, sports and airline wheelchairs with links to buy. Tap "View all →" to see all options.',
    tooltipSide: "below",
  },
  {
    id: "sci-news",
    tab: "HomeTab",
    title: "SCI News",
    description:
      'Stay up to date with the latest SCI research and breakthroughs from around the world. Tap "View all →" for more.',
    tooltipSide: "below",
  },
  {
    id: "clinical-trials",
    tab: "HomeTab",
    title: "Live Clinical Trials",
    description:
      'Active clinical trials recruiting SCI patients worldwide. Tap "View all →" to explore all studies.',
    tooltipSide: "below",
  },
  {
    id: "tools-grid",
    tab: "ToolsTab",
    title: "Health & Support Tools",
    description:
      "Tap any tile to access health trackers, pressure relief timers, medications, community chat, transport info and more.",
    tooltipSide: "above",
  },
];

type TourContextValue = {
  isActive: boolean;
  activeStepId: string | null;
  stepIndex: number;
  measurement: Rect | null;
  startTour: () => Promise<void>;
  nextStep: () => void;
  endTour: () => void;
  reportMeasurement: (rect: Rect) => void;
  registerScrollRef: (tab: string, ref: React.RefObject<ScrollView>) => void;
  getScrollRef: (tab: string) => React.RefObject<ScrollView> | undefined;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [measurement, setMeasurement] = useState<Rect | null>(null);
  const scrollRefs = useRef<Map<string, React.RefObject<ScrollView>>>(new Map());
  const stepIndexRef = useRef(0);

  const activateStep = useCallback((index: number) => {
    if (index >= TOUR_STEPS.length) {
      setIsActive(false);
      setActiveStepId(null);
      setMeasurement(null);
      return;
    }

    const step = TOUR_STEPS[index];
    stepIndexRef.current = index;
    setMeasurement(null);

    // Navigate to the correct tab
    if (navigationRef.isReady()) {
      try {
        (navigationRef as any).navigate(step.tab);
      } catch {}
    }

    // Wait for navigation + layout, then trigger TourTarget measurement
    setTimeout(() => {
      setStepIndex(index);
      setActiveStepId(step.id);
    }, 500);
  }, []);

  const startTour = useCallback(async () => {
    await AsyncStorage.setItem(TOUR_SHOWN_KEY, "true");
    setIsActive(true);
    activateStep(0);
  }, [activateStep]);

  const nextStep = useCallback(() => {
    activateStep(stepIndexRef.current + 1);
  }, [activateStep]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setActiveStepId(null);
    setMeasurement(null);
  }, []);

  const reportMeasurement = useCallback((rect: Rect) => {
    setMeasurement(rect);
  }, []);

  const registerScrollRef = useCallback(
    (tab: string, ref: React.RefObject<ScrollView>) => {
      scrollRefs.current.set(tab, ref);
    },
    []
  );

  const getScrollRef = useCallback((tab: string) => {
    return scrollRefs.current.get(tab);
  }, []);

  return (
    <TourContext.Provider
      value={{
        isActive,
        activeStepId,
        stepIndex,
        measurement,
        startTour,
        nextStep,
        endTour,
        reportMeasurement,
        registerScrollRef,
        getScrollRef,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}
