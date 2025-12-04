import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, configureFonts } from 'react-native-paper'; // Import PaperProvider and theme adapters
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme'; // Import our custom Colors
import { useColorScheme } from '@/hooks/use-color-scheme';

// Define custom fonts (optional, for now use default)
const fontConfig = {
  // Add custom fonts here if needed
  // For example:
  // default: {
  //   fontFamily: Platform.select({
  //     ios: 'System',
  //     android: 'Roboto',
  //     web: 'Roboto',
  //   }),
  //   fontWeight: 'normal',
  // },
};

// Create custom Paper themes based on our Colors constant
const CustomPaperDarkTheme = {
  ...MD3DarkTheme, // Start with Paper's dark theme
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    onPrimary: Colors.dark.text, // Text on primary colored elements (e.g., buttons)
    background: Colors.dark.background,
    onBackground: Colors.dark.text, // Text on main background
    surface: Colors.dark.surface, // Cards/containers background
    onSurface: Colors.dark.text, // Text on cards/surfaces
    onSurfaceVariant: Colors.dark.textSecondary, // Secondary text on cards/surfaces
    // text: Colors.dark.text, // This maps to onSurface by default in MD3 if not specified
    error: Colors.dark.error,
    onError: Colors.dark.text, // Text on error colored elements
    // We can also map other colors from our custom theme
    outline: Colors.dark.border, // For borders
    backdrop: Colors.dark.cardSecondary, // A darker surface
    // secondaryContainer: Colors.dark.cardSecondary, // For secondary containers
    onSecondaryContainer: Colors.dark.text, // Text on secondary containers
  },
  fonts: configureFonts({ config: fontConfig }), // Apply custom fonts
};

const CustomPaperLightTheme = {
  ...MD3LightTheme, // Start with Paper's light theme
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary, // Example, adjust as needed for light mode
    onPrimary: '#FFFFFF', // Assuming white text on light primary
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: Colors.light.surface, // Example, adjust as needed for light mode
    onSurface: Colors.light.text,
    onSurfaceVariant: Colors.light.text, // Example
    text: Colors.light.text,
    error: '#FF453A', // Example, adjust as needed for light mode
    onError: '#FFFFFF', // Assuming white text on light error
    outline: '#E0E0E0', // Example
    backdrop: Colors.light.background, // Example
    onSecondaryContainer: Colors.light.text, // Example
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Adapt React Navigation themes to use our custom colors if desired
  const NavigationTheme = colorScheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;
  NavigationTheme.colors.background = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;
  NavigationTheme.colors.card = colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface;
  NavigationTheme.colors.text = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  NavigationTheme.colors.primary = colorScheme === 'dark' ? Colors.dark.primary : Colors.light.primary;

  const PaperTheme = colorScheme === 'dark' ? CustomPaperDarkTheme : CustomPaperLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={PaperTheme}>
        <ThemeProvider value={NavigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </ThemeProvider>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

