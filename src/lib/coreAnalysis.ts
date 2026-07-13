export type Verdict = "GO" | "NO-GO" | "CONDITIONAL";

export const MIN_POLYGON_AREA_SQM = 100;

export function isValidPolygonArea(areaSqm: number): boolean {
  return Number.isFinite(areaSqm) && areaSqm >= MIN_POLYGON_AREA_SQM;
}

export function calculateScenarioVerdict(roiPercent: number): Verdict {
  if (roiPercent >= 15) return "GO";
  if (roiPercent >= 10) return "CONDITIONAL";
  return "NO-GO";
}

export function extractVerdictFromDecision(decision: string): Verdict {
  const lower = decision.toLowerCase();

  if (
    lower.includes("go verdict") ||
    lower.includes("go -") ||
    lower.includes("recommend go")
  ) {
    return "GO";
  }

  if (lower.includes("no-go") || lower.includes("reject")) {
    return "NO-GO";
  }

  if (lower.includes("conditional")) {
    return "CONDITIONAL";
  }

  if (
    lower.includes("exceeds") ||
    lower.includes("strong roi") ||
    lower.includes("viable")
  ) {
    return "GO";
  }

  return "CONDITIONAL";
}

type LegalEnvelopeInput = {
  siteAreaSqm: number;
  far?: number | null;
  lotCoverageMax?: number | null;
};

export function calculateLegalEnvelope({
  siteAreaSqm,
  far = 0.5,
  lotCoverageMax = 40,
}: LegalEnvelopeInput) {
  const safeFar = far ?? 0.5;
  const safeLotCoverageMax = lotCoverageMax ?? 40;

  const maxBuildableAreaSqm = siteAreaSqm * safeFar;
  const maxFootprintSqm = siteAreaSqm * (safeLotCoverageMax / 100);

  return {
    maxBuildableAreaSqm: Math.round(maxBuildableAreaSqm),
    maxFootprintSqm: Math.round(maxFootprintSqm),
    effectiveBuildableFloors:
      maxFootprintSqm > 0 ? Math.floor(maxBuildableAreaSqm / maxFootprintSqm) : 0,
  };
}

export type ProvenanceFact = {
  label: string;
  value: string | number;
  source: string;
  effectiveDate: string;
};

export function hasCompleteProvenance(fact: ProvenanceFact): boolean {
  return (
    fact.label.trim().length > 0 &&
    String(fact.value).trim().length > 0 &&
    fact.source.trim().length > 0 &&
    fact.effectiveDate.trim().length > 0
  );
}
