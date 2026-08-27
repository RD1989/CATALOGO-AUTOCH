import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturou um erro:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Ops! Algo deu errado.</h2>
              <p className="text-sm text-slate-600 font-bold mt-2">
                Ocorreu um erro inesperado no aplicativo. Recarregue a página para continuar.
              </p>
              {this.state.error && (
                <p className="text-xs text-rose-600 font-mono bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mt-3 text-left break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-slate-950 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
