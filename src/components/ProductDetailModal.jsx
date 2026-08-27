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
  Minus,
  Wifi,
  Monitor,
  ChevronRight,
  ShieldCheck,
  Truck,
  Tag,
  Layers,
  Star,
  Zap
} from 'lucide-react';

// Mapa de ícones por chave de spec
const SPEC_ICON_MAP = {
  tela: { icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  bateria: { icon: Battery, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ram: { icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  armazenamento: { icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  processador: { icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  sistema: { icon: Smartphone, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  conectividade: { icon: Wifi, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  capacidade: { icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
};

const SPEC_LABELS = {
  tela: 'Display',
  bateria: 'Bateria',
  ram: 'Memória RAM',
  armazenamento: 'Armazenamento',
  processador: 'Processador',
  sistema: 'Sistema',
  conectividade: 'Conectividade',
  capacidade: 'Capacidade',
};

export default function ProductDetailModal({
  product,
  onClose,
  onAddToBatch
}) {
  // ──────────────────────────────────────────────────────────────
  // TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  // ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'order'
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Padrão');
  const [selectedColorObj, setSelectedColorObj] = useState(product?.colors?.[0] || null);
  const [unitCount, setUnitCount] = useState(1);
  const [justAdded, setJustAdded] = useState(null); // null | 'units' | 'box'

  // Event handlers (definidos antes do return condicional — seguros pois são apenas definições)
  const handleSelectColor = (c) => {
    setSelectedColor(c.name);
    setSelectedColorObj(c);
  };

  const handleAddUnits = () => {
    onAddToBatch(product, selectedColor, unitCount);
    setJustAdded('units');
    setTimeout(() => { setJustAdded(null); onClose(); }, 1000);
  };

  const handleAddBox = () => {
    onAddToBatch(product, selectedColor, product?.minBatchQty || 10);
    setJustAdded('box');
    setTimeout(() => { setJustAdded(null); onClose(); }, 1000);
  };

  // Renderização condicional APÓS os hooks
  if (!product) return null;

  // Valores derivados (product é garantidamente não-nulo aqui)
  const boxQty = product.minBatchQty || 10;
  const boxTotal = product.price * boxQty;
  const unitsSubtotal = product.price * unitCount;

  // Filtrar specs com valor real
  const specsEntries = Object.entries(product.specs || {}).filter(([, v]) => v && String(v).trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200 flex flex-col lg:flex-row max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ═══════════════════════════════════
            COLUNA ESQUERDA: Imagem & Identidade
            ═══════════════════════════════════ */}
        <div className="lg:w-2/5 bg-gradient-to-b from-slate-50 to-white border-b-2 lg:border-b-0 lg:border-r-2 border-slate-200 flex flex-col p-5 sm:p-7 gap-5">

          {/* Badges de Topo */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-black text-slate-700 bg-white px-3 py-1.5 rounded-xl border-2 border-slate-300 shadow-2xs tracking-wider">
              {product.sku}
            </span>
            <div className="flex items-center gap-2">
              {product.network && (
                <span className="text-xs font-black text-blue-900 bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200">
                  {product.network}
                </span>
              )}
              {product.condition && (
                <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                  product.condition === 'Lançamento'
                    ? 'bg-rose-100 text-rose-900 border-rose-200'
                    : product.condition === 'Mais vendidos'
                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                }`}>
                  {product.condition === 'Mais vendidos' ? '⭐ Top' : product.condition}
                </span>
              )}
            </div>
          </div>

          {/* Foto Principal */}
          <div className="flex-1 min-h-[200px] max-h-[280px] lg:max-h-[340px] bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center p-5 overflow-hidden shadow-inner">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Seletor de Cores */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Cor Selecionada:</span>
                <div className="flex items-center gap-2">
                  {selectedColorObj && (
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: selectedColorObj.hex }}
                    />
                  )}
                  <span className="text-xs font-black text-slate-950">{selectedColor}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectColor(c)}
                      title={c.name}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 transition-all text-xs font-black ${
                        isSelected
                          ? 'border-slate-950 bg-slate-950 text-white shadow-md scale-105'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${c.hex === '#FFFFFF' ? 'border border-slate-400' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Badges Técnicas — key pelo valor em vez de índice */}
          {product.badges && product.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.badges.map((b) => (
                <span key={b} className="text-[11px] font-black bg-slate-950 text-white px-2.5 py-1 rounded-lg">
                  {b}
                </span>
              ))}
            </div>
          )}

        </div>

        {/* ═══════════════════════════════════════════
            COLUNA DIREITA: Tabs Ficha Técnica / Pedido
            ═══════════════════════════════════════════ */}
        <div className="lg:w-3/5 flex flex-col overflow-hidden">

          {/* Header com Nome + Botão Fechar */}
          <div className="p-5 sm:p-7 pb-0 flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest block mb-1">
                {product.categoryName || 'Catálogo Atacado'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight uppercase">
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-950 transition-colors shrink-0 border-2 border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preço em Destaque */}
          <div className="px-5 sm:px-7 pt-4 pb-0">
            <div className="bg-blue-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-200 block">
                  Preço Unitário Atacado
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-blue-200 font-bold ml-1">/ peça</span>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-blue-200 font-bold block">Caixa ({boxQty} un.):</span>
                <span className="text-lg font-black">
                  R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Tabs */}
          <div className="flex gap-0 px-5 sm:px-7 pt-4 border-b-2 border-slate-200">
            {[
              { id: 'specs', label: '📋 Ficha Técnica' },
              { id: 'order', label: '🛒 Fazer Pedido' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-xs sm:text-sm font-black transition-all border-b-2 -mb-0.5 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das Tabs com scroll */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">

            {/* ─── ABA: FICHA TÉCNICA ─── */}
            {activeTab === 'specs' && (
              <div className="space-y-5 animate-in fade-in duration-150">

                {/* Bullet Points de Destaque Comercial */}
                {product.bulletPoints && product.bulletPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Diferenciais do Produto
                    </h4>
                    <ul className="space-y-1.5">
                      {product.bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-slate-900">{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Grid de Especificações Técnicas */}
                {specsEntries.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Especificações Técnicas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {specsEntries.map(([key, value]) => {
                        const spec = SPEC_ICON_MAP[key];
                        const Icon = spec?.icon || Tag;
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${spec?.bg || 'bg-slate-50 border-slate-200'}`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${spec?.color || 'text-slate-500'}`} />
                            <div className="min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                {SPEC_LABELS[key] || key}
                              </span>
                              <span className="text-xs font-black text-slate-950 truncate block">
                                {value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status & Disponibilidade */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                    <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="font-black text-emerald-900 block leading-tight">Pronta-Entrega</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
                    <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="font-black text-blue-900 block leading-tight">Nota Fiscal</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                    <PackageCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="font-black text-amber-900 block leading-tight">Caixa Lacrada</span>
                  </div>
                </div>

                {/* CTA para ir à aba de pedido */}
                <button
                  type="button"
                  onClick={() => setActiveTab('order')}
                  className="w-full bg-slate-950 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>Montar Pedido</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            )}

            {/* ─── ABA: FAZER PEDIDO ─── */}
            {activeTab === 'order' && (
              <div className="space-y-4 animate-in fade-in duration-150">

                {/* Cor selecionada (resumo) */}
                {selectedColorObj && (
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm">
                    <span
                      className="w-5 h-5 rounded-full border-2 border-slate-300 shadow-2xs"
                      style={{ backgroundColor: selectedColorObj.hex }}
                    />
                    <span className="font-black text-slate-950">
                      Cor: {selectedColor}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('specs')}
                      className="ml-auto text-[11px] font-bold text-blue-600 underline underline-offset-2"
                    >
                      alterar
                    </button>
                  </div>
                )}

                {/* Opção 1: Adicionar por Peça (com stepper) */}
                <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Opção A — Montar seu lote peça a peça:
                  </h4>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                        className="px-3 py-2.5 text-slate-700 hover:bg-slate-100 font-black transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={unitCount}
                        onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 text-center font-black text-sm text-slate-950 outline-none py-2"
                      />
                      <button
                        type="button"
                        onClick={() => setUnitCount(unitCount + 1)}
                        className="px-3 py-2.5 text-slate-700 hover:bg-slate-100 font-black transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[11px] font-bold text-slate-500 block">Subtotal:</span>
                      <span className="text-lg font-black text-slate-950">
                        R$ {unitsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddUnits}
                    className={`w-full font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                      justAdded === 'units'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {justAdded === 'units' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Adicionado ao Lote!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>+ Adicionar {unitCount} {unitCount === 1 ? 'Peça' : 'Peças'} ao Lote</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Separador "OU" */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-black text-slate-400 uppercase">ou</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Opção 2: Adicionar Caixa Fechada */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      Opção B — Caixa Master Fechada ({boxQty} un.):
                    </h4>
                    <span className="text-xs font-black text-amber-800 bg-amber-200 px-2.5 py-1 rounded-lg">
                      R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-900 font-bold">
                    Kit de fábrica lacrado com {boxQty} unidades de uma mesma cor, com garantia de kit completo.
                  </p>

                  <button
                    type="button"
                    onClick={handleAddBox}
                    className={`w-full font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-2 ${
                      justAdded === 'box'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-500 shadow-sm'
                    }`}
                  >
                    {justAdded === 'box' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span className="text-white">Caixa Adicionada ao Lote!</span>
                      </>
                    ) : (
                      <>
                        <Boxes className="w-4 h-4" />
                        <span>+ Adicionar 1 Caixa Fechada ({boxQty} un.)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Disclaimer de mínimo */}
                <p className="text-center text-[11px] text-slate-500 font-bold">
                  🔒 Pedido mínimo de 10 peças (misturado entre modelos)
                </p>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
