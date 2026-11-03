# Rope4 Admin Panel Client

Next.js management panel for Rope4 staff and administrators to manage adventure programs, departures, gear shop catalog, inventory, orders, customer accounts, and site content.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript Strict
- **Styling**: Tailwind CSS + Shadcn UI primitives + Lucide Icons
- **Server State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Rich Text**: TipTap Editor
- **Reordering**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Theme**: Light & Dark mode via `next-themes`

## Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_ORGANIZATION_ID=default-org-id
```

### 2. Run Commands
```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

