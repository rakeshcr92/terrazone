import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Building2,
  Calendar,
  Lightbulb,
  Save,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScenarioAnalysisProps {
  baselineData: Record<string, unknown>;
  siteArea: number;
}

interface ScenarioParams {
  constructionCostPerSqm: number;
  rentPerSqm: number;
  interestRate: number;
  timelineMonths: number;
  far: number;
  buildingHeight: number;
}

interface ScenarioResults {
  totalCost: number;
  revenue: number;
  profit: number;
  roi: number;
  breakEven: number;
  verdict: string;
}

export function ScenarioAnalysis({ baselineData, siteArea }: ScenarioAnalysisProps) {
  const analysis = (baselineData?.analysis || {}) as Record<string, unknown>;
  const roi = (analysis?.roi || {}) as Record<string, unknown>;
  const zoning = ((analysis?.zoning as Record<string, unknown>)?.zoning || {}) as Record<string, unknown>;
  
  // Baseline values
  const baselineFAR = (zoning?.far as number) || 0.5;
  const baselineHeight = (zoning?.max_height_meters as number) || 12;
  
  const [params, setParams] = useState<ScenarioParams>({
    constructionCostPerSqm: 2200,
    rentPerSqm: 65,
    interestRate: 6.5,
    timelineMonths: 8,
    far: baselineFAR,
    buildingHeight: baselineHeight
  });

  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; params: ScenarioParams; results: ScenarioResults }>>([]);

  // Calculate results whenever params change
  useEffect(() => {
    if (!siteArea || siteArea === 0) return;
    
    // ━━━━━━━━━━ FIX 4: Building Height Constraint on Buildable Area ━━━━━━━━━━
    // Calculate maximum floors based on building height (3 meters per floor)
    const maxFloors = Math.floor(params.buildingHeight / 3);
    // Calculate height-constrained buildable area (80% lot coverage per floor)
    const heightConstrainedArea = siteArea * maxFloors * 0.8;
    // Use the MINIMUM of FAR-based area and height-constrained area
    const buildableArea = Math.min(siteArea * params.far, heightConstrainedArea);
    
    // Calculate construction cost
    const constructionCost = buildableArea * params.constructionCostPerSqm;
    const landCost = siteArea * 800; // $800/sqm land cost
    const softCosts = constructionCost * 0.25;
    
    // ━━━━━━━━━━ FIX 3: Incorporate Financing Costs ━━━━━━━━━━
    // Calculate loan interest during construction period
    const financingCost = constructionCost * (params.interestRate / 100) * (params.timelineMonths / 12);
    
    // Total cost now includes financing costs
    const totalCost = constructionCost + landCost + softCosts + financingCost;
    
    // ━━━━━━━━━━ FIX 1: Calculate NOI (Net Operating Income) ━━━━━━━━━━
    // Calculate gross annual rent
    const annualRent = buildableArea * params.rentPerSqm * 12;
    // Deduct 30% for operating expenses (vacancy, maintenance, property tax, insurance, etc.)
    const noi = annualRent * 0.70;
    
    // Use NOI (not gross rent) for cap rate valuation
    const revenue = noi / (params.interestRate / 100); // Cap rate valuation
    const profit = revenue - totalCost;
    const roiPercent = (profit / totalCost) * 100;
    
    // ━━━━━━━━━━ FIX 2: Calculate True Payback Period using NOI ━━━━━━━━━━
    const paybackYears = totalCost / noi;

    const verdict = roiPercent >= 15 ? 'GO' : roiPercent >= 10 ? 'CONDITIONAL' : 'NO-GO';

    setResults({
      totalCost,
      revenue,
      profit,
      roi: roiPercent,
      breakEven: paybackYears,  // This is now correctly calculated payback period
      verdict
    });
  }, [params, siteArea]);

  const baselineROI = (roi.riskAdjustedROI as number) || 0;
  const baselineCost = (roi.totalDevelopmentCost as number) || 0;
  const baselineProfit = (roi.profit as number) || 0;

  const delta = {
    roi: results ? results.roi - baselineROI : 0,
    cost: results ? results.totalCost - baselineCost : 0,
    profit: results ? results.profit - baselineProfit : 0
  };

  const handleSaveScenario = () => {
    const name = prompt('Enter scenario name:', `Scenario ${savedScenarios.length + 1}`);
    if (name && results) {
      setSavedScenarios([...savedScenarios, { name, params: { ...params }, results: { ...results } }]);
    }
  };

  const handleLoadScenario = (scenario: { params: ScenarioParams }) => {
    setParams({ ...scenario.params });
  };

  const handleReset = () => {
    setParams({
      constructionCostPerSqm: 2200,
      rentPerSqm: 65,
      interestRate: 6.5,
      timelineMonths: 8,
      far: baselineFAR,
      buildingHeight: baselineHeight
    });
  };

  if (!baselineData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <Sliders className="h-12 w-12 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
          <p className="text-white/60">Complete a site analysis first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Scenario Analysis</h2>
          <p className="text-white/60 text-sm mt-1">
            Adjust parameters to see real-time impact on project feasibility
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveScenario} variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <Card className="glass-panel p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white mb-4">Adjust Parameters</h3>

          {/* Construction Cost */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Construction Cost per m²</label>
              <span className="text-sm font-semibold text-white">${params.constructionCostPerSqm}</span>
            </div>
            <Slider
              value={[params.constructionCostPerSqm]}
              onValueChange={(v) => setParams({ ...params, constructionCostPerSqm: v[0] })}
              min={1500}
              max={3500}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>$1,500</span>
              <span>$3,500</span>
            </div>
          </div>

          {/* Market Rent */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Market Rent per m²/month</label>
              <span className="text-sm font-semibold text-white">${params.rentPerSqm}</span>
            </div>
            <Slider
              value={[params.rentPerSqm]}
              onValueChange={(v) => setParams({ ...params, rentPerSqm: v[0] })}
              min={30}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>$30</span>
              <span>$120</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Cap Rate / Interest Rate</label>
              <span className="text-sm font-semibold text-white">{params.interestRate.toFixed(1)}%</span>
            </div>
            <Slider
              value={[params.interestRate]}
              onValueChange={(v) => setParams({ ...params, interestRate: v[0] })}
              min={3}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>3.0%</span>
              <span>12.0%</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Construction Timeline</label>
              <span className="text-sm font-semibold text-white">{params.timelineMonths} months</span>
            </div>
            <Slider
              value={[params.timelineMonths]}
              onValueChange={(v) => setParams({ ...params, timelineMonths: v[0] })}
              min={3}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>3 mo</span>
              <span>24 mo</span>
            </div>
          </div>

          {/* FAR */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Floor Area Ratio (FAR)</label>
              <span className="text-sm font-semibold text-white">{params.far.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.far * 100]}
              onValueChange={(v) => setParams({ ...params, far: v[0] / 100 })}
              min={20}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>0.2</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Building Height */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-white/70">Building Height</label>
              <span className="text-sm font-semibold text-white">{params.buildingHeight.toFixed(1)}m / {Math.round(params.buildingHeight / 3)} floors</span>
            </div>
            <Slider
              value={[params.buildingHeight]}
              onValueChange={(v) => setParams({ ...params, buildingHeight: v[0] })}
              min={6}
              max={40}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-white/40">
              <span>6m</span>
              <span>40m</span>
            </div>
          </div>
        </Card>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Updated Results */}
          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                key={JSON.stringify(params)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glass-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Updated Results</h3>
                    <Badge 
                      className={`${
                        results.verdict === 'GO' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                          : results.verdict === 'CONDITIONAL'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }`}
                    >
                      {results.verdict}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {/* ROI */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <TrendingUp className="h-4 w-4" />
                          <span>ROI</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {results.roi.toFixed(1)}%
                          </div>
                          <DeltaBadge value={delta.roi} suffix="%" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Cost */}
                      <div>
                        <div className="text-xs text-white/50 mb-1">Total Dev Cost</div>
                        <div className="text-lg font-semibold text-white">
                          ${(results.totalCost / 1_000_000).toFixed(2)}M
                        </div>
                        <DeltaBadge value={delta.cost / 1_000_000} prefix="$" suffix="M" />
                      </div>

                      {/* Revenue */}
                      <div>
                        <div className="text-xs text-white/50 mb-1">Project Value</div>
                        <div className="text-lg font-semibold text-white">
                          ${(results.revenue / 1_000_000).toFixed(2)}M
                        </div>
                      </div>

                      {/* Profit */}
                      <div>
                        <div className="text-xs text-white/50 mb-1">Net Profit</div>
                        <div className="text-lg font-semibold text-white">
                          ${(results.profit / 1_000_000).toFixed(2)}M
                        </div>
                        <DeltaBadge value={delta.profit / 1_000_000} prefix="$" suffix="M" />
                      </div>

                      {/* Payback Period */}
                      <div>
                        <div className="text-xs text-white/50 mb-1">Payback Period</div>
                        <div className="text-lg font-semibold text-white">
                          {results.breakEven.toFixed(1)} years
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Insights */}
          {results && (
            <Card className="glass-panel p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI INSIGHTS
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {generateInsight(params, results, delta, baselineROI)}
              </p>
            </Card>
          )}

          {/* Saved Scenarios */}
          {savedScenarios.length > 0 && (
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Saved Scenarios</h3>
              <div className="space-y-2">
                {savedScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadScenario(scenario)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{scenario.name}</span>
                      <span className="text-xs text-white/60">
                        ROI: {scenario.results.roi.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DeltaBadge({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  if (Math.abs(value) < 0.1) return null;
  
  const isPositive = value > 0;
  return (
    <div className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? '▲' : '▼'} {prefix}{Math.abs(value).toFixed(1)}{suffix}
    </div>
  );
}

function generateInsight(params: ScenarioParams, results: ScenarioResults, delta: { roi: number; cost: number; profit: number }, baselineROI: number): string {
  const insights: string[] = [];

  if (Math.abs(delta.roi) > 2) {
    if (delta.roi > 0) {
      insights.push(`Your adjustments improved ROI by ${delta.roi.toFixed(1)}%.`);
    } else {
      insights.push(`These changes reduced ROI by ${Math.abs(delta.roi).toFixed(1)}%.`);
    }
  }

  if (params.far > 1.0) {
    insights.push(`Note: FAR of ${params.far.toFixed(2)} may require zoning variance.`);
  }

  if (params.rentPerSqm > 80) {
    insights.push(`$${params.rentPerSqm}/m² rent is at premium market rates. Ensure location supports this pricing.`);
  }

  if (params.timelineMonths < 6) {
    insights.push(`${params.timelineMonths}-month timeline is aggressive. Ensure design complexity aligns with schedule.`);
  }

  if (results.roi >= 20) {
    insights.push(`${results.roi.toFixed(1)}% ROI is exceptional. Verify assumptions before proceeding.`);
  }

  if (insights.length === 0) {
    insights.push(`This scenario maintains similar performance to baseline (${baselineROI.toFixed(1)}% ROI).`);
  }

  return insights.join(' ');
}
