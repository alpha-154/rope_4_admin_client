# Rope4 Admin Panel Client

Next.js 14 App Router management dashboard for Rope4 staff and administrators to manage adventure programs, departures, gear shop catalog, inventory, orders, customer accounts, and site content.

---

## 🛠️ Tech Stack
* **Framework**: Next.js 14 (App Router) + TypeScript Strict Mode
* **Design System**: Tailwind CSS + Shadcn UI primitives + Lucide Icons
* **Data Fetching**: TanStack Query (React Query) with automatic caching and refetching
* **Forms & Validation**: React Hook Form + Zod validation
* **Data Tables**: Reusable DataTable with pagination, column visibility, sorting, and debounced search
* **Drag-and-Drop**: `@dnd-kit/core` & `@dnd-kit/sortable` for FAQ and itinerary reordering
* **Rich Text**: TipTap editor with markdown and formatting controls
* **Notifications**: Sonner toast system

---

## 🚀 Getting Started

### 1. Environment Configuration
```bash
cp .env.example .env
```
Ensure `NEXT_PUBLIC_API_URL` points to the backend (default: `http://localhost:5001/api/v1`).

### 2. Run Commands
```bash
# Run dev server on port 3001
npm run dev

# Run linting
npm run lint

# Production build
npm run build
```

---

## 📊 Admin Dashboard Features
* **Authentication**: Token storage with Axios request/response interceptors and auto-redirect on 401.
* **Programs Engine (`/programs`)**: Multi-tab form for overview, day-by-day itinerary repeater, departure calendar manager, pricing, and gallery uploads.
* **Gear Store Products (`/products`)**: Create and edit mountain gear, specifications, and SKU variations.
* **Inventory Movements (`/inventory`)**: Stock level monitoring, manual stock adjustments with audit movement logs.
* **Orders Pipeline (`/orders`)**: Order status management (`PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED`), tracking number assignment, and address inspection.
* **Customer Directory (`/customers`)**: View registered traveler accounts, shipping destinations, and lifetime gear spend.
* **Site Settings & CMS (`/settings`, `/forms`, `/news`, `/reviews`, `/faqs`)**: Header navigation builder, footer settings, form submission inboxes, and promotional popovers.
