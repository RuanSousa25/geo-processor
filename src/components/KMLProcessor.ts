import { ProcessedPolygon } from "./types";

export class KMLProcessor {
  static parseKMLToPolygons(
    kmlContent: string,
    fileName: string
  ): ProcessedPolygon[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, "text/xml");

    const polygons: ProcessedPolygon[] = [];

    // Busca por elementos Placemark que contêm polígonos
    const placemarks = xmlDoc.getElementsByTagName("Placemark");

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];

      // Extrai o nome do placemark
      const nameElement = placemark.getElementsByTagName("name")[0];
      const originalName = nameElement?.textContent || `Polígono ${i + 1}`;

      // Busca por elementos Polygon
      const polygonElements = placemark.getElementsByTagName("Polygon");

      for (let j = 0; j < polygonElements.length; j++) {
        const polygon = polygonElements[j];

        // Busca pelas coordenadas do anel externo
        const outerBoundary =
          polygon.getElementsByTagName("outerBoundaryIs")[0];
        if (!outerBoundary) continue;

        const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
        if (!linearRing) continue;

        const coordinatesElement =
          linearRing.getElementsByTagName("coordinates")[0];
        if (!coordinatesElement) continue;

        const coordinatesText = coordinatesElement.textContent?.trim();
        if (!coordinatesText) continue;

        // Processa as coordenadas
        const coordinates = this.parseKMLCoordinates(coordinatesText);

        if (coordinates.length > 0) {
          // Determina o tipo de polígono baseado no nome
          let polygonTypeArr: string[] = [];
          const nameLower = originalName.toLowerCase();

          if (nameLower.includes("eco")) polygonTypeArr.push("Eco");
          if (nameLower.includes("exp")) polygonTypeArr.push("Exp");
          if (nameLower.includes("rap") || nameLower.includes("ráp"))
            polygonTypeArr.push("Rap");
          let polygonType = polygonTypeArr.join("_");

          // Extrai o número da filial do nome do arquivo
          const branchNumber = this.extractBranchNumber(fileName);
          const formattedName = this.formatPolygonName(
            originalName,
            branchNumber,
            polygonType
          );

          polygons.push({
            id: `polygon-${i}-${j}`,
            formattedName,
            coordinates,
            originalName,
          });
        }
      }
    }

    return polygons;
  }

  private static parseKMLCoordinates(coordinatesText: string): number[][] {
    const coordinates: number[][] = [];

    // KML coordinates são no formato: longitude,latitude,altitude longitude,latitude,altitude
    // Separados por espaços ou quebras de linha
    const coordPairs = coordinatesText
      .split(/\s+/)
      .filter((pair) => pair.trim() !== "");

    for (const pair of coordPairs) {
      const parts = pair.split(",");
      if (parts.length >= 2) {
        const longitude = parseFloat(parts[0]);
        const latitude = parseFloat(parts[1]);

        if (!isNaN(longitude) && !isNaN(latitude)) {
          // Converte para o formato GeoJSON [longitude, latitude]
          coordinates.push([longitude, latitude]);
        }
      }
    }

    return coordinates;
  }

  private static extractBranchNumber(filename: string): string {
    // Remove extensão e procura por padrão de números
    const nameWithoutExt = filename.replace(/\.(zip|kml)$/i, "");
    const match = nameWithoutExt.match(/(\d+)/);
    return match ? match[1] : "0000";
  }

  private static formatPolygonName(
    originalName: string,
    branchNumber: string,
    polygonType: string
  ): string {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    const dateStr = `${day}${month}${year}`;

    return `Pol_${polygonType}_${branchNumber}_${dateStr}`;
  }
}
