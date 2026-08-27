import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Percent, 
  Edit3, 
  Trash2, 
  Download, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { api } from '../../../services/api';

export default function ProductsTab({
  products,
  userRole,
  onOpenProductModal,
  onRequestDeleteProduct,
  onOpenPriceAdjustmentModal,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Seleção Múltipla / Ações em Lote
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Filtragem
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }
      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  // Paginação dos dados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Toggle Seleção Individual
  const handleToggleSelect = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle Selecionar Todos da Página
  const handleSelectAllPage = () => {
    const pageIds = paginatedProducts.map(p => p.id);
    const allSelected = pageIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Ferramenta de Reajuste Geral no Topo (Exclusivo Dono) */}
      {userRole === 'dono' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-amber-950 uppercase">
                Reajuste Geral de Preços no Banco de Dados
              </h4>
              <p className="text-xs text-amber-900 font-bold">
                Aplique uma porcentagem de aumento ou desconto em massa diretamente no banco de dados.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPriceAdjustmentModal}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black px-6 py-3 rounded-2xl transition-colors shadow-sm cursor-pointer"
          >
            Configurar Reajuste (%)
          </button>
        </div>
      )}

      {/* Barra de Filtros, Busca e Botões de Ação */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm">
        
        {/* Controles de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-600 font-bold"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm font-black rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias ({products.length})</option>
            <option value="tablets-profissionais">Tablets Profissionais</option>
            <option value="tablets-infantis">Tablets Infantis</option>
            <option value="power-banks">Power Banks</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto bg-slate-50 border-2 border-slate-300 text-slate-900 text-xs sm:text-sm font-black rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="available">Em Estoque</option>
            <option value="low_stock">Estoque Baixo</option>
            <option value="unavailable">Indisponível</option>
          </select>
        </div>

        {/* Botões: Exportar CSV e Cadastrar */}
        <div className="flex items-center gap-3">
          <a
            href={api.getCsvExportUrl('products')}
            download="produtos_atacadotech.csv"
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl border-2 border-slate-300 flex items-center gap-2 transition-colors"
            title="Exportar tabela de produtos em CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenProductModal(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>

      </div>

      {/* Barra de Ações em Lote (se houver itens selecionados) */}
      {selectedProductIds.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-150">
          <span className="text-xs font-black text-blue-950">
            ✓ {selectedProductIds.length} produto(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSelectedProductIds([]); showToast('Seleção limpa.'); }}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              Desmarcar Todos
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
              <tr>
                <th className="py-4 px-4 w-12 text-center">
                  <button type="button" onClick={handleSelectAllPage} className="p-1">
                    {paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id)) ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">Foto / SKU</th>
                <th className="py-4 px-4">Nome do Produto</th>
                <th className="py-4 px-4">Categoria</th>
                <th className="py-4 px-4">Caixa Master</th>
                <th className="py-4 px-4">Estoque</th>
                <th className="py-4 px-4 text-right">Preço Atacado (UN)</th>
                <th className="py-4 px-4 text-right">Total Caixa</th>
                <th className="py-4 px-4 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-100 font-semibold">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500 font-bold text-sm">
                    Nenhum produto encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const boxTotal = p.price * p.minBatchQty;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      
                      <td className="py-3.5 px-4 text-center">
                        <button type="button" onClick={() => handleToggleSelect(p.id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
                            {p.sku}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-950 text-sm uppercase block">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-bold">
                            {p.network} • {p.specs?.tela || p.specs?.capacidade || ''}
                          </span>
                          {p.colors && p.colors.length > 0 && (
                            <div className="flex items-center gap-1">
                              {p.colors.map((c, i) => (
                                <span key={i} className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} title={c.name} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-900 border border-slate-300 font-bold px-2.5 py-1 rounded-md text-xs">
                          {p.categoryName || p.category_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-xs">
                          {p.minBatchQty} un. / cx
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-950 text-xs block">
                          {p.stockQty || 300} peças
                        </span>
                        <span className={`text-[10px] font-bold ${
                          p.status === 'low_stock' ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {p.statusLabel || p.status_label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-black text-slate-950 text-base">
                          R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-slate-900 text-sm">
                        R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenProductModal(p)}
                            className="p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-slate-700 transition-colors border border-slate-300"
                            title="Editar Produto e Foto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestDeleteProduct(p.id, p.name)}
                            className="p-2.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-xl text-slate-700 transition-colors border border-slate-300"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <span>Exibindo</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border-2 border-slate-300 rounded-lg px-2 py-1 font-black text-slate-900 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>de <strong>{filteredProducts.length}</strong> produtos</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-white border-2 border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
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
              className="p-2 rounded-xl bg-white border-2 border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
