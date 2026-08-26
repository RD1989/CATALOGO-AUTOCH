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
  Sparkles,
  Edit3
} from 'lucide-react';

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

  // Desconto por volume (ex: 5% para pedidos com 5 caixas ou mais, 3% para 3 caixas ou mais)
  const volumeDiscountPercent = totalBoxes >= 5 ? 5 : totalBoxes >= 3 ? 3 : 0;
  const discountAmount = (grossTotal * volumeDiscountPercent) / 100;
  const netTotal = grossTotal - discountAmount;

  // Alteração direta da quantidade de caixas pelo input numérico
  const handleBoxInputChange = (item, newBoxCount) => {
    const boxes = parseInt(newBoxCount) || 1;
    const minQty = item.minBatchQty || 10;
    const finalQty = Math.max(minQty, boxes * minQty);
    onUpdateQty(item.id, item.selectedColor, finalQty);
  };

  // Enviar Cotação Comercial Formatada via WhatsApp
  const handleSendQuotation = (e) => {
    e.preventDefault();
    if (batchItems.length === 0) return;

    setIsSubmitting(true);

    // Mensagem Estruturada e Formatada com Emojis Profissionais para WhatsApp
    let msg = `🛒 *SOLICITAÇÃO DE COTAÇÃO — ATACADO TECH B2B*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    msg += `🏢 *DADOS DO COMPRADOR / REVENDA:*\n`;
    msg += `• *Responsável:* ${buyerName.trim() || 'Não informado'}\n`;
    msg += `• *Empresa/Loja:* ${companyName.trim() || 'Revenda Autorizada'}\n`;
    if (cnpj.trim()) msg += `• *CNPJ/CPF:* ${cnpj.trim()}\n`;
    if (cityState.trim()) msg += `• *Destino:* ${cityState.trim()}\n`;
    if (buyerPhone.trim()) msg += `• *WhatsApp:* ${buyerPhone.trim()}\n`;
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `📦 *ITENS DO LOTE SOLICITADO:*\n\n`;

    batchItems.forEach((item, index) => {
      const boxes = Math.round(item.quantity / (item.minBatchQty || 10));
      const subtotal = item.price * item.quantity;
      msg += `*${index + 1}. ${item.name}*\n`;
      msg += `   ▪ *SKU:* \`${item.sku}\`\n`;
      msg += `   ▪ *Cor:* ${item.selectedColor}\n`;
      msg += `   ▪ *Volume:* *${boxes} Caixa(s)* (${item.quantity} unidades no total)\n`;
      msg += `   ▪ *Preço Unitário:* R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
      msg += `   ▪ *Subtotal do Item:* *R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `📊 *RESUMO DO FATURAMENTO:*\n`;
    msg += `• *Volume Total:* ${totalBoxes} caixas fechadas (${totalPieces} peças)\n`;
    msg += `• *Subtotal Bruto:* R$ ${grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    
    if (volumeDiscountPercent > 0) {
      msg += `• *Desconto por Volume (${volumeDiscountPercent}%):* - R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    
    msg += `• *VALOR ESTIMADO DO PEDIDO:* *R$ ${netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Solicito a confirmação de disponibilidade de pronta-entrega e os dados para emissão de nota fiscal e envio._`;

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
                {totalBoxes} {totalBoxes === 1 ? 'caixa master' : 'caixas master'} • {totalPieces} peças
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
            <div className="space-y-3.5">
              {batchItems.map((item) => {
                const boxCount = Math.max(1, Math.round(item.quantity / (item.minBatchQty || 10)));
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div 
                    key={`${item.id}-${item.selectedColor}`}
                    className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    {/* Topo do Card do Item: Foto + Dados Principais */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border-2 border-slate-200 p-1 flex items-center justify-center shrink-0">
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
                            Cor: <strong className="text-slate-950 font-black">{item.selectedColor}</strong>
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

                    {/* Controles Avançados de Quantidade de Caixas (Botões +/- e Input Numérico Direto) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t-2 border-slate-100 text-xs">
                      
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                          Caixas Master:
                        </span>
                        
                        <div className="flex items-center bg-slate-100 border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                          {/* Botão Diminuir 1 Caixa */}
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > item.minBatchQty) {
                                onUpdateQty(item.id, item.selectedColor, item.quantity - item.minBatchQty);
                              } else {
                                onRemoveItem(item.id, item.selectedColor);
                              }
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            title="Diminuir 1 Caixa"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Input Numérico Editável Direto */}
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={boxCount}
                            onChange={(e) => handleBoxInputChange(item, e.target.value)}
                            className="w-12 text-center font-black text-slate-950 text-xs bg-white py-1 outline-none border-x border-slate-300"
                            title="Digite a quantidade de caixas"
                          />

                          {/* Botão Adicionar 1 Caixa */}
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(item.id, item.selectedColor, item.quantity + item.minBatchQty);
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            title="Adicionar 1 Caixa"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-600 font-bold">
                          ({item.quantity} un.)
                        </span>
                      </div>

                      {/* Subtotal Calculado */}
                      <div className="text-right sm:text-right">
                        <span className="text-[10px] text-slate-500 font-bold block">Subtotal:</span>
                        <span className="text-sm sm:text-base font-black text-slate-950">
                          R$ {itemSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dados do Comprador para a Cotação Formatada */}
          {batchItems.length > 0 && (
            <form onSubmit={handleSendQuotation} className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3 pt-3 mt-4">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
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
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                <span>Subtotal Bruto ({totalBoxes} caixas):</span>
                <span>R$ {grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {volumeDiscountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-black">
                  <span>Desconto por Volume ({volumeDiscountPercent}%):</span>
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
              <span>Solicitar Cotação no WhatsApp ({totalBoxes} {totalBoxes === 1 ? 'caixa' : 'caixas'})</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
