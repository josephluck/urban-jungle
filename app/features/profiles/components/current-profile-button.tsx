import React from "react";
import { useStore } from "../../../store/state";
import { selectCurrentMiniProfile } from "../store/state";
import { Avatar } from "../../../components/avatar";
import styled from "styled-components/native";
import { symbols } from "../../../theme";

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
  padding-vertical: ${symbols.spacing._16};
  padding-horizontal: ${symbols.spacing._16};
`;
