import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';
import { useSession } from '@/hooks/useSession';

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

  // useEffect hook to send message to extension
  useEffect(() => {
    if (session && typeof session !== 'boolean') { // Only send message if session exists (user is logged in)
      const accessToken = session?.access_token; // Access token from Supabase session
      const refreshToken = session?.refresh_token; // Refresh token from Supabase session (if available)

      if (window.opener && window.opener !== window) { // Check if opened by extension
        window.opener.postMessage({
          action: "authDataReceived",
          accessToken: accessToken,
          refreshToken: refreshToken, // Include refresh token if you have it
        }, "*"); // The "*" is important for cross-origin communication
      }
    }
  }, [session]); // This effect runs whenever the session changes


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
