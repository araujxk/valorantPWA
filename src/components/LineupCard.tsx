/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Eye, Shield, Award, MapPin, Compass, Trash2, User } from 'lucide-react';
import { getAbilityName, AGENTS_LIST } from '../data/valoData';

interface LineupCardProps {
  key?: any;
  lineup: any;
  onSelect: (lineup: any) => any;
  onToggleBookmark: (id: string, e?: any) => any;
  onDeleteCustom?: (id: string, e?: any) => any;
  condensed?: boolean;
}

export default function LineupCard({
  lineup,
  onSelect,
  onToggleBookmark,
  onDeleteCustom,
  condensed = false
}: LineupCardProps) {
  const { id, agent, map, lineup: details, isCustom, isBookmarked } = lineup;

  const agentMeta = AGENTS_LIST.find(a => a.id === agent.id);
  const agentIcon = agentMeta ? `https://media.valorant-api.com/agents/${agentMeta.uuid}/displayicon.png` : agent.icon;

  // Set colors based on difficulty
  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
    'pro-only': 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  };

  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    'pro-only': 'Pro-Only',
  };

  // Side banner colors
  const sideColors = {
    attack: 'bg-red-500/10 text-red-400 border-red-500/20',
    defense: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  const sideLabels = {
    attack: 'Ataque',
    defense: 'Defesa',
  };

  if (condensed) {
    return (
      <div
        id={`lineup-card-${id}`}
        onClick={() => onSelect(lineup)}
        className="group relative flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-red-500/40 rounded-xl p-3.5 gap-4 cursor-pointer transition-all hover:bg-slate-850"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-red-600/15 border border-red-500/35 flex flex-col items-center justify-center text-red-400 shrink-0 select-none font-bold">
            <span className="text-[12px] font-black leading-none">{map.name.slice(0, 2).toUpperCase()}</span>
            <span className="text-[7px] tracking-wider uppercase font-black text-red-500 mt-1">{details.site}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${sideColors[details.side]}`}>
                {sideLabels[details.side]}
              </span>
              {agentIcon && (
                <div className="w-4 h-4 rounded-full bg-slate-950 overflow-hidden flex items-center justify-center shrink-0">
                  {agentIcon.startsWith('http') ? (
                    <img src={agentIcon} alt={agent.name} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <span className="text-[8px]">{agentIcon}</span>
                  )}
                </div>
              )}
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{agent.name}</span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
              {details.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${difficultyColors[details.difficulty]}`}>
            {difficultyLabels[details.difficulty]}
          </span>
          
          <button
            id={`bookmark-btn-cond-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(id, e);
            }}
            className={`p-1 rounded transition-colors ${
              isBookmarked ? 'text-red-500 scale-110' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`lineup-card-${id}`}
      onClick={() => onSelect(lineup)}
      className="group relative flex flex-col bg-slate-900 border border-slate-800/80 hover:border-red-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-0.5"
    >
      {/* Background card accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-0 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Top action row */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex gap-1.5 items-center">
          {/* Side badge */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sideColors[details.side]}`}>
            {sideLabels[details.side]}
          </span>
          {/* Custom tag */}
          {isCustom && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-yellow-500/30 bg-yellow-500/15 text-yellow-400">
              <User className="w-2.5 h-2.5" />
              <span>Criado</span>
            </span>
          )}
        </div>

        {/* Favorite toggle button */}
        <button
          id={`bookmark-btn-${id}`}
          onClick={(e) => onToggleBookmark(id, e)}
          className={`p-1.5 rounded-lg border backdrop-blur-sm transition-all duration-200 ${
            isBookmarked
              ? 'bg-red-500/25 border-red-500 text-red-400 scale-110'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white'
          }`}
          title={isBookmarked ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
          <Star className={`w-4 h-4 ${isBookmarked ? 'fill-red-400' : ''}`} />
        </button>
      </div>

      {/* Card Header / Map background header representation */}
      <div className="h-28 w-full bg-slate-950/60 flex items-end relative overflow-hidden">
        {/* Simple elegant fallbacks for images */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-900 z-10" />
        <div className="absolute inset-0 bg-slate-800 animate-pulse group-hover:scale-105 transition-transform duration-700" style={{ transformOrigin: 'center' }}>
          <img
            src={(map as any).splash || map.minimap}
            alt={map.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 filter blur-[1px]"
            onError={(e) => {
              // Graceful fallback for offline / blocked URLs
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        
        {/* Map and Agent Header details */}
        <div className="p-4 w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 text-sm font-semibold tracking-wide">
              {map.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Mapa</p>
              <h3 className="text-sm font-bold text-white tracking-wide">{map.name}</h3>
            </div>
          </div>

          {/* Location Badge (Site A/B/C) */}
          <div className="flex h-7 px-3 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg items-center border border-red-500/40">
            Site {details.site}
          </div>
        </div>
      </div>

      {/* Mini-mapa Tático – fora do overflow-hidden */}
      {map.minimap && (
        <div className="px-3 pt-2 pb-0 bg-slate-950/40">
          <p className="text-[9px] font-mono font-black tracking-widest text-slate-500 uppercase mb-1 text-center">Mini-mapa Tático</p>
          <div className="relative w-full aspect-square max-w-[140px] mx-auto bg-slate-900 rounded-lg overflow-hidden border border-slate-800/60">
            <img
              src={map.minimap}
              alt={`Mini-mapa ${map.name}`}
              className="w-full h-full object-contain opacity-90"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
        </div>
      )}

      {/* Card Info Content */}
      <div className="p-4 flex-grow flex flex-col justify-between relative z-10">
        <div>
          {/* Agent Info Row */}
          <div className="flex items-center gap-2 mb-2">
            {agentIcon && (
              <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center shrink-0">
                {agentIcon.startsWith('http') ? (
                  <img src={agentIcon} alt={agent.name} className="w-4 h-4 object-contain" />
                ) : (
                  <span className="text-[10px]">{agentIcon}</span>
                )}
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-semibold">{agent.name}</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{agent.role}</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-slate-100 group-hover:text-red-400 transition-colors line-clamp-1 mb-1.5">
            {details.title}
          </h2>

          {/* Setup Ability Name */}
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[11px] font-mono font-medium text-red-400 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
              {getAbilityName(agent.id, details.ability)}
            </div>
          </div>

          {/* Description line */}
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {details.description}
          </p>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
          {/* Difficulty indicator */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${difficultyColors[details.difficulty]}`}>
            {difficultyLabels[details.difficulty]}
          </span>

          {/* Tags preview */}
          {details.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden max-w-[60%]">
              {details.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[9px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-950/60 rounded border border-slate-800">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Delete action for custom creator assets only */}
          {isCustom && onDeleteCustom && (
            <button
              id={`delete-btn-${id}`}
              onClick={(e) => onDeleteCustom(id, e)}
              className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
              title="Apagar Lineup"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
