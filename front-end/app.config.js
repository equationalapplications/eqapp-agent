const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('EXPO_PUBLIC_')),
);

export default {
  "expo": {
    "extra": {
      env,
      "eas": {
        "projectId": "a1cfb90c-978c-4092-9c99-dedf70d665a4"
      }
    },
    "owner": "equationalapplicationsllc",
    "name": process.env.EXPO_PUBLIC_NAME,
    "slug": "equational-applications-agent",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "com.equationalapplications.eqapp.agent",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.equationalapplications.eqapp.agent"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.equationalapplications.eqapp.agent"
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-font",
        {
          "fonts": ["node_modules/@expo-google-fonts/roboto/Roboto_400Regular.ttf"]
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/a1cfb90c-978c-4092-9c99-dedf70d665a4"
    }
  }
}