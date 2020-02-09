import { useStore } from "../../../store/state";
import { selectProfilesLetterAndAvatarForHousehold } from "../store/state";
import styled from "styled-components/native";
import { Avatar } from "../../../components/avatar";
import { AvatarButton } from "../../../components/avatar-button";
import { useCallback, useState } from "react";
import { shareHouseholdInvitation } from "../store/effects";
import { Button } from "react-native";

export const ManageHouseholdMembers = ({
  householdId
}: {
  householdId: string;
}) => {
  const [editMode, setEditMode] = useState(false);
  const avatarsNames = useStore(() =>
    selectProfilesLetterAndAvatarForHousehold(householdId)
  );

  const handleAddNewHouseholdMember = useCallback(
    () => shareHouseholdInvitation(householdId),
    [householdId]
  );

  const enterEditMode = useCallback(() => {
    setEditMode(true);
  }, []);

  const exitEditMode = useCallback(() => {
    setEditMode(true);
  }, []);

  return (
    <Wrapper>
      <ListWrapper onLongPress={enterEditMode}>
        {avatarsNames.map(({ avatar, letter }, i) => {
          <Avatar key={i} letter={letter} src={avatar} />;
        })}
        <AvatarButton onPress={handleAddNewHouseholdMember} />
      </ListWrapper>
      {editMode && <Button title="Cancel" onPress={exitEditMode} />}
    </Wrapper>
  );
};

const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
`;

const ListWrapper = styled.TouchableOpacity`
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
