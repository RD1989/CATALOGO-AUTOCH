import React, { useState } from 'react';
import { Percent, X, Check } from 'lucide-react';

export default function PriceAdjustmentModal({
  isOpen,
  onClose,
  onExecute,
  isAdjusting
}) {
  if (!isOpen) return null;

  const [percent, setPercent] = useState(5);
  const [category, setCategory] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    onExecute(percent, category);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">Reajuste de Preços no Banco</h3>
              <span className="text-xs text-slate-500 font-bold">Operação em Massa</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-black text-slate-900 block uppercase mb-1">
              Categoria Alvo
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 text-slate-900 font-black rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
            >
              <option value="all">Todo o Catálogo (Todos os Modelos)</option>
              <option value="tablets-profissionais">Tablets Profissionais</option>
              <option value="tablets-infantis">Tablets Infantis</option>
              <option value="power-banks">Power Banks</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-900 block uppercase mb-1">
              Porcentagem de Reajuste (%)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2">
              <input
                type="number"
                step="0.5"
                required
                value={percent}
                onChange={(e) => setPercent(parseFloat(e.target.value) || 0)}
                className="w-full text-base font-black text-slate-950 outline-none bg-transparent"
                placeholder="Ex: 5 ou -3"
              />
              <span className="font-black text-slate-500 text-sm">%</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-1">
              💡 Use valores positivos (ex: <strong>5</strong> para +5%) ou negativos (ex: <strong>-3</strong> para -3% de desconto).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAdjusting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isAdjusting ? 'Aplicando...' : 'Confirmar Reajuste'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
