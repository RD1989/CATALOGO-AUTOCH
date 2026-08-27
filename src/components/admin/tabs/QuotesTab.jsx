import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  MessageSquare, 
  Search, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function QuotesTab({
  quotesList,
  onUpdateQuoteStatus
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredQuotes = useMemo(() => {
    return quotesList.filter(q => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = (q.quoteCode || q.id || '').toLowerCase().includes(query);
        const matchName = (q.buyerName || q.buyer || '').toLowerCase().includes(query);
        const matchCompany = (q.company || '').toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchCompany) return false;
      }
      return true;
    });
  }, [quotesList, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Gestão de Cotações & Pedidos Atacadistas
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
            Atenda os revendedores diretamente no WhatsApp e dê baixa automática no estoque físico ao faturar.
          </p>
        </div>

        <a
          href={api.getCsvExportUrl('quotes')}
          download="pedidos_atacadotech.csv"
          className="bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl border-2 border-slate-300 flex items-center gap-2 transition-colors shadow-xs w-fit"
          title="Exportar pedidos em CSV para contabilidade"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exportar Relatório CSV</span>
        </a>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, cliente ou loja..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-600 font-bold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm font-black rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todos os Status ({quotesList.length})</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Faturado">Faturado</option>
            <option value="Despachado">Despachado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Cotações */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
              <tr>
                <th className="py-4 px-4">Código / Data</th>
                <th className="py-4 px-4">Comprador & Empresa</th>
                <th className="py-4 px-4">Volume Solicitado</th>
                <th className="py-4 px-4 text-right">Valor Total</th>
                <th className="py-4 px-4 text-center">Status do Pedido</th>
                <th className="py-4 px-4 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-100 font-semibold">
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-bold text-sm">
                    Nenhuma cotação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((q) => {
                  const whatsappPhone = (q.phone || '').replace(/\D/g, '');
                  const whatsappMsg = encodeURIComponent(
                    `Olá ${q.buyerName || q.buyer || 'Cliente'}, tudo bem? Sobre seu pedido ${q.quoteCode || q.id} na Atacado Tech...`
                  );

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-950 text-sm block">
                          {q.quoteCode || q.id}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('pt-BR') : q.date || 'Recente'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-slate-950 text-sm block">
                          {q.buyerName || q.buyer}
                        </span>
                        <span className="text-xs text-slate-600 font-bold block">
                          {q.company} {q.cnpj ? `• ${q.cnpj}` : ''}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">
                          {q.city}/{q.state}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 block">
                          {q.totalBoxes || q.boxes} cx ({q.totalUnits || q.units} un)
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                          {Array.isArray(q.items) 
                            ? q.items.map(i => `${i.quantity || i.units}x ${i.name || i.sku}`).join(', ')
                            : typeof q.items === 'string' ? q.items : `${q.totalUnits || 10} peças`}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-black text-slate-950 text-base whitespace-nowrap">
                        R$ {(q.totalValue || q.val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <select
                          value={q.status}
                          onChange={(e) => onUpdateQuoteStatus(q.id, e.target.value)}
                          className={`border-2 text-xs font-black rounded-xl px-3 py-1.5 outline-none cursor-pointer ${
                            q.status === 'Faturado' ? 'bg-emerald-50 border-emerald-400 text-emerald-950' :
                            q.status === 'Aprovado' ? 'bg-blue-50 border-blue-400 text-blue-950' :
                            'bg-amber-50 border-amber-400 text-amber-950'
                          }`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Atendimento">Em Atendimento</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Faturado">Faturado (Baixa Estoque)</option>
                          <option value="Despachado">Despachado</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <a
                          href={`https://wa.me/${whatsappPhone}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                          title="Abrir conversa no WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-bold">
            Total de <strong>{filteredQuotes.length}</strong> cotações registradas
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-white border-2 border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-slate-950 px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl bg-white border-2 border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
