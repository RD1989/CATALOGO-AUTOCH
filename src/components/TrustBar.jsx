import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  PackageCheck, 
  FileText, 
  Headphones,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function TrustBar() {
  return (
    <footer className="bg-slate-950 text-white border-t-2 border-slate-800 mt-12 sm:mt-16">
      
      {/* 4 Pilares Comerciais da Distribuição */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-8 sm:py-10 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight">Caixa Master Lacrada</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">
                Embalagens originais de fábrica com 10 ou 20 unidades lacradas e testadas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight">Garantia Distribuidora</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">
                Suporte para troca de lote com defeito de fabricação e nota fiscal em todos os pedidos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight">Envio Rápido / Frete B2B</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">
                Despacho prioritário para transportadoras em São Paulo e envio nacional.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-white tracking-tight">Atendimento WhatsApp</h4>
              <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">
                Negociação direta com consultores comerciais para pedidos de alto volume.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Rodapé Institucional */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span>© 2026 ATACADO TECH — Portal B2B de Distribuição e Gestão de Eletrônicos no Atacado.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>CNPJ: Distribuição Atacadista Autorizada</span>
          <span>•</span>
          <span>São Paulo / SP</span>
        </div>
      </div>

    </footer>
  );
}
