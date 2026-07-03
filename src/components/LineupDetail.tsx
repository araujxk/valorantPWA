import React, { useState, useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Video, MapPin } from 'lucide-react';
import { Lineup } from '../types';
import ZoomableMinimap from './ZoomableMinimap';
import { getAbilityName, AGENTS_LIST } from '../data/valoData';

interface LineupDetailProps {
  lineup: Lineup;
  onClose: () => void;
  // Kept here so parent doesn't break
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  inline?: boolean;
  onTagClick?: (category: any, value: string) => void;
}

export default function LineupDetail({ lineup, onClose, inline = false, isBookmarked = false, onToggleBookmark, onTagClick }: LineupDetailProps) {
  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
    'pro-only': 'text-purple-400 bg-purple-500/15 border-purple-500/30 hover:bg-purple-500/25',
  };

  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    'pro-only': 'Pro-Only',
  };

  const sideColors = {
    attack: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
    defense: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
  };

  const sideLabels = {
    attack: 'Ataque',
    defense: 'Defesa',
  };

  const agentMeta = AGENTS_LIST.find(a => a.id === lineup.agent.id);
  const agentIcon = agentMeta ? `https://media.valorant-api.com/agents/${agentMeta.uuid}/displayicon.png` : lineup.agent.icon;

  const images = lineup.lineup.media.images || [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const [showVideo, setShowVideo] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online status listener
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

  const toggleFavorite = () => {
    if (onToggleBookmark) onToggleBookmark(lineup.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 50) {
      // swiped left => next slide
      setActiveSlide(prev => Math.min(prev + 1, images.length - 1));
    } else if (diff < -50) {
      // swiped right => prev slide
      setActiveSlide(prev => Math.max(prev - 1, 0));
    }
    setTouchStart(null);
  };

  const mapX = lineup.lineup.media.minimapMark?.x || 0;
  const mapY = lineup.lineup.media.minimapMark?.y || 0;

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl mx-auto flex flex-col md:flex-row">
      {/* Media Column */}
      <div className="w-full md:w-3/5 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
        {/* Toggle Video or Map/Images */}
        {showVideo && lineup.lineup.media.video ? (
           <div className="w-full aspect-video bg-black flex items-center justify-center relative">
             <iframe
               width="100%"
               height="100%"
               src={`https://www.youtube.com/embed/${lineup.lineup.media.video.videoId}?start=${lineup.lineup.media.video.startSeconds || 0}&autoplay=1`}
               title="YouTube video player"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             />
           </div>
        ) : (
          <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden"
               onTouchStart={handleTouchStart} 
               onTouchEnd={handleTouchEnd}>
            
            {images.length > 0 && (
              <img 
                src={images[activeSlide].url} 
                alt={images[activeSlide].alt} 
                className="w-full h-full object-contain bg-slate-950" 
              />
            )}
            
            {/* Desktop setas */}
            {activeSlide > 0 && (
              <button 
                onClick={() => setActiveSlide(activeSlide - 1)}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full items-center justify-center text-white hover:bg-black/90 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {activeSlide < images.length - 1 && (
              <button 
                onClick={() => setActiveSlide(activeSlide + 1)}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full items-center justify-center text-white hover:bg-black/90 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Legenda por slide */}
            {images.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <p className="text-white font-bold">{images[activeSlide].alt}</p>
                <div className="flex gap-2 mt-2 justify-center">
                  {images.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeSlide ? 'bg-red-500 w-4' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 flex gap-4 md:gap-8 justify-center bg-slate-950">
           <button 
             onClick={() => setShowVideo(false)}
             className={`flex items-center gap-2 text-sm font-bold uppercase transition-colors ${!showVideo ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
             Imagens
           </button>
           <button 
             onClick={() => setShowVideo(true)}
             disabled={!isOnline}
             className={`flex items-center gap-2 text-sm font-bold uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${showVideo ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}>
             <Video className="w-4 h-4" />
             Ver vídeo
             {!isOnline && <span className="text-[10px] lowercase block ml-1 text-slate-500">(Offline)</span>}
           </button>
        </div>
      </div>

      {/* Info Column */}
      <div className="w-full md:w-2/5 flex flex-col p-6 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800">
        <div className="flex justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white uppercase leading-none tracking-tight">{lineup.lineup.title}</h2>
            <p className="text-xs font-mono font-bold tracking-widest text-slate-400 mt-2 flex items-center gap-1.5">
              {agentIcon && (
                <span className="w-4 h-4 rounded-full bg-slate-950 overflow-hidden flex items-center justify-center shrink-0 border border-slate-800">
                  {agentIcon.startsWith('http') ? (
                    <img src={agentIcon} alt={lineup.agent.name} className="w-3.5 h-3.5 object-contain" />
                  ) : (
                    <span className="text-[8px]">{agentIcon}</span>
                  )}
                </span>
              )}
              <span>{lineup.agent.name} • {lineup.map.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl border transition-all ${isBookmarked ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            {!inline && (
              <button onClick={onClose} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Badges de Dificuldade, Lado e Habilidade */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              if (onTagClick) {
                onTagClick('difficulty', lineup.lineup.difficulty);
                onClose();
              }
            }}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider transition-colors cursor-pointer ${difficultyColors[lineup.lineup.difficulty]}`}
          >
            {difficultyLabels[lineup.lineup.difficulty]}
          </button>
          <button
            onClick={() => {
              if (onTagClick) {
                onTagClick('side', lineup.lineup.side);
                onClose();
              }
            }}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider transition-colors cursor-pointer ${sideColors[lineup.lineup.side]}`}
          >
            {sideLabels[lineup.lineup.side]}
          </button>
          <button
            onClick={() => {
              if (onTagClick) {
                onTagClick('ability', lineup.lineup.ability);
                onClose();
              }
            }}
            className="text-[10px] font-mono font-medium text-red-400 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            {getAbilityName(lineup.agent.id, lineup.lineup.ability)}
          </button>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-4 font-mono bg-slate-950 p-4 border border-slate-800 rounded-2xl">
          {lineup.lineup.description}
        </p>

        {/* Tags */}
        {lineup.lineup.tags && lineup.lineup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {lineup.lineup.tags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (onTagClick) {
                    onTagClick('tag', tag);
                    onClose();
                  }
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-800 transition cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Mini-mapa com zoom interactivo */}
        {lineup.map.minimap && (
           <div className="mt-auto flex flex-col pt-4">
             <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-3 block text-center">Mini-mapa Tático</p>
             <ZoomableMinimap
               src={lineup.map.minimap}
               mapName={lineup.map.name}
               pin={mapX > 0 && mapY > 0 ? { x: mapX, y: mapY } : undefined}
               angle={lineup.lineup.media.minimapMark?.angle}
               abilityId={lineup.lineup.ability}
               className="w-full aspect-square"
             />
           </div>
        )}
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto isolate py-20">
      {content}
    </div>
  );
}
