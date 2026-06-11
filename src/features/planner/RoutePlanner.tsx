import React, { useMemo, useEffect, useState } from 'react';
import { Clock, Ticket, Navigation2, History, Trash2, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setOrigin,
  setDestination,
  addRecentSearch,
  clearRecentSearches
} from './plannerSlice';
import { stations } from '../../data/stations';
import { lines } from '../../data/lines';
import { buildGraph } from '../../lib/graph';
import { findRoute } from '../../lib/bfs';
import { useTranslation } from '../../i18n/useTranslation';
import { StationPicker } from '../../components/StationPicker';
import { SwapButton } from '../../components/SwapButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import { InlineSVGLogo } from '../../components/InlineSVGLogo';
import { RouteTimeline } from '../../components/RouteTimeline';
import { MetroMap } from '../../components/MetroMap';

export const RoutePlanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { originId, destinationId, recentSearches } = useAppSelector(state => state.planner);
  const { t, language, isRtl } = useTranslation();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  // 1. Build graph statically
  const graph = useMemo(() => buildGraph(lines), []);

  // 2. Compute the best route
  const computedRoute = useMemo(() => {
    if (!originId || !destinationId) return null;
    return findRoute(graph, originId, destinationId);
  }, [graph, originId, destinationId]);

  // 3. Save successful search queries to recent searches history
  useEffect(() => {
    if (computedRoute && originId && destinationId && originId !== destinationId) {
      dispatch(addRecentSearch({ originId, destinationId }));
    }
  }, [computedRoute, originId, destinationId, dispatch]);

  // Handle clicking a recent search item
  const handleRecentClick = (orig: string, dest: string) => {
    dispatch(setOrigin(orig));
    dispatch(setDestination(dest));
  };

  const getStationName = (id: string) => {
    const s = stations.find(st => st.id === id);
    if (!s) return id;
    return language === 'ar' ? s.nameAr : s.nameEn;
  };

  // Sort stations alphabetically by their localized names
  const sortedStations = useMemo(() => {
    return [...stations].sort((a, b) => {
      const nameA = language === 'ar' ? a.nameAr : a.nameEn;
      const nameB = language === 'ar' ? b.nameAr : b.nameEn;
      return nameA.localeCompare(nameB, language);
    });
  }, [language]);

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-bg transition-colors duration-300">
      {/* 8-pointed star repeating subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none star-pattern" />

      {/* Brand Header */}
      <header className="sticky top-0 z-40 flex-shrink-0 bg-surface border-b border-border shadow-md py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SVG Logo - official Cairo Metro rub-el-hizb star emblem */}
            <InlineSVGLogo className="w-10 h-10 md:w-12 md:h-12 cursor-pointer" />
            <div className="flex flex-col text-left">
              <h1 className="text-lg md:text-2xl font-black font-cairo text-brand-red tracking-wide leading-none flex items-center gap-2">
                <span>{t.appTitle}</span>
              </h1>
              <span className="text-[10px] md:text-xs text-brand-red/80 font-medium font-cairo mt-1">
                {t.appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-[clamp(380px,34%,560px)_1fr] relative z-10">
        {/* Mobile Toggle Control */}
        <div className="lg:hidden px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex bg-surface-2 rounded-lg p-1" role="group" aria-label="View toggle">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              aria-pressed={mobileView === 'list'}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                mobileView === 'list' 
                  ? 'bg-surface text-brand-blue shadow-sm' 
                  : 'text-text-muted hover:text-text'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setMobileView('map')}
              aria-pressed={mobileView === 'map'}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                mobileView === 'map' 
                  ? 'bg-surface text-brand-blue shadow-sm' 
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Left Column: Form, Summary & Timeline */}
        <section className={`flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0 h-full ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Station Selection Panel */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-md">
            <div className="flex flex-col gap-4">
              <StationPicker
                id="origin"
                label={t.origin}
                placeholder={t.selectOrigin}
                selectedId={originId}
                onSelect={(id) => dispatch(setOrigin(id))}
                stations={sortedStations}
              />

              <SwapButton />

              <StationPicker
                id="destination"
                label={t.destination}
                placeholder={t.selectDestination}
                selectedId={destinationId}
                onSelect={(id) => dispatch(setDestination(id))}
                stations={sortedStations}
              />
            </div>
          </div>

          {/* Result Summary & Path Timeline */}
          {computedRoute ? (
            <div className="flex flex-col gap-6">
              {/* Route Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Total Stops */}
                <div className="bg-surface rounded-xl p-4 border border-border shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md hover:border-brand-blue/25">
                  <div className="p-2 rounded-full bg-brand-blue/10 text-brand-blue mb-2">
                    <Navigation2 size={20} />
                  </div>
                  <span className="text-2xl font-black text-text">
                    {computedRoute.totalStops}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold text-text-muted mt-0.5">
                    {t.totalStops}
                  </span>
                </div>

                {/* Estimated Time */}
                <div className="bg-surface rounded-xl p-4 border border-border shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md hover:border-brand-blueMid/25">
                  <div className="p-2 rounded-full bg-brand-blueMid/10 text-brand-blueMid mb-2">
                    <Clock size={20} />
                  </div>
                  <span className="text-2xl font-black text-text">
                    {computedRoute.estimatedTime}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold text-text-muted mt-0.5">
                    {t.estimatedTime} ({t.minsLabel})
                  </span>
                </div>

                {/* Ticket Fare */}
                <div className="bg-surface rounded-xl p-4 border border-border shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md hover:border-brand-red/25">
                  <div className="p-2 rounded-full bg-brand-red/10 text-brand-red mb-2">
                    <Ticket size={20} />
                  </div>
                  <span className="text-2xl font-black text-text">
                    {computedRoute.fare}
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold text-text-muted mt-0.5">
                    {t.ticketFare} ({t.egpLabel})
                  </span>
                </div>
              </div>

              {/* Station Timeline details */}
              <RouteTimeline 
                route={computedRoute} 
                hoveredStationId={hoveredStationId}
                onHoverStation={setHoveredStationId}
              />
            </div>
          ) : (
            <div className="bg-surface rounded-xl p-8 border border-border shadow-md text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="p-3.5 rounded-full bg-surface-2 text-text-muted mb-3 animate-pulse">
                <Navigation2 size={28} className="transform rotate-45" />
              </div>
              <p className="text-sm font-medium text-text-muted leading-relaxed max-w-xs">
                {originId && destinationId ? t.noRouteFound : t.emptyState}
              </p>
            </div>
          )}

          {/* Recent Searches Panel */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-md">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-text">
                <History size={16} className="text-brand-blueMid" />
                <span>{t.recentSearches}</span>
              </div>
              {recentSearches.length > 0 && (
                <button
                  onClick={() => dispatch(clearRecentSearches())}
                  className="text-xs text-text-muted hover:text-brand-red flex items-center gap-1 transition-colors duration-150"
                  aria-label={t.clearRecent}
                >
                  <Trash2 size={13} />
                  <span>{t.clearRecent}</span>
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-xs text-text-muted py-2">
                {t.noRecentSearches}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentSearches.map((search, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleRecentClick(search.originId, search.destinationId)}
                      className={`w-full text-xs text-left p-2.5 rounded-lg border border-border/50 hover:border-brand-blue/30 hover:bg-brand-blue/5 text-text-muted hover:text-text transition-all duration-200 flex items-center justify-between ${
                        isRtl ? 'flex-row-reverse text-right' : ''
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold">{getStationName(search.originId)}</span>
                        <ArrowRight size={12} className={`text-text-muted ${isRtl ? 'rotate-180' : ''}`} />
                        <span className="font-semibold">{getStationName(search.destinationId)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Right Column: Visual Interactive Map */}
        <section className={`h-full min-h-0 bg-surface-2 p-4 lg:p-0 ${mobileView === 'list' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col flex-1'}`}>
          <div className="w-full h-full relative">
            <MetroMap 
              computedRoute={computedRoute} 
              isVisible={mobileView === 'map'} 
              hoveredStationId={hoveredStationId}
              onHoverStation={setHoveredStationId}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
