import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { CameraField } from "../../../components/camera-field";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { PickerField } from "../../../components/picker-field";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { ImageModel, makeImageModel } from "../../../models/image";
import { PlantModel } from "../../../models/plant";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { IErr } from "../../../utils/err";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { upsertPlantForHousehold } from "../store/effects";
import { selectUniqueLocations } from "../store/state";

type Fields = Required<Pick<PlantModel, "name" | "location">> & {
  avatar: ImageModel;
};

export const ManagePlantScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { plantId = "", ...params } = managePlantRoute.getParams(navigation);

  const {
    submit,
    registerTextInput,
    registerSinglePickerInput,
    registerCameraField,
  } = useForm<Fields>(
    {
      name: params.name || "",
      location: params.location || "",
      avatar: params.avatar || makeImageModel(),
    },
    { name: [constraints.isRequired], location: [], avatar: [] }
  );

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
        <TextField label="Name" {...registerTextInput("name")} />
        <PickerField
          label="Location"
          multiValue={false}
          options={locations.map((location) => ({
            value: location,
            label: location,
          }))}
          {...registerSinglePickerInput("location")}
        />
        <CameraField
          label="Picture"
          type="plant"
          {...registerCameraField("avatar")}
        />
      </ContentContainer>
    </BackableScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-bottom: ${symbols.spacing.appHorizontal}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;

type ManagePlantRouteParams = {
  plantId?: string;
  name?: string;
  location?: string;
  avatar?: ImageModel;
};

export const managePlantRoute = makeNavigationRoute<ManagePlantRouteParams>({
  screen: ManagePlantScreen,
  routeName: "MANAGE_PLANT_SCREEN",
  authenticated: true,
  defaultParams: {
    plantId: "",
    name: "",
    location: "",
    avatar: makeImageModel(),
  },
  serializeParams: ({ avatar, ...params }) => ({
    ...params,
    avatar: JSON.stringify(avatar),
  }),
  deserializeParams: (params) => ({
    plantId: params.plantId,
    name: params.name,
    location: params.location,
    avatar: pipe(
      O.fromNullable(params.avatar),
      O.map(JSON.parse),
      O.getOrElse(() => makeImageModel())
    ),
  }),
});
