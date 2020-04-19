import { useContext } from "react";
import { ThemeContext } from "styled-components/native";
import { StatusBarStyle } from "react-native";

const baseSize = 6;
const baseFontSize = 20;

const borderRadius = {
  tiny: baseSize / 2,
  small: baseSize,
  medium: baseSize * 2,
  large: baseSize * 3,
};

const font = {
  _16: {
    size: baseFontSize,
    lineHeight: baseFontSize * 1.2,
  },
  _24: {
    size: baseFontSize * 1.4,
    lineHeight: baseFontSize * 1.4 * 1.2,
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
  solidBlue: "#0909F9",
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
