import { ImageModel } from "@urban-jungle/shared/models/image";
import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { useCamera } from "./camera";
import { FormField } from "./form-field";
import { Icon } from "./icon";
import { ImagePreview } from "./image-preview";

export type CameraButtonProps = {
  value?: ImageModel;
  onChange: (value: ImageModel) => void;
  onTouched?: () => void;
  touched?: boolean;
  error?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
  type?: StorageEntityType;
  aspectRatio?: number;
};

export const CameraButton = ({
  value,
  onChange,
  onTouched,
  touched,
  error,
  label,
  style,
  type = "default",
  aspectRatio = symbols.aspectRatio.plantImage,
}: CameraButtonProps) => {
  const { saving, takeModalPictureAndUpload } = useCamera();

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
    pipe(takeModalPictureAndUpload(type), TE.map(onChange));
  }, [type, onTouched]);

  const hasValue = pipe(
    O.fromNullable(value),
    O.filter((v) => Boolean(v.uri)),
    O.isSome,
  );

  return (
    <FormField label={label} error={error} touched={touched}>
      <ContainerButton
        disabled={hasValue || saving}
        onPress={handleLaunchCamera}
        style={[{ aspectRatio }, style]}
      >
        {hasValue && value ? (
          <ImagePreview
            uri={value.uri}
            onPress={handleClearResult}
            aspectRatio={aspectRatio}
          />
        ) : (
          <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
        )}
      </ContainerButton>
    </FormField>
  );
};

const ContainerButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.fieldBackground};
  border-radius: ${symbols.borderRadius.small}px;
  width: 100%;
`;
