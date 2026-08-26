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
  Sparkles
} from 'lucide-react';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onAddToBatch 
}) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Padrão');
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToBatch(product, selectedColor);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1000);
  };

  const lotSubtotal = product.price * product.minBatchQty;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Modal Quadrado & Proporcional no Desktop (Square/Golden Proportion) */}
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl w-full max-w-xl md:max-w-3xl overflow-hidden shadow-2xl my-auto relative animate-in zoom-in-95 duration-150 flex flex-col md:flex-row md:h-[480px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-slate-900/10 hover:bg-slate-950 text-slate-700 hover:text-white transition-colors shadow-xs"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LADO ESQUERDO: Imagem Quadrada em Destaque + Seletor de Cores */}
        <div className="md:w-1/2 bg-slate-50 border-b-2 md:border-b-0 md:border-r-2 border-slate-200 p-5 flex flex-col justify-between items-center text-center">
          
          <div className="w-full flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
              {product.sku}
            </span>
            <span className="text-xs font-black text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200">
              {product.network}
            </span>
          </div>

          {/* Enquadramento Quadrado da Foto no Desktop */}
          <div className="w-full h-48 md:h-56 bg-white rounded-2xl p-3 flex items-center justify-center border-2 border-slate-200 shadow-xs my-auto overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Seletor de Cores Compacto */}
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

        {/* LADO DIREITO: Ficha Comercial sem Rolagem no Desktop */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between bg-white">
          
          <div className="space-y-2.5">
            
            <div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">
                {product.categoryName || 'Catálogo Atacado'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight uppercase line-clamp-2">
                {product.name}
              </h2>
            </div>

            {/* Quadro de Preço e Caixa Master */}
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
                  Caixa ({product.minBatchQty} un):
                </span>
                <span className="text-sm font-black text-slate-950">
                  R$ {lotSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Especificações em Grade 2x2 Compacta */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
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
              {product.specs?.capacidade && (
                <div className="flex items-center gap-1.5 truncate">
                  <Battery className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.capacidade}</span>
                </div>
              )}
              {product.specs?.potencia && (
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate text-slate-900 font-black text-[11px]">{product.specs.potencia}</span>
                </div>
              )}
            </div>

            {/* Status da Embalagem Master */}
            <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-100 rounded-lg">
              <span className="text-slate-600 font-bold flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-slate-950" />
                Embalagem Master:
              </span>
              <strong className="text-slate-950 font-black">{product.minBatchQty} un. / cx</strong>
            </div>

          </div>

          {/* Botão Comercial Direto */}
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              justAdded 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-950 hover:bg-blue-700 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>1 Caixa Incluída!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>+ Adicionar 1 Caixa ({product.minBatchQty} un)</span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
