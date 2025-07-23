import React, { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { PolygonResults } from "./components/PolygonResults";
import { KMLProcessor } from "./components/KMLProcessor";
import { Alert, AlertDescription } from "./components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { ProcessedPolygon } from "./components/types";
import JSZip from "jszip";

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPolygons, setProcessedPolygons] = useState<
    ProcessedPolygon[]
  >([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const extractBranchNumber = (filename: string): string => {
    // Remove extensão e procura por padrão de números
    const nameWithoutExt = filename.replace(/\.(json|zip)$/i, "");
    const match = nameWithoutExt.match(/(\d+)/);
    return match ? match[1] : "0000";
  };

  const formatPolygonName = (
    originalName: string,
    branchNumber: string,
    polygonType: string
  ): string => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    const dateStr = `${day}${month}${year}`;

    return `Pol_${polygonType}_${branchNumber}_${dateStr}`;
  };

  const processGeoJSON = async (file: File): Promise<ProcessedPolygon[]> => {
    const text = await file.text();
    const geoData = JSON.parse(text);

    if (!geoData.type || !geoData.features) {
      throw new Error(
        'Arquivo não é um GeoJSON válido. Verifique se contém as propriedades "type" e "features".'
      );
    }

    const branchNumber = extractBranchNumber(file.name);
    const polygons: ProcessedPolygon[] = [];

    // Processa cada feature
    geoData.features.forEach((feature: any, index: number) => {
      if (feature.geometry && feature.geometry.type === "Polygon") {
        const coordinates = feature.geometry.coordinates[0]; // Primeiro array de coordenadas

        // Determina o tipo de polígono baseado nas propriedades ou nome
        let polygonTypeArr: string[] = [];
        if (feature.properties) {
          const name =
            feature.properties.name ||
            feature.properties.Name ||
            feature.properties.id ||
            "";
          const nameLower = name.toLowerCase();

          if (nameLower.includes("eco")) polygonTypeArr.push("Eco");
          if (nameLower.includes("exp")) polygonTypeArr.push("Exp");
          if (nameLower.includes("rap") || nameLower.includes("ráp"))
            polygonTypeArr.push("Rap");
        }
        const polygonType = polygonTypeArr.join("_");
        const originalName =
          feature.properties?.name ||
          feature.properties?.Name ||
          `Polígono ${index + 1}`;
        const formattedName = formatPolygonName(
          originalName,
          branchNumber,
          polygonType
        );

        polygons.push({
          id: `polygon-${index}`,
          formattedName,
          coordinates,
          originalName,
        });
      }
    });

    return polygons;
  };

  const processZipFile = async (file: File): Promise<ProcessedPolygon[]> => {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const allPolygons: ProcessedPolygon[] = [];

    // Processa cada arquivo no ZIP
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      if (!zipEntry.dir && filename.toLowerCase().endsWith(".kml")) {
        try {
          const kmlContent = await zipEntry.async("text");
          const polygons = KMLProcessor.parseKMLToPolygons(
            kmlContent,
            filename
          );
          allPolygons.push(...polygons);
        } catch (error) {
          console.warn(`Erro ao processar arquivo KML ${filename}:`, error);
          // Continua processando outros arquivos
        }
      }
    }

    if (allPolygons.length === 0) {
      throw new Error(
        "Nenhum arquivo KML válido encontrado no arquivo ZIP ou os arquivos KML não contêm polígonos válidos."
      );
    }

    return allPolygons;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessedPolygons([]);

    try {
      let polygons: ProcessedPolygon[] = [];

      if (file.name.toLowerCase().endsWith(".json")) {
        polygons = await processGeoJSON(file);
      } else if (file.name.toLowerCase().endsWith(".zip")) {
        polygons = await processZipFile(file);
      } else {
        throw new Error(
          "Tipo de arquivo não suportado. Use arquivos .json ou .zip"
        );
      }

      if (polygons.length === 0) {
        throw new Error("Nenhum polígono válido encontrado no arquivo.");
      }

      setProcessedPolygons(polygons);
      setFileName(file.name);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao processar o arquivo";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessedPolygons([]);
    setFileName("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 text-primary">
            🗺️ Processador de Arquivos Geoespaciais
          </h1>
          <p className="text-muted-foreground">
            Sistema para processamento de arquivos GeoJSON e KML
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Section */}
          {processedPolygons.length === 0 && !error && (
            <FileUpload
              onFileUpload={processFile}
              isProcessing={isProcessing}
            />
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="text-lg">Processando arquivo...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>❌ Erro ao processar o arquivo.</strong>
                  <br />
                  {error}
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button onClick={handleReset} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {processedPolygons.length > 0 && (
            <div className="space-y-4">
              <PolygonResults
                polygons={processedPolygons}
                fileName={fileName}
              />
              <div className="text-center">
                <Button onClick={handleReset} variant="outline">
                  Processar novo arquivo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Sistema desenvolvido para processamento de arquivos GeoJSON e KML
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
