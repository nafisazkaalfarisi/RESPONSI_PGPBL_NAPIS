// constants/theme.ts
// Theme Constants untuk Dark Mode - Digunakan di seluruh aplikasi

export const Colors = {
  dark: {
    // Background
    background: '#000000',
    surface: '#1C1C1E',
    surfaceLight: '#2C2C2E',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    
    // Primary & Actions
    primary: '#4A9EFF',
    primaryDark: '#357ABD',
    primaryLight: '#5BA3F5',
    
    // Status Colors
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FFD60A',
    info: '#5AC8FA',
    
    // Borders & Dividers
    border: '#38383A',
    divider: '#48484A',
    
    // Shadow
    shadow: '#000000',
    
    // Special Colors
    cardBackground: '#1C1C1E',
    cardSecondary: '#2C2C2E',
    inputBackground: '#2C2C2E',
    modalBackground: 'rgba(0, 0, 0, 0.85)',
  },
  
  light: {
    // Backup untuk light theme (optional)
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
  }
};

// Typography
export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 9999,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: Colors.dark.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.dark.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  large: {
    shadowColor: Colors.dark.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Dark Map Style for Google Maps
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Chart Config for Dark Theme
export const darkChartConfig = {
  backgroundColor: Colors.dark.surface,
  backgroundGradientFrom: Colors.dark.surface,
  backgroundGradientTo: Colors.dark.surfaceLight,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(74, 158, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: BorderRadius.large,
  },
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: Colors.dark.primary,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: Colors.dark.border,
    strokeDasharray: '0',
  },
};