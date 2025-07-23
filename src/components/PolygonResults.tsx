import { Copy, MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { ProcessedPolygon } from "./types";

interface PolygonResultsProps {
  polygons: ProcessedPolygon[];
  fileName: string;
}

export function PolygonResults({ polygons, fileName }: PolygonResultsProps) {
  const copyToClipboard = (text: string, type: "nome" | "coordenadas") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(
          `📋 ${
            type === "nome" ? "Nome do polígono" : "Coordenadas"
          } copiado para a área de transferência!`
        );
      })
      .catch(() => {
        toast.error("Erro ao copiar para a área de transferência");
      });
  };

  const formatCoordinates = (coordinates: number[][]) => {
    const formattedCoords = coordinates
      .map((coord) => `[${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}]`)
      .join(", ");
    return `[${formattedCoords}]`;
  };

  const getSimplifiedCoordinates = (coordinates: number[][]) => {
    // Mostra apenas as primeiras 3 coordenadas para simplificar a visualização
    const simplified = coordinates.slice(0, 3);
    const formatted = simplified
      .map((coord) => `[${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]`)
      .join(", ");
    return coordinates.length > 3
      ? `${formatted}... (+${coordinates.length - 3} pontos)`
      : formatted;
  };

  const getFileTypeIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith(".zip")) {
      return "📦";
    }
    return "📄";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <p className="text-green-800">Arquivo processado com sucesso</p>
              <p className="text-green-600 text-sm">
                {getFileTypeIcon(fileName)} Nome do arquivo: {fileName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Polígonos encontrados:</h2>
        <span className="text-sm text-muted-foreground">
          {polygons.length} polígono
          {polygons.length !== 1 ? "s" : ""} processado
          {polygons.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Polygon Cards */}
      <div className="space-y-3">
        {polygons.map((polygon) => (
          <Card
            key={polygon.id}
            className="border-2 hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Polygon Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                      {polygon.formattedName}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(polygon.formattedName, "nome")
                    }
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Nome</span>
                  </Button>
                </div>

                {/* Coordinates */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <Navigation className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Coordenadas:
                      </p>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                        {getSimplifiedCoordinates(polygon.coordinates)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        formatCoordinates(polygon.coordinates),
                        "coordenadas"
                      )
                    }
                    className="flex items-center space-x-1 ml-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Coordenadas</span>
                  </Button>
                </div>

                {/* Original Name (if different) */}
                {polygon.originalName &&
                  polygon.originalName !== polygon.formattedName && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Nome original: {polygon.originalName}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
