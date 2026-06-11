import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { stations } from '../data/stations';
import { lines } from '../data/lines';
import { interchanges } from '../data/interchanges';
import type { RouteResult } from '../types/route';
import { useTranslation } from '../i18n/useTranslation';
import { useAppSelector } from '../app/hooks';

// Import Leaflet CSS in main or here
import 'leaflet/dist/leaflet.css';

interface MetroMapProps {
  computedRoute: RouteResult | null;
  isVisible?: boolean;
  hoveredStationId?: string | null;
  onHoverStation?: (id: string | null) => void;
}

const MapVisibilityController: React.FC<{ isVisible?: boolean }> = ({ isVisible }) => {
  const map = useMap();
  React.useEffect(() => {
    if (isVisible) {
      setTimeout(() => map.invalidateSize(), 50);
    }
  }, [isVisible, map]);
  return null;
};

// Controller to dynamically pan/zoom map to fit computed route bounds
const MapBoundsController: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
        animate: true,
        duration: 1.5
      });
    } else {
      // Cairo Metro center (Sadat area)
      map.setView([30.0444, 31.2357], 12);
    }
  }, [points, map]);

  return null;
};

export const MetroMap: React.FC<MetroMapProps> = ({ computedRoute, isVisible, hoveredStationId, onHoverStation }) => {
  const { language, t } = useTranslation();
  const themeMode = useAppSelector(state => state.theme.mode);

  // 1. Get stations on the computed route
  const routeStationCoords = useMemo((): [number, number][] => {
    if (!computedRoute || computedRoute.path.length === 0) return [];
    return computedRoute.path
      .map(id => {
        const station = stations.find(s => s.id === id);
        return station ? [station.lat, station.lon] as [number, number] : null;
      })
      .filter((coord): coord is [number, number] => coord !== null);
  }, [computedRoute]);

  // Helper to find closest index in shapePoints to a given coordinate
  const findClosestIndex = (coords: [number, number], shapePoints: [number, number][]) => {
    let minDistance = Infinity;
    let closestIdx = 0;
    shapePoints.forEach((pt, idx) => {
      const d = Math.pow(pt[0] - coords[0], 2) + Math.pow(pt[1] - coords[1], 2);
      if (d < minDistance) {
        minDistance = d;
        closestIdx = idx;
      }
    });
    return closestIdx;
  };

  // Extract accurate GTFS shapes for the active route segments
  const activeRouteSegments = useMemo(() => {
    if (!computedRoute) return [];
    
    return computedRoute.segments.map(segment => {
      const line = lines.find(l => l.id === segment.lineId);
      if (!line) return null;
      
      const firstStationId = segment.stations[0];
      const lastStationId = segment.stations[segment.stations.length - 1];
      
      const startStation = stations.find(s => s.id === firstStationId);
      const endStation = stations.find(s => s.id === lastStationId);
      
      if (!startStation || !endStation) return null;
      
      const startIdx = findClosestIndex([startStation.lat, startStation.lon], line.shapePoints);
      const endIdx = findClosestIndex([endStation.lat, endStation.lon], line.shapePoints);
      
      const minIdx = Math.min(startIdx, endIdx);
      const maxIdx = Math.max(startIdx, endIdx);
      
      return {
        color: line.color,
        points: line.shapePoints.slice(minIdx, maxIdx + 1)
      };
    }).filter(Boolean) as { color: string, points: [number, number][] }[];
  }, [computedRoute]);

  // Helper to check if a station is on the active route
  const isStationOnRoute = (stationId: string) => {
    if (!computedRoute) return false;
    return computedRoute.path.includes(stationId);
  };

  // Helper to determine station color
  const getStationColor = (stationId: string, servingLines: string[]) => {
    const isHighlighted = isStationOnRoute(stationId);
    
    // If it's an interchange, use emblem white/red styling
    if (interchanges.includes(stationId)) {
      return isHighlighted ? '#C01010' : '#3070A0';
    }

    // Otherwise, color by the line serving it
    const primaryLineId = servingLines[0];
    const line = lines.find(l => l.id === primaryLineId);
    return line?.color || '#3070A0';
  };

  // Build a map of station ID to all lines that serve it
  const stationLinesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    stations.forEach(st => {
      map[st.id] = [];
      lines.forEach(ln => {
        if (ln.stations.includes(st.id)) {
          map[st.id].push(ln.id);
        }
      });
    });
    return map;
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border shadow-md relative min-h-[450px]">
      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> | Data: Transport for Cairo GTFS'
          url={themeMode === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />

        {/* 2. Render Metro Line Tracks */}
        {lines.map(line => (
          <Polyline
            key={line.id}
            positions={line.shapePoints}
            pathOptions={{
              color: line.color,
              weight: 5,
              opacity: computedRoute ? 0.3 : 0.85,
              lineJoin: 'round'
            }}
          />
        ))}

        {/* 3. Render Computed Route Highlight using exact GTFS geometry casing */}
        {activeRouteSegments.map((seg, idx) => (
          <React.Fragment key={idx}>
            {/* Outer Casing / Glow */}
            <Polyline
              positions={seg.points}
              pathOptions={{
                color: themeMode === 'dark' ? '#14161A' : '#FFFFFF',
                weight: 12,
                opacity: 0.9,
                lineJoin: 'round'
              }}
            />
            {/* Inner Thick Colored Line */}
            <Polyline
              positions={seg.points}
              pathOptions={{
                color: seg.color,
                weight: 6,
                opacity: 1,
                lineJoin: 'round'
              }}
            />
            {/* Animated Flow Dash Array */}
            <Polyline
              positions={seg.points}
              className="route-flow-animation"
              pathOptions={{
                color: themeMode === 'dark' ? '#FFFFFF' : '#FFFFFF',
                weight: 2,
                opacity: 0.8,
                dashArray: '4, 12',
                lineJoin: 'round'
              }}
            />
          </React.Fragment>
        ))}

        {/* 4. Render Station Nodes */}
        {stations.map(station => {
          const servingLines = stationLinesMap[station.id] || [];
          const isInterchange = interchanges.includes(station.id);
          const isHighlighted = isStationOnRoute(station.id);
          const stationColor = getStationColor(station.id, servingLines);

          const isOrigin = computedRoute?.path[0] === station.id;
          const isDest = computedRoute?.path[computedRoute?.path.length - 1] === station.id;
          const isHovered = hoveredStationId === station.id;
          
          const radius = isOrigin || isDest ? 10 
            : isHovered ? 9
            : isHighlighted && isInterchange ? 8 
            : isHighlighted ? 6
            : isInterchange ? 6 : 4;
            
          const opacity = computedRoute && !isHighlighted ? 0.3 : 1;

          return (
            <CircleMarker
              key={station.id}
              center={[station.lat, station.lon]}
              radius={radius}
              eventHandlers={{
                mouseover: () => onHoverStation?.(station.id),
                mouseout: () => onHoverStation?.(null)
              }}
              pathOptions={{
                fillColor: (isHighlighted && isInterchange) || isOrigin || isDest ? '#FFFFFF' : stationColor,
                color: isHovered || isOrigin || isDest ? '#C01010' : (isHighlighted ? '#FFFFFF' : stationColor),
                weight: isHovered || isOrigin || isDest || (isHighlighted && isInterchange) ? 2.5 : 1.5,
                fillOpacity: opacity,
                opacity: opacity
              }}
            >
              <Popup>
                <div className="p-1 flex flex-col items-center">
                  <span className="font-bold text-text text-sm">
                    {language === 'ar' ? station.nameAr : station.nameEn}
                  </span>
                  {language === 'ar' && (
                    <span className="text-xs text-text-muted font-normal">
                      {station.nameEn}
                    </span>
                  )}
                  {language === 'en' && (
                    <span className="text-xs text-text-muted font-normal">
                      {station.nameAr}
                    </span>
                  )}
                  
                  <div className="flex gap-1 mt-2">
                    {servingLines.map(lineId => {
                      const line = lines.find(l => l.id === lineId);
                      return (
                        <span
                          key={lineId}
                          className="px-1.5 py-0.5 rounded text-[10px] text-white font-bold"
                          style={{ backgroundColor: line?.color }}
                        >
                          {language === 'ar' ? (lineId === 'L1' ? 'خط ١' : lineId === 'L2' ? 'خط ٢' : 'خط ٣') : lineId}
                        </span>
                      );
                    })}
                  </div>
                  {isInterchange && (
                    <span className="text-[10px] text-brand-red font-semibold mt-1">
                      {t.interchangeCallout}
                    </span>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 5. Trigger Zoom to Bounds */}
        <MapBoundsController points={routeStationCoords} />
        {/* 6. Trigger Map Size Update when visible */}
        <MapVisibilityController isVisible={isVisible} />
      </MapContainer>
    </div>
  );
};
