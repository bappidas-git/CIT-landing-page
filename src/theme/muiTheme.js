/* ============================================
   MUI Theme Configuration - Landing Page Boilerplate
   Landing Page
   ============================================ */

import { createTheme, alpha } from '@mui/material/styles';

// Color palette matching CSS variables
const colors = {
  primary: {
    main: '#1A5276',
    light: '#2980B9',
    dark: '#154360',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#148F77',
    light: '#1ABC9C',
    dark: '#0E6655',
    contrastText: '#FFFFFF',
  },
  orange: {
    main: '#FF6B35',
    light: '#FF8C5A',
    dark: '#E85A20',
    50: '#FFF3ED',
    100: '#FFE0CC',
    200: '#FFCAAA',
    300: '#FFB088',
    400: '#FF8C5A',
    500: '#FF6B35',
    600: '#E85A20',
    700: '#CC4D1A',
    800: '#A63F15',
    900: '#803110',
  },
  navy: {
    main: '#1A5276',
    light: '#2980B9',
    dark: '#154360',
    50: '#EBF5FB',
    100: '#D6EAF8',
    200: '#AED6F1',
    300: '#85C1E9',
    400: '#5DADE2',
    500: '#2980B9',
    600: '#1F6F96',
    700: '#1A5276',
    800: '#1A5276',
    900: '#154360',
  },
  success: {
    main: '#2E7D32',
    light: '#66BB6A',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F57C00',
    light: '#FFB74D',
    dark: '#E65100',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F8F9FA',
    200: '#F5F7FA',
    300: '#E8EDF2',
    400: '#B0BEC5',
    500: '#90A4AE',
    600: '#78909C',
    700: '#607D8B',
    800: '#455A64',
    900: '#263238',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    dark: '#1A5276',
    light: '#F8FAFC',
  },
  text: {
    primary: '#1B2631',
    secondary: '#546E7A',
    disabled: '#90A4AE',
    dark: '#1B2631',
    light: '#FFFFFF',
  },
  iconColors: {
    gold: '#148F77',
    green: '#4CAF50',
    purple: '#9C27B0',
    orange: '#FF6B35',
    pink: '#E91E63',
    red: '#F44336',
    teal: '#148F77',
    blue: '#2196F3',
  },
  cardBg: {
    yellow: '#FFF3E0',
    green: '#E8F5E9',
    pink: '#FCE4EC',
    purple: '#F3E5F5',
    orange: '#FFF3E0',
    blue: '#E3F2FD',
  },
};

// Breakpoints matching CSS variables
const breakpoints = {
  values: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1440,
  },
};

// Typography configuration
const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  fontFamilyHeading: "'Poppins', sans-serif",
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  fontWeightExtraBold: 800,
  h1: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(2.5rem, 2rem + 2.5vw, 4.5rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    color: colors.primary.main,
  },
  h2: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
    color: colors.primary.main,
  },
  h3: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem)',
    lineHeight: 1.2,
    color: colors.primary.main,
  },
  h4: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
    lineHeight: 1.25,
    color: colors.primary.main,
  },
  h5: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    lineHeight: 1.3,
    color: colors.primary.main,
  },
  h6: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: 'clamp(1.1rem, 1rem + 0.5vw, 1.25rem)',
    lineHeight: 1.4,
    color: colors.primary.main,
  },
  subtitle1: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: 1.5,
    color: colors.text.secondary,
  },
  subtitle2: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: colors.text.secondary,
  },
  body1: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.625,
    color: colors.text.primary,
  },
  body2: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: colors.text.secondary,
  },
  button: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.9375rem',
    lineHeight: 1,
    textTransform: 'none',
    letterSpacing: '0.025em',
  },
  caption: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: colors.text.secondary,
  },
  overline: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.secondary.main,
  },
};

