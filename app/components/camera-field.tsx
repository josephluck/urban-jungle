import { ImageModel } from "@urban-jungle/shared/models/image";
import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { Camera } from "expo-camera";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";
import { useRunWithUIState } from "../store/ui";
import { symbols } from "../theme";
import { Button } from "./button";
import { useCamera } from "./camera";
import { FormField } from "./form-field";
import { Icon } from "./icon";
import { ImagePreview } from "./image-preview";
import { TouchableOpacity } from "./touchable-opacity";

export type CameraFieldProps = {
  value?: ImageModel;
  onChange: (value: ImageModel) => void;
  onTouched?: () => void;
  touched?: boolean;
  error?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  type?: StorageEntityType;
  aspectRatio?: number;
  direction?: typeof Camera.Constants.Type;
};

export const CameraField = ({
  value,
  onChange,
  onTouched,
  touched,
  error,
  label,
  style,
  direction = Camera.Constants.Type.back,
  aspectRatio = symbols.aspectRatio.plantImage,
}: CameraFieldProps) => {
  const {
    askForPermissions,
    saving,
    loading,
    hasPermissions,
    setRef,
  } = useCamera();

  const handleClearResult = useCallback(() => {
    if (onTouched) {
      onTouched();
    }
    onChange({ uri: "", height: 0, width: 0 });
  }, [onTouched, onChange]);

  const hasValue = pipe(
    O.fromNullable(value),
    O.filter((v) => Boolean(v.uri)),
    O.isSome,
  );

  return (
    <FormField label={label} error={error} touched={touched}>
      <ContainerButton
        disabled={hasValue || saving || loading}
        onPress={askForPermissions}
        style={[{ aspectRatio }, style]}
      >
        {hasValue && value ? (
          <ImagePreview
            uri={value.uri}
            onPress={handleClearResult}
            aspectRatio={aspectRatio}
          />
        ) : hasPermissions && !loading ? (
          <Camera
            style={{
              width: "100%",
              aspectRatio,
              borderRadius: symbols.borderRadius.small,
            }}
            type={direction}
            ref={setRef}
          />
        ) : (
          <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
        )}
      </ContainerButton>
    </FormField>
  );
};

const ContainerButton = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.fieldBackground};
  border-radius: ${symbols.borderRadius.small}px;
  width: 100%;
`;

export const CameraFieldButton = ({
  children,
  value,
  onChange,
  type = "default",
}: {
  children: string;
  value?: ImageModel;
  onChange: (value: ImageModel) => void;
  type?: StorageEntityType;
}) => {
  const runWithUIState = useRunWithUIState();
  const { takeInlinePictureAndUpload } = useCamera();

  const handlePress = useCallback(() => {
    if (value) {
      return;
    }
    runWithUIState(pipe(takeInlinePictureAndUpload(type), TE.map(onChange)));
  }, [value, onChange]);

  return (
    <Button disabled={!!value} onPress={handlePress}>
      {children}
    </Button>
  );
};
