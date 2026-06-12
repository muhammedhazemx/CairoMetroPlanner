import fs from 'fs';
import path from 'path';
import https from 'https';

const OSM_DIR = path.join(process.cwd(), 'data', 'osm');
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data');
const OSM_FILE = path.join(OSM_DIR, 'raw.json');

// --- REFERENCE DATA ---

interface RefStation {
  id: string; // We'll generate a stable ID like 'L3_ADL'
  en: string;
  ar: string;
  lat: number;
  lon: number;
}

const LINE_3_TRUNK: RefStation[] = [
  { id: 'L3_ADL', en: 'Adly Mansour', ar: 'عدلي منصور', lat: 30.1466, lon: 31.4211 },
  { id: 'L3_HAY', en: 'Haykestep', ar: 'الهايكستب', lat: 30.1432, lon: 31.4053 },
  { id: 'L3_OMA', en: 'Omar Ibn El-Khattab', ar: 'عمر بن الخطاب', lat: 30.1395, lon: 31.3942 },
  { id: 'L3_QOB', en: 'Qobaa', ar: 'قباء', lat: 30.1342, lon: 31.3854 },
  { id: 'L3_HES', en: 'Hesham Barakat', ar: 'هشام بركات', lat: 30.1300, lon: 31.3760 },
  { id: 'L3_NOZ', en: 'El-Nozha', ar: 'النزهة', lat: 30.1248, lon: 31.3672 },
  { id: 'L3_NAD', en: 'Nadi El-Shams', ar: 'نادي الشمس', lat: 30.1185, lon: 31.3520 },
  { id: 'L3_ALF', en: 'Alf Maskan', ar: 'ألف مسكن', lat: 30.1112, lon: 31.3432 },
  { id: 'L3_HEL', en: 'Heliopolis Square', ar: 'ميدان هليوبوليس', lat: 30.1028, lon: 31.3382 },
  { id: 'L3_HAR', en: 'Haroun', ar: 'هارون', lat: 30.0958, lon: 31.3300 },
  { id: 'L3_AHR', en: 'Al-Ahram', ar: 'الأهرام', lat: 30.0884, lon: 31.3225 },
  { id: 'L3_KOL', en: 'Koleyet El-Banat', ar: 'كلية البنات', lat: 30.0825, lon: 31.3130 },
  { id: 'L3_STA', en: 'Stadium', ar: 'الإستاد', lat: 30.0726, lon: 31.3115 },
  { id: 'L3_FAI', en: 'Fair Zone', ar: 'أرض المعارض', lat: 30.0712, lon: 31.2975 },
  { id: 'L3_ABB', en: 'Abbassia', ar: 'العباسية', lat: 30.0698, lon: 31.2820 },
  { id: 'L3_ABD', en: 'Abdou Pasha', ar: 'عبده باشا', lat: 30.0645, lon: 31.2755 },
  { id: 'L3_GEI', en: 'El Geish', ar: 'الجيش', lat: 30.0608, lon: 31.2672 },
  { id: 'L3_BAB', en: 'Bab El Shaaria', ar: 'باب الشعرية', lat: 30.0552, lon: 31.2575 },
  { id: 'L3_ATT', en: 'Attaba', ar: 'العتبة', lat: 30.0524, lon: 31.2472 },
  { id: 'L3_NAS', en: 'Nasser', ar: 'جمال عبدالناصر', lat: 30.0541, lon: 31.2384 },
  { id: 'L3_MAS', en: 'Maspero', ar: 'ماسبيرو', lat: 30.0570, lon: 31.2310 },
  { id: 'L3_SAF', en: 'Safaa Hegazy', ar: 'صفاء حجازي', lat: 30.0612, lon: 31.2228 },
  { id: 'L3_KIT', en: 'Kit Kat', ar: 'الكيت كات', lat: 30.0668, lon: 31.2128 }
];

