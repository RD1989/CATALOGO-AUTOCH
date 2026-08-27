import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'atacadotech-jwt-secret-hardened-key-2026';
const JWT_EXPIRES_IN = '8h';

// ── Rate Limiting Ingress Protection (RULE-API-003 & ByteByteGo p. 65) ────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 tentativas por IP
  message: { error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

const quotesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 40, // Máximo 40 cotações por IP
  message: { error: 'Limite de requisições de cotação atingido. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 300, // Máximo 300 telemetrias por minuto
  standardHeaders: true,
  legacyHeaders: false
});

// ── CORS restrito a origens localhost ────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mesmo domínio, Postman, curl)
    if (!origin) return callback(null, true);
    // Permite qualquer localhost (qualquer porta)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error('Origem não permitida pelo CORS'));
  }
}));

app.use(express.json({ limit: '10mb' }));

// ── Middleware de Autenticação JWT Stateless (RULE-SEC-002 & RULE-SCALE-001) ──
const requireAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado. Token de acesso ausente.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente no painel.' });
    }
    return res.status(401).json({ error: 'Token de autenticação inválido.' });
  }
};

// ── Helper para escapar strings em SQL gerado (RULE-SEC-001) ─────────────────
const escapeForSql = (val) => {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z') + "'";
};

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  try {
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    res.json({
      status: 'healthy',
      database: 'connected',
      productsCount: productCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ── Autenticação Admin com Bcrypt & JWT (RULE-SEC-002) ────────────────────────
app.post('/api/auth/login', authLimiter, (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Senha não informada.' });

    const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
    if (!stored || !stored.value) {
      return res.status(500).json({ error: 'Configuração de autenticação não inicializada.' });
    }

    let isPasswordValid = false;
    if (stored.value.startsWith('$2a$') || stored.value.startsWith('$2b$')) {
      isPasswordValid = bcrypt.compareSync(password, stored.value);
    } else {
      // Migração automática caso a senha ainda esteja em texto plano
      isPasswordValid = (password === stored.value);
      if (isPasswordValid) {
        const hashed = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(hashed);
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta. Tente novamente.' });
    }

    // Emissão de JWT Stateless assinado (ByteByteGo p. 51, 166)
    const token = jwt.sign(
      { role: 'admin', sub: 'admin-master' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ token, message: 'Login realizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Logout realizado.' });
});

// ── Configurações do sistema ─────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      if (row.key !== 'admin_password') {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar uma setting (protegido, com auto-hash se for senha)
app.put('/api/settings/:key', requireAuth, (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'Valor não informado.' });

    let finalValue = value;
    if (req.params.key === 'admin_password') {
      finalValue = bcrypt.hashSync(String(value), 10);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper para formatar produto para o frontend
const formatProduct = (p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  categoryName: p.category_name,
  price: p.price,
  minBatchQty: p.min_batch_qty,
  boxUnitLabel: `1 Caixa Fechada (${p.min_batch_qty} un.)`,
  condition: p.condition,
  network: p.network,
  status: p.status,
  statusLabel: p.status_label,
  stockQty: p.stock_qty,
  image: p.image,
  colors: JSON.parse(p.colors_json || '[]'),
  badges: JSON.parse(p.badges_json || '[]'),
  specs: JSON.parse(p.specs_json || '{}'),
  bulletPoints: JSON.parse(p.bullet_points_json || '[]'),
  viewsCount: p.views_count,
  quoteAddsCount: p.quote_adds_count,
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

// ══════════════════════════════════════════════════════════
// 1. PRODUTOS & CATÁLOGO (CRUD EM TEMPO REAL)
// ══════════════════════════════════════════════════════════

// Listar todos os produtos (público)
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
    res.json(rows.map(formatProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter produto por ID (público)
app.get('/api/products/:id', (req, res) => {
  try {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(formatProduct(p));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo produto (protegido)
app.post('/api/products', requireAuth, (req, res) => {
  try {
    const p = req.body;

    // Validação de campos obrigatórios
    if (!p.sku || !p.name || !p.category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes: sku, name, category.' });
    }
    if (typeof p.price !== 'number' || p.price <= 0) {
      return res.status(400).json({ error: 'O campo price deve ser um número positivo.' });
    }
    if (p.stockQty !== undefined && (typeof p.stockQty !== 'number' || p.stockQty < 0)) {
      return res.status(400).json({ error: 'O campo stockQty deve ser um número não negativo.' });
    }
    if (p.minBatchQty !== undefined && (typeof p.minBatchQty !== 'number' || p.minBatchQty < 1)) {
      return res.status(400).json({ error: 'O campo minBatchQty deve ser um número >= 1.' });
    }

    const id = p.id || `prod-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO products (
        id, sku, name, category, category_name, price, min_batch_qty, condition,
        network, status, status_label, stock_qty, image, colors_json, badges_json,
        specs_json, bullet_points_json, views_count, quote_adds_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    stmt.run(
      id,
      p.sku,
      p.name,
      p.category,
      p.categoryName || 'Eletrônicos',
      p.price,
      p.minBatchQty || 10,
      p.condition || 'Lançamento',
      p.network || '5G',
      p.status || 'available',
      p.statusLabel || 'Em estoque pronta-entrega',
      p.stockQty || 300,
      p.image || '/images/products/stab-9-pro.jpg',
      JSON.stringify(p.colors || []),
      JSON.stringify(p.badges || []),
      JSON.stringify(p.specs || {}),
      JSON.stringify(p.bulletPoints || [])
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(formatProduct(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar produto existente (protegido)
app.put('/api/products/:id', requireAuth, (req, res) => {
  try {
    const p = req.body;

    if (p.price !== undefined && (typeof p.price !== 'number' || p.price <= 0)) {
      return res.status(400).json({ error: 'O campo price deve ser um número positivo.' });
    }

    const stmt = db.prepare(`
      UPDATE products SET
        sku = ?,
        name = ?,
        category = ?,
        category_name = ?,
        price = ?,
        min_batch_qty = ?,
        condition = ?,
        network = ?,
        status = ?,
        status_label = ?,
        stock_qty = ?,
        image = ?,
        colors_json = ?,
        badges_json = ?,
        specs_json = ?,
        bullet_points_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      p.sku, p.name, p.category, p.categoryName,
      p.price, p.minBatchQty, p.condition, p.network,
      p.status, p.statusLabel, p.stockQty, p.image,
      JSON.stringify(p.colors || []),
      JSON.stringify(p.badges || []),
      JSON.stringify(p.specs || {}),
      JSON.stringify(p.bulletPoints || []),
      req.params.id
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(formatProduct(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir produto (protegido)
app.delete('/api/products/:id', requireAuth, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reajuste de Preços em Massa (%) — protegido
app.post('/api/admin/adjust-prices', requireAuth, (req, res) => {
  try {
    const { percent, category } = req.body;
    if (typeof percent !== 'number') {
      return res.status(400).json({ error: 'O campo percent deve ser um número.' });
    }
    const multiplier = 1 + (percent / 100);

    if (category && category !== 'all') {
      db.prepare('UPDATE products SET price = ROUND(price * ?, 2), updated_at = CURRENT_TIMESTAMP WHERE category = ?').run(multiplier, category);
    } else {
      db.prepare('UPDATE products SET price = ROUND(price * ?, 2), updated_at = CURRENT_TIMESTAMP').run(multiplier);
    }

    const rows = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
    res.json({ message: `Preços reajustados em ${percent}% com sucesso`, products: rows.map(formatProduct) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 2. COTAÇÕES & PEDIDOS B2B
// ══════════════════════════════════════════════════════════

// Listar cotações (protegido)
app.get('/api/quotes', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
    const formatted = rows.map(q => ({
      id: q.id,
      quoteCode: q.quote_code,
      buyerName: q.buyer_name,
      company: q.company,
      cnpj: q.cnpj,
      phone: q.phone,
      city: q.city,
      state: q.state,
      items: JSON.parse(q.items_json || '[]'),
      totalBoxes: q.total_boxes,
      totalUnits: q.total_units,
      totalValue: q.total_value,
      status: q.status,
      createdAt: q.created_at,
      updatedAt: q.updated_at
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova cotação / pedido (público — clientes B2B enviam pelo BatchDrawer com rate limit)
app.post('/api/quotes', quotesLimiter, (req, res) => {
  try {
    const q = req.body;
    const id = `cot-${Date.now()}`;
    const quoteCode = `COT-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO quotes (
        id, quote_code, buyer_name, company, cnpj, phone, city, state,
        items_json, total_boxes, total_units, total_value, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, quoteCode,
      q.buyerName || 'Comprador B2B',
      q.company || 'Loja Revendedora',
      q.cnpj || '',
      q.phone || '',
      q.city || 'São Paulo',
      q.state || 'SP',
      JSON.stringify(q.items || []),
      q.totalBoxes || 1,
      q.totalUnits || 10,
      q.totalValue || 0,
      'Pendente'
    );

    db.prepare(`
      INSERT INTO analytics_events (event_type, metadata_json)
      VALUES ('quote_created', ?)
    `).run(JSON.stringify({ quoteCode, totalValue: q.totalValue, totalBoxes: q.totalBoxes }));

    res.status(201).json({ id, quoteCode, message: 'Cotação registrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status da cotação (protegido)
app.put('/api/quotes/:id/status', requireAuth, (req, res) => {
  try {
    const { status, deductStock } = req.body;
    db.prepare('UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    if (deductStock && status === 'Faturado') {
      const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
      if (quote) {
        const items = JSON.parse(quote.items_json || '[]');
        for (const item of items) {
          if (item.sku && item.units) {
            db.prepare('UPDATE products SET stock_qty = MAX(0, stock_qty - ?) WHERE sku = ?').run(item.units, item.sku);
          }
        }
      }
    }

    res.json({ message: `Status atualizado para ${status}`, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 3. CLIENTES & REVENDEDORES B2B
// ══════════════════════════════════════════════════════════

// Listar clientes (protegido)
app.get('/api/customers', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM customers ORDER BY total_spent DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar cliente (protegido)
app.post('/api/customers', requireAuth, (req, res) => {
  try {
    const c = req.body;
    const id = `cli-${Date.now()}`;
    db.prepare(`
      INSERT INTO customers (id, name, company, cnpj, phone, city, state, level, total_orders, total_spent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.0, 'Ativo')
    `).run(id, c.name, c.company, c.cnpj, c.phone, c.city || 'São Paulo', c.state || 'SP', c.level || 'Prata');

    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 4. TELEMETRIA & MÉTRICAS REAIS DO NEGÓCIO
// ══════════════════════════════════════════════════════════

// Registrar evento (público — gerado pelo catálogo com rate limit)
app.post('/api/analytics/track', analyticsLimiter, (req, res) => {
  try {
    const { eventType, productId, sku, category, metadata } = req.body;

    db.prepare(`
      INSERT INTO analytics_events (event_type, product_id, sku, category, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(eventType, productId || null, sku || null, category || null, JSON.stringify(metadata || {}));

    if (eventType === 'product_view' && productId) {
      db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(productId);
    }
    if (eventType === 'add_to_batch' && productId) {
      db.prepare('UPDATE products SET quote_adds_count = quote_adds_count + 1 WHERE id = ?').run(productId);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter Métricas Agregadas (protegido)
app.get('/api/analytics', requireAuth, (req, res) => {
  try {
    const totalViews = db.prepare('SELECT SUM(views_count) as total FROM products').get().total || 0;
    const totalAdds = db.prepare('SELECT SUM(quote_adds_count) as total FROM products').get().total || 0;
    const totalStock = db.prepare('SELECT SUM(stock_qty) as total FROM products').get().total || 0;
    const totalStockValue = db.prepare('SELECT SUM(price * stock_qty) as total FROM products').get().total || 0;

    const quotesStats = db.prepare(`
      SELECT
        COUNT(*) as total_quotes,
        SUM(total_value) as total_faturado,
        AVG(total_value) as ticket_medio,
        SUM(total_boxes) as total_caixas,
        SUM(total_units) as total_pecas
      FROM quotes
    `).get();

    const topProducts = db.prepare(`
      SELECT id, sku, name, category_name, price, views_count, quote_adds_count, stock_qty
      FROM products ORDER BY views_count DESC LIMIT 5
    `).all();

    const categoryStats = db.prepare(`
      SELECT category_name, COUNT(*) as total_modelos, SUM(stock_qty) as total_pecas, SUM(price * stock_qty) as valor_categoria
      FROM products GROUP BY category_name
    `).all();

    res.json({
      totalViews, totalAdds,
      conversionRate: totalViews > 0 ? ((totalAdds / totalViews) * 100).toFixed(1) + '%' : '0%',
      totalStock, totalStockValue, quotesStats, topProducts, categoryStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 5. EXPORTADOR MySQL 8 (protegido)
// ══════════════════════════════════════════════════════════
app.get('/api/export/mysql', requireAuth, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();

    let sql = `-- ========================================================\n`;
    sql += `-- BANCO DE DADOS OFICIAL ATACADO TECH (MySQL 8 / MariaDB)\n`;
    sql += `-- Gerado automaticamente em ${new Date().toISOString()}\n`;
    sql += `-- Compatível com phpMyAdmin e Hospedagem Compartilhada\n`;
    sql += `-- ========================================================\n\n`;
    sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    sql += `DROP TABLE IF EXISTS \`products\`;\n`;
    sql += `CREATE TABLE \`products\` (\n`;
    sql += `  \`id\` varchar(64) NOT NULL,\n`;
    sql += `  \`sku\` varchar(64) NOT NULL UNIQUE,\n`;
    sql += `  \`name\` varchar(255) NOT NULL,\n`;
    sql += `  \`category\` varchar(64) NOT NULL,\n`;
    sql += `  \`category_name\` varchar(128) NOT NULL,\n`;
    sql += `  \`price\` decimal(10,2) NOT NULL,\n`;
    sql += `  \`min_batch_qty\` int NOT NULL DEFAULT '10',\n`;
    sql += `  \`condition\` varchar(64) NOT NULL DEFAULT 'Lançamento',\n`;
    sql += `  \`network\` varchar(64) NOT NULL DEFAULT '5G',\n`;
    sql += `  \`status\` varchar(64) NOT NULL DEFAULT 'available',\n`;
    sql += `  \`status_label\` varchar(128) NOT NULL DEFAULT 'Em estoque pronta-entrega',\n`;
    sql += `  \`stock_qty\` int NOT NULL DEFAULT '300',\n`;
    sql += `  \`image\` text NOT NULL,\n`;
    sql += `  \`colors_json\` json DEFAULT NULL,\n`;
    sql += `  \`badges_json\` json DEFAULT NULL,\n`;
    sql += `  \`specs_json\` json DEFAULT NULL,\n`;
    sql += `  \`bullet_points_json\` json DEFAULT NULL,\n`;
    sql += `  \`views_count\` int NOT NULL DEFAULT '0',\n`;
    sql += `  \`quote_adds_count\` int NOT NULL DEFAULT '0',\n`;
    sql += `  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  PRIMARY KEY (\`id\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    for (const p of products) {
      sql += `INSERT INTO \`products\` VALUES (${[
        escapeForSql(p.id),
        escapeForSql(p.sku),
        escapeForSql(p.name),
        escapeForSql(p.category),
        escapeForSql(p.category_name),
        p.price,
        p.min_batch_qty,
        escapeForSql(p.condition),
        escapeForSql(p.network),
        escapeForSql(p.status),
        escapeForSql(p.status_label),
        p.stock_qty,
        escapeForSql(p.image),
        escapeForSql(p.colors_json),
        escapeForSql(p.badges_json),
        escapeForSql(p.specs_json),
        escapeForSql(p.bullet_points_json),
        p.views_count,
        p.quote_adds_count,
        escapeForSql(p.created_at)
      ].join(', ')});\n`;
    }

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="backup_atacadotech_mysql.sql"');
    res.send(sql);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 6. EXPORTADOR CSV (protegido)
// ══════════════════════════════════════════════════════════
app.get('/api/export/csv', requireAuth, (req, res) => {
  try {
    const type = req.query.type || 'products';
    let csv = '';

    if (type === 'products') {
      const products = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
      csv = 'ID;SKU;Nome;Categoria;Preco_Unitario;Caixa_Master_Qtd;Total_Caixa;Estoque_Pecas;Status;Conectividade\n';
      for (const p of products) {
        const boxTotal = (p.price * p.min_batch_qty).toFixed(2);
        csv += `"${p.id}";"${p.sku}";"${p.name.replace(/"/g, '""')}";"${p.category_name}";"${p.price.toFixed(2)}";"${p.min_batch_qty}";"${boxTotal}";"${p.stock_qty}";"${p.status_label}";"${p.network}"\n`;
      }
      res.setHeader('Content-Disposition', 'attachment; filename="produtos_atacadotech.csv"');
    } else if (type === 'quotes') {
      const quotes = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
      csv = 'Codigo;Data;Comprador;Empresa;CNPJ;Telefone;Cidade_UF;Total_Caixas;Total_Pecas;Valor_Total;Status\n';
      for (const q of quotes) {
        csv += `"${q.quote_code}";"${q.created_at}";"${q.buyer_name}";"${q.company}";"${q.cnpj || ''}";"${q.phone}";"${q.city || ''}/${q.state || ''}";"${q.total_boxes}";"${q.total_units}";"${q.total_value.toFixed(2)}";"${q.status}"\n`;
      }
      res.setHeader('Content-Disposition', 'attachment; filename="pedidos_atacadotech.csv"');
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send('\uFEFF' + csv); // BOM para Excel reconhecer acentos
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════
// 7. UPLOAD DE FOTOS (protegido)
// ══════════════════════════════════════════════════════════
app.post('/api/upload', requireAuth, (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.json({ url: imageBase64 }); // fallback: retorna a própria dataUrl
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const baseName = (filename || `prod-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const targetFileName = `${baseName}.${cleanExt}`;

    const publicDir = path.join(__dirname, '..', 'public', 'images', 'products');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, targetFileName);
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/images/products/${targetFileName}`,
      message: 'Foto gravada com sucesso no diretório de produtos'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar Servidor Backend
app.listen(PORT, () => {
  console.log(`✓ Servidor Backend Atacado Tech rodando em http://localhost:${PORT}`);
  console.log(`✓ Banco de dados SQLite persistido e sincronizado.`);
  console.log(`✓ CORS restrito a origens localhost.`);
  console.log(`✓ Autenticação admin ativa (POST /api/auth/login).`);
});
