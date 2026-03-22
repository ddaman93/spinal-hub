import React, { createContext, useContext, useRef } from "react";
import { Animated } from "react-native";

type HeaderScrollContextType = {
  scrollY: Animated.Value;
};

const HeaderScrollContext = createContext<HeaderScrollContextType>({
  scrollY: new Animated.Value(0),
});

export function HeaderScrollProvider({ children }: { children: React.ReactNode }) {
  // A single animated value for the whole app. Each screen resets it to 0
  // when it gains focus, so it always reflects the active screen's scroll.
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <HeaderScrollContext.Provider value={{ scrollY }}>
      {children}
    </HeaderScrollContext.Provider>
  );
}

export function useHeaderScroll() {
  return useContext(HeaderScrollContext);
}
