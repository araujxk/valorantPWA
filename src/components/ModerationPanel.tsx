import React from 'react';
import { Check, X, ShieldAlert, FileText, Video, Eye, User, Calendar, MapPin } from 'lucide-react';
import { Lineup } from '../types';

interface ModerationPanelProps {
  pendingLineups: Lineup[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

export default function ModerationPanel({
  pendingLineups,
  onApprove,
  onReject,
  onClose
}: ModerationPanelProps) {
  return (
    <div id="moderation-panel-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div id="moderation-panel-modal" className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden my-8 p-6 md:p-8 flex flex-col max-h-[85vh]">
        
        {/* Riot Design Tech Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />

        {/* Header Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Fila de Moderação</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">Avalie as propostas de lineups enviadas pela comunidade.</p>
        </div>

        {/* Pending Lineups List */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {pendingLineups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Fila de Trabalho Limpa!</h3>
              <p className="text-xs text-slate-500 font-mono mt-1 max-w-xs">Não existem novas propostas de lineups a aguardar verificação.</p>
            </div>
          ) : (
            pendingLineups.map((item) => {
              const { id, agent, map, lineup: details, authorName } = item;
              return (
                <div key={id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition flex flex-col md:flex-row gap-5 items-start justify-between">
                  
                  {/* Left content: Agent, map, details */}
                  <div className="space-y-3 flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] text-slate-300 font-mono uppercase font-bold">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-300 font-mono uppercase font-bold">{map.name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded-lg font-mono">
                        Site {details.site}
                      </span>
                      <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg font-mono uppercase">
                        {details.side === 'attack' ? 'Ataque' : 'Defesa'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100 truncate">{details.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{details.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-650" />
                        Proposto por: <strong className="text-slate-400">{authorName || 'Utilizador'}</strong>
                      </span>
                      {details.media.video && (
                        <span className="flex items-center gap-1 text-red-400">
                          <Video className="w-3.5 h-3.5" />
                          Contém Vídeo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Media preview (if exists) */}
                  {details.media.images && details.media.images.length > 0 && (
                    <div className="shrink-0 w-28 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group hidden sm:block">
                      <img 
                        src={details.media.images[0].url} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-60"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = map.minimap || '';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-850 md:self-stretch md:justify-center">
                    <button
                      onClick={() => onApprove(id)}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aprovar</span>
                    </button>
                    <button
                      onClick={() => onReject(id)}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 border border-slate-700 hover:border-red-500 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeitar</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
