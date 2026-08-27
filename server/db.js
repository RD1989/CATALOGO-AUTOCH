import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Habilitar WAL mode para alta performance e concorrência
db.pragma('journal_mode = WAL');

// Criação das Tabelas Relacionais
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    price REAL NOT NULL,
    min_batch_qty INTEGER NOT NULL DEFAULT 10,
    condition TEXT NOT NULL DEFAULT 'Lançamento',
    network TEXT NOT NULL DEFAULT '5G',
    status TEXT NOT NULL DEFAULT 'available',
    status_label TEXT NOT NULL DEFAULT 'Em estoque pronta-entrega',
    stock_qty INTEGER NOT NULL DEFAULT 300,
    image TEXT NOT NULL,
    colors_json TEXT NOT NULL DEFAULT '[]',
    badges_json TEXT NOT NULL DEFAULT '[]',
    specs_json TEXT NOT NULL DEFAULT '{}',
    bullet_points_json TEXT NOT NULL DEFAULT '[]',
    views_count INTEGER NOT NULL DEFAULT 0,
    quote_adds_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    quote_code TEXT NOT NULL UNIQUE,
    buyer_name TEXT NOT NULL,
    company TEXT NOT NULL,
    cnpj TEXT,
    phone TEXT NOT NULL,
    city TEXT,
    state TEXT,
    items_json TEXT NOT NULL,
    total_boxes INTEGER NOT NULL,
    total_units INTEGER NOT NULL,
    total_value REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'Prata',
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    product_id TEXT,
    sku TEXT,
    category TEXT,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    permissions TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Índices de Alta Performance para Acelerar Consultas (RULE-DB-002)
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_products_price ON products(price ASC);
  CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_events_type_created ON analytics_events(event_type, created_at);
  CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent DESC);
