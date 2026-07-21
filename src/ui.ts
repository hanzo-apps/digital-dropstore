/**
 * The one place the Dropstore look is defined — a hype-drop palette (near-black
 * canvas, acid-lime primary, coral/cyan heat accents) plus the two shared
 * shapes every surface reuses. @hanzo/gui primitives render against these hex
 * values via Tamagui LONGHAND props (backgroundColor/borderColor/color), so the
 * bold dark-card aesthetic stays consistent and DRY across the three views.
 */

export const palette = {
  ink: '#08080A', // canvas — near black
  panel: '#101014', // raised surface
  card: '#161619', // drop card
  line: '#26262D', // hairline border
  lineSoft: '#1D1D22', // quieter border
  text: '#F4F4F5', // primary text
  mute: '#8A8A94', // secondary text
  faint: '#5B5B64', // tertiary text
  acid: '#D2FF3A', // primary — acid lime
  acidInk: '#0B0F00', // text on acid
  coral: '#FF5C39', // heat accent
  cyan: '#2BE8D6', // cool accent
  violet: '#B69CFF', // extra accent
} as const

/** Cover accents cycled across drop posters so a grid never looks flat. */
export const covers = [palette.acid, palette.coral, palette.cyan, palette.violet] as const

/** Deterministic cover accent for a drop, keyed by any stable string. */
export function accentFor(key: string): string {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return covers[h % covers.length]
}

/** First glyph of a name, upper-cased, for the poster monogram. */
export function monogram(name: string): string {
  const c = name.trim()[0]
  return c ? c.toUpperCase() : '·'
}

/** A drop with no price is a free claim; otherwise show the money. */
export function priceLabel(price: string): string {
  const p = price.trim()
  if (!p) return 'FREE'
  return /^[$€£]/.test(p) ? p : `$${p}`
}
