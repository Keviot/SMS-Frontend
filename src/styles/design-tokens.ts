/**
 * Design Tokens - Society Management System
 * Based on Figma Design System
 */

export const designTokens = {
  // Colors
  colors: {
    primary: {
      orange: '#FF5630',
      yellow: '#FF9F1C',
      blue: '#5678E9',
      green: '#39973D',
      red: '#E74C3C',
      yellowBadge: '#FFC313',
    },
    text: {
      primary: '#202224',
      secondary: '#4F4F4F',
      tertiary: '#A7A7A7',
      muted: '#6F7786',
    },
    background: {
      page: '#F6F8FB',
      card: '#FFFFFF',
      secondary: '#F5F6FA',
      tertiary: '#F8F9FC',
      hover: '#FFF7F3',
    },
    border: {
      primary: '#F4F4F4',
      secondary: '#F1F1F1',
      tertiary: '#D3D3D3',
      input: '#DFE4EC',
    },
    status: {
      success: {
        bg: '#EAFBF1',
        text: '#16A34A',
      },
      warning: {
        bg: '#FFF7DD',
        text: '#D99A00',
      },
      error: {
        bg: '#FFF1F1',
        text: '#EF4444',
      },
      info: {
        bg: '#EAF1FF',
        text: '#2563EB',
      },
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '15px',
    xl: '20px',
    '2xl': '30px',
    '3xl': '40px',
  },

  // Layout
  layout: {
    sidebarWidth: '280px',
    headerHeight: {
      mobile: '80px',
      desktop: '100px',
    },
    contentPadding: {
      mobile: '15px',
      tablet: '20px',
      desktop: '30px',
    },
    gridGap: '20px',
  },

  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '10px',
    lg: '15px',
    xl: '20px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    card: '0 8px 28px rgba(22, 34, 51, 0.08)',
    button: '0 10px 18px rgba(255, 107, 53, 0.22)',
    buttonHover: '0 12px 24px rgba(255, 107, 53, 0.35)',
    dropdown: '0 18px 52px rgba(22, 34, 51, 0.18)',
  },

  // Typography
  typography: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
      '5xl': '34px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Component Sizes
  components: {
    button: {
      height: {
        sm: '34px',
        md: '38px',
        lg: '45px',
      },
    },
    input: {
      height: '45px',
    },
    iconButton: {
      size: '35px',
    },
    avatar: {
      sm: '40px',
      md: '45px',
      lg: '50px',
    },
    card: {
      stat: {
        mobile: '90px',
        desktop: '105px',
      },
      main: {
        mobile: '320px',
        tablet: '350px',
        desktop: '398px',
      },
    },
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // Z-Index
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    header: 30,
    sidebarBackdrop: 40,
    sidebar: 50,
    notification: 90,
    modal: 100,
  },

  // Scrollbar
  scrollbar: {
    width: '6px',
    track: '#F6F8FB',
    thumb: '#D3D3D3',
    thumbHover: '#A7A7A7',
  },
} as const;

export type DesignTokens = typeof designTokens;