const LINE_3_NORTH: RefStation[] = [
  { id: 'L3_KIT', en: 'Kit Kat', ar: 'الكيت كات', lat: 30.0668, lon: 31.2128 },
  { id: 'L3_SUD', en: 'Sudan', ar: 'السودان', lat: 30.0760, lon: 31.2065 },
  { id: 'L3_IMB', en: 'Imbaba', ar: 'إمبابة', lat: 30.0836, lon: 31.2078 },
  { id: 'L3_BOH', en: 'El-Bohy', ar: 'البوهي', lat: 30.0905, lon: 31.2080 },
  { id: 'L3_QAW', en: 'El-Qawmia', ar: 'القومية', lat: 30.0975, lon: 31.2085 },
  { id: 'L3_RIN', en: 'Ring Road', ar: 'الطريق الدائري', lat: 30.1045, lon: 31.2080 },
  { id: 'L3_ROD', en: 'Rod El Farag Corridor', ar: 'محور روض الفرج', lat: 30.1120, lon: 31.2050 }
];

const LINE_3_WEST: RefStation[] = [
  { id: 'L3_KIT', en: 'Kit Kat', ar: 'الكيت كات', lat: 30.0668, lon: 31.2128 },
  { id: 'L3_TAW', en: 'Tawfikia', ar: 'التوفيقية', lat: 30.0600, lon: 31.2050 },
  { id: 'L3_WAD', en: 'Wadi El Nile', ar: 'وادي النيل', lat: 30.0558, lon: 31.2012 },
  { id: 'L3_GAM', en: 'Gamat El Dowal', ar: 'جامعة الدول العربية', lat: 30.0505, lon: 31.2008 },
  { id: 'L3_BOU', en: 'Boulak El Dakrour', ar: 'بولاق الدكرور', lat: 30.0388, lon: 31.1995 },
  { id: 'L3_CAI', en: 'Cairo University', ar: 'جامعة القاهرة', lat: 30.0265, lon: 31.2012 }
];

