import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, X, Download, AlertTriangle } from 'lucide-react';
import { AGENTS_LIST } from '../data/valoData';
import { downloadAgent, downloadMap, clearAllCaches, getCacheSizeMB } from '../utils/pwaCache';
import { Lineup } from '../types';

export default function StorageManager({ onClose, lineups }: { onClose: () => void, lineups: Lineup[] }) {
  const [totalSize, setTotalSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ percent: number, mb: number } | null>(null);

  const refreshSize = async () => {
    const size = await getCacheSizeMB();
    setTotalSize(size);
  };

  useEffect(() => {
    refreshSize();
  }, []);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PWA_DOWNLOAD_PROGRESS') {
        setProgress({ 
          percent: e.data.percent, 
          mb: Math.round(e.data.totalBytes / 1024 / 1024 * 100) / 100 
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleClear = async () => {
    if (confirm('Tem a certeza que deseja eliminar todos os dados offline?')) {
      setIsClearing(true);
      await clearAllCaches();
      await refreshSize();
      setIsClearing(false);
      alert('Armazenamento offline limpo com sucesso.');
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading('all');
    setProgress({ percent: 0, mb: 0 });
    
    // Iteramos por todos os agentes para descarregar tudo
    const agents = Array.from(new Set(lineups.map(l => l.agent.id)));
    for (const agentId of agents) {
      await downloadAgent(agentId);
    }
    
    await refreshSize();
    setIsDownloading(null);
    setProgress(null);
    alert('Download concluído.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-red-500" />
            Recursos Offline
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm font-mono text-slate-400 mb-1">Armazenamento Estimado Usado</p>
            <p className="text-4xl font-black text-white">{totalSize} <span className="text-xl text-slate-500">MB</span></p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs text-slate-400">
              <AlertTriangle className="w-4 h-4 inline text-amber-500 mr-1 pb-0.5" />
              Os vídeos (YouTube) <strong>não são descarregados</strong> e exigem ligação à internet.
            </p>
            
            {isDownloading && progress !== null && (
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                  <span>A Descarregar...</span>
                  <span>{Math.round(progress.percent * 100)}% ({progress.mb} MB)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${progress.percent * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase">Todos os ficheiros</span>
                <span className="text-[10px] text-slate-500 font-mono">({lineups.length} lineups estimadas {(lineups.length * 0.5).toFixed(1)} MB)</span>
              </div>
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading !== null}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50 cursor-pointer"
                title="Descarregar Tudo"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 mt-2 border-t border-slate-800 pt-3 custom-scrollbar">
              <p className="text-[10px] font-bold text-slate-500 uppercase px-1 mb-2">Descarregar por Agente</p>
              {AGENTS_LIST.filter(a => lineups.some(l => l.agent.id === a.id)).map(agent => {
                const agentLineupsCount = lineups.filter(l => l.agent.id === agent.id).length;
                return (
                  <div key={agent.id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800/60 hover:border-slate-700 transition">
                    <div className="flex items-center gap-2">
                       <img src={`https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`} alt={agent.name} className="w-6 h-6 object-contain drop-shadow" loading="lazy" />
                       <span className="text-[11px] font-bold text-slate-300 uppercase">{agent.name}</span>
                       <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">({agentLineupsCount} lineups / ~{(agentLineupsCount * 0.5).toFixed(1)} MB)</span>
                    </div>
                    <button
                      onClick={async () => {
                        setIsDownloading(agent.id);
                        setProgress({ percent: 0, mb: 0 });
                        await downloadAgent(agent.id);
                        await refreshSize();
                        setIsDownloading(null);
                        setProgress(null);
                      }}
                      disabled={isDownloading !== null}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md disabled:opacity-50 cursor-pointer"
                      title={`Guardar Agente ${agent.name}`}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <p className="text-[10px] font-bold text-slate-500 uppercase px-1 mb-2 mt-4">Descarregar por Mapa</p>
              {Array.from(new Set(lineups.map(l => l.map.id))).map(mapId => {
                const mapLineupsCount = lineups.filter(l => l.map.id === mapId).length;
                if (mapLineupsCount === 0) return null;
                const mapName = lineups.find(l => l.map.id === mapId)?.map.name || mapId;
                return (
                  <div key={mapId} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800/60 hover:border-slate-700 transition">
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-bold text-slate-300 uppercase">{mapName}</span>
                       <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">({mapLineupsCount} lineups / ~{(mapLineupsCount * 0.5).toFixed(1)} MB)</span>
                    </div>
                    <button
                      onClick={async () => {
                        setIsDownloading('map_'+mapId);
                        setProgress({ percent: 0, mb: 0 });
                        await downloadMap(mapId);
                        await refreshSize();
                        setIsDownloading(null);
                        setProgress(null);
                      }}
                      disabled={isDownloading !== null}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md disabled:opacity-50 cursor-pointer"
                      title={`Guardar Mapa ${mapName}`}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClear}
              disabled={isClearing || isDownloading !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer text-xs"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'A limpar...' : 'Limpar Cache Offline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
