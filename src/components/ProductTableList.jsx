import React, { useState } from 'react';
import { Plus, Check, Eye, PackageCheck } from 'lucide-react';

export default function ProductTableList({ 
  products, 
  onAddToBatch, 
  onQuickView 
}) {
  const [selectedColors, setSelectedColors] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const handleColorChange = (productId, colorName) => {
    setSelectedColors(prev => ({ ...prev, [productId]: colorName }));
  };

  const handleAdd = (product) => {
    const color = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';
    onAddToBatch(product, color);

    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          
          <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
            <tr>
              <th className="py-4 px-4">Foto / SKU</th>
              <th className="py-4 px-4">Modelo & Especificações</th>
              <th className="py-4 px-4">Categoria</th>
              <th className="py-4 px-4">Cores Disponíveis</th>
              <th className="py-4 px-4">Embalagem Master</th>
              <th className="py-4 px-4">Status Estoque</th>
              <th className="py-4 px-4 text-right">Preço Atacado (UN)</th>
              <th className="py-4 px-4 text-right">Total Caixa Master</th>
              <th className="py-4 px-4 text-center">Ação</th>
            </tr>
          </thead>

          <tbody className="divide-y-2 divide-slate-100 font-semibold">
            {products.map((product) => {
              const currentColor = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';
              const isAdded = addedItems[product.id];
              const lotSubtotal = product.price * product.minBatchQty;

              return (
                <tr 
                  key={product.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  
                  {/* Foto + SKU */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => onQuickView(product)}
                        className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 p-1 flex items-center justify-center cursor-pointer group-hover:border-slate-400 transition-colors shrink-0"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
                          {product.sku}
                        </span>
                        <span className="text-[10px] text-blue-900 font-black mt-1">
                          {product.network}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Nome + Specs */}
                  <td className="py-3 px-4">
                    <span 
                      onClick={() => onQuickView(product)}
                      className="font-black text-slate-950 text-sm hover:text-blue-700 cursor-pointer block leading-tight uppercase"
                    >
                      {product.name}
                    </span>
                    <div className="text-xs text-slate-700 font-bold mt-0.5 space-x-2">
                      {product.specs?.tela && <span>Tela: {product.specs.tela}</span>}
                      {product.specs?.ram && <span>• {product.specs.ram}</span>}
                      {product.specs?.armazenamento && <span>• {product.specs.armazenamento}</span>}
                      {product.specs?.capacidade && <span>• {product.specs.capacidade}</span>}
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-900 border border-slate-300 font-bold px-2.5 py-1 rounded-md text-xs">
                      {product.categoryName}
                    </span>
                  </td>

                  {/* Seletor de Cores */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {product.colors && product.colors.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {product.colors.map(c => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleColorChange(product.id, c.name)}
                            className={`w-4 h-4 rounded-full transition-all ${
                              currentColor === c.name ? 'ring-2 ring-slate-950 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                            } ${c.hex === '#FFFFFF' ? 'border border-slate-400' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                        <span className="text-xs font-black text-slate-950 ml-1">
                          {currentColor}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold">Padrão</span>
                    )}
                  </td>

                  {/* Embalagem Master / Lote Mínimo */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-xs">
                      {product.minBatchQty} un. / caixa
                    </span>
                  </td>

                  {/* Status Estoque */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-emerald-950 bg-emerald-100 font-bold text-xs px-2.5 py-1 rounded-md border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {product.statusLabel}
                    </span>
                  </td>

                  {/* Preço Unitário de Atacado */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-black text-slate-950 text-base">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-600 block font-bold">/ unidade</span>
                  </td>

                  {/* Total Caixa Master */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-black text-slate-900 text-sm">
                      R$ {lotSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-bold">faturado</span>
                  </td>

                  {/* Botão Ação */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                        isAdded 
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-600' 
                          : 'bg-slate-950 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>1 Caixa Incluída!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ 1 Caixa ({product.minBatchQty} un)</span>
                        </>
                      )}
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