// Shadows configuration
const shadows = [
  'none',
  '0 1px 2px rgba(0, 0, 0, 0.05)',
  '0 1px 3px rgba(0, 0, 0, 0.1)',
  '0 4px 6px rgba(0, 0, 0, 0.05)',
  '0 4px 8px rgba(0, 0, 0, 0.08)',
  '0 4px 12px rgba(0, 0, 0, 0.08)',
  '0 4px 20px rgba(0, 0, 0, 0.08)',
  '0 8px 16px rgba(0, 0, 0, 0.1)',
  '0 8px 24px rgba(0, 0, 0, 0.1)',
  '0 8px 30px rgba(0, 0, 0, 0.12)',
  '0 12px 40px rgba(0, 0, 0, 0.12)',
  '0 12px 48px rgba(0, 0, 0, 0.15)',
  '0 16px 56px rgba(0, 0, 0, 0.15)',
  '0 16px 64px rgba(0, 0, 0, 0.18)',
  '0 20px 72px rgba(0, 0, 0, 0.18)',
  '0 20px 80px rgba(0, 0, 0, 0.2)',
  '0 24px 88px rgba(0, 0, 0, 0.2)',
  '0 24px 96px rgba(0, 0, 0, 0.22)',
  '0 28px 104px rgba(0, 0, 0, 0.22)',
  '0 28px 112px rgba(0, 0, 0, 0.24)',
  '0 32px 120px rgba(0, 0, 0, 0.24)',
  '0 32px 128px rgba(0, 0, 0, 0.26)',
  '0 36px 136px rgba(0, 0, 0, 0.26)',
  '0 36px 144px rgba(0, 0, 0, 0.28)',
  '0 40px 152px rgba(0, 0, 0, 0.28)',
];

