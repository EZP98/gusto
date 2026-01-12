export interface CountryData {
  n: string;      // name
  id: string;     // id
  c: [number, number];  // centroid [lng, lat]
  l?: number;     // level
  p: [number, number][][];  // polygons
}

export const countriesData: CountryData[];
