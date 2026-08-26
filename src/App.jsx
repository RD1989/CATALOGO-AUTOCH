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

import { PRODUCTS, CATEGORIES } from './data/products';

export default function App() {
  const [productsList, setProductsList] = useState(PRODUCTS);

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

  // Adicionar ao Lote (Por Unidade ou Caixa)
  const handleAddToBatch = (product, selectedColor, quantityToAdd = 1) => {
    const color = selectedColor || product.colors?.[0]?.name || 'Padrão';
    const qty = Math.max(1, parseInt(quantityToAdd) || 1);

    setBatchItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.selectedColor === color);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prev, {
          ...product,
          selectedColor: color,
          quantity: qty
        }];
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

  // Filtragem dos Produtos em Tempo Real
  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchSpecs = Object.values(product.specs || {}).some(val => 
          String(val).toLowerCase().includes(q)
        );
        if (!matchName && !matchSku && !matchSpecs) return false;
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      if (networkFilter.length > 0 && !networkFilter.includes(product.network)) {
        return false;
      }

      if (colorFilter.length > 0) {
        const productColors = product.colors?.map(c => c.name) || [];
        const hasColor = colorFilter.some(c => productColors.includes(c));
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'menor-preco') return a.price - b.price;
      if (sortBy === 'maior-preco') return b.price - a.price;
      if (sortBy === 'lancamentos') return a.condition === 'Lançamento' ? -1 : 1;
      return 0;
    });
  }, [
    productsList, 
    selectedCategory, 
    searchQuery, 
    priceRange, 
    networkFilter, 
    colorFilter, 
    sortBy
  ]);

  // Contadores
  const totalUnits = batchItems.reduce((acc, item) => acc + item.quantity, 0);
  const batchCount = batchItems.length;
  const batchTotal = batchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const activeFilterCount = (networkFilter.length) + (colorFilter.length) + (searchQuery ? 1 : 0);

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
                  Tente limpar os filtros de preço ou categoria para ver todos os 10 modelos disponíveis.
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
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <ProductTableList
                products={filteredProducts}
                onAddToBatch={handleAddToBatch}
                onQuickView={setQuickViewProduct}
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
      />

    </div>
  );
}
