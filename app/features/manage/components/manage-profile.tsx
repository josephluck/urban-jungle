import { StackScreenProps } from "@react-navigation/stack";
import { makeImageModel } from "@urban-jungle/shared/models/image";
import {
  makeProfileModel,
  ProfileModel,
} from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import { Camera } from "expo-camera";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { CameraButton } from "../../../components/camera-button";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { updateProfile } from "../../../store/effects";
import { selectCurrentProfile } from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";

type Fields = Required<Pick<ProfileModel, "name" | "avatar">>;

export const ManageProfileScreen = ({
  navigation,
  route,
}: StackScreenProps<Record<keyof ManageProfileRouteParams, undefined>>) => {
  const runWithUIState = useRunWithUIState();
  const { profileId = "" } = manageProfileRoute.getParams(route);
  const currentProfile = useStore(selectCurrentProfile);
  const profile = pipe(
    currentProfile,
    O.getOrElse(() => makeProfileModel({ id: profileId })),
  );

  const { submit, registerTextInput, registerCameraField } = useForm<Fields>(
    {
      name: profile.name || "",
      avatar: profile.avatar || makeImageModel(),
    },
    { name: [constraints.isRequired], avatar: [] },
  );

  const handleSubmit = useCallback(
    () =>
      runWithUIState(
        pipe(
          TE.fromEither(submit()),
          TE.mapLeft(() => "VALIDATION" as IErr),
          TE.chain(updateProfile),
          TE.map(() => navigation.goBack()),
        ),
      ),
    [submit],
  );

  return (
    <ScreenLayout
      onBack={navigation.goBack}
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
        <CameraButton
          viewport
          label="Picture"
          type="profile"
          direction={Camera.Constants.Type.front}
          {...registerCameraField("avatar")}
        />
      </ContentContainer>
    </ScreenLayout>
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

type ManageProfileRouteParams = {
  profileId: string;
};

export const manageProfileRoute = makeNavigationRoute<ManageProfileRouteParams>(
  {
    screen: ManageProfileScreen,
    stackName: MANAGE_STACK_NAME,
    routeName: "MANAGE_PROFILE_SCREEN",
    defaultParams: {
      profileId: "",
    },
  },
);
