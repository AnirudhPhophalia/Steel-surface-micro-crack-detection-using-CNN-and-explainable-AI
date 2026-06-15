'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SettingsPanelProps {
  onRun: () => Promise<void>;
  crackThreshold: number;
  maskThreshold: number;
  onCrackThresholdChange: (value: number) => void;
  onMaskThresholdChange: (value: number) => void;
  isImageUploaded: boolean;
  isLoading: boolean;
}

export function SettingsPanel({
  onRun,
  crackThreshold,
  maskThreshold,
  onCrackThresholdChange,
  onMaskThresholdChange,
  isImageUploaded,
  isLoading,
}: SettingsPanelProps) {
  return (
    <div className="bg-card border border-border industrial-border p-6 space-y-6">
      <h3 className="text-lg font-semibold">Configuration</h3>

      {/* Crack Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="metric-label">Crack Threshold</label>
          <span className="font-mono text-sm font-bold text-primary">
            {crackThreshold.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={crackThreshold}
          onChange={(e) => onCrackThresholdChange(parseFloat(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-secondary border border-border industrial-border cursor-pointer accent-primary"
        />
        <p className="text-xs text-muted-foreground">
          Sensitivity to crack detection (0 = strict, 1 = lenient)
        </p>
      </div>

      {/* Mask Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="metric-label">Mask Threshold</label>
          <span className="font-mono text-sm font-bold text-primary">
            {maskThreshold.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={maskThreshold}
          onChange={(e) => onMaskThresholdChange(parseFloat(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-secondary border border-border industrial-border cursor-pointer accent-primary"
        />
        <p className="text-xs text-muted-foreground">
          U-Net segmentation threshold (0 = aggressive, 1 = conservative)
        </p>
      </div>

      {/* Run Button */}
      <Button
        onClick={onRun}
        disabled={!isImageUploaded || isLoading}
        className="w-full bg-primary hover:bg-cyan-600 text-primary-foreground font-semibold py-3 border-0"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? 'Running Inspection...' : 'Run Inspection'}
      </Button>
    </div>
  );
}
