import { StackScreenProps } from "@react-navigation/stack";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useState } from "react";
import styled from "styled-components/native";
import { Button } from "../../../../components/button";
import { ScreenLayout } from "../../../../components/layouts/screen-layout";
import { PickerField } from "../../../../components/picker-field";
import { TextField } from "../../../../components/text-field";
import { ScreenTitle } from "../../../../components/typography";
import { useForm } from "../../../../hooks/use-form";
import { makeNavigationRoute } from "../../../../navigation/make-navigation-route";
import { PLANTS_STACK_NAME } from "../../../../navigation/stack-names";
import {
  PlantFields,
  upsertPlantForHousehold,
} from "../../../../store/effects";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectUniqueLocations,
} from "../../../../store/selectors";
import { useStore } from "../../../../store/state";
import { useRunWithUIState } from "../../../../store/ui";
import { symbols } from "../../../../theme";
import { selectPlantFields } from "./state";

type Fields = Pick<Required<PlantFields>, "location"> & { newLocation: string };

export const NewPlantLocationScreen = ({
  navigation,
}: StackScreenProps<{}>) => {
  const runWithUIState = useRunWithUIState();
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const locations = useStore(() => selectUniqueLocations(selectedHouseholdId), [
    selectedHouseholdId,
  ]);

  const [newLocationFieldVisible, setNewLocationFieldVisible] = useState(
    locations.length === 0,
  );

  const {
    submit,
    registerSinglePickerInput,
    registerTextInput,
  } = useForm<Fields>(
    {
      location: "",
      newLocation: "",
    },
    {
      location: [],
      newLocation: [],
    },
  );

  const plantFields = useStore(selectPlantFields);

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.map(({ location }) => ({ ...plantFields, location })),
          TE.chain((plant) =>
            upsertPlantForHousehold(plant)(selectedHouseholdId),
          ),
          TE.map(navigation.popToTop),
        ),
      ),
    [selectedHouseholdId, submit, plantFields],
  );

  const handleSkip = useCallback(() => {}, []);

  const handleShowNewLocationField = useCallback(
    () => setNewLocationFieldVisible(true),
    [],
  );

  return (
    <ScreenLayout
      onBack={navigation.goBack}
      progress={90}
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
        {newLocationFieldVisible ? (
          <TextField {...registerTextInput("location")} />
        ) : (
          <PickerField
            multiValue={false}
            centered
            options={locations.map((location) => ({
              value: location,
              label: location,
            }))}
            newValueLabel="Somewhere else"
            onNewValuePress={handleShowNewLocationField}
            {...registerSinglePickerInput("location")}
          />
        )}
      </ScreenContent>
    </ScreenLayout>
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
  stackName: PLANTS_STACK_NAME,
  routeName: "NEW_PLANT_LOCATION_SCREEN",
});
