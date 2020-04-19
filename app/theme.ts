import { useContext } from "react";
import { ThemeContext } from "styled-components/native";
import { StatusBarStyle } from "react-native";

const borderRadius = {
  tiny: 4,
  small: 6,
  medium: 12,
  large: 18,
};

const font = {
  _12: {
    size: 12,
    lineHeight: 14,
  },
  _14: {
    size: 14,
    lineHeight: 16,
  },
  _16: {
    size: 16,
    lineHeight: 20,
  },
  _20: {
    size: 20,
    lineHeight: 24,
  },
  _24: {
    size: 24,
    lineHeight: 30,
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
  avatarLarge: 80,
  bottomSheetHandleHeight: 4,
  bottomSheetHandleWidth: 30,
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
  _2: 2,
  _4: 4,
  _6: 6,
  _8: 8,
  _10: 10,
  _12: 12,
  _14: 14,
  _16: 16,
  _18: 18,
  _22: 22,
  _30: 30,
  appHorizontal: 22,
  appVertical: 30,
};

const colors = {
  offBlack: "rgba(14, 19, 27, 1)",
  nearBlack: "rgba(37, 42, 51, 1)",
  deepGray: "rgba(54, 61, 74, 1)",
  midOffGray: "rgba(113, 121, 134, 1)",
  lightOffGray: "rgba(146, 155, 168, 1)",
  offWhite: "rgba(205, 206, 210, 1)",
  nearWhite: "rgba(225, 226, 230, 1)",
  blackTint08: "rgba(0, 0, 0, 0.8)",
  blackTint04: "rgba(0, 0, 0, 0.4)",
  whiteTint01: "rgba(247, 247, 248, 0.1)",
  pureWhite: "rgba(255, 255, 255, 1)",
  paleRed: "rgba(255, 243, 245, 1)",
  darkRed: "rgba(255, 17, 68, 1)",
  paleGreen: "rgba(5, 194, 125, 0.05)",
  darkGreen: "rgba(5, 194, 125, 1)",
  solidBlue: "rgba(34, 165, 222, 1)",
  appBackground: "rgba(255, 255, 255, 1)",
};

export const symbols = {
  borderRadius,
  colors,
  font,
  fontWeight,
  size,
  spacing,
};

export const darkTheme = {
  type: "light-content" as StatusBarStyle,
  appBackground: colors.offBlack,
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
  calendarDayBackground: colors.offBlack,
};

export const lightTheme: Theme = {
  type: "dark-content" as StatusBarStyle,
  appBackground: colors.pureWhite,
  avatarBorder: colors.lightOffGray,
  avatarBackground: colors.nearWhite,
  avatarPlaceholderLetter: colors.nearBlack,
  defaultTextColor: colors.offBlack,
  secondaryTextColor: colors.midOffGray,
  timelinePlantItemBackground: colors.nearWhite,
  householdSelectionChevron: colors.midOffGray,
  addNewIcon: colors.offBlack,
  bottomSheetCloseButton: colors.offBlack,
  bottomSheetBackground: "red",
  bottomSheetExpander: colors.lightOffGray,
  bottomSheetBackdrop: colors.offBlack,
  calendarDayBackground: colors.nearWhite,
};

export const useTheme = () => {
  const t = useContext(ThemeContext);
  return t;
};

export type Theme = typeof darkTheme;
