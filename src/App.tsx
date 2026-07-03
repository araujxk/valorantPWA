/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  Plus, 
  Star, 
  MapPin, 
  Award, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  BookOpen, 
  HelpCircle,
  Filter,
  ArrowLeft,
  RotateCcw,
  UserCheck,
  Heart,
  Sun,
  Moon,
  HardDrive,
  User,
  LogOut,
  ShieldAlert
} from 'lucide-react';

import { Lineup, UserProfile } from './types';
import { AGENTS_LIST, MAPS_LIST, getAgentName, getAbilityName } from './data/valoData';
import { validateAndFreezeLineups } from './lib/validation';
import { 
  getCustomLineups, 
  saveCustomLineup, 
  deleteCustomLineup, 
  getBookmarks, 
  addBookmark, 
  removeBookmark,
  getUserProfile,
  saveUserProfile
} from './lib/db';

// Static Data JSON Import
import staticLineupsRaw from './db/lineups.json';
const frozenLineups = Object.freeze(staticLineupsRaw);

// Modular Components
import OfflineIndicator from './components/OfflineIndicator';
import LineupCard from './components/LineupCard';
import LineupDetail from './components/LineupDetail';
import LineupCreator from './components/LineupCreator';
import StorageManager from './components/StorageManager';
import AgentPage from './components/AgentPage';
import LoginModal from './components/LoginModal';
import ModerationPanel from './components/ModerationPanel';

