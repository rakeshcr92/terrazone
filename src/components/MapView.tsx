import { useEffect, useRef, useState, useCallback } from 'react';
import Map, { MapRef, Source, Layer } from 'react-map-gl/maplibre';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature, Polygon } from 'geojson';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { LocationSearch } from './LocationSearch';
import * as turf from '@turf/turf';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface MapViewProps {
  onPolygonComplete: (coordinates: number[][][]) => void;
  zoningHeight: number | null;
  drawnPolygon: Feature<Polygon> | null;
  isAnalyzing: boolean;
  analysisProgress: string;
  polygonArea: { sqFt: number; acres: string; sqMeters: number } | null;
  analysisComplete?: boolean;
  buildingData?: {
    maxHeight: number;
    maxFloors: number;
    far: number;
  } | null;
  comparisonMode?: boolean;
  comparisonSites?: Array<{
    polygon: Feature<Polygon>;
    buildingData: {
      maxHeight: number;
      maxFloors: number;
      far: number;
    };
    id: string;
  }>;
}

const MapView = ({ 
  onPolygonComplete, 
  zoningHeight, 
  drawnPolygon, 
  isAnalyzing, 
  analysisProgress, 
  polygonArea,
  analysisComplete = false,
  buildingData = null,
  comparisonMode = false,
  comparisonSites = []
}: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  // Suppress MapLibre errors on mount
  useEffect(() => {
    const originalError = console.error;
    const filteredError = (...args: unknown[]) => {
      const msg = String(args[0] || '');
      if (msg.includes('sources.') && msg.includes('unknown property') && msg.includes('data-')) {
        return; // Suppress React DevTools metadata warnings
      }
      originalError(...args);
    };
    console.error = filteredError;
    
    return () => {
      console.error = originalError;
    };
  }, []);

  const initializeDraw = useCallback(() => {
    if (!mapRef.current || drawRef.current) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: [
        // Custom styles for drawn polygons
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#FF8C42',
            'fill-opacity': 0.2
          }
        },
        {
          id: 'gl-draw-polygon-stroke',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'line-color': '#FF8C42',
            'line-width': 3
          }
        },
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 4,
            'circle-color': '#FF8C42'
          }
        },
        {
          id: 'gl-draw-polygon-vertex',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFFFFF',
            'circle-stroke-color': '#FF8C42',
            'circle-stroke-width': 2
          }
        }
      ]
    });

    mapRef.current.getMap().addControl(draw, 'top-left');
    drawRef.current = draw;

    // Listen for polygon creation
    mapRef.current.getMap().on('draw.create', (e) => {
      const features = e.features as Feature<Polygon>[];
      if (features && features[0] && features[0].geometry.coordinates) {
        const coords = features[0].geometry.coordinates;
        
        // CRITICAL DEBUG: Log coordinates immediately when captured from map
        console.log('🗺️ MAPVIEW: Polygon drawn - coordinates captured from MapboxDraw:');
        console.log('  - Type:', typeof coords);
        console.log('  - Is array?:', Array.isArray(coords));
        console.log('  - Outer ring length:', coords[0]?.length);
        console.log('  - First point [lng, lat]:', coords[0]?.[0]);
        console.log('  - Second point [lng, lat]:', coords[0]?.[1]);
        console.log('  - Last point [lng, lat]:', coords[0]?.[coords[0].length - 1]);
        console.log('  - Full structure:', JSON.stringify(coords));
        
        // Calculate area immediately to verify
        const turfPolygon = turf.polygon(coords);
        const areaSqMeters = turf.area(turfPolygon);
        console.log('🗺️ MAPVIEW: Area calculated from these coordinates:');
        console.log('  - Square meters:', areaSqMeters);
        console.log('  - Square feet:', Math.round(areaSqMeters * 10.7639));
        console.log('  - Acres:', (areaSqMeters * 0.000247105).toFixed(3));
        
        onPolygonComplete(coords);
      }
    });

    // Listen for polygon updates
    mapRef.current.getMap().on('draw.update', (e) => {
      const features = e.features as Feature<Polygon>[];
      if (features && features[0] && features[0].geometry.coordinates) {
        const coords = features[0].geometry.coordinates;
        console.log('🗺️ MAPVIEW: Polygon updated');
        onPolygonComplete(coords);
      }
    });

  }, [onPolygonComplete]);

  useEffect(() => {
    if (mapLoaded) {
      initializeDraw();
    }
  }, [mapLoaded, initializeDraw]);

  // Reset to 2D when analysis starts
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    const map = mapRef.current.getMap();
    
    if (isAnalyzing && !analysisComplete) {
      // Reset to top-down 2D view
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 800
      });
      setIs3DMode(false);
    }
  }, [isAnalyzing, analysisComplete, mapLoaded]);

  // Smooth 3D transition with data-driven building extrusions when analysis completes (single building mode)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !analysisComplete || !drawnPolygon || !buildingData || comparisonMode) return;

    const map = mapRef.current.getMap();
    
    // Remove existing 3D layers if present
    if (map.getLayer('zoning-glow')) map.removeLayer('zoning-glow');
    if (map.getLayer('zoning-extrusion')) map.removeLayer('zoning-extrusion');
    if (map.getSource('zoning-polygon-outline')) map.removeSource('zoning-polygon-outline');
    if (map.getSource('zoning-polygon')) map.removeSource('zoning-polygon');

    // Add source for 3D buildings
    map.addSource('zoning-polygon', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: drawnPolygon.geometry,
        properties: {
          height: buildingData.maxHeight,
          floors: buildingData.maxFloors,
          far: buildingData.far
        }
      }
    });

    // Add 3D extrusion layer with animation
    map.addLayer({
      id: 'zoning-extrusion',
      type: 'fill-extrusion',
      source: 'zoning-polygon',
      paint: {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'floors'],
          0, '#FF8C42',
          5, '#FF6B35',
          10, '#F7931E',
          20, '#FDB813'
        ],
        'fill-extrusion-height': 0, // Start at 0 for animation
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.85
      }
    });

    // Add glowing outline
    map.addSource('zoning-polygon-outline', {
      type: 'geojson',
      data: drawnPolygon
    });

    map.addLayer({
      id: 'zoning-glow',
      type: 'line',
      source: 'zoning-polygon-outline',
      paint: {
        'line-color': '#FF8C42',
        'line-width': 6,
        'line-blur': 12,
        'line-opacity': 0.6
      }
    });

    // Animate glow effect
    let opacity = 0.4;
    let increasing = true;
    const animateGlow = () => {
      if (!map.getLayer('zoning-glow')) return;
      
      if (increasing) {
        opacity += 0.02;
        if (opacity >= 0.8) increasing = false;
      } else {
        opacity -= 0.02;
        if (opacity <= 0.3) increasing = true;
      }
      map.setPaintProperty('zoning-glow', 'line-opacity', opacity);
      requestAnimationFrame(animateGlow);
    };

    // Step 1: Wait 300ms, then start camera animation
    setTimeout(() => {
      // Animate camera to 3D view (1500ms)
      map.easeTo({
        pitch: 60,
        bearing: -20,
        duration: 1500,
        easing: (t) => t * (2 - t) // easeOutQuad for smooth deceleration
      });
      
      setIs3DMode(true);
      
      // Step 2: After camera starts moving (wait 200ms), start building rise
      setTimeout(() => {
        // Animate building extrusion rising from ground (2000ms)
        const targetHeight = buildingData.maxHeight;
        const duration = 2000;
        const startTime = Date.now();
        
        const animateHeight = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Smooth easing function (easeOutCubic)
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentHeight = eased * targetHeight;
          
          if (map.getLayer('zoning-extrusion')) {
            map.setPaintProperty('zoning-extrusion', 'fill-extrusion-height', currentHeight);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateHeight);
          } else {
            // Start glow animation after building is fully risen
            animateGlow();
          }
        };
        
        animateHeight();
      }, 200);
    }, 300);

    // Cleanup function
    return () => {
      if (map.getLayer('zoning-glow')) map.removeLayer('zoning-glow');
      if (map.getLayer('zoning-extrusion')) map.removeLayer('zoning-extrusion');
      if (map.getSource('zoning-polygon-outline')) map.removeSource('zoning-polygon-outline');
      if (map.getSource('zoning-polygon')) map.removeSource('zoning-polygon');
    };
  }, [analysisComplete, drawnPolygon, buildingData, mapLoaded, comparisonMode]);

  // Render multiple 3D buildings in comparison mode
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !comparisonMode || comparisonSites.length === 0) return;

    const map = mapRef.current.getMap();

    // Clean up existing single building layers first
    if (map.getLayer('zoning-glow')) map.removeLayer('zoning-glow');
    if (map.getLayer('zoning-extrusion')) map.removeLayer('zoning-extrusion');
    if (map.getSource('zoning-polygon-outline')) map.removeSource('zoning-polygon-outline');
    if (map.getSource('zoning-polygon')) map.removeSource('zoning-polygon');

    // Clean up existing comparison layers
    comparisonSites.forEach((_, idx) => {
      const layerId = `comparison-extrusion-${idx}`;
      const glowId = `comparison-glow-${idx}`;
      const sourceId = `comparison-polygon-${idx}`;
      const outlineSourceId = `comparison-polygon-outline-${idx}`;
      
      if (map.getLayer(glowId)) map.removeLayer(glowId);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(outlineSourceId)) map.removeSource(outlineSourceId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });

    // Transition to 3D view
    setTimeout(() => {
      map.easeTo({
        pitch: 60,
        bearing: -20,
        duration: 1500,
        easing: (t) => t * (2 - t)
      });
      setIs3DMode(true);

      // Add 3D buildings for all comparison sites
      setTimeout(() => {
        comparisonSites.forEach((site, idx) => {
          const sourceId = `comparison-polygon-${idx}`;
          const outlineSourceId = `comparison-polygon-outline-${idx}`;
          const layerId = `comparison-extrusion-${idx}`;
          const glowId = `comparison-glow-${idx}`;

          // Add source for this building
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: site.polygon.geometry,
              properties: {
                height: site.buildingData.maxHeight,
                floors: site.buildingData.maxFloors,
                far: site.buildingData.far
              }
            }
          });

          // Add 3D extrusion layer
          map.addLayer({
            id: layerId,
            type: 'fill-extrusion',
            source: sourceId,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'floors'],
                0, '#FF8C42',
                5, '#FF6B35',
                10, '#F7931E',
                20, '#FDB813'
              ],
              'fill-extrusion-height': 0,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.85
            }
          });

          // Add glowing outline
          map.addSource(outlineSourceId, {
            type: 'geojson',
            data: site.polygon
          });

          map.addLayer({
            id: glowId,
            type: 'line',
            source: outlineSourceId,
            paint: {
              'line-color': '#FF8C42',
              'line-width': 6,
              'line-blur': 12,
              'line-opacity': 0.6
            }
          });

          // Animate building rise
          const targetHeight = site.buildingData.maxHeight;
          const duration = 2000;
          const startTime = Date.now();

          const animateHeight = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentHeight = eased * targetHeight;

            if (map.getLayer(layerId)) {
              map.setPaintProperty(layerId, 'fill-extrusion-height', currentHeight);
            }

            if (progress < 1) {
              requestAnimationFrame(animateHeight);
            } else {
              // Animate glow for this building
              let opacity = 0.4;
              let increasing = true;
              const animateGlow = () => {
                if (!map.getLayer(glowId)) return;
                
                if (increasing) {
                  opacity += 0.02;
                  if (opacity >= 0.8) increasing = false;
                } else {
                  opacity -= 0.02;
                  if (opacity <= 0.3) increasing = true;
                }
                map.setPaintProperty(glowId, 'line-opacity', opacity);
                requestAnimationFrame(animateGlow);
              };
              animateGlow();
            }
          };

          animateHeight();
        });
      }, 200);
    }, 300);

    // Cleanup
    return () => {
      comparisonSites.forEach((_, idx) => {
        const layerId = `comparison-extrusion-${idx}`;
        const glowId = `comparison-glow-${idx}`;
        const sourceId = `comparison-polygon-${idx}`;
        const outlineSourceId = `comparison-polygon-outline-${idx}`;
        
        if (map.getLayer(glowId)) map.removeLayer(glowId);
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(outlineSourceId)) map.removeSource(outlineSourceId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
    };
  }, [comparisonMode, comparisonSites, mapLoaded]);

  const handleStartDrawing = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
      setIsDrawing(true);
    }
  }, []);

  const handleDeleteAll = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setIsDrawing(false);
      onPolygonComplete([]);
    }
  }, [onPolygonComplete]);

  const handleLocationSelect = (lat: number, lon: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 16,
        duration: 2000
      });
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Premium Unified Top Navigation Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto w-[calc(100%-3rem)] max-w-7xl">
        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(255,140,66,0.15)] px-8 py-4">
          <div className="flex items-center gap-6">
            {/* Left: Brand with Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <img 
                src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100036138/55bf.png" 
                alt="Terra Zone Logo" 
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-2xl font-bold text-white tracking-wide whitespace-nowrap">
                Terra <span className="text-primary">Zone</span>
              </h1>
            </div>

            {/* Center: Actions */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleStartDrawing}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-semibold shadow-lg shadow-primary/30 transition-all rounded-full px-8 h-12 text-base"
              >
                <Pencil className="w-5 h-5 mr-2" />
                Draw Polygon
              </Button>
              
              <Button
                onClick={handleDeleteAll}
                variant="outline"
                className="bg-white/5 hover:bg-white/10 text-white border-white/20 font-medium transition-all rounded-full px-6 h-12"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear
              </Button>
            </div>

            {/* Right: Search - Full width */}
            <div className="flex-1 max-w-md ml-auto">
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </div>
          </div>
          
          {/* Drawing hint below */}
          {isDrawing && (
            <div className="text-center mt-3 pt-3 border-t border-white/10">
              <span className="text-white/70 text-sm animate-pulse">
                Click to draw, double-click to finish
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Processing Indicator */}
      {isAnalyzing && (
        <div className="absolute top-32 left-6 z-10">
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-xl px-5 py-4 shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              <div>
                <div className="text-base font-semibold text-white">Analyzing...</div>
                <div className="text-sm text-white/60">{analysisProgress}</div>
              </div>
            </div>
            {polygonArea && (
              <div className="text-sm text-primary/90 font-mono border-t border-white/10 pt-3 mt-3">
                📐 {polygonArea.sqFt.toLocaleString()} ft² / {polygonArea.acres} acres
              </div>
            )}
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -74.6672,
          latitude: 40.3573,
          zoom: 14,
          pitch: 0,
          bearing: 0
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        onLoad={() => setMapLoaded(true)}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      />
    </div>
  );
};

export default MapView;
