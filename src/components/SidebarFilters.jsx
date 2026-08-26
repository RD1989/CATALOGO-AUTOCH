import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  X,
  PackageCheck
} from 'lucide-react';

export default function SidebarFilters({
  priceRange,
  setPriceRange,
  stockFilter,
  setStockFilter,
  networkFilter,
  setNetworkFilter,
  conditionFilter,
  setConditionFilter,
  colorFilter,
  setColorFilter,
  minBatchFilter,
  setMinBatchFilter,
  capacityFilter,
  setCapacityFilter,
  onResetFilters,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
  filteredCount
}) {
  const [openSections, setOpenSections] = useState({
    price: true,
    stock: true,
    network: true,
    condition: true,
    color: true,
    minBatch: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const colorsList = [
    { name: 'Rosa', hex: '#F472B6', count: 2 },
    { name: 'Azul', hex: '#3B82F6', count: 5 },
    { name: 'Verde', hex: '#84CC16', count: 1 },
    { name: 'Laranja', hex: '#F97316', count: 1 },
    { name: 'Cinza', hex: '#9CA3AF', count: 7 },
    { name: 'Branco', hex: '#FFFFFF', count: 2, border: true },
    { name: 'Ouro', hex: '#EAB308', count: 4 },
    { name: 'Vermelho', hex: '#EF4444', count: 3 },
    { name: 'Preto', hex: '#18181B', count: 2 },
  ];

  const content = (
    <div className="space-y-4">
      
      {/* 1. Faixa de Preço de Atacado */}
      <div className="pb-3.5 border-b-2 border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-sm sm:text-base font-black text-slate-950 mb-3 py-1"
        >
          <span>Preço de Atacado (UN)</span>
          {openSections.price ? <ChevronUp className="w-5 h-5 text-slate-700" /> : <ChevronDown className="w-5 h-5 text-slate-700" />}
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-600 font-extrabold block uppercase">Mínimo</span>
                <span className="text-base font-black text-slate-950">R$ {priceRange[0]},00</span>
              </div>
              <div className="bg-slate-100 border-2 border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-600 font-extrabold block uppercase">Máximo</span>
                <span className="text-base font-black text-slate-950">R$ {priceRange[1]},00</span>
              </div>
            </div>

            <div className="px-1">
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-blue-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-700 font-black mt-1.5">
                <span>R$ 0</span>
                <span>R$ 1.000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Embalagem Master / Lote Mínimo de Faturamento */}
      <div className="pb-3.5 border-b-2 border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('minBatch')}
          className="w-full flex items-center justify-between text-sm sm:text-base font-black text-slate-950 mb-3 py-1"
        >
          <span>Embalagem Master / Caixa</span>
          {openSections.minBatch ? <ChevronUp className="w-5 h-5 text-slate-700" /> : <ChevronDown className="w-5 h-5 text-slate-700" />}
        </button>

        {openSections.minBatch && (
          <div className="space-y-2">
            {[
              { id: 10, label: 'Caixa Fechada: 10 PCS', count: 8 },
              { id: 20, label: 'Caixa Fechada: 20 PCS', count: 2 },
            ].map(item => {
              const isChecked = minBatchFilter.includes(item.id);
              return (
                <label 
                  key={item.id} 
                  className={`flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer transition-colors border-2 ${
                    isChecked 
                      ? 'bg-blue-100 border-blue-500 text-blue-950 font-black' 
                      : 'border-transparent text-slate-800 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setMinBatchFilter([...minBatchFilter, item.id]);
                        else setMinBatchFilter(minBatchFilter.filter(x => x !== item.id));
                      }}
                      className="rounded border-slate-400 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-black">({item.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Conectividade / Tecnologia */}
      <div className="pb-3.5 border-b-2 border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('network')}
          className="w-full flex items-center justify-between text-sm sm:text-base font-black text-slate-950 mb-3 py-1"
        >
          <span>Conectividade / Rede</span>
          {openSections.network ? <ChevronUp className="w-5 h-5 text-slate-700" /> : <ChevronDown className="w-5 h-5 text-slate-700" />}
        </button>

        {openSections.network && (
          <div className="space-y-2">
            {[
              { id: 'Wi-Fi', label: 'Wi-Fi Dual Band', count: 1 },
              { id: '4G / LTE', label: '4G / LTE (Chip)', count: 2 },
              { id: '5G', label: '5G Standalone Ultra', count: 5 },
            ].map(item => {
              const isChecked = networkFilter.includes(item.id);
              return (
                <label 
                  key={item.id} 
                  className={`flex items-center justify-between text-sm py-2.5 px-3 rounded-xl cursor-pointer transition-colors border-2 ${
                    isChecked 
                      ? 'bg-blue-100 border-blue-500 text-blue-950 font-black' 
                      : 'border-transparent text-slate-800 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setNetworkFilter([...networkFilter, item.id]);
                        else setNetworkFilter(networkFilter.filter(x => x !== item.id));
                      }}
                      className="rounded border-slate-400 text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-black">({item.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Cores do Lote */}
      <div className="pb-3.5 border-b-2 border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between text-sm sm:text-base font-black text-slate-950 mb-3 py-1"
        >
          <span>Cores do Lote</span>
          {openSections.color ? <ChevronUp className="w-5 h-5 text-slate-700" /> : <ChevronDown className="w-5 h-5 text-slate-700" />}
        </button>

        {openSections.color && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {colorsList.map(c => {
              const isSelected = colorFilter.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    if (isSelected) setColorFilter(colorFilter.filter(x => x !== c.name));
                    else setColorFilter([...colorFilter, c.name]);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-black transition-all ${
                    isSelected 
                      ? 'border-slate-950 bg-slate-950 text-white' 
                      : 'border-slate-300 bg-white text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <span 
                    className={`w-4 h-4 rounded-full shrink-0 ${c.border ? 'border-2 border-slate-400' : ''}`}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão Resetar Filtros */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full flex items-center justify-center gap-2 border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-950 font-black text-sm py-3 rounded-xl transition-colors shadow-2xs"
        >
          <RotateCcw className="w-4 h-4 text-slate-700" />
          <span>Resetar Filtros do Catálogo</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Fixa Ampliada */}
      <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-24">
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-3 border-b-2 border-slate-200">
            <div className="flex items-center gap-2 text-slate-950 font-black text-sm uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-blue-700" />
              <span>Filtros Comerciais</span>
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-blue-700 hover:text-blue-950 font-black hover:underline"
            >
              Limpar Tudo
            </button>
          </div>
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Lateral */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col">
            
            <div className="p-4 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2 font-black text-base">
                <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                <span>Filtros do Catálogo B2B</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {content}
            </div>

            <div className="p-4 border-t-2 border-slate-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="w-full bg-slate-950 hover:bg-blue-700 text-white text-sm font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <span>Exibir Produtos ({filteredCount || 0})</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
