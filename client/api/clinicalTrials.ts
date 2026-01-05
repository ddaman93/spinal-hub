import { getApiBaseUrl } from "./baseUrl";

export async function fetchClinicalTrials(condition?: string) {
  const params = condition
    ? `?condition=${encodeURIComponent(condition)}`
    : "";

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/clinical-trials${params}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch clinical trials");
  }

  return res.json();
}