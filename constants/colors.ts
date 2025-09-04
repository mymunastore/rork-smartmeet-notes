// Advanced color system with semantic tokens and accessibility
const ColorTokens = {
  // Base color palette
  brand: {
    primary: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C7',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
    secondary: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#2B77CB',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
    accent: {
      50: '#FFFAF0',
      100: '#FEEBC8',
      200: '#FBD38D',
      300: '#F6AD55',
      400: '#ED8936',
      500: '#DD6B20',
      600: '#C05621',
      700: '#9C4221',
      800: '#7B341E',
      900: '#652B19',
    },
  },
  
  // Semantic colors
  semantic: {
    success: {
      50: '#F0FFF4',
      100: '#C6F6D5',
      200: '#9AE6B4',
      300: '#68D391',
      400: '#48BB78',
      500: '#38A169',
      600: '#2F855A',
      700: '#276749',
      800: '#22543D',
      900: '#1C4532',
    },
    error: {
      50: '#FED7D7',
      100: '#FEB2B2',
      200: '#FC8181',
      300: '#F56565',
      400: '#E53E3E',
      500: '#C53030',
      600: '#9B2C2C',
      700: '#742A2A',
      800: '#63171B',
      900: '#521B1B',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    info: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#2B77CB',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
  },
  
  // Neutral grays
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Nature-inspired colors
  nature: {
    sage: { light: '#9CAF88', dark: '#B8D4A3' },
    moss: { light: '#8FBC8F', dark: '#A8CCA8' },
    ocean: { light: '#4682B4', dark: '#6BA6CD' },
    sand: { light: '#F4E4BC', dark: '#F7E7C1' },
    coral: { light: '#FF7F7F', dark: '#FF9999' },
    lavender: { light: '#B19CD9', dark: '#C9A9DD' },
    earth: { light: '#8B4513', dark: '#A0522D' },
    sky: { light: '#87CEEB', dark: '#98D8F4' },
    forest: { light: '#228B22', dark: '#32CD32' },
    sunset: { light: '#FF6347', dark: '#FF7F50' },
  },
};

// Theme definitions with enhanced semantic tokens
export default {
  light: {
    // Core colors
    text: ColorTokens.neutral[800],
    textSecondary: ColorTokens.neutral[600],
    textTertiary: ColorTokens.neutral[500],
    background: '#FFFFFF',
    backgroundSecondary: ColorTokens.neutral[50],
    backgroundTertiary: ColorTokens.neutral[100],
    
    // Brand colors
    primary: ColorTokens.brand.primary[500],
    primaryLight: ColorTokens.brand.primary[400],
    primaryDark: ColorTokens.brand.primary[600],
    secondary: ColorTokens.brand.secondary[500],
    secondaryLight: ColorTokens.brand.secondary[400],
    secondaryDark: ColorTokens.brand.secondary[600],
    accent: ColorTokens.brand.accent[500],
    accentLight: ColorTokens.brand.accent[400],
    accentDark: ColorTokens.brand.accent[600],
    
    // UI elements
    card: '#FFFFFF',
    cardSecondary: ColorTokens.neutral[50],
    border: ColorTokens.neutral[200],
    borderLight: ColorTokens.neutral[100],
    borderDark: ColorTokens.neutral[300],
    divider: ColorTokens.neutral[200],
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Interactive states
    hover: ColorTokens.neutral[100],
    pressed: ColorTokens.neutral[200],
    focus: ColorTokens.brand.primary[100],
    disabled: ColorTokens.neutral[300],
    disabledText: ColorTokens.neutral[400],
    
    // Semantic colors
    success: ColorTokens.semantic.success[500],
    successLight: ColorTokens.semantic.success[100],
    successDark: ColorTokens.semantic.success[600],
    error: ColorTokens.semantic.error[500],
    errorLight: ColorTokens.semantic.error[100],
    errorDark: ColorTokens.semantic.error[600],
    warning: ColorTokens.semantic.warning[500],
    warningLight: ColorTokens.semantic.warning[100],
    warningDark: ColorTokens.semantic.warning[600],
    info: ColorTokens.semantic.info[500],
    infoLight: ColorTokens.semantic.info[100],
    infoDark: ColorTokens.semantic.info[600],
    
    // Gray scale
    gray: {
      50: ColorTokens.neutral[50],
      100: ColorTokens.neutral[100],
      200: ColorTokens.neutral[200],
      300: ColorTokens.neutral[300],
      400: ColorTokens.neutral[400],
      500: ColorTokens.neutral[500],
      600: ColorTokens.neutral[600],
      700: ColorTokens.neutral[700],
      800: ColorTokens.neutral[800],
      900: ColorTokens.neutral[900],
    },
    
    // Nature colors
    nature: {
      sage: ColorTokens.nature.sage.light,
      moss: ColorTokens.nature.moss.light,
      ocean: ColorTokens.nature.ocean.light,
      sand: ColorTokens.nature.sand.light,
      coral: ColorTokens.nature.coral.light,
      lavender: ColorTokens.nature.lavender.light,
      earth: ColorTokens.nature.earth.light,
      sky: ColorTokens.nature.sky.light,
      forest: ColorTokens.nature.forest.light,
      sunset: ColorTokens.nature.sunset.light,
    },
  },
  
  dark: {
    // Core colors
    text: ColorTokens.neutral[50],
    textSecondary: ColorTokens.neutral[300],
    textTertiary: ColorTokens.neutral[400],
    background: ColorTokens.neutral[900],
    backgroundSecondary: ColorTokens.neutral[800],
    backgroundTertiary: ColorTokens.neutral[700],
    
    // Brand colors
    primary: ColorTokens.brand.primary[400],
    primaryLight: ColorTokens.brand.primary[300],
    primaryDark: ColorTokens.brand.primary[500],
    secondary: ColorTokens.brand.secondary[400],
    secondaryLight: ColorTokens.brand.secondary[300],
    secondaryDark: ColorTokens.brand.secondary[500],
    accent: ColorTokens.brand.accent[400],
    accentLight: ColorTokens.brand.accent[300],
    accentDark: ColorTokens.brand.accent[500],
    
    // UI elements
    card: ColorTokens.neutral[800],
    cardSecondary: ColorTokens.neutral[700],
    border: ColorTokens.neutral[700],
    borderLight: ColorTokens.neutral[600],
    borderDark: ColorTokens.neutral[800],
    divider: ColorTokens.neutral[700],
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Interactive states
    hover: ColorTokens.neutral[700],
    pressed: ColorTokens.neutral[600],
    focus: ColorTokens.brand.primary[800],
    disabled: ColorTokens.neutral[600],
    disabledText: ColorTokens.neutral[500],
    
    // Semantic colors
    success: ColorTokens.semantic.success[400],
    successLight: ColorTokens.semantic.success[800],
    successDark: ColorTokens.semantic.success[300],
    error: ColorTokens.semantic.error[400],
    errorLight: ColorTokens.semantic.error[800],
    errorDark: ColorTokens.semantic.error[300],
    warning: ColorTokens.semantic.warning[400],
    warningLight: ColorTokens.semantic.warning[800],
    warningDark: ColorTokens.semantic.warning[300],
    info: ColorTokens.semantic.info[400],
    infoLight: ColorTokens.semantic.info[800],
    infoDark: ColorTokens.semantic.info[300],
    
    // Gray scale (inverted for dark mode)
    gray: {
      50: ColorTokens.neutral[900],
      100: ColorTokens.neutral[800],
      200: ColorTokens.neutral[700],
      300: ColorTokens.neutral[600],
      400: ColorTokens.neutral[500],
      500: ColorTokens.neutral[400],
      600: ColorTokens.neutral[300],
      700: ColorTokens.neutral[200],
      800: ColorTokens.neutral[100],
      900: ColorTokens.neutral[50],
    },
    
    // Nature colors
    nature: {
      sage: ColorTokens.nature.sage.dark,
      moss: ColorTokens.nature.moss.dark,
      ocean: ColorTokens.nature.ocean.dark,
      sand: ColorTokens.nature.sand.dark,
      coral: ColorTokens.nature.coral.dark,
      lavender: ColorTokens.nature.lavender.dark,
      earth: ColorTokens.nature.earth.dark,
      sky: ColorTokens.nature.sky.dark,
      forest: ColorTokens.nature.forest.dark,
      sunset: ColorTokens.nature.sunset.dark,
    },
  },
};

// Export color tokens for advanced usage
export { ColorTokens };