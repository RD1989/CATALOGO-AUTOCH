const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir('src/components');
ensureDir('src/data');
ensureDir('public/images/products');

// 1. vite.config.js
fs.writeFileSync('vite.config.js', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  }
});
`);

// 2. index.html
fs.writeFileSync('index.html', `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ATACADO TECH - Catálogo B2B de Eletrônicos</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F8FAFC] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

// 3. tailwind.config.js
fs.writeFileSync('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0055FF',
          hover: '#0043CC',
          light: '#EFF6FF',
        }
      }
    },
  },
  plugins: [],
}
`);

// 4. postcss.config.js
fs.writeFileSync('postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

// 5. src/index.css
fs.writeFileSync('src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`);

// 6. src/data/products.js
fs.writeFileSync('src/data/products.js', `export const CATEGORIES = [
  { id: 'all', name: 'Todos os Produtos', count: 30, icon: 'LayoutGrid' },
  { id: 'tablets-infantis', name: 'Tablets Infantis', count: 6, icon: 'Gamepad2' },
  { id: 'tablets-profissionais', name: 'Tablets Profissionais', count: 6, icon: 'Laptop' },
  { id: 'power-banks', name: 'Power Banks', count: 6, icon: 'BatteryCharging' },
];

export const PRODUCTS = [
  // --- Tablets Infantis ---
  {
    id: 'q39-pro',
    name: 'Q39 PRO - ATACADO',
    category: 'tablets-infantis',
    categoryName: 'Tablets Infantis',
    price: 250.00,
    minBatchQty: 20,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/q39-pro.png',
    network: 'Wi-Fi',
    condition: 'Lançamento',
    colors: [
      { name: 'Rosa', hex: '#F472B6' },
      { name: 'Azul', hex: '#3B82F6' }
    ],
    sku: 'TB-Q39PRO-AT',
    specs: {
      tela: '7 polegadas HD',
      processador: 'Quad-Core 1.5GHz',
      memoria: '2GB RAM + 32GB',
      bateria: '3.000mAh',
      recursos: 'Capa protetora emborrachada antiqueda com orelhas interativas e suporte'
    }
  },
  {
    id: 'kt-10',
    name: 'KT 10 - ATACADO',
    category: 'tablets-infantis',
    categoryName: 'Tablets Infantis',
    price: 380.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/kt-10.png',
    network: 'Wi-Fi',
    condition: 'Mais vendidos',
    colors: [
      { name: 'Rosa', hex: '#F472B6' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Laranja', hex: '#F97316' }
    ],
    sku: 'TB-KT10-AT',
    specs: {
      tela: '8 polegadas IPS',
      processador: 'Quad-Core 1.6GHz',
      memoria: '3GB RAM + 64GB',
      bateria: '4.000mAh',
      recursos: 'Alça embutida giratória e capa reforçada de alta densidade'
    }
  },
  {
    id: 'x19pro',
    name: 'X19PRO - ATACADO',
    category: 'tablets-infantis',
    categoryName: 'Tablets Infantis',
    price: 450.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/x19pro.png',
    network: '4G / LTE',
    condition: 'Lançamento',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Branco', hex: '#FFFFFF' },
      { name: 'Azul', hex: '#3B82F6' }
    ],
    sku: 'TB-X19PRO-AT',
    specs: {
      tela: '8.5 polegadas IPS HD',
      processador: 'Octa-Core 2.0GHz',
      memoria: '4GB RAM + 64GB',
      bateria: '5.000mAh',
      recursos: 'Design estilo dragão/dinossauro com botões reforçados e controle parental'
    }
  },

  // --- Tablets Profissionais ---
  {
    id: 'a-tab8',
    name: 'A TAB8 - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 540.00,
    minBatchQty: 20,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/a-tab8.png',
    network: '4G / LTE',
    condition: 'Mais vendidos',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Branco', hex: '#FFFFFF' },
      { name: 'Azul', hex: '#3B82F6' }
    ],
    sku: 'TB-ATAB8-AT',
    specs: {
      tela: '10.1 polegadas IPS Full HD',
      processador: 'Octa-Core 2.0GHz',
      memoria: '4GB RAM + 64GB',
      bateria: '6.000mAh',
      recursos: 'Acompanha Capa Teclado magnética e Caneta Stylus de alta precisão'
    }
  },
  {
    id: 'se-pro',
    name: 'SE PRO - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 480.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/se-pro.png',
    network: 'Wi-Fi',
    condition: 'Promoção',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Ouro', hex: '#EAB308' },
      { name: 'Verde', hex: '#84CC16' }
    ],
    sku: 'TB-SEPRO-AT',
    specs: {
      tela: '10.1 polegadas IPS',
      processador: 'Octa-Core 1.8GHz',
      memoria: '4GB RAM + 64GB',
      bateria: '6.000mAh',
      recursos: 'Acabamento premium metálico, Capa com teclado e caneta touch'
    }
  },
  {
    id: 's-t2',
    name: 'S-T2 - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 560.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/s-t2.png',
    network: '5G',
    condition: 'Mais vendidos',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Vermelho', hex: '#EF4444' },
      { name: 'Ouro', hex: '#EAB308' }
    ],
    sku: 'TB-ST2-AT',
    specs: {
      tela: '10.4 polegadas 2K IPS',
      processador: 'Octa-Core 2.2GHz',
      memoria: '6GB RAM + 128GB',
      bateria: '7.000mAh',
      recursos: 'Conectividade ultrarrápida 5G, Capa Teclado Bluetooth e Caneta Ativa'
    }
  },
  {
    id: 'stab-9-pro',
    name: 'STab 9 Pro - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 550.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/stab-9-pro.png',
    network: '5G',
    condition: 'Lançamento',
    badges: ['8GB RAM', '512GB ROM', '11" Polegadas'],
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' }
    ],
    sku: 'TB-STAB9PRO-AT',
    specs: {
      tela: '11 polegadas Ultra HD 120Hz',
      processador: 'Snapdragon Octa-Core',
      memoria: '8GB RAM + 512GB Armazenamento',
      bateria: '8.000mAh',
      recursos: 'Super desempenho multitarefas, Capa inteligente com teclado e Stylus'
    }
  },
  {
    id: 'stab-max',
    name: 'STab-MAX - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 590.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/stab-max.png',
    network: '5G',
    condition: 'Mais vendidos',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' },
      { name: 'Azul', hex: '#3B82F6' },
      { name: 'Vermelho', hex: '#EF4444' },
      { name: 'Ouro', hex: '#EAB308' }
    ],
    sku: 'TB-STABMAX-AT',
    specs: {
      tela: '11 polegadas FullView IPS',
      processador: 'Octa-Core 2.4GHz',
      memoria: '8GB RAM + 256GB',
      bateria: '8.200mAh Carga Rápida',
      recursos: 'Kit completo de produtividade com teclado, mouse e caneta'
    }
  },
  {
    id: 'realmax',
    name: 'RealMax - ATACADO',
    category: 'tablets-profissionais',
    categoryName: 'Tablets Profissionais',
    price: 610.00,
    minBatchQty: 10,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/realmax.png',
    network: '5G',
    condition: 'Mais vendidos',
    colors: [
      { name: 'Cinza', hex: '#9CA3AF' }
    ],
    sku: 'TB-REALMAX-AT',
    specs: {
      tela: '11 polegadas AMOLED 2K',
      processador: 'Octa-Core High Performance',
      memoria: '8GB RAM + 256GB',
      bateria: '8.500mAh',
      recursos: 'Corpo ultrafino em alumínio espacial com capa teclado magnética'
    }
  },

  // --- Power Banks ---
  {
    id: 'powerbank-p100',
    name: 'Power Bank P100 – 20.000mAh',
    category: 'power-banks',
    categoryName: 'Power Banks',
    price: 75.00,
    minBatchQty: 20,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/powerbank-p100.png',
    network: 'Acessório',
    condition: 'Mais vendidos',
    isHorizontal: true,
    bulletPoints: [
      'Entradas: Tipo-C e Micro USB',
      'Saídas: USB + Tipo-C',
      'Proteção contra sobrecarga e curto-circuito'
    ],
    colors: [
      { name: 'Preto', hex: '#18181B' },
      { name: 'Branco', hex: '#FFFFFF' }
    ],
    sku: 'PB-P100-20K',
    specs: {
      capacidade: '20.000mAh',
      potencia: '22.5W',
      entradas: 'Tipo-C / Micro-USB',
      saidas: 'USB 3.0 + USB Tipo-C',
      display: 'Display digital LED indicador de carga percentual'
    }
  },
  {
    id: 'powerbank-p200',
    name: 'Power Bank P200 – 30.000mAh | 22.5W',
    category: 'power-banks',
    categoryName: 'Power Banks',
    price: 100.00,
    minBatchQty: 20,
    status: 'AVAILABLE',
    statusLabel: 'Em estoque',
    image: '/images/products/powerbank-p200.png',
    network: 'Acessório',
    condition: 'Lançamento',
    isHorizontal: true,
    bulletPoints: [
      'Carregamento rápido 22.5W',
      'Múltiplas saídas (USB, Tipo-C e Lightning)',
      'Display digital'
    ],
    colors: [
      { name: 'Preto', hex: '#18181B' },
      { name: 'Branco', hex: '#FFFFFF' }
    ],
    sku: 'PB-P200-30K',
    specs: {
      capacidade: '30.000mAh',
      potencia: '22.5W Turbo Charge',
      entradas: 'Tipo-C e Micro-USB',
      saidas: '2x USB + 1x Tipo-C + 1x Lightning',
      display: 'Display digital percentual de precisão'
    }
  }
];
`);

console.log('Setup script created products and config.');
