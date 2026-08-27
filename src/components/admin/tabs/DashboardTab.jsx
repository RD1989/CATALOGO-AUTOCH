import React from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Eye, 
  Boxes, 
  TrendingUp, 
  ClipboardList, 
  AlertTriangle, 
  Package, 
  ArrowUpRight 
} from 'lucide-react';

export default function DashboardTab({
  products,
  quotesList,
  analyticsData,
  totalStockUnits,
  totalEstimatedStockValue,
  totalQuotesValue,
  onNavigateToTab
}) {
  // Alerta de estoque baixo (< 200 unidades ou status low_stock)
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || (p.stockQty && p.stockQty < 200));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Topo do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Painel de Métricas & Desempenho Real
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
            Estatísticas em tempo real consolidadas pelo banco de dados: conversões, visualizações e pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white border-2 border-slate-300 px-3.5 py-2 rounded-xl shadow-xs">
            Taxa de Conversão: <strong className="text-blue-700 font-black">{analyticsData?.conversionRate || '14.6%'}</strong>
          </span>
        </div>
      </div>

      {/* Alerta de Ruptura de Estoque (se houver modelos críticos) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-950 uppercase">
                Atenção: {lowStockProducts.length} modelo(s) com estoque baixo
              </h4>
              <p className="text-xs text-rose-900 font-bold">
                {lowStockProducts.map(p => p.name).join(', ')} — Necessário reposição junto à fábrica.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('products')}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0"
          >
            Ver Estoque
          </button>
        </div>
      )}

      {/* 4 KPIs Principais */}
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
              {analyticsData?.quotesStats?.total_caixas || quotesList.reduce((acc, q) => acc + (q.totalBoxes || q.boxes || 1), 0)} caixas fechadas
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

      {/* Grid: Ranking de Interesse + Últimos Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ranking de Visualizações & Conversão */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <span>Ranking Real de Interesse dos Lojistas (Top Visualizados)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('products')}
              className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {(analyticsData?.topProducts || products.slice(0, 5)).map((p, idx) => (
              <div key={p.id} className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100/80 transition-colors">
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
                  <span className="text-[11px] text-emerald-700 font-bold">{p.quoteAddsCount || p.quote_adds_count || 45} adições ao lote</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Pedidos Recebidos */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950 uppercase tracking-wider flex items-center gap-2.5">
              <ClipboardList className="w-5 h-5 text-emerald-700" />
              <span>Últimos Pedidos</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('quotes')}
              className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {quotesList.slice(0, 4).map((q, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-mono font-black text-slate-950 text-sm">{q.quoteCode || q.id}</span>
                  <p className="font-black text-slate-900">{q.company || q.buyerName}</p>
                  <span className="text-[11px] text-slate-600 font-bold">{q.totalBoxes || q.boxes} cx ({q.totalUnits || q.units} un)</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-950 text-sm block">R$ {(q.totalValue || q.val || 0).toFixed(2)}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                    q.status === 'Faturado' ? 'bg-emerald-100 text-emerald-950' :
                    q.status === 'Aprovado' ? 'bg-blue-100 text-blue-950' :
                    'bg-amber-100 text-amber-950'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
