# NetWise Payment Dashboard

Branded for **NetWise** ("Think Smart. Connect Wise.") -- a standalone,
premium-styled merchant dashboard for their payment gateway integration:
dashboard, cash-ins, cash-outs, and settings/access management, backed by
a real local database (Prisma + SQLite). Not connected to any external
gateway yet -- every table starts genuinely empty, and the withdrawal
form and access-grant form write real rows through the API routes below.

This project is fully independent -- it has its own `package.json` and
does not depend on any other project on this machine (including the
generic template it was copied from).

## Run it locally

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema (first run only)
npm run dev
```

Then open http://localhost:3000 (or whichever `PORT` you set).

## Data layer

- `prisma/schema.prisma` -- the schema: `CashIn`, `CashOut`,
  `AccessGrant`, and a singleton `GatewayConfig` row (payout limits,
  processing fee, cash-outs on/off).
- SQLite for local dev (`dev.db`, gitignored) -- zero external services
  to run this. Swap the `datasource` provider/url in `prisma.config.ts`
  and `.env` to point at Postgres/MySQL for production; the schema and
  every query stay the same.
- `src/lib/prisma.ts` -- the Prisma client singleton, wired through the
  libSQL driver adapter (Prisma 7 requires an explicit adapter; libSQL
  was chosen over `better-sqlite3` because it ships prebuilt binaries --
  no Visual Studio Build Tools needed on Windows).
- `src/lib/config.ts` -- `getGatewayConfig()` lazily creates the
  singleton config row with sane defaults on first read, so there's no
  seed step to remember.
- `src/app/api/` -- REST routes backing the write actions:
  - `GET /api/cash-ins`
  - `GET/POST /api/cash-outs` -- POST validates against the real
    configured min/max/enabled before writing a row
  - `GET/POST /api/access`, `DELETE /api/access/[email]`
  - `GET /api/config`

Every page (`src/app/page.tsx`, `cash-ins`, `cash-outs`, `settings`) is
an async server component querying Prisma directly and exports
`export const dynamic = "force-dynamic"` -- without that, Next.js
prerenders the page once at build time and every visitor sees whatever
was in the database during `next build`, not live data.

## Structure

- `src/app/page.tsx` -- Dashboard (metric cards computed from real
  aggregates + recent activity)
- `src/app/cash-ins/page.tsx` -- Cash-in records table
- `src/app/cash-outs/page.tsx` + `cash-out-form.tsx` -- Payout history +
  withdrawal form (POSTs to `/api/cash-outs`)
- `src/app/settings/page.tsx` + `access-list.tsx` -- Payout config +
  access management (POSTs/DELETEs against `/api/access`)
- `src/components/` -- Shared shell, sidebar, metric card, status badge,
  and the `ui.module.css` design system (cards, tables, forms, badges)
- `src/lib/banks.ts` -- Static reference list for the bank/e-wallet
  dropdown (not transaction data -- replace with your real gateway's
  supported bank list)
- `src/lib/format.ts` -- Currency/date formatting helpers

## Rebranding for a different client

This copy is already branded for NetWise -- to re-skin it for someone
else instead (or to pull a fresh copy from the generic template):

1. `src/components/sidebar.tsx` -- swap the node/network mark and
   "NetWise" name for the client's own brand.
2. `src/app/globals.css` -- the `:root` block holds every color as a CSS
   variable (`--accent`, `--accent-secondary`, `--sidebar-bg`, etc.).
   Change these to match the client's brand palette and the whole
   dashboard restyles consistently.
3. `src/app/layout.tsx` -- update the page `<title>`/description.
4. `prisma/schema.prisma` -- add/remove fields as the new client's real
   gateway data actually looks like, then `npx prisma migrate dev`.

## NetWise brand palette

- `--accent` `#0ea5e9` / `--accent-secondary` `#22d3ee` -- the blue-to-cyan
  gradient used on the sidebar mark, matching the NetWise logo's node
  network icon.
- `--sidebar-bg` `#0b1220` -- deep navy, matching the logo's dark
  background.

## Design notes

- Sidebar-driven layout (not top tabs) -- standard for merchant/finance
  dashboards, scales better once more sections get added.
- One accent color (`--accent`) plus semantic success/warning/danger
  tokens drive every status badge, trend indicator, and button --
  changing the accent alone re-themes most of the UI.
- No external font or icon library -- ships with a clean system font
  stack and small inline SVG icons, so there's nothing to fetch and
  nothing that can silently 404.
