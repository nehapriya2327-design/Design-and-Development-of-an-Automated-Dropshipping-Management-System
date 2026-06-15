dropship-automation/
│
├── app/
│   ├── page.tsx                   // Dashboard
│   └── api/
│       ├── products/
│       │   └── import/route.ts    // Import from Shopify
│       ├── categories/
│       │   └── route.ts           // Create/List categories
│       ├── list/
│       │   └── ebay/route.ts      // List on eBay
│
├── lib/
│   ├── prisma.ts                  // Prisma client
│   ├── shopify.ts                 // Shopify API helpers (optional)
│   ├── ebay.ts                    // eBay API helpers (optional)
│
├── components/
│   ├── ProductTable.tsx
│   ├── CategorySelector.tsx
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── tailwind.config.js
├── next.config.js
├── package.json