const LINE_1: RefStation[] = [
  { id: 'L1_HEL', en: 'Helwan', ar: 'حلوان', lat: 29.848824, lon: 31.334252 },
  { id: 'L1_AIN', en: 'Ain Helwan', ar: 'عين حلوان', lat: 29.862604, lon: 31.325026 },
  { id: 'L1_UHL', en: 'Helwan University', ar: 'جامعة حلوان', lat: 29.8694521, lon: 31.3200045 },
  { id: 'L1_HOF', en: 'Wadi Hof', ar: 'وادي حوف', lat: 29.879053, lon: 31.3134384 },
  { id: 'L1_HHL', en: 'Hadayek Helwan', ar: 'حدائق حلوان', lat: 29.897192, lon: 31.30404 },
  { id: 'L1_MAA', en: 'El-Maasara', ar: 'المعصرة', lat: 29.9063622, lon: 31.2995338 },
  { id: 'L1_TAS', en: 'Tora El-Asmant', ar: 'طرة الأسمنت', lat: 29.9259651, lon: 31.2875497 },
  { id: 'L1_KZK', en: 'Kozzika', ar: 'كوتسيكا', lat: 29.9364531, lon: 31.2814236 },
  { id: 'L1_TBA', en: 'Tora El-Balad', ar: 'طرة البلد', lat: 29.9467168, lon: 31.2728834 },
  { id: 'L1_SMA', en: 'Sakanat El-Maadi', ar: 'ثكنات المعادي', lat: 29.9533078, lon: 31.2629646 },
  { id: 'L1_MAD', en: 'Maadi', ar: 'المعادي', lat: 29.960298, lon: 31.2577343 },
  { id: 'L1_HMA', en: 'Hadayek El-Maadi', ar: 'حدائق المعادي', lat: 29.9697833, lon: 31.2508303 },
  { id: 'L1_DAR', en: 'Dar El-Salam', ar: 'دار السلام', lat: 29.9819859, lon: 31.2420434 },
  { id: 'L1_ZAH', en: 'El-Zahraa', ar: 'الزهراء', lat: 29.995539, lon: 31.2312341 },
  { id: 'L1_MGR', en: 'Mar Girgis', ar: 'مار جرجس', lat: 30.0061683, lon: 31.2295818 },
  { id: 'L1_MSH', en: 'El-Malek El-Saleh', ar: 'الملك الصالح', lat: 30.0177162, lon: 31.2311751 },
  { id: 'L1_ZEI', en: 'Al-Sayeda Zeinab', ar: 'السيدة زينب', lat: 30.02924, lon: 31.235429 },
  { id: 'L1_SZA', en: 'Saad Zaghloul', ar: 'سعد زغلول', lat: 30.0356671, lon: 31.2378216 },
  { id: 'L1_SAD', en: 'Sadat', ar: 'السادات', lat: 30.043924, lon: 31.23566 },
  { id: 'L1_NAS', en: 'Nasser', ar: 'جمال عبدالناصر', lat: 30.0534568, lon: 31.2386477 },
  { id: 'L1_ORA', en: 'Orabi', ar: 'عرابي', lat: 30.0570274, lon: 31.2423062 },
  { id: 'L1_SHO', en: 'Al-Shohadaa', ar: 'الشهداء', lat: 30.0616395, lon: 31.246287 },
  { id: 'L1_GHM', en: 'Ghamra', ar: 'غمرة', lat: 30.0689315, lon: 31.2646759 },
  { id: 'L1_DMD', en: 'El-Demerdash', ar: 'الدمرداش', lat: 30.0771948, lon: 31.2778616 },
  { id: 'L1_MSD', en: 'Manshiet El-Sadr', ar: 'منشية الصدر', lat: 30.0819807, lon: 31.2875497 },
  { id: 'L1_KQO', en: 'Kobri El-Qobba', ar: 'كوبري القبة', lat: 30.087198, lon: 31.2941319 },
  { id: 'L1_HQO', en: 'Hammamat El-Qobba', ar: 'حمامات القبة', lat: 30.0911897, lon: 31.2990081 },
  { id: 'L1_SQO', en: 'Saray El-Qobba', ar: 'ساراي القبة', lat: 30.09772, lon: 31.3044691 },
  { id: 'L1_DZT', en: 'Hadayeq El-Zaitoun', ar: 'حدائق الزيتون', lat: 30.1059577, lon: 31.3103968 },
  { id: 'L1_HZT', en: 'Helmeyet El-Zaitoun', ar: 'حلمية الزيتون', lat: 30.1132481, lon: 31.3139963 },
  { id: 'L1_MAT', en: 'El-Matareyya', ar: 'المطرية', lat: 30.1208952, lon: 31.3137335 },
  { id: 'L1_AIN2', en: 'Ain Shams', ar: 'عين شمس', lat: 30.1310007, lon: 31.3191247 },
  { id: 'L1_NKH', en: 'Ezbet El-Nakhl', ar: 'عزبة النخل', lat: 30.1392217, lon: 31.3246232 },
  { id: 'L1_MRG', en: 'El-Marg', ar: 'المرج', lat: 30.1521131, lon: 31.3358134 },
  { id: 'L1_NMR', en: 'New El-Marg', ar: 'المرج الجديدة', lat: 30.163551, lon: 31.338335 }
];

