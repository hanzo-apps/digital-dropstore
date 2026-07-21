import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { palette } from '../ui'
import { Btn } from '../parts'
import { Drops } from './drops'
import { Detail } from './detail'
import { Library } from './library'

/** SPA view state — no router (one static SPA); the shell owns navigation. */
type View = { name: 'drops' } | { name: 'detail'; id: string } | { name: 'library' }

/** A header nav link that highlights the active view. */
function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Btn size="$3" bg="transparent" fg={active ? palette.text : palette.faint} weight={active ? '800' : '700'} onPress={onPress}>
      {label}
    </Btn>
  )
}

/**
 * Signed-in shell: the Dropstore brand bar with Drops/Library nav and sign-out,
 * plus the current view. `me` is the stable IAM user key stamped onto claims so
 * "my library" is the caller's own claims within the org.
 */
export function Home() {
  const { user, logout } = useIam()
  const me = user?.id || user?.name || user?.email || ''
  const who = user?.displayName || user?.name || user?.email || 'you'
  const [view, setView] = useState<View>({ name: 'drops' })

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={palette.ink}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$5"
        paddingVertical="$3.5"
        borderBottomWidth={1}
        borderColor={palette.lineSoft}
        backgroundColor={palette.ink}
      >
        <XStack alignItems="center" gap="$5">
          <XStack
            alignItems="center"
            gap="$2.5"
            cursor="pointer"
            onPress={() => setView({ name: 'drops' })}
          >
            <YStack width={20} height={20} borderRadius={6} backgroundColor={palette.acid} />
            <Text fontSize={16} fontWeight="900" letterSpacing={1} color={palette.text}>
              DROPSTORE
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$1">
            <NavLink label="Drops" active={view.name !== 'library'} onPress={() => setView({ name: 'drops' })} />
            <NavLink label="My library" active={view.name === 'library'} onPress={() => setView({ name: 'library' })} />
          </XStack>
        </XStack>
        <XStack alignItems="center" gap="$3">
          <Text fontSize={13} fontWeight="600" color={palette.faint}>
            {who}
          </Text>
          <Btn size="$3" bg="transparent" fg={palette.mute} border={palette.line} weight="700" onPress={() => logout()}>
            Sign out
          </Btn>
        </XStack>
      </XStack>

      <YStack width="100%" maxWidth={1120} alignSelf="center" paddingHorizontal="$5" paddingVertical="$6">
        {view.name === 'detail' ? (
          <Detail
            id={view.id}
            me={me}
            onBack={() => setView({ name: 'drops' })}
            onLibrary={() => setView({ name: 'library' })}
          />
        ) : view.name === 'library' ? (
          <Library me={me} onOpen={(id) => setView({ name: 'detail', id })} onBrowse={() => setView({ name: 'drops' })} />
        ) : (
          <Drops onOpen={(id) => setView({ name: 'detail', id })} />
        )}
      </YStack>
    </YStack>
  )
}
