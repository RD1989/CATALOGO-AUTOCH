import React, { useState } from 'react';
import { Plus, Check, Eye, PackageCheck, Boxes } from 'lucide-react';

export default function ProductCardGrid({ 
  product, 
  onAddToBatch, 
  onQuickView
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Padrão');
  const [justAddedUnit, setJustAddedUnit] = useState(false);
  const [justAddedBox, setJustAddedBox] = useState(false);

  const handleAddUnit = (e) => {
    e.stopPropagation();
    onAddToBatch(product, selectedColor, 1);
    setJustAddedUnit(true);
    setTimeout(() => setJustAddedUnit(false), 1000);
  };

  const handleAddBox = (e) => {
    e.stopPropagation();
    onAddToBatch(product, selectedColor, product.minBatchQty || 10);
    setJustAddedBox(true);
    setTimeout(() => setJustAddedBox(false), 1000);
  };

  const boxTotal = product.price * (product.minBatchQty || 10);

  return (
    <div 
      className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-950 hover:shadow-xl transition-all group"
    >
      <div>
        {/* Cabeçalho da Ficha Comercial */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-slate-100 text-xs sm:text-sm">
          <span className="font-mono text-slate-950 font-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
            {product.sku}
          </span>
          <span className="font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-200">
            {product.network}
          </span>
        </div>

        {/* Foto Técnica */}
        <div 
          onClick={() => onQuickView(product)}
          className="w-full h-48 sm:h-56 flex items-center justify-center mb-4 cursor-pointer overflow-hidden rounded-2xl bg-slate-50/80 p-4 relative group-hover:bg-slate-100/60 transition-colors border border-slate-200"
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          <button
            type="button"
            className="absolute bottom-3 right-3 bg-slate-950 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Ficha Técnica</span>
          </button>
        </div>

        {/* Badges Técnicas */}
        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.badges.map((b, i) => (
              <span key={i} className="text-xs font-black bg-slate-950 text-white px-2.5 py-0.5 rounded-md">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Nome do Produto */}
        <h3 
          onClick={() => onQuickView(product)}
          className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-snug uppercase mb-3 cursor-pointer hover:text-blue-700 transition-colors line-clamp-2"
        >
          {product.name}
        </h3>

        {/* Seletor de Cores */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2.5 mb-4 bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-700 font-black">Cores:</span>
            <div className="flex items-center gap-2">
              {product.colors.map(c => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all ${
                      isSelected ? 'ring-2 ring-slate-950 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                    } ${c.hex === '#FFFFFF' ? 'border-2 border-slate-400' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    title={`Selecionar cor: ${c.name}`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-black text-slate-950 ml-auto">{selectedColor}</span>
          </div>
        )}

        {/* Informações Comerciais */}
        <div className="space-y-2 py-3 px-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200/80 mb-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-bold">Caixa Fechada:</span>
            <span className="font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md text-xs">
              {product.minBatchQty || 10} un. (R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-bold">Disponibilidade:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-100 font-black text-xs px-2 py-0.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {product.statusLabel}
            </span>
          </div>
        </div>

        {/* Preço Unitário de Atacado em Destaque */}
        <div className="mb-4 bg-blue-50 p-3.5 rounded-2xl border-2 border-blue-200">
          <span className="text-xs text-blue-900 font-black uppercase tracking-wider block">
            Preço Unitário de Atacado
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-600">/ peça</span>
          </div>
        </div>
      </div>

      {/* DOIS BOTÕES DE ADIÇÃO: POR PEÇA OU POR CAIXA FECHADA */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleAddUnit}
          className={`w-full font-black text-xs sm:text-sm py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            justAddedUnit 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-950 hover:bg-blue-700 text-white'
          }`}
        >
          {justAddedUnit ? (
            <>
              <Check className="w-4 h-4" />
              <span>+1 Peça Adicionada!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ Adicionar 1 Peça</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleAddBox}
          className={`w-full font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all border-2 ${
            justAddedBox 
              ? 'bg-amber-500 text-slate-950 border-amber-500' 
              : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
          }`}
        >
          {justAddedBox ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>1 Caixa ({product.minBatchQty || 10} un) Adicionada!</span>
            </>
          ) : (
            <>
              <Boxes className="w-3.5 h-3.5 text-amber-700" />
              <span>+ Adicionar 1 Caixa Fechada ({product.minBatchQty || 10} un)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
