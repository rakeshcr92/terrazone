import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipToGoButtonProps {
  decision: Record<string, unknown>;
}

export function FlipToGoButton({ decision }: FlipToGoButtonProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [alternatives, setAlternatives] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Validate decision data on mount
  if (!decision || typeof decision !== 'object') {
    console.error('❌ FlipToGoButton: Invalid decision data received:', decision);
    return null;
  }

  const handleFlipToGo = async () => {
    setIsFlipping(true);
    setShowAlternatives(true);

    try {
      console.log('🔄 Requesting Path to GO analysis...');
      console.log('📦 Decision data structure:', {
        hasVerdict: 'verdict' in decision,
        hasAnalysis: 'analysis' in decision,
        hasDecision: 'decision' in decision,
        hasSite: 'site' in decision,
        verdict: decision.verdict,
        keys: Object.keys(decision)
      });

      // Safely extract data with fallbacks
      const verdict = (decision.verdict as string) || 'CONDITIONAL';
      const analysis = decision.analysis || {};
      const decisionData = decision.decision || {};
      const site = decision.site || {};

      console.log('✅ Extracted data:', { verdict, hasAnalysis: !!analysis, hasDecision: !!decisionData, hasSite: !!site });
      
      const { data, error } = await supabase.functions.invoke('gemini-orchestrator', {
        body: {
          systemPrompt: `You are a strategic real estate development consultant analyzing how to transform a CONDITIONAL or NO-GO project into a GO verdict.

Provide EXACTLY 3 specific, data-driven recommendations based on the actual site metrics provided:

1. DESIGN OPTIMIZATION: One architectural or engineering change that reduces costs or improves feasibility
   - Must reference specific numbers from context (e.g., "Reduce from 3 to 2 floors")
   - Quantify impact (e.g., "cuts foundation cost by $28k, 18% savings")
   - Explain feasibility improvement (e.g., "raises feasibility score from 67 to 82")

2. PHASING STRATEGY: One approach to break the project into manageable phases
   - Include timeline with specific months (e.g., "Phase 1 in 8 months")
   - Quantify capital reduction (e.g., "reduces upfront requirement by 35%")
   - Show revenue timing (e.g., "generates $280k to finance Phase 2")

3. FINANCIAL ENGINEERING: One creative financing or revenue optimization strategy
   - Must use real numbers from context (current ROI, costs, revenue)
   - Show before/after comparison (e.g., "ROI from 14% to 19%")
   - Specify mechanism (zoning variance, mixed-use, tax credits, etc.)

CRITICAL RULES:
- Each recommendation = ONE clear sentence with specific numbers
- Use bullet points (•) for formatting
- NO vague phrases like "consider", "explore", "could help"
- ONLY strategies feasible with the given site constraints
- Reference actual data: current ROI %, costs, buildable area, zoning limits`,
          userPrompt: `Current Status: ${verdict} verdict

Site Metrics:
- ROI: ${JSON.stringify((analysis as Record<string, unknown>).roi || {})}
- Foundation: ${JSON.stringify((analysis as Record<string, unknown>).foundation || {})}
- Zoning: ${JSON.stringify(((analysis as Record<string, unknown>).zoning as Record<string, unknown>)?.zoning || {})}
- Geological: ${JSON.stringify(((analysis as Record<string, unknown>).geological as Record<string, unknown>)?.geological || {})}

What are the 3 most impactful, specific changes to achieve GO status? Use the EXACT numbers above in your recommendations.`,
          context: {
            verdict,
            analysis,
            decision: decisionData,
            site
          }
        },
      });

      console.log('📥 Path to GO response:', { data, error });

      if (error) {
        console.error('❌ API Error:', error);
        throw new Error('AI service temporarily unavailable');
      }
      
      if (!data || !data.reasoning) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid AI response format');
      }

      console.log('✅ Path to GO generated successfully');
      console.log('📝 Raw AI response length:', data.reasoning?.length);
      console.log('📝 Raw AI response preview:', data.reasoning?.substring(0, 200));
      
      // Validate response isn't empty or too short
      const cleanResponse = data.reasoning.trim();
      if (cleanResponse.length < 50) {
        console.error('❌ Response too short:', cleanResponse);
        throw new Error('AI response insufficient');
      }
      
      setAlternatives(cleanResponse);
    } catch (error) {
      console.error('💥 Error generating alternatives:', error);
      console.error('📦 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        decision: decision,
        hasAnalysis: !!(decision?.analysis),
        hasDecision: !!(decision?.decision)
      });
      
      // Show data-driven fallback instead of generic error
      const roi = (decision?.analysis as Record<string, unknown>)?.roi as Record<string, unknown> | undefined;
      const foundation = (decision?.analysis as Record<string, unknown>)?.foundation as Record<string, unknown> | undefined;
      const zoning = ((decision?.analysis as Record<string, unknown>)?.zoning as Record<string, unknown>)?.zoning as Record<string, unknown> | undefined;
      
      if (roi && foundation && zoning) {
        // Build data-driven recommendations
        const currentROI = roi.riskAdjustedROI as number || 0;
        const foundationCost = foundation.totalCost as number || 0;
        const maxFloors = zoning.max_floors as number || 2;
        
        const fallbackRecommendations = [
          `• DESIGN: Reduce from ${maxFloors} to ${maxFloors - 1} floors to lower foundation complexity, potentially cutting costs by $${Math.round(foundationCost * 0.15 / 1000)}k-$${Math.round(foundationCost * 0.25 / 1000)}k (15-25% savings) and improving feasibility.`,
          `• PHASING: Develop site in 2 phases - build 50% initially to generate revenue within 8-10 months, then use cash flow to finance remaining 50%, reducing upfront capital by approximately 40%.`,
          `• FINANCIAL: Optimize revenue mix or pursue zoning variance for increased density, targeting 3-5 percentage point ROI improvement from current ${currentROI.toFixed(1)}% to ${(currentROI + 4).toFixed(1)}%.`
        ].join('\n\n');
        
        console.log('✅ Using data-driven fallback recommendations');
        setAlternatives(fallbackRecommendations);
      } else {
        // Generic error message only if we have no data
        setAlternatives('⚠️ Unable to generate recommendations at this time.\n\nThis could be due to:\n• Network connectivity issues\n• AI service temporarily unavailable\n• Insufficient analysis data\n\nPlease try drawing a new polygon or refresh the page.');
      }
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <>
      <Card className="glass-panel p-5 border-2 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
        {/* Shimmer animation background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="relative space-y-2">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">Turn This Into a GO</h3>
              <p className="text-xs text-white/60 mt-0.5">Get AI-powered recommendations to improve viability</p>
            </div>
          </div>
          
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-6 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            size="lg"
            onClick={handleFlipToGo}
            disabled={isFlipping}
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={isFlipping ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isFlipping ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing alternatives...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Show Me What Changes Would Work
                </>
              )}
            </motion.div>
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {showAlternatives && alternatives && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-panel p-6 border-2 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">
                    Path to GO
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    AI-recommended changes to achieve GO status
                  </p>
                </div>
              </div>
              
              {/* Parse and display recommendations with visual hierarchy */}
              <div className="space-y-3">
                {(() => {
                  // Check if it's an error message
                  if (alternatives.includes('⚠️') || alternatives.includes('Unable to generate')) {
                    return (
                      <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">⚠️</div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                              Service Unavailable
                            </h4>
                            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                              {alternatives.replace('⚠️', '').trim()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Parse recommendations - handle multiple formats
                  console.log('🔍 Parsing alternatives:', alternatives.substring(0, 300));
                  
                  // Try multiple splitting strategies
                  let lines = alternatives.split('\n').filter(line => line.trim());
                  
                  // If only 1-2 lines, try splitting by bullet points or numbers
                  if (lines.length < 3) {
                    console.log('⚠️ Few lines detected, trying alternative split methods');
                    // Try splitting by numbered lists: "1." "2." "3."
                    const numberedSplit = alternatives.split(/(?=\d+\.\s)/);
                    if (numberedSplit.length >= 3) {
                      lines = numberedSplit.filter(l => l.trim());
                      console.log('✅ Split by numbers:', lines.length);
                    } else {
                      // Try splitting by bullet points
                      const bulletSplit = alternatives.split(/(?=[•-])/);
                      if (bulletSplit.length >= 3) {
                        lines = bulletSplit.filter(l => l.trim());
                        console.log('✅ Split by bullets:', lines.length);
                      }
                    }
                  }
                  
                  console.log('📊 Total lines after split:', lines.length);
                  
                  const recommendations = lines.map((line, idx) => {
                    // More aggressive cleaning - remove bullets, numbers, and markdown
                    const cleanLine = line
                      .replace(/^[•\-\d.)\]\s]+/, '') // Remove leading bullets/numbers
                      .replace(/\*\*/g, '') // Remove bold markdown
                      .replace(/\*/g, '') // Remove italic markdown
                      .trim();
                    
                    console.log(`Line ${idx}: "${cleanLine.substring(0, 50)}..." (${cleanLine.length} chars)`);
                    
                    let bgClass = 'bg-blue-500/5';
                    let borderClass = 'border-blue-500/20';
                    let textClass = 'text-blue-400';
                    let icon = '💡';
                    let title = 'Recommendation';
                    
                    const lowerLine = cleanLine.toLowerCase();
                    
                    if (lowerLine.includes('design') || lowerLine.includes('architect') || lowerLine.includes('optimization')) {
                      bgClass = 'bg-purple-500/5';
                      borderClass = 'border-purple-500/20';
                      textClass = 'text-purple-400';
                      icon = '🏗️';
                      title = 'Design Optimization';
                    } else if (lowerLine.includes('phas') || lowerLine.includes('timeline') || lowerLine.includes('stage') || lowerLine.includes('strategy')) {
                      bgClass = 'bg-blue-500/5';
                      borderClass = 'border-blue-500/20';
                      textClass = 'text-blue-400';
                      icon = '📅';
                      title = 'Phasing Strategy';
                    } else if (lowerLine.includes('financ') || lowerLine.includes('roi') || lowerLine.includes('revenue') || lowerLine.includes('cost') || lowerLine.includes('engineering')) {
                      bgClass = 'bg-green-500/5';
                      borderClass = 'border-green-500/20';
                      textClass = 'text-green-400';
                      icon = '💰';
                      title = 'Financial Engineering';
                    }
                    
                    // More lenient length check - sometimes short but valid recommendations
                    return cleanLine && cleanLine.length > 15 ? (
                      <div key={idx} className={`p-4 ${bgClass} rounded-lg border ${borderClass}`}>
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-semibold ${textClass} uppercase tracking-wide mb-2`}>
                              {title}
                            </h4>
                            <p className="text-sm text-white/90 leading-relaxed break-words">{cleanLine}</p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  });

                  // Filter out null values
                  const validRecommendations = recommendations.filter(r => r !== null);
                  
                  console.log('✅ Valid recommendations count:', validRecommendations.length);

                  // If we got valid recommendations, show them
                  if (validRecommendations.length > 0) {
                    return validRecommendations;
                  }

                  // Fallback - show raw text as single block (better than empty bullet)
                  console.warn('⚠️ No valid recommendations parsed - showing raw text');
                  return (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">💡</div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
                            Recommendations
                          </h4>
                          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                            {alternatives.replace(/[*#]/g, '').trim()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
