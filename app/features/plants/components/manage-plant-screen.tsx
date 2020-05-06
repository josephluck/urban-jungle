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
import { upsertPlantForHousehold } from "../store/effects";
import { selectUniqueLocations } from "../store/state";

type Fields = Pick<PlantModel, "name" | "location">;

export const ManagePlantScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const extractFieldFromNav = (field: keyof Fields): string =>
    navigation.getParam(field) || "";

  const { submit, registerTextInput, registerSinglePickerInput } = useForm<
    Fields
  >(
    {
      name: extractFieldFromNav("name"),
      location: extractFieldFromNav("location"),
    },
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

  const handleSubmit = useCallback(
    () =>
      pipe(
        // TODO: extract these two since it'll be a common pattern?
        TE.fromEither(submit()),
        TE.mapLeft(() => "BAD_REQUEST" as IErr),
        TE.chain((plant) =>
          upsertPlantForHousehold(plant, plantId)(selectedHouseholdId)
        ),
        TE.map(() => navigation.goBack())
      )(),
    [selectedHouseholdId, submit]
  );

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <Button large onPress={handleSubmit}>
            Save
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <TextField label="Name" autoFocus {...registerTextInput("name")} />
        <PickerField
          label="Location"
          multiValue={false}
          options={locations.map((location) => ({
            value: location,
            label: location,
          }))}
          {...registerSinglePickerInput("location")}
        />
      </ContentContainer>
    </BackableScreenLayout>
  );
};

export const MANAGE_PLANT_SCREEN = "MANAGE_PLANT_SCREEN";

export const PLANT_ID = "PLANT_ID";

export const createManagePlantRoute = ({
  plantId,
  ...fields
}: { plantId?: string } & Partial<Fields> = {}) => ({
  routeName: MANAGE_PLANT_SCREEN,
  params: { [PLANT_ID]: plantId, ...fields },
});

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;
