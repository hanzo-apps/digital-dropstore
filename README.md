# Digital Dropstore

Sell digital downloads and drops — a real, buildable app you fork on
[hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud. List digital
drops (sound packs, presets, LUTs, UI kits, files), open a drop's detail page,
**claim** it (purchase stub — no payment taken), and build a personal library.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. A bold, dark-first "hype drop"
  aesthetic — acid-lime accents, typographic posters, no image assets.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. `drops` and `claims` are real Base
  collections provisioned from `schema.sql`.

It is deliberately small but complete: sign in → browse (or list) drops → open a
drop → claim it → find it in your library. Everything persists per-org in Base.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Views

- **Landing** (`src/views/signed-out.tsx`) — the storefront: bold hero, this
  week's lineup as poster cards, and a single PKCE sign-in action.
- **Drops** (`src/views/drops.tsx`) — the signed-in board: browse the org's
  drops as a poster grid, and list your own with the "+ List a drop" composer
  (name / price / file / description).
- **Detail** (`src/views/detail.tsx`) — a drop's full page: poster, price,
  description, delivered file, and the **claim** button (writes one `claims`
  row; flips to "In your library" and never double-claims).
- **My library** (`src/views/library.tsx`) — the drops you've claimed, joined
  from `claims` (filtered to you) against `drops`, with a download stub.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. "Ambient" means the app just reads the signed-in user via that token.

The one deploy requirement: the IAM client (`VITE_HANZO_CLIENT_ID`) must list
this origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every
forked app works, or register a dedicated `hanzo-<app>` client per app.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org (rule
`@request.auth.org_id = org`) — a teammate in your org sees the row; other orgs
cannot. This app's two collections:

- **`drops`** `(name, price, file, desc)` — the listed digital drops.
- **`claims`** `(drop, user)` — one row per claim; `drop` is a `drops.id` and
  `user` is the IAM user key, so "my library" is your own claims.

At runtime the views read/write these through `@hanzo/base/react`
(`useQuery`/`useMutation`) carrying the IAM token. Keep `schema.sql` in lockstep
with `src/data.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  ui.ts             the hype-drop palette + helpers, one place
  parts.tsx         shared @hanzo/gui atoms: Poster · Chip · PriceTag · Btn
  data.ts           Drop / Claim record types (lockstep with schema.sql)
  lib/base.ts       BaseClient carrying the IAM bearer token
  auth/callback.tsx PKCE return leg
  views/            signed-out · home · drops · detail · library
schema.sql          databaseSchema -> Base collections on publish (drops, claims)
hanzo.yml           Hanzo Cloud build/deploy manifest
```
