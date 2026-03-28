import React, { useRef, useEffect, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useTour } from "@/context/TourContext";

type Props = {
  stepId: string;
  scrollRef?: React.RefObject<ScrollView>;
  children: React.ReactNode;
};

/**
 * Wrap any element with TourTarget to make it a spotlight stop.
 * When its step becomes active it scrolls into view, measures its
 * window position, and reports it to the SpotlightOverlay.
 */
export function TourTarget({ stepId, scrollRef, children }: Props) {
  const { activeStepId, reportMeasurement } = useTour();
  const viewRef = useRef<View>(null);
  const layoutYRef = useRef(0);

  const handleLayout = useCallback((e: any) => {
    layoutYRef.current = e.nativeEvent.layout.y;
  }, []);

  useEffect(() => {
    if (activeStepId !== stepId) return;

    const measure = () => {
      viewRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          reportMeasurement({ x, y, width, height });
        }
      });
    };

    if (scrollRef?.current && layoutYRef.current > 0) {
      // Scroll so the element is visible with breathing room at the top
      scrollRef.current.scrollTo({
        y: Math.max(0, layoutYRef.current - 130),
        animated: true,
      });
      // Wait for scroll animation to finish, then measure
      setTimeout(measure, 420);
    } else {
      setTimeout(measure, 300);
    }
  }, [activeStepId, stepId, scrollRef, reportMeasurement]);

  return (
    <View ref={viewRef} onLayout={handleLayout}>
      {children}
    </View>
  );
}
