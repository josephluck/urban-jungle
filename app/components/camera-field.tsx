import * as Permissions from "expo-permissions";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

import { ImageModel } from "@urban-jungle/shared/models/image";
import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";

import { takeAndUploadPicture } from "../features/photos/camera";
import { symbols } from "../theme";
import { FormField } from "./form-field";
import { Icon } from "./icon";

export type CameraFieldProps = {
  value?: ImageModel;
  onChange: (value: ImageModel) => void;
  onTouched?: () => void;
  touched?: boolean;
  error?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  type?: StorageEntityType;
};

export const CameraField = ({
  value,
  onChange,
  onTouched,
  touched,
  error,
  label,
  style,
  type = "default",
}: CameraFieldProps) => {
  const [saving, setSaving] = useState(false);

  const handleClearResult = useCallback(() => {
    if (onTouched) {
      onTouched();
    }
    onChange({ uri: "", height: 0, width: 0 });
  }, []);

  const handleLaunchCamera = async () => {
    if (onTouched) {
      onTouched();
    }
    pipe(
      obtainCameraPermissions,
      TE.map(() => setSaving(true)),
      TE.chain(() => takeAndUploadPicture(type)),
      TE.map((image) => {
        onChange(image);
        setSaving(false);
      }),
      TE.mapLeft(() => setSaving(false)),
    )();
  };

  const hasValue = pipe(
    O.fromNullable(value),
    O.filter((v) => Boolean(v.uri)),
    O.isSome,
  );

  // TODO: progress bar / loading indicator...
  return (
    <FormField label={label} error={error} touched={touched}>
      <ContainerButton
        disabled={hasValue || saving}
        onPress={handleLaunchCamera}
        style={style}
      >
        {hasValue && value ? (
          <TakenPictureContainer>
            <TakenPicture source={{ uri: value.uri }} />
            <RetryButton onPress={handleClearResult}>
              <Icon icon="x" size={20} />
            </RetryButton>
          </TakenPictureContainer>
        ) : (
          <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
        )}
      </ContainerButton>
    </FormField>
  );
};

const obtainCameraPermissions: TE.TaskEither<IErr, void> = TE.tryCatch(
  async () => {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const roll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (camera.status !== "granted" || roll.status !== "granted") {
      throw new Error();
    }
  },
  () => "BAD_REQUEST",
);

const ContainerButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.fieldBackground};
  border-radius: ${symbols.borderRadius.small}px;
  width: 100%;
  aspect-ratio: ${symbols.aspectRatio.plantImage};
`;

const TakenPictureContainer = styled.View``;

const RetryButton = styled.TouchableOpacity`
  position: absolute;
  top: ${symbols.spacing._6}px;
  right: ${symbols.spacing._6}px;
  background-color: ${symbols.colors.pureWhite};
  padding-horizontal: ${symbols.spacing._6}px;
  padding-vertical: ${symbols.spacing._6}px;
  border-radius: 100px;
  flex-grow: 0;
`;

const TakenPicture = styled.Image`
  width: 100%;
  aspect-ratio: ${16 / 9};
`;
