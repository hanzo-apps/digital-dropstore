import { useState } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, Text, Paragraph, Spinner } from '@hanzo/gui'
import type { Drop } from '../data'
import { palette, accentFor, priceLabel } from '../ui'
import { Poster, Chip, PriceTag, Eyebrow, Btn } from '../parts'

const FIELD = {
  backgroundColor: palette.panel,
  borderWidth: 1,
  borderColor: palette.line,
  color: palette.text,
  borderRadius: 12,
} as const

/** The store front for signed-in users: list your own drops and browse the
 *  org's lineup as a grid of bold posters. Reads/writes the `drops` collection
 *  (org-scoped, IAM-native) carrying the signed-in user's token. */
export function Drops({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading, error, refetch } = useQuery<Drop>('drops', { sort: '-created', realtime: false })
  const create = useMutation('drops', 'create')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState('')
  const [desc, setDesc] = useState('')

  async function list() {
    const n = name.trim()
    if (!n || create.isLoading) return
    await create.mutate({ name: n, price: price.trim(), file: file.trim(), desc: desc.trim() })
    setName('')
    setPrice('')
    setFile('')
    setDesc('')
    setOpen(false)
    await refetch()
  }

  return (
    <YStack gap="$6">
      {/* section head + list-a-drop toggle */}
      <XStack alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap="$3">
        <YStack gap="$2">
          <Eyebrow>The drop board</Eyebrow>
          <Text fontSize={30} fontWeight="900" letterSpacing={-0.6} color={palette.text}>
            Live drops
          </Text>
        </YStack>
        <Btn
          size="$4"
          bg={open ? 'transparent' : palette.acid}
          fg={open ? palette.mute : palette.acidInk}
          border={open ? palette.line : undefined}
          onPress={() => setOpen((v) => !v)}
        >
          {open ? 'Cancel' : '+ List a drop'}
        </Btn>
      </XStack>

      {/* composer */}
      {open ? (
        <YStack
          gap="$3"
          padding="$4"
          backgroundColor={palette.card}
          borderWidth={1}
          borderColor={palette.line}
          borderRadius={18}
        >
          <XStack gap="$3" flexWrap="wrap">
            <Input {...FIELD} flex={2} minWidth={220} value={name} placeholder="Drop name" onChangeText={setName} />
            <Input {...FIELD} flex={1} minWidth={120} value={price} placeholder="Price (e.g. 24)" onChangeText={setPrice} />
          </XStack>
          <XStack gap="$3" flexWrap="wrap">
            <Input {...FIELD} flex={1} minWidth={220} value={file} placeholder="File name (e.g. synth-pack.zip)" onChangeText={setFile} />
          </XStack>
          <Input {...FIELD} value={desc} placeholder="Describe the drop…" onChangeText={setDesc} onSubmitEditing={list} />
          {create.error ? <Paragraph color={palette.coral}>{create.error.message}</Paragraph> : null}
          <XStack justifyContent="flex-end">
            <Btn size="$4" bg={palette.acid} fg={palette.acidInk} weight="900" disabled={create.isLoading || !name.trim()} onPress={list}>
              {create.isLoading ? 'Dropping…' : 'Drop it'}
            </Btn>
          </XStack>
        </YStack>
      ) : null}

      {/* grid */}
      {isLoading ? (
        <XStack gap="$2" alignItems="center" paddingVertical="$6">
          <Spinner color={palette.acid} /> <Text color={palette.mute}>Loading drops…</Text>
        </XStack>
      ) : error ? (
        <Paragraph color={palette.coral}>
          Couldn&rsquo;t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you&rsquo;re signed in.
        </Paragraph>
      ) : data.length === 0 ? (
        <YStack
          alignItems="center"
          gap="$3"
          paddingVertical="$9"
          borderWidth={1}
          borderColor={palette.lineSoft}
          borderRadius={18}
        >
          <Text fontSize={44} fontWeight="900" color={palette.line}>
            ▚
          </Text>
          <Text fontSize={17} fontWeight="800" color={palette.text}>
            No drops yet
          </Text>
          <Paragraph color={palette.mute} textAlign="center" maxWidth={360}>
            List the first drop and it lands here for your whole org to claim.
          </Paragraph>
        </YStack>
      ) : (
        <XStack gap="$4" flexWrap="wrap">
          {data.map((d) => {
            const accent = accentFor(d.id)
            return (
              <YStack
                key={d.id}
                flexBasis={340}
                flexGrow={1}
                maxWidth={540}
                backgroundColor={palette.card}
                borderWidth={1}
                borderColor={palette.line}
                borderRadius={18}
                padding="$4"
                gap="$3.5"
                cursor="pointer"
                hoverStyle={{ borderColor: accent }}
                onPress={() => onOpen(d.id)}
              >
                <Poster name={d.name} accent={accent} />
                <YStack gap="$2.5">
                  {d.file ? <Chip label={d.file.split('.').pop() || 'file'} tone={accent} /> : null}
                  <Text fontSize={19} fontWeight="800" color={palette.text}>
                    {d.name}
                  </Text>
                  {d.desc ? (
                    <Paragraph fontSize={14} lineHeight={20} color={palette.mute} numberOfLines={2}>
                      {d.desc}
                    </Paragraph>
                  ) : null}
                </YStack>
                <XStack alignItems="center" justifyContent="space-between" paddingTop="$1">
                  <PriceTag price={priceLabel(d.price)} accent={accent} />
                  <Text fontSize={13} fontWeight="800" color={palette.faint}>
                    View drop &rarr;
                  </Text>
                </XStack>
              </YStack>
            )
          })}
        </XStack>
      )}
    </YStack>
  )
}
