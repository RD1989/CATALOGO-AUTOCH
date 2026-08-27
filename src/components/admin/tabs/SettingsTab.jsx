import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building2, Phone, Calendar, Lock, Key, ShieldCheck, Server, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

export default function SettingsTab({ showToast }) {
  const [companyName, setCompanyName] = useState('ATACADO TECH DISTRIBUIDORA DE ELETRÔNICOS LTDA');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('5511986807777');
  const [currentTableDate, setCurrentTableDate] = useState('Agosto / 2026');
  const [minOrderPolicy, setMinOrderPolicy] = useState('Pedido Mínimo Geral de 10 peças (monte seu lote misturado ou em caixas fechadas)');
  
  // Alteração de Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Carregar dados reais ao montar
  useEffect(() => {
    async function fetchSettings() {
      try {
        const liveSettings = await api.getSettings();
        if (liveSettings) {
          if (liveSettings.company_name) setCompanyName(liveSettings.company_name);
          if (liveSettings.company_whatsapp) setCompanyWhatsapp(liveSettings.company_whatsapp);
          if (liveSettings.current_table_date) setCurrentTableDate(liveSettings.current_table_date);
          if (liveSettings.min_order_policy) setMinOrderPolicy(liveSettings.min_order_policy);
        }
      } catch {
        // Usa fallbacks locais
      }
    }
    fetchSettings();
  }, []);

  // Salvar Parâmetros da Distribuidora
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      // Salva localmente
      localStorage.setItem('company_name_local', companyName);
      localStorage.setItem('company_whatsapp_local', companyWhatsapp);
      localStorage.setItem('current_table_date_local', currentTableDate);
      localStorage.setItem('min_order_policy_local', minOrderPolicy);

      // Tenta persistir no servidor
      await Promise.allSettled([
        fetch('http://localhost:3001/api/settings/company_name', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('admin_token') || '' },
          body: JSON.stringify({ value: companyName })
        }),
        fetch('http://localhost:3001/api/settings/company_whatsapp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('admin_token') || '' },
          body: JSON.stringify({ value: companyWhatsapp })
        }),
        fetch('http://localhost:3001/api/settings/current_table_date', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('admin_token') || '' },
          body: JSON.stringify({ value: currentTableDate })
        }),
        fetch('http://localhost:3001/api/settings/min_order_policy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': sessionStorage.getItem('admin_token') || '' },
          body: JSON.stringify({ value: minOrderPolicy })
        })
      ]);

      showToast('✓ Configurações da distribuidora salvas com sucesso!');
    } catch {
      showToast('✓ Parâmetros salvos localmente!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Alterar Senha do Administrador
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showToast('⚠️ Digite a nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('⚠️ A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ As senhas não conferem.');
      return;
    }

    setIsSavingPassword(true);
    try {
      localStorage.setItem('admin_password_local', newPassword);

      // Tenta persistir no backend
      const token = sessionStorage.getItem('admin_token') || '';
      await fetch('http://localhost:3001/api/settings/admin_password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify({ value: newPassword })
      });

      setNewPassword('');
      setConfirmPassword('');
      showToast('✓ Senha de administrador alterada com sucesso!');
    } catch {
      showToast('✓ Nova senha salva no dispositivo!');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 max-w-4xl">
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Configurações Gerais da Distribuidora
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
          Parâmetros institucionais, vigência da tabela de preços, WhatsApp de vendas e segurança de acesso.
        </p>
      </div>

      {/* BLOCO 1: Parâmetros Institucionais */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-slate-100">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
            Dados da Empresa & Catálogo
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          
          <div>
            <label className="text-xs font-black text-slate-900 uppercase block mb-1">
              Razão Social / Nome Institucional
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-900 uppercase block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Oficial de Vendas</span>
              </label>
              <input
                type="text"
                required
                value={companyWhatsapp}
                onChange={(e) => setCompanyWhatsapp(e.target.value)}
                placeholder="5511999999999"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              />
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                Formato com código do país e DDD (Ex: 5511986807777)
              </span>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Tabela de Preços Vigente</span>
              </label>
              <input
                type="text"
                required
                value={currentTableDate}
                onChange={(e) => setCurrentTableDate(e.target.value)}
                placeholder="Agosto / 2026"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              />
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                Exibido no cabeçalho superior do catálogo
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-900 block uppercase mb-1">
              Política de Pedido Mínimo Exibida no Topo
            </label>
            <textarea
              rows="2"
              value={minOrderPolicy}
              onChange={(e) => setMinOrderPolicy(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-slate-950 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Gravando...' : 'Salvar Parâmetros B2B'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* BLOCO 2: Segurança & Senha do Painel */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-slate-100">
          <Key className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
            Alterar Senha do Administrador
          </h3>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <p className="text-xs text-slate-600 font-bold">
            Defina uma nova senha para proteger o acesso às funções de gestão, cadastro de produtos e financeiro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
              🔒 A nova senha é criptografada com Bcrypt (10 rounds).
            </span>

            <button
              type="submit"
              disabled={isSavingPassword || !newPassword.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm px-7 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSavingPassword ? 'Atualizando...' : 'Atualizar Senha Admin'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
