import { useStore } from "../../../store/state";
import { selectProfilesLetterAndAvatarForHousehold } from "../store/state";
import styled from "styled-components/native";
import { Avatar } from "../../../components/avatar";
import { AvatarButton } from "../../../components/avatar-button";
import { useCallback } from "react";
import { shareHouseholdInvitation } from "../store/effects";

export const ManageHouseholdMembers = ({
  householdId
}: {
  householdId: string;
}) => {
  const avatarsNames = useStore(() =>
    selectProfilesLetterAndAvatarForHousehold(householdId)
  );

  const handleAddNewHouseholdMember = useCallback(
    () => shareHouseholdInvitation(householdId),
    [householdId]
  );

  return (
    <Wrapper>
      {avatarsNames.map(({ avatar, letter }) => {
        <Avatar letter={letter} src={avatar} />;
      })}
      <AvatarButton onPress={handleAddNewHouseholdMember} />
    </Wrapper>
  );
};

const Wrapper = styled.View`
  flex-direction: column;
`;
