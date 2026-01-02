import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "spinalhub_bookmarks";

type BookmarkMap = {
  assistiveTech: string[];
  clinicalTrials: string[];
};

const EMPTY: BookmarkMap = {
  assistiveTech: [],
  clinicalTrials: [],
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkMap>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setBookmarks(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  const persist = (next: BookmarkMap) => {
    setBookmarks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggle = useCallback(
    (type: keyof BookmarkMap, id: string) => {
      const exists = bookmarks[type].includes(id);
      const next = {
        ...bookmarks,
        [type]: exists
          ? bookmarks[type].filter((x) => x !== id)
          : [...bookmarks[type], id],
      };
      persist(next);
    },
    [bookmarks]
  );

  const isSaved = useCallback(
    (type: keyof BookmarkMap, id: string) =>
      bookmarks[type].includes(id),
    [bookmarks]
  );

  return { loaded, toggle, isSaved };
}