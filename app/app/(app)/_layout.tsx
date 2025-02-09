import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';
import { useSession } from '@/hooks/useSession';
import { extensionOrigin } from '@/constants';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function PrivateTabLayout() {
  const headerShown = useClientOnlyValue(false, true);
  const colorScheme = useColorScheme();
  const { session } = useSession();

  // useEffect hook to send auth session to browser extension
  useEffect(() => {
    if (session && typeof session !== 'boolean') {
      const accessToken = session?.access_token;
      const refreshToken = session?.refresh_token;

      if (window.opener && window.opener !== window) { // Check if opened by extension
        window.opener.postMessage({
          action: "authDataReceived",
          accessToken: accessToken,
          refreshToken: refreshToken,
        }, extensionOrigin);
      }
    }
  }, [session]);

  if (!session) {
    return <Redirect href='/signin' />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home Tab',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
