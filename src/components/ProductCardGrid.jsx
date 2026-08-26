import React, { useState } from 'react';
import { Plus, Check, Eye, PackageCheck } from 'lucide-react';

export default function ProductCardGrid({ 
  product, 
  onAddToBatch, 
  onQuickView
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToBatch(product, selectedColor);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const lotSubtotal = product.price * product.minBatchQty;

  return (
    <div 
      className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-950 hover:shadow-xl transition-all group"
    >
      <div>
        {/* Cabeçalho da Ficha Comercial: SKU + Conectividade */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-slate-100 text-xs sm:text-sm">
          <span className="font-mono text-slate-950 font-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
            {product.sku}
          </span>
          <span className="font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-200">
            {product.network}
          </span>
        </div>

        {/* Foto Técnica do Produto em Alta Resolução */}
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

        {/* Badges Técnicas de Destaque */}
        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.badges.map((b, i) => (
              <span key={i} className="text-xs font-black bg-slate-950 text-white px-2.5 py-0.5 rounded-md">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Nome Técnico do Modelo */}
        <h3 
          onClick={() => onQuickView(product)}
          className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-snug uppercase mb-3 cursor-pointer hover:text-blue-700 transition-colors line-clamp-2"
        >
          {product.name}
        </h3>

        {/* Seletor de Cores do Lote */}
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

        {/* Quadro Comercial de Alta Densidade e Contraste */}
        <div className="space-y-2 py-3.5 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200/80 mb-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-bold flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-slate-950" />
              Pedido Mínimo (Caixa):
            </span>
            <strong className="text-slate-950 font-black text-sm bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-lg">
              {product.minBatchQty} unidades
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-bold">Disponibilidade:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-100 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {product.statusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200 text-xs sm:text-sm">
            <span className="text-slate-600 font-bold">Total faturado por caixa:</span>
            <span className="font-black text-slate-950 text-sm sm:text-base">
              R$ {lotSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Preço Unitário de Atacado em Grande Destaque no Desktop */}
        <div className="mb-4 bg-blue-50 p-3.5 rounded-2xl border-2 border-blue-200">
          <span className="text-xs text-blue-900 font-black uppercase tracking-wider block">
            Preço Unitário de Atacado
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-600">/ unidade</span>
          </div>
        </div>
      </div>

      {/* Botão Comercial Ampliado: Adicionar ao Lote */}
      <button
        type="button"
        onClick={handleAdd}
        className={`w-full font-black text-sm sm:text-base py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
          justAdded 
            ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-600' 
            : 'bg-slate-950 hover:bg-blue-700 text-white shadow-slate-950/20'
        }`}
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            <span>1 Caixa Adicionada ao Lote!</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>+ Adicionar 1 Caixa ({product.minBatchQty} un)</span>
          </>
        )}
      </button>

    </div>
  );
}
