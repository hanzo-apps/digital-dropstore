import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner, Separator } from '@hanzo/gui'
import type { Drop, Claim } from '../data'
import { palette, accentFor, priceLabel } from '../ui'
import { Poster, Chip, Eyebrow, Btn } from '../parts'

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <XStack>
      <Btn size="$3" bg="transparent" fg={palette.mute} weight="700" onPress={onBack}>
        &larr; All drops
      </Btn>
    </XStack>
  )
}

/**
 * Product detail — the full poster, price, description and delivered file, plus
 * the claim/purchase STUB. Claiming writes one row to `claims` ({drop,user});
 * `mine` is derived from the org's claims so the button flips to "In your
 * library" and never double-claims. No real payment — this is a template.
 */
export function Detail({
  id,
  me,
  onBack,
  onLibrary,
}: {
  id: string
  me: string
  onBack: () => void
  onLibrary: () => void
}) {
  const drops = useQuery<Drop>('drops', { realtime: false })
  const claims = useQuery<Claim>('claims', { realtime: false })
  const claim = useMutation('claims', 'create')

  if (drops.isLoading) {
    return (
      <XStack gap="$2" alignItems="center" paddingVertical="$6">
        <Spinner color={palette.acid} /> <Text color={palette.mute}>Loading drop…</Text>
      </XStack>
    )
  }

  const drop = drops.data.find((d) => d.id === id)
  if (!drop) {
    return (
      <YStack gap="$4">
        <BackLink onBack={onBack} />
        <Text fontSize={20} fontWeight="800" color={palette.text}>
          Drop not found
        </Text>
        <Paragraph color={palette.mute}>It may have been removed. Head back to the board.</Paragraph>
      </YStack>
    )
  }

  const accent = accentFor(drop.id)
  const dropClaims = claims.data.filter((c) => c.drop === drop.id)
  const mine = dropClaims.some((c) => c.user === me)
  const count = dropClaims.length

  async function cop() {
    if (mine || claim.isLoading) return
    await claim.mutate({ drop: id, user: me })
    await claims.refetch()
  }

  return (
    <YStack gap="$5">
      <BackLink onBack={onBack} />

      <XStack gap="$7" flexWrap="wrap">
        {/* poster column */}
        <YStack flexBasis={360} flexGrow={1} maxWidth={460} gap="$3">
          <Poster name={drop.name} accent={accent} height={300} />
          <XStack gap="$2" flexWrap="wrap">
            {drop.file ? <Chip label={drop.file.split('.').pop() || 'file'} tone={accent} /> : null}
            <Chip label={count === 1 ? '1 claim' : `${count} claims`} />
          </XStack>
        </YStack>

        {/* info column */}
        <YStack flexBasis={360} flexGrow={1} gap="$4">
          <YStack gap="$3">
            <Eyebrow color={accent}>Digital drop</Eyebrow>
            <Text fontSize={40} lineHeight={42} fontWeight="900" letterSpacing={-1} color={palette.text}>
              {drop.name}
            </Text>
            <Text fontSize={26} fontWeight="900" color={accent}>
              {priceLabel(drop.price)}
            </Text>
          </YStack>

          {drop.desc ? (
            <Paragraph fontSize={16} lineHeight={25} color={palette.mute}>
              {drop.desc}
            </Paragraph>
          ) : (
            <Paragraph fontSize={16} color={palette.faint}>
              No description for this drop.
            </Paragraph>
          )}

          <Separator borderColor={palette.lineSoft} />

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={13} fontWeight="700" color={palette.faint}>
              Delivered file
            </Text>
            <Text fontSize={14} fontWeight="800" color={palette.text}>
              {drop.file || '—'}
            </Text>
          </XStack>

          {claim.error ? <Paragraph color={palette.coral}>{claim.error.message}</Paragraph> : null}

          {mine ? (
            <YStack gap="$3">
              <XStack
                alignItems="center"
                justifyContent="center"
                gap="$2"
                paddingVertical="$3.5"
                borderRadius={12}
                borderWidth={1}
                borderColor={accent}
              >
                <Text fontSize={15} fontWeight="800" color={accent}>
                  ✓ In your library
                </Text>
              </XStack>
              <Btn size="$4" bg={palette.panel} fg={palette.text} border={palette.line} onPress={onLibrary}>
                Go to my library &rarr;
              </Btn>
            </YStack>
          ) : (
            <Btn size="$5" bg={accent} fg={palette.ink} weight="900" disabled={claim.isLoading} onPress={cop}>
              {claim.isLoading ? 'Claiming…' : `Claim this drop · ${priceLabel(drop.price)}`}
            </Btn>
          )}
          <Text fontSize={12} fontWeight="600" color={palette.faint} textAlign="center">
            Claim is a stub — no payment is taken.
          </Text>
        </YStack>
      </XStack>
    </YStack>
  )
}
