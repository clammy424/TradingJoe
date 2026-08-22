// Centralized design tokens for TradingJoe.
// Warm cream background, soft purple as the primary interactive color,
// NYU Violet and magenta reserved for rare accents.

export const Colors = {
  background: "#FFFCF8",
  surface: "#FFFFFF",

  primary: "#9B78B5",
  primaryLight: "#EEE6F3",
  primaryDark: "#6B3F86",
  nyuViolet: "#57068C",

  accent: "#FB0F78",

  textPrimary: "#000000",
  textBody: "#404040",
  textSecondary: "#6D6D6D",

  border: "#D6D6D6",

  success: "#16a34a",
  error: "#dc2626",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
};

export const FontFamily = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
};

// Consistent hierarchy for screen titles, section headers, body text,
// metadata, buttons, and labels. Keep this list intact rather than adding
// one-off font sizes in individual screens.
export const Typography = {
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.textBody,
  },
  metadata: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Colors.surface,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
};