const LINE_2: RefStation[] = [
  { id: 'L2_MON', en: 'El-Mounib', ar: 'المنيب', lat: 29.9810333, lon: 31.2123084 },
  { id: 'L2_MEK', en: 'Sakiat Mekky', ar: 'ساقية مكي', lat: 29.9955669, lon: 31.2084889 },
  { id: 'L2_OMS', en: 'Omm El-Masryeen', ar: 'أم المصريين', lat: 30.0059918, lon: 31.2081348 },
  { id: 'L2_GIZ', en: 'El Giza', ar: 'الجيزة', lat: 30.0106557, lon: 31.2070513 },
  { id: 'L2_FAS', en: 'Faisal', ar: 'فيصل', lat: 30.0174932, lon: 31.2037468 },
  { id: 'L3_CAI', en: 'Cairo University', ar: 'جامعة القاهرة', lat: 30.026151, lon: 31.2008715 }, // same ID for interchange
  { id: 'L2_BHO', en: 'El Bohoth', ar: 'البحوث', lat: 30.03584, lon: 31.200255 },
  { id: 'L2_DOK', en: 'Dokki', ar: 'الدقي', lat: 30.0384665, lon: 31.2122431 },
  { id: 'L2_OPR', en: 'Opera', ar: 'الأوبرا', lat: 30.0419317, lon: 31.2249899 },
  { id: 'L1_SAD', en: 'Sadat', ar: 'السادات', lat: 30.043924, lon: 31.23566 }, // interchange
  { id: 'L2_NAG', en: 'Mohamed Naguib', ar: 'محمد نجيب', lat: 30.0453402, lon: 31.2441516 },
  { id: 'L3_ATT', en: 'Attaba', ar: 'العتبة', lat: 30.0523517, lon: 31.2467963 }, // interchange
  { id: 'L1_SHO', en: 'Al-Shohadaa', ar: 'الشهداء', lat: 30.0616395, lon: 31.246287 }, // interchange
  { id: 'L2_MSA', en: 'Masarra', ar: 'مسرة', lat: 30.0708952, lon: 31.2451011 },
  { id: 'L2_RFG', en: 'Road El-Farag', ar: 'روض الفرج', lat: 30.0805881, lon: 31.2454015 },
  { id: 'L2_STR', en: 'St. Teresa', ar: 'سانتا تريزا', lat: 30.0879569, lon: 31.2454927 },
  { id: 'L2_KHL', en: 'Khalafawy', ar: 'الخلفاوي', lat: 30.0978453, lon: 31.2449992 },
  { id: 'L2_MZL', en: 'Mezallat', ar: 'المظلات', lat: 30.1040735, lon: 31.2455678 },
  { id: 'L2_ZER', en: 'Kolleyyet El-Zeraa', ar: 'كلية الزراعة', lat: 30.1136611, lon: 31.2487543 },
  { id: 'L2_SHB', en: 'Shubra El-Kheima', ar: 'شبرا الخيمة', lat: 30.1225145, lon: 31.244688 }
];

// Note: Ensure Nasser ID aligns
LINE_1.find(s => s.en === 'Nasser')!.id = 'L3_NAS';

const ALL_REF = [...LINE_1, ...LINE_2, ...LINE_3_TRUNK, ...LINE_3_NORTH, ...LINE_3_WEST];
const UNIQUE_REF = Array.from(new Map(ALL_REF.map(s => [s.id, s])).values());

async function fetchOSM() {
  const query = `[out:json][timeout:120];
relation(421705);relation(421706);relation(2063304);
(._;>;);
out body;`;

  return new Promise<any>((resolve, reject) => {
    const req = https.request('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CairoMetroApp/1.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('OSM parsing failed, using fallback data. Response was:', data.slice(0, 200));
          resolve({ elements: [] });
        }
      });
    });
    req.on('error', reject);
    req.write(query);
    req.end();
  });
}

