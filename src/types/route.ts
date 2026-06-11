export interface RouteSegment {
  lineId: string;
  stations: string[]; // station IDs in order for this segment
}

export interface RouteResult {
  path: string[]; // complete list of station IDs in order
  segments: RouteSegment[]; // segments of the trip grouped by line
  totalStops: number;
  interchanges: string[]; // station IDs where transfers happen
  estimatedTime: number; // in minutes
  fare: number; // in EGP
}
