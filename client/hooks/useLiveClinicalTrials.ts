import { useQuery } from "@tanstack/react-query";

export function useLiveClinicalTrials() {
  return useQuery({
    queryKey: ["live-clinical-trials"],
    queryFn: async () => {
      const res = await fetch("/api/clinical-trials");
      if (!res.ok) {
        throw new Error("Failed to fetch trials");
      }
      return res.json();
    },
  });
}