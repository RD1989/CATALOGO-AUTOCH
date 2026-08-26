import React from 'react';
import { 
  Gamepad2, 
  Laptop, 
  BatteryCharging, 
  Award, 
  TableProperties, 
  LayoutGrid, 
  Layers,
  PackageCheck,
  ShieldCheck,
  Truck,
  CheckCircle2
} from 'lucide-react';

export default function HeroSection({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalItemsCount
}) {
  return (
    <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
      
      {/* Cabeçalho do Catálogo Comercial B2B Ampliado para Desktop */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Identificação Principal do Catálogo */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-slate-950 text-white text-xs sm:text-sm font-black px-3.5 py-1 rounded-lg">
                DISTRIBUIÇÃO DIRETA B2B
              </span>
              <span className="text-slate-400 font-bold hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-slate-800 font-extrabold">
                Tabela Oficial para Lojistas e Revendedores
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Catálogo Atacado
            </h1>
            <p className="text-sm sm:text-base text-slate-700 font-bold max-w-3xl leading-relaxed">
              Consulte nosso portfólio completo com especificações técnicas, estoque em tempo real e condições de faturamento por caixa fechada master (10 ou 20 peças).
            </p>
          </div>

          {/* 2 Cards de Indicadores Operacionais B2B no Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            
            {/* Card Revendedor */}
            <div className="flex items-center gap-3.5 bg-slate-100 border-2 border-slate-300 rounded-2xl p-3.5 sm:p-4">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-md">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex flex-col text-xs sm:text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <strong className="text-slate-950 font-black">Revendedor Prata</strong>
                </div>
                <span className="text-emerald-800 font-extrabold text-xs mt-1">
                  ✓ Tabela Atacado Desbloqueada
                </span>
              </div>
            </div>

            {/* Card Pedido Mínimo */}
            <div className="flex items-center gap-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-xs sm:text-sm leading-tight">
                <strong className="text-amber-950 font-black">Pedido Mínimo</strong>
                <span className="text-amber-900 font-bold text-xs mt-1">
                  1 Caixa Fechada (10 ou 20 un.)
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Seções do Catálogo (Cards Amplos no Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden shadow-xs ${
                isActive 
                  ? 'bg-slate-950 border-slate-950 text-white ring-4 ring-slate-950/15 shadow-md' 
                  : 'bg-white border-slate-300 text-slate-950 hover:border-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-900 border border-slate-300'
              }`}>
                {cat.id === 'all' && <Layers className="w-6 h-6 sm:w-7 sm:h-7" />}
                {cat.id === 'tablets-infantis' && <Gamepad2 className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-white' : 'text-pink-600'}`} />}
                {cat.id === 'tablets-profissionais' && <Laptop className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-white' : 'text-blue-600'}`} />}
                {cat.id === 'power-banks' && <BatteryCharging className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-white' : 'text-amber-500'}`} />}
              </div>

              <div className="flex flex-col min-w-0">
                <span className={`text-sm sm:text-base font-black tracking-tight truncate ${
                  isActive ? 'text-white' : 'text-slate-950'
                }`}>
                  {cat.name}
                </span>
                <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${
                  isActive ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {cat.count} modelos disponíveis
                </span>
              </div>

              {isActive && (
                <div className="absolute top-0 right-0 w-2.5 h-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Barra de Controles de Consulta do Catálogo (Desktop & Mobile) */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        
        {/* Totalizador & Ordenação com Fontes Maiores */}
        <div className="flex items-center gap-4 text-sm sm:text-base w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-slate-800 font-bold">
            Mostrando <strong className="text-slate-950 font-black text-base">{totalItemsCount}</strong> produtos no catálogo
          </span>

          <span className="text-slate-400 hidden sm:inline">|</span>

          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-black text-xs sm:text-sm hidden sm:inline">Classificar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 border-2 border-slate-300 text-xs sm:text-sm font-black text-slate-950 rounded-xl px-3.5 py-2 outline-none cursor-pointer hover:border-slate-500 focus:border-blue-600"
            >
              <option value="mais-vendidos">Mais Vendidos / Alto Giro</option>
              <option value="menor-preco">Menor Preço Atacado</option>
              <option value="maior-preco">Maior Preço Atacado</option>
              <option value="lancamentos">Lançamentos Recentes</option>
            </select>
          </div>
        </div>

        {/* Alternador de Visualização: Grade vs Tabela com Botões Grandes */}
        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          <span className="text-xs sm:text-sm text-slate-700 font-black hidden md:inline">Modo de Exibição:</span>
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-slate-950 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-slate-950'
              }`}
              title="Fichas Comerciais em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grade</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-slate-950'
              }`}
              title="Tabela Comercial de Comparação B2B"
            >
              <TableProperties className="w-4 h-4" />
              <span>Tabela Comparativa</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
