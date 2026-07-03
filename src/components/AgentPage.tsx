import React, { useState, useMemo } from 'react';
import { ArrowLeft, Compass, RotateCcw } from 'lucide-react';
import { Lineup } from '../types';
import { AGENTS_LIST, MAPS_LIST, getAbilityName } from '../data/valoData';
import LineupCard from './LineupCard';

interface AgentPageProps {
  agentId: string;
  lineups: Lineup[];
  onBack: () => void;
  onSelectLineup: (lineup: Lineup) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onDeleteCustom: (id: string, e?: React.MouseEvent) => void;
  searchQuery: string;
  bookmarksOnly: boolean;
  customOnly: boolean;
}

export default function AgentPage({
  agentId,
  lineups,
  onBack,
  onSelectLineup,
  bookmarks,
  onToggleBookmark,
  onDeleteCustom,
  searchQuery,
  bookmarksOnly,
  customOnly
}: AgentPageProps) {
  const agent = AGENTS_LIST.find(a => a.id === agentId);

  // 5 filters in pills
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSide, setSelectedSide] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const handleResetFilters = () => {
    setSelectedMap('all');
    setSelectedType('all');
    setSelectedSide('all');
    setSelectedSite('all');
    setSelectedDifficulty('all');
  };

  const agentLineups = useMemo(() => {
    let base = lineups.filter(l => l.agent.id === agentId);
    
    // Apply global app filters
    base = base.map(item => ({ ...item, isBookmarked: bookmarks.includes(item.id) }));
    if (bookmarksOnly) base = base.filter(l => l.isBookmarked);
    if (customOnly) base = base.filter(l => l.isCustom);
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      base = base.filter(l => {
         const abilityName = getAbilityName(l.agent.id, l.lineup.ability);
         const searchableStr = `${l.lineup.title} ${l.lineup.description} ${l.map.name} ${l.agent.name} ${l.lineup.site} ${abilityName} ${l.lineup.tags.join(' ')}`.toLowerCase();
         return searchableStr.includes(q);
      });
    }
    return base;
  }, [lineups, agentId, bookmarks, bookmarksOnly, customOnly, searchQuery]);

  const filteredLineups = useMemo(() => {
    return agentLineups.filter(lineup => {
      if (selectedMap !== 'all' && lineup.map.id !== selectedMap) return false;
      if (selectedType !== 'all' && lineup.lineup.type !== selectedType) return false;
      if (selectedSide !== 'all' && lineup.lineup.side !== selectedSide) return false;
      if (selectedSite !== 'all' && lineup.lineup.site.toUpperCase() !== selectedSite.toUpperCase()) return false;
      if (selectedDifficulty !== 'all' && lineup.lineup.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [agentLineups, selectedMap, selectedType, selectedSide, selectedSite, selectedDifficulty]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-white">Agente não encontrado.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-red-500 rounded-xl text-white font-bold uppercase">Voltar</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Todos os Agentes
      </button>

      {/* Header com cor do agente, nome e role */}
      <div className={`p-6 md:p-8 rounded-3xl bg-gradient-to-br ${agent.color} flex items-center gap-6 shadow-2xl relative overflow-hidden isolate`}>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="shrink-0 drop-shadow-2xl z-10 w-24 h-24 md:w-32 md:h-32 select-none">
          <img src={`https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`} alt={agent.name} className="w-full h-full object-contain" />
        </div>
        <div className="z-10 flex flex-col">
          <span className="text-white/80 font-mono font-black uppercase tracking-widest text-xs md:text-sm">{agent.role}</span>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mt-1">{agent.name}</h1>
          <span className="mt-4 inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 w-fit">
            <span className="text-xs font-bold text-white uppercase font-mono">Lineups Totais: <span className="text-red-400">{agentLineups.length}</span></span>
          </span>
        </div>
      </div>

      {/* 5 filtros em pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 w-fit px-2 py-1 rounded">Filtros Táticos</h3>
          
          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {/* Mapa */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl scrollbar-hide overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedMap('all')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedMap === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                Todos Mapas
              </button>
              {MAPS_LIST.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedMap === m.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Tipo */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {['all', 'retake', 'execute', 'post-plant'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedType === t ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {t === 'all' ? 'Lançamento' : t}
                </button>
              ))}
            </div>

            {/* Side */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {['all', 'attack', 'defense'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSide(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedSide === s ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {s === 'all' ? 'Lado' : s === 'attack' ? 'Ataque' : 'Defesa'}
                </button>
              ))}
            </div>

            {/* Site */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {['all', 'A', 'B', 'C', 'Mid'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedSite(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedSite === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {st === 'all' ? 'Spike Site' : st}
                </button>
              ))}
            </div>

            {/* Dificuldade */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {['all', 'easy', 'medium', 'hard', 'pro-only'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${selectedDifficulty === d ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  {d === 'all' ? 'Dificuldade' : d}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-1">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              Resultados: <span className="text-white text-sm bg-slate-800 px-2.5 py-0.5 rounded-md ml-1 border border-slate-700">{filteredLineups.length}</span>
            </div>
            {(selectedMap !== 'all' || selectedType !== 'all' || selectedSide !== 'all' || selectedSite !== 'all' || selectedDifficulty !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados ou Estado Vazio */}
      {filteredLineups.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-2xl mx-auto">
          <Compass className="w-14 h-14 text-slate-700 mb-5" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Nenhuma Lineup Encontrada</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
            As tuas definições táticas não retornaram resultados. Experimenta ajustar ou remover alguns filtros aplicados.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-600 transition"
          >
            Limpar Todos os Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
          {filteredLineups.map((lineup) => (
            <LineupCard
              key={lineup.id}
              lineup={lineup}
              onSelect={onSelectLineup}
              onToggleBookmark={onToggleBookmark}
              onDeleteCustom={onDeleteCustom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