// Orange shadow for CTA buttons and highlights
const orangeShadow = '0 4px 14px rgba(255, 107, 53, 0.35)';
const orangeShadowHover = '0 6px 20px rgba(255, 107, 53, 0.45)';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: colors.background,
    text: colors.text,
    orange: colors.orange,
    navy: colors.navy,
    iconColors: colors.iconColors,
    cardBg: colors.cardBg,
    divider: colors.grey[300],
    action: {
      active: colors.secondary.main,
      hover: alpha(colors.secondary.main, 0.08),
      selected: alpha(colors.secondary.main, 0.16),
      disabled: colors.grey[400],
      disabledBackground: colors.grey[200],
      focus: alpha(colors.secondary.main, 0.12),
    },
  },
  breakpoints,
  typography,
  shadows,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  zIndex: {
    mobileStepper: 100,
    fab: 105,
    speedDial: 105,
    appBar: 200,
    drawer: 400,
    modal: 600,
    snackbar: 800,
    tooltip: 900,
  },
  components: {
    // Global CSS Baseline
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          scrollBehavior: 'smooth',
          WebkitTextSizeAdjust: '100%',
        },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overflowX: 'hidden',
        },
        '::selection': {
          backgroundColor: colors.secondary.main,
          color: colors.background.default,
        },
        '::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '::-webkit-scrollbar-track': {
          background: colors.grey[200],
          borderRadius: 4,
        },
        '::-webkit-scrollbar-thumb': {
          background: colors.secondary.main,
          borderRadius: 4,
          '&:hover': {
            background: colors.secondary.dark,
          },
        },
      },
    },
    // Button Component
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '0.9375rem',
          textTransform: 'none',
          transition: 'all 0.25s ease',
          '&:focus-visible': {
            outline: `2px solid ${colors.secondary.main}`,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: shadows[4],
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.orange.main} 0%, ${colors.orange.light} 100%)`,
          color: '#FFFFFF',
          boxShadow: orangeShadow,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.orange.light} 0%, ${colors.orange.main} 100%)`,
            boxShadow: orangeShadowHover,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          backgroundColor: colors.primary.main,
          color: colors.background.default,
          '&:hover': {
            backgroundColor: colors.primary.light,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        outlinedPrimary: {
          borderColor: colors.secondary.main,
          color: colors.secondary.main,
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.08),
            borderColor: colors.secondary.main,
          },
        },
        outlinedSecondary: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          '&:hover': {
            backgroundColor: alpha(colors.primary.main, 0.08),
            borderColor: colors.primary.main,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.08),
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.8125rem',
        },
      },
    },
    // Icon Button
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.25s ease',
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.1),
          },
        },
      },
    },
    // Card Component
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: shadows[6],
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: shadows[9],
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    // Paper Component
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: shadows[2],
        },
        elevation2: {
          boxShadow: shadows[4],
        },
        elevation3: {
          boxShadow: shadows[6],
        },
      },
    },
    // AppBar Component
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        },
        colorPrimary: {
          backgroundColor: 'transparent',
        },
      },
    },
    // Toolbar Component
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 80,
          '@media (min-width: 600px)': {
            minHeight: 80,
          },
        },
      },
    },
    // TextField/Input Components
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.25s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.secondary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.secondary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.secondary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.secondary.main,
          },
        },
        notchedOutline: {
          borderColor: colors.grey[300],
          transition: 'border-color 0.25s ease',
        },
        input: {
          padding: '14px 16px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.text.secondary,
          '&.Mui-focused': {
            color: colors.secondary.main,
          },
        },
      },
    },
    // Select Component
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    // Menu Component
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: shadows[8],
          marginTop: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.08),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(colors.secondary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(colors.secondary.main, 0.16),
            },
          },
        },
      },
    },
    // Chip Component
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
        filled: {
          '&:hover': {
            boxShadow: shadows[2],
          },
        },
        outlined: {
          borderWidth: 1.5,
        },
        colorPrimary: {
          backgroundColor: colors.secondary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: colors.secondary.light,
          },
        },
        colorSecondary: {
          backgroundColor: colors.primary.main,
          color: colors.background.default,
        },
      },
    },
    // Avatar Component
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: colors.grey[200],
          color: colors.text.primary,
        },
      },
    },
    // Badge Component
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: colors.secondary.main,
          color: '#FFFFFF',
        },
      },
    },
    // Tabs Component
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: colors.secondary.main,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '0.9375rem',
          textTransform: 'none',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: colors.secondary.main,
          },
          '&:hover': {
            color: colors.secondary.main,
            opacity: 1,
          },
        },
      },
    },
    // Slider Component
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 6,
          '&.Mui-disabled': {
            color: colors.grey[400],
          },
        },
        track: {
          border: 'none',
          background: `linear-gradient(90deg, ${colors.secondary.main}, ${colors.secondary.light})`,
        },
        rail: {
          opacity: 0.3,
          backgroundColor: colors.grey[400],
        },
        thumb: {
          width: 20,
          height: 20,
          backgroundColor: colors.secondary.main,
          boxShadow: orangeShadow,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: orangeShadowHover,
          },
          '&:before': {
            display: 'none',
          },
        },
        valueLabel: {
          borderRadius: 8,
          backgroundColor: colors.primary.main,
          '&:before': {
            display: 'none',
          },
        },
        mark: {
          backgroundColor: colors.grey[400],
          width: 4,
          height: 4,
          borderRadius: 2,
        },
        markActive: {
          backgroundColor: colors.secondary.light,
        },
      },
    },
    // Switch Component
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: colors.background.default,
            '& + .MuiSwitch-track': {
              backgroundColor: colors.secondary.main,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 22,
          height: 22,
          boxShadow: shadows[2],
        },
        track: {
          borderRadius: 13,
          backgroundColor: colors.grey[400],
          opacity: 1,
          transition: 'background-color 0.3s ease',
        },
      },
    },
    // Checkbox Component
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.grey[400],
          '&.Mui-checked': {
            color: colors.secondary.main,
          },
        },
      },
    },
    // Radio Component
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.grey[400],
          '&.Mui-checked': {
            color: colors.secondary.main,
          },
        },
      },
    },
    // Tooltip Component
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.primary.main,
          color: colors.background.default,
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: shadows[4],
        },
        arrow: {
          color: colors.primary.main,
        },
      },
    },
    // Dialog/Modal Component
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: shadows[12],
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          fontWeight: 700,
          fontFamily: typography.fontFamilyHeading,
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    // Drawer Component
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '24px 24px 0 0',
          boxShadow: shadows[10],
        },
      },
    },
    // Snackbar Component
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: alpha(colors.success.main, 0.12),
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: alpha(colors.error.main, 0.12),
          color: colors.error.dark,
        },
        standardWarning: {
          backgroundColor: alpha(colors.warning.main, 0.12),
          color: colors.warning.dark,
        },
        standardInfo: {
          backgroundColor: alpha(colors.info.main, 0.12),
          color: colors.info.dark,
        },
      },
    },
    // Accordion Component
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '16px 0',
          minHeight: 'auto',
          '&.Mui-expanded': {
            minHeight: 'auto',
          },
        },
        content: {
          margin: 0,
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 0 16px',
        },
      },
    },
    // Divider Component
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.grey[200],
        },
      },
    },
    // Skeleton Component
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[200],
        },
        rectangular: {
          borderRadius: 8,
        },
      },
    },
    // Backdrop Component
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(colors.primary.main, 0.7),
          backdropFilter: 'blur(4px)',
        },
      },
    },
    // Link Component
    MuiLink: {
      defaultProps: {
        underline: 'none',
      },
      styleOverrides: {
        root: {
          color: colors.secondary.main,
          fontWeight: 500,
          transition: 'color 0.2s ease',
          '&:hover': {
            color: colors.secondary.light,
          },
        },
      },
    },
    // Breadcrumbs Component
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: colors.grey[400],
        },
      },
    },
    // Pagination Component
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            fontWeight: 500,
            '&.Mui-selected': {
              backgroundColor: colors.secondary.main,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: colors.secondary.light,
              },
            },
          },
        },
      },
    },
    // Table Component
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.grey[200],
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.grey[100],
          color: colors.text.primary,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.04),
          },
        },
      },
    },
    // List Component
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': {
            backgroundColor: alpha(colors.secondary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(colors.secondary.main, 0.16),
            },
          },
          '&:hover': {
            backgroundColor: alpha(colors.secondary.main, 0.08),
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: colors.secondary.main,
        },
      },
    },
    // Bottom Navigation Component (Mobile)
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          backgroundColor: colors.background.default,
          borderTop: `1px solid ${colors.grey[200]}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          padding: '8px 12px',
          color: colors.text.secondary,
          '&.Mui-selected': {
            color: colors.secondary.main,
          },
        },
        label: {
          fontSize: '0.6875rem',
          fontWeight: 500,
          '&.Mui-selected': {
            fontSize: '0.6875rem',
          },
        },
      },
    },
    // Fab Component
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: orangeShadow,
          '&:hover': {
            boxShadow: orangeShadowHover,
          },
        },
        primary: {
          background: `linear-gradient(135deg, ${colors.orange.main} 0%, ${colors.orange.light} 100%)`,
          color: '#FFFFFF',
        },
      },
    },
    // Speed Dial Component
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          background: `linear-gradient(135deg, ${colors.orange.main} 0%, ${colors.orange.light} 100%)`,
          color: '#FFFFFF',
          boxShadow: orangeShadow,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.orange.light} 0%, ${colors.orange.main} 100%)`,
            boxShadow: orangeShadowHover,
          },
        },
      },
    },
    MuiSpeedDialAction: {
      styleOverrides: {
        fab: {
          backgroundColor: colors.background.default,
          color: colors.primary.main,
          boxShadow: shadows[4],
          '&:hover': {
            backgroundColor: colors.grey[100],
          },
        },
      },
    },
  },
});

// Export theme and colors for use in styled components
export { colors, orangeShadow, orangeShadowHover };
export default theme;
