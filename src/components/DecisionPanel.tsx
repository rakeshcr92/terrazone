import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Zap,
  Shield,
  ArrowRight
} from "lucide-react";
import { FlipToGoButton } from "./FlipToGoButton";

interface DecisionPanelProps {
  decision: Record<string, unknown> | null;
  isLoading?: boolean;
  progressMessage?: string;
}

// ━━━━━━━━━━ NEW: Extract structured fields with validation and data-driven fallback ━━━━━━━━━━
function getStructuredAnalysis(
  decisionInfo: Record<string, unknown>,
  roi: Record<string, unknown>,
  foundation: Record<string, unknown>,
  geological: Record<string, unknown>,
  zoning: Record<string, unknown>,
  site: Record<string, unknown>
) {
  // Try to read structured fields from API response
  const decision = decisionInfo.decision as string;
  const keyStrength = decisionInfo.key_strength as string;
  const primaryRisk = decisionInfo.primary_risk as string;
  const recommendedAction = decisionInfo.recommended_action as string;

  // Validation: Check if fields are real or generic
  const genericPhrases = [
    'review metrics below',
    'review risk factors',
    'proceed based on metrics',
    'analysis complete',
    'favorable conditions',
    'strong metrics',
    'further analysis'
  ];

  const isGeneric = (text: string | undefined): boolean => {
    if (!text || text.length < 40) return true;
    const lower = text.toLowerCase();
    return genericPhrases.some(phrase => lower.includes(phrase));
  };

  // If any field is generic, build from actual data
  if (isGeneric(decision) || isGeneric(keyStrength) || isGeneric(primaryRisk)) {
    console.warn('⚠️ Generic AI response detected - using data-driven fallback');
    return buildDataDrivenSummary(roi, foundation, geological, zoning, site);
  }

  // Return validated structured fields
  return {
    decision: decision || '',
    keyStrength: keyStrength || '',
    primaryRisk: primaryRisk || '',
    recommendation: recommendedAction || ''
  };
}

// Helper: Build summary from actual data when AI fails
function buildDataDrivenSummary(
  roi: Record<string, unknown>,
  foundation: Record<string, unknown>,
  geological: Record<string, unknown>,
  zoning: Record<string, unknown>,
  site: Record<string, unknown>
) {
  const roiPct = ((roi.riskAdjustedROI as number) || 0).toFixed(1);
  const feasScore = (foundation.feasibilityScore as number) || 0;
  const costK = Math.round(((roi.totalDevelopmentCost as number) || 0) / 1000);
  const revenueK = Math.round(((roi.netRevenue as number) || 0) / 1000);
  const zoneCode = (zoning.zone_code as string) || 'N/A';
  const maxFloors = (zoning.max_floors as number) || 0;
  const far = (zoning.far as number) || 0;
  const buildableArea = Math.round(((roi.buildableAreaSqm as number) || 0));
  const soilScore = ((geological.geological as Record<string, unknown>)?.soilStabilityScore as number) || 0;
  const foundationType = (foundation.foundationType as string) || '';
  const foundationCost = Math.round(((foundation.totalCost as number) || 0) / 1000);
  const gwDepth = ((geological.geological as Record<string, unknown>)?.groundwaterDepthMeters as number) || 0;
  const geoRisk = ((geological.geological as Record<string, unknown>)?.riskLevel as string) || 'UNKNOWN';

  return {
    decision: `${roiPct}% risk-adjusted ROI with ${feasScore}/100 feasibility score under ${zoneCode} zoning. This site permits ${maxFloors} floors with ${far} FAR, yielding ${buildableArea} sqm buildable area. Total development cost of $${costK}k against projected revenue of $${revenueK}k demonstrates ${parseFloat(roiPct) >= 12 ? 'strong' : 'marginal'} financial viability.`,
    
    keyStrength: `Development cost of $${costK}k against revenue of $${revenueK}k yields ${roiPct}% risk-adjusted ROI${parseFloat(roiPct) >= 12 ? ', exceeding the 12% hurdle rate for residential development' : ''}. Soil stability score of ${soilScore}/100 enables ${foundationType} foundation at $${foundationCost}k, minimizing structural costs.`,
    
    primaryRisk: `Groundwater at ${gwDepth}m depth with ${geoRisk.toLowerCase()} geological risk requires enhanced foundation engineering. Site-specific geotechnical boring ($3,000-$8,000, 2-3 weeks) is essential to verify subsurface conditions and validate the ${foundationType} foundation design before committing capital.`,
    
    recommendation: `Commission geotechnical boring report ($3,000-$8,000, 2-3 week turnaround) to verify ${gwDepth}m groundwater depth and confirm ${foundationType} foundation adequacy. File building permit application under ${zoneCode} zoning immediately (typical 6-8 week approval timeline). Secure construction financing in the $${Math.round(costK * 0.9)}k-$${Math.round(costK * 1.1)}k range.`
  };
}

