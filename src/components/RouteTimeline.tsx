import React from 'react';
import { ArrowRight, ArrowLeft, GitCommit, GitPullRequest, ArrowDown } from 'lucide-react';
import type { RouteResult } from '../types/route';
import { stations } from '../data/stations';
import { lines } from '../data/lines';
import { useTranslation } from '../i18n/useTranslation';
import { LineBadge } from './LineBadge';

interface RouteTimelineProps {
  route: RouteResult;
  hoveredStationId?: string | null;
  onHoverStation?: (id: string | null) => void;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({ route, hoveredStationId, onHoverStation }) => {
  const { language, isRtl, t } = useTranslation();

  // Helper to look up station details
  const getStation = (id: string) => {
    return stations.find(s => s.id === id);
  };

  // Helper to look up line details
  const getLine = (id: string) => {
    return lines.find(l => l.id === id);
  };

  if (!route || route.path.length === 0) return null;

  return (
    <div className="flex flex-col w-full bg-surface rounded-xl p-5 border border-border shadow-md">
      <h3 className="text-lg font-bold text-text mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
        <GitPullRequest size={20} className="text-brand-red" />
        <span>{t.routeDetails}</span>
      </h3>

      <div className="relative pl-4 pr-4 border-l-2 border-dashed border-border/70 flex flex-col gap-4">
        {route.segments.map((segment, segIdx) => {
          const line = getLine(segment.lineId);
          const segmentColor = line?.color || '#999999';
          const nextSegment = route.segments[segIdx + 1];
          const nextLine = nextSegment ? getLine(nextSegment.lineId) : null;

          return (
            <div key={segIdx} className="flex flex-col relative">
              {/* Segment Line Header */}
              <div className="flex items-center gap-2 mb-3">
                <LineBadge lineId={segment.lineId} />
                <span className="text-xs font-medium text-text-muted">
                  {segment.stations.length - 1} {t.stopsLabel}
                </span>
              </div>

              {/* Station List for this segment */}
              <div className="flex flex-col relative pl-2 pr-2">
                {/* Vertical colored bar representing the track */}
                <div
                  className={`absolute top-2 bottom-2 w-1.5 rounded-full ${
                    isRtl ? 'right-[-7px]' : 'left-[-7px]'
                  }`}
                  style={{ backgroundColor: segmentColor }}
                />

                {segment.stations.map((stationId, stationIdx) => {
                  const station = getStation(stationId);
                  if (!station) return null;

                  const isFirstOfSeg = stationIdx === 0;
                  const isLastOfSeg = stationIdx === segment.stations.length - 1;
                  const isTransferStation = route.interchanges.includes(stationId);
                  const isTerminal =
                    (segIdx === 0 && isFirstOfSeg) ||
                    (segIdx === route.segments.length - 1 && isLastOfSeg);

                  const stationName = language === 'ar' ? station.nameAr : station.nameEn;

                  return (
                    <div
                      key={stationId}
                      onMouseEnter={() => onHoverStation?.(stationId)}
                      onMouseLeave={() => onHoverStation?.(null)}
                      className={`flex items-center gap-4 py-2 transition-all duration-200 hover:bg-surface-2 rounded-lg px-2 my-0.5 relative ${
                        isRtl ? 'flex-row-reverse text-right' : 'text-left'
                      } ${hoveredStationId === stationId ? 'bg-surface-2 ring-1 ring-border' : ''}`}
                    >
                      {/* Connection Dot */}
                      <div
                        className={`absolute w-3.5 h-3.5 rounded-full border-2 bg-surface z-10 transition-transform duration-200 hover:scale-125 ${
                          isRtl ? 'right-[-12px]' : 'left-[-12px]'
                        } ${
                          isTerminal
                            ? 'w-4 h-4 ring-4 ring-brand-red/20'
                            : isTransferStation
                            ? 'w-4 h-4 border-double border-4'
                            : ''
                        }`}
                        style={{
                          borderColor: isTerminal ? '#C01010' : segmentColor,
                          borderStyle: isTransferStation ? 'double' : 'solid'
                        }}
                      />

                      {/* Station Name Details */}
                      <div className="flex flex-col flex-1 pl-1 pr-1">
                        <span
                          className={`text-sm ${
                            isTerminal || isTransferStation
                              ? 'font-bold text-text'
                              : 'text-text/80'
                          }`}
                        >
                          {stationName}
                        </span>

                        {isTransferStation && isLastOfSeg && nextLine && (
                          <div
                            className={`mt-2 p-2.5 rounded-lg border bg-surface-2 text-xs font-semibold flex items-center gap-2 border-border/50 text-text shadow-sm animate-pulse ${
                              isRtl ? 'flex-row-reverse text-right' : ''
                            }`}
                          >
                            <GitCommit size={14} className="text-brand-red" />
                            <span className="flex items-center gap-1">
                              {t.changeHere}{' '}
                              <span className="font-bold text-text">
                                {language === 'ar' ? nextLine.nameAr : nextLine.nameEn}
                              </span>
                            </span>
                            {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                          </div>
                        )}
                      </div>

                      {/* Coordinates (Subtle description for screen readers / hover) */}
                      <span className="sr-only">
                        {station.nameEn} {t.lineLabel} {line?.nameEn}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Arrow separator between lines */}
              {nextSegment && (
                <div className="flex items-center justify-center my-3 text-text-muted/50">
                  <ArrowDown size={18} className="animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
