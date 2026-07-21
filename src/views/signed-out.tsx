import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text } from '@hanzo/gui'
import { palette } from '../ui'
import { Poster, Chip, PriceTag, Eyebrow, Btn } from '../parts'

/** The week's lineup shown on the landing — a showcase of the concept, not live
 *  Base data (that loads once you sign in). Copy makes the framing honest. */
const LINEUP = [
  { name: 'Neon Synth Pack', kind: 'Preset pack', price: '$24', accent: palette.acid, badge: '01' },
  { name: 'Grain & Halation LUTs', kind: 'Color grade', price: '$18', accent: palette.coral, badge: '02' },
  { name: 'Brutalist UI Kit', kind: 'Figma file', price: '$39', accent: palette.cyan, badge: '03' },
]

/**
 * Signed-out landing — the hype drop storefront. Bold type, dark-first cards,
 * one action: PKCE sign-in with Hanzo (hanzo.id). There is no local credential
 * form — Hanzo IAM owns every credential interaction. Claiming a drop, listing
 * your own, and your library all live behind sign-in.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={palette.ink}>
      {/* top bar */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$5"
        paddingVertical="$4"
        borderBottomWidth={1}
        borderColor={palette.lineSoft}
      >
        <XStack alignItems="center" gap="$2.5">
          <YStack width={22} height={22} borderRadius={7} backgroundColor={palette.acid} />
          <Text fontSize={17} fontWeight="900" letterSpacing={1} color={palette.text}>
            DROPSTORE
          </Text>
        </XStack>
        <XStack alignItems="center" gap="$2">
          <Chip label="● Live now" tone={palette.acid} filled />
          <Text fontSize={12} fontWeight="700" color={palette.faint}>
            Fork on hanzo.app
          </Text>
        </XStack>
      </XStack>

      {/* hero */}
      <YStack alignItems="center" paddingHorizontal="$5" width="100%">
        <YStack width="100%" maxWidth={1120} paddingVertical="$8" gap="$8">
          <YStack gap="$5" maxWidth={760}>
            <Eyebrow>Drop 042 — open for 23:59:00</Eyebrow>
            <H1
              fontSize={66}
              lineHeight={62}
              fontWeight="900"
              letterSpacing={-1.5}
              color={palette.text}
            >
              Digital goods,{' '}
              <Text fontSize={66} lineHeight={62} fontWeight="900" letterSpacing={-1.5} color={palette.acid}>
                dropped daily.
              </Text>
            </H1>
            <Paragraph fontSize={18} lineHeight={27} color={palette.mute} maxWidth={540}>
              Cop limited digital drops — sound packs, presets, LUTs, UI kits, and
              files. Claim a drop, build your library, and list your own. Backed by
              Hanzo IAM and Hanzo Base.
            </Paragraph>
            <XStack alignItems="center" gap="$4" flexWrap="wrap">
              <Btn size="$5" bg={palette.acid} fg={palette.acidInk} weight="900" disabled={isLoading} onPress={() => login()}>
                {isLoading ? 'Loading…' : 'Sign in to cop drops'}
              </Btn>
              <Text fontSize={14} fontWeight="700" color={palette.faint}>
                No card — claim is a stub
              </Text>
            </XStack>
          </YStack>

          {/* lineup */}
          <YStack gap="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <Eyebrow color={palette.mute}>This week&rsquo;s lineup</Eyebrow>
              <Text fontSize={12} fontWeight="700" color={palette.faint}>
                3 drops
              </Text>
            </XStack>
            <XStack gap="$4" flexWrap="wrap">
              {LINEUP.map((d) => (
                <YStack
                  key={d.name}
                  flex={1}
                  minWidth={280}
                  backgroundColor={palette.card}
                  borderWidth={1}
                  borderColor={palette.line}
                  borderRadius={18}
                  padding="$4"
                  gap="$3.5"
                >
                  <Poster name={d.name} accent={d.accent} badge={d.badge} />
                  <YStack gap="$2.5">
                    <Chip label={d.kind} tone={d.accent} />
                    <Text fontSize={19} fontWeight="800" color={palette.text}>
                      {d.name}
                    </Text>
                  </YStack>
                  <XStack alignItems="center" justifyContent="space-between" paddingTop="$1">
                    <PriceTag price={d.price} accent={d.accent} />
                    <Text fontSize={13} fontWeight="800" color={palette.faint}>
                      Claim &rarr;
                    </Text>
                  </XStack>
                </YStack>
              ))}
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* footer */}
      <YStack flex={1} justifyContent="flex-end">
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$4"
          borderTopWidth={1}
          borderColor={palette.lineSoft}
          justifyContent="center"
        >
          <Text fontSize={12} fontWeight="600" color={palette.faint} textAlign="center">
            Auth by Hanzo IAM · Data by Hanzo Base · React 19 + @hanzo/gui
          </Text>
        </XStack>
      </YStack>
    </YStack>
  )
}
