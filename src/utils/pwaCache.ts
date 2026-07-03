import { Lineup } from '../types';
import staticLineupsRaw from '../db/lineups.json';

// Fetch specific subset of lineups from our static DB.
const getStaticLineups = () => staticLineupsRaw as unknown as Lineup[];

async function downloadImages(urls: string[], category: string, identifier: string) {
  if (urls.length === 0) return 0;
  const cacheName = 'unsplash-images'; 
  const cache = await caches.open(cacheName);
  
  let totalBytes = 0;
  let downloadedCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const existing = await cache.match(url);
      if (!existing) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const clone = response.clone();
        const blob = await clone.blob();
        totalBytes += blob.size || 300000;
        await cache.put(url, response);
      } else {
        const blob = await existing.blob();
        totalBytes += blob.size || 300000;
      }
    } catch (e) {
      console.error('Failed to cache', url, e);
    }
    
    downloadedCount++;
    const percent = downloadedCount / urls.length;
    
    // Progresso via postMessage
    if (typeof window !== 'undefined') {
      window.postMessage({
        type: 'PWA_DOWNLOAD_PROGRESS',
        category,
        identifier,
        percent,
        downloadedCount,
        totalCount: urls.length,
        totalBytes
      }, '*');
    }
  }

  return Math.round(totalBytes / 1024 / 1024 * 100) / 100; // MB
}

import { AGENTS_LIST } from '../data/valoData';

export async function downloadAgent(agentId: string) {
  const targetLineups = getStaticLineups().filter(l => l.agent.id === agentId);
  const urlsToCache = new Set<string>();
  
  targetLineups.forEach(l => {
    if (l.lineup.media?.images) {
      l.lineup.media.images.forEach(img => urlsToCache.add(img.url));
    }
    if (l.map.minimap) {
      urlsToCache.add(l.map.minimap);
    }
    const agentMeta = AGENTS_LIST.find(a => a.id === l.agent.id);
    if (agentMeta) {
      urlsToCache.add(`https://media.valorant-api.com/agents/${agentMeta.uuid}/displayicon.png`);
    }
  });

  return downloadImages(Array.from(urlsToCache), 'agent', agentId);
}

export async function downloadMap(mapId: string) {
  const targetLineups = getStaticLineups().filter(l => l.map.id === mapId);
  const urlsToCache = new Set<string>();
  
  targetLineups.forEach(l => {
    if (l.lineup.media?.images) {
      l.lineup.media.images.forEach(img => urlsToCache.add(img.url));
    }
    if (l.map.minimap) {
      urlsToCache.add(l.map.minimap);
    }
    const agentMeta = AGENTS_LIST.find(a => a.id === l.agent.id);
    if (agentMeta) {
      urlsToCache.add(`https://media.valorant-api.com/agents/${agentMeta.uuid}/displayicon.png`);
    }
  });

  return downloadImages(Array.from(urlsToCache), 'map', mapId);
}

export async function clearAllCaches() {
  const keys = await caches.keys();
  for (const key of keys) {
    if (key.includes('unsplash-images') || key.includes('json-data') || key.includes('workbox')) {
      await caches.delete(key);
    }
  }
}

export async function getCacheSizeMB() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage ? Math.round(estimate.usage / 1024 / 1024 * 100) / 100 : 0;
  }
  return 0;
}
