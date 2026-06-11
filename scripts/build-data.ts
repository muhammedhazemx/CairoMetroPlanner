import fs from 'fs';
import path from 'path';

// Define paths
const GTFS_DIR = path.join(process.cwd(), 'gtfs');
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data');

// Arabic translation dictionary for all station names
const arNames: Record<string, string> = {
  "Helwan": "حلوان",
  "Ain Helwan": "عين حلوان",
  "Ain Helwan - Helwan": "عين حلوان",
  "Ain Helwan - Marg": "عين حلوان",
  "Helwan University": "جامعة حلوان",
  "Wadi Hof": "وادي حوف",
  "Hadayek Helwan": "حدائق حلوان",
  "El-Maasara": "المعصرة",
  "Tora El-Asmant": "طره الأسمنت",
  "Kozzika": "كوتسيكا",
  "Tora El-Balad": "طره البلد",
  "Sakanat El-Maadi": "ثكنات المعادي",
  "Maadi": "المعادي",
  "Hadayek El-Maadi": "حدائق المعادي",
  "Dar El-Salam": "دار السلام",
  "El-Zahraa'": "الزهراء",
  "Mar Girgis": "مار جرجس",
  "El-Malek El-Saleh": "الملك الصالح",
  "Al-Sayeda Zeinab": "السيدة زينب",
  "Saad Zaghloul": "سعد زغلول",
  "Sadat": "السادات",
  "Nasser": "ناصر",
  "Orabi": "عرابي",
  "Al-Shohadaa": "الشهداء",
  "Ghamra": "غمرة",
  "El-Demerdash": "الدمرداش",
  "Manshiet El-Sadr": "منشية الصدر",
  "Kobri El-Qobba": "كوبري القبة",
  "Hammamat El-Qobba": "حمامات القبة",
  "Saray El-Qobba": "سراي القبة",
  "Hadayeq El-Zaitoun": "حدائق الزيتون",
  "Helmeyet El-Zaitoun": "حلمية الزيتون",
  "El-Matareyya": "المطرية",
  "Ain Shams": "عين شمس",
  "Ezbet El-Nakhl": "عزبة النخل",
  "El-Marg": "المرج",
  "New El-Marg": "المرج الجديدة",
  "El-Mounib": "المنيب",
  "Sakiat Mekki": "ساقية مكي",
  "El-Giza": "الجيزة",
  "Faisal": "فيصل",
  "Cairo University": "جامعة القاهرة",
  "Bohooth": "البحوث",
  "Dokki": "الدقي",
  "Opera": "الأوبرا",
  "Mohamed Naguib": "محمد نجيب",
  "Attaba": "العتبة",
  "Masarra": "مسرة",
  "Rod El Farag": "روض الفرج",
  "St. Teresa": "سانت تريزا",
  "Khalafawy": "الخلفاوي",
  "Mezallat": "المظلات",
  "Kolleyyet El-Zeraa": "كلية الزراعة",
  "Shubra El-Kheima": "شبرا الخيمة",
  "Fair Zone": "أرض المعارض",
  "Koleyet El-Banat": "كلية البنات",
  "Stadium": "الاستاد",
  "Al-Ahram": "الأهرام",
  "Abbassiya": "العباسية",
  "Abdou Pasha": "عبده باشا",
  "El-Geish": "الجيش",
  "Bab El-Shaaria": "باب الشعرية",
  "Omm El-Misryeen": "أم المصريين"
};

// Line mapping override from LOOK & FEEL
const LINE_COLORS: Record<string, string> = {
  "L1": "#C01010", // Metro Red
  "L2": "#0050A0", // Steel Blue (deep)
  "L3": "#C8902F"  // Gold / Sand contrast
};

const LINE_NAMES_EN: Record<string, string> = {
  "L1": "Line 1",
  "L2": "Line 2",
  "L3": "Line 3"
};

const LINE_NAMES_AR: Record<string, string> = {
  "L1": "الخط الأول",
  "L2": "الخط الثاني",
  "L3": "الخط الثالث"
};

// Shape mapping
const SHAPE_MAP: Record<string, string> = {
  "L1": "M1",
  "L2": "M2",
  "L3": "M3"
};

// A basic robust CSV parser that handles quotes
function parseCSV(content: string): string[][] {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentToken.trim());
      if (currentLine.length > 1 || (currentLine.length === 1 && currentLine[0] !== '')) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  if (currentToken !== '' || currentLine.length > 0) {
    currentLine.push(currentToken.trim());
    lines.push(currentLine);
  }
  return lines;
}

