import { describe, expect, it } from "vitest";
import {
  calculateLegalEnvelope,
  calculateScenarioVerdict,
  extractVerdictFromDecision,
  hasCompleteProvenance,
  isValidPolygonArea,
  MIN_POLYGON_AREA_SQM,
} from "./coreAnalysis";

describe("polygon area validation", () => {
  it("rejects polygons below the minimum area", () => {
    expect(isValidPolygonArea(MIN_POLYGON_AREA_SQM - 1)).toBe(false);
  });

  it("accepts polygons at the minimum area", () => {
    expect(isValidPolygonArea(MIN_POLYGON_AREA_SQM)).toBe(true);
  });

  it("rejects non-finite area values", () => {
    expect(isValidPolygonArea(Number.NaN)).toBe(false);
    expect(isValidPolygonArea(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("verdict boundary logic", () => {
  it("returns NO-GO below 10% ROI", () => {
    expect(calculateScenarioVerdict(9.99)).toBe("NO-GO");
  });

  it("returns CONDITIONAL from 10% up to below 15% ROI", () => {
    expect(calculateScenarioVerdict(10)).toBe("CONDITIONAL");
    expect(calculateScenarioVerdict(14.99)).toBe("CONDITIONAL");
  });

  it("returns GO at 15% ROI and above", () => {
    expect(calculateScenarioVerdict(15)).toBe("GO");
    expect(calculateScenarioVerdict(25)).toBe("GO");
  });

  it("extracts explicit GO, NO-GO, and CONDITIONAL decisions from text", () => {
    expect(extractVerdictFromDecision("This site receives a GO verdict.")).toBe("GO");
    expect(extractVerdictFromDecision("Recommendation: reject this parcel as NO-GO.")).toBe("NO-GO");
    expect(extractVerdictFromDecision("This is conditional pending due diligence.")).toBe("CONDITIONAL");
  });

  it("defaults unclear decisions to CONDITIONAL", () => {
    expect(extractVerdictFromDecision("More review is needed.")).toBe("CONDITIONAL");
  });
});

describe("legal envelope calculations", () => {
  it("calculates buildable area and footprint from FAR and lot coverage", () => {
    expect(
      calculateLegalEnvelope({
        siteAreaSqm: 1_000,
        far: 0.7,
        lotCoverageMax: 40,
      }),
    ).toEqual({
      maxBuildableAreaSqm: 700,
      maxFootprintSqm: 400,
      effectiveBuildableFloors: 1,
    });
  });

  it("uses safe defaults when zoning values are missing", () => {
    expect(
      calculateLegalEnvelope({
        siteAreaSqm: 1_000,
        far: null,
        lotCoverageMax: null,
      }),
    ).toEqual({
      maxBuildableAreaSqm: 500,
      maxFootprintSqm: 400,
      effectiveBuildableFloors: 1,
    });
  });
});

describe("provenance threading", () => {
  it("requires every fact to carry label, value, source, and effective date", () => {
    expect(
      hasCompleteProvenance({
        label: "Zoning",
        value: "R-5",
        source: "Princeton Municipal Zoning Ordinance Database",
        effectiveDate: "2026-03-15",
      }),
    ).toBe(true);
  });

  it("rejects facts missing source or effective date", () => {
    expect(
      hasCompleteProvenance({
        label: "Groundwater",
        value: "8.2m",
        source: "",
        effectiveDate: "2026-03-15",
      }),
    ).toBe(false);

    expect(
      hasCompleteProvenance({
        label: "Groundwater",
        value: "8.2m",
        source: "USGS Groundwater",
        effectiveDate: "",
      }),
    ).toBe(false);
  });
});
