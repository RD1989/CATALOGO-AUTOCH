const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

// Helper para injetar token de autenticação do admin nas requisições protegidas
const adminHeaders = () => {
  const token = sessionStorage.getItem('admin_token');
  return token ? { 'X-Admin-Token': token } : {};
};

export const api = {
  // ── Health & Conexão ──────────────────────────────────────────────────────
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return { status: 'offline' };
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // ── Autenticação Admin ────────────────────────────────────────────────────
  async adminLogin(password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return await res.json();
    } catch {
      return { error: 'Erro de conexão com o servidor.' };
    }
  },

  async adminLogout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() }
      });
    } catch {
      // falha silenciosa
    } finally {
      sessionStorage.removeItem('admin_token');
    }
  },

  // ── Configurações do Sistema ──────────────────────────────────────────────
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Produtos ─────────────────────────────────────────────────────────────
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Falha ao buscar produtos da API');
      return await res.json();
    } catch (err) {
      console.warn('Usando fallback local do catálogo:', err);
      return null;
    }
  },

  async createProduct(product) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { ...adminHeaders() }
    });
    return await res.json();
  },

  async adjustPrices(percent, category) {
    const res = await fetch(`${API_BASE_URL}/admin/adjust-prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify({ percent, category })
    });
    return await res.json();
  },

  // ── Cotações / Pedidos ────────────────────────────────────────────────────
  async getQuotes() {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`, {
        headers: { ...adminHeaders() }
      });
      if (!res.ok) throw new Error('Falha ao buscar cotações');
      return await res.json();
    } catch {
      return null;
    }
  },

  async createQuote(quoteData) {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    return await res.json();
  },

  async updateQuoteStatus(id, status, deductStock = false) {
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify({ status, deductStock })
    });
    return await res.json();
  },

  // ── Clientes ──────────────────────────────────────────────────────────────
  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers: { ...adminHeaders() }
      });
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      return await res.json();
    } catch {
      return null;
    }
  },

  async createCustomer(customer) {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify(customer)
    });
    return await res.json();
  },

  // ── Telemetria & Analytics ────────────────────────────────────────────────
  async trackEvent(eventType, { productId, sku, category, metadata } = {}) {
    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, productId, sku, category, metadata })
      });
    } catch {
      // Falha silenciosa de telemetria
    }
  },

  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { ...adminHeaders() }
      });
      if (!res.ok) throw new Error('Falha ao buscar analytics');
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── Exportação ────────────────────────────────────────────────────────────
  getMysqlExportUrl() {
    const token = sessionStorage.getItem('admin_token');
    return `${API_BASE_URL}/export/mysql${token ? `?token=${token}` : ''}`;
  },

  getCsvExportUrl(type = 'products') {
    const token = sessionStorage.getItem('admin_token');
    return `${API_BASE_URL}/export/csv?type=${type}${token ? `&token=${token}` : ''}`;
  },

  // ── Upload de Imagem ──────────────────────────────────────────────────────
  async uploadImage(imageBase64, filename) {
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ imageBase64, filename })
      });
      if (!res.ok) throw new Error('Falha no upload');
      return await res.json();
    } catch (err) {
      console.warn('Erro ao salvar foto no backend, usando dataUrl:', err);
      return { url: imageBase64 };
    }
  }
};
