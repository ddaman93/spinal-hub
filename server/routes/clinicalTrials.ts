import { Router } from "express";

const router = Router();

/**
 * GET /api/clinical-trials
 * Proxy for ClinicalTrials.gov
 */
router.get("/clinical-trials", async (_req, res) => {
  try {
    const url =
      "https://clinicaltrials.gov/api/v2/studies" +
      "?query.term=spinal%20cord%20injury" +
      "&pageSize=10" +
      "&fields=protocolSection.identificationModule.nctId," +
      "protocolSection.identificationModule.briefTitle," +
      "protocolSection.statusModule.overallStatus," +
      "protocolSection.conditionsModule.conditions";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `ClinicalTrials.gov error: ${response.status}`
      );
    }

    const data = await response.json();

    res.json({
      source: "clinicaltrials.gov",
      fetchedAt: new Date().toISOString(),
      results: data.studies ?? [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch clinical trials",
    });
  }
});

export default router;