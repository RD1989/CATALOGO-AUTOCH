// Catálogo Oficial de Eletrônicos B2B Atacado
// Extraído diretamente das especificações técnicas e regras do CATALOGO AUTOCH.pdf

export const CATEGORIES = [
  { id: 'all', name: 'Catálogo Geral (Todos)', count: 10 },
  { id: 'tablets-infantis', name: 'Tablets Infantis', count: 2 },
  { id: 'tablets-profissionais', name: 'Tablets Profissionais', count: 6 },
  { id: 'power-banks', name: 'Power Banks & Acessórios', count: 2 }
];

export const PRODUCTS = [
  // --- 1. TABLETS INFANTIS ---
  {
    id: 'q39-pro',
    sku: 'TB-Q39-PRO',
    name: 'Q39 PRO — ATACADO',
    category: 'tablets-infantis',
    categoryName: 'Tablets Infantis',
    price: 250.00,
    minBatchQty: 20,
    boxUnitLabel: '1 Caixa Fechada (20 un.)',
    condition: 'Mais vendidos',
    network: 'Wi-Fi',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 400,
    image: '/images/products/q39-pro.jpg',
    colors: [
      { name: 'Rosa', hex: '#F472B6' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Verde', hex: '#84CC16' },
      { name: 'Laranja', hex: '#F97316' }
    ],
    badges: ['Caixa 20 PCS', 'Capa Anti-Impacto', 'Controle Parental'],
    specs: {
      tela: '7.0" Polegadas IPS HD',
      armazenamento: '64GB ROM Expansível',
      ram: '4GB RAM (2GB Físico + 2GB Virtual)',
      bateria: '4.000 mAh Longa Duração',
      processador: 'Quad-Core 1.6GHz Otimizado',
      sistema: 'Android 13 Edição Kids',
      conectividade: 'Wi-Fi Dual Band + Bluetooth 5.0'
    },
    bulletPoints: [
      'Caixa Master com 20 unidades em cores sortidas',
      'Capa emborrachada reforçada com suporte giratório 360°',
      'Aplicativo de controle parental e jogos educativos pré-instalados'
    ]
  },
  {
    id: 'kt-10',
    sku: 'TB-KT10-KIDS',
    name: 'KT 10 — ATACADO',
    category: 'tablets-infantis',
    categoryName: 'Tablets Infantis',
    price: 380.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Lançamento',
    network: '4G / LTE',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 250,
    image: '/images/products/kt-10.jpg',
    colors: [
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Rosa', hex: '#F472B6' }
    ],
    badges: ['Caixa 10 PCS', 'Chip 4G', '128GB ROM'],
    specs: {
      tela: '10.1" Polegadas HD IPS',
      armazenamento: '128GB ROM',
      ram: '6GB RAM',
      bateria: '6.000 mAh',
      processador: 'Octa-Core 2.0GHz',
      sistema: 'Android 14 Kids',
      conectividade: '4G LTE com entrada para Chip SIM + Wi-Fi'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades',
      'Tela ampla de 10.1 polegadas ideal para estudo e entretenimento',
      'Conexão 4G para uso independente de rede Wi-Fi'
    ]
  },

  // --- 2. TABLETS PROFISSIONAIS & PRODUTIVIDADE ---
  {
    id: 'a-tab8',
    sku: 'TB-ATAB8-PRO',
    name: 'A TAB8 — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 540.00,
    minBatchQty: 20,
    boxUnitLabel: '1 Caixa Fechada (20 un.)',
    condition: 'Mais vendidos',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 360,
    image: '/images/products/a-tab8.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Ouro', hex: '#EAB308' }
    ],
    badges: ['Caixa 20 PCS', '5G Dual SIM', '8.4" Portátil'],
    specs: {
      tela: '8.4" IPS Full HD+',
      armazenamento: '256GB ROM',
      ram: '8GB RAM',
      bateria: '6.500 mAh com Carga Rápida 18W',
      processador: 'Octa-Core 2.2GHz High Performance',
      sistema: 'Android 14 com Suporte a Multi-Janelas',
      conectividade: '5G Standalone + 4G LTE Dual SIM + Wi-Fi 6'
    },
    bulletPoints: [
      'Caixa Master com 20 unidades lacradas',
      'Corpo metálico slim de 7.5mm com pegada ergonômica',
      'Excelente aceitação em revendas corporativas e equipes de campo'
    ]
  },
  {
    id: 'se-pro',
    sku: 'TB-SEPRO-5G',
    name: 'SE PRO — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 480.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Promoção',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 210,
    image: '/images/products/se-pro.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Ouro', hex: '#EAB308' }
    ],
    badges: ['Caixa 10 PCS', 'Custo-Benefício 5G', 'Android 14'],
    specs: {
      tela: '10.1" IPS HD 1280x800',
      armazenamento: '128GB ROM',
      ram: '6GB RAM',
      bateria: '7.000 mAh',
      processador: 'Octa-Core 2.0GHz',
      sistema: 'Android 14',
      conectividade: '5G + 4G Dual SIM + Wi-Fi Dual Band'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades com acessórios inclusos',
      'Melhor relação custo-benefício para tablets de 10 polegadas',
      'Alta liquidez e giro rápido no balcão de vendas'
    ]
  },
  {
    id: 's-t2',
    sku: 'TB-ST2-ULTRA',
    name: 'S-T2 — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 560.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Lançamento',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 190,
    image: '/images/products/s-t2.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Ouro', hex: '#EAB308' },
      { name: 'Vermelho', hex: '#EF4444' }
    ],
    badges: ['Caixa 10 PCS', 'Estrutura Reforçada', 'Bateria 8.000mAh'],
    specs: {
      tela: '10.5" 2K Ultra Retina (2000x1200)',
      armazenamento: '256GB ROM',
      ram: '8GB RAM',
      bateria: '8.000 mAh com Carregamento Rápido 20W',
      processador: 'Octa-Core 2.4GHz',
      sistema: 'Android 14 Pro',
      conectividade: '5G Dual SIM + Wi-Fi 6'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades',
      'Chassi com reforço perimetral para maior durabilidade',
      'Bateria de 8.000 mAh que suporta jornadas intensivas de trabalho'
    ]
  },
  {
    id: 'stab-9-pro',
    sku: 'TB-STAB9-PRO',
    name: 'STab 9 Pro — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 550.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Mais vendidos',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 320,
    image: '/images/products/stab-9-pro.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Vermelho', hex: '#EF4444' }
    ],
    badges: ['Caixa 10 PCS', '8GB + 512GB', 'Tela 11" 2K'],
    specs: {
      tela: '11.0" 2K IPS Crystal Display',
      armazenamento: '512GB ROM Alta Velocidade',
      ram: '8GB RAM LPDDR4X',
      bateria: '8.500 mAh',
      processador: 'Octa-Core 2.4GHz High Performance',
      sistema: 'Android 14 Edição Corporativa',
      conectividade: '5G Ultra Speed + Wi-Fi 6 + Bluetooth 5.2'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades com kit completo de fábrica',
      'Armazenamento massivo de 512GB com 8GB de RAM',
      'Tela grande de 11 polegadas com bordas ultrafinas'
    ]
  },
  {
    id: 'stab-max',
    sku: 'TB-STAB-MAX',
    name: 'STab-MAX — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 590.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Lançamento',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 180,
    image: '/images/products/stab-max.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Ouro', hex: '#EAB308' },
      { name: 'Vermelho', hex: '#EF4444' }
    ],
    badges: ['Caixa 10 PCS', 'Tela 11.6"', 'Bateria 9.000mAh'],
    specs: {
      tela: '11.6" Full HD+ IPS Vivid Color',
      armazenamento: '512GB ROM',
      ram: '8GB RAM',
      bateria: '9.000 mAh Ultra Battery',
      processador: 'Octa-Core 2.5GHz Flagship',
      sistema: 'Android 14',
      conectividade: '5G Dual SIM + Wi-Fi 6'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades lacradas',
      'Tela gigante de 11.6 polegadas perfeita para PDVs e escritórios',
      'Bateria monstro de 9.000 mAh com autonomia para até 2 dias'
    ]
  },
  {
    id: 'realmax',
    sku: 'TB-REALMAX-PREMIUM',
    name: 'RealMax — ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 610.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Mais vendidos',
    network: '5G',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 150,
    image: '/images/products/realmax.jpg',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' }
    ],
    badges: ['Caixa 10 PCS', 'Corpo Alumínio', '12GB RAM Otimizada'],
    specs: {
      tela: '11.0" 2.5K Ultra Retina Display',
      armazenamento: '512GB ROM UFS 2.2',
      ram: '12GB RAM (8GB Físico + 4GB Expansível)',
      bateria: '8.800 mAh com Carregamento Rápido 25W',
      processador: 'Octa-Core 2.6GHz Max Clock',
      sistema: 'Android 14 Pro Edition',
      conectividade: '5G Standalone + Wi-Fi 6E + Bluetooth 5.3'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades com acabamento topo de linha',
      'Chassi unibody em alumínio aeronáutico escovado',
      'Modelo premium mais procurado por clientes corporativos'
    ]
  },

  // --- 3. POWER BANKS & CARREGAMENTO RÁPIDO ---
  {
    id: 'pb-p100',
    sku: 'PB-P100-20K',
    name: 'Power Bank P100 — 20.000mAh',
    category: 'power-banks',
    categoryName: 'Power Banks & Acessórios',
    price: 75.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Mais vendidos',
    network: 'Turbo 22.5W',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 550,
    image: '/images/products/pb-p100.jpg',
    colors: [
      { name: 'Preto', hex: '#18181B' },
      { name: 'Branco', hex: '#FFFFFF', border: true }
    ],
    badges: ['Caixa 10 PCS', 'Carga Rápida 22.5W', 'Display Digital 100%'],
    specs: {
      capacidade: '20.000 mAh Real / Célula de Polímero de Lítio',
      potencia: '22.5W Turbo Fast Charging (QC 3.0 / PD 20W)',
      entradas: 'USB-C (PD 18W) + Micro-USB',
      saidas: '2x USB-A (22.5W) + 1x USB-C Bidirecional (20W)',
      display: 'Display Digital LED indicador de porcentagem exata',
      protecao: 'Circuito inteligente contra sobrecarga, curto e aquecimento',
      peso: '385g'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades com cabo incluso',
      'Alta rotatividade e giro imediato no ponto de venda',
      'Carrega até 3 aparelhos simultaneamente com segurança'
    ]
  },
  {
    id: 'pb-p200',
    sku: 'PB-P200-30K',
    name: 'Power Bank P200 — 30.000mAh | 22.5W',
    category: 'power-banks',
    categoryName: 'Power Banks & Acessórios',
    price: 100.00,
    minBatchQty: 10,
    boxUnitLabel: '1 Caixa Fechada (10 un.)',
    condition: 'Lançamento',
    network: 'Turbo 22.5W',
    status: 'available',
    statusLabel: 'Em estoque pronta-entrega',
    stockQty: 480,
    image: '/images/products/pb-p200.jpg',
    colors: [
      { name: 'Preto', hex: '#18181B' },
      { name: 'Branco', hex: '#FFFFFF', border: true }
    ],
    badges: ['Caixa 10 PCS', '30.000 mAh Real', 'Cabo Lightning + USB-C'],
    specs: {
      capacidade: '30.000 mAh Real / Grau A Premium',
      potencia: '22.5W Super Fast Charge + PD 20W',
      cabos_integrados: 'Cabo Lightning (iPhone) + Cabo USB-C acoplados',
      entradas: 'USB-C (18W) + Lightning (18W)',
      saidas: 'Cabo USB-C (22.5W) + Cabo Lightning (20W) + Porta USB-A (22.5W)',
      display: 'Painel Digital LED indicador de bateria',
      compatibilidade: 'Universal: iPhones, Samsung, Xiaomi, Tablets e Fones',
      peso: '540g'
    },
    bulletPoints: [
      'Caixa Master com 10 unidades com acabamento perolizado',
      '30.000 mAh capaz de carregar até 8 vezes um smartphone',
      'Produto de alto valor percebido e excelente margem de revenda'
    ]
  }
];
