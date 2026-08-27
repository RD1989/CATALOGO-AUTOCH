import React, { useState, useMemo, useRef, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SidebarFilters from './components/SidebarFilters';
import ProductCardGrid from './components/ProductCardGrid';
import ProductCardHorizontal from './components/ProductCardHorizontal';
import ProductTableList from './components/ProductTableList';
import ProductDetailModal from './components/ProductDetailModal';
import BatchDrawer from './components/BatchDrawer';
import TrustBar from './components/TrustBar';
import MobileBottomNav from './components/MobileBottomNav';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';

import { PRODUCTS, CATEGORIES } from './data/products';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'admin'
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [productsList, setProductsList] = useState(PRODUCTS);

  // Settings do backend (WhatsApp, data da tabela)
  const [settings, setSettings] = useState({
    company_whatsapp: '5511999999999',
    current_table_date: 'Agosto / 2026'
  });

  // Autenticação do painel admin
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    // Verifica se já existe uma sessão ativa
    return !!sessionStorage.getItem('admin_token');
  });

  // Sincronização com o Backend SQLite em Tempo Real
  useEffect(() => {
    async function loadLiveData() {
      try {
        const health = await api.checkHealth();
        if (health && health.status === 'healthy') {
          setIsServerOnline(true);

          // Carregar produtos e settings em paralelo
          const [liveProducts, liveSettings] = await Promise.all([
            api.getProducts(),
            api.getSettings()
          ]);

          if (liveProducts && liveProducts.length > 0) {
            setProductsList(liveProducts);
          }
          if (liveSettings) {
            setSettings(prev => ({ ...prev, ...liveSettings }));
          }
        } else {
          setIsServerOnline(false);
        }
      } catch (err) {
        console.warn('Backend offline, operando em modo catálogo local.');
        setIsServerOnline(false);
      }
    }
    loadLiveData();
  }, []);

  // Estados de Filtros e Visualização
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('mais-vendidos');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filtros Avançados
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [stockFilter, setStockFilter] = useState('all');
  const [networkFilter, setNetworkFilter] = useState([]);
  const [conditionFilter, setConditionFilter] = useState([]);
  const [colorFilter, setColorFilter] = useState([]);
  const [minBatchFilter, setMinBatchFilter] = useState([]);

  // Modais e Drawers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Meu Lote Comercial (Persistido no LocalStorage)
  const [batchItems, setBatchItems] = useState(() => {
    try {
      const saved = localStorage.getItem('atacado_batch_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atacado_batch_items', JSON.stringify(batchItems));
    } catch (e) {
      console.warn('Erro ao salvar lote no localStorage:', e);
    }
  }, [batchItems]);

  const searchInputRef = useRef(null);

  // Abrir Admin — protegido por autenticação
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = (token) => {
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
    setCurrentView('admin');
  };

  // Abrir Detalhes com Rastreamento de Telemetria
  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    if (product) {
      api.trackEvent('product_view', {
        productId: product.id,
        sku: product.sku,
        category: product.category,
        metadata: { name: product.name, price: product.price }
      });
    }
  };

  // Adicionar ao Lote (Por Unidade ou Caixa) com Telemetria
  const handleAddToBatch = (product, selectedColor, quantityToAdd = 1) => {
    const color = selectedColor || product.colors?.[0]?.name || 'Padrão';
    const qty = Math.max(1, parseInt(quantityToAdd) || 1);

    api.trackEvent('add_to_batch', {
      productId: product.id,
      sku: product.sku,
      category: product.category,
      metadata: { name: product.name, quantity: qty, color }
    });

    setBatchItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prev, { ...product, selectedColor: color, quantity: qty }];
      }
    });
  };

  const handleUpdateBatchQty = (productId, color, newQty) => {
    const qty = parseInt(newQty) || 0;
    if (qty <= 0) {
      handleRemoveBatchItem(productId, color);
      return;
    }
    setBatchItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedColor === color) {
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const handleRemoveBatchItem = (productId, color) => {
    setBatchItems(prev => prev.filter(item => !(item.id === productId && item.selectedColor === color)));
  };

  const handleResetFilters = () => {
    setPriceRange([0, 1000]);
    setStockFilter('all');
    setNetworkFilter([]);
    setConditionFilter([]);
    setColorFilter([]);
    setMinBatchFilter([]);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Filtragem dos Produtos em Tempo Real — todos os filtros conectados
  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      // Categoria
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;

      // Busca por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchSpecs = Object.values(product.specs || {}).some(val =>
          String(val).toLowerCase().includes(q)
        );
        if (!matchName && !matchSku && !matchSpecs) return false;
      }

      // Faixa de preço
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

      // Conectividade / Rede
      if (networkFilter.length > 0 && !networkFilter.includes(product.network)) return false;

      // Cor
      if (colorFilter.length > 0) {
        const productColors = product.colors?.map(c => c.name) || [];
        if (!colorFilter.some(c => productColors.includes(c))) return false;
      }

      // Status de estoque
      if (stockFilter !== 'all' && product.status !== stockFilter) return false;

      // Condição (Lançamento, Mais vendidos, Promoção)
      if (conditionFilter.length > 0 && !conditionFilter.includes(product.condition)) return false;

      // Tamanho mínimo do lote
      if (minBatchFilter.length > 0) {
        const batchStr = String(product.minBatchQty || 10);
        if (!minBatchFilter.some(f => String(f) === batchStr)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'menor-preco') return a.price - b.price;
      if (sortBy === 'maior-preco') return b.price - a.price;
      if (sortBy === 'lancamentos') return a.condition === 'Lançamento' ? -1 : 1;
      if (sortBy === 'mais-vendidos') {
        const aAdds = a.quoteAddsCount || a.quote_adds_count || 0;
        const bAdds = b.quoteAddsCount || b.quote_adds_count || 0;
        return bAdds - aAdds;
      }
      return 0;
    });
  }, [
    productsList, selectedCategory, searchQuery, priceRange,
    networkFilter, colorFilter, sortBy, stockFilter, conditionFilter, minBatchFilter
  ]);

  // Contadores
  const totalUnits = batchItems.reduce((acc, item) => acc + item.quantity, 0);
  const batchCount = batchItems.length;
  const batchTotal = batchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Contagem real de todos os filtros ativos
  const activeFilterCount =
    networkFilter.length +
    colorFilter.length +
    (searchQuery ? 1 : 0) +
    (stockFilter !== 'all' ? 1 : 0) +
    (conditionFilter.length > 0 ? 1 : 0) +
    (minBatchFilter.length > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  // Se o usuário alternou para o Painel Administrativo
  if (currentView === 'admin') {
    return (
      <AdminPanel
        products={productsList}
        onUpdateProducts={setProductsList}
        onBackToCatalog={() => setCurrentView('catalog')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">

      {/* Cabeçalho do Catálogo Oficial */}
      <Header
        batchCount={batchCount}
        batchUnits={totalUnits}
        batchTotal={batchTotal}
        onOpenBatch={() => setIsBatchOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        searchInputRef={searchInputRef}
        onOpenAdmin={handleOpenAdmin}
        isServerOnline={isServerOnline}
        products={productsList}
        tableDate={settings.current_table_date}
      />

      {/* Área Principal do Catálogo */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">

        {/* Banner Hero Comercial */}
        <HeroSection
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalItemsCount={filteredProducts.length}
        />

        {/* Estrutura: Filtros Laterais + Portfólio de Produtos */}
        <div className="flex items-start gap-6 lg:gap-8">

          {/* Sidebar de Filtros */}
          <SidebarFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            networkFilter={networkFilter}
            setNetworkFilter={setNetworkFilter}
            conditionFilter={conditionFilter}
            setConditionFilter={setConditionFilter}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            minBatchFilter={minBatchFilter}
            setMinBatchFilter={setMinBatchFilter}
            onResetFilters={handleResetFilters}
            isMobileDrawerOpen={isMobileFiltersOpen}
            onCloseMobileDrawer={() => setIsMobileFiltersOpen(false)}
            filteredCount={filteredProducts.length}
          />

          {/* Listagem de Produtos (Grade ou Tabela) */}
          <div className="flex-1 min-w-0">

            {filteredProducts.length === 0 ? (
              <div className="bg-white border-2 border-slate-300 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto text-slate-500 font-black text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-black text-slate-950">Nenhum produto encontrado com os filtros atuais</h3>
                <p className="text-xs text-slate-600 font-bold max-w-sm mx-auto">
                  Tente limpar os filtros para ver todos os {productsList.length} modelos disponíveis.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-slate-950 text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCardGrid
                    key={product.id}
                    product={product}
                    onAddToBatch={handleAddToBatch}
                    onQuickView={handleOpenQuickView}
                  />
                ))}
              </div>
            ) : (
              <ProductTableList
                products={filteredProducts}
                onAddToBatch={handleAddToBatch}
                onQuickView={handleOpenQuickView}
              />
            )}

          </div>

        </div>

      </main>

      {/* Barra de Pilares de Confiança & Rodapé B2B */}
      <TrustBar />

      {/* Barra de Ações Rápidas no Rodapé Mobile */}
      <MobileBottomNav
        onOpenBatch={() => setIsBatchOpen(true)}
        batchCount={batchCount}
        batchUnits={totalUnits}
        batchTotal={batchTotal}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        onFocusSearch={() => searchInputRef.current?.focus()}
        onResetCategory={() => setSelectedCategory('all')}
        currentCategory={selectedCategory}
      />

      {/* Modal de Login do Admin */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Modal Quadrado de Detalhes / Ficha Técnica */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToBatch={handleAddToBatch}
        />
      )}

      {/* Drawer Lateral de Fechamento do Lote de Compras */}
      <BatchDrawer
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        batchItems={batchItems}
        onUpdateQty={handleUpdateBatchQty}
        onRemoveItem={handleRemoveBatchItem}
        onAddToBatch={handleAddToBatch}
        whatsappNumber={settings.company_whatsapp}
      />

    </div>
  );
}