export default function App() {
  // App-wide lineups databases state
  const [staticLineups, setStaticLineups] = useState<Lineup[]>([]);
  const [customLineups, setCustomLineups] = useState<Lineup[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [isStorageManagerOpen, setIsStorageManagerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isModPanelOpen, setIsModPanelOpen] = useState(false);
  
  // Filtering & Search
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  
  // Combined Advanced Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSide, setSelectedSide] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  
  // Class / Role fast selector for the Home screen
  const [selectedClass, setSelectedClass] = useState<string>('all');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarksOnly, setBookmarksOnly] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-theme');
    } else if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.remove('light-theme');
    } else if (savedTheme === null && !prefersDark) {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const handleToggleTheme = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.add('light-theme');
    } else {
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.remove('light-theme');
    }
  };

  // Modals & Overlays
  const [activeLineup, setActiveLineup] = useState<Lineup | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [msgNotice, setMsgNotice] = useState<string | null>(null);

  // Initialize and mount lineups with validation
  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        // 1. Zod validate and deep freeze static assets
        const validatedStatic = validateAndFreezeLineups(frozenLineups);
        // Enrich map.minimap (tactic) and map.splash (thumbnail) from MAPS_LIST
        const enrich = (l: Lineup) => {
          const mapMeta = MAPS_LIST.find(m => m.id === l.map.id);
          if (mapMeta) {
            return { ...l, map: { ...l.map, minimap: mapMeta.minimapUrl, splash: mapMeta.splashUrl || mapMeta.minimapUrl } };
          }
          return l;
        };
        setStaticLineups(validatedStatic.map(enrich));

        // 2. Fetch custom records from IndexedDB
        const localCustoms = await getCustomLineups();
        setCustomLineups(localCustoms.map(enrich));

        // 3. Fetch bookmarked IDs
        const localBookmarks = await getBookmarks();
        setBookmarks(localBookmarks);
      } catch (err) {
        console.error("Initialization failure during startup:", err);
        setMsgNotice("Aviso: Falha ao validar ou ler os dados locais do PWA.");
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  // Restaura a sessão do utilizador ao carregar
  useEffect(() => {
    async function loadSession() {
      const savedUserId = localStorage.getItem('logged_in_user_id');
      if (savedUserId) {
        try {
          const profile = await getUserProfile(savedUserId);
          if (profile) {
            setCurrentUser(profile);
          }
        } catch (err) {
          console.error("Failed to restore user session:", err);
        }
      }
    }
    loadSession();
  }, []);

  // Handle PWA shortcut launch parameter (?openCreator=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCreator') === '1') {
      setIsCreatorOpen(true);
    }
  }, []);

  // Sync Bookmarks toggle operations
  const handleToggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const isStarred = bookmarks.includes(id);
      if (isStarred) {
        await removeBookmark(id);
        setBookmarks(prev => prev.filter(bId => bId !== id));
      } else {
        await addBookmark(id);
        setBookmarks(prev => [...prev, id]);
      }
    } catch (err) {
      console.error("Erro de persistência em Favoritos:", err);
    }
  };

  // Sync creator saves
  const handleAddCustomLineup = async (newLineup: Lineup) => {
    try {
      await saveCustomLineup(newLineup);
      setCustomLineups(prev => [newLineup, ...prev]);
      setIsCreatorOpen(false);
      
      if (newLineup.status === 'pending') {
        setMsgNotice("Lineup proposta! Ficará visível publicamente após análise de um Admin/Pro-Player.");
        setTimeout(() => setMsgNotice(null), 5000);
      } else {
        setActiveLineup(newLineup);
      }
    } catch (err) {
      console.error("Erro de salvamento em Custom Lineups:", err);
    }
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('logged_in_user_id', user.id);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_in_user_id');
  };

  const handleApproveLineup = async (id: string) => {
    try {
      const item = customLineups.find(l => l.id === id);
      if (!item) return;

      const updated = { ...item, status: 'approved' as const };
      await saveCustomLineup(updated);

      if (updated.authorId && updated.authorId !== 'anonimo') {
        const authorProfile = await getUserProfile(updated.authorId);
        if (authorProfile) {
          const approvedCount = (authorProfile.approvedSubmissionsCount || 0) + 1;
          const nextRole = (authorProfile.role === 'jogador' && approvedCount >= 1) ? 'contribuinte' as const : authorProfile.role;
          const updatedAuthor = {
            ...authorProfile,
            approvedSubmissionsCount: approvedCount,
            role: nextRole
          };
          await saveUserProfile(updatedAuthor);
          if (currentUser && currentUser.id === updated.authorId) {
            setCurrentUser(updatedAuthor);
          }
        }
      }

      setCustomLineups(prev => prev.map(l => l.id === id ? updated : l));
      setMsgNotice("Lineup aprovada e publicada com sucesso!");
      setTimeout(() => setMsgNotice(null), 4000);
    } catch (err) {
      console.error("Erro ao aprovar lineup:", err);
    }
  };

  const handleRejectLineup = async (id: string) => {
    try {
      const item = customLineups.find(l => l.id === id);
      if (!item) return;

      const updated = { ...item, status: 'rejected' as const };
      await saveCustomLineup(updated);

      setCustomLineups(prev => prev.filter(l => l.id !== id));
      setMsgNotice("Lineup rejeitada com sucesso.");
      setTimeout(() => setMsgNotice(null), 4000);
    } catch (err) {
      console.error("Erro ao rejeitar lineup:", err);
    }
  };

  const pendingCount = useMemo(() => customLineups.filter(l => l.status === 'pending').length, [customLineups]);
  const pendingLineups = useMemo(() => customLineups.filter(l => l.status === 'pending'), [customLineups]);

  // Custom Lineup removal sync
  const handleDeleteCustomLineup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Desejas eliminar esta lineup criada de forma permanente?")) return;
    try {
      await deleteCustomLineup(id);
      setCustomLineups(prev => prev.filter(l => l.id !== id));
      // Remove from bookmark state if it was starred
      if (bookmarks.includes(id)) {
        await removeBookmark(id);
        setBookmarks(prev => prev.filter(bId => bId !== id));
      }
      if (activeLineup?.id === id) {
        setActiveLineup(null);
      }
    } catch (err) {
      console.error("Erro ao remover lineup personalizada:", err);
    }
  };

  const handleResetFilters = () => {
    setSelectedMap('all');
    setSelectedAgent('all');
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSelectedSide('all');
    setSelectedSite('all');
    setSelectedClass('all');
    setSearchQuery('');
    setBookmarksOnly(false);
    setCustomOnly(false);
  };

  // Merge Databases and annotate with states
  const allLineupsMerged: Lineup[] = [
    ...customLineups.map(c => ({ ...c, isCustom: true })),
    ...staticLineups.map(s => ({ ...s, isCustom: false }))
  ].map(item => ({
    ...item,
    isBookmarked: bookmarks.includes(item.id)
  })).filter(item => {
    if (!item.isCustom) return true;
    if (item.status === 'approved') return true;
    if (item.authorId === currentUser?.id) return true;
    return false;
  });

  // Filtering Calculation of Lineups
  const filteredLineups = allLineupsMerged.filter(item => {
    // Map ID filter
    if (selectedMap !== 'all' && item.map.id !== selectedMap) return false;
    
    // Agent ID filter
    if (selectedAgent !== 'all' && item.agent.id !== selectedAgent) return false;
    
    // Agent Class/Role filter (Fast Filter for Home)
    if (selectedAgent === 'all' && selectedClass !== 'all') {
      const agentMeta = AGENTS_LIST.find(a => a.id === item.agent.id);
      if (!agentMeta || agentMeta.role !== selectedClass) return false;
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all' && item.lineup.difficulty !== selectedDifficulty) return false;
    
    // Type filter (pré-plant, pós-plant, etc.)
    if (selectedType !== 'all' && item.lineup.type !== selectedType) return false;
    
    // Side filter (attack, defense)
    if (selectedSide !== 'all' && item.lineup.side !== selectedSide) return false;
    
    // Site filter (A, B, C, Mid)
    if (selectedSite !== 'all' && item.lineup.site.toUpperCase() !== selectedSite.toUpperCase()) return false;
    
    // Starred filter
    if (bookmarksOnly && !item.isBookmarked) return false;
    
    // Created custom filter
    if (customOnly && !item.isCustom) return false;

    return true;
  });

  const searchedAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return AGENTS_LIST;
    return AGENTS_LIST.filter(a => a.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const searchedLineups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 3) return [];
    return allLineupsMerged.filter(item => {
      const ability = item.lineup.ability || '';
      const searchableStr = `${item.lineup.title} ${(item.lineup.tags || []).join(' ')} ${item.map.name} ${ability}`.toLowerCase();
      return searchableStr.includes(q);
    });
  }, [searchQuery, allLineupsMerged]);

  // Handle clickable tags callback from LineupDetail popup
  const handleTagClickFromDetail = (category: 'map' | 'agent' | 'type' | 'side' | 'site' | 'ability' | 'tag' | 'difficulty', value: string) => {
    // Clear global filters first to allow smooth cross-discovery
    setBookmarksOnly(false);
    setCustomOnly(false);

    if (category === 'map') {
      setSelectedMap(value);
    } else if (category === 'agent') {
      setSelectedAgent(value);
    } else if (category === 'type') {
      setSelectedType(value);
    } else if (category === 'side') {
      setSelectedSide(value);
    } else if (category === 'site') {
      setSelectedSite(value);
    } else if (category === 'difficulty') {
      setSelectedDifficulty(value);
    } else if (category === 'ability' || category === 'tag') {
      // populate search bar to filter instantly
      setSearchQuery(value);
    }
  };

  // Portuguese labels helper mappings for agent role classes
  const roleLabels = {
    duelist: { pt: 'Duelista', color: 'from-orange-500/20 to-rose-600/20 border-rose-500/40 text-rose-400 font-bold' },
    controller: { pt: 'Controlador', color: 'from-emerald-500/20 to-teal-800/20 border-emerald-500/40 text-emerald-400 font-bold' },
    initiator: { pt: 'Iniciador', color: 'from-sky-500/20 to-blue-800/20 border-sky-500/40 text-sky-400 font-bold' },
    sentinel: { pt: 'Sentinela', color: 'from-yellow-500/20 to-amber-700/20 border-yellow-500/40 text-yellow-500 font-bold' }
  };

  // Find currently selected agent details if any
  const currentAgentDetails = selectedAgent !== 'all' ? AGENTS_LIST.find(a => a.id === selectedAgent) : null;

  return (
    <div id="valorant-lineups-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased pb-16 md:pb-0">
      
      {/* Top Navigation Header bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & slogan */}
          <div className="flex items-center gap-3">
            <div 
              onClick={handleResetFilters}
              className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-xl tracking-tighter cursor-pointer transform hover:rotate-12 transition-transform shadow-md font-mono"
            >
              V
            </div>
            <div>
              <h1 
                onClick={handleResetFilters}
                className="text-lg font-black tracking-tight uppercase text-white flex items-center gap-1.5 leading-none cursor-pointer hover:text-red-400 transition-colors"
              >
                VALORANT <span className="text-red-500">LINEUPS</span>
              </h1>
              <p className="text-[9px] text-slate-400 tracking-widest font-mono font-medium mt-1">
                GUIA TÁCTICO DE PIXELS TÉCNICOS • PWA COMPATÍVEL
              </p>
            </div>
          </div>

          {/* Core action widget controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsStorageManagerOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
              title="Gerir Armazenamento Offline"
            >
              <HardDrive className="w-4 h-4 text-slate-400" />
            </button>
            <button
              id="theme-toggle-btn"
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
              title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>
            <OfflineIndicator />

            {/* Moderation Button */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'pro-player') && (
              <button
                onClick={() => setIsModPanelOpen(true)}
                className="relative p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
                title="Fila de Moderação"
              >
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center border border-slate-900 shadow">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* User Login/Profile */}
            {!currentUser ? (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/60 transition cursor-pointer min-h-[40px]"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Login</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-850 min-h-[40px]">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-200 font-mono uppercase">{currentUser.username}</span>
                  <span className={`text-[8px] font-black uppercase px-1 rounded-sm tracking-wider ${
                    currentUser.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    currentUser.role === 'pro-player' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    currentUser.role === 'contribuinte' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-450 border border-slate-750'
                  }`}>
                    {currentUser.role === 'pro-player' ? 'PRO' : currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              id="add-lineup-header-btn"
              onClick={() => setIsCreatorOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/15 transition-all cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Lineup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main app grid area */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex-grow flex flex-col gap-6">

        {/* Local warning messages block */}
        {msgNotice && (
          <div id="app-warning-banner" className="bg-yellow-500/10 border border-yellow-500/30 text-amber-500 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
            <span>{msgNotice}</span>
            <button onClick={() => setMsgNotice(null)} className="text-amber-500 hover:text-white font-bold ml-4">OK</button>
          </div>
        )}

        {/* Global sticky bar with Search query input & bookmarks / custom buttons */}
        <section id="search-quick-actions" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-grow w-full relative">
            <input
              id="main-app-search"
              type="text"
              placeholder="Pesquisa por agente, mapa, habilidades ou tags (mín. 3 caract.)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-600 uppercase font-merta tracking-wide"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            
            {searchQuery.length > 0 && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 py-0.5 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px] uppercase font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto shrink-0 overflow-x-auto pb-0.5">
            {/* Bookmarks Star Counter Tag filter */}
            <button
              id="filter-star-tgl"
              onClick={() => {
                setBookmarksOnly(!bookmarksOnly);
                setCustomOnly(false); // mutually exclusive to avoid empty grid confusing the UX
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                bookmarksOnly 
                  ? 'bg-red-500/15 border-red-500 text-red-400' 
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${bookmarksOnly ? 'fill-red-400' : ''}`} />
              <span>Favoritos ({allLineupsMerged.filter(l => l.isBookmarked).length})</span>
            </button>

            {/* Custom User Created Toggle index */}
            <button
              id="filter-custom-tgl"
              onClick={() => {
                setCustomOnly(!customOnly);
                setBookmarksOnly(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                customOnly 
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400' 
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Criados ({allLineupsMerged.filter(l => l.isCustom).length})</span>
            </button>
          </div>
        </section>

        {/* SCREEN I: AGENTS LANDING GALLERY GRID (Active when selectedAgent === 'all') */}
        {selectedAgent === 'all' && (
          <section id="agents-home-gallery" className="space-y-6">
            
            {/* Fast classification pills controller */}
            <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Filtrar Agentes por Classe Operacional
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                    selectedClass === 'all'
                      ? 'bg-red-600 border-red-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  Todos Agentes ({AGENTS_LIST.length})
                </button>
                {Object.entries(roleLabels).map(([key, value]) => {
                  const isActive = selectedClass === key;
                  const totalClassCount = AGENTS_LIST.filter(a => a.role === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedClass(key)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 border-red-500 text-red-400 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {value.pt} ({totalClassCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick title indicating scope */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 font-mono">
                Seleciona um Agente para Ver as Lineups
              </h2>
            </div>

            {/* Responsive grid mapping agents profiles */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchedAgents
                .filter(agent => selectedClass === 'all' || agent.role === selectedClass)
                .map(agent => {
                  const classMeta = roleLabels[agent.role] || { pt: agent.role, color: 'text-slate-400 font-mono' };
                  const availableLineups = allLineupsMerged.filter(l => l.agent.id === agent.id).length;
                  
                  return (
                    <div
                      key={agent.id}
                      id={`agent-panel-${agent.id}`}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        // Clear class filter upon select to view agent lineups fully.
                        setSelectedClass('all');
                      }}
                      className="group relative bg-slate-900 hover:bg-slate-850 p-5 rounded-2xl border border-slate-800 hover:border-red-500/40 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:shadow-red-500/5 transform hover:-translate-y-0.5"
                    >
                      {/* Avatar container with special coloration bg depending on class */}
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden`}>
                           <img src={`https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`} loading="lazy" alt={`${agent.name} icon`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-100 uppercase tracking-tight group-hover:text-red-400 transition-colors">
                            {agent.name}
                          </h3>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border mt-1 select-none inline-block ${classMeta.color}`}>
                            {classMeta.pt}
                          </span>
                        </div>
                      </div>

                      {/* Number count of tactical setups saved */}
                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-sans tracking-wide uppercase">
                          Lineups Disponíveis
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-950 font-mono border border-slate-800 text-[11px] font-black rounded-lg text-red-400">
                          {availableLineups}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Quick help banner */}
            <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-500 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Queres estudar novos posicionamentos táticos? Seleciona qualquer agente herói acima para ver os pontos exatos de mira no pós-plant ou pré-plant!
                </p>
              </div>
              <button 
                onClick={() => setIsCreatorOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shrink-0"
              >
                Criar Lineup Customizada
              </button>
            </div>

            {/* SEARCH RESULTS SECTION */}
            {searchQuery.trim().length >= 3 && searchedLineups.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 font-mono">
                    Resultados de Lineups ({searchedLineups.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {searchedLineups.map(lineup => (
                    <LineupCard
                      key={lineup.id}
                      lineup={lineup}
                      onToggleBookmark={handleToggleBookmark}
                      onSelect={() => setActiveLineup(lineup)}
                    />
                  ))}
                </div>
              </div>
            )}
            
          </section>
        )}

        {/* SCREEN II: DETAILED AGENT OPERATIONS PAGE (Active when selectedAgent !== 'all') */}
        {selectedAgent !== 'all' && (
          <AgentPage
            agentId={selectedAgent}
            lineups={allLineupsMerged}
            bookmarks={bookmarks}
            searchQuery={searchQuery}
            bookmarksOnly={bookmarksOnly}
            customOnly={customOnly}
            onBack={() => {
              setSelectedAgent('all');
              handleResetFilters();
            }}
            onSelectLineup={setActiveLineup}
            onToggleBookmark={handleToggleBookmark}
            onDeleteCustom={handleDeleteCustomLineup}
          />
        )}

      </main>

      {/* Floating Action Button for smaller screen touch points (Mobile Layout) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          id="floating-plus-btn"
          onClick={() => setIsCreatorOpen(true)}
          className="w-14 h-14 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border border-red-500 cursor-pointer"
          title="Registar nova lineup"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* MODAL I: Custom Lineup Creator Wizard */}
      {isCreatorOpen && (
        <LineupCreator
          currentUser={currentUser}
          onAdd={handleAddCustomLineup}
          onClose={() => setIsCreatorOpen(false)}
        />
      )}

      {/* MODAL II: Lineup Deep Inspector Overlay Viewer */}
      {activeLineup && (
        <LineupDetail
          lineup={activeLineup}
          isBookmarked={bookmarks.includes(activeLineup.id)}
          onToggleBookmark={handleToggleBookmark}
          onClose={() => setActiveLineup(null)}
          onTagClick={handleTagClickFromDetail}
        />
      )}

      {/* MODAL III: User Authentication Overlay */}
      {isLoginOpen && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

      {/* MODAL IV: Queue Moderation Dashboard */}
      {isModPanelOpen && (
        <ModerationPanel
          pendingLineups={pendingLineups}
          onApprove={handleApproveLineup}
          onReject={handleRejectLineup}
          onClose={() => setIsModPanelOpen(false)}
        />
      )}

      {/* Sticky Bottom Footer indicating PWA parameters */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-[10px] text-slate-500 font-mono tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-600">
          <p>© 2026 VALORANT LINEUPS PWA • INDEXEDDB PERSISTIDO COM GARANTIA OFFLINE</p>
          <div className="flex gap-4">
            <span>INDEXEDDB COMPATÍVEL</span>
            <span>DOMÍNIO DE IMAGEM VALIDADO</span>
            <span>MODO SEGURO ZOD ATIVO</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Navigation Bar for Mobile (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-around shadow-2xl safe-bottom">
        
        {/* Home */}
        <button 
          onClick={() => {
            setSelectedAgent('all');
            handleResetFilters();
          }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wide font-black transition cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            selectedAgent === 'all' && !bookmarksOnly && !customOnly 
              ? 'text-red-500' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Pesquisa */}
        <button 
          onClick={() => {
            setSelectedAgent('all');
            setTimeout(() => {
              const el = document.getElementById('main-app-search');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                el.focus();
              }
            }, 100);
          }}
          className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-wide font-black text-slate-400 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px] justify-center"
        >
          <Search className="w-5 h-5" />
          <span>Pesquisa</span>
        </button>

        {/* Favoritos */}
        <button 
          onClick={() => {
            setSelectedAgent('all');
            setBookmarksOnly(true);
            setCustomOnly(false);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wide font-black transition cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            bookmarksOnly ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${bookmarksOnly ? 'fill-red-500 text-red-500' : ''}`} />
          <span>Favoritos</span>
        </button>

        {/* Offline (Custom index) */}
        <button 
          onClick={() => {
            setSelectedAgent('all');
            setCustomOnly(true);
            setBookmarksOnly(false);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wide font-black transition cursor-pointer min-h-[44px] min-w-[44px] justify-center ${
            customOnly ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className={`w-5 h-5 ${customOnly ? 'fill-red-500 text-red-500' : ''}`} />
          <span>Offline</span>
        </button>

      </div>

      {isStorageManagerOpen && (
        <StorageManager 
          onClose={() => setIsStorageManagerOpen(false)} 
          lineups={[...staticLineups, ...customLineups]} 
        />
      )}

    </div>
  );
}
