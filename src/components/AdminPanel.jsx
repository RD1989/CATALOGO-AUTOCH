import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ClipboardList, 
  Users, 
  Calculator, 
  Database, 
  Settings, 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Menu, 
  X, 
  Check, 
  Layers,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';

// Submódulos em Abas
import DashboardTab from './admin/tabs/DashboardTab';
import ProductsTab from './admin/tabs/ProductsTab';
import QuotesTab from './admin/tabs/QuotesTab';
import CustomersTab from './admin/tabs/CustomersTab';
import MarginSimulatorTab from './admin/tabs/MarginSimulatorTab';
import DatabaseTab from './admin/tabs/DatabaseTab';
import SettingsTab from './admin/tabs/SettingsTab';

// Modais Especializados
import ProductFormModal from './admin/modals/ProductFormModal';
import CustomerFormModal from './admin/modals/CustomerFormModal';
import ConfirmDialog from './admin/modals/ConfirmDialog';
import PriceAdjustmentModal from './admin/modals/PriceAdjustmentModal';

export default function AdminPanel({
  products,
  onUpdateProducts,
  onBackToCatalog
}) {
  // Controle de Perfil e Navegação
  const [userRole, setUserRole] = useState('dono'); // 'dono' | 'colaborador'
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Estados com persistência real do Backend
  const [quotesList, setQuotesList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modais de Controle
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPriceAdjustmentOpen, setIsPriceAdjustmentOpen] = useState(false);
  const [isAdjustingPrices, setIsAdjustingPrices] = useState(false);

  // Modal de Confirmação Genérico
  const [confirmDialogData, setConfirmDialogData] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    isDestructive: false,
    onConfirm: () => {}
  });

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

  // 1. Salvar Produto (Novo ou Editado)
  const handleSaveProduct = async (productPayload) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productPayload);
        onUpdateProducts(products.map(p => p.id === editingProduct.id ? productPayload : p));
        showToast(`✓ Produto "${productPayload.name}" salvo no banco!`);
      } else {
        await api.createProduct(productPayload);
        onUpdateProducts([productPayload, ...products]);
        showToast(`✓ Novo produto "${productPayload.name}" cadastrado!`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao persistir produto.');
    }
  };

  // 2. Solicitar Exclusão de Produto (via ConfirmDialog)
  const handleRequestDeleteProduct = (productId, productName) => {
    setConfirmDialogData({
      isOpen: true,
      title: 'Excluir Produto',
      message: `Deseja realmente remover o produto "${productName}" do banco de dados e do catálogo online?`,
      confirmLabel: 'Sim, Excluir',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.deleteProduct(productId);
          onUpdateProducts(products.filter(p => p.id !== productId));
          showToast(`✓ Produto "${productName}" excluído com sucesso.`);
          setConfirmDialogData(prev => ({ ...prev, isOpen: false }));
          loadBackendData();
        } catch (err) {
          showToast('⚠️ Erro ao excluir produto.');
        }
      }
    });
  };

  // 3. Executar Reajuste de Preços em Massa (%)
  const handleExecutePriceAdjustment = async (percent, category) => {
    setIsAdjustingPrices(true);
    try {
      const res = await api.adjustPrices(percent, category);
      if (res && res.products) {
        onUpdateProducts(res.products);
        showToast(`✓ Preços reajustados em ${percent}% com sucesso!`);
      }
      setIsPriceAdjustmentOpen(false);
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao aplicar reajuste de preços.');
    } finally {
      setIsAdjustingPrices(false);
    }
  };

  // 4. Salvar Novo Cliente Revendedor
  const handleSaveCustomer = async (customerPayload) => {
    try {
      const saved = await api.createCustomer(customerPayload);
      setCustomers([saved, ...customers]);
      setIsCustomerModalOpen(false);
      showToast(`✓ Revendedor "${customerPayload.company}" cadastrado!`);
      loadBackendData();
    } catch (err) {
      showToast('⚠️ Erro ao cadastrar cliente.');
    }
  };

  // 5. Atualizar Status de Cotação com Baixa de Estoque
  const handleUpdateQuoteStatus = (quoteId, newStatus) => {
    if (newStatus === 'Faturado') {
      setConfirmDialogData({
        isOpen: true,
        title: 'Faturar Pedido & Baixa de Estoque',
        message: 'Deseja faturar este pedido e dar baixa automática das peças solicitadas no estoque físico do banco de dados?',
        confirmLabel: 'Faturar e Baixar Estoque',
        isDestructive: false,
        onConfirm: async () => {
          try {
            await api.updateQuoteStatus(quoteId, newStatus, true);
            setQuotesList(quotesList.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
            showToast(`✓ Pedido faturado e estoque atualizado!`);
            setConfirmDialogData(prev => ({ ...prev, isOpen: false }));
            loadBackendData();
          } catch (err) {
            showToast('⚠️ Erro ao atualizar status.');
          }
        }
      });
    } else {
      api.updateQuoteStatus(quoteId, newStatus, false).then(() => {
        setQuotesList(quotesList.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
        showToast(`✓ Status alterado para "${newStatus}".`);
        loadBackendData();
      });
    }
  };

  // Métricas Consolidadas
  const totalStockUnits = analyticsData?.totalStock || products.reduce((acc, p) => acc + (p.stockQty || 300), 0);
  const totalEstimatedStockValue = analyticsData?.totalStockValue || products.reduce((acc, p) => acc + (p.price * (p.stockQty || 300)), 0);
  const totalQuotesValue = analyticsData?.quotesStats?.total_faturado || quotesList.reduce((acc, q) => acc + (q.totalValue || q.val || 0), 0);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-white text-sm font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-slate-800 animate-in slide-in-from-bottom-3 duration-150">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Topo / Header do Painel */}
      <header className="bg-slate-950 text-white border-b-2 border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
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

          {/* Ações Topo: Sincronização & Chaveador RBAC */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { loadBackendData(); showToast('✓ Dados sincronizados com o banco!'); }}
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
                onClick={() => { setUserRole('dono'); showToast('Perfil: DONO (Acesso Pleno)'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  userRole === 'dono' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dono (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => { setUserRole('colaborador'); showToast('Perfil: COLABORADOR (Vendas)'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  userRole === 'colaborador' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Colaborador</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Estrutura Principal: Sidebar + Conteúdo */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto flex">
        
        {/* Sidebar Lateral */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r-2 border-slate-300 flex flex-col justify-between p-4 sm:p-5 transition-transform duration-200 shadow-sm
          ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-6">
            <div className="flex items-center justify-between lg:hidden pb-3 border-b-2 border-slate-200">
              <span className="font-black text-sm text-slate-950 uppercase">Menu de Gestão</span>
              <button type="button" onClick={() => setIsSidebarOpenMobile(false)} className="p-1 text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Card de Perfil */}
            <div className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 ${
              userRole === 'dono' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                userRole === 'dono' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-blue-600 text-white shadow-sm'
              }`}>
                {userRole === 'dono' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider">
                  {userRole === 'dono' ? '👑 Nível Dono' : '👤 Colaborador'}
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  {userRole === 'dono' ? 'Acesso Gerencial Pleno' : 'Vendas & Catálogo'}
                </span>
              </div>
            </div>

            {/* Menu Categorizado */}
            <nav className="space-y-1.5">
              
              <button
                type="button"
                onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'dashboard' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Dashboard & Métricas</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu('products'); setIsSidebarOpenMobile(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                  activeMenu === 'products' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
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
                  activeMenu === 'quotes' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
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
                  activeMenu === 'customers' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
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
                  activeMenu === 'margin-calculator' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-5 h-5 text-cyan-500" />
                <span>Simulador de Margem B2B</span>
              </button>

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
                      activeMenu === 'database' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Database className="w-5 h-5 text-amber-500" />
                    <span>Banco & Exportação MySQL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveMenu('settings'); setIsSidebarOpenMobile(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all text-left ${
                      activeMenu === 'settings' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
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
            <p>ATACADO TECH v3.0 (Modular)</p>
            <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Banco Conectado (Porta 3001)
            </span>
          </div>
        </aside>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-4 sm:p-7 lg:p-8 min-w-0 space-y-6">
          
          {activeMenu === 'dashboard' && (
            <DashboardTab
              products={products}
              quotesList={quotesList}
              analyticsData={analyticsData}
              totalStockUnits={totalStockUnits}
              totalEstimatedStockValue={totalEstimatedStockValue}
              totalQuotesValue={totalQuotesValue}
              onNavigateToTab={setActiveMenu}
            />
          )}

          {activeMenu === 'products' && (
            <ProductsTab
              products={products}
              userRole={userRole}
              onOpenProductModal={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
              onRequestDeleteProduct={handleRequestDeleteProduct}
              onOpenPriceAdjustmentModal={() => setIsPriceAdjustmentOpen(true)}
              showToast={showToast}
            />
          )}

          {activeMenu === 'quotes' && (
            <QuotesTab
              quotesList={quotesList}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
            />
          )}

          {activeMenu === 'customers' && (
            <CustomersTab
              customers={customers}
              onOpenNewCustomerModal={() => setIsCustomerModalOpen(true)}
            />
          )}

          {activeMenu === 'margin-calculator' && (
            <MarginSimulatorTab
              products={products}
              userRole={userRole}
              showToast={showToast}
            />
          )}

          {activeMenu === 'database' && userRole === 'dono' && (
            <DatabaseTab products={products} />
          )}

          {activeMenu === 'settings' && userRole === 'dono' && (
            <SettingsTab showToast={showToast} />
          )}

        </main>
      </div>

      {/* MODAIS REUTILIZÁVEIS */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        showToast={showToast}
      />

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <PriceAdjustmentModal
        isOpen={isPriceAdjustmentOpen}
        onClose={() => setIsPriceAdjustmentOpen(false)}
        onExecute={handleExecutePriceAdjustment}
        isAdjusting={isAdjustingPrices}
      />

      <ConfirmDialog
        isOpen={confirmDialogData.isOpen}
        title={confirmDialogData.title}
        message={confirmDialogData.message}
        confirmLabel={confirmDialogData.confirmLabel}
        isDestructive={confirmDialogData.isDestructive}
        onConfirm={confirmDialogData.onConfirm}
        onCancel={() => setConfirmDialogData(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
