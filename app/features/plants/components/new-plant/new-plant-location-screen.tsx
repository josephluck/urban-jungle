import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { BackableScreenLayout } from "../../../../components/layouts/backable-screen";
import { PickerField } from "../../../../components/picker-field";
import { ScreenTitle } from "../../../../components/typography";
import { useForm } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { useStore } from "../../../../store/state";
import { runWithUIState } from "../../../../store/ui";
import { symbols } from "../../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../../households/store/state";
import { PlantFields, upsertPlantForHousehold } from "../../store/effects";
import { selectUniqueLocations } from "../../store/state";
import { selectPlantFields } from "./state";

type Fields = Pick<Required<PlantFields>, "location">;

export const NewPlantLocationScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { submit, registerSinglePickerInput } = useForm<Fields>(
    {
      location: "",
    },
    {
      location: [],
    }
  );

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

  const plantFields = useStore(selectPlantFields);

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const locations = useStore(() => selectUniqueLocations(selectedHouseholdId), [
    selectedHouseholdId,
  ]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "BAD_REQUEST" as IErr),
          TE.map(({ location }) => ({ ...plantFields, location })),
          TE.chain((plant) =>
            upsertPlantForHousehold(plant)(selectedHouseholdId)
          ),
          TE.map(() => navigation.goBack())
        )
      ),
    [selectedHouseholdId, submit, plantFields]
  );

  const handleSkip = useCallback(() => {}, []); // TODO: implement

  const handleShowNewLocationDrawer = useCallback(() => {}, []);

  // TODO: support progress bar
  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <SkipButton type="plain" onPress={handleSkip}>
            Skip
          </SkipButton>
          <Button large onPress={handleSubmit}>
            Save
          </Button>
        </Footer>
      }
    >
      <ScreenContent>
        <ScreenTitle title="Set a location" />
        <PickerField
          multiValue={false}
          centered
          options={locations.map((location) => ({
            value: location,
            label: location,
          }))}
          newValueLabel="Somewhere else"
          onNewValuePress={handleShowNewLocationDrawer}
          {...registerSinglePickerInput("location")}
        />
      </ScreenContent>
    </BackableScreenLayout>
  );
};

const ScreenContent = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

const SkipButton = styled(Button)`
  margin-bottom: ${symbols.spacing._8}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

export const newPlantLocationRoute = makeNavigationRoute({
  screen: NewPlantLocationScreen,
  routeName: "NEW_PLANT_LOCATION_SCREEN",
  authenticated: true,
});
