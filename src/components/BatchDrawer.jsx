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
  AlertTriangle,
  ShoppingBag,
  Lock
} from 'lucide-react';

const MINIMUM_ORDER_UNITS = 10;
const STORE_WHATSAPP_NUMBER = '5511986807777';

export default function BatchDrawer({
  isOpen,
  onClose,
  batchItems,
  onUpdateQty,
  onRemoveItem,
  onAddToBatch
}) {
  if (!isOpen) return null;

  const [buyerName, setBuyerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cityState, setCityState] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cálculos consolidados do lote
  const totalPieces = batchItems.reduce((acc, item) => acc + item.quantity, 0);

  const grossTotal = batchItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  // Meta de Pedido Mínimo (10 peças no total do pedido)
  const isMinimumReached = totalPieces >= MINIMUM_ORDER_UNITS;
  const remainingUnits = Math.max(0, MINIMUM_ORDER_UNITS - totalPieces);
  const progressPercent = Math.min(100, Math.round((totalPieces / MINIMUM_ORDER_UNITS) * 100));

  // Validação em tempo real do preenchimento de TODOS os 5 dados cadastrais
  const isFormComplete = (
    buyerName.trim().length > 0 &&
    companyName.trim().length > 0 &&
    cnpj.trim().length > 0 &&
    buyerPhone.trim().length > 0 &&
    cityState.trim().length > 0
  );

  // O botão só fica clicável se bater o pedido mínimo E tiver todos os dados preenchidos
  const isButtonEnabled = isMinimumReached && isFormComplete && batchItems.length > 0;

  // Desconto por volume (ex: 5% a partir de 50 peças / 5 caixas)
  const volumeDiscountPercent = totalPieces >= 50 ? 5 : totalPieces >= 30 ? 3 : 0;
  const discountAmount = (grossTotal * volumeDiscountPercent) / 100;
  const netTotal = grossTotal - discountAmount;

  // Alteração direta da quantidade de peças pelo input numérico
  const handlePieceInputChange = (item, newPieceCount) => {
    const pieces = parseInt(newPieceCount) || 1;
    onUpdateQty(item.id, item.selectedColor, Math.max(1, pieces));
  };

  // Enviar Cotação Comercial Formatada via WhatsApp (100% Compatível e Sem Caracteres Corrompidos)
  const handleSendQuotation = (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    setIsSubmitting(true);

    const linhaDivisoria = '--------------------------------------------------';

    // Montagem da mensagem estruturada e padronizada para o WhatsApp
    let msg = `*SOLICITACAO DE COTACAO ATACADO — ATACADO TECH*\n`;
    msg += `${linhaDivisoria}\n\n`;
    
    msg += `*DADOS DO COMPRADOR / REVENDA:*\n`;
    msg += `• *Responsavel:* ${buyerName.trim()}\n`;
    msg += `• *Empresa/Loja:* ${companyName.trim()}\n`;
    msg += `• *CNPJ/CPF:* ${cnpj.trim()}\n`;
    msg += `• *Destino (Cidade/UF):* ${cityState.trim()}\n`;
    msg += `• *WhatsApp:* ${buyerPhone.trim()}\n\n`;
    
    msg += `${linhaDivisoria}\n`;
    msg += `*ITENS DO LOTE SELECIONADO:*\n\n`;

    batchItems.forEach((item, index) => {
      const boxSize = item.minBatchQty || 10;
      const boxCount = item.quantity / boxSize;
      const boxLabel = boxCount >= 1 && Number.isInteger(boxCount)
        ? `(${boxCount} cx fechada${boxCount > 1 ? 's' : ''})`
        : `(~${boxCount.toFixed(1)} cx de ${boxSize} un)`;
      const subtotal = item.price * item.quantity;

      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   - Codigo SKU: \`${item.sku}\`\n`;
      msg += `   - Cor: ${item.selectedColor}\n`;
      msg += `   - Quantidade: *${item.quantity} unidades* ${boxLabel}\n`;
      msg += `   - Preco Unitario: R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      msg += `   - Subtotal: *R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    });

    msg += `${linhaDivisoria}\n`;
    msg += `*RESUMO FINANCEIRO DO PEDIDO:*\n`;
    msg += `• *Total de Pecas:* ${totalPieces} unidades\n`;
    msg += `• *Subtotal Tabela:* R$ ${grossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    
    if (volumeDiscountPercent > 0) {
      msg += `• *Desconto por Volume (${volumeDiscountPercent}%):* - R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    
    msg += `• *VALOR TOTAL ESTIMADO:* *R$ ${netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    msg += `${linhaDivisoria}\n`;
    msg += `_Solicito confirmacao de estoque a pronta-entrega e dados para faturamento._`;

    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encoded}`;

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
                {totalPieces} {totalPieces === 1 ? 'peça adicionada' : 'peças adicionadas'} • {batchItems.length} {batchItems.length === 1 ? 'modelo' : 'modelos'}
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

        {/* BARRA DE METAS DE PEDIDO MÍNIMO B2B (10 UNIDADES) */}
        <div className={`p-3.5 border-b-2 transition-colors ${
          isMinimumReached 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              {isMinimumReached ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Meta de Pedido Mínimo Atingida!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Meta Mínima: {totalPieces} de {MINIMUM_ORDER_UNITS} unidades</span>
                </>
              )}
            </span>
            <span className="font-extrabold">
              {isMinimumReached ? `${totalPieces} un. liberadas` : `Faltam ${remainingUnits} un.`}
            </span>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isMinimumReached ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {!isMinimumReached && (
            <p className="text-[11px] text-amber-900 font-bold mt-1.5 leading-snug">
              💡 Você pode misturar quaisquer modelos até completar o mínimo de <strong>10 peças</strong> para atacado.
            </p>
          )}
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
                Adicione peças avulsas ou caixas fechadas dos produtos para montar seu lote no atacado.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {batchItems.map((item) => {
                const boxSize = item.minBatchQty || 10;
                const itemSubtotal = item.price * item.quantity;

                return (
                  <div 
                    key={`${item.id}-${item.selectedColor}`}
                    className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    {/* Topo do Card do Item */}
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-slate-600">
                              Cor: <strong className="text-slate-950 font-black">{item.selectedColor}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-black text-blue-700">
                              R$ {item.price.toFixed(2)} / un
                            </span>
                          </div>
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

                    {/* CONTROLES FLEXÍVEIS */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t-2 border-slate-100 text-xs">
                      
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[10px]">
                          Quantidade:
                        </span>
                        
                        <div className="flex items-center bg-slate-100 border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                onUpdateQty(item.id, item.selectedColor, item.quantity - 1);
                              } else {
                                onRemoveItem(item.id, item.selectedColor);
                              }
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            title="Diminuir 1 Peça"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={item.quantity}
                            onChange={(e) => handlePieceInputChange(item, e.target.value)}
                            className="w-14 text-center font-black text-slate-950 text-xs bg-white py-1 outline-none border-x border-slate-300"
                            title="Digite a quantidade exata de peças"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(item.id, item.selectedColor, item.quantity + 1);
                            }}
                            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors"
                            title="Adicionar 1 Peça"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-600 font-bold">
                          peças
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQty(item.id, item.selectedColor, item.quantity + boxSize);
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2 py-1 rounded-lg text-[10px] font-black transition-colors"
                          title={`Adicionar +1 caixa fechada com ${boxSize} peças`}
                        >
                          +1 Caixa ({boxSize} un)
                        </button>
                      </div>

                      <div className="text-right">
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

          {/* FORMULÁRIO COM PREENCHIMENTO 100% OBRIGATÓRIO */}
          {batchItems.length > 0 && (
            <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3 pt-3 mt-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  <span>Dados Obrigatórios do Cliente</span>
                </h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                  isFormComplete 
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {isFormComplete ? '✓ Preenchimento Completo' : '* Todos obrigatórios'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                    Nome do Responsável <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                    Nome da Loja / Razão Social <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Mega Celulares Ltda"
                    className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                    CNPJ ou CPF <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                    WhatsApp de Contato <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">
                  Cidade e UF de Destino / Entrega <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Ex: São Paulo / SP"
                  className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-colors"
                />
              </div>
            </div>
          )}

        </div>

        {/* Rodapé com Totais & Botão com Trava de Validação */}
        {batchItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-white space-y-3">
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-bold">
                <span>Subtotal Bruto ({totalPieces} peças):</span>
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

            {/* BOTÃO COM BLOQUEIO TOTAL ATÉ PREENCHIMENTO COMPLETO */}
            <button
              type="button"
              onClick={handleSendQuotation}
              disabled={!isButtonEnabled || isSubmitting}
              className={`w-full text-sm sm:text-base font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                isButtonEnabled 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer active:scale-[0.98]' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-80 shadow-none'
              }`}
            >
              {isButtonEnabled ? (
                <>
                  <Send className="w-5 h-5" />
                  <span>Solicitar Cotação no WhatsApp ({totalPieces} peças)</span>
                </>
              ) : !isMinimumReached ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Faltam {remainingUnits} peças para o pedido mínimo (10 un)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>Preencha todos os dados acima para liberar</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
