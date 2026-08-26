import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  Boxes, 
  Cpu, 
  HardDrive, 
  Battery, 
  Smartphone, 
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Minus
} from 'lucide-react';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToBatch 
}) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Padrão');
  const [unitCount, setUnitCount] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddCustomUnits = () => {
    onAddToBatch(product, selectedColor, unitCount);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const handleAddBox = () => {
    onAddToBatch(product, selectedColor, product.minBatchQty || 10);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const boxTotal = product.price * (product.minBatchQty || 10);
  const currentSubtotal = product.price * unitCount;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-xl md:max-w-3xl overflow-hidden shadow-2xl my-auto relative animate-in zoom-in-95 duration-150 flex flex-col md:flex-row md:h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-slate-900/10 hover:bg-slate-950 text-slate-700 hover:text-white transition-colors shadow-xs"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LADO ESQUERDO: Imagem e Cores */}
        <div className="md:w-1/2 bg-slate-50 border-b-2 md:border-b-0 md:border-r-2 border-slate-200 p-5 flex flex-col justify-between items-center text-center">
          
          <div className="w-full flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
              {product.sku}
            </span>
            <span className="text-xs font-black text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200">
              {product.network}
            </span>
          </div>

          <div className="w-full h-48 md:h-56 bg-white rounded-2xl p-3 flex items-center justify-center border-2 border-slate-200 shadow-xs my-auto overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="w-full bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Cor: <strong className="text-slate-950 font-black">{selectedColor}</strong></span>
              <div className="flex items-center gap-1.5">
                {product.colors.map(c => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-slate-950 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                      } ${c.hex === '#FFFFFF' ? 'border-2 border-slate-400' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 ${c.hex === '#FFFFFF' ? 'text-slate-950' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* LADO DIREITO: Ficha Comercial + Controles de Peças/Caixas */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between bg-white space-y-3">
          
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">
                {product.categoryName || 'Catálogo Atacado'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight uppercase line-clamp-2">
                {product.name}
              </h2>
            </div>

            {/* Preço Unitário */}
            <div className="p-3 bg-blue-50/90 rounded-2xl border-2 border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-900 font-black uppercase tracking-wider block">
                  Preço Unit. Atacado
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-950">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-600 font-bold block">
                  Caixa Master ({product.minBatchQty || 10} un):
                </span>
                <span className="text-xs font-black text-slate-950">
                  R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Especificações Compactas */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
              {product.specs?.tela && (
                <div className="flex items-center gap-1.5 truncate">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.tela}</span>
                </div>
              )}
              {product.specs?.bateria && (
                <div className="flex items-center gap-1.5 truncate">
                  <Battery className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.bateria}</span>
                </div>
              )}
              {product.specs?.ram && (
                <div className="flex items-center gap-1.5 truncate">
                  <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.ram}</span>
                </div>
              )}
              {product.specs?.armazenamento && (
                <div className="flex items-center gap-1.5 truncate">
                  <HardDrive className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.armazenamento}</span>
                </div>
              )}
            </div>

            {/* Seletor de Quantidade de Peças */}
            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Quantidade de peças:</span>
              <div className="flex items-center bg-white border-2 border-slate-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                  className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-black"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={unitCount}
                  onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 text-center font-black text-xs text-slate-950 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setUnitCount(unitCount + 1)}
                  className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-black"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Botões de Adição */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAddCustomUnits}
              className={`w-full font-black text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                justAdded 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-950 hover:bg-blue-700 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adicionado ao Lote!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar {unitCount} {unitCount === 1 ? 'Peça' : 'Peças'} (R$ {currentSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAddBox}
              className="w-full font-black text-xs py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-700" />
              <span>Ou Adicionar 1 Caixa Fechada ({product.minBatchQty || 10} un)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
