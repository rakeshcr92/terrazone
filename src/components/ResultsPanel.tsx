import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Layers, Mountain } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface GeotechData {
  analysis: {
    soilStabilityScore: number;
    groundwaterDepthMeters: number;
    soilType: string;
    bearingCapacity: string;
    seismicRisk: string;
    drainageQuality: string;
  };
  recommendations: string[];
  timestamp: string;
  location: string;
}

interface ZoningData {
  zoning: {
    code: string;
    district: string;
    maxBuildingHeightMeters: number;
    maxFloors: number;
    lotCoverageMax: string;
    setbacks: {
      front: string;
      rear: string;
      side: string;
    };
    parkingRequired: string;
    permittedUses: string[];
    specialRequirements: string[];
  };
  compliance: {
    status: string;
    notes: string[];
  };
  retrievalMetadata: {
    documentsSearched: number;
    relevanceScore: number;
    lastUpdated: string;
    source: string;
  };
  timestamp: string;
}

interface ResultsPanelProps {
  loading: boolean;
  geotechData: GeotechData | null;
  zoningData: ZoningData | null;
  error: string | null;
}

const ResultsPanel = ({ loading, geotechData, zoningData, error }: ResultsPanelProps) => {
  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute left-4 top-4 bottom-4 w-96 glass-panel rounded-2xl p-6 text-white overflow-hidden flex flex-col"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--terra-orange))] to-[hsl(var(--terra-blue))] bg-clip-text text-transparent">
          Terra Zone
        </h1>
        <p className="text-sm text-white/70 mt-1">Real Estate Feasibility Dashboard</p>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--terra-orange))]" />
            <p className="mt-4 text-white/80">Analyzing site data...</p>
            <div className="mt-6 space-y-2 w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0 }}
                className="h-1 bg-gradient-to-r from-[hsl(var(--terra-orange))] to-transparent rounded"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-[hsl(var(--terra-blue))] to-transparent rounded"
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="mt-4 text-white/80 text-center">{error}</p>
          </motion.div>
        )}

        {!loading && !error && geotechData && zoningData && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-hidden"
          >
            <ScrollArea className="h-full pr-4 custom-scrollbar">
              <div className="space-y-6">
                {/* Geotech Agent Results */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Mountain className="w-5 h-5 text-[hsl(var(--terra-orange))]" />
                    <h2 className="text-lg font-semibold">Geotech Agent</h2>
                  </div>
                  
                  <div className="space-y-3 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Soil Stability</span>
                      <Badge variant="outline" className="bg-[hsl(var(--terra-success))]/20 text-[hsl(var(--terra-success))] border-[hsl(var(--terra-success))]/30">
                        {geotechData.analysis.soilStabilityScore}/100
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/50 text-xs">Groundwater</p>
                        <p className="font-medium">{geotechData.analysis.groundwaterDepthMeters}m</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Bearing Capacity</p>
                        <p className="font-medium">{geotechData.analysis.bearingCapacity}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Seismic Risk</p>
                        <p className="font-medium">{geotechData.analysis.seismicRisk}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Drainage</p>
                        <p className="font-medium">{geotechData.analysis.drainageQuality}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {geotechData.recommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 text-[hsl(var(--terra-success))] flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Legal Agent / Zoning RAG Results */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-[hsl(var(--terra-blue))]" />
                    <h2 className="text-lg font-semibold">Legal Agent (RAG)</h2>
                  </div>
                  
                  <div className="space-y-3 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{zoningData.zoning.code}</span>
                      <Badge variant="outline" className="bg-[hsl(var(--terra-blue))]/20 text-[hsl(var(--terra-blue))] border-[hsl(var(--terra-blue))]/30">
                        {zoningData.zoning.district}
                      </Badge>
                    </div>

                    <div className="bg-gradient-to-br from-[hsl(var(--terra-blue))]/20 to-transparent rounded-lg p-3 border border-[hsl(var(--terra-blue))]/30">
                      <p className="text-xs text-white/50 mb-1">Max Building Height</p>
                      <p className="text-2xl font-bold text-[hsl(var(--terra-blue))]">
                        {zoningData.zoning.maxBuildingHeightMeters}m
                      </p>
                      <p className="text-xs text-white/60 mt-1">{zoningData.zoning.maxFloors} floors max</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/50 text-xs">Lot Coverage</p>
                        <p className="font-medium">{zoningData.zoning.lotCoverageMax}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Front Setback</p>
                        <p className="font-medium">{zoningData.zoning.setbacks.front}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-2">Permitted Uses:</p>
                      <div className="flex flex-wrap gap-1">
                        {zoningData.zoning.permittedUses.slice(0, 3).map((use, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-white/10">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-1">RAG Metadata:</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">
                          {zoningData.retrievalMetadata.documentsSearched} docs • 
                          {(zoningData.retrievalMetadata.relevanceScore * 100).toFixed(0)}% relevance
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {!loading && !error && !geotechData && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--terra-orange))]/20 to-[hsl(var(--terra-blue))]/20 flex items-center justify-center mb-4">
              <Layers className="w-10 h-10 text-white/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Draw to Analyze</h3>
            <p className="text-sm text-white/60">
              Use the polygon tool to draw a site boundary on the map. Our agents will analyze soil feasibility and zoning compliance.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultsPanel;
