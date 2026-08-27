import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await api.adminLogin(password);
      if (result && result.token) {
        sessionStorage.setItem('admin_token', result.token);
        setPassword('');
        onLoginSuccess(result.token);
      } else {
        setErrorMsg(result?.error || 'Senha incorreta. Tente novamente.');
      }
    } catch {
      setErrorMsg('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-t-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Painel Administrativo</h2>
              <p className="text-xs text-slate-400 font-bold">Acesso restrito à equipe interna</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 font-bold text-center">
            Digite a senha de administrador para acessar o painel de gestão B2B.
          </p>

          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-600 rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-900 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-700 animate-in fade-in duration-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {isLoading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Acessar Painel
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold">
            Senha padrão inicial: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">admin123</code>
            <br />Altere na aba Configurações após o primeiro acesso.
          </p>
        </form>
      </div>
    </div>
  );
}
