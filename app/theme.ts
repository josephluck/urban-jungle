const borderRadius = {
  tiny: 4,
  small: 6,
  medium: 12,
  large: 18
};

const colors = {
  offBlack: "rgba(14, 19, 27, 1)",
  deepGray: "rgba(54, 61, 74, 1)",
  midOffGray: "rgba(113, 121, 134, 1)",
  lightOffGray: "rgba(146, 155, 168, 1)",
  nearWhite: "rgba(225, 226, 230, 1)",
  blackTint08: "rgba(0, 0, 0, 0.8)",
  blackTint04: "rgba(0, 0, 0, 0.4)",
  whiteTint01: "rgba(247, 247, 248, 0.1)",
  pureWhite: "rgba(255, 255, 255, 1)",
  paleRed: "rgba(255, 243, 245, 1)",
  darkRed: "rgba(255, 17, 68, 1)",
  paleGreen: "rgba(5, 194, 125, 0.05)",
  darkGreen: "rgba(5, 194, 125, 1)",
  solidBlue: "rgba(34, 165, 222, 1)"
};

const componentColors = {
  avatarBorder: colors.midOffGray,
  avatarBackground: colors.deepGray,
  avatarPlaceholderLetter: colors.nearWhite
};

const font = {
  _12: {
    size: 12,
    lineHeight: 14
  },
  _14: {
    size: 14,
    lineHeight: 16
  },
  _16: {
    size: 16,
    lineHeight: 20
  },
  _20: {
    size: 20,
    lineHeight: 24
  },
  _24: {
    size: 24,
    lineHeight: 30
  }
};

const fontWeight = {
  medium: 500,
  bold: 700
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
  avatarSmall: 30,
  avatarDefault: 50,
  avatarLarge: 80
};

export type AvatarSize = "small" | "default" | "large";

export const avatarSizeToValue: Record<AvatarSize, number> = {
  small: size.avatarSmall,
  default: size.avatarDefault,
  large: size.avatarLarge
};

export const avatarSizeToBordeWidth: Record<AvatarSize, number> = {
  small: 1,
  default: 2,
  large: 3
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
  _22: 22
};

export const theme = {
  borderRadius,
  colors,
  font,
  fontWeight,
  size,
  spacing,
  componentColors
};

export type Theme = typeof theme;
