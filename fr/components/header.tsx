'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/utils/api';

export function Header() {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const online = await checkHealth();
      setIsOnline(online);
      setIsChecking(false);
    };

    check();

    // Poll health status every 10s
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border industrial-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Title & Subtitle */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Tata Steel Crack Inspector
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered surface defect detection — Two-stage CNN with explainable AI
            </p>
          </div>

          {/* Right: API Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border industrial-border">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="data-mono">
              {isChecking ? 'Checking...' : isOnline ? 'API: Online' : 'API: Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
