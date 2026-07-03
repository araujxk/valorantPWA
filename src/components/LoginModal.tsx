import React, { useState } from 'react';
import { X, User, Mail, Lock, Gamepad2, Globe, Chrome, Check } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { getUserByEmail, saveUserProfile } from '../lib/db';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('jogador');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Loading states to simulate API latency
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const simulateLoading = (provider: string, action: () => void) => {
    setIsLoading(provider);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(null);
      action();
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !username)) {
      setErrorMsg('Por favor, preenche todos os campos obrigatórios.');
      return;
    }

    if (isRegistering) {
      // Manual Register
      simulateLoading('manual', async () => {
        try {
          const existing = await getUserByEmail(email);
          if (existing) {
            setErrorMsg('Este email já se encontra registado.');
            return;
          }
          
          const newUser: UserProfile = {
            id: 'manual_' + Math.random().toString(36).substr(2, 9),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            role: selectedRole,
            provider: 'manual',
            approvedSubmissionsCount: 0
          };
          
          await saveUserProfile(newUser);
          onLogin(newUser);
        } catch (err) {
          setErrorMsg('Erro ao registar utilizador.');
        }
      });
    } else {
      // Manual Login
      simulateLoading('manual', async () => {
        try {
          // Check static pre-configured test users first
          if (email.toLowerCase() === 'admin@valorant.com' && password === 'admin123') {
            const adminUser: UserProfile = {
              id: 'admin_static',
              username: 'ValorantAdmin',
              email: 'admin@valorant.com',
              role: 'admin',
              provider: 'manual',
              approvedSubmissionsCount: 5
            };
            await saveUserProfile(adminUser);
            onLogin(adminUser);
            return;
          }

          if (email.toLowerCase() === 'pro@valorant.com' && password === 'pro123') {
            const proUser: UserProfile = {
              id: 'pro_static',
              username: 'ViperPro',
              email: 'pro@valorant.com',
              role: 'pro-player',
              provider: 'manual',
              approvedSubmissionsCount: 12
            };
            await saveUserProfile(proUser);
            onLogin(proUser);
            return;
          }

          if (email.toLowerCase() === 'jogador@valorant.com' && password === 'jogador123') {
            const normalUser: UserProfile = {
              id: 'jogador_static',
              username: 'NoobRadiant',
              email: 'jogador@valorant.com',
              role: 'jogador',
              provider: 'manual',
              approvedSubmissionsCount: 0
            };
            await saveUserProfile(normalUser);
            onLogin(normalUser);
            return;
          }

          // Fetch from IndexedDB database if not pre-configured
          const user = await getUserByEmail(email);
          if (!user) {
            setErrorMsg('Utilizador não encontrado. Experimenta os utilizadores de teste (ex. admin@valorant.com / admin123).');
            return;
          }
          onLogin(user);
        } catch (err) {
          setErrorMsg('Erro ao efetuar login.');
        }
      });
    }
  };

  const handleRiotLogin = () => {
    simulateLoading('riot', async () => {
      const riotUser: UserProfile = {
        id: 'riot_' + Math.random().toString(36).substr(2, 9),
        username: 'RiotPlayer#' + Math.floor(1000 + Math.random() * 9000),
        email: 'riot_user@riotgames.com',
        role: 'jogador',
        provider: 'riot',
        approvedSubmissionsCount: 0
      };
      await saveUserProfile(riotUser);
      onLogin(riotUser);
    });
  };

  const handleGoogleLogin = () => {
    simulateLoading('google', async () => {
      const googleUser: UserProfile = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        username: 'GoogleGamer',
        email: 'user@gmail.com',
        role: 'jogador',
        provider: 'google',
        approvedSubmissionsCount: 0
      };
      await saveUserProfile(googleUser);
      onLogin(googleUser);
    });
  };

  return (
    <div id="login-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div id="login-modal-body" className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden my-8 p-6 md:p-8">
        
        {/* Riot Design Tech Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-800" />
        
        {/* Header Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl tracking-tighter mb-4 shadow-md font-mono">
            V
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Iniciar Sessão</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Guarda e aprova lineups de pixels do Valorant</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl mb-6 font-mono leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Riot Sign In Button */}
          <button
            onClick={handleRiotLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-red-600/15"
          >
            {isLoading === 'riot' ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Gamepad2 className="w-4 h-4" />
            )}
            <span>Entrar com Conta Riot</span>
          </button>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading === 'google' ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Chrome className="w-4 h-4 text-red-400" />
            )}
            <span>Entrar com o Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Ou manual</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Manual Credentials form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome de Utilizador</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex. ViperKing"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none transition-all font-mono uppercase"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="Ex. jogador@valorant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none transition-all font-mono"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Palavra-passe</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none transition-all font-mono"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Escolher Cargo (Para Testes)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['jogador', 'pro-player', 'admin'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 px-1 text-[9px] font-bold uppercase rounded-lg border transition-all text-center cursor-pointer ${
                      selectedRole === role
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {role === 'pro-player' ? 'Pro-player' : role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading !== null}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border border-slate-700 mt-2"
          >
            {isLoading === 'manual' ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto block" />
            ) : (
              <span>{isRegistering ? 'Criar Conta e Entrar' : 'Iniciar Sessão'}</span>
            )}
          </button>
        </form>

        {/* Helper Test Accounts Info */}
        {!isRegistering && (
          <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-[10px] text-slate-500 font-mono leading-normal">
            <span className="font-bold text-slate-400 block mb-1">Contas de demonstração:</span>
            Admin: <span className="text-red-400/80">admin@valorant.com</span> / <span className="text-slate-400">admin123</span><br />
            Pro-Player: <span className="text-red-400/80">pro@valorant.com</span> / <span className="text-slate-400">pro123</span><br />
            Jogador: <span className="text-red-400/80">jogador@valorant.com</span> / <span className="text-slate-400">jogador123</span>
          </div>
        )}

        {/* Mode Toggle Button */}
        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-slate-400 hover:text-white underline font-mono cursor-pointer"
          >
            {isRegistering ? 'Já tens conta? Inicia Sessão' : 'Não tens conta? Regista-te no site'}
          </button>
        </div>

      </div>
    </div>
  );
}