// Helper: Clean individual sentence
function cleanSentence(text: string): string {
  if (!text) return '';
  
  // Remove section labels if they snuck through
  text = text.replace(/^(DECISION|STRENGTH|RISK|ACTION):\s*/i, '');
  
  // Trim and ensure proper punctuation
  text = text.trim();
  if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    text += '.';
  }
  
  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);
  
  return text;
}

// ━━━━━━━━━━ Helper: Format money with fallback ━━━━━━━━━━
function formatMoney(val: number | null | undefined): string {
  if (!val || val === 0) return '—';
  return '$' + (val / 1_000_000).toFixed(2) + 'M';
}

// ━━━━━━━━━━ Helper: Capitalize words ━━━━━━━━━━
function capitalizeWords(str: string): string {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

export function DecisionPanel({ decision, isLoading, progressMessage }: DecisionPanelProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="text-white/80">{progressMessage || 'Analyzing site...'}</p>
          </div>
        </div>
        <Card style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: '12px' }} className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded animate-pulse" style={{ background: '#1A1A1A' }} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <Target className="h-16 w-16 mx-auto mb-4" style={{ color: '#6B7280' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: '#FFFFFF' }}>No Analysis Yet</h3>
          <p style={{ color: '#9CA3AF' }} className="max-w-md">Draw a polygon on the map to start analysis</p>
        </div>
      </div>
    );
  }

  // Extract data with null safety
  const decisionData = decision as Record<string, unknown>;
  const analysis = (decisionData.analysis || {}) as Record<string, unknown>;
  const roi = (analysis.roi || {}) as Record<string, unknown>;
  const zoning = ((analysis.zoning as Record<string, unknown>)?.zoning || {}) as Record<string, unknown>;
  const geological = (analysis.geological || {}) as Record<string, unknown>;
  const foundation = (analysis.foundation || {}) as Record<string, unknown>;
  const decisionInfo = (decisionData.decision || {}) as Record<string, unknown>;
  const site = (decisionData.site || {}) as Record<string, unknown>;

  // ━━━━━━━━━━ NEW: Get structured analysis with validation ━━━━━━━━━━
  const parsedSections = getStructuredAnalysis(decisionInfo, roi, foundation, geological, zoning, site);

  // ━━━━━━━━━━ BUG 3 & 4 FIX: Get area from backend (already calculated with turf.js) ━━━━━━━━━━
  const siteAreaSqm = (site.area as number) || 0;
  
  const formatArea = (sqm: number | null | undefined): { sqft: string; acres: string } => {
    if (!sqm || sqm === 0) {
      return { sqft: '—', acres: '—' };
    }
    const sqft = Math.round(sqm * 10.7639);
    const acres = (sqm * 0.000247105).toFixed(3);
    return {
      sqft: sqft.toLocaleString(),
      acres
    };
  };

  const siteArea = formatArea(siteAreaSqm);
  
  const verdict = decisionData.verdict as string || 'PENDING';
  const confidenceScore = decisionData.confidenceScore as number || 0;

  // ━━━━━━━━━━ BUG 3 FIX: Financial data (should be populated if area was passed correctly) ━━━━━━━━━━
  // DEBUG: Log the entire ROI object to see what we're receiving
  console.log('═══════════ DECISION PANEL DEBUG ═══════════');
  console.log('Full decisionData:', decisionData);
  console.log('Analysis object:', analysis);
  console.log('ROI object:', roi);
  console.log('Site object:', site);
  console.log('Site area (sqm):', siteAreaSqm);
  console.log('═══════════════════════════════════════════');
  
  const totalCost = roi.totalDevelopmentCost as number ?? null;
  const netRevenue = roi.netRevenue as number ?? null;
  const profit = roi.profit as number ?? null;
  const riskAdjustedROI = roi.riskAdjustedROI as number ?? null;
  const investmentGrade = roi.investmentGrade as string || '—';
  
  console.log('Extracted financial values:');
  console.log('  - Total Cost:', totalCost);
  console.log('  - Net Revenue:', netRevenue);
  console.log('  - Profit:', profit);
  console.log('  - Risk-Adjusted ROI:', riskAdjustedROI);

  // ━━━━━━━━━━ BUG 2 FIX: Property Type and Foundation Type field mappings ━━━━━━━━━━
  const propertyTypeRaw = (
    (site.building_type as string) ||
    (zoning.permitted_uses as string[])?.[0] ||
    (zoning.property_type as string) ||
    (zoning.propertyType as string) ||
    'residential'
  );
  const propertyType = capitalizeWords(propertyTypeRaw);

  const foundationTypeRaw = (
    (foundation.recommendedType as string) ||
    (foundation.foundation_type as string) ||
    'reinforced mat'
  );
  const foundationType = capitalizeWords(foundationTypeRaw);

  // Other data
  const maxFloors = (zoning.max_floors as number) || (zoning.maxFloors as number) || 0;
  const maxHeight = (zoning.max_height_meters as number) || (zoning.maxBuildingHeightMeters as number) || 0;
  const buildableAreaSqm = roi.buildableAreaSqm as number || 0;
  const buildableArea = formatArea(buildableAreaSqm);
  const feasibilityScore = (foundation.feasibilityScore as number) || 0;
  const constructionTimeline = (foundation.estimatedTimeline as string) || '~6 months';
  const riskLevel = (geological.riskLevel as string) || 'MODERATE';

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'GO':
        return {
          bg: '#052E16',
          border: '#22C55E',
          badgeBg: '#22C55E',
          badgeText: '#000000',
          icon: <CheckCircle2 className="h-16 w-16" style={{ color: '#22C55E' }} />
        };
      case 'CONDITIONAL':
        return {
          bg: '#1C1409',
          border: '#F59E0B',
          badgeBg: '#F59E0B',
          badgeText: '#000000',
          icon: <AlertCircle className="h-16 w-16" style={{ color: '#F59E0B' }} />
        };
      case 'NO-GO':
        return {
          bg: '#1C0A0A',
          border: '#EF4444',
          badgeBg: '#EF4444',
          badgeText: '#FFFFFF',
          icon: <XCircle className="h-16 w-16" style={{ color: '#EF4444' }} />
        };
      default:
        return {
          bg: '#141414',
          border: '#2A2A2A',
          badgeBg: '#6B7280',
          badgeText: '#FFFFFF',
          icon: <AlertCircle className="h-16 w-16" style={{ color: '#9CA3AF' }} />
        };
    }
  };

  const verdictStyle = getVerdictStyle(verdict);

  return (
    <div className="space-y-6">
      {/* Final Verdict Card */}
      <Card 
        style={{ 
          background: verdictStyle.bg, 
          border: `2px solid ${verdictStyle.border}`,
          borderRadius: '12px'
        }} 
        className="overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Final Verdict</h3>
            <Badge 
              style={{ 
                background: verdictStyle.badgeBg, 
                color: verdictStyle.badgeText,
                fontWeight: 900,
                padding: '6px 16px',
                fontSize: '14px'
              }}
            >
              {verdict}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {verdictStyle.icon}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    Confidence Score
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${confidenceScore}%`,
                        background: confidenceScore >= 80 ? '#22C55E' : confidenceScore >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{confidenceScore}%</span>
                </div>
                <div className="flex justify-between mt-1 text-xs" style={{ color: '#6B7280' }}>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ━━━━━━━━━━ BUG 1 FIX: Executive Summary with parsed sections ━━━━━━━━━━ */}
      <Card style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: '12px' }} className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
          Executive Summary
        </h3>
        
        <div className="space-y-3">
          {/* Decision */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              background: '#1A1A1A',
              borderLeft: '4px solid #F97316'
            }}
          >
            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 mt-1" style={{ color: '#F97316' }} />
              <div className="flex-1">
                <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: '#F97316' }}>Decision</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  {parsedSections.decision}
                </p>
              </div>
            </div>
          </div>
          
          {/* Key Strength */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              background: '#1A1A1A',
              borderLeft: '4px solid #22C55E'
            }}
          >
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 mt-1" style={{ color: '#22C55E' }} />
              <div className="flex-1">
                <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: '#22C55E' }}>Key Strength</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  {parsedSections.keyStrength}
                </p>
              </div>
            </div>
          </div>
          
          {/* Primary Risk */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              background: '#1A1A1A',
              borderLeft: '4px solid #EF4444'
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 mt-1" style={{ color: '#EF4444' }} />
              <div className="flex-1">
                <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: '#EF4444' }}>Primary Risk</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  {parsedSections.primaryRisk}
                </p>
              </div>
            </div>
          </div>
          
          {/* Recommended Action */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              background: '#1A1A1A',
              borderLeft: '4px solid #3B82F6'
            }}
          >
            <div className="flex items-start gap-3">
              <ArrowRight className="h-4 w-4 mt-1" style={{ color: '#3B82F6' }} />
              <div className="flex-1">
                <h4 className="text-xs font-semibold uppercase mb-1" style={{ color: '#3B82F6' }}>Recommended Action</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  {parsedSections.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ━━━━━━━━━━ BUG 3 FIX: Financial Summary with formatMoney helper ━━━━━━━━━━ */}
      <Card style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: '12px' }} className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
          Financial Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Total Development Cost */}
          <div className="p-4 rounded-lg" style={{ background: '#1A1A1A' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(249, 115, 22, 0.2)' }}>
                <DollarSign className="h-5 w-5" style={{ color: '#F97316' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#6B7280' }}>
                  Total Cost
                </div>
                <div className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatMoney(totalCost)}
                </div>
              </div>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="p-4 rounded-lg" style={{ background: '#1A1A1A' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#6B7280' }}>
                  Net Revenue
                </div>
                <div className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {formatMoney(netRevenue)}
                </div>
              </div>
            </div>
          </div>

          {/* Risk-Adjusted Profit */}
          <div className="p-4 rounded-lg" style={{ background: '#1A1A1A' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: profit && profit > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
                <DollarSign className="h-5 w-5" style={{ color: profit && profit > 0 ? '#22C55E' : '#EF4444' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#6B7280' }}>
                  Risk-Adjusted Profit
                </div>
                <div 
                  className="text-xl font-bold"
                  style={{ color: profit && profit > 0 ? '#22C55E' : '#EF4444' }}
                >
                  {formatMoney(profit)}
                </div>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="p-4 rounded-lg" style={{ background: '#1A1A1A' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#10B981' }} />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#6B7280' }}>
                  Risk-Adjusted ROI
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                    {riskAdjustedROI ? `${riskAdjustedROI.toFixed(1)}%` : '—'}
                  </div>
                  <Badge style={{ background: '#1F1F1F', color: '#10B981', fontSize: '11px' }}>
                    {investmentGrade}
                  </Badge>
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: '#0A0A0A' }}>
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${Math.min((riskAdjustedROI || 0) * 2, 100)}%`,
                      background: '#10B981'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ━━━━━━━━━━ BUG 2 & 4 FIX: Development Specifications ━━━━━━━━━━ */}
      <Card style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: '12px' }} className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>
          Development Specifications
        </h3>
        
        <div className="space-y-4">
          {/* Site & Buildable Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Site Area
              </div>
              <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {siteArea.sqft} ft²
              </div>
              <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                {siteArea.acres} acres
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Buildable Area
              </div>
              <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {buildableArea.sqft} ft²
              </div>
              <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                {buildableArea.acres} acres
              </div>
            </div>
          </div>

          {/* Property Type & Floors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Property Type
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: '#3B82F6' }} />
                <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {propertyType}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Max Floors / Height
              </div>
              <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {maxFloors} floors / {maxHeight}m
              </div>
            </div>
          </div>

          {/* Foundation & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Foundation Type
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: '#10B981' }} />
                <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {foundationType}
                </span>
              </div>
              <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                Feasibility: {feasibilityScore}%
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: '#6B7280' }}>
                Construction Timeline
              </div>
              <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                {constructionTimeline}
              </div>
              <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
                Risk Level: <span style={{ color: riskLevel === 'LOW' ? '#22C55E' : riskLevel === 'MODERATE' ? '#F59E0B' : '#EF4444' }}>
                  {riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Flip to GO Button (only for CONDITIONAL) */}
      {verdict === 'CONDITIONAL' && (
        <FlipToGoButton decision={decision} />
      )}
    </div>
  );
}
