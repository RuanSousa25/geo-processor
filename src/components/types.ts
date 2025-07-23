export interface ProcessedPolygon {
  id: string;
  formattedName: string;
  coordinates: number[][];
  originalName?: string;
}

export interface FileProcessorResult {
  polygons: ProcessedPolygon[];
  fileName: string;
}
