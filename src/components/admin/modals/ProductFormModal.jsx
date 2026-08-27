import React, { useState, useRef } from 'react';
import { 
  Package, 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Palette, 
  Layers, 
  Cpu, 
  DollarSign, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function ProductFormModal({
  isOpen,
  editingProduct,
  onClose,
  onSave,
  showToast
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('geral'); // 'geral' | 'midia' | 'specs' | 'precos'
  const [uploadedImagePreview, setUploadedImagePreview] = useState(editingProduct?.image || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Editor Interativo de Cores
  const [colors, setColors] = useState(() => {
    if (editingProduct?.colors && editingProduct.colors.length > 0) {
      return editingProduct.colors;
    }
    return [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Azul', hex: '#3B82F6' }
    ];
  });
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#3B82F6');

  // Adicionar Nova Cor
  const handleAddColor = () => {
    if (!newColorName.trim()) {
      showToast('⚠️ Informe o nome da cor (ex: Preto, Dourado).');
      return;
    }
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    showToast(`✓ Cor ${newColorName} adicionada!`);
  };

  // Remover Cor
  const handleRemoveColor = (indexToRemove) => {
    if (colors.length <= 1) {
      showToast('⚠️ O produto deve conter ao menos 1 cor.');
      return;
    }
    setColors(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Manipular Upload do Arquivo
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setUploadedImagePreview(base64);
      setIsUploading(true);

      try {
        const uploadRes = await api.uploadImage(base64, file.name.split('.')[0]);
        if (uploadRes && uploadRes.url) {
          setUploadedImagePreview(uploadRes.url);
          showToast('✓ Imagem otimizada salva no servidor!');
        }
      } catch (err) {
        showToast('✓ Foto carregada localmente.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const productPayload = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: form.name.value,
      sku: form.sku.value,
      category: form.category.value,
      categoryName: form.category.value === 'tablets-infantis' ? 'Tablets Infantis' : 
                    form.category.value === 'tablets-profissionais' ? 'Tablets Profissionais' : 'Power Banks & Acessórios',
      price: parseFloat(form.price.value) || 0,
      minBatchQty: parseInt(form.minBatchQty.value) || 10,
      boxUnitLabel: `1 Caixa Fechada (${form.minBatchQty.value} un.)`,
      condition: form.condition.value,
      network: form.network.value,
      status: form.status.value,
      statusLabel: form.status.value === 'available' ? 'Em estoque pronta-entrega' : 
                   form.status.value === 'low_stock' ? 'Estoque baixo' : 'Indisponível',
      stockQty: parseInt(form.stockQty.value) || 300,
      image: uploadedImagePreview || form.imageUrl?.value || '/images/products/stab-9-pro.jpg',
      colors: colors,
      badges: form.badges?.value ? form.badges.value.split(',').map(b => b.trim()) : [`Caixa ${form.minBatchQty.value} PCS`],
      specs: {
        tela: form.specTela?.value || 'Display HD IPS',
        armazenamento: form.specArmazenamento?.value || '128GB ROM',
        ram: form.specRam?.value || '6GB RAM',
        bateria: form.specBateria?.value || '7.000 mAh',
        processador: form.specProcessador?.value || 'Octa-Core 2.0GHz',
        sistema: form.specSistema?.value || 'Android 14',
        conectividade: form.network.value
      },
      bulletPoints: form.bulletPoints?.value ? form.bulletPoints.value.split('\n').filter(b => b.trim()) : (editingProduct?.bulletPoints || ['Caixa Master Lacrada'])
    };

    onSave(productPayload);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Cadastrar Novo Produto B2B'}
              </h3>
              <span className="text-xs text-slate-300 font-bold">
                Configure dados cadastrais, variações de cores e preços de fábrica.
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

        {/* Barra de Navegação por Abas */}
        <div className="flex border-b-2 border-slate-200 bg-slate-100 px-4 sm:px-6 pt-2 gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'geral', label: '1. Dados Gerais', icon: Layers },
            { id: 'midia', label: '2. Foto & Cores', icon: Palette },
            { id: 'specs', label: '3. Ficha Técnica', icon: Cpu },
            { id: 'precos', label: '4. Preço & Estoque', icon: DollarSign }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl text-xs sm:text-sm font-black transition-all border-t-2 border-x-2 -mb-0.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white border-slate-300 text-slate-950 shadow-xs'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Formulário Principal com Conteúdo por Aba */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
          <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-5">
            
            {/* ABA 1: DADOS GERAIS */}
            {activeTab === 'geral' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                    Nome Oficial do Produto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="Ex: TABLET PRO X10 — ATACADO"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Código SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      required
                      defaultValue={editingProduct?.sku || 'TB-NEW-PRO'}
                      placeholder="Ex: TB-X10-5G"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Categoria do Catálogo *
                    </label>
                    <select
                      name="category"
                      defaultValue={editingProduct?.category || 'tablets-profissionais'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="tablets-profissionais">Tablets Profissionais</option>
                      <option value="tablets-infantis">Tablets Infantis</option>
                      <option value="power-banks">Power Banks & Acessórios</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Selo de Destaque / Condição
                    </label>
                    <select
                      name="condition"
                      defaultValue={editingProduct?.condition || 'Lançamento'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="Mais vendidos">Mais Vendidos (Top Seller)</option>
                      <option value="Lançamento">Lançamento (Novo)</option>
                      <option value="Promoção">Promoção Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Badges de Destaque (Separados por vírgula)
                    </label>
                    <input
                      type="text"
                      name="badges"
                      defaultValue={editingProduct?.badges?.join(', ') || 'Caixa 10 PCS, Pronta-Entrega'}
                      placeholder="Caixa 10 PCS, 5G, Octa-Core"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                    Destaques Comerciais (1 por linha)
                  </label>
                  <textarea
                    name="bulletPoints"
                    rows="3"
                    defaultValue={editingProduct?.bulletPoints?.join('\n') || 'Caixa Master Lacrada\nKit completo de fábrica\nGiro rápido no ponto de venda'}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}

            {/* ABA 2: FOTO & CORES */}
            {activeTab === 'midia' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Seção da Foto */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5">
                  <div className="md:col-span-4 h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                    {uploadedImagePreview ? (
                      <img src={uploadedImagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                        <span className="text-xs font-bold">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <h4 className="text-sm font-black text-slate-950 uppercase">Imagem Oficial do Produto</h4>
                    <p className="text-xs text-slate-600 font-bold">
                      Carregue uma foto em alta resolução do seu computador ou celular.
                    </p>

                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploading ? 'Otimizando Imagem...' : 'Carregar do Dispositivo'}</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Ou URL direta da imagem:</label>
                      <input
                        type="text"
                        name="imageUrl"
                        defaultValue={uploadedImagePreview}
                        onChange={(e) => setUploadedImagePreview(e.target.value)}
                        placeholder="/images/products/modelo.jpg"
                        className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Editor Interativo de Cores */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-950 uppercase flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <span>Variações de Cores Disponíveis</span>
                  </h4>

                  {/* Lista de Cores Existentes */}
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border-2 border-slate-300 px-3.5 py-2 rounded-xl shadow-xs">
                        <span className="w-5 h-5 rounded-full border border-slate-400 shadow-2xs" style={{ backgroundColor: c.hex }} />
                        <span className="text-xs font-black text-slate-900">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({c.hex})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                          title="Remover cor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar Nova Cor */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-10 h-10 rounded-xl border-2 border-slate-300 cursor-pointer p-0.5 bg-white"
                        title="Escolha a cor visual"
                      />
                      <input
                        type="text"
                        placeholder="Nome da cor (ex: Grafite)"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="flex-1 sm:w-48 bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Cor</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ABA 3: FICHA TÉCNICA */}
            {activeTab === 'specs' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Tela / Display
                    </label>
                    <input
                      type="text"
                      name="specTela"
                      defaultValue={editingProduct?.specs?.tela || '10.1" IPS Full HD'}
                      placeholder='Ex: 11.0" 2K Retina'
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Bateria & Autonomia
                    </label>
                    <input
                      type="text"
                      name="specBateria"
                      defaultValue={editingProduct?.specs?.bateria || '7.500 mAh'}
                      placeholder="Ex: 8.000 mAh Carga Rápida"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Memória RAM
                    </label>
                    <input
                      type="text"
                      name="specRam"
                      defaultValue={editingProduct?.specs?.ram || '8GB RAM'}
                      placeholder="Ex: 8GB + 4GB Virtual"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Armazenamento ROM
                    </label>
                    <input
                      type="text"
                      name="specArmazenamento"
                      defaultValue={editingProduct?.specs?.armazenamento || '256GB ROM'}
                      placeholder="Ex: 512GB ROM Alta Velocidade"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Processador
                    </label>
                    <input
                      type="text"
                      name="specProcessador"
                      defaultValue={editingProduct?.specs?.processador || 'Octa-Core 2.2GHz'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Sistema Operacional
                    </label>
                    <input
                      type="text"
                      name="specSistema"
                      defaultValue={editingProduct?.specs?.sistema || 'Android 14'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Tecnologia de Rede
                    </label>
                    <select
                      name="network"
                      defaultValue={editingProduct?.network || '5G'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="5G">5G Standalone</option>
                      <option value="4G / LTE">4G / LTE</option>
                      <option value="Wi-Fi">Wi-Fi Dual Band</option>
                      <option value="Turbo 22.5W">Turbo 22.5W (Acessório)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: PREÇOS & ESTOQUE */}
            {activeTab === 'precos' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Preço Unitário Atacado (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      required
                      defaultValue={editingProduct?.price || 480.00}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-base font-black text-slate-950 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Quantidade por Caixa Master (PCS) *
                    </label>
                    <select
                      name="minBatchQty"
                      defaultValue={editingProduct?.minBatchQty || 10}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value={10}>10 Unidades por Caixa</option>
                      <option value={20}>20 Unidades por Caixa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Estoque Físico Atual (Peças)
                    </label>
                    <input
                      type="number"
                      name="stockQty"
                      defaultValue={editingProduct?.stockQty || 300}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">
                      Status de Disponibilidade
                    </label>
                    <select
                      name="status"
                      defaultValue={editingProduct?.status || 'available'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="available">Em estoque pronta-entrega</option>
                      <option value="low_stock">Estoque baixo (Poucas caixas)</option>
                      <option value="unavailable">Indisponível no momento</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Rodapé Fixo de Ação */}
          <div className="p-4 sm:p-5 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              ● Alterações sincronizadas com o banco SQLite/MySQL
            </span>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{editingProduct ? 'Salvar Produto' : 'Gravar no Banco'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