function loadCSV(fileName: string): string[][] {
  const filePath = path.join(GTFS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseCSV(content);
}

function main() {
  console.log("Parsing GTFS data...");

  // Load and parse files
  const rawStops = loadCSV('stops.txt');
  const rawRoutes = loadCSV('routes.txt');
  const rawTrips = loadCSV('trips.txt');
  const rawStopTimes = loadCSV('stop_times.txt');
  const rawShapes = loadCSV('shapes.txt');

  // Helper function to map header to column index
  const getHeaderMap = (rows: string[][]) => {
    const headers = rows[0];
    const map: Record<string, number> = {};
    headers.forEach((h, i) => { map[h.trim()] = i; });
    return map;
  };

  // 1. Process stops
  const stopsMap = getHeaderMap(rawStops);
  const stationsData: Record<string, { id: string; nameEn: string; nameAr: string; lat: number; lon: number }> = {};
  const childToParent: Record<string, string> = {};

  // Find all physical stations and map children
  for (let i = 1; i < rawStops.length; i++) {
    const row = rawStops[i];
    if (row.length <= 1) continue;

    const stopId = row[stopsMap['stop_id']];
    const stopName = row[stopsMap['stop_name']];
    const stopLat = parseFloat(row[stopsMap['stop_lat']]);
    const stopLon = parseFloat(row[stopsMap['stop_lon']]);
    const parentStation = row[stopsMap['parent_station']] || '';

    // If it has a parent station, map it
    if (parentStation) {
      childToParent[stopId] = parentStation;
    } else {
      childToParent[stopId] = stopId;
    }

    // Capture station details (physical stations usually have location_type = 1, but we capture any parent)
    const isParent = row[stopsMap['location_type']] === '1' || !parentStation;
    if (isParent) {
      const cleanName = stopName.replace(/\s*-\s*Helwan|\s*-\s*Marg|\s*-\s*Marg|\s*Metro/gi, '').trim();
      const arName = arNames[cleanName] || arNames[stopName] || stopName;
      stationsData[stopId] = {
        id: stopId,
        nameEn: cleanName,
        nameAr: arName,
        lat: stopLat,
        lon: stopLon
      };
    }
  }

  // Handle any missing parent station definitions
  for (let i = 1; i < rawStops.length; i++) {
    const row = rawStops[i];
    if (row.length <= 1) continue;
    const parentStation = row[stopsMap['parent_station']];
    if (parentStation && !stationsData[parentStation]) {
      const stopName = row[stopsMap['stop_name']];
      const stopLat = parseFloat(row[stopsMap['stop_lat']]);
      const stopLon = parseFloat(row[stopsMap['stop_lon']]);
      const cleanName = stopName.replace(/\s*-\s*Helwan|\s*-\s*Marg|\s*Metro/gi, '').trim();
      stationsData[parentStation] = {
        id: parentStation,
        nameEn: cleanName,
        nameAr: arNames[cleanName] || arNames[stopName] || stopName,
        lat: stopLat,
        lon: stopLon
      };
    }
  }

  // 2. Process Routes
  const routesMap = getHeaderMap(rawRoutes);
  const routeIds = new Set<string>();
  for (let i = 1; i < rawRoutes.length; i++) {
    const row = rawRoutes[i];
    if (row.length <= 1) continue;
    routeIds.add(row[routesMap['route_id']]);
  }

  // 3. Process Trips & Stop Times to get station sequences
  const tripsMap = getHeaderMap(rawTrips);
  const tripToRoute: Record<string, string> = {};
  for (let i = 1; i < rawTrips.length; i++) {
    const row = rawTrips[i];
    if (row.length <= 1) continue;
    const tripId = row[tripsMap['trip_id']];
    const routeId = row[tripsMap['route_id']];
    tripToRoute[tripId] = routeId;
  }

  const stopTimesMap = getHeaderMap(rawStopTimes);
  const tripStopSequences: Record<string, { stopId: string; seq: number }[]> = {};

  for (let i = 1; i < rawStopTimes.length; i++) {
    const row = rawStopTimes[i];
    if (row.length <= 1) continue;
    const tripId = row[stopTimesMap['trip_id']];
    const stopId = row[stopTimesMap['stop_id']];
    const stopSeq = parseInt(row[stopTimesMap['stop_sequence']]);

    if (!tripStopSequences[tripId]) {
      tripStopSequences[tripId] = [];
    }
    tripStopSequences[tripId].push({ stopId, seq: stopSeq });
  }

  // For each route, find the trip with the longest sequence of stops to represent the line order
  const routeStations: Record<string, string[]> = {};
  for (const routeId of routeIds) {
    const routeTrips = Object.keys(tripToRoute).filter(t => tripToRoute[t] === routeId);
    let bestTripId = '';
    let maxStops = 0;

    for (const tripId of routeTrips) {
      const stopCount = tripStopSequences[tripId]?.length || 0;
      if (stopCount > maxStops) {
        maxStops = stopCount;
        bestTripId = tripId;
      }
    }

    if (bestTripId) {
      // Sort by sequence number
      const sortedStops = tripStopSequences[bestTripId].sort((a, b) => a.seq - b.seq);
      
      // Map to parent station IDs and remove adjacent duplicates
      const stationsSeq: string[] = [];
      sortedStops.forEach(s => {
        const parentId = childToParent[s.stopId] || s.stopId;
        if (stationsSeq.length === 0 || stationsSeq[stationsSeq.length - 1] !== parentId) {
          stationsSeq.push(parentId);
        }
      });
      routeStations[routeId] = stationsSeq;
    } else {
      routeStations[routeId] = [];
    }
  }

  // 4. Process shapes
  const shapesMap = getHeaderMap(rawShapes);
  const shapePoints: Record<string, { lat: number; lon: number; seq: number }[]> = {};

  for (let i = 1; i < rawShapes.length; i++) {
    const row = rawShapes[i];
    if (row.length <= 1) continue;
    const shapeId = row[shapesMap['shape_id']];
    const lat = parseFloat(row[shapesMap['shape_pt_lat']]);
    const lon = parseFloat(row[shapesMap['shape_pt_lon']]);
    const seq = parseInt(row[shapesMap['shape_pt_sequence']]);

    if (!shapePoints[shapeId]) {
      shapePoints[shapeId] = [];
    }
    shapePoints[shapeId].push({ lat, lon, seq });
  }

  // Sort shape points for each shape_id
  const sortedShapes: Record<string, [number, number][]> = {};
  for (const shapeId in shapePoints) {
    sortedShapes[shapeId] = shapePoints[shapeId]
      .sort((a, b) => a.seq - b.seq)
      .map(pt => [pt.lat, pt.lon] as [number, number]);
  }

  // 5. Build station list of active stations
  const activeStationIds = new Set<string>();
  for (const routeId in routeStations) {
    routeStations[routeId].forEach(id => activeStationIds.add(id));
  }

  const finalStationsList = Object.values(stationsData)
    .filter(st => activeStationIds.has(st.id));

  // Determine line IDs serving each station to derive interchanges
  const stationLinesMap: Record<string, string[]> = {};
  finalStationsList.forEach(st => {
    stationLinesMap[st.id] = [];
    for (const routeId in routeStations) {
      if (routeStations[routeId].includes(st.id)) {
        stationLinesMap[st.id].push(routeId);
      }
    }
  });

  // Interchanges are stations served by more than one line
  const interchangeIds = finalStationsList
    .filter(st => stationLinesMap[st.id].length > 1)
    .map(st => st.id);

  // Output generated data files
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write stations.ts
  const stationsFileContent = `import { Station } from '../types/station';

export const stations: Station[] = ${JSON.stringify(finalStationsList, null, 2)};
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'stations.ts'), stationsFileContent, 'utf-8');
  console.log(`Generated stations.ts with ${finalStationsList.length} stations.`);

  // Write lines.ts
  const linesList = Object.keys(routeStations).map(routeId => {
    const shapeId = SHAPE_MAP[routeId] || routeId;
    return {
      id: routeId,
      nameEn: LINE_NAMES_EN[routeId] || routeId,
      nameAr: LINE_NAMES_AR[routeId] || routeId,
      color: LINE_COLORS[routeId] || "#999999",
      stations: routeStations[routeId],
      shapePoints: sortedShapes[shapeId] || []
    };
  });

  const linesFileContent = `import { Line } from '../types/line';

export const lines: Line[] = ${JSON.stringify(linesList, null, 2)};
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lines.ts'), linesFileContent, 'utf-8');
  console.log(`Generated lines.ts with ${linesList.length} lines.`);

  // Write interchanges.ts
  const interchangesFileContent = `export const interchanges: string[] = ${JSON.stringify(interchangeIds, null, 2)};
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'interchanges.ts'), interchangesFileContent, 'utf-8');
  console.log(`Generated interchanges.ts with ${interchangeIds.length} interchanges: ${interchangeIds.join(', ')}`);

  console.log("Data generation complete!");
}

main();
