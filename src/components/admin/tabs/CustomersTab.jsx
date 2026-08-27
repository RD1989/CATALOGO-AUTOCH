import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Building2, 
  MapPin, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function CustomersTab({
  customers,
  onOpenNewCustomerModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchCompany = (c.company || '').toLowerCase().includes(q);
        const matchCnpj = (c.cnpj || '').toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchCnpj) return false;
      }
      return true;
    });
  }, [customers, levelFilter, searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Clientes & Revendedores Autorizados
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
            Lojistas cadastrados com histórico de compras, volume faturado e nível comercial.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewCustomerModal}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer w-fit"
        >
          <UserPlus className="w-5 h-5" />
          <span>Cadastrar Revendedor</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por razão social, contato ou CNPJ..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-purple-600 font-bold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Nível:</span>
          <select
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm font-black rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todos os Níveis ({customers.length})</option>
            <option value="Ouro">Ouro (Volume Alto)</option>
            <option value="Prata">Prata (Padrão)</option>
            <option value="Bronze">Bronze (Inicial)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
              <tr>
                <th className="py-4 px-4">Empresa / Razão Social</th>
                <th className="py-4 px-4">Responsável & Contato</th>
                <th className="py-4 px-4">CNPJ & Localização</th>
                <th className="py-4 px-4">Nível Revenda</th>
                <th className="py-4 px-4 text-center">Lotes Comprados</th>
                <th className="py-4 px-4 text-right">Total Faturado</th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-100 font-semibold">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-bold text-sm">
                    Nenhum revendedor encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="py-4 px-4">
                      <span className="font-black text-slate-950 text-sm block">{c.company}</span>
                      <span className="text-xs text-emerald-700 font-bold">● {c.status}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-black text-slate-900 block">{c.name}</span>
                      <span className="text-xs text-slate-500 font-bold">{c.phone}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-slate-700 block">{c.cnpj}</span>
                      <span className="text-xs text-slate-500 font-bold">{c.city}/{c.state}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                        c.level === 'Ouro' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                        c.level === 'Prata' ? 'bg-slate-200 text-slate-900 border border-slate-300' :
                        'bg-orange-100 text-orange-950 border border-orange-300'
                      }`}>
                        Nível {c.level}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                      {c.total_orders || c.totalOrders || 0} pedidos
                    </td>

                    <td className="py-4 px-4 text-right font-black text-slate-950 text-base whitespace-nowrap">
                      R$ {(c.total_spent || c.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-bold">
            Total de <strong>{filteredCustomers.length}</strong> revendedores cadastrados
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
