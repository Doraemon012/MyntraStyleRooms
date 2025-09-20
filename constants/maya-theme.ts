/**
 * Maya AI Assistant Theme Colors and Styling
 * Based on the clean, modern aesthetic of the Maya interface
 */

export const MayaTheme = {
  colors: {
    // Primary Colors
    primary: '#E8E0FE',        // Light purple background
    primaryDark: '#D1C7FE',    // Darker purple for hover states
    primaryLight: '#F5F2FF',   // Very light purple for subtle backgrounds
    
    // Accent Colors
    accent: '#8B5CF6',         // Purple accent
    accentLight: '#A78BFA',    // Light purple accent
    accentDark: '#7C3AED',     // Dark purple accent
    
    // Text Colors
    textPrimary: '#1a1a1a',    // Dark text
    textSecondary: '#666666',  // Medium gray text
    textTertiary: '#999999',   // Light gray text
    textWhite: '#ffffff',      // White text
    
    // Background Colors
    background: '#f8f9fa',     // Light gray background
    backgroundWhite: '#ffffff', // White background
    backgroundCard: '#ffffff',  // Card background
    
    // Border Colors
    border: '#e0e0e0',         // Light border
    borderLight: '#f0f0f0',    // Very light border
    borderDark: '#d0d0d0',     // Darker border
    
    // Status Colors
    success: '#10B981',        // Green for success
    warning: '#F59E0B',        // Orange for warning
    error: '#EF4444',          // Red for error
    info: '#3B82F6',           // Blue for info
    
    // Product Colors
    productPrice: '#E91E63',   // Pink for product prices
    productAccent: '#FF6B9D',  // Light pink accent
    
    // Chat Colors
    userMessage: '#E8E0FE',    // Light purple for user messages
    aiMessage: '#ffffff',      // White for AI messages
    friendMessage: '#f0f0f0',  // Light gray for friend messages
    
    // Shadow Colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
  },
  
  typography: {
    // Font Sizes
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    
    // Font Weights
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    
    // Line Heights
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  // Component-specific styles
  components: {
    header: {
      backgroundColor: '#ffffff',
      borderBottomColor: '#e0e0e0',
      borderBottomWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    
    messageBubble: {
      borderRadius: 16,
      padding: 12,
      maxWidth: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    
    productCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#f0f0f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    inputField: {
      backgroundColor: '#E8E0FE',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      color: '#1a1a1a',
    },
    
    button: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    buttonPrimary: {
      backgroundColor: '#E8E0FE',
    },
    
    buttonSecondary: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#E8E0FE',
    },
  },
};

export default MayaTheme;
