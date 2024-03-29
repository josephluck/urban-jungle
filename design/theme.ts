import { useContext } from "react";
import { Dimensions, StatusBarStyle } from "react-native";
import { ThemeContext } from "styled-components/native";

type ScreenSize = "small" | "normal" | "large" | "xlarge";

// NB: sizes from https://developer.android.com/guide/practices/screens_support.html
const getScreenSize = (): ScreenSize => {
  const { width, height } = Dimensions.get("window");

  if (width <= 320 && height <= 426) {
    return "small";
  } else if (width <= 320 && height <= 470) {
    return "normal";
  } else if (width <= 480 && height <= 640) {
    return "large";
  }
  return "xlarge";
};

type ScreenDimensions = {
  baseSize: number;
  baseFontSize: number;
};

const dimensions: Record<ScreenSize, ScreenDimensions> = {
  small: { baseSize: 4, baseFontSize: 16 },
  normal: { baseSize: 4, baseFontSize: 16 },
  large: { baseSize: 6, baseFontSize: 20 },
  xlarge: { baseSize: 6, baseFontSize: 20 },
};

const { baseSize, baseFontSize } = dimensions[getScreenSize()];

const borderRadius = {
  tiny: baseSize / 2,
  small: baseSize,
  medium: baseSize * 2,
  large: baseSize * 3,
  pill: 9999,
};

const font = {
  _8: {
    size: baseFontSize * 0.6,
    lineHeight: baseFontSize * 0.6 * 1.2,
  },
  _12: {
    size: baseFontSize * 0.8,
    lineHeight: baseFontSize * 0.8 * 1.2,
  },
  _16: {
    size: baseFontSize,
    lineHeight: baseFontSize * 1.2,
  },
  _20: {
    size: baseFontSize * 1.2,
    lineHeight: baseFontSize * 1.2 * 1.2,
  },
  _28: {
    size: baseFontSize * 1.6,
    lineHeight: baseFontSize * 1.6 * 1.2,
  },
};

const fontWeight = {
  medium: 500,
  bold: 700,
};

const size = {
  _50: 50,
  _80: 80,
  iconChevron: 8,
  iconBottomTabBar: 14,
  filterActiveCheck: 18,
  modalCloseCross: 18,
  closeBarHeight: 4,
  closeBarWidth: 26,
  avatarSmall: 40,
  avatarDefault: 50,
  avatarLarge: 120,
  bottomSheetHandleHeight: 4,
  bottomSheetHandleWidth: 30,
  minimumTouchableSize: 28,
};

export type AvatarSize = "small" | "default" | "large";

export const avatarSizeToValue: Record<AvatarSize, number> = {
  small: size.avatarSmall,
  default: size.avatarDefault,
  large: size.avatarLarge,
};

export const avatarSizeToBorderWidth: Record<AvatarSize, number> = {
  small: 1,
  default: 2,
  large: 3,
};

const spacing = {
  _2: baseSize / 2,
  _4: baseSize,
  _6: baseSize * 1.5,
  _8: baseSize * 2,
  _12: baseSize * 3,
  _16: baseSize * 4,
  _20: baseSize * 5,
  _32: baseSize * 8,
  appHorizontal: baseSize * 5,
  appVertical: baseSize * 8,
  tabBarHeight: 64,
};

const colors = {
  offBlack: "rgba(14, 19, 27, 1)",
  nearBlack: "rgba(37, 42, 51, 1)",
  deepGray: "rgba(64, 71, 84, 1)",
  midOffGray: "rgba(113, 121, 134, 1)",
  lightOffGray: "rgba(146, 155, 168, 1)",
  offWhite: "rgba(215, 216, 220, 1)",
  nearWhite: "rgba(235, 236, 240, 1)",
  blackTint08: "rgba(0, 0, 0, 0.8)",
  blackTint04: "rgba(0, 0, 0, 0.4)",
  whiteTint05: "rgba(247, 247, 248, 0.5)",
  whiteTint01: "rgba(247, 247, 248, 0.1)",
  pureWhite: "rgba(255, 255, 255, 1)",
  paleRed: "rgba(255, 243, 245, 1)",
  darkRed: "rgba(255, 17, 68, 1)",
  paleGreen: "rgba(5, 194, 125, 0.05)",
  darkGreen: "rgba(5, 194, 125, 1)",
  solidBlue: "#0909F9",
  lightBlue: "#8989F9",
  appBackground: "rgba(255, 255, 255, 1)",
  transparent: "transparent",
};

const aspectRatio = {
  plantImage: 16 / 9,
  profileImage: 1 / 1,
};

export const symbols = {
  aspectRatio,
  borderRadius,
  colors,
  font,
  fontWeight,
  size,
  spacing,
};

export const defaultTheme = {
  type: "light-content" as StatusBarStyle,
  appBackground: colors.offBlack,
  modalBackground: colors.nearBlack,
  avatarBorder: colors.midOffGray,
  avatarBackground: colors.deepGray,
  avatarPlaceholderLetter: colors.nearWhite,
  defaultTextColor: colors.pureWhite,
  secondaryTextColor: colors.lightOffGray,
  timelinePlantItemBackground: colors.nearBlack,
  householdSelectionChevron: colors.midOffGray,
  addNewIcon: colors.pureWhite,
  bottomSheetCloseButton: colors.offBlack,
  bottomSheetBackground: colors.pureWhite,
  bottomSheetExpander: colors.lightOffGray,
  bottomSheetBackdrop: colors.offBlack,
  calendarDayBackground: colors.deepGray,
  calendarDayActive: colors.lightBlue,
  calendarDayText: colors.offWhite,
  buttonBackground: symbols.colors.deepGray,
  progressBackground: symbols.colors.midOffGray,
  progressActive: symbols.colors.pureWhite,
  switchThumb: symbols.colors.nearWhite,
  switchBackgroundFalse: symbols.colors.deepGray,
  switchBackgroundTrue: symbols.colors.paleGreen,
  tabBarActive: symbols.colors.lightBlue,
  tabBarInactive: symbols.colors.midOffGray,
  labelBackground: symbols.colors.nearBlack,
  labelText: symbols.colors.offWhite,
  fieldBackground: symbols.colors.nearBlack,
  optionBackgroundSelected: symbols.colors.deepGray,
  optionBackground: symbols.colors.nearBlack,
  optionBorderSelected: symbols.colors.deepGray,
  optionBorder: "transparent",
  loadingOverlayBackground: symbols.colors.blackTint08,
  loadingOverlayBackgroundSolid: symbols.colors.offBlack,
  loadingIndicator: symbols.colors.lightBlue,
};

export const useTheme = () => useContext(ThemeContext);

export type Theme = typeof defaultTheme;
