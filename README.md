# Cairo Metro Route Planner 🚇

A bilingual (English / Arabic) route planner for the Cairo Metro. Pick an origin and destination and it computes the quickest route — fewest stops, including line interchanges — with total stops, estimated travel time, and ticket fare, plotted on an interactive map.

> Built as a front-end portfolio project. All station data is derived from Transport for Cairo's open GTFS feed and compiled into the app — there are **no runtime API calls**.
> 

## Features

- **Fewest-stops routing** across all three lines using a BFS graph search, with automatic interchange handling.
- **Fare & time estimates** — fares of 9 / 12 / 15 EGP by distance band; time estimated at 2 min per stop + 4 min per interchange.
- **Interactive map** (react-leaflet + OpenStreetMap) that plots every station and highlights the computed route directly on the tracks.
- **Bilingual EN/AR** with full right-to-left (RTL) support and a language toggle.
- **Light & dark themes** based on the Cairo Metro emblem palette, persisted to `localStorage` and defaulting to your OS preference.
- **Recent searches** (last 5, saved locally) and a one-tap origin/destination swap.
- **Accessible & responsive** — WCAG 2.1 AA, full keyboard navigation, visible focus, and a layout that adapts from desktop to mobile.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| State | Redux Toolkit |
| Styling | Tailwind CSS |
| Map | react-leaflet / OpenStreetMap |
| Testing | Vitest + React Testing Library + Playwright |

## Data

Station, line, and geometry data come from **Transport for Cairo's open Metro GTFS feed** (committed under `/gtfs`). A build script parses the GTFS files into strongly-typed modules in `src/data/`, so the app ships fully static, typed data.

```bash
npm run build:data   # regenerate src/data/* from the GTFS feed in /gtfs
```

## Getting started

**Prerequisites:** Node.js 18+

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

## Build

```bash
npm run build      # production build to /dist
npm run preview    # preview the production build locally
```

## Testing

```bash
npm run test       # unit + component tests (Vitest + RTL)
npm run test:e2e   # end-to-end tests (Playwright)
```

## Project structure

```
src/
  app/         # typed Redux Toolkit store + hooks
  components/  # StationPicker, RouteTimeline, MetroMap, LineBadge, toggles…
  features/
    planner/   # plannerSlice + RoutePlanner
    theme/     # themeSlice
  data/        # stations.ts, lines.ts, interchanges.ts (GENERATED from GTFS)
  i18n/        # en.ts, ar.ts, useTranslation
  lib/         # graph, bfs, fare, time (pure, unit-tested)
  types/       # station, line, route
gtfs/          # raw Transport for Cairo GTFS feed
scripts/       # build-data.ts (GTFS → typed src/data/*)
tests/         # unit, component, and e2e specs
```

## Accessibility

Semantic landmarks, labelled controls, contrast-safe line badges, visible focus rings, and full keyboard navigation — verified in both light and dark themes and in RTL.

## Acknowledgements

- Station data: Transport for Cairo — Metro GTFS
- Map tiles: © OpenStreetMap contributors
