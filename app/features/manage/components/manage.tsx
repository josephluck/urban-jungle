import React from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectProfilesForHousehold,
} from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { useStore } from "../../../store/state";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { ListItem } from "../../../components/list-item";
import { Heading } from "../../../components/typography";
import { Button } from "../../../components/button";
import { shareHouseholdInvitation } from "../../households/store/effects";

export const Manage = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <ManageScreen />;
  }

  return null;
};

const ManageScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const people = useStore(
    () => selectProfilesForHousehold(selectedHouseholdId),
    [selectedHouseholdId]
  );

  return (
    <ScreenLayout>
      {selectedHouseholdId ? (
        <ScreenContainer>
          <WelcomeMessageContainer>
            <Heading>Your network</Heading>
            <Button onPress={shareHouseholdInvitation(selectedHouseholdId)}>
              Invite
            </Button>
          </WelcomeMessageContainer>
          <ManageList
            contentContainerStyle={{
              paddingHorizontal: symbols.spacing.appHorizontal,
            }}
          >
            {people.map((person) => (
              <ListItem
                key={person.id}
                image={pipe(
                  person.avatar,
                  O.getOrElse(() => "")
                )}
                title={pipe(
                  person.name,
                  O.getOrElse(() => "")
                )}
              />
            ))}
          </ManageList>
        </ScreenContainer>
      ) : null}
    </ScreenLayout>
  );
};

const ScreenContainer = styled.View`
  padding-top: ${symbols.spacing.appVertical};
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const ManageList = styled.ScrollView`
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing.appHorizontal * 2};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
