export interface Line {
  id: string; // e.g. "L1", "L2", "L3"
  nameEn: string;
  nameAr: string;
  color: string;
  stations: string[]; // station IDs in order
  shapePoints: [number, number][]; // lat, lon for map rendering
}
