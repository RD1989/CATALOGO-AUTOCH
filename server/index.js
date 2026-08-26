import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// ==========================================
// 1. PRODUTOS & CATÁLOGO (CRUD EM TEMPO REAL)
// ==========================================

// Listar todos os produtos
app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
    res.json(rows.map(formatProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter produto por ID
app.get('/api/products/:id', (req, res) => {
  try {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(formatProduct(p));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo produto
app.post('/api/products', (req, res) => {
  try {
    const p = req.body;
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

// Atualizar produto existente
app.put('/api/products/:id', (req, res) => {
  try {
    const p = req.body;
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
      p.sku,
      p.name,
      p.category,
      p.categoryName,
      p.price,
      p.minBatchQty,
      p.condition,
      p.network,
      p.status,
      p.statusLabel,
      p.stockQty,
      p.image,
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

// Excluir produto
app.delete('/api/products/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reajuste de Preços em Massa (%)
app.post('/api/products/adjust-prices', (req, res) => {
  try {
    const { percent, category } = req.body; // ex: percent = 5.5 (+5.5%) ou -3 (-3%)
    const multiplier = 1 + (percent / 100);

    let stmt;
    if (category && category !== 'all') {
      stmt = db.prepare('UPDATE products SET price = ROUND(price * ?, 2), updated_at = CURRENT_TIMESTAMP WHERE category = ?');
      stmt.run(multiplier, category);
    } else {
      stmt = db.prepare('UPDATE products SET price = ROUND(price * ?, 2), updated_at = CURRENT_TIMESTAMP');
      stmt.run(multiplier);
    }

    const rows = db.prepare('SELECT * FROM products ORDER BY price ASC').all();
    res.json({ message: `Preços reajustados em ${percent}% com sucesso`, products: rows.map(formatProduct) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. COTAÇÕES & PEDIDOS B2B
// ==========================================

// Listar cotações
app.get('/api/quotes', (req, res) => {
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

// Criar nova cotação / pedido
app.post('/api/quotes', (req, res) => {
  try {
    const q = req.body;
    const id = `cot-${Date.now()}`;
    const quoteCode = `COT-${Math.floor(1000 + Math.random() * 9000)}`;

    const stmt = db.prepare(`
      INSERT INTO quotes (
        id, quote_code, buyer_name, company, cnpj, phone, city, state,
        items_json, total_boxes, total_units, total_value, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      quoteCode,
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

    // Registrar evento de telemetria
    db.prepare(`
      INSERT INTO analytics_events (event_type, metadata_json)
      VALUES ('quote_created', ?)
    `).run(JSON.stringify({ quoteCode, totalValue: q.totalValue, totalBoxes: q.totalBoxes }));

    res.status(201).json({ id, quoteCode, message: 'Cotação registrada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status da cotação (com opção de dar baixa no estoque)
app.put('/api/quotes/:id/status', (req, res) => {
  try {
    const { status, deductStock } = req.body;
    const stmt = db.prepare('UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, req.params.id);

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

// ==========================================
// 3. CLIENTES & REVENDEDORES B2B
// ==========================================

// Listar clientes
app.get('/api/customers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM customers ORDER BY total_spent DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar cliente
app.post('/api/customers', (req, res) => {
  try {
    const c = req.body;
    const id = `cli-${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO customers (id, name, company, cnpj, phone, city, state, level, total_orders, total_spent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.0, 'Ativo')
    `);

    stmt.run(id, c.name, c.company, c.cnpj, c.phone, c.city || 'São Paulo', c.state || 'SP', c.level || 'Prata');
    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. TELEMETRIA & MÉTRICAS REAIS DO NEGÓCIO
// ==========================================

// Registrar evento de acesso / visualização em tempo real
app.post('/api/analytics/track', (req, res) => {
  try {
    const { eventType, productId, sku, category, metadata } = req.body;
    
    // Grava o evento na tabela de analytics
    db.prepare(`
      INSERT INTO analytics_events (event_type, product_id, sku, category, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(eventType, productId || null, sku || null, category || null, JSON.stringify(metadata || {}));

    // Se for visualização de produto, incrementa views_count no produto
    if (eventType === 'product_view' && productId) {
      db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(productId);
    }

    // Se for adição ao lote, incrementa quote_adds_count
    if (eventType === 'add_to_batch' && productId) {
      db.prepare('UPDATE products SET quote_adds_count = quote_adds_count + 1 WHERE id = ?').run(productId);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter Métricas Agregadas Reais
app.get('/api/analytics', (req, res) => {
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

    // Ranking real dos produtos mais visualizados / com maior interesse
    const topProducts = db.prepare(`
      SELECT id, sku, name, category_name, price, views_count, quote_adds_count, stock_qty
      FROM products
      ORDER BY views_count DESC
      LIMIT 5
    `).all();

    // Distribuição de estoque por categoria
    const categoryStats = db.prepare(`
      SELECT 
        category_name,
        COUNT(*) as total_modelos,
        SUM(stock_qty) as total_pecas,
        SUM(price * stock_qty) as valor_categoria
      FROM products
      GROUP BY category_name
    `).all();

    res.json({
      totalViews,
      totalAdds,
      conversionRate: totalViews > 0 ? ((totalAdds / totalViews) * 100).toFixed(1) + '%' : '0%',
      totalStock,
      totalStockValue,
      quotesStats,
      topProducts,
      categoryStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. EXPORTADOR MySQL 8 / HOSPEDAGEM COMPARTILHADA
// ==========================================
app.get('/api/export/mysql', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    const customers = db.prepare('SELECT * FROM customers').all();
    const quotes = db.prepare('SELECT * FROM quotes').all();

    let sql = `-- ========================================================\n`;
    sql += `-- BANCO DE DADOS OFICIAL ATACADO TECH (MySQL 8 / MariaDB)\n`;
    sql += `-- Gerado automaticamente em ${new Date().toISOString()}\n`;
    sql += `-- Compatível com phpMyAdmin e Hospedagem Compartilhada\n`;
    sql += `-- ========================================================\n\n`;
    sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Tabela products
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

    // Inserts products
    for (const p of products) {
      sql += `INSERT INTO \`products\` VALUES (${[
        `'${p.id}'`,
        `'${p.sku}'`,
        `'${p.name.replace(/'/g, "\\'")}'`,
        `'${p.category}'`,
        `'${p.category_name.replace(/'/g, "\\'")}'`,
        p.price,
        p.min_batch_qty,
        `'${p.condition}'`,
        `'${p.network}'`,
        `'${p.status}'`,
        `'${p.status_label.replace(/'/g, "\\'")}'`,
        p.stock_qty,
        `'${p.image}'`,
        `'${p.colors_json.replace(/'/g, "\\'")}'`,
        `'${p.badges_json.replace(/'/g, "\\'")}'`,
        `'${p.specs_json.replace(/'/g, "\\'")}'`,
        `'${p.bullet_points_json.replace(/'/g, "\\'")}'`,
        p.views_count,
        p.quote_adds_count,
        `'${p.created_at}'`
      ].join(', ')});\n`;
    }

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="backup_atacadotech_mysql.sql"');
    res.send(sql);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar Servidor Backend
app.listen(PORT, () => {
  console.log(`✓ Servidor Backend Atacado Tech rodando na porta http://localhost:${PORT}`);
  console.log(`✓ Banco de dados SQLite persistido e sincronizado.`);
});
