/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div id="status-online" className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
        <Wifi className="w-3.5 h-3.5 animate-pulse" />
        <span>PWA Ligado</span>
      </div>
    );
  }

  return (
    <div id="status-offline" className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/60 text-red-400 border border-red-500/40 animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo Offline Ativo</span>
    </div>
  );
}
