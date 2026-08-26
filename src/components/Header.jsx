import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  UserCheck, 
  Boxes, 
  ChevronDown, 
  X, 
  SlidersHorizontal,
  PackageCheck,
  ShieldCheck
} from 'lucide-react';

export default function Header({ 
  batchCount, 
  batchUnits,
  batchTotal,
  onOpenBatch, 
  searchQuery, 
  setSearchQuery,
  selectedCategory,
  onSelectCategory,
  onOpenMobileFilters,
  activeFilterCount,
  searchInputRef
}) {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-300 shadow-sm">
      
      {/* 1. BARRA SUPERIOR INSTITUCIONAL (Slim & B2B) */}
      <div className="bg-slate-950 text-white py-1.5 px-3 sm:px-8 border-b border-slate-800">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 text-[11px] sm:text-xs font-bold">
          
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1.5 text-white font-black tracking-wide shrink-0">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span>PORTAL OFICIAL DE DISTRIBUIÇÃO ATACADISTA B2B</span>
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-emerald-400 font-extrabold hidden md:inline truncate">
              ✓ Pedido Mínimo Geral: 10 peças (monte seu lote misturado ou em caixas fechadas)
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-300">
            <span className="text-amber-300 font-black">
              Tabela Vigente: Agosto/2026
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-emerald-400 font-bold hidden sm:inline">
              Estoque Físico Pronta-Entrega
            </span>
          </div>

        </div>
      </div>

      {/* 2. NAVEGAÇÃO PRINCIPAL */}
      <div className="max-w-[1720px] mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
        
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none shrink-0" 
            onClick={() => onSelectCategory('all')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-950 leading-none">
                ATACADO TECH
              </span>
              <span className="text-[10px] sm:text-xs font-black text-blue-700 tracking-wider uppercase leading-none mt-1">
                Catálogo da Fábrica
              </span>
            </div>
          </div>

          {/* Menu Dropdown de Seções (Desktop) */}
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-950 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-colors border-2 border-slate-300"
            >
              <span>Seções do Catálogo</span>
              <ChevronDown className={`w-4 h-4 text-slate-700 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryMenuOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                {[
                  { id: 'all', label: 'Catálogo Geral (Todos)', count: '10 modelos' },
                  { id: 'tablets-profissionais', label: 'Tablets Profissionais', count: '6 modelos' },
                  { id: 'tablets-infantis', label: 'Tablets Infantis', count: '2 modelos' },
                  { id: 'power-banks', label: 'Power Banks & Acessórios', count: '2 modelos' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.id); setIsCategoryMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-black flex items-center justify-between transition-colors ${
                      selectedCategory === cat.id 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-xs font-bold ${selectedCategory === cat.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ações Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-300 text-xs font-black relative"
              title="Filtrar"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenBatch}
              className="flex items-center gap-2 bg-slate-950 text-white px-3 py-2 rounded-xl text-xs font-black shadow-sm"
              title="Meu Lote"
            >
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>{batchUnits || 0} un</span>
            </button>

          </div>

        </div>

        {/* Barra de Pesquisa */}
        <div className="flex-1 max-w-xl lg:max-w-2xl w-full">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar SKU, modelo, tecnologia (5G, 512GB)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-950 text-xs sm:text-sm rounded-xl pl-10 sm:pl-12 pr-9 sm:pr-10 py-2.5 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all placeholder:text-slate-500 font-bold"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ações Desktop */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2 text-slate-950 hover:text-blue-700 text-xs sm:text-sm font-black px-3.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors border-2 border-slate-300"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Revendedor: Prata</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isAccountMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl py-2 z-50"
                onMouseLeave={() => setIsAccountMenuOpen(false)}
              >
                <div className="px-4 py-3 border-b-2 border-slate-100">
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Perfil Comercial</p>
                  <p className="text-base font-black text-slate-950">Lojista Autorizado B2B</p>
                  <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full font-black inline-block mt-1">
                    ✓ Preço de Atacado Desbloqueado
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => { onOpenBatch(); setIsAccountMenuOpen(false); }}
                  className="w-full px-4 py-3 text-left text-xs sm:text-sm font-black text-slate-900 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Conferir Meu Lote ({batchUnits || 0} peças)</span>
                  <Boxes className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            )}
          </div>

          {/* MEU LOTE (Desktop) */}
          <button
            type="button"
            onClick={onOpenBatch}
            className="flex items-center gap-3 bg-slate-950 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
            title="Conferir Lote de Compras"
          >
            <Boxes className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] text-slate-300 font-extrabold uppercase">Meu Lote</span>
              <span className="text-xs sm:text-sm font-black text-white">{batchUnits || 0} {batchUnits === 1 ? 'peça' : 'peças'}</span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
