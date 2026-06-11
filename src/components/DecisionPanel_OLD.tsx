import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { FlipToGoButton } from './FlipToGoButton';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, AlertCircle, TrendingUp, 
  Building2, DollarSign, Loader2, ChevronDown, CheckCircle, Layers, ChevronUp, Clock,
  FileText, Target
} from 'lucide-react';

interface DecisionPanelProps {
  decision: Record<string, unknown> | null;
  isLoading: boolean;
  progressMessage?: string;
}

export function DecisionPanel({ decision, isLoading, progressMessage }: DecisionPanelProps) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analyzing Site...</h2>
            <p className="text-sm text-white/85 mt-1">{progressMessage || 'Processing data...'}</p>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <Card className="bg-background/80 border-border/50 p-6">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 bg-white/5 rounded animate-pulse" />
          </div>
        </Card>

        <Card className="bg-background/80 border-border/50 p-6">
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  // Console debug - DELETE THIS AFTER DEBUGGING
  console.log('🔍 Full decision object:', decision);
  console.log('🔍 Analysis:', decision.analysis);
  console.log('🔍 ROI data:', (decision.analysis as Record<string, unknown>)?.roi);

  const decisionData = decision;
  const analysis = (decisionData.analysis || {}) as Record<string, unknown>;
  
  // Helper functions
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) {
      return '—';
    }
    return `$${(value / 1000000).toFixed(2)}M`;
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(1)}%`;
  };

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

  const getEstimatedTimeline = (complexity: string | undefined): string => {
    if (!complexity) return '~6 months';
    switch (complexity.toLowerCase()) {
      case 'low': return '~3 months';
      case 'moderate': return '~6 months';
      case 'high': return '~12 months';
      case 'extreme': return '~18+ months';
      default: return '~6 months';
    }
  };

  const getVerdictStyle = () => {
    if (decisionData.verdict === 'GO') return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-500', icon: CheckCircle2, badgeVariant: 'default' as const };
    if (decisionData.verdict === 'NO-GO') return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-500', icon: XCircle, badgeVariant: 'destructive' as const };
    return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-500', icon: AlertCircle, badgeVariant: 'default' as const };
  };

  const getConfidenceInfo = () => {
    const score = (decisionData.confidenceScore as number) || 0;
    if (score >= 80) return { color: 'text-green-400', label: 'High', description: 'Strong fundamentals — proceed with standard due diligence' };
    if (score >= 60) return { color: 'text-amber-400', label: 'Moderate', description: 'Recommend geotechnical survey before proceeding' };
    return { color: 'text-red-400', label: 'Low', description: 'Significant risks identified — comprehensive assessment required' };
  };

  const getROIColor = (roi: number) => {
    if (roi >= 15) return 'from-green-500 to-emerald-500';
    if (roi >= 10) return 'from-green-400 to-emerald-400';
    if (roi >= 5) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'LOW') return 'from-green-500 to-emerald-500';
    if (risk === 'MODERATE') return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const verdictStyle = getVerdictStyle();
  const confidenceInfo = getConfidenceInfo();
  const VerdictIcon = verdictStyle.icon;

  // Extract data with DEFENSIVE CODING and proper typing
  const roi = (analysis.roi || {}) as Record<string, unknown>;
  const zoning = ((analysis.zoning as Record<string, unknown>)?.zoning || {}) as Record<string, unknown>;
  const foundation = (analysis.foundation || {}) as Record<string, unknown>;
  const legalEnvelope = ((analysis.zoning as Record<string, unknown>)?.legalEnvelope || {}) as Record<string, unknown>;

  // Area calculations with proper defaults
  const siteAreaSqm = (decisionData.site as Record<string, unknown>)?.area as number || 0;
  
  console.log('🔍 DecisionPanel - Site data:', decisionData.site);
  console.log('🔍 DecisionPanel - siteAreaSqm extracted:', siteAreaSqm);
  console.log('🔍 DecisionPanel - Should display:', {
    sqft: Math.round(siteAreaSqm * 10.7639),
    acres: (siteAreaSqm * 0.000247105).toFixed(3)
  });
  
  const siteArea = formatArea(siteAreaSqm);
  
  // Buildable area from ROI data or legalEnvelope fallback
  const buildableAreaSqm = (roi.buildableAreaSqm as number) || (legalEnvelope.maxBuildableAreaSqm as number) || 0;
  const buildableArea = formatArea(buildableAreaSqm);

  // Financial data - use nullish coalescing to preserve 0 values if they're real
  const totalCost = roi.totalDevelopmentCost as number ?? null;
  const netRevenue = roi.netRevenue as number ?? null;
  const profit = roi.profit as number ?? null;

  // ROI ranges (not in current backend but adding for completeness)
  const roiLow = roi.roi_low_pct as number ?? null;
  const roiHigh = roi.roi_high_pct as number ?? null;
  const riskAdjustedROI = roi.riskAdjustedROI as number ?? null;

  // Metrics for cards
  const foundationFeasibility = (decisionData.decision as Record<string, unknown>)?.keyMetrics 
    ? ((decisionData.decision as Record<string, unknown>).keyMetrics as Record<string, unknown>).foundationFeasibility as number
    : foundation.feasibilityScore as number || 70;
  
  const geologicalRisk = (decisionData.decision as Record<string, unknown>)?.keyMetrics
    ? ((decisionData.decision as Record<string, unknown>).keyMetrics as Record<string, unknown>).geologicalRisk as string
    : 'MODERATE';

  const investmentGrade = (roi.investmentGrade as string) || 'B+ (Good)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Verdict Banner */}
        <Card className={`bg-background/90 border-border/60 border-2 ${verdictStyle.border} ${verdictStyle.bg} overflow-hidden`}>
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
            
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full ${verdictStyle.bg} flex items-center justify-center border-2 ${verdictStyle.border}`}>
                  <VerdictIcon className={`h-8 w-8 ${verdictStyle.text}`} />
                </div>
                <div>
                  <div className="text-sm text-white/80 mb-2">Final Verdict</div>
                  <Badge variant={verdictStyle.badgeVariant} className={`text-3xl px-8 py-3 font-bold ${verdictStyle.text} ${verdictStyle.bg} border-2 ${verdictStyle.border}`}>
                    {decisionData.verdict as string}
                  </Badge>
                </div>
              </div>
              {decisionData.processingTime && (
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Clock className="h-4 w-4" />
                  {((decisionData.processingTime as number) / 1000).toFixed(1)}s
                </div>
              )}
            </div>

            {/* Confidence Score */}
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white/80">Confidence Score</span>
                <span className={`text-4xl font-bold ${confidenceInfo.color}`}>
                  {Math.round((decisionData.confidenceScore as number) || 0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={(decisionData.confidenceScore as number) || 0} className="h-3" />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>Low (0-60)</span>
                  <span>Medium (60-80)</span>
                  <span>High (80-100)</span>
                </div>
              </div>
              <p className="text-sm text-white/85">{confidenceInfo.description}</p>
            </div>
          </div>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* ROI Card */}
          <Card className="bg-background/90 border-border/60 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-white/80">ROI</div>
                <div className="text-2xl font-bold text-white">{formatPercent(riskAdjustedROI)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getROIColor(riskAdjustedROI || 0)} transition-all duration-700`}
                  style={{ width: `${Math.min((riskAdjustedROI || 0) * 4, 100)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Foundation Feasibility */}
          <Card className="bg-background/90 border-border/60 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-white/80">Foundation Feasibility</div>
                <div className="text-2xl font-bold text-white">{Math.round(foundationFeasibility)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getFeasibilityColor(foundationFeasibility)} transition-all duration-700`}
                  style={{ width: `${foundationFeasibility}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Geological Risk */}
          <Card className="bg-background/90 border-border/60 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-white/80">Geological Risk</div>
                <div className="text-lg font-bold text-white">{geologicalRisk}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getRiskColor(geologicalRisk)} transition-all duration-700`}
                  style={{ width: geologicalRisk === 'LOW' ? '90%' : geologicalRisk === 'MODERATE' ? '50%' : '20%' }}
                />
              </div>
            </div>
          </Card>

          {/* Investment Grade */}
          <Card className="bg-background/90 border-border/60 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-white/80">Investment Grade</div>
                <div className="text-lg font-bold text-white">{investmentGrade}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Executive Summary - Redesigned for Visual Appeal */}
        <Card className="bg-background/90 border-border/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
            </div>
            <button
              onClick={() => setReasoningExpanded(!reasoningExpanded)}
              className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
            >
              {reasoningExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Details
                </>
              )}
            </button>
          </div>

          {/* Parse AI reasoning into structured sections */}
          {(() => {
            const reasoning = ((decisionData.decision as Record<string, unknown>)?.reasoning as string) || '';
            const cleanText = reasoning
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .replace(/^\d+\.\s*/gm, '')
              .replace(/^[-•]\s*/gm, '');
            
            // Split into sentences
            const sentences = cleanText.split(/\.\s+/).filter(s => s.trim().length > 0);
            
            // Extract verdict sentence (first one usually)
            const verdictSentence = sentences[0] || 'Analysis in progress...';
            
            // Extract key points
            const strengthSentence = sentences.find(s => 
              s.toLowerCase().includes('strength') || 
              s.toLowerCase().includes('positive') ||
              s.toLowerCase().includes('strong') ||
              s.toLowerCase().includes('advantage')
            ) || sentences[1] || '';
            
            const riskSentence = sentences.find(s => 
              s.toLowerCase().includes('risk') || 
              s.toLowerCase().includes('concern') ||
              s.toLowerCase().includes('challenge')
            ) || sentences[2] || '';
            
            const actionSentence = sentences.find(s => 
              s.toLowerCase().includes('recommend') || 
              s.toLowerCase().includes('should') ||
              s.toLowerCase().includes('action') ||
              s.toLowerCase().includes('proceed')
            ) || sentences[3] || '';

            return (
              <div className="space-y-3">
                {/* Verdict Section */}
                <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1">Decision</h4>
                      <p className="text-sm text-white leading-relaxed">{verdictSentence}.</p>
                    </div>
                  </div>
                </div>

                {/* Key Strength */}
                {strengthSentence && (
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Key Strength</h4>
                        <p className="text-sm text-white/90 leading-relaxed">{strengthSentence}.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Risk */}
                {riskSentence && (
                  <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Primary Risk</h4>
                        <p className="text-sm text-white/90 leading-relaxed">{riskSentence}.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Item */}
                {actionSentence && (
                  <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Recommended Action</h4>
                        <p className="text-sm text-white/90 leading-relaxed">{actionSentence}.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Expanded Details */}
          <AnimatePresence>
            {reasoningExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-3 border-t border-white/10 space-y-3"
              >
                {/* Detailed Action Items */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Next Steps
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs text-white/80">
                    {decisionData.verdict === 'GO' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>Engage geotechnical engineer for Phase II soil investigation</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>Confirm zoning compliance with municipal planning department</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>Begin preliminary architectural design and site planning</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-primary">→</span>
                          <span>Secure project financing and construction partners</span>
                        </div>
                      </>
                    )}
                    {decisionData.verdict === 'CONDITIONAL' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">→</span>
                          <span>Address identified risks before proceeding</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">→</span>
                          <span>Conduct detailed feasibility study on flagged concerns</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">→</span>
                          <span>Explore design alternatives to improve project viability</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">→</span>
                          <span>Re-evaluate after implementing suggested improvements</span>
                        </div>
                      </>
                    )}
                    {decisionData.verdict === 'NO-GO' && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">→</span>
                          <span>Document findings for future reference</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">→</span>
                          <span>Consider alternative sites with better fundamentals</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">→</span>
                          <span>Review lessons learned to refine site selection criteria</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">→</span>
                          <span>Explore if site has value for different use case</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Risk Dashboard */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    Risk Dashboard
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-white/80">Geological</div>
                      <div className={`font-semibold ${geologicalRisk === 'LOW' ? 'text-green-400' : geologicalRisk === 'MODERATE' ? 'text-amber-400' : 'text-red-400'}`}>
                        {geologicalRisk}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/80">Foundation</div>
                      <div className="font-semibold text-blue-400">{Math.round(foundationFeasibility)}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/80">Investment Grade</div>
                      <div className="font-semibold text-yellow-400">{investmentGrade}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/80">Risk-Adj ROI</div>
                      <div className="font-semibold text-green-400">{formatPercent(riskAdjustedROI)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Flip to GO Button for CONDITIONAL - with safety checks */}
        {decisionData.verdict === 'CONDITIONAL' && decisionData.analysis && decisionData.decision && (
          <FlipToGoButton decision={decisionData} />
        )}

        {/* Financial Summary */}
        <Card className="bg-background/90 border-border/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/85">Total Development Cost</span>
              <span className="font-semibold text-white text-lg">
                {formatCurrency(totalCost)}
              </span>
            </div>
            
            {/* Add Cost Range if available */}
            {roi.cost_range_low_usd && roi.cost_range_high_usd && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Cost Range</span>
                <span className="text-xs text-white/80">
                  {formatCurrency(roi.cost_range_low_usd as number)} – {formatCurrency(roi.cost_range_high_usd as number)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/85">Projected Net Revenue</span>
              <span className="font-semibold text-white text-lg">
                {formatCurrency(netRevenue)}
              </span>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white/80">Risk-Adjusted Profit</span>
              <span className={`font-bold text-2xl ${(profit ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(profit)}
              </span>
            </div>

            {/* ROI Range if available */}
            {roiLow && roiHigh && (
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-xs text-white/50">ROI Range</span>
                <span className="text-xs text-white/80">
                  {formatPercent(roiLow)} – {formatPercent(roiHigh)}
                </span>
              </div>
            )}

            {/* Payback Period if available */}
            {roi.payback_years && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Payback Period</span>
                <span className="text-xs text-white/80">
                  ~{(roi.payback_years as number).toFixed(1)} years
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Development Specifications */}
        <Card className="bg-background/90 border-border/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Development Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Property Type</div>
              <div className="text-sm font-semibold text-white capitalize">
                {(roi.propertyType as string) || (roi.recommended_building_type as string) || 'Residential'}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Max Height</div>
              <div className="text-sm font-semibold text-white">
                {(zoning.max_height_meters || zoning.max_height_ft) 
                  ? `${((zoning.max_height_meters as number) || 0).toFixed(1)}m / ${Math.round(((zoning.max_height_meters as number) || 0) * 3.28084) || (zoning.max_height_ft as number)}ft / ${(zoning.max_floors as number) || 0} floors`
                  : '—'
                }
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Site Area</div>
              <div className="text-sm font-semibold text-white">
                {siteArea.sqft !== '—' ? `${siteArea.sqft} ft²` : 'Draw polygon'}
                {siteArea.acres !== '—' && (
                  <div className="text-xs text-white/80">{siteArea.acres} acres</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Buildable Area</div>
              <div className="text-sm font-semibold text-white">
                {buildableArea.sqft !== '—' ? `${buildableArea.sqft} ft²` : '—'}
                {buildableArea.acres !== '—' && (
                  <div className="text-xs text-white/80">{buildableArea.acres} acres</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Foundation Type</div>
              <div className="text-sm font-semibold text-white capitalize">
                {((foundation.foundationType as string) || (foundation.cost_breakdown as Record<string, unknown>)?.foundation_type as string || 'reinforced-mat').replace(/-/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50 mb-1">Est. Timeline</div>
              <div className="text-sm font-semibold text-white">
                {getEstimatedTimeline((foundation.constructionComplexity as string) || (foundation.construction_complexity as string))}
              </div>
            </div>
          </div>
        </Card>

        {/* Data Sources */}
        <Card className="bg-background/90 border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-semibold text-white">Real Data Sources</h4>
          </div>
          <div className="text-xs text-white/85 space-y-1">
            <div>
              Elevation: <a href="https://open-elevation.com/" target="_blank" rel="noopener noreferrer" className="text-white/85 hover:text-accent underline">Open-Elevation API</a>
            </div>
            <div>
              Soil: <a href="https://www.nrcs.usda.gov/" target="_blank" rel="noopener noreferrer" className="text-white/85 hover:text-accent underline">USDA Web Soil Survey</a>
            </div>
            <div>
              Water: <a href="https://waterdata.usgs.gov/" target="_blank" rel="noopener noreferrer" className="text-white/85 hover:text-accent underline">USGS Water Services</a>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
