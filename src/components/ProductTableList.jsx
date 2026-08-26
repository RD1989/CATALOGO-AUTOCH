import React, { useState } from 'react';
import { Plus, Check, Eye, PackageCheck, Boxes } from 'lucide-react';

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

  const handleAddUnit = (product) => {
    const color = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';
    onAddToBatch(product, color, 1);

    setAddedItems(prev => ({ ...prev, [product.id]: 'unit' }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  const handleAddBox = (product) => {
    const color = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';
    onAddToBatch(product, color, product.minBatchQty || 10);

    setAddedItems(prev => ({ ...prev, [product.id]: 'box' }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
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
              <th className="py-4 px-4">Caixa Fechada</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Preço Unitário (Atacado)</th>
              <th className="py-4 px-4 text-center">Adicionar ao Lote</th>
            </tr>
          </thead>

          <tbody className="divide-y-2 divide-slate-100 font-semibold">
            {products.map((product) => {
              const currentColor = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';
              const isAdded = addedItems[product.id];
              const boxTotal = product.price * (product.minBatchQty || 10);

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

                  {/* Caixa Master */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-xs">
                      {product.minBatchQty || 10} un. (R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
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
                    <span className="text-[10px] text-slate-600 block font-bold">/ peça</span>
                  </td>

                  {/* Botões Ação: Por Peça ou Caixa */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddUnit(product)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs ${
                          isAdded === 'unit' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-950 hover:bg-blue-700 text-white'
                        }`}
                        title="Adicionar 1 peça avulsa"
                      >
                        {isAdded === 'unit' ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>+1 Peça</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBox(product)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors"
                        title={`Adicionar 1 caixa fechada com ${product.minBatchQty || 10} peças`}
                      >
                        <Boxes className="w-3.5 h-3.5 text-amber-700 inline mr-1" />
                        <span>+1 Caixa</span>
                      </button>
                    </div>
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
