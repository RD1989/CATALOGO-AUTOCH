import React, { useState } from 'react';
import { Calculator, Share2, Copy, Check, TrendingUp, DollarSign } from 'lucide-react';

export default function MarginSimulatorTab({
  products,
  userRole,
  showToast
}) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [boxCount, setBoxCount] = useState(2);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [freightCost, setFreightCost] = useState(120);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const boxUnits = selectedProduct?.minBatchQty || 10;
  const totalPieces = boxCount * boxUnits;
  const grossTotal = selectedProduct ? selectedProduct.price * totalPieces : 0;
  const discountAmount = (grossTotal * discountPercent) / 100;
  const netTotal = grossTotal - discountAmount + Number(freightCost);
  const estimatedCost = grossTotal * 0.65;
  const estimatedProfit = grossTotal - discountAmount - estimatedCost;

  const handleCopyProposal = () => {
    const text = `*PROPOSTA COMERCIAL ESPECIAL B2B — ATACADO TECH*\n` +
      `• *Produto:* ${selectedProduct?.name}\n` +
      `• *Volume:* ${boxCount} caixas master (${totalPieces} unidades)\n` +
      `• *Preço Tabela:* R$ ${selectedProduct?.price.toFixed(2)} / un\n` +
      `• *Subtotal Bruto:* R$ ${grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      (discountPercent > 0 ? `• *Desconto Especial (${discountPercent}%):* - R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : '') +
      `• *Frete Estimado:* R$ ${Number(freightCost).toFixed(2)}\n` +
      `• *VALOR TOTAL DO LOTE:* *R$ ${netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
      `_Faturamento com nota fiscal e garantia de pronta-entrega._`;

    navigator.clipboard?.writeText(text);
    showToast('✓ Proposta comercial copiada para o WhatsApp!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Simulador de Margem & Cotações Especiais
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
          Calcule descontos por volume de caixas fechadas, frete e margem bruta real de lucro da operação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Painel de Configuração */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-600" />
            <span>Configurar Simulação de Lote</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                Selecionar Produto do Catálogo
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 outline-none cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — R$ {p.price.toFixed(2)} / un (Caixa: {p.minBatchQty} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                  Quantidade de Caixas
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={boxCount}
                  onChange={(e) => setBoxCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                  Desconto Volume (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                Custo Estimado de Frete (R$)
              </label>
              <input
                type="number"
                min="0"
                value={freightCost}
                onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resumo da Simulação */}
        <div className="bg-slate-950 text-white border-2 border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs text-blue-400 font-black uppercase tracking-wider block">
              Resultado da Simulação B2B
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalPieces} unidades ({boxCount} caixas master)
            </h3>
          </div>

          <div className="space-y-2.5 py-3 border-y border-slate-800 text-sm">
            <div className="flex justify-between font-bold text-slate-300">
              <span>Valor Bruto da Tabela:</span>
              <span>R$ {grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between font-bold text-amber-400">
                <span>Desconto Aplicado ({discountPercent}%):</span>
                <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-slate-300">
              <span>Frete / Logística:</span>
              <span>+ R$ {Number(freightCost).toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-black text-emerald-400 text-xl pt-2 border-t border-slate-800">
              <span>Total Estimado do Lote:</span>
              <span>R$ {netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {userRole === 'dono' && (
              <div className="flex justify-between font-black text-cyan-300 text-sm pt-1">
                <span>Margem Bruta Estimada:</span>
                <span>R$ {estimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (~35%)</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyProposal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Copiar Proposta Comercial para o WhatsApp</span>
          </button>
        </div>

      </div>

    </div>
  );
}
