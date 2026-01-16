// src/config/theme.ts
export const themeColors = {
  // Main background colors (from your palette)
  background: "#1A1C36", // Dark navy-blue
  backgroundLight: "#1F2442", // Slightly lighter navy-blue
  backgroundLighter: "#2A3258", // Custom intermediate shade

  // Text colors
  textPrimary: "rgba(255, 255, 255, 0.92)",
  textSecondary: "rgba(255, 255, 255, 0.72)",
  textTertiary: "rgba(255, 255, 255, 0.55)",

  // Border colors
  border: "rgba(255, 255, 255, 0.12)",
  borderLight: "rgba(255, 255, 255, 0.18)",

  // Accent colors (from your palette)
  primary: "#3258F9", // Vibrant blue
  primaryHover: "#4A6CFA", // Lighter blue
  secondary: "#FF3A6F", // Pink-red
  success: "#32897A", // Teal
  warning: "#E6E92E", // Yellow
  error: "#FF3A6F", // Same as secondary for errors
  info: "#3258F9", // Same as primary

  // Component specific
  siderBackground: "#16182E", // Darker than main background
  headerBackground: "#1F2442", // Matches backgroundLight
  cardBackground: "rgba(31, 36, 66, 0.6)", // Semi-transparent
  chartBackground: "rgba(31, 36, 66, 0.8)",

  // Button colors
  buttonPrimary: "#3258F9",
  buttonDanger: "#FF3A6F",
  buttonSuccess: "#32897A",
  buttonWarning: "#E6E92E",

  kycVerified: "#52c41a",
  kycPending: "#faad14",
  passwordStrong: "#52c41a",
  passwordMedium: "#faad14",
  passwordWeak: "#f5222d",
};

export const chartColors = {
  line: "#3258F9", // Primary blue
  areaFill: "rgba(50, 88, 249, 0.15)",
  lineSecondary: "#FF3A6F", // Secondary pink-red
  areaFillSecondary: "rgba(255, 58, 111, 0.15)",
  point: "#E6E92E", // Yellow for points
  pointBorder: "#1F2442",
};

export const metricCardColors = {
  positive: "#32897A", // Teal
  negative: "#FF3A6F", // Pink-red
  neutral: "#3258F9", // Blue
  warning: "#E6E92E", // Yellow
  iconBackground: (color: string) => `${color}30`, // 30% opacity
};

// Chart color palette for multiple datasets
export const chartColorPalette = [
  "#3258F9", // Blue
  "#FF3A6F", // Pink-red
  "#E6E92E", // Yellow
  "#32897A", // Teal
  "#8A4FFF", // Purple (additional)
  "#00C2D4", // Cyan (additional)
];
