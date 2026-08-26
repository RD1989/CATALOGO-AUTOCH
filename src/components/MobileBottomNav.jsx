import React from 'react';
import { 
  Layers, 
  Search, 
  SlidersHorizontal, 
  Boxes, 
  ArrowUp, 
  Sparkles 
} from 'lucide-react';

export default function MobileBottomNav({
  onOpenBatch,
  batchCount,
  batchTotal,
  onOpenFilters,
  activeFilterCount,
  onFocusSearch,
  onResetCategory,
  currentCategory
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-300 py-2 px-3 flex items-center justify-around lg:hidden shadow-lg">
      
      {/* Botão 1: Catálogo */}
      <button
        type="button"
        onClick={onResetCategory}
        className={`flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-black transition-colors ${
          currentCategory === 'all' ? 'text-blue-600' : 'text-slate-700 hover:text-slate-950'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px]">Catálogo</span>
      </button>

      {/* Botão 2: Buscar */}
      <button
        type="button"
        onClick={onFocusSearch}
        className="flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-black text-slate-700 hover:text-slate-950 transition-colors"
      >
        <Search className="w-5 h-5 text-slate-700" />
        <span className="text-[10px]">Buscar</span>
      </button>

      {/* Botão 3: Filtros com Badge */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex flex-col items-center gap-1 p-1 rounded-xl text-xs font-black text-slate-700 hover:text-slate-950 transition-colors relative"
      >
        <div className="relative">
          <SlidersHorizontal className="w-5 h-5 text-slate-700" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Filtros</span>
      </button>

      {/* Botão 4: Meu Lote */}
      <button
        type="button"
        onClick={onOpenBatch}
        className="flex items-center gap-2 bg-slate-950 text-white px-3.5 py-2 rounded-2xl shadow-md active:scale-95 transition-all text-xs font-black"
      >
        <div className="relative">
          <Boxes className="w-5 h-5 text-blue-400" />
          {batchCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {batchCount}
            </span>
          )}
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[9px] text-slate-300 font-extrabold uppercase">Lote</span>
          <span className="text-[11px] font-black text-white">
            {batchTotal > 0 ? `R$ ${(batchTotal / 1000).toFixed(1)}k` : '0 un.'}
          </span>
        </div>
      </button>

    </div>
  );
}
