# Harvest Wholesale

A full-stack restaurant wholesale e-commerce platform built with Next.js 16.2.0, the App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, NextAuth/Auth.js, Zod, React Hook Form, and server actions.

## 1. Project Architecture Overview

Harvest Wholesale is structured around a clear split between storefront, account, and admin domains:

- Public storefront for catalog browsing, product detail pages, cart management, and checkout
- Authenticated customer account area for order history and order detail tracking
- Protected admin console for products, categories, orders, customers, and high-level analytics
- Server actions for core mutations such as registration, product/category management, order placement, and order status updates
- Prisma-powered data access modules grouped by domain in `lib/data`
- Shared validation schemas in `lib/validations`
- Reusable UI and form components under `components/`
- Role protection handled at the edge through [`proxy.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/proxy.ts)

## 2. Prisma Schema

The Prisma schema lives in [`prisma/schema.prisma`](/f:/2026%20-%20Kasun/restaurant-ecommerce/prisma/schema.prisma) and includes:

- `User`: customer/admin account, profile, password hash, role, order history
- `Category`: product taxonomy with active state and descriptions
- `Product`: wholesale catalog records with SKU, price, stock, minimum order quantity, and active state
- `Address`: order shipping address snapshots linked to users
- `Order`: wholesale order header with order number, status, totals, notes, and shipping relation
- `OrderItem`: line items with unit price snapshots and quantity totals
- `Role` enum: `ADMIN`, `CUSTOMER`
- `OrderStatus` enum: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`

## 3. Folder Structure

```text
app/
  (store)/
    page.tsx
    products/
    cart/
    checkout/
    login/
    register/
    account/
  admin/
    page.tsx
    products/
    categories/
    orders/
    customers/
  api/auth/[...nextauth]/route.ts
components/
  forms/
  layout/
  providers/
  store/
  ui/
lib/
  actions/
  data/
  validations/
  auth-helpers.ts
  email.ts
  prisma.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
proxy.ts
.env.example
README.md
```

## 4. Implementation Files

Key implementation areas:

- Auth configuration: [`auth.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/auth.ts)
- Route protection: [`proxy.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/proxy.ts)
- Prisma client: [`lib/prisma.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/prisma.ts)
- Order creation flow: [`lib/actions/order-actions.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/actions/order-actions.ts)
- Product/category/order admin mutations: [`lib/actions/admin-actions.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/actions/admin-actions.ts)
- Registration flow: [`lib/actions/auth-actions.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/actions/auth-actions.ts)
- Email delivery and templates: [`lib/email.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/email.ts)
- Storefront queries: [`lib/data/store.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/data/store.ts)
- Account queries: [`lib/data/account.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/data/account.ts)
- Admin queries: [`lib/data/admin.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/lib/data/admin.ts)
- Seed data: [`prisma/seed.ts`](/f:/2026%20-%20Kasun/restaurant-ecommerce/prisma/seed.ts)

### Included Features

- Wholesale catalog with categories, filters, search, price range filtering, and pagination
- Product detail pages with MOQ, stock state, SKU, category, and bulk add-to-cart controls
- Client-side persistent cart with quantity controls and summary totals
- Checkout flow with server-side minimum quantity and stock validation before order creation
- Order confirmation and admin notification emails
- Customer registration/login and account order tracking
- Admin analytics cards for products, orders, customers, and revenue summary
- Product, category, order, and customer management screens
- Seeded restaurant-relevant wholesale products and demo users

## 5. Setup Instructions

### Requirements

- Node.js 24+
- PostgreSQL
- npm

### Environment

Copy [.env.example](/f:/2026%20-%20Kasun/restaurant-ecommerce/.env.example) to `.env` and update values.

Required database/auth variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Email options:

- Use `RESEND_API_KEY` for Resend
- Or configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` for Nodemailer
- Admin notifications go to `ADMIN_NOTIFICATION_EMAIL`

### Install and Run

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

### Demo Seed Credentials

Admin:

- Email: `admin@harvestwholesale.com`
- Password: `Admin@12345`

Customer:

- Email: `buyer@sunsetbistro.com`
- Password: `Customer@12345`

### Validation Commands

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes

- The project uses `next-auth@beta` because this foundation targets Next.js 16.2.0 and the Auth.js v5 API shape.
- Storefront/admin data queries opt out of build-time caching so Prisma access happens at request time.
- Product images use a passthrough `next/image` wrapper so remote URLs can be used immediately without hardcoding a single image host.
