import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useEffect } from 'react';
import { extensionOrigin } from '@/constants';
import { useSession } from '@/hooks/useSession';

export default function HomeTab() {
  const { session } = useSession();

  const sendAuthDataToExtension = () => {
    if (session && typeof session !== 'boolean') {
      const accessToken = session?.access_token;
      const refreshToken = session?.refresh_token;
      if (window.opener && window.opener !== window) { // Check if opened by extension
        console.log('Sending auth data to extension...', accessToken, refreshToken, window.opener);
        window.opener.postMessage({
          action: "authDataReceived",
          accessToken: accessToken,
          refreshToken: refreshToken,
        }, extensionOrigin);
      }
    }
  };

  useEffect(() => {
    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
      // if (event.origin !== extensionOrigin) {
      //   console.warn(`Blocked message from unexpected origin: ${event.origin}`);
      //   return;
      // }
      const { action } = event.data;
      if (action === "authenticateExtension") {
        console.log('Received authenticateExtension message from extension');
        sendAuthDataToExtension();
      }
    });
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', () => { });
    };
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});