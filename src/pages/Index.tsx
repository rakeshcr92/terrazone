import { useState } from 'react';
import type { Feature, Polygon } from 'geojson';
import * as turf from '@turf/turf';
import MapView from '@/components/MapView';
import { DecisionPanel } from '@/components/DecisionPanel';
import { SiteComparison } from '@/components/SiteComparison';
import { ScenarioAnalysis } from '@/components/ScenarioAnalysis';
import { ReportGenerator } from '@/components/ReportGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

export default function Index() {
  const [decisionData, setDecisionData] = useState<Record<string, unknown> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [drawnPolygon, setDrawnPolygon] = useState<Feature<Polygon> | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'compare' | 'scenario' | 'report'>('decision');
  const [polygonArea, setPolygonArea] = useState<{ sqFt: number; acres: string; sqMeters: number } | null>(null);
  const [analyzedSites, setAnalyzedSites] = useState<Array<Record<string, unknown>>>([]);

  const handlePolygonComplete = async (coordinates: number[][][]) => {
    // Store the drawn polygon for map rendering
    const polygon: Feature<Polygon> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates
      },
      properties: {}
    };
    setDrawnPolygon(polygon);
    
    setIsAnalyzing(true);
    setDecisionData(null);
    setActiveTab('decision');
    setAnalysisProgress('Initializing AI Decision Engine...');

    try {
      console.log('🚀 Initiating Terra Zone Decision Engine...');
      
      // Calculate area using turf.js (frontend validation)
      const points = coordinates[0];
      const closedPoints = points[points.length - 1][0] === points[0][0] && 
                          points[points.length - 1][1] === points[0][1]
        ? points
        : [...points, points[0]];
      
      const turfPolygon = turf.polygon([closedPoints]);
      const areaSqMeters = turf.area(turfPolygon);
      const sqFt = Math.round(areaSqMeters * 10.7639);
      const acres = (areaSqMeters * 0.000247105).toFixed(3);
      
      console.log('📐 Frontend calculated area:');
      console.log('  - Square meters:', areaSqMeters);
      console.log('  - Square feet:', sqFt.toLocaleString());
      console.log('  - Acres:', acres);
      
      // Store area for immediate display
      setPolygonArea({ sqFt, acres, sqMeters: areaSqMeters });
      
      // Validate minimum area
      if (areaSqMeters < 100) {
        alert(`Polygon too small: ${sqFt} ft² / ${acres} acres\n\nMinimum required: 1,076 ft² (0.025 acres)\n\nPlease draw a larger area.`);
        setIsAnalyzing(false);
        setPolygonArea(null);
        return;
      }
      
      // Update progress during analysis
      const progressInterval = setInterval(() => {
        const messages = [
          'Phase 1: Geological Analysis...',
          'Phase 2: Zoning Compliance Check...',
          'Phase 3: Foundation Cost Estimation...',
          'Phase 4: ROI Prediction...',
          'Phase 5: Final AI Verdict...'
        ];
        setAnalysisProgress(messages[Math.floor(Math.random() * messages.length)]);
      }, 3000);
      
      // Set a timeout for the analysis (90 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout - please try again')), 90000)
      );

      // ==== CRITICAL DEBUG: Log coordinates before sending ====
      console.log('🔍 COORDINATES BEING SENT TO BACKEND:');
      console.log('  - coordinates type:', typeof coordinates);
      console.log('  - coordinates array?:', Array.isArray(coordinates));
      console.log('  - coordinates length:', coordinates?.length);
      console.log('  - coordinates[0] length:', coordinates?.[0]?.length);
      console.log('  - First 3 points:', JSON.stringify(coordinates?.[0]?.slice(0, 3)));
      console.log('  - Last point:', JSON.stringify(coordinates?.[0]?.[coordinates[0].length - 1]));
      console.log('  - Full coordinates structure:', JSON.stringify(coordinates));
      console.log('📊 CALCULATED AREA (frontend):');
      console.log('  - Square meters:', areaSqMeters);
      console.log('  - Square feet:', sqFt);
      console.log('  - Acres:', acres);
      
      // Call the autonomous decision engine with timeout
      const analysisPromise = supabase.functions.invoke('decision-engine', {
        body: { 
          coordinates,
          siteName: `Site Analysis ${new Date().toLocaleString()}`,
          calculatedArea: { sqMeters: areaSqMeters, sqFt, acres },
          // CRITICAL: Pass the frontend-calculated area to override backend calculation
          frontendCalculatedAreaSqm: areaSqMeters
        }
      });

      const response = await Promise.race([analysisPromise, timeoutPromise]) as { data?: unknown; error?: Error };

      clearInterval(progressInterval);

      if (response.error) {
        console.error('❌ Decision engine error:', response.error);
        alert(`Analysis failed: ${response.error.message || 'Unknown error'}`);
        throw response.error;
      }

      const result = response.data;
      console.log('========== ANALYSIS COMPLETE ==========');
      console.log('✅ Full result object:', result);
      console.log('✅ Site area from backend:', (result as Record<string, unknown>)?.site?.area, 'm²');
      console.log('=======================================');

      setDecisionData(result as Record<string, unknown>);
      
      // ADD TO COMPARISON LIST (Phase 1 Feature #1)
      const siteWithId = {
        ...(result as Record<string, unknown>),
        id: Date.now().toString(),
        name: ((result as Record<string, unknown>).site as Record<string, unknown>)?.name as string || `Site ${analyzedSites.length + 1}`,
        timestamp: new Date().toISOString()
      };
      setAnalyzedSites(prev => [...prev, siteWithId]);
      console.log(`✅ Site added. Total: ${analyzedSites.length + 1}`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setPolygonArea(null);
      if (error instanceof Error && error.message.includes('timeout')) {
        alert('Analysis timeout. Backend may be busy. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  return (
    <PanelGroup direction="horizontal" className="h-screen w-screen bg-background">
      {/* Main Map Area - Resizable */}
      <Panel defaultSize={65} minSize={30} className="relative">
        <MapView 
          onPolygonComplete={handlePolygonComplete}
          zoningHeight={
            decisionData?.analysis?.zoning?.zoning?.max_height_meters || 
            decisionData?.analysis?.zoning?.zoning?.maxBuildingHeightMeters || 
            null
          }
          drawnPolygon={drawnPolygon}
          isAnalyzing={isAnalyzing}
          analysisProgress={analysisProgress}
          polygonArea={polygonArea}
          analysisComplete={!isAnalyzing && !!decisionData}
          buildingData={
            decisionData?.analysis?.zoning?.zoning ? {
              maxHeight: (decisionData.analysis.zoning.zoning as Record<string, unknown>).max_height_meters as number || 
                        (decisionData.analysis.zoning.zoning as Record<string, unknown>).maxBuildingHeightMeters as number || 
                        30,
              maxFloors: (decisionData.analysis.zoning.zoning as Record<string, unknown>).max_floors as number || 
                        (decisionData.analysis.zoning.zoning as Record<string, unknown>).maxFloors as number || 
                        10,
              far: (decisionData.analysis.zoning.zoning as Record<string, unknown>).far as number || 0.5
            } : null
          }
          comparisonMode={activeTab === 'compare' && analyzedSites.length > 0}
          comparisonSites={
            activeTab === 'compare' ? analyzedSites.map((site) => {
              const siteData = (site?.site || {}) as Record<string, unknown>;
              const coordinates = siteData?.coordinates as number[][][] || siteData?.polygon as number[][][] || [];
              const zoning = ((site?.analysis as Record<string, unknown>)?.zoning as Record<string, unknown>)?.zoning as Record<string, unknown> || {};
              
              return {
                id: site?.id as string || Date.now().toString(),
                polygon: {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: coordinates
                  },
                  properties: {}
                } as Feature<Polygon>,
                buildingData: {
                  maxHeight: (zoning.max_height_meters as number) || (zoning.maxBuildingHeightMeters as number) || 30,
                  maxFloors: (zoning.max_floors as number) || (zoning.maxFloors as number) || 10,
                  far: (zoning.far as number) || 0.5
                }
              };
            }).filter(site => site.polygon.geometry.coordinates.length > 0) : []
          }
        />
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-1 bg-border/30 hover:bg-primary/50 active:bg-primary transition-colors cursor-col-resize" />

      {/* Right Panel with ALL Features - Resizable */}
      <Panel defaultSize={35} minSize={20} maxSize={60} className="h-screen flex flex-col bg-black border-l border-border/30" style={{ backgroundColor: '#0A0A0A' }}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="h-full flex flex-col">
          {/* Premium Minimal Tab Navigation */}
          <TabsList className="w-full rounded-none border-none bg-transparent backdrop-blur-sm grid grid-cols-4 flex-shrink-0 p-0 h-14" style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)' }}>
            <TabsTrigger 
              value="decision" 
              className="text-sm font-semibold text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all hover:text-white/90 hover:bg-white/[0.03]"
            >
              Decision
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              disabled={analyzedSites.length === 0}
              className="text-sm font-semibold text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all hover:text-white/90 hover:bg-white/[0.03] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Compare{analyzedSites.length > 0 && ` (${analyzedSites.length})`}
            </TabsTrigger>
            <TabsTrigger 
              value="scenario" 
              disabled={!decisionData}
              className="text-sm font-semibold text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all hover:text-white/90 hover:bg-white/[0.03] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Scenarios
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!decisionData}
              className="text-sm font-semibold text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all hover:text-white/90 hover:bg-white/[0.03] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              PDF
            </TabsTrigger>
          </TabsList>

          {/* Decision Panel - SCROLLABLE CONTENT AREA */}
          <TabsContent value="decision" className="flex-1 mt-0 p-0 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ backgroundColor: '#0A0A0A' }}>
            <div className="p-6" style={{ backgroundColor: '#0A0A0A' }}>
              {decisionData || isAnalyzing ? (
                <DecisionPanel 
                  decision={decisionData} 
                  isLoading={isAnalyzing} 
                  progressMessage={analysisProgress}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8 max-w-sm">
                    <h2 className="text-xl font-bold text-white mb-2">Draw to Analyze</h2>
                    <p className="text-white/60 text-sm">Draw a polygon on the map to get instant GO/NO-GO verdict with analysis</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* PHASE 1 FEATURE #1: Multi-Site Comparison */}
          <TabsContent value="compare" className="flex-1 mt-0 overflow-y-auto p-6 bg-black">
            {analyzedSites.length > 0 ? (
              <SiteComparison 
                sites={analyzedSites.map(site => ({
                  id: site?.id as string,
                  name: site?.name as string,
                  verdict: site?.verdict as string,
                  analysis: site?.analysis as Record<string, unknown>,
                  site: site?.site as Record<string, unknown>,
                  timestamp: site?.timestamp as string
                }))}
                onRemoveSite={(id) => setAnalyzedSites(prev => prev.filter(s => s.id !== id))}
                onSelectSite={(site) => {
                  setDecisionData(site as unknown as Record<string, unknown>);
                  setActiveTab('decision');
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <h3 className="text-xl font-semibold text-white mb-2">No Sites to Compare</h3>
                  <p className="text-white/60">Analyze multiple sites to see comparison</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* PHASE 1 FEATURE #2: Scenario Analysis */}
          <TabsContent value="scenario" className="flex-1 mt-0 overflow-y-auto p-6 bg-black">
            {decisionData && (
              <ScenarioAnalysis 
                baselineData={decisionData}
                siteArea={((decisionData.site as Record<string, unknown>)?.area as number) || 0}
              />
            )}
          </TabsContent>

          {/* PHASE 1 FEATURE #3: Report Generator */}
          <TabsContent value="report" className="flex-1 mt-0 overflow-y-auto p-6 bg-black">
            {decisionData && (
              <ReportGenerator siteData={decisionData} />
            )}
          </TabsContent>
        </Tabs>
      </Panel>
    </PanelGroup>
  );
}
