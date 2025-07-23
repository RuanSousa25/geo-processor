import React, { useRef, useState } from "react";
import { Upload, FileText, Archive } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const acceptedFile = files.find(
      (file) => file.name.endsWith(".json") || file.name.endsWith(".zip")
    );

    if (acceptedFile) {
      onFileUpload(acceptedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary hover:bg-primary/5"
          }
          ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleClick : undefined}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg">📁 Upload de Arquivos</h3>
            <p className="text-muted-foreground">
              {isProcessing
                ? "Processando arquivo..."
                : "Arraste o arquivo ou clique aqui para selecionar"}
            </p>
          </div>

          <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Arquivos GeoJSON (.json)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Archive className="w-4 h-4" />
              <span>Arquivos ZIP contendo KML (.zip)</span>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.zip"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />
    </div>
  );
}
