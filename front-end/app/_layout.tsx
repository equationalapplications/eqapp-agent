import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { AuthContextProvider } from '@/contexts/SessionContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(app)',
};

export default function RootLayout() {
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
