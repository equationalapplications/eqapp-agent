import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
//import FontAwesome from '@expo/vector-icons/FontAwesome';
//import { useFonts } from 'expo-font';
import { AuthContextProvider } from '@/contexts/SessionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
//import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
//import { Inter_900Black } from '@expo-google-fonts/inter';
//import { Text } from '@rneui/themed';

// export {
//   //Catch any errors thrown by the Layout component.
//   //@ts-ignore // export of types is broken
//   ErrorBoundary,
// } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(app)',
};

export default function RootLayout() {
  // const [loaded, error] = useFonts({
  //   Inter_900Black,
  //   // ...FontAwesome.font,
  // });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  // useEffect(() => {
  //   //if (error) throw error;
  //   if (error) {
  //     console.error(error);
  //   }
  // }, [error]);

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // if (error) {
  //   return <Text>{`Error: ${error.message}`}</Text>;
  // }

  // if (!loaded) {
  //   return <Text>Loading</Text>;
  // }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContextProvider>
        <Stack>
          <Stack.Screen name="index" options={{
            title: 'Welcome to Equational Applications Agent',
            // headerRight: () => (
            //   <Link href="/" asChild>
            //     <Pressable>
            //       {({ pressed }) => (
            //         <FontAwesome
            //           name="info-circle"
            //           size={25}
            //           color={Colors[colorScheme ?? 'light'].text}
            //           style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            //         />
            //       )}
            //     </Pressable>
            //   </Link>
            // ),
          }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="signin" options={{ title: 'Sign In', presentation: 'containedTransparentModal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthContextProvider>
    </ThemeProvider>
  );
}
