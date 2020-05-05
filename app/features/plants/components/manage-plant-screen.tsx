import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { PickerField } from "../../../components/picker-field";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { PlantModel } from "../../../models/plant";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { IErr } from "../../../utils/err";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { createPlantForHousehold } from "../store/effects";
import { selectUniqueLocations } from "../store/state";

export const ManagePlantScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  type Fields = Pick<PlantModel, "name" | "location">;
  const {
    values,
    validate,
    registerTextInput,
    registerSinglePickerInput,
  } = useForm<Fields>(
    { name: "", location: "" },
    { name: [constraints.isRequired], location: [] }
  );
  const plantId = navigation.getParam(PLANT_ID);

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

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

  const handleSubmit = useCallback(async () => {
    if (plantId) {
    } else {
      pipe(
        // TODO: extract these two since it'll be a common pattern?
        TE.fromEither(validate()),
        TE.mapLeft(() => "BAD_REQUEST" as IErr),
        TE.chain((plant) =>
          createPlantForHousehold(plant)(selectedHouseholdId)
        ),
        TE.map((plant) => navigation.navigate(createPlantRoute(plant.id)))
      )();
    }
  }, [selectedHouseholdId]);

  console.log(values);

  return (
    <BackableScreenLayout onBack={handleGoBack}>
      <ContentContainer>
        <TextField label="Name" {...registerTextInput("name")} />
        <PickerField
          label="Location"
          multiValue={false}
          options={locations}
          {...registerSinglePickerInput("location")}
        />
        <Button onPress={handleSubmit}>Save</Button>
      </ContentContainer>
    </BackableScreenLayout>
  );
};

export const MANAGE_PLANT_SCREEN = "MANAGE_PLANT_SCREEN";

export const PLANT_ID = "PLANT_ID";

export const createPlantRoute = (plantId: string) => ({
  routeName: MANAGE_PLANT_SCREEN,
  params: { [PLANT_ID]: plantId },
});

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;
