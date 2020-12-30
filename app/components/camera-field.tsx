import { ImageModel } from "@urban-jungle/shared/models/image";
import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useEffect, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";
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
  /**
   * When true will place the
   */
  viewport?: boolean;
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
  viewport = false,
}: CameraFieldProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClearResult = useCallback(() => {
    if (onTouched) {
      onTouched();
    }
    onChange({ uri: "", height: 0, width: 0 });
  }, [onTouched, onChange]);

  const handleLaunchCamera = useCallback(async () => {
    if (onTouched) {
      onTouched();
    }
    pipe(
      obtainCameraPermissions,
      TE.map(() => setSaving(true)),
      TE.chain(() => takeAndUploadPicture(type)),
      TE.map(onChange),
      TE.map(() => setSaving(false)),
      TE.mapLeft(() => setSaving(false)),
    )();
  }, [setSaving, type, onTouched]);

  const handleAskForPermission = useCallback(() => {
    pipe(obtainCameraPermissions)();
  }, []);

  const hasValue = pipe(
    O.fromNullable(value),
    O.filter((v) => Boolean(v.uri)),
    O.isSome,
  );

  useEffect(() => {
    const doEffect = async () => {
      const result = await Permissions.getAsync(Permissions.CAMERA);
      setHasPermission(result.granted);
    };
    doEffect();
  }, []);

  // TODO: progress bar / loading indicator...
  return (
    <FormField label={label} error={error} touched={touched}>
      {viewport ? (
        <ContainerButton
          disabled={hasValue || saving || hasPermission}
          onPress={handleAskForPermission}
          style={style}
        >
          {hasValue && value ? (
            <ImagePreview uri={value.uri} onPress={handleClearResult} />
          ) : hasPermission ? (
            <Camera />
          ) : (
            <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
          )}
        </ContainerButton>
      ) : (
        <ContainerButton
          disabled={hasValue || saving}
          onPress={handleLaunchCamera}
          style={style}
        >
          {hasValue && value ? (
            <ImagePreview uri={value.uri} onPress={handleClearResult} />
          ) : (
            <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
          )}
        </ContainerButton>
      )}
    </FormField>
  );
};

const ImagePreview = ({
  uri,
  onPress,
}: {
  uri: string;
  onPress: () => void;
}) => (
  <TakenPictureContainer>
    <TakenPicture source={{ uri }} />
    <RetryButton onPress={onPress}>
      <Icon icon="x" size={20} />
    </RetryButton>
  </TakenPictureContainer>
);

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
