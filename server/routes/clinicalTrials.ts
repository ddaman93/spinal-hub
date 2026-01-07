import type { Request, Response } from "express";

export async function getClinicalTrials(req: Request, res: Response) {
  const condition =
    typeof req.query.condition === "string"
      ? req.query.condition
      : "spinal cord injury";

  const pageSize =
    typeof req.query.pageSize === "string" ? req.query.pageSize : "10";

  const url = new URL("https://clinicaltrials.gov/api/v2/studies");
  url.searchParams.set("query.cond", condition);
  url.searchParams.set("pageSize", pageSize);

  try {
    const r = await fetch(url.toString());
    if (!r.ok) {
      return res.status(502).json({
        message: "Upstream clinicaltrials.gov error",
        status: r.status,
      });
    }

    const data: any = await r.json();

    const studies = (data.studies ?? []).map((s: any) => {
      const id =
        s?.protocolSection?.identificationModule?.nctId ?? "unknown";
      const title =
        s?.protocolSection?.identificationModule?.briefTitle ??
        "Untitled trial";
      const status =
        s?.protocolSection?.statusModule?.overallStatus ?? "Unknown";

      return { id, title, status };
    });

    return res.json({
      source: "clinicaltrials.gov",
      condition,
      count: studies.length,
      studies,
    });
  } catch (err) {
    console.error("Clinical trials fetch failed:", err);
    return res
      .status(502)
      .json({ message: "Failed to fetch clinical trials" });
  }
}