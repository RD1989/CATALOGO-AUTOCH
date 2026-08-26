const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Produtos
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Falha ao buscar produtos da API');
      return await res.json();
    } catch (err) {
      console.warn('Usando fallback local:', err);
      return null;
    }
  },

  async createProduct(product) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async adjustPrices(percent, category) {
    const res = await fetch(`${API_BASE_URL}/products/adjust-prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percent, category })
    });
    return await res.json();
  },

  // Cotações / Pedidos
  async getQuotes() {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`);
      if (!res.ok) throw new Error('Falha ao buscar cotações');
      return await res.json();
    } catch (err) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deductStock })
    });
    return await res.json();
  },

  // Clientes
  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async createCustomer(customer) {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return await res.json();
  },

  // Telemetria & Analytics Reais
  async trackEvent(eventType, { productId, sku, category, metadata } = {}) {
    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, productId, sku, category, metadata })
      });
    } catch (err) {
      // Falha silenciosa de telemetria
    }
  },

  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) throw new Error('Falha ao buscar analytics');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Exportar MySQL
  getMysqlExportUrl() {
    return `${API_BASE_URL}/export/mysql`;
  }
};
