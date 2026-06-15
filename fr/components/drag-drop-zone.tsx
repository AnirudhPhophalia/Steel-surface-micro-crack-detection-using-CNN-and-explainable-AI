'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  isLoading: boolean;
}

export function DragDropZone({
  onFileSelect,
  previewUrl,
  isLoading,
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFile(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      {/* Drag-Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed industrial-border p-8 cursor-pointer transition-colors ${
          isDragging
            ? 'bg-primary bg-opacity-10 border-primary'
            : previewUrl
              ? 'bg-background'
              : 'bg-card hover:bg-background'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-2">
            <img
              src={previewUrl}
              alt="Uploaded steel plate"
              className="w-full h-64 object-cover bg-background border border-border industrial-border"
            />
            {fileName && (
              <p className="data-mono text-xs text-muted-foreground">
                {fileName}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Upload className="w-8 h-8 text-primary mx-auto mb-3 opacity-70" />
            <p className="font-semibold text-foreground">
              Drag & drop your steel plate image here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to select (.jpg, .png)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
