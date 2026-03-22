import type { Request, Response } from "express";

export interface NormalizedTrial {
  id: string;
  title: string;
  status: string;
  phase?: string;
  summary?: string;
  countries: string[];
  source: "clinicaltrials.gov";
  url: string;
  sponsor?: string;
  eligibilityText?: string;
}

// CTG query.cond supports Essie OR syntax — one request covers all conditions
const CONDITION_QUERY =
  "spinal cord injury OR spinal cord injuries OR tetraplegia OR quadriplegia OR paraplegia OR spinal cord diseases OR myelopathy";

async function fetchCTG(
  pageSize: number,
  locationFilter?: string,
): Promise<NormalizedTrial[]> {
  const url = new URL("https://clinicaltrials.gov/api/v2/studies");
  url.searchParams.set("query.cond", CONDITION_QUERY);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("sort", "LastUpdatePostDate:desc");
  if (locationFilter) {
    url.searchParams.set("query.locn", locationFilter);
  }

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`CTG error ${r.status}`);
  const data: any = await r.json();

  return (data.studies ?? []).map((s: any) => {
    const p = s.protocolSection;
    const locations: any[] = p.contactsLocationsModule?.locations ?? [];
    const countries = [
      ...new Set(locations.map((l: any) => l.country).filter(Boolean)),
    ] as string[];

    return {
      id: p.identificationModule.nctId,
      title: p.identificationModule.briefTitle ?? "Untitled trial",
      status: p.statusModule.overallStatus ?? "Unknown",
      phase: p.designModule?.phases?.[0],
      summary: p.descriptionModule?.briefSummary,
      countries,
      source: "clinicaltrials.gov" as const,
      url: `https://clinicaltrials.gov/study/${p.identificationModule.nctId}`,
      sponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name,
      eligibilityText: p.eligibilityModule?.eligibilityCriteria,
    };
  });
}

export async function getClinicalTrials(_req: Request, res: Response) {
  try {
    const [globalResult, auResult, nzResult] = await Promise.allSettled([
      fetchCTG(1000),
      fetchCTG(200, "Australia"),
      fetchCTG(200, "New Zealand"),
    ]);

    if (
      globalResult.status === "rejected" &&
      auResult.status === "rejected" &&
      nzResult.status === "rejected"
    ) {
      console.error("All CTG fetches failed:", globalResult.reason);
      return res.status(502).json({ message: "Failed to fetch clinical trials" });
    }

    const seen = new Set<string>();
    const trials: NormalizedTrial[] = [];

    for (const result of [globalResult, auResult, nzResult]) {
      if (result.status !== "fulfilled") continue;
      for (const trial of result.value) {
        if (!seen.has(trial.id)) {
          seen.add(trial.id);
          trials.push(trial);
        }
      }
    }

    return res.json({ count: trials.length, trials });
  } catch (err) {
    console.error("Clinical trials fetch failed:", err);
    return res.status(502).json({ message: "Failed to fetch clinical trials" });
  }
}
