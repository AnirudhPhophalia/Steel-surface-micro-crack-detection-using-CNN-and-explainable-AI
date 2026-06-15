'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { ResultsSection } from '@/components/results-section';
import { AboutSection } from '@/components/about-section';
import { RunHistory } from '@/components/run-history';
import { InferenceResult, InferenceRun } from '@/types/inference';
import { predict, listRuns } from '@/utils/api';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crackThreshold, setCrackThreshold] = useState(0.5);
  const [maskThreshold, setMaskThreshold] = useState(0.5);
  const [results, setResults] = useState<InferenceResult | null>(null);
  const [recentRuns, setRecentRuns] = useState<InferenceRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRuns = useCallback(async () => {
    try {
      const runs = await listRuns(20);
      setRecentRuns(runs);
    } catch {
      // Keep UI usable if run history endpoint is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    refreshRuns();
  }, [refreshRuns]);

  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRunInspection = useCallback(async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await predict(uploadedFile, {
        crackThreshold: crackThreshold,
        maskThreshold: maskThreshold,
      });
      setResults(result);
      await refreshRuns();
      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.querySelector('[data-results]');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'API request failed';
      setError(message);
      console.error('Inspection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error Toast */}
        {error && (
          <div className="bg-red-950 border border-red-700 industrial-border p-4">
            <p className="text-red-100 data-mono">Error: {error}</p>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection
          onFileSelect={handleFileSelect}
          onRun={handleRunInspection}
          previewUrl={previewUrl}
          crackThreshold={crackThreshold}
          maskThreshold={maskThreshold}
          onCrackThresholdChange={setCrackThreshold}
          onMaskThresholdChange={setMaskThreshold}
          isImageUploaded={!!uploadedFile}
          isLoading={isLoading}
        />

        {/* Results Section */}
        {results && previewUrl && (
          <div data-results>
            <ResultsSection results={results} previewUrl={previewUrl} />
          </div>
        )}

        <RunHistory runs={recentRuns} />

        {/* About Section */}
        <AboutSection />
      </main>
    </div>
  );
}