`);

// Garantir que a senha de admin exista com hash seguro bcrypt (RULE-SEC-002)
const adminSetting = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
if (!adminSetting) {
  // Hash de 'admin123' com 10 salt rounds
  const defaultHash = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDM95K8qpvqQ1cuy'; // bcrypt hash of admin123
  db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', ?)").run(defaultHash);
} else if (!adminSetting.value.startsWith('$2a$') && !adminSetting.value.startsWith('$2b$')) {
  // Migrar senha em texto plano existente para hash bcrypt
  import('bcryptjs').then(bcrypt => {
    const hashed = bcrypt.default.hashSync(adminSetting.value, 10);
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(hashed);
  });
}

// Seed inicial dos 10 produtos oficiais do catálogo PDF caso o banco esteja vazio
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

if (productCount === 0) {
  const initialProducts = [
    {
      id: 'q39-pro',
      sku: 'TB-Q39-PRO',
      name: 'Q39 PRO — ATACADO',
      category: 'tablets-infantis',
      category_name: 'Tablets Infantis',
      price: 250.00,
      min_batch_qty: 20,
      condition: 'Mais vendidos',
      network: 'Wi-Fi',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 400,
      image: '/images/products/q39-pro.jpg',
      colors_json: JSON.stringify([
        { name: 'Rosa', hex: '#F472B6' },
        { name: 'Azul', hex: '#3B82F6' },
        { name: 'Verde', hex: '#84CC16' },
        { name: 'Laranja', hex: '#F97316' }
      ]),
      badges_json: JSON.stringify(['Caixa 20 PCS', 'Capa Anti-Impacto', 'Controle Parental']),
      specs_json: JSON.stringify({
        tela: '7.0" Polegadas IPS HD',
        armazenamento: '64GB ROM Expansível',
        ram: '4GB RAM (2GB Físico + 2GB Virtual)',
        bateria: '4.000 mAh Longa Duração',
        processador: 'Quad-Core 1.6GHz Otimizado',
        sistema: 'Android 13 Edição Kids',
        conectividade: 'Wi-Fi Dual Band + Bluetooth 5.0'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 20 unidades em cores sortidas',
        'Capa emborrachada reforçada com suporte giratório 360°',
        'Aplicativo de controle parental e jogos educativos pré-instalados'
      ]),
      views_count: 342,
      quote_adds_count: 48
    },
    {
      id: 'kt-10',
      sku: 'TB-KT10-KIDS',
      name: 'KT 10 — ATACADO',
      category: 'tablets-infantis',
      category_name: 'Tablets Infantis',
      price: 380.00,
      min_batch_qty: 10,
      condition: 'Lançamento',
      network: '4G / LTE',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 250,
      image: '/images/products/kt-10.jpg',
      colors_json: JSON.stringify([
        { name: 'Azul', hex: '#3B82F6' },
        { name: 'Rosa', hex: '#F472B6' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Chip 4G', '128GB ROM']),
      specs_json: JSON.stringify({
        tela: '10.1" Polegadas HD IPS',
        armazenamento: '128GB ROM',
        ram: '6GB RAM',
        bateria: '6.000 mAh',
        processador: 'Octa-Core 2.0GHz',
        sistema: 'Android 14 Kids',
        conectividade: '4G LTE com entrada para Chip SIM + Wi-Fi'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades',
        'Tela ampla de 10.1 polegadas ideal para estudo e entretenimento',
        'Conexão 4G para uso independente de rede Wi-Fi'
      ]),
      views_count: 289,
      quote_adds_count: 35
    },
    {
      id: 'a-tab8',
      sku: 'TB-ATAB8-PRO',
      name: 'A TAB8 — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 540.00,
      min_batch_qty: 20,
      condition: 'Mais vendidos',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 360,
      image: '/images/products/a-tab8.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' },
        { name: 'Azul', hex: '#3B82F6' },
        { name: 'Ouro', hex: '#EAB308' }
      ]),
      badges_json: JSON.stringify(['Caixa 20 PCS', '5G Dual SIM', '8.0" Portátil']),
      specs_json: JSON.stringify({
        tela: '8.4" IPS Full HD+',
        armazenamento: '256GB ROM',
        ram: '8GB RAM',
        bateria: '6.500 mAh com Carga Rápida 18W',
        processador: 'Octa-Core 2.2GHz High Performance',
        sistema: 'Android 14 com Suporte a Multi-Janelas',
        conectividade: '5G Standalone + 4G LTE Dual SIM + Wi-Fi 6'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 20 unidades lacradas',
        'Corpo metálico slim de 7.5mm com pegada ergonômica',
        'Excelente aceitação em revendas corporativas e equipes de campo'
      ]),
      views_count: 412,
      quote_adds_count: 62
    },
    {
      id: 'se-pro',
      sku: 'TB-SEPRO-5G',
      name: 'SE PRO — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 480.00,
      min_batch_qty: 10,
      condition: 'Promoção',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 210,
      image: '/images/products/se-pro.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' },
        { name: 'Azul', hex: '#3B82F6' },
        { name: 'Ouro', hex: '#EAB308' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Custo-Benefício 5G', 'Android 14']),
      specs_json: JSON.stringify({
        tela: '10.1" IPS HD 1280x800',
        armazenamento: '128GB ROM',
        ram: '6GB RAM',
        bateria: '7.000 mAh',
        processador: 'Octa-Core 2.0GHz',
        sistema: 'Android 14',
        conectividade: '5G + 4G Dual SIM + Wi-Fi Dual Band'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades com acessórios inclusos',
        'Melhor relação custo-benefício para tablets de 10 polegadas',
        'Alta liquidez e giro rápido no balcão de vendas'
      ]),
      views_count: 518,
      quote_adds_count: 74
    },
    {
      id: 's-t2',
      sku: 'TB-ST2-ULTRA',
      name: 'S-T2 — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 560.00,
      min_batch_qty: 10,
      condition: 'Lançamento',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 190,
      image: '/images/products/s-t2.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' },
        { name: 'Ouro', hex: '#EAB308' },
        { name: 'Vermelho', hex: '#EF4444' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Estrutura Reforçada', 'Bateria 8.000mAh']),
      specs_json: JSON.stringify({
        tela: '10.5" 2K Ultra Retina (2000x1200)',
        armazenamento: '256GB ROM',
        ram: '8GB RAM',
        bateria: '8.000 mAh com Carregamento Rápido 20W',
        processador: 'Octa-Core 2.4GHz',
        sistema: 'Android 14 Pro',
        conectividade: '5G Dual SIM + Wi-Fi 6'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades',
        'Chassi com reforço perimetral para maior durabilidade',
        'Bateria de 8.000 mAh que suporta jornadas intensivas de trabalho'
      ]),
      views_count: 367,
      quote_adds_count: 45
    },
    {
      id: 'stab-9-pro',
      sku: 'TB-STAB9-PRO',
      name: 'STab 9 Pro — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 550.00,
      min_batch_qty: 10,
      condition: 'Mais vendidos',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 320,
      image: '/images/products/stab-9-pro.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' },
        { name: 'Azul', hex: '#3B82F6' },
        { name: 'Vermelho', hex: '#EF4444' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', '8GB + 512GB', 'Tela 11" 2K']),
      specs_json: JSON.stringify({
        tela: '11.0" 2K IPS Crystal Display',
        armazenamento: '512GB ROM Alta Velocidade',
        ram: '8GB RAM LPDDR4X',
        bateria: '8.500 mAh',
        processador: 'Octa-Core 2.4GHz High Performance',
        sistema: 'Android 14 Edição Corporativa',
        conectividade: '5G Ultra Speed + Wi-Fi 6 + Bluetooth 5.2'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades com kit completo de fábrica',
        'Armazenamento massivo de 512GB com 8GB de RAM',
        'Tela grande de 11 polegadas com bordas ultrafinas'
      ]),
      views_count: 694,
      quote_adds_count: 98
    },
    {
      id: 'stab-max',
      sku: 'TB-STAB-MAX',
      name: 'STab-MAX — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 590.00,
      min_batch_qty: 10,
      condition: 'Lançamento',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 180,
      image: '/images/products/stab-max.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' },
        { name: 'Ouro', hex: '#EAB308' },
        { name: 'Vermelho', hex: '#EF4444' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Tela 11.6"', 'Bateria 9.000mAh']),
      specs_json: JSON.stringify({
        tela: '11.6" Full HD+ IPS Vivid Color',
        armazenamento: '512GB ROM',
        ram: '8GB RAM',
        bateria: '9.000 mAh Ultra Battery',
        processador: 'Octa-Core 2.5GHz Flagship',
        sistema: 'Android 14',
        conectividade: '5G Dual SIM + Wi-Fi 6'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades lacradas',
        'Tela gigante de 11.6 polegadas perfeita para PDVs e escritórios',
        'Bateria monstro de 9.000 mAh com autonomia para até 2 dias'
      ]),
      views_count: 421,
      quote_adds_count: 53
    },
    {
      id: 'realmax',
      sku: 'TB-REALMAX-PREMIUM',
      name: 'RealMax — ATACADO',
      category: 'tablets-profissionais',
      category_name: 'Tablets Profissionais',
      price: 610.00,
      min_batch_qty: 10,
      condition: 'Mais vendidos',
      network: '5G',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 150,
      image: '/images/products/realmax.jpg',
      colors_json: JSON.stringify([
        { name: 'Cinza', hex: '#9CA3AF' }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Corpo Alumínio', '12GB RAM Otimizada']),
      specs_json: JSON.stringify({
        tela: '11.0" 2.5K Ultra Retina Display',
        armazenamento: '512GB ROM UFS 2.2',
        ram: '12GB RAM (8GB Físico + 4GB Expansível)',
        bateria: '8.800 mAh com Carregamento Rápido 25W',
        processador: 'Octa-Core 2.6GHz Max Clock',
        sistema: 'Android 14 Pro Edition',
        conectividade: '5G Standalone + Wi-Fi 6E + Bluetooth 5.3'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades com acabamento topo de linha',
        'Chassi unibody em alumínio aeronáutico escovado',
        'Modelo premium mais procurado por clientes corporativos'
      ]),
      views_count: 588,
      quote_adds_count: 81
    },
    {
      id: 'pb-p100',
      sku: 'PB-P100-20K',
      name: 'Power Bank P100 — 20.000mAh',
      category: 'power-banks',
      category_name: 'Power Banks & Acessórios',
      price: 75.00,
      min_batch_qty: 10,
      condition: 'Mais vendidos',
      network: 'Turbo 22.5W',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 550,
      image: '/images/products/pb-p100.jpg',
      colors_json: JSON.stringify([
        { name: 'Preto', hex: '#18181B' },
        { name: 'Branco', hex: '#FFFFFF', border: true }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', 'Carga Rápida 22.5W', 'Display Digital 100%']),
      specs_json: JSON.stringify({
        capacidade: '20.000 mAh Real / Célula de Polímero de Lítio',
        potencia: '22.5W Turbo Fast Charging (QC 3.0 / PD 20W)',
        entradas: 'USB-C (PD 18W) + Micro-USB',
        saidas: '2x USB-A (22.5W) + 1x USB-C Bidirecional (20W)',
        display: 'Display Digital LED indicador de porcentagem exata',
        protecao: 'Circuito inteligente contra sobrecarga, curto e aquecimento',
        peso: '385g'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades com cabo incluso',
        'Alta rotatividade e giro imediato no ponto de venda',
        'Carrega até 3 aparelhos simultaneamente com segurança'
      ]),
      views_count: 730,
      quote_adds_count: 115
    },
    {
      id: 'pb-p200',
      sku: 'PB-P200-30K',
      name: 'Power Bank P200 — 30.000mAh | 22.5W',
      category: 'power-banks',
      category_name: 'Power Banks & Acessórios',
      price: 100.00,
      min_batch_qty: 10,
      condition: 'Lançamento',
      network: 'Turbo 22.5W',
      status: 'available',
      status_label: 'Em estoque pronta-entrega',
      stock_qty: 480,
      image: '/images/products/pb-p200.jpg',
      colors_json: JSON.stringify([
        { name: 'Preto', hex: '#18181B' },
        { name: 'Branco', hex: '#FFFFFF', border: true }
      ]),
      badges_json: JSON.stringify(['Caixa 10 PCS', '30.000 mAh Real', 'Cabo Lightning + USB-C']),
      specs_json: JSON.stringify({
        capacidade: '30.000 mAh Real / Grau A Premium',
        potencia: '22.5W Super Fast Charge + PD 20W',
        cabos_integrados: 'Cabo Lightning (iPhone) + Cabo USB-C acoplados',
        entradas: 'USB-C (18W) + Lightning (18W)',
        saidas: 'Cabo USB-C (22.5W) + Cabo Lightning (20W) + Porta USB-A (22.5W)',
        display: 'Painel Digital LED indicador de bateria',
        compatibilidade: 'Universal: iPhones, Samsung, Xiaomi, Tablets e Fones',
        peso: '540g'
      }),
      bullet_points_json: JSON.stringify([
        'Caixa Master com 10 unidades com acabamento perolizado',
        '30.000 mAh capaz de carregar até 8 vezes um smartphone',
        'Produto de alto valor percebido e excelente margem de revenda'
      ]),
      views_count: 810,
      quote_adds_count: 142
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, sku, name, category, category_name, price, min_batch_qty, condition,
      network, status, status_label, stock_qty, image, colors_json, badges_json,
      specs_json, bullet_points_json, views_count, quote_adds_count
    ) VALUES (
      @id, @sku, @name, @category, @category_name, @price, @min_batch_qty, @condition,
      @network, @status, @status_label, @stock_qty, @image, @colors_json, @badges_json,
      @specs_json, @bullet_points_json, @views_count, @quote_adds_count
    )
  `);

  for (const p of initialProducts) {
    insertProduct.run(p);
  }

  // Seed de Clientes Revendedores
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, company, cnpj, phone, city, state, level, total_orders, total_spent, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run('cli-1', 'Carlos Eduardo', 'Mega Celulares Ltda', '12.345.678/0001-90', '(11) 98765-4321', 'São Paulo', 'SP', 'Ouro', 14, 78500.00, 'Ativo');
  insertCustomer.run('cli-2', 'Juliana Ferreira', 'Juju Variedades & Tech', '98.765.432/0001-11', '(31) 99123-8877', 'Belo Horizonte', 'MG', 'Prata', 8, 42300.00, 'Ativo');
  insertCustomer.run('cli-3', 'Roberto Alencar', 'Tech Prime Distribuição', '45.678.901/0001-22', '(41) 99888-5544', 'Curitiba', 'PR', 'Ouro', 22, 135000.00, 'Ativo');
  insertCustomer.run('cli-4', 'Amanda Souza', 'Multi Eletro Bahia', '33.221.100/0001-55', '(71) 98111-2233', 'Salvador', 'BA', 'Bronze', 3, 12400.00, 'Ativo');

  // Seed de Cotações Iniciais
  const insertQuote = db.prepare(`
    INSERT INTO quotes (id, quote_code, buyer_name, company, cnpj, phone, city, state, items_json, total_boxes, total_units, total_value, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQuote.run('cot-1', 'COT-9281', 'Carlos Eduardo', 'Mega Celulares Ltda', '12.345.678/0001-90', '5511987654321', 'São Paulo', 'SP', JSON.stringify([
    { sku: 'TB-Q39-PRO', name: 'Q39 PRO — ATACADO', boxes: 2, units: 40, price: 250, subtotal: 10000 },
    { sku: 'TB-STAB9-PRO', name: 'STab 9 Pro — ATACADO', boxes: 1, units: 10, price: 550, subtotal: 5500 }
  ]), 3, 50, 15500.00, 'Aprovado');

  insertQuote.run('cot-2', 'COT-7104', 'Juliana Ferreira', 'Juju Variedades & Tech', '98.765.432/0001-11', '5531991238877', 'Belo Horizonte', 'MG', JSON.stringify([
    { sku: 'TB-ATAB8-PRO', name: 'A TAB8 — ATACADO', boxes: 1, units: 20, price: 540, subtotal: 10800 }
  ]), 1, 20, 10800.00, 'Em Atendimento');

  // Seed de Membros da Equipe
  const insertTeam = db.prepare(`
    INSERT INTO team_members (id, name, email, role, permissions, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertTeam.run('usr-1', 'Administrador Geral', 'diretoria@atacadotech.com.br', 'Dono (Super Admin)', 'Acesso Irrestrito + Financeiro', 'Ativo');
  insertTeam.run('usr-2', 'Rodrigo Mendes', 'rodrigo.vendas@atacadotech.com.br', 'Vendedor Comercial', 'Catálogo, Cotações e Clientes', 'Ativo');
  insertTeam.run('usr-3', 'Beatriz Lima', 'beatriz.operacoes@atacadotech.com.br', 'Operadora de Estoque', 'Gestão de Estoque e Expedição', 'Ativo');

  // Seed de Configurações
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('company_name', 'ATACADO TECH DISTRIBUIDORA DE ELETRÔNICOS LTDA');
  insertSetting.run('company_whatsapp', '5511999999999');
  insertSetting.run('current_table_date', 'Agosto / 2026');
  insertSetting.run('min_order_policy', 'Faturamento estrito por Caixa Master Fechada (10 ou 20 PCS)');
  // Nota: admin_password já inserida via INSERT OR IGNORE acima
}

export default db;
