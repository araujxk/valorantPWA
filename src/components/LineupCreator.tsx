/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { X, Check, AlertCircle, Compass, Sparkles } from 'lucide-react';
import { Agent, Lineup, UserProfile } from '../types';
import { MAPS_LIST, AGENTS_LIST } from '../data/valoData';
import { LineupSchema } from '../lib/schema';
import ZoomableMinimap from './ZoomableMinimap';

interface LineupCreatorProps {
  currentUser: UserProfile | null;
  onAdd: (lineup: Lineup) => any;
  onClose: () => any;
}

export default function LineupCreator({
  currentUser,
  onAdd,
  onClose
}: LineupCreatorProps) {
  // Field States
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS_LIST[0].id);
  const [selectedMapId, setSelectedMapId] = useState(MAPS_LIST[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [side, setSide] = useState<'attack' | 'defense'>('attack');
  const [site, setSite] = useState('A');
  const [selectedAbility, setSelectedAbility] = useState(AGENTS_LIST[0].abilities[0].id);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'pro-only'>('medium');
  const [type, setType] = useState('pre-plant');
  const [tagsInput, setTagsInput] = useState('smoke, defsa');
  const [youtubeId, setYoutubeId] = useState('');
  
  // Custom Images (fallback URLs or default visual designs)
  const [imagePos, setImagePos] = useState('');
  const [imageCross, setImageCross] = useState('');
  const [imageRes, setImageRes] = useState('');

  // Coordinates
  const [minimapMark, setMinimapMark] = useState({ x: 0.5, y: 0.5 });
  
  // Error state
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Dynamic abilities lookup based on chosen agent
  const selectedAgent = AGENTS_LIST.find(a => a.id === selectedAgentId) || AGENTS_LIST[0];
  const abilities = selectedAgent.abilities;

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextAgentId = e.target.value;
    setSelectedAgentId(nextAgentId);
    const nextAgent = AGENTS_LIST.find(a => a.id === nextAgentId) || AGENTS_LIST[0];
    setSelectedAbility(nextAgent.abilities[0].id);
  };

  // Click handler on map canvas element
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    setMinimapMark({
      x: parseFloat(x.toFixed(3)),
      y: parseFloat(y.toFixed(3))
    });
  };

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setValidationSuccess(false);

    // Pick chosen map data
    const chosenMapMeta = MAPS_LIST.find(m => m.id === selectedMapId) || MAPS_LIST[0];

    // Build lists of tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    // Provide default Unsplash assets if images are empty, fully allowed under our security list
    const fallbackPosition = imagePos || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80";
    const fallbackCrosshair = imageCross || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80";
    const fallbackResult = imageRes || "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80";

    const isUserPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'pro-player';

    const newRawLineup: unknown = {
      id: generateUUID(),
      version: 1,
      isCustom: true,
      status: isUserPrivileged ? 'approved' : 'pending',
      authorId: currentUser?.id || 'anonimo',
      authorName: currentUser?.username || 'Anónimo',
      agent: {
        id: selectedAgent.id,
        name: selectedAgent.name,
        role: selectedAgent.role,
        icon: `https://media.valorant-api.com/agents/${selectedAgent.uuid}/displayicon.png` // Official agent icon
      },
      map: {
        id: chosenMapMeta.id,
        name: chosenMapMeta.name,
        minimap: chosenMapMeta.minimapUrl
      },
      lineup: {
        title: title.trim(),
        description: description.trim(),
        type: type,
        side: side,
        site: site,
        ability: selectedAbility,
        difficulty: difficulty,
        tags: tags,
        media: {
          images: [
            { url: fallbackPosition, alt: "Posição dos pés", type: "position" },
            { url: fallbackCrosshair, alt: "Alinhamento de mira", type: "crosshair" },
            { url: fallbackResult, alt: "Impacto final", type: "result" }
          ],
          video: {
            type: "youtube",
            videoId: youtubeId.trim() || "dQw4w9WgXcQ", // Roll default safe YouTube link if empty
            startSeconds: 0
          },
          minimapMark: minimapMark
        }
      }
    };

    // Zod Validation Runtime Security Check
    const result = LineupSchema.safeParse(newRawLineup);
    
    if (!result.success) {
      const messages: string[] = [];
      result.error.issues.forEach(issue => {
        messages.push(`${issue.path.join('.')} : ${issue.message}`);
      });
      setErrorMessages(messages);
      return;
    }

    // Success! Commit to dashboard and IndexedDB
    setValidationSuccess(true);
    setTimeout(() => {
      onAdd(result.data as Lineup);
    }, 1000);
  };

  return (
    <div id="creator-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md overflow-y-auto px-4 py-6 md:p-8 flex justify-center items-start">
      <div id="creator-modal-body" className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl relative overflow-hidden mt-4 md:mt-8">
        
        {/* Upper Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <div>
              <h1 className="text-lg font-black text-slate-100 uppercase tracking-tight">Registar Nova Lineup</h1>
              <p className="text-xs text-slate-500 leading-snug">Cria as tuas próprias jogadas táticas. Serão validadas com Zod e guardadas no teu PWA.</p>
            </div>
          </div>
          <button
            id="close-creator-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg border bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">

          {/* Validation Alert states */}
          {errorMessages.length > 0 && (
            <div id="creator-error-banner" className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider mb-1">Erros de Validação (Zod Schema):</p>
                <ul className="list-disc list-inside space-y-0.5 font-mono">
                  {errorMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {errorMessages.length === 0 && validationSuccess && (
            <div id="creator-success-banner" className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex gap-3 items-center">
              <Check className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold uppercase tracking-wider">Lineup Validada Com Sucesso!</p>
                <p className="text-slate-400 font-mono">A gerar hashes criptográficos e a guardar no IndexedDB...</p>
              </div>
            </div>
          )}

          {/* Core metadata: Agent and Map selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agente</label>
              <select
                id="select-agent"
                value={selectedAgentId}
                onChange={handleAgentChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                {AGENTS_LIST.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Habilidade Específica</label>
              <select
                id="select-ability"
                value={selectedAbility}
                onChange={(e) => setSelectedAbility(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                {abilities.map(ab => (
                  <option key={ab.id} value={ab.id}>
                    {ab.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Map Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mapa</label>
              <select
                id="select-map"
                value={selectedMapId}
                onChange={(e) => setSelectedMapId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                {MAPS_LIST.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Throw Site (A/B/C/Mid) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Zona de Plant (Site)</label>
              <select
                id="select-site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                <option value="A">A Site</option>
                <option value="B">B Site</option>
                <option value="C">C Site</option>
                <option value="Mid">Meio-Campo (Mid)</option>
              </select>
            </div>
          </div>

          {/* Title and descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Título Curto da Jogada</label>
              <input
                id="input-title"
                type="text"
                placeholder="Ex. Molly Padrão Caixa amarela"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Instruções Passo a Passo</label>
              <textarea
                id="input-description"
                placeholder="Ex. Posiciona-te contra o canto do contentor verde. Alinha a parte central da interface com a ponta da chaminé e faz salto-lançamento (Jump Throw)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Side / Type / Difficulty badges config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lado de Ação</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="side-btn-attack"
                  onClick={() => setSide('attack')}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                    side === 'attack'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  Ataque
                </button>
                <button
                  type="button"
                  id="side-btn-defense"
                  onClick={() => setSide('defense')}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                    side === 'defense'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  Defesa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dificuldade</label>
              <select
                id="select-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
                <option value="pro-only">Pro-Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoria de Jogada</label>
              <select
                id="select-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none transition-all"
              >
                <option value="pre-plant">Arremesso Inicial (Pre-Plant)</option>
                <option value="post-plant">Segurança Pós-Plant (Post-Plant)</option>
                <option value="retake">Retomada de Área (Retake)</option>
                <option value="execute">Ataque Rápido (Execute)</option>
              </select>
            </div>
          </div>

          {/* YouTube, Tags and coordinates setup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Interactive map location selector */}
            <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl md:col-span-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4 text-red-500" />
                <span>Indica Localização de Impacto no Mapa</span>
              </span>
              <p className="text-[11px] text-slate-500 mb-4 leading-normal">
                Clica no minimapa abaixo correspondente para plotar a posição exacta onde o projéctil deve de fato cair.
              </p>

              <ZoomableMinimap
                src={MAPS_LIST.find(m => m.id === selectedMapId)?.minimapUrl || ''}
                mapName={selectedMapId}
                pin={minimapMark}
                onPinPlace={(x, y) => setMinimapMark({ x, y })}
                abilityId={selectedAbility}
                className="aspect-square w-full"
              />

              {/* Coord readout */}
              <div className="flex justify-center gap-4 mt-3 font-mono text-[10px] text-slate-500">
                <span>COORD X: <strong className="text-slate-300">{minimapMark.x}</strong></span>
                <span>COORD Y: <strong className="text-slate-300">{minimapMark.y}</strong></span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tags block */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags (separadas por vírgulas)</label>
                <input
                  id="input-tags"
                  type="text"
                  placeholder="fácil, molotov, b-site"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder:text-slate-700 focus:outline-none transition-all"
                />
              </div>

              {/* YouTube Video link */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">YouTube Video ID (Opcional)</label>
                <input
                  id="input-youtube"
                  type="text"
                  placeholder="Ex. dQw4w9WgXcQ"
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-slate-100 text-sm placeholder:text-slate-700 focus:outline-none transition-all"
                />
              </div>

              {/* Informative Help Card */}
              <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[11px] text-amber-500 leading-relaxed">
                A segurança tática do teu PWA restringe domínios de media. Por defeito, imagens simuladas em alta fidelidade serão configuradas temporariamente para te auxiliar nas primeiras sessões offline.
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              id="creator-cancel-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-400 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="creator-submit-btn"
              disabled={validationSuccess}
              className="px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-red-600 hover:bg-red-600/90 text-white shadow-lg transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Gravar Lineup</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
