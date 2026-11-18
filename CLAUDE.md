# rope-4-admin-panel-client

Next.js 14 (App Router) admin panel for rope-4 staff. Talks only to rope-4-admin-panel-backend.
Workspace rules: `../CLAUDE.md`.

## Commands
- Dev: `npm run dev` (port 3001; login at /login, see `../README.md` for seed accounts)
- Type-check: `npx tsc --noEmit` · Lint: `npm run lint`
- Build: `npm run build` (only with the dev server stopped: both use `.next`)
- No test suite: verify with tsc, lint and clicking through the page in the preview.

## Layout
- `app/(auth)/login`: staff login. `app/(dashboard)/layout.tsx`: shell (sidebar, navbar, auth gate).
- `app/(dashboard)/<resource>/page.tsx` + `_components/` (`columns.tsx`, `<resource>-dialog.tsx`
  or `<resource>-form.tsx`). Large editors use `create/page.tsx` and `edit/[id]/page.tsx`
  (programs, news).
- `components/ui/<component>/<component>.tsx`: shadcn/Radix primitives. Import with the full path,
  e.g. `@/components/ui/button/button`.
- `components/shared/`: `data-table/` (TanStack Table wrapper with pagination/sort/toolbar),
  `delete-alert.tsx`, `tiptap-editor.tsx` (rich text), `upload-files.tsx` (POST admin/storage/upload).
- `components/layout/sidebar.tsx`: navigation groups. Add new pages here.
- `lib/axios.ts`: `apiClient` (base `NEXT_PUBLIC_API_URL`, adds Bearer token + `x-organization-id`,
  refreshes on 401 via `/admin/auth/refresh`, logs out on failure).
- `lib/auth-context.tsx`: `useAuth()` with user, organization, login/logout. Tokens in localStorage.
- `constants/data-table.ts`, `hooks/` (use-debounced, use-toast, use-mobile).

## Conventions
- Pages are client components (`"use client"`) that fetch with `apiClient` in `useCallback` +
  `useEffect` and keep list state locally. React Query is installed but not used: follow the
  existing pattern unless I ask to migrate.
- Lists use server-side pagination: send `page`, `limit`, `search`, `sort` (`-field` for desc);
  read `res.data.data` and `res.data.meta.total`.
- Forms: most dialogs keep form state in `useState`; login and organization profile use
  react-hook-form + zod. Follow the pattern of the page you are editing. Field names sent to the
  API must match the backend DTO exactly (unknown fields are rejected with 400).
- Feedback: `toast` from `sonner`, error text from `err.response?.data?.message`.
- Reordering uses the backend's `/:id/reorder` endpoints (fractional index), not local sorting.
- Icons: lucide-react. Styling: Tailwind + `cn()` from `lib/utils.ts`; dark mode via next-themes.
- Style: Prettier with double quotes (`.prettierrc`).
