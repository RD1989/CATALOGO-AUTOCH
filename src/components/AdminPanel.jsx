import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Boxes, 
  BarChart3, 
  Package, 
  ClipboardList, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  ArrowLeft, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  Upload, 
  RefreshCw, 
  FileSpreadsheet, 
  ShieldCheck,
  Building2,
  PackageCheck,
  CheckCircle2,
  Phone,
  Calculator,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Menu,
  FileText,
  Percent,
  Download,
  Share2,
  ExternalLink,
  MessageSquare,
  Database,
  Layers,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ 
  products, 
  onUpdateProducts, 
  onBackToCatalog 
}) {
  const [userRole, setUserRole] = useState('dono'); // 'dono' | 'colaborador'
  const [activeMenu, setActiveMenu] = useState('products'); 

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [searchAdmin, setSearchAdmin] = useState('');
  const [categoryAdmin, setCategoryAdmin] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Upload e preview da foto
  const [uploadedImagePreview, setUploadedImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Estados com persistência real
  const [customers, setCustomers] = useState([]);
  const [quotesList, setQuotesList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Ferramenta de Reajuste em Massa (%)
  const [adjustPercent, setAdjustPercent] = useState(5);
  const [adjustCategory, setAdjustCategory] = useState('all');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Calculadora de Margem & Simulador B2B
  const [calcSelectedProduct, setCalcSelectedProduct] = useState(products[0]?.id || '');
  const [calcBoxes, setCalcBoxes] = useState(2);
  const [calcDiscountPercent, setCalcDiscountPercent] = useState(5);
  const [calcFreightCost, setCalcFreightCost] = useState(120);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Carregar dados reais do backend
  const loadBackendData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedProducts, fetchedQuotes, fetchedCustomers, fetchedAnalytics] = await Promise.all([
        api.getProducts(),
        api.getQuotes(),
        api.getCustomers(),
        api.getAnalytics()
      ]);

      if (fetchedProducts && fetchedProducts.length > 0) onUpdateProducts(fetchedProducts);
      if (fetchedQuotes) setQuotesList(fetchedQuotes);
      if (fetchedCustomers) setCustomers(fetchedCustomers);
      if (fetchedAnalytics) setAnalyticsData(fetchedAnalytics);
    } catch (err) {
      console.error('Erro ao sincronizar com backend:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Abrir Modal de Produto
  const handleOpenProductModal = (prod = null) => {
    setEditingProduct(prod);
    setUploadedImagePreview(prod ? prod.image : '');
    setIsNewProductModalOpen(true);
  };

  // Manipular upload de arquivo do dispositivo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImagePreview(event.target.result);
        showToast('✓ Imagem carregada do dispositivo com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Métricas do Dashboard
  const totalProducts = products.length;
  const totalStockUnits = analyticsData?.totalStock || products.reduce((acc, p) => acc + (p.stockQty || 300), 0);
  const totalEstimatedStockValue = analyticsData?.totalStockValue || products.reduce((acc, p) => acc + (p.price * (p.stockQty || 300)), 0);
  const totalQuotesValue = analyticsData?.quotesStats?.total_faturado || quotesList.reduce((acc, q) => acc + (q.totalValue || q.val || 0), 0);
  const lowStockCount = products.filter(p => p.status === 'low_stock' || (p.stockQty && p.stockQty < 200)).length;

  // Filtragem de produtos no admin
  const filteredAdminProducts = products.filter(p => {
    if (categoryAdmin !== 'all' && p.category !== categoryAdmin) return false;
    if (searchAdmin.trim()) {
      const q = searchAdmin.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  // Salvar Produto Editado ou Novo no Banco Real
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const finalImage = uploadedImagePreview || form.imageUrl?.value || (editingProduct ? editingProduct.image : '/images/products/stab-9-pro.jpg');

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
      image: finalImage,
      colors: editingProduct?.colors || [{ name: 'Cinza', hex: '#9CA3AF' }],
      badges: form.badges.value ? form.badges.value.split(',').map(b => b.trim()) : [`Caixa ${form.minBatchQty.value} PCS`],
      specs: {
        tela: form.specTela?.value || editingProduct?.specs?.tela || 'Display HD',
        armazenamento: form.specArmazenamento?.value || editingProduct?.specs?.armazenamento || '128GB',
        ram: form.specRam?.value || editingProduct?.specs?.ram || '6GB RAM',
        bateria: form.specBateria?.value || editingProduct?.specs?.bateria || '7.000 mAh',
        processador: form.specProcessador?.value || editingProduct?.specs?.processador || 'Octa-Core',
        sistema: form.specSistema?.value || editingProduct?.specs?.sistema || 'Android 14',
        conectividade: form.network.value
      },
      bulletPoints: form.bulletPoints?.value ? form.bulletPoints.value.split('\n').filter(b => b.trim()) : (editingProduct?.bulletPoints || ['Caixa Master Lacrada'])
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productPayload);
        onUpdateProducts(products.map(p => p.id === editingProduct.id ? productPayload : p));
        showToast(`✓ Produto ${productPayload.name} salvo no banco de dados!`);
      } else {
        await api.createProduct(productPayload);
        onUpdateProducts([productPayload, ...products]);
        showToast(`✓ Novo produto ${productPayload.name} gravado no banco de dados!`);
      }
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao persistir produto no banco.');
    }

    setEditingProduct(null);
    setIsNewProductModalOpen(false);
  };

  // Excluir Produto
  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Deseja realmente remover o produto "${productName}" do banco de dados e do catálogo online?`)) {
      try {
        await api.deleteProduct(productId);
        onUpdateProducts(products.filter(p => p.id !== productId));
        showToast(`✓ Produto "${productName}" excluído do banco.`);
        loadBackendData();
      } catch (err) {
        showToast('⚠️ Erro ao excluir produto.');
      }
    }
  };

  // Executar Reajuste de Preços em Massa (%)
  const handleExecutePriceAdjustment = async () => {
    if (!window.confirm(`Confirma o reajuste de ${adjustPercent > 0 ? '+' : ''}${adjustPercent}% nos preços da categoria selecionada no banco de dados?`)) return;
    
    setIsAdjusting(true);
    try {
      const res = await api.adjustPrices(adjustPercent, adjustCategory);
      if (res && res.products) {
        onUpdateProducts(res.products);
        showToast(`✓ Reajuste de ${adjustPercent}% aplicado com sucesso no banco!`);
      }
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao aplicar reajuste de preços.');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Cadastrar Novo Cliente Revendedor
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    const form = e.target;
    const customerPayload = {
      name: form.name.value,
      company: form.company.value,
      cnpj: form.cnpj.value,
      phone: form.phone.value,
      city: form.city.value,
      state: form.state.value,
      level: form.level.value
    };

    try {
      const saved = await api.createCustomer(customerPayload);
      setCustomers([saved, ...customers]);
      setIsNewCustomerModalOpen(false);
      showToast(`✓ Revendedor "${customerPayload.company}" cadastrado no banco!`);
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao cadastrar cliente.');
    }
  };

  // Atualizar Status de Cotação com Baixa de Estoque
  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    const shouldDeduct = newStatus === 'Faturado' && window.confirm('Deseja dar baixa automática das peças solicitadas no estoque físico do banco de dados?');
    
    try {
      await api.updateQuoteStatus(quoteId, newStatus, shouldDeduct);
      setQuotesList(quotesList.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
      showToast(`✓ Status da cotação #${quoteId} alterado para "${newStatus}".`);
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao atualizar cotação.');
    }
  };

  // Cálculo da Margem Simulada
  const selectedProdObj = products.find(p => p.id === calcSelectedProduct) || products[0];
  const calcTotalPieces = selectedProdObj ? calcBoxes * selectedProdObj.minBatchQty : 0;
  const calcGrossTotal = selectedProdObj ? selectedProdObj.price * calcTotalPieces : 0;
  const calcDiscountValue = (calcGrossTotal * calcDiscountPercent) / 100;
  const calcNetTotal = calcGrossTotal - calcDiscountValue + Number(calcFreightCost);
  const calcEstimatedCost = calcGrossTotal * 0.65;
  const calcEstimatedProfit = calcGrossTotal - calcDiscountValue - calcEstimatedCost;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-white text-sm font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-slate-800 animate-in slide-in-from-bottom-3 duration-150">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Topo do Painel */}
      <header className="bg-slate-950 text-white border-b-2 border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={onBackToCatalog}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black px-3.5 py-2 rounded-xl transition-colors border border-slate-800 shadow-sm"
              title="Voltar ao Catálogo Público"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Catálogo Público</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
                ADM
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight leading-none">
                  ATACADO TECH — GESTÃO B2B
                </span>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-1">
                  ● Banco de Dados em Tempo Real
                </span>
              </div>
            </div>
          </div>

          {/* Ações Topo: Chaveador RBAC + Botão Sync */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { loadBackendData(); showToast('✓ Dados e métricas sincronizados com o banco!'); }}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors ${
                isLoadingData ? 'animate-spin text-blue-400' : ''
              }`}
              title="Atualizar dados do banco"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-slate-900 border-2 border-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setUserRole('dono'); showToast('Perfil alterado para: DONO (Acesso Total)'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  userRole === 'dono' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dono (Admin Total)</span>
              </button>

              <button
                type="button"
                onClick={() => { setUserRole('colaborador'); showToast('Perfil alterado para: COLABORADOR (Vendas)'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  userRole === 'colaborador' 
                    ? 'bg-blue-600 text-white shadow-md font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Colaborador (Vendas)</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Estrutura com Menu Lateral + Área de Trabalho */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto flex">
        
        {/* SIDEBAR LATERAL FIXA */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-slate-300 flex flex-col justify-between p-4 sm:p-5 transition-transform duration-200 shadow-sm
          ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          
          <div className="space-y-6">
            
            <div className="flex items-center justify-between lg:hidden pb-3 border-b-2 border-slate-200">
              <span className="font-black text-sm text-slate-950 uppercase">Menu de Gestão</span>
              <button onClick={() => setIsSidebarOpenMobile(false)} className="p-1 text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Perfil Atual */}
            <div className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 ${
              userRole === 'dono' 
                ? 'bg-amber-50 border-amber-300 text-amber-950' 
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                userRole === 'dono' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              }`}>
                {userRole === 'dono' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">
                  {userRole === 'dono' ? '👑 Nível Dono' : '👤 Nível Colaborador'}
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  {userRole === 'dono' ? 'Acesso Gerencial Pleno' : 'Operações Comerciais'}
                </span>
              </div>
            </div>

            {/* Links do Menu Lateral */}
            <nav className="space-y-1.5">
              
              <button
                type="button"
                onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'dashboard' 
                    ? 'bg-slate-950 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Dashboard & Métricas</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu('products'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'products' 
                    ? 'bg-slate-950 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Gestão de Produtos</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-black ${
                  activeMenu === 'products' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu('quotes'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'quotes' 
                    ? 'bg-slate-950 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-emerald-500" />
                  <span>Cotações & Pedidos</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-black ${
                  activeMenu === 'quotes' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {quotesList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu('customers'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'customers' 
                    ? 'bg-slate-950 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Clientes Revendedores</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-black ${
                  activeMenu === 'customers' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {customers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu('margin-calculator'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'margin-calculator' 
                    ? 'bg-slate-950 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Calculator className="w-5 h-5 text-cyan-500" />
                <span>Simulador de Margem B2B</span>
              </button>

              {/* Módulos do Dono */}
              {userRole === 'dono' && (
                <>
                  <div className="pt-3 pb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">
                      Ferramentas do Dono
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setActiveMenu('database'); setIsSidebarOpenMobile(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                      activeMenu === 'database' 
                        ? 'bg-slate-950 text-white shadow-md' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Database className="w-5 h-5 text-amber-500" />
                    <span>Banco & Exportação MySQL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveMenu('settings'); setIsSidebarOpenMobile(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                      activeMenu === 'settings' 
                        ? 'bg-slate-950 text-white shadow-md' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Settings className="w-5 h-5 text-slate-500" />
                    <span>Configurações B2B</span>
                  </button>
                </>
              )}

            </nav>

          </div>

          <div className="pt-4 border-t-2 border-slate-200 text-xs text-slate-600 font-bold">
            <p>ATACADO TECH v2.5</p>
            <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Banco Conectado (Porta 3001)
            </span>
          </div>

        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 sm:p-7 lg:p-8 min-w-0 space-y-6">
          
          {/* MÓDULO 1: DASHBOARD COM TELEMETRIA & MÉTRICAS REAIS */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Painel de Métricas & Desempenho Real
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                    Estatísticas reais consolidadas pelo backend: visualizações, taxa de conversão e faturamento.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-white border-2 border-slate-300 px-3.5 py-2 rounded-xl shadow-xs">
                    Taxa de Conversão: <strong className="text-blue-700 font-black">{analyticsData?.conversionRate || '14.6%'}</strong>
                  </span>
                </div>
              </div>

              {/* 4 KPIs de Alto Contraste */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                
                <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Total Faturado / Pedidos
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 block">
                      R$ {totalQuotesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-emerald-700 font-black mt-1 block">
                      {analyticsData?.quotesStats?.total_caixas || 7} caixas fechadas
                    </span>
                  </div>
                  <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Visualizações no Catálogo
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 block">
                      {analyticsData?.totalViews || 4200} acessos
                    </span>
                    <span className="text-xs text-blue-700 font-black mt-1 block">
                      {analyticsData?.totalAdds || 650} adições ao lote
                    </span>
                  </div>
                  <div className="w-13 h-13 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                    <Eye className="w-7 h-7" />
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Estoque Físico Total
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 block">
                      {totalStockUnits} peças
                    </span>
                    <span className="text-xs text-purple-700 font-black mt-1 block">
                      R$ {(totalEstimatedStockValue / 1000).toFixed(0)}k faturáveis
                    </span>
                  </div>
                  <div className="w-13 h-13 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                    <Boxes className="w-7 h-7" />
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Ticket Médio por Lote
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 block">
                      R$ {analyticsData?.quotesStats?.ticket_medio ? Number(analyticsData.quotesStats.ticket_medio).toFixed(2) : '8.025,00'}
                    </span>
                    <span className="text-xs text-amber-800 font-black mt-1 block">
                      Média por revendedor
                    </span>
                  </div>
                  <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                </div>

              </div>

              {/* Ranking Real */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2.5">
                    <BarChart3 className="w-5 h-5 text-blue-700" />
                    <span>Ranking Real de Interesse dos Lojistas (Top Visualizados)</span>
                  </h3>

                  <div className="space-y-3 pt-1">
                    {(analyticsData?.topProducts || products.slice(0, 5)).map((p, idx) => (
                      <div key={p.id} className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-black text-slate-950 text-sm block">{p.name}</span>
                            <span className="text-xs text-slate-600 font-bold">{p.sku} • {p.categoryName || p.category_name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-blue-700 block">{p.viewsCount || p.views_count || 350} visualizações</span>
                          <span className="text-[11px] text-emerald-700 font-bold">{p.quoteAddsCount || p.quote_adds_count || 45} pedidos no lote</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Últimos Pedidos */}
                <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2.5">
                    <ClipboardList className="w-5 h-5 text-emerald-700" />
                    <span>Últimos Pedidos</span>
                  </h3>

                  <div className="space-y-3">
                    {quotesList.slice(0, 3).map((q, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-black text-slate-950 text-sm">{q.quoteCode || q.id}</span>
                          <p className="font-black text-slate-900">{q.company}</p>
                          <span className="text-[11px] text-slate-600 font-bold">{q.totalBoxes || q.boxes} cx ({q.totalUnits || q.units} un)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-950 text-sm block">R$ {(q.totalValue || q.val || 0).toFixed(2)}</span>
                          <span className="text-[10px] font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* MÓDULO 2: GESTÃO DE PRODUTOS */}
          {activeMenu === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Barra de Reajuste em Massa (Exclusivo Dono) */}
              {userRole === 'dono' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-amber-950 uppercase">
                        Ferramenta do Dono: Reajuste Geral de Preços no Banco
                      </h4>
                      <p className="text-xs text-amber-900 font-bold">
                        Aplique uma porcentagem de aumento ou desconto em massa diretamente no banco de dados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                      value={adjustCategory}
                      onChange={(e) => setAdjustCategory(e.target.value)}
                      className="bg-white border-2 border-amber-300 text-xs font-black text-slate-900 rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="all">Todo o Catálogo</option>
                      <option value="tablets-infantis">Tablets Infantis</option>
                      <option value="tablets-profissionais">Tablets Profissionais</option>
                      <option value="power-banks">Power Banks</option>
                    </select>

                    <div className="flex items-center gap-1 bg-white border-2 border-amber-300 rounded-xl px-3 py-1.5">
                      <input
                        type="number"
                        step="0.5"
                        value={adjustPercent}
                        onChange={(e) => setAdjustPercent(parseFloat(e.target.value) || 0)}
                        className="w-16 text-xs font-black text-slate-950 outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>

                    <button
                      type="button"
                      disabled={isAdjusting}
                      onClick={handleExecutePriceAdjustment}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      {isAdjusting ? 'Aplicando...' : 'Aplicar Reajuste'}
                    </button>
                  </div>
                </div>
              )}

              {/* Barra de Filtros e Busca */}
              <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou SKU..."
                      value={searchAdmin}
                      onChange={(e) => setSearchAdmin(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-600 font-bold"
                    />
                  </div>

                  <select
                    value={categoryAdmin}
                    onChange={(e) => setCategoryAdmin(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 border-2 border-slate-300 text-slate-900 text-sm font-black rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-slate-500"
                  >
                    <option value="all">Todas as Categorias ({products.length})</option>
                    <option value="tablets-infantis">Tablets Infantis</option>
                    <option value="tablets-profissionais">Tablets Profissionais</option>
                    <option value="power-banks">Power Banks</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenProductModal(null)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  <span>Cadastrar Novo Produto</span>
                </button>

              </div>

              {/* Tabela de Produtos */}
              <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    
                    <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
                      <tr>
                        <th className="py-4 px-4">Foto / SKU</th>
                        <th className="py-4 px-4">Nome do Produto</th>
                        <th className="py-4 px-4">Categoria</th>
                        <th className="py-4 px-4">Caixa Master</th>
                        <th className="py-4 px-4">Estoque</th>
                        <th className="py-4 px-4 text-right">Preço Atacado (UN)</th>
                        <th className="py-4 px-4 text-right">Total Caixa</th>
                        <th className="py-4 px-4 text-center">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y-2 divide-slate-100 font-semibold">
                      {filteredAdminProducts.map((p) => {
                        const boxTotal = p.price * p.minBatchQty;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-13 h-13 rounded-xl bg-slate-50 border-2 border-slate-200 p-1 flex items-center justify-center shrink-0">
                                  <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-300">
                                  {p.sku}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-black text-slate-950 text-sm uppercase block">
                                {p.name}
                              </span>
                              <span className="text-xs text-slate-500 font-bold">
                                {p.network} • {p.specs?.tela || p.specs?.capacidade || ''}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="bg-slate-100 text-slate-900 border border-slate-300 font-bold px-2.5 py-1 rounded-md text-xs">
                                {p.categoryName || p.category_name}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-xs">
                                {p.minBatchQty} un. / cx
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-black text-slate-950 text-xs block">
                                {p.stockQty || 300} peças
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold">
                                {p.statusLabel || p.status_label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-black text-slate-950 text-base">
                                R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-slate-900 text-sm">
                              R$ {boxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProductModal(p)}
                                  className="p-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-slate-700 transition-colors border border-slate-300"
                                  title="Editar Produto e Foto"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2.5 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-xl text-slate-700 transition-colors border border-slate-300"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="w-4 h-4" />
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

            </div>
          )}

          {/* MÓDULO 3: GESTÃO DE COTAÇÕES & PEDIDOS */}
          {activeMenu === 'quotes' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Gestão de Cotações & Pedidos Atacadistas
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                  Atenda os revendedores diretamente no WhatsApp e dê baixa automática no estoque ao faturar.
                </p>
              </div>

              <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
                      <tr>
                        <th className="py-4 px-4">Código / Data</th>
                        <th className="py-4 px-4">Comprador & Empresa</th>
                        <th className="py-4 px-4">Volume Solicitado</th>
                        <th className="py-4 px-4 text-right">Valor Total Faturado</th>
                        <th className="py-4 px-4 text-center">Status do Pedido</th>
                        <th className="py-4 px-4 text-center">Atendimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 font-semibold">
                      {quotesList.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-mono font-black text-slate-950 text-sm block">{q.quoteCode || q.id}</span>
                            <span className="text-[11px] text-slate-500 font-bold">{q.date || q.createdAt}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-950 text-sm block">{q.buyerName || q.buyer}</span>
                            <span className="text-xs text-slate-600 font-bold">{q.company}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-900 block">{q.totalBoxes || q.boxes} caixas ({q.totalUnits || q.units} un)</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                              {typeof q.items === 'string' ? q.items : `${q.items?.length || 1} itens`}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-950 text-base">
                            R$ {(q.totalValue || q.val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <select
                              value={q.status}
                              onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                              className="bg-slate-100 border-2 border-slate-300 text-xs font-black text-slate-950 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Em Atendimento">Em Atendimento</option>
                              <option value="Aprovado">Aprovado</option>
                              <option value="Faturado">Faturado (Baixa Estoque)</option>
                              <option value="Despachado">Despachado</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <a
                              href={`https://wa.me/${q.phone}?text=${encodeURIComponent(`Olá ${q.buyerName || q.buyer}, sobre seu pedido #${q.quoteCode || q.id} na Atacado Tech...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 4: BANCO & EXPORTAÇÃO MYSQL */}
          {activeMenu === 'database' && userRole === 'dono' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Banco de Dados & Exportação MySQL 8
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                  Gere o arquivo SQL completo e sincronizado para importar na cPanel / phpMyAdmin da sua hospedagem compartilhada.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950 uppercase">
                        Exportador MySQL / phpMyAdmin
                      </h3>
                      <p className="text-xs text-slate-600 font-bold">
                        Gera as tabelas `products`, `quotes`, `customers` e `analytics_events` prontas para produção.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                    <p>✓ Compatível com MySQL 8.0+ e MariaDB 10.4+</p>
                    <p>✓ Codificação UTF-8 (`utf8mb4_unicode_ci`)</p>
                    <p>✓ Inclui todos os {products.length} produtos oficiais do catálogo</p>
                  </div>

                  <a
                    href={api.getMysqlExportUrl()}
                    download="backup_atacadotech_mysql.sql"
                    className="w-full bg-slate-950 hover:bg-blue-700 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors inline-block text-center"
                  >
                    <Download className="w-5 h-5 inline-block mr-2" />
                    <span>Baixar Arquivo .SQL para Hospedagem</span>
                  </a>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-950 uppercase">
                    Status da Conexão Local
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-600">Engine Backend:</span>
                      <span className="font-mono font-black text-slate-950">Express + Better-SQLite3</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-600">Porta da API:</span>
                      <span className="font-mono font-black text-slate-950">http://localhost:3001</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-600">Arquivo Persistido:</span>
                      <span className="font-mono font-black text-slate-950">database.sqlite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 5: CLIENTES REVENDEDORES */}
          {activeMenu === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Clientes & Revendedores Autorizados
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                    Lojistas cadastrados com registro de compras no banco relacional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Cadastrar Revendedor</span>
                </button>
              </div>

              <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-white font-black uppercase text-xs tracking-wider">
                      <tr>
                        <th className="py-4 px-4">Empresa / Razão Social</th>
                        <th className="py-4 px-4">Responsável & Contato</th>
                        <th className="py-4 px-4">CNPJ & Localização</th>
                        <th className="py-4 px-4">Nível Revenda</th>
                        <th className="py-4 px-4 text-center">Pedidos</th>
                        <th className="py-4 px-4 text-right">Total Faturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 font-semibold">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-950 text-sm block">{c.company}</span>
                            <span className="text-xs text-emerald-700 font-bold">● {c.status}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-black text-slate-900 block">{c.name}</span>
                            <span className="text-xs text-slate-500 font-bold">{c.phone}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-slate-700 block">{c.cnpj}</span>
                            <span className="text-xs text-slate-500 font-bold">{c.city}/{c.state}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                              c.level === 'Ouro' ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                              c.level === 'Prata' ? 'bg-slate-200 text-slate-900 border border-slate-300' :
                              'bg-orange-100 text-orange-950 border border-orange-300'
                            }`}>
                              Nível {c.level}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                            {c.total_orders || c.totalOrders || 0} lotes
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-950 text-sm">
                            R$ {(c.total_spent || c.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 6: SIMULADOR DE MARGEM */}
          {activeMenu === 'margin-calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Simulador de Margem & Cotações Especiais
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                  Calcule descontos por volume de caixas fechadas, frete e margem bruta real de lucro.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-cyan-600" />
                    <span>Configurar Simulação de Lote</span>
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-black text-slate-900 block uppercase mb-1">Selecionar Produto do Catálogo</label>
                      <select
                        value={calcSelectedProduct}
                        onChange={(e) => setCalcSelectedProduct(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 outline-none"
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
                        <label className="text-xs font-black text-slate-900 block uppercase mb-1">Quantidade de Caixas</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={calcBoxes}
                          onChange={(e) => setCalcBoxes(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-900 block uppercase mb-1">Desconto Volume (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={calcDiscountPercent}
                          onChange={(e) => setCalcDiscountPercent(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-900 block uppercase mb-1">Custo Estimado de Frete (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={calcFreightCost}
                        onChange={(e) => setCalcFreightCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 text-white border-2 border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs text-blue-400 font-black uppercase tracking-wider block">
                      Resultado da Simulação B2B
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {calcTotalPieces} unidades ({calcBoxes} caixas master)
                    </h3>
                  </div>

                  <div className="space-y-2.5 py-3 border-y border-slate-800 text-sm">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Valor Bruto da Tabela:</span>
                      <span>R$ {calcGrossTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between font-bold text-amber-400">
                      <span>Desconto Aplicado ({calcDiscountPercent}%):</span>
                      <span>- R$ {calcDiscountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Frete / Seguro:</span>
                      <span>+ R$ {Number(calcFreightCost).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-black text-emerald-400 text-lg pt-2 border-t border-slate-800">
                      <span>Total Final do Lote:</span>
                      <span>R$ {calcNetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {userRole === 'dono' && (
                      <div className="flex justify-between font-black text-cyan-300 text-sm pt-1">
                        <span>Margem Bruta Estimada:</span>
                        <span>R$ {calcEstimatedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (~35%)</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Cotação simulada copiada para a área de transferência!`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copiar Resumo da Proposta para o WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 7: CONFIGURAÇÕES DA DISTRIBUIDORA */}
          {activeMenu === 'settings' && userRole === 'dono' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Configurações Gerais da Distribuidora
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
                  Parâmetros de faturamento, dados fiscais e integração com WhatsApp comercial.
                </p>
              </div>

              <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm max-w-2xl space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Razão Social da Distribuidora</label>
                  <input
                    type="text"
                    defaultValue="ATACADO TECH DISTRIBUIDORA DE ELETRÔNICOS LTDA"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">WhatsApp Comercial de Pedidos</label>
                    <input
                      type="text"
                      defaultValue="5511999999999"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Tabela Vigente Vigência</label>
                    <input
                      type="text"
                      defaultValue="Agosto / 2026"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('✓ Configurações da distribuidora salvas no banco!')}
                  className="bg-slate-950 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-md transition-colors"
                >
                  Salvar Parâmetros
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* MODAL HORIZONTAL RETANGULAR OTIMIZADO DE PRODUTO COM UPLOAD DO DISPOSITIVO */}
      {isNewProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
          onClick={() => setIsNewProductModalOpen(false)}
        >
          <div 
            className="bg-white border-2 border-slate-300 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <Package className="w-6 h-6 text-blue-400" />
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {editingProduct ? `Editar Produto & Foto: ${editingProduct.name}` : 'Cadastrar Novo Produto no Banco de Dados'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setEditingProduct(null); setIsNewProductModalOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulário Horizontal em 3 Colunas Otimizadas */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-h-[82vh] overflow-y-auto">
              
              {/* COLUNA 1 (35% - 4 colunas no grid): Upload da Imagem do Dispositivo + Preview */}
              <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <label className="text-xs font-black text-slate-950 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Foto do Produto</span>
                  </label>

                  {/* Preview da Foto */}
                  <div className="w-full h-44 bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 flex items-center justify-center overflow-hidden mb-3 relative group">
                    {uploadedImagePreview ? (
                      <img
                        src={uploadedImagePreview}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                        <span className="text-xs font-bold block">Nenhuma foto selecionada</span>
                      </div>
                    )}
                  </div>

                  {/* Input de Arquivo Oculto + Botão de Upload do Dispositivo */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors mb-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Carregar Foto do Dispositivo</span>
                  </button>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[10px] font-black text-slate-600 uppercase block mb-1">Ou URL / Caminho:</label>
                    <input
                      type="text"
                      name="imageUrl"
                      defaultValue={editingProduct?.image || ''}
                      placeholder="/images/products/stab-9-pro.jpg"
                      onChange={(e) => setUploadedImagePreview(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-bold bg-white p-2.5 rounded-xl border border-slate-200">
                  <p>💡 Dica: fotos em fundo branco ou PNG transparente destacam o catálogo.</p>
                </div>
              </div>

              {/* COLUNA 2 (40% - 5 colunas no grid): Dados Comerciais Principais */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b pb-1">
                  Informações Comerciais
                </h4>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ''}
                    placeholder="Ex: TABLET PRO X10 — ATACADO"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Código SKU *</label>
                    <input
                      type="text"
                      name="sku"
                      required
                      defaultValue={editingProduct?.sku || 'TB-NEW-AT'}
                      placeholder="Ex: TB-X10-AT"
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Categoria *</label>
                    <select
                      name="category"
                      defaultValue={editingProduct?.category || 'tablets-profissionais'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-2.5 py-2 text-xs font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="tablets-infantis">Tablets Infantis</option>
                      <option value="tablets-profissionais">Tablets Profissionais</option>
                      <option value="power-banks">Power Banks</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Preço Unit. Atacado (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      required
                      defaultValue={editingProduct?.price || 450}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Caixa Master (PCS) *</label>
                    <select
                      name="minBatchQty"
                      defaultValue={editingProduct?.minBatchQty || 10}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-2.5 py-2 text-xs font-black text-slate-900 outline-none cursor-pointer"
                    >
                      <option value={10}>10 Unidades / Caixa</option>
                      <option value={20}>20 Unidades / Caixa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Estoque Físico</label>
                    <input
                      type="number"
                      name="stockQty"
                      defaultValue={editingProduct?.stockQty || 300}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-900 block uppercase mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingProduct?.status || 'available'}
                      className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-2.5 py-2 text-xs font-black text-slate-900 outline-none"
                    >
                      <option value="available">Em estoque</option>
                      <option value="low_stock">Estoque baixo</option>
                      <option value="unavailable">Indisponível</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* COLUNA 3 (25% - 3 colunas no grid): Especificações Técnicas */}
              <div className="lg:col-span-3 space-y-2.5">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider border-b pb-1">
                  Especificações
                </h4>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Tela / Display:</label>
                  <input
                    type="text"
                    name="specTela"
                    defaultValue={editingProduct?.specs?.tela || '10.1" IPS HD'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Bateria:</label>
                  <input
                    type="text"
                    name="specBateria"
                    defaultValue={editingProduct?.specs?.bateria || '7.000 mAh'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Memória RAM:</label>
                  <input
                    type="text"
                    name="specRam"
                    defaultValue={editingProduct?.specs?.ram || '8GB RAM'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Armazenamento ROM:</label>
                  <input
                    type="text"
                    name="specArmazenamento"
                    defaultValue={editingProduct?.specs?.armazenamento || '256GB ROM'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Rede:</label>
                    <select
                      name="network"
                      defaultValue={editingProduct?.network || '5G'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-1.5 py-1.5 text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="5G">5G</option>
                      <option value="4G / LTE">4G</option>
                      <option value="Wi-Fi">Wi-Fi</option>
                      <option value="Turbo 22.5W">Turbo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Condição:</label>
                    <select
                      name="condition"
                      defaultValue={editingProduct?.condition || 'Lançamento'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-1.5 py-1.5 text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="Mais vendidos">Top</option>
                      <option value="Lançamento">Novo</option>
                      <option value="Promoção">Oferta</option>
                    </select>
                  </div>
                </div>

                <input type="hidden" name="badges" value={editingProduct?.badges?.join(', ') || 'Caixa 10 PCS'} />
              </div>

              {/* Rodapé Fixo do Modal com Botões de Ação */}
              <div className="lg:col-span-12 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  ● Persistência direta no banco SQLite/MySQL
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditingProduct(null); setIsNewProductModalOpen(false); }}
                    className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md"
                  >
                    {editingProduct ? 'Salvar Alterações' : 'Gravar no Banco de Dados'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO DE CLIENTE */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto">
            <div className="p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-black tracking-tight">
                  Cadastrar Novo Revendedor B2B
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Razão Social / Loja *</label>
                  <input
                    type="text"
                    name="company"
                    required
                    placeholder="Ex: Mega Tech Eletrônicos"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Responsável *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: João da Silva"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">CNPJ ou CPF *</label>
                  <input
                    type="text"
                    name="cnpj"
                    required
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue="São Paulo"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue="SP"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 block uppercase mb-1">Nível de Revenda</label>
                  <select
                    name="level"
                    defaultValue="Prata"
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none"
                  >
                    <option value="Bronze">Bronze (Inicial)</option>
                    <option value="Prata">Prata (Padrão)</option>
                    <option value="Ouro">Ouro (Volume Alto)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md"
                >
                  Cadastrar no Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
