import { useStore } from "../../../store/state";
import { selectProfilesLetterAndAvatarForHousehold } from "../store/state";
import styled from "styled-components/native";
import { Avatar } from "../../../components/avatar";

export const HouseholdProfilesList = ({
  householdId
}: {
  householdId: string;
}) => {
  const avatarsNames = useStore(() =>
    selectProfilesLetterAndAvatarForHousehold(householdId)
  );

  return (
    <Wrapper>
      {avatarsNames.map(({ avatar, letter }) => {
        <Avatar letter={letter} src={avatar} />;
      })}
    </Wrapper>
  );
};

const Wrapper = styled.View`
  flex-direction: column;
`;
