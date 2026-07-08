# BlueFire — Brand System

The single source of truth for the BlueFire identity. A living version of this
document renders at **`/brand`** (built from the real components, theme-aware).

---

## 1. Essence

**Water made by heat.** BlueFire condenses drinking water from the air a building
already moves, then returns the energy as cooling and hot water — one machine,
three utilities. The identity is **cinematic-industrial and thermodynamic**: deep
navy void, cyan condensation, an ember of the heat that drives the cycle.

Tone: confident, precise, quietly technical. We show the numbers.

---

## 2. Logo

The **LogoMark** is a water droplet with a flame cut into its core (`src/components/brand/assets.tsx`,
also `src/app/icon.svg`). The flame is why the droplet exists.

- **Clearspace**: at least half the mark's width on all sides.
- **Minimum size**: 20px.
- **Wordmark**: "BlueFire" set in Archivo, expanded (`font-stretch: 116–120%`),
  uppercase, `letter-spacing: 0.14–0.2em`, weight ~760.
- **Don't**: recolor the gradient, add effects, stretch, or place the mark on a
  busy photo without a scrim.
- **Favicon set**: `src/app/icon.svg` + generated `icon.png` / `apple-icon.png`
  (regenerate with `node scripts/generate-icons.mjs`).

---

## 3. Color

Roles: **cyan = interactive**, **ember = high-emphasis / heat**, borders are
**hairlines** (low-alpha, never solid slabs). Everything is a CSS token in
`src/app/globals.css` — never hardcode hex in components.

### Core palette

| Name | Hex | Role |
|---|---|---|
| Void | `#04070e` | dark background |
| Ice | `#eaf5ff` | dark headings |
| Cyan | `#56d9ff` | primary / interactive |
| Aqua | `#19a8e6` | secondary series |
| Blue | `#1467d2` | light-theme primary |
| Ember | `#ff7847` | accent / heat |
| Amber | `#ffb35c` | warning |

### Tokens → utilities

Every color is exposed as a CSS var and a Tailwind utility, theme-aware:

| Token (CSS var) | Tailwind utility | Dark | Light |
|---|---|---|---|
| `--background` | `bg-background` | `#04070e` | `#f4f9ff` |
| `--surface` | `bg-surface` | `#0a1424` | `#ffffff` |
| `--surface-elevated` | `bg-surface-elevated` | `#0e1c33` | `#ffffff` |
| `--surface-muted` | `bg-surface-muted` | `#071120` | `#e8f1fb` |
| `--border` | `border-border` | `rgba(140,190,255,.13)` | `rgba(11,27,54,.12)` |
| `--text-primary` | `text-text-primary` | `#eaf5ff` | `#0b1b36` |
| `--text-secondary` | `text-text-secondary` | `rgba(199,224,248,.74)` | `rgba(11,27,54,.74)` |
| `--text-muted` | `text-text-muted` | `rgba(158,195,232,.62)` | `rgba(11,27,54,.64)` |
| `--text-on-brand` | `text-on-brand` | `#051220` (ink) | `#ffffff` |
| `--brand-primary` | `text/bg-brand-primary` | `#56d9ff` | `#1467d2` |
| `--brand-secondary` | `text/bg-brand-secondary` | `#19a8e6` | `#0d76ac` |
| `--accent` | `text/bg-accent` | `#ff7847` | `#c94a10` |
| `--success` | `text/bg-success` | `#35e0c0` | `#0b8163` |
| `--warning` | `text/bg-warning` | `#ffb35c` | `#a35f00` |
| `--danger` | `text/bg-danger` | `#ff6b76` | `#d7263d` |
| `--info` | `text/bg-info` | `#56d9ff` | `#0b76ad` |

**Critical rule — `--text-on-brand` is dark ink in the dark theme.** Cyan/ember/
status fills are light, so text on them must be ink. Only use `text-on-brand` on
a brand or status fill; use `text-white` on photo/black overlays.

