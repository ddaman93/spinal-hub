import type { Request, Response } from "express";

export async function getClinicalTrials(req: Request, res: Response) {
  const condition = req.query.condition ?? "spinal cord injury";

  const url = new URL("https://clinicaltrials.gov/api/v2/studies");
  url.searchParams.set("query.term", String(condition));
  url.searchParams.set("pageSize", "10");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      source: "clinicaltrials.gov",
      condition,
      count: data.studies?.length ?? 0,
      studies: data.studies,
    });
  } catch (error) {
    console.error("Clinical trials fetch failed:", error);
    res.status(502).json({
      message: "Failed to fetch clinical trials data",
    });
  }
}