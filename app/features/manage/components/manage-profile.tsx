import { StackScreenProps } from "@react-navigation/stack";
import { makeImageModel } from "@urban-jungle/shared/models/image";
import {
  makeProfileModel,
  ProfileModel,
} from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { CameraField } from "../../../components/camera-field";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { updateProfile } from "../../profiles/store/effects";
import { selectCurrentProfile } from "../../profiles/store/state";

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
    <BackableScreenLayout
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
        <CameraField
          label="Picture"
          type="profile"
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

type ManageProfileRouteParams = {
  profileId: string;
};

export const manageProfileRoute = makeNavigationRoute<ManageProfileRouteParams>(
  {
    screen: ManageProfileScreen,
    routeName: "MANAGE_PROFILE_SCREEN",
    defaultParams: {
      profileId: "",
    },
  },
);
