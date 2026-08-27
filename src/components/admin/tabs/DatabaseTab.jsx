import React from 'react';
import { Database, Download, FileSpreadsheet, HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../../services/api';

export default function DatabaseTab({ products }) {
  return (
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
        
        {/* Exportador MySQL */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 uppercase">
                Exportador MySQL 8 / phpMyAdmin
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                Gera as tabelas `products`, `quotes`, `customers` e `analytics_events` prontas para produção.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Compatível com MySQL 8.0+ e MariaDB 10.4+</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Codificação UTF-8 (`utf8mb4_unicode_ci`)</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Inclui todos os {products.length} produtos e cotações</span>
            </p>
          </div>

          <div className="pt-3 space-y-2.5">
            <a
              href={api.getMysqlExportUrl()}
              download="backup_atacadotech_mysql.sql"
              className="w-full bg-slate-950 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors text-center"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo .SQL para Hospedagem</span>
            </a>

            <a
              href={api.getCsvExportUrl('products')}
              download="produtos_atacadotech.csv"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 border-2 border-slate-300 transition-colors text-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Baixar Planilha CSV de Produtos</span>
            </a>
          </div>
        </div>

        {/* Status da Conexão Local */}
        <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 uppercase">
                Status da Engine Local (SQLite)
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                Modo WAL ativado com alta concorrência e persistência em disco.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <span className="font-bold text-slate-600">Engine Backend:</span>
              <span className="font-mono font-black text-slate-950">Express + Better-SQLite3</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <span className="font-bold text-slate-600">Porta da API:</span>
              <span className="font-mono font-black text-slate-950">http://localhost:3001</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <span className="font-bold text-slate-600">Arquivo Físico:</span>
              <span className="font-mono font-black text-slate-950">database.sqlite</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <span className="font-bold text-slate-600">Total de Modelos:</span>
              <span className="font-black text-blue-700">{products.length} produtos cadastrados</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
