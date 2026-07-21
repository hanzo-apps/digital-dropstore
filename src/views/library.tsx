import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner } from '@hanzo/gui'
import type { Drop, Claim } from '../data'
import { palette, accentFor, priceLabel } from '../ui'
import { Poster, Eyebrow, Btn } from '../parts'

/**
 * My library — the drops this user has claimed. Joins the org's `claims`
 * (filtered to `me`) against `drops` client-side (org-scoped, small dataset),
 * newest claim first. Download is a STUB: it surfaces the delivered file name.
 */
export function Library({
  me,
  onOpen,
  onBrowse,
}: {
  me: string
  onOpen: (id: string) => void
  onBrowse: () => void
}) {
  const drops = useQuery<Drop>('drops', { realtime: false })
  const claims = useQuery<Claim>('claims', { sort: '-created', realtime: false })

  const byId = new Map(drops.data.map((d) => [d.id, d]))
  const mine = claims.data
    .filter((c) => c.user === me)
    .map((c) => byId.get(c.drop))
    .filter((d): d is Drop => Boolean(d))

  const loading = drops.isLoading || claims.isLoading

  return (
    <YStack gap="$6">
      <YStack gap="$2">
        <Eyebrow>Owned by you</Eyebrow>
        <Text fontSize={30} fontWeight="900" letterSpacing={-0.6} color={palette.text}>
          My library
        </Text>
      </YStack>

      {loading ? (
        <XStack gap="$2" alignItems="center" paddingVertical="$6">
          <Spinner color={palette.acid} /> <Text color={palette.mute}>Loading library…</Text>
        </XStack>
      ) : mine.length === 0 ? (
        <YStack
          alignItems="center"
          gap="$3"
          paddingVertical="$9"
          borderWidth={1}
          borderColor={palette.lineSoft}
          borderRadius={18}
        >
          <Text fontSize={44} fontWeight="900" color={palette.line}>
            ◇
          </Text>
          <Text fontSize={17} fontWeight="800" color={palette.text}>
            Nothing claimed yet
          </Text>
          <Paragraph color={palette.mute} textAlign="center" maxWidth={360}>
            Claim a drop and it shows up here, ready to download.
          </Paragraph>
          <Btn size="$4" bg={palette.acid} fg={palette.acidInk} onPress={onBrowse}>
            Browse drops
          </Btn>
        </YStack>
      ) : (
        <YStack gap="$3">
          {mine.map((d) => {
            const accent = accentFor(d.id)
            return (
              <XStack
                key={d.id}
                alignItems="center"
                gap="$4"
                padding="$3"
                backgroundColor={palette.card}
                borderWidth={1}
                borderColor={palette.line}
                borderRadius={16}
                flexWrap="wrap"
              >
                <YStack width={64} cursor="pointer" onPress={() => onOpen(d.id)}>
                  <Poster name={d.name} accent={accent} height={64} />
                </YStack>
                <YStack flex={1} minWidth={160} gap="$1" cursor="pointer" onPress={() => onOpen(d.id)}>
                  <Text fontSize={17} fontWeight="800" color={palette.text}>
                    {d.name}
                  </Text>
                  <Text fontSize={13} fontWeight="600" color={palette.faint}>
                    {d.file || 'no file'} · {priceLabel(d.price)}
                  </Text>
                </YStack>
                <Btn size="$3" bg={palette.panel} fg={accent} border={palette.line} onPress={() => onOpen(d.id)}>
                  Download &darr;
                </Btn>
              </XStack>
            )
          })}
        </YStack>
      )}
    </YStack>
  )
}
