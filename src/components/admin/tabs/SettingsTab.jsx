import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Building2, Phone, Calendar } from 'lucide-react';

export default function SettingsTab({ showToast }) {
  const [companyName, setCompanyName] = useState('ATACADO TECH DISTRIBUIDORA DE ELETRÔNICOS LTDA');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('5511986807777');
  const [currentTableDate, setCurrentTableDate] = useState('Agosto / 2026');
  const [minOrderPolicy, setMinOrderPolicy] = useState('Pedido Mínimo Geral de 10 peças (monte seu lote misturado ou em caixas fechadas)');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('✓ Configurações da distribuidora salvas com sucesso!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Configurações Gerais da Distribuidora
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
          Parâmetros institucionais, vigência de preços e número oficial de WhatsApp para recebimento de pedidos.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm max-w-3xl">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          
          <div>
            <label className="text-xs font-black text-slate-900 uppercase block mb-1">
              Razão Social / Nome Institucional
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-900 uppercase block mb-1">
                WhatsApp Oficial de Vendas
              </label>
              <input
                type="text"
                value={companyWhatsapp}
                onChange={(e) => setCompanyWhatsapp(e.target.value)}
                placeholder="5511999999999"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                Tabela de Preços Vigente
              </label>
              <input
                type="text"
                value={currentTableDate}
                onChange={(e) => setCurrentTableDate(e.target.value)}
                placeholder="Agosto / 2026"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
              />
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
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-slate-950 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros B2B</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
