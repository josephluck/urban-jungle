import { useContext } from "react";
import { StatusBarStyle } from "react-native";
import { ThemeContext } from "styled-components/native";
import { Theme } from "../design/theme";

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

export const darkTheme: Theme = {
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
  buttonBackground: colors.deepGray,
  progressBackground: colors.midOffGray,
  progressActive: colors.pureWhite,
  switchThumb: colors.nearWhite,
  switchBackgroundFalse: colors.deepGray,
  switchBackgroundTrue: colors.paleGreen,
  tabBarActive: colors.lightBlue,
  tabBarInactive: colors.midOffGray,
  labelBackground: colors.nearBlack,
  labelText: colors.offWhite,
  fieldBackground: colors.nearBlack,
  optionBackgroundSelected: colors.deepGray,
  optionBackground: colors.nearBlack,
  optionBorderSelected: colors.deepGray,
  optionBorder: "transparent",
  loadingOverlayBackground: colors.blackTint08,
  loadingOverlayBackgroundSolid: colors.offBlack,
  loadingIndicator: colors.lightBlue,
};

export const lightTheme: Theme = {
  type: "dark-content" as StatusBarStyle,
  appBackground: colors.pureWhite,
  modalBackground: colors.pureWhite,
  avatarBorder: colors.offWhite,
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
  calendarDayActive: colors.solidBlue,
  calendarDayText: colors.offBlack,
  buttonBackground: colors.nearBlack,
  progressBackground: colors.nearWhite,
  progressActive: colors.solidBlue,
  switchThumb: colors.pureWhite,
  switchBackgroundFalse: colors.nearWhite,
  switchBackgroundTrue: colors.paleGreen,
  tabBarActive: colors.solidBlue,
  tabBarInactive: colors.midOffGray,
  labelBackground: colors.nearWhite,
  labelText: colors.deepGray,
  fieldBackground: colors.nearWhite,
  optionBackgroundSelected: colors.pureWhite,
  optionBackground: colors.nearWhite,
  optionBorderSelected: colors.darkGreen,
  optionBorder: colors.nearWhite,
  loadingOverlayBackground: colors.whiteTint05,
  loadingOverlayBackgroundSolid: colors.pureWhite,
  loadingIndicator: colors.solidBlue,
};

export const useTheme = () => useContext(ThemeContext);
