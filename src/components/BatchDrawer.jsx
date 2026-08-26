import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  FileSpreadsheet,
  Boxes,
  CheckCircle2,
  PackageCheck,
  Percent,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function BatchDrawer({
  isOpen,
  onClose,
  batchItems,
  onUpdateQty,
  onRemoveItem
}) {
  if (!isOpen) return null;

  const [buyerName, setBuyerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cityState, setCityState] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cálculos consolidados do lote
  const totalBoxes = batchItems.reduce((acc, item) => {
    const boxCount = Math.max(1, Math.round(item.quantity / (item.minBatchQty || 10)));
    return acc + boxCount;
  }, 0);

  const totalPieces = batchItems.reduce((acc, item) => acc + item.quantity, 0);

  const grossTotal = batchItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  // Desconto por volume (ex: 5% para pedidos com 5 caixas ou mais)
  const volumeDiscountPercent = totalBoxes >= 5 ? 5 : totalBoxes >= 3 ? 3 : 0;
  const discountAmount = (grossTotal * volumeDiscountPercent) / 100;
  const netTotal = grossTotal - discountAmount;

  // Enviar Cotação Comercial via WhatsApp e persistir no banco de dados
  const handleSendQuotation = async (e) => {
    e.preventDefault();
    if (batchItems.length === 0) return;

    setIsSubmitting(true);

    const quoteData = {
      buyerName: buyerName || 'Comprador B2B',
      company: companyName || 'Revenda Autorizada',
      cnpj: cnpj || 'Não informado',
      phone: buyerPhone || '5511999999999',
      city: cityState.split('/')[0]?.trim() || 'São Paulo',
      state: cityState.split('/')[1]?.trim() || 'SP',
      items: batchItems.map(item => ({
        sku: item.sku,
        name: item.name,
        color: item.selectedColor,
        boxes: Math.round(item.quantity / item.minBatchQty),
        units: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      totalBoxes,
      totalUnits: totalPieces,
      totalValue: netTotal
    };

    try {
      await api.createQuote(quoteData);
    } catch (err) {
      console.warn('Cotação enviada apenas via WhatsApp:', err);
    }

    // Mensagem Estruturada para WhatsApp
    let msg = `*SOLICITAÇÃO DE COTAÇÃO ATACADO — ATACADO TECH*\n`;
    msg += `--------------------------------------------------\n`;
    msg += `*DADOS DO COMPRADOR*\n`;
    msg += `• *Responsável:* ${buyerName || 'Não informado'}\n`;
    msg += `• *Empresa / Loja:* ${companyName || 'Não informado'}\n`;
    msg += `• *CNPJ / CPF:* ${cnpj || 'Não informado'}\n`;
    msg += `• *Cidade/UF:* ${cityState || 'Não informado'}\n`;
    msg += `• *Contato:* ${buyerPhone || 'Não informado'}\n`;
    msg += `--------------------------------------------------\n`;
    msg += `*PRODUTOS & CAIXAS MASTER SELECIONADAS:*\n\n`;

    batchItems.forEach((item, index) => {
      const boxes = Math.round(item.quantity / item.minBatchQty);
      const subtotal = item.price * item.quantity;
      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   • Código: \`${item.sku}\` | Cor: *${item.selectedColor}*\n`;
      msg += `   • Volume: *${boxes} Caixa(s)* (${item.quantity} unidades)\n`;
      msg += `   • Unitário: R$ ${item.price.toFixed(2)} | Subtotal: *R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    });

    msg += `--------------------------------------------------\n`;
    msg += `*RESUMO DO FATURAMENTO:*\n`;
    msg += `• *Total de Caixas Fechadas:* ${totalBoxes} caixas master\n`;
    msg += `• *Total de Peças:* ${totalPieces} unidades\n`;
    msg += `• *Valor Bruto da Tabela:* R$ ${grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (volumeDiscountPercent > 0) {
      msg += `• *Desconto por Volume (${volumeDiscountPercent}%):* - R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `• *VALOR ESTIMADO DO LOTE:* *R$ ${netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    msg += `--------------------------------------------------\n`;
    msg += `_Solicito confirmação de estoque físico e dados para emissão de nota e faturamento._`;

    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/5511999999999?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg sm:max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabeçalho do Drawer */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Meu Lote de Compras
              </h2>
              <span className="text-xs text-slate-300 font-bold">
                {totalBoxes} caixas master • {totalPieces} peças
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de Itens do Lote */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {batchItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <Boxes className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-950">Seu lote está vazio</h3>
              <p className="text-xs text-slate-600 font-bold max-w-xs mx-auto">
                Adicione caixas master dos tablets ou power banks no catálogo para calcular o faturamento do seu pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {batchItems.map((item) => {
                const boxCount = Math.max(1, Math.round(item.quantity / (item.minBatchQty || 10)));
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div 
                    key={`${item.id}-${item.selectedColor}`}
                    className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {item.sku}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-950 uppercase leading-snug mt-0.5">
                            {item.name}
                          </h4>
                          <span className="text-xs font-bold text-slate-600">
                            Cor selecionada: <strong className="text-slate-950 font-black">{item.selectedColor}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id, item.selectedColor)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remover do lote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Controles de Quantidade em Caixa Master Fechada */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Caixas Master:</span>
                        <div className="flex items-center bg-slate-100 border-2 border-slate-300 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > item.minBatchQty) {
                                onUpdateQty(item.id, item.selectedColor, item.quantity - item.minBatchQty);
                              } else {
                                onRemoveItem(item.id, item.selectedColor);
                              }
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded-l-xl transition-colors"
                            title="Diminuir 1 Caixa"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="px-3 font-black text-slate-950 text-xs">
                            {boxCount} cx ({item.quantity} un)
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(item.id, item.selectedColor, item.quantity + item.minBatchQty);
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded-r-xl transition-colors"
                            title="Adicionar 1 Caixa"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold block">Subtotal:</span>
                        <span className="text-sm font-black text-slate-950">
                          R$ {itemSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dados do Comprador para a Cotação */}
          {batchItems.length > 0 && (
            <form onSubmit={handleSendQuotation} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3 pt-3 mt-4">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Dados do Comprador / Revendedor</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Nome do Comprador *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Nome da Empresa / Loja *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Mega Celulares Ltda"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Cidade / UF de Destino</label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Ex: São Paulo / SP"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </form>
          )}

        </div>

        {/* Rodapé com Totais & Botão Finalizar */}
        {batchItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-white space-y-3">
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-bold">
                <span>Subtotal Bruto:</span>
                <span>R$ {grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {volumeDiscountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-black">
                  <span>Desconto Volume ({volumeDiscountPercent}%):</span>
                  <span>- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-black text-slate-950">TOTAL ESTIMADO:</span>
                <span className="text-2xl font-black text-slate-950">
                  R$ {netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendQuotation}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              <span>Solicitar Cotação no WhatsApp ({totalBoxes} caixas)</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
