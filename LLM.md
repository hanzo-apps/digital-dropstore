# digital-dropstore — agent notes

A real Hanzo-stack app: a hype digital dropstore. List digital drops (packs,
presets, LUTs, files), open a drop's detail, claim it (purchase stub), and see
your library. Forked from the canonical `hanzo-starter`.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it minimal and REAL — every surface builds and runs, no fabricated UI.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. Auth
  reads `VITE_HANZO_CLIENT_ID` (fallback `hanzo-app`).
- **The look is one place** (`src/ui.ts`) — the hype-drop palette (near-black
  canvas, acid-lime primary, coral/cyan accents) + helpers. **UI atoms are one
  place** (`src/parts.tsx`): `Poster`, `Chip`, `PriceTag`, `Eyebrow`, `Btn`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Views: `signed-out` (landing), `home` (shell + nav), `drops`
  (grid + composer), `detail` (claim stub), `library` (owned drops).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
- **`Button` takes stack styles only — no `color` prop and no `color` in
  `hoverStyle`/`pressStyle`.** Text color/weight live on `Button.Text`. That is
  exactly what `Btn` in `src/parts.tsx` wraps — route every colored button
  through it (flat `bg`/`fg`/`border` props).
- **`Input.placeholderTextColor` wants a `ColorTokens`, not a hex string.** Omit
  it (the themed default is fine) rather than pass a raw hex.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/data.ts` and the views: `drops(name,price,file,desc)` and
  `claims(drop,user)`.

## Data model

- `drops` — a listed digital drop. Written by the composer in `drops.tsx`, read
  by `drops`/`detail`/`library`. Org-scoped: your whole org sees the lineup.
- `claims` — one row per claim, `{ drop: Drop.id, user: <IAM user key> }`.
  Written by `detail.tsx` (the claim stub), read by `library.tsx` filtered to
  the caller. `me = user.id || user.name || user.email`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (a `https://*.hanzo.app/auth/callback` wildcard, or a
  per-app `hanzo-<app>` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · `login()` performs a real PKCE
S256 redirect to `https://hanzo.id`. CI (`.github/workflows/ci.yml`) runs
`npm ci && npm run typecheck && npm run build` — build-verification only, NEVER a
container image (Hanzo Cloud owns deploys; do not build images locally).
