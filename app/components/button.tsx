import React from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { BodyText } from "./typography";
import { StyleProp, ViewStyle } from "react-native";

type ButtonType = "plain" | "primary";

export const Button = ({
  children,
  onPress,
  style,
  disabled = false,
  large = false,
  type = "primary",
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children?: string;
  disabled?: boolean;
  large?: boolean;
  type?: ButtonType;
}) => {
  const Btn = typesToContainer[type];
  const Txt = typesToText[type];
  return (
    <Btn
      onPress={onPress}
      activeOpacity={0.6}
      disabled={disabled || false}
      large={large}
      style={style}
    >
      {children && <Txt weight="semibold">{children}</Txt>}
    </Btn>
  );
};

const PlainButtonContainer = styled.TouchableOpacity<{
  large: boolean;
  disabled: boolean;
}>`
  padding-vertical: ${(props) =>
    props.large ? symbols.spacing._8 : symbols.spacing._4}px;
  padding-horizontal: ${symbols.spacing._6}px;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const PrimaryButtonContainer = styled(PlainButtonContainer)`
  border-radius: ${symbols.borderRadius.pill}px;
  background-color: ${symbols.colors.nearBlack};
`;

const PlainButtonText = styled(BodyText)`
  margin-left: ${symbols.spacing._4}px;
  margin-right: ${symbols.spacing._4}px;
  color: ${symbols.colors.nearBlack};
`;

const PrimaryButtonText = styled(PlainButtonText)`
  color: ${symbols.colors.pureWhite};
`;

const typesToContainer: Record<ButtonType, typeof PlainButtonContainer> = {
  plain: PlainButtonContainer,
  primary: PrimaryButtonContainer,
};

const typesToText: Record<ButtonType, typeof PrimaryButtonText> = {
  plain: PlainButtonText,
  primary: PrimaryButtonText,
};