async function main() {
  console.log('Fetching OSM data...');
  let raw: any;
  if (!fs.existsSync(OSM_DIR)) fs.mkdirSync(OSM_DIR, { recursive: true });

  if (fs.existsSync(OSM_FILE) && process.env.USE_CACHE) {
    raw = JSON.parse(fs.readFileSync(OSM_FILE, 'utf-8'));
  } else {
    raw = await fetchOSM();
    fs.writeFileSync(OSM_FILE, JSON.stringify(raw, null, 2));
  }

  const nodesMap = new Map(raw.elements.filter((e: any) => e.type === 'node').map((e: any) => [e.id, e]));
  
  // Find node by approximate name in OSM
  function findNode(nameEn: string, nameAr: string) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    const nEn = norm(nameEn);
    const nAr = norm(nameAr);
    
    for (const node of nodesMap.values()) {
      const tags = node.tags || {};
      const tEn = norm(tags['name:en'] || tags['name'] || '');
      const tAr = norm(tags['name:ar'] || tags['name'] || '');
      
      if ((nEn && tEn && tEn.includes(nEn)) || (nAr && tAr && tAr.includes(nAr))) {
        return node;
      }
    }
    return null;
  }

  // Build Final Stations
  const stationsData: any[] = [];
  for (const ref of UNIQUE_REF) {
    const node = findNode(ref.en, ref.ar);
    stationsData.push({
      id: ref.id,
      nameEn: node?.tags?.['name:en'] || ref.en,
      nameAr: node?.tags?.['name:ar'] || ref.ar,
      lat: node?.lat || ref.lat,
      lon: node?.lon || ref.lon,
      lines: [] // fill later
    });
  }

  // Define Lines
  const linesData = [
    {
      id: 'L1',
      nameEn: 'Line 1',
      nameAr: 'الخط الأول',
      color: '#C01010',
      stations: Array.from(new Set(LINE_1.map(s => s.id))),
      paths: [LINE_1.map(s => s.id)],
      shapePoints: LINE_1.map(s => {
         const node = findNode(s.en, s.ar);
         return [node?.lat || s.lat, node?.lon || s.lon] as [number, number];
      })
    },
    {
      id: 'L2',
      nameEn: 'Line 2',
      nameAr: 'الخط الثاني',
      color: '#0050A0',
      stations: Array.from(new Set(LINE_2.map(s => s.id))),
      paths: [LINE_2.map(s => s.id)],
      shapePoints: LINE_2.map(s => {
         const node = findNode(s.en, s.ar);
         return [node?.lat || s.lat, node?.lon || s.lon] as [number, number];
      })
    },
    {
      id: 'L3',
      nameEn: 'Line 3',
      nameAr: 'الخط الثالث',
      color: '#C8902F',
      stations: Array.from(new Set([...LINE_3_TRUNK, ...LINE_3_NORTH, ...LINE_3_WEST].map(s => s.id))),
      paths: [
        [...LINE_3_TRUNK, ...LINE_3_NORTH].map(s => s.id),
        [...LINE_3_TRUNK, ...LINE_3_WEST].map(s => s.id) // Alternatively, separate branches
      ],
      shapePoints: [...LINE_3_TRUNK, ...LINE_3_NORTH].map(s => {
         const node = findNode(s.en, s.ar);
         return [node?.lat || s.lat, node?.lon || s.lon] as [number, number];
      }) // Simplification for MetroMap rendering
    }
  ];

  // Update lines in stationsData
  stationsData.forEach(st => {
    linesData.forEach(l => {
      if (l.stations.includes(st.id)) {
        st.lines.push(l.id);
      }
    });
  });

  // Calculate Interchanges
  const interchanges = stationsData.filter(s => s.lines.length > 1).map(s => s.id);

  // Validate counts
  const l1Count = linesData[0].stations.length;
  const l2Count = linesData[1].stations.length;
  const l3Count = linesData[2].stations.length;
  
  if (l1Count !== 35 || l2Count !== 20 || l3Count !== 34) {
    console.error(`Validation Failed! Counts: L1=${l1Count}, L2=${l2Count}, L3=${l3Count}`);
    process.exit(1);
  }
  
  // Write files
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'stations.ts'), `import type { Station } from '../types/station';\n\nexport const stations: Station[] = ${JSON.stringify(stationsData, null, 2)};\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lines.ts'), `import type { Line } from '../types/line';\n\nexport const lines: Line[] = ${JSON.stringify(linesData, null, 2)};\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'interchanges.ts'), `export const interchanges: string[] = ${JSON.stringify(interchanges, null, 2)};\n`);

  console.log('Build complete! Stations:', stationsData.length);
}

main().catch(console.error);