Contrast: body text and UI labels meet WCAG AA in both themes (ink on cyan ≈ 11:1,
mist on surface ≈ 7.8:1, ink on white light-primary ≈ 5.4:1).

---

## 4. Typography

Three self-hosted typefaces (`src/app/fonts.ts`, vendored woff2 in `src/fonts/`):

- **Archivo** (variable, width + weight axes) — the whole UI and display system.
  - Display: `font-stretch: 116%`, weight ~720, uppercase (`.display-caps`, `.section-header`).
  - UI: `font-stretch: 100%`, weight ~430.
  - Condensed data: `font-stretch: 82–92%` for big tabular figures.
- **Instrument Serif** italic — rare editorial accents (`.serif-italic`): auth
  subheads, a single emphatic line. Never for UI or data.
- **Geist Mono** — micro-labels and tabular data. `letter-spacing: 0.14–0.2em`,
  uppercase for labels; `tabular-nums` for figures (`.mono-label`, `.kicker`,
  `font-mono`).

Note: the Tailwind default `font-sans`/`font-serif` keys don't override cleanly in
Tailwind v4, so base type is set on `body`/`h1–h6` directly and serif via
`.serif-italic`. `font-mono` and `font-display` utilities work.

---

## 5. Space, radius, line

- **Grid**: 4px base.
- **Radius**: pill (`rounded-full`) for actions, 12px (`rounded-xl`) for cards,
  ~3px for chips.
- **Lines**: 1px hairlines at ~13% alpha (`--border`). Prefer a hairline or a
  1px gap over a heavy divider. Grouped cards use `gap-px` on a `bg-border` grid.
- **Kickers**: number the section — `01 / SECTION` with a cyan index and a
  hairline dash (`.kicker`). We use `◇` as a generic index marker.

---

## 6. Motion

Purposeful, never decorative in the app (the landing is the cinematic exception).

- **UI transitions**: 200–300ms.
- **Content reveals**: 600–1100ms, staggered (`.stagger-rise`, `.page-enter`).
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Only** animate `opacity` and `transform`.
- **Always** honor `prefers-reduced-motion` (all motion classes are gated).
- No looping decorative animation in the app.

---

## 7. Voice

Confident, precise, thermodynamic. Sentence-case in the UI; mono caps for labels.
Lead with the number.

- **Do**: "Pure water, out of thin air." · "One machine, three utilities." · "10,000 L / day"
- **Don't**: exclamation spam, buzzwords ("synergistic", "leverage"), or **emoji**.

**No emoji anywhere in the product UI.** Use the stroke icons in
`src/components/brand/assets.tsx` for domain concepts (drop / flame / snow / wind)
and Heroicons (24/outline) for generic UI.

---

## 8. Components (quick reference)

Token-driven primitives — never restyle per call site; extend the primitive.

- `ui/Button` — pill, mono caps, fill-sweep. Variants: primary, accent, secondary,
  outline, ghost, success, warning, error. Sizes: sm / md / lg.
- `ui/Badge` — mono-caps status pill with a hairline.
- `ui/Card` — default / frosted (glass) / elevated / gradient.
- `StatCard` — mono label + tabular value + trend tone.
- `ui/ProgressBar`, `ui/Slider` — cyan fill on a muted track.
- `ui/Skeleton`, `BrandSpinner` — loading states.
- `ui/EmptyState` — dashed hairline, icon, action.
- `AuthShell` — brand atmosphere around auth forms.
- `lib/chart-theme.ts` — the one place chart colors/typography live.

---

## 9. Assets & regeneration

- Logo + icons: `src/components/brand/assets.tsx`.
- Favicon: `src/app/icon.svg`; rasters via `node scripts/generate-icons.mjs`.
- Fonts: `src/app/fonts.ts` (+ `src/fonts/*.woff2`).
- Tokens & helpers: `src/app/globals.css`.
- Live guide: `/brand`.
