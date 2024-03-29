import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "@urban-jungle/design/components/button";
import {
  ContentContainer,
  Footer,
  ScreenLayout,
} from "@urban-jungle/design/components/layouts/screen-layout";
import { PickerField } from "@urban-jungle/design/components/picker-field";
import { TextField } from "@urban-jungle/design/components/text-field";
import { ImageModel, makeImageModel } from "@urban-jungle/shared/models/image";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { PLANTS_STACK_NAME } from "../../../navigation/stack-names";
import { upsertPlantForHousehold } from "../../../store/effects";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectUniqueLocations,
} from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { CameraButton } from "../../camera/camera-button";

type Fields = Required<Pick<PlantModel, "name" | "nickname" | "location">> & {
  avatar: ImageModel;
};

export const ManagePlantScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof ManagePlantRouteParams, undefined>>) => {
  const runWithUIState = useRunWithUIState();
  const { plantId = "", ...params } = managePlantRoute.getParams(route);

  const {
    submit,
    registerTextInput,
    registerSinglePickerInput,
    registerCameraField,
  } = useForm<Fields>(
    {
      name: params.name || "",
      nickname: params.nickname || "",
      location: params.location || "",
      avatar: params.avatar || makeImageModel(),
    },
    { name: [constraints.isRequired], nickname: [], location: [], avatar: [] },
  );

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const locations = useStore(
    () => selectUniqueLocations(selectedHouseholdId),
    [selectedHouseholdId],
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chain((plant) =>
            upsertPlantForHousehold(plant, plantId)(selectedHouseholdId),
          ),
          TE.map(() => navigation.goBack()),
        ),
      ),
    [selectedHouseholdId, submit],
  );

  return (
    <ScreenLayout
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
        <TextField label="Nickname" {...registerTextInput("nickname")} />
        <PickerField
          label="Location"
          multiValue={false}
          options={locations.map((location) => ({
            value: location,
            label: location,
          }))}
          {...registerSinglePickerInput("location")}
        />
        <CameraButton
          viewport
          label="Picture"
          type="plant"
          {...registerCameraField("avatar")}
        />
      </ContentContainer>
    </ScreenLayout>
  );
};

type ManagePlantRouteParams = {
  plantId?: string;
  name?: string;
  nickname?: string;
  location?: string;
  avatar?: ImageModel;
};

export const managePlantRoute = makeNavigationRoute<ManagePlantRouteParams>({
  screen: ManagePlantScreen,
  stackName: PLANTS_STACK_NAME,
  routeName: "MANAGE_PLANT_SCREEN",
  defaultParams: {
    plantId: "",
    name: "",
    nickname: "",
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
    nickname: params.nickname,
    location: params.location,
    avatar: pipe(
      O.fromNullable(params.avatar),
      O.map(JSON.parse),
      O.getOrElse(() => makeImageModel()),
    ),
  }),
});
