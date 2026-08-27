import React from 'react';
import { UserPlus, X, Check, Building2 } from 'lucide-react';

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onSave({
      name: form.name.value,
      company: form.company.value,
      cnpj: form.cnpj.value,
      phone: form.phone.value,
      city: form.city.value || 'São Paulo',
      state: form.state.value || 'SP',
      level: form.level.value || 'Prata'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-slate-300 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm font-black">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Cadastrar Revendedor Autorizado
              </h3>
              <span className="text-xs text-slate-300 font-bold">
                Registre os dados fiscais e de contato da revenda.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">Razão Social / Loja *</label>
              <input
                type="text"
                name="company"
                required
                placeholder="Ex: Mega Celulares Ltda"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">Nome do Responsável *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ex: Carlos Silva"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">CNPJ ou CPF *</label>
              <input
                type="text"
                name="cnpj"
                required
                placeholder="00.000.000/0001-00"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">WhatsApp de Contato *</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
              <label className="text-xs font-black text-slate-900 block uppercase mb-1">Nível Revenda</label>
              <select
                name="level"
                defaultValue="Prata"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none cursor-pointer"
              >
                <option value="Bronze">Bronze</option>
                <option value="Prata">Prata</option>
                <option value="Ouro">Ouro</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Gravar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
