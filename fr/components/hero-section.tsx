'use client';

import { DragDropZone } from './drag-drop-zone';
import { SettingsPanel } from './settings-panel';

interface HeroSectionProps {
  onFileSelect: (file: File) => void;
  onRun: () => Promise<void>;
  previewUrl: string | null;
  crackThreshold: number;
  maskThreshold: number;
  onCrackThresholdChange: (value: number) => void;
  onMaskThresholdChange: (value: number) => void;
  isImageUploaded: boolean;
  isLoading: boolean;
}

export function HeroSection({
  onFileSelect,
  onRun,
  previewUrl,
  crackThreshold,
  maskThreshold,
  onCrackThresholdChange,
  onMaskThresholdChange,
  isImageUploaded,
  isLoading,
}: HeroSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Uploader */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Upload Steel Plate Image
        </h2>
        <DragDropZone
          onFileSelect={onFileSelect}
          previewUrl={previewUrl}
          isLoading={isLoading}
        />
      </div>

      {/* Right Column: Settings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Inspection Settings
        </h2>
        <SettingsPanel
          onRun={onRun}
          crackThreshold={crackThreshold}
          maskThreshold={maskThreshold}
          onCrackThresholdChange={onCrackThresholdChange}
          onMaskThresholdChange={onMaskThresholdChange}
          isImageUploaded={isImageUploaded}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
