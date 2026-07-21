/**
 * Shared Dropstore UI atoms, built ONLY from @hanzo/gui primitives with Tamagui
 * LONGHAND props. No image assets — a drop "cover" is a bold typographic poster
 * (solid accent + monogram) so the store renders offline and stays on-brand.
 */
import type { ReactNode } from 'react'
import { YStack, XStack, Text, Button } from '@hanzo/gui'
import { palette, monogram } from './ui'

/**
 * The one way to render a colored button. @hanzo/gui's `Button` takes stack
 * styles only — text color/weight live on `Button.Text`, so this wraps both and
 * exposes flat `bg`/`fg`/`border` props. Every button in the app goes through
 * here, keeping the hype look consistent.
 */
export function Btn({
  children,
  onPress,
  bg,
  fg,
  border,
  size = '$4',
  weight = '800',
  disabled = false,
  grow = false,
}: {
  children: string
  onPress: () => void
  bg: string
  fg: string
  border?: string
  size?: '$3' | '$4' | '$5'
  weight?: '700' | '800' | '900'
  disabled?: boolean
  grow?: boolean
}) {
  return (
    <Button
      size={size}
      backgroundColor={bg}
      borderWidth={border ? 1 : 0}
      borderColor={border ?? 'transparent'}
      borderRadius={12}
      flexGrow={grow ? 1 : undefined}
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      pressStyle={{ opacity: 0.82 }}
      hoverStyle={{ opacity: 0.92 }}
      onPress={onPress}
    >
      <Button.Text color={fg} fontWeight={weight} letterSpacing={0.2}>
        {children}
      </Button.Text>
    </Button>
  )
}

/** A drop poster: solid accent block, "DROP" kicker, and the name monogram. */
export function Poster({
  name,
  accent,
  height = 150,
  badge,
}: {
  name: string
  accent: string
  height?: number
  badge?: string
}) {
  return (
    <YStack
      height={height}
      borderRadius={14}
      overflow="hidden"
      backgroundColor={accent}
      padding={16}
      justifyContent="space-between"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={11} fontWeight="800" letterSpacing={3} color={palette.ink} opacity={0.65}>
          DROP
        </Text>
        {badge ? (
          <Text fontSize={12} fontWeight="900" color={palette.ink} opacity={0.8}>
            {badge}
          </Text>
        ) : null}
      </XStack>
      <Text fontSize={Math.round(height * 0.42)} lineHeight={Math.round(height * 0.42)} fontWeight="900" color={palette.ink}>
        {monogram(name)}
      </Text>
    </YStack>
  )
}

/** A small pill label — quiet by default, or filled with an accent tone. */
export function Chip({ label, tone, filled = false }: { label: string; tone?: string; filled?: boolean }) {
  const accent = tone ?? palette.mute
  return (
    <XStack
      alignItems="center"
      paddingHorizontal={10}
      paddingVertical={4}
      borderRadius={999}
      backgroundColor={filled ? accent : 'transparent'}
      borderWidth={1}
      borderColor={filled ? accent : palette.line}
    >
      <Text
        fontSize={10}
        fontWeight="800"
        letterSpacing={1.4}
        textTransform="uppercase"
        color={filled ? palette.ink : accent}
      >
        {label}
      </Text>
    </XStack>
  )
}

/** The money — bold, accent-colored, right-aligned in card footers. */
export function PriceTag({ price, accent = palette.acid }: { price: string; accent?: string }) {
  return (
    <Text fontSize={18} fontWeight="900" letterSpacing={0.3} color={accent}>
      {price}
    </Text>
  )
}

/** A thin uppercase section eyebrow used above every block. */
export function Eyebrow({ children, color = palette.acid }: { children: ReactNode; color?: string }) {
  return (
    <Text fontSize={11} fontWeight="800" letterSpacing={3} textTransform="uppercase" color={color}>
      {children}
    </Text>
  )
}
