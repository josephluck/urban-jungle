import React from "react";
import { useStore } from "../../../store/state";
import { selectCurrentMiniProfile } from "../store/state";
import { Avatar } from "../../../components/avatar";
import styled from "styled-components/native";

export const CurrentProfileAvatar = ({ onPress }: { onPress: () => void }) => {
  const miniProfile = useStore(selectCurrentMiniProfile);
  return (
    <CurrentProfileButton onPress={onPress}>
      <Avatar
        src={miniProfile.avatar}
        letter={miniProfile.letter}
        size="small"
      />
    </CurrentProfileButton>
  );
};

const CurrentProfileButton = styled.TouchableOpacity`
  padding-vertical: ${props => props.theme.spacing._16};
  padding-horizontal: ${props => props.theme.spacing._16};
`;
