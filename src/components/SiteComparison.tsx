import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Trophy,
  MapPin,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SiteData {
  id: string;
  name: string;
  verdict: string;
  analysis: Record<string, unknown>;
  site: Record<string, unknown>;
  timestamp: string;
}

interface SiteComparisonProps {
  sites: SiteData[];
  onRemoveSite: (id: string) => void;
  onSelectSite: (site: SiteData) => void;
}

export function SiteComparison({ sites, onRemoveSite, onSelectSite }: SiteComparisonProps) {
  if (!sites || sites.length === 0) {
    return (
      <Card className="glass-panel p-12 text-center">
        <MapPin className="h-16 w-16 mx-auto mb-4 text-white/30" />
        <h3 className="text-xl font-semibold text-white mb-2">No Sites Analyzed Yet</h3>
        <p className="text-white/60">Draw polygons on the map to compare multiple sites</p>
      </Card>
    );
  }

  // Extract comparison metrics with safe fallbacks
  const comparison = sites.map(site => {
    const analysis = (site?.analysis || {}) as Record<string, unknown>;
    const roi = (analysis?.roi || {}) as Record<string, unknown>;
    const foundation = (analysis?.foundation || {}) as Record<string, unknown>;
    const siteData = (site?.site || {}) as Record<string, unknown>;
    
    return {
      id: site?.id || Date.now().toString(),
      name: site?.name || 'Unknown Site',
      verdict: site?.verdict || 'PENDING',
      roi: (roi?.riskAdjustedROI as number) || 0,
      cost: (roi?.totalDevelopmentCost as number) || 0,
      profit: (roi?.profit as number) || 0,
      area: (siteData?.area as number) || 0,
      timeline: getTimelineMonths((foundation?.constructionComplexity as string) || 'moderate'),
      risk: getRiskLevel(site?.verdict || 'PENDING', (roi?.riskAdjustedROI as number) || 0),
      fullSite: site
    };
  }).filter(site => site.id); // Filter out any invalid entries

  // Find winners with safe fallbacks
  const validROIs = comparison.map(s => s.roi).filter(r => r > 0);
  const validCosts = comparison.map(s => s.cost).filter(c => c > 0);
  const validTimelines = comparison.map(s => s.timeline).filter(t => t > 0);
  
  const bestROI = validROIs.length > 0 ? Math.max(...validROIs) : 0;
  const lowestCost = validCosts.length > 0 ? Math.min(...validCosts) : 0;
  const fastestTimeline = validTimelines.length > 0 ? Math.min(...validTimelines) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Site Comparison Matrix</h2>
          <p className="text-white/60 text-sm mt-1">
            Analyzing {sites.length} site{sites.length !== 1 ? 's' : ''} · Click any site to view details
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(sites.length, 3)}, 1fr)` }}>
        {comparison.map((site, idx) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className="glass-panel p-6 cursor-pointer hover:border-primary/50 transition-all relative group"
              onClick={() => onSelectSite(site.fullSite)}
            >
              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSite(site.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-white/60 hover:text-red-400" />
              </Button>

              {/* Site Name */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {site.name}
                </h3>
                <Badge 
                  className={`mt-2 ${
                    site.verdict === 'GO' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                      : site.verdict === 'CONDITIONAL'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-red-500/20 text-red-400 border-red-500/50'
                  }`}
                >
                  {site.verdict}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                {/* ROI */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <TrendingUp className="h-4 w-4" />
                    <span>ROI</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {site.roi.toFixed(1)}%
                      {site.roi === bestROI && (
                        <Trophy className="inline h-4 w-4 ml-1 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <DollarSign className="h-4 w-4" />
                    <span>Dev Cost</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      ${(site.cost / 1_000_000).toFixed(1)}M
                      {site.cost === lowestCost && site.cost > 0 && (
                        <Trophy className="inline h-4 w-4 ml-1 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Profit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <DollarSign className="h-4 w-4" />
                    <span>Profit</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      ${(site.profit / 1_000_000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Clock className="h-4 w-4" />
                    <span>Timeline</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {site.timeline}mo
                      {site.timeline === fastestTimeline && (
                        <Trophy className="inline h-4 w-4 ml-1 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Risk</span>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`text-xs ${
                        site.risk === 'LOW' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                          : site.risk === 'MODERATE'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }`}
                    >
                      {site.risk}
                    </Badge>
                  </div>
                </div>

                {/* Area */}
                <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10">
                  {Math.round(site.area * 10.7639).toLocaleString()} ft² / {(site.area * 0.000247105).toFixed(2)} acres
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation */}
      <Card className="glass-panel p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          AI Recommendation
        </h3>
        <p className="text-white/90 leading-relaxed">
          {generateRecommendation(comparison)}
        </p>
      </Card>
    </div>
  );
}

function getTimelineMonths(complexity: string): number {
  switch (complexity.toLowerCase()) {
    case 'low': return 3;
    case 'moderate': return 6;
    case 'high': return 12;
    case 'extreme': return 18;
    default: return 6;
  }
}

function getRiskLevel(verdict: string, roi: number): string {
  if (verdict === 'NO-GO') return 'HIGH';
  if (verdict === 'GO' && roi >= 15) return 'LOW';
  return 'MODERATE';
}

function generateRecommendation(sites: Array<{ name: string; verdict: string; roi: number; cost: number; profit: number; timeline: number; risk: string }>): string {
  const goSites = sites.filter(s => s.verdict === 'GO');
  
  if (goSites.length === 0) {
    return "None of the analyzed sites received a GO verdict. Consider exploring alternative locations or adjusting project parameters.";
  }

  if (goSites.length === 1) {
    return `${goSites[0].name} is the clear choice with a ${goSites[0].roi.toFixed(1)}% ROI and ${goSites[0].risk.toLowerCase()} risk profile.`;
  }

  // Find best overall
  const bestROI = goSites.reduce((prev, curr) => (curr.roi > prev.roi ? curr : prev));
  const lowestRisk = goSites.filter(s => s.risk === 'LOW')[0];
  const fastestProject = goSites.reduce((prev, curr) => (curr.timeline < prev.timeline ? curr : prev));

  if (bestROI.id === lowestRisk?.id && bestROI.id === fastestProject.id) {
    return `${bestROI.name} is the clear winner with highest ROI (${bestROI.roi.toFixed(1)}%), lowest risk, and fastest timeline (${bestROI.timeline} months). Strong recommendation for immediate pursuit.`;
  }

  return `${bestROI.name} offers the highest ROI (${bestROI.roi.toFixed(1)}%), while ${fastestProject.name} provides the fastest path to revenue (${fastestProject.timeline} months). ${lowestRisk ? `${lowestRisk.name} presents the lowest risk profile.` : ''} Consider your priority: maximum returns vs. speed to market vs. risk mitigation.`;
}
