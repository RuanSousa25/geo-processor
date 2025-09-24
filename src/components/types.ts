export interface ProcessedPolygon {
  id: string;
  formattedName: string;
  coordinates: number[][];
  originalName?: string;
  km: number;
}

export interface FileProcessorResult {
  polygons: ProcessedPolygon[];
  fileName: string;
}
