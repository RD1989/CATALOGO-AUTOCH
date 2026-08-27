import React from 'react';
import { AlertTriangle, Trash2, Check, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirmação de Ação',
  message = 'Deseja realmente prosseguir com esta ação?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-950 leading-tight">{title}</h3>
            <span className="text-xs text-slate-500 font-bold">Confirmação obrigatória</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-95' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
