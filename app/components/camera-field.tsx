import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import React, { useCallback } from "react";
import styled from "styled-components/native";
import { symbols } from "../theme";
import { Icon } from "./icon";
import { TertiaryText } from "./typography";
import { StyleProp, ViewStyle } from "react-native";

export type CameraFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  onTouched?: () => void;
  touched?: boolean;
  error?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export const CameraField = ({
  value,
  onChange,
  onTouched,
  touched,
  error,
  label,
  style,
}: CameraFieldProps) => {
  const handleAskForPermissions = useCallback(async () => {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const roll = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    return camera.status === "granted" && roll.status === "granted";
  }, []);

  const handleClearResult = useCallback(() => {
    if (onTouched) {
      onTouched();
    }
    onChange("");
  }, []);

  const handleLaunchCamera = async () => {
    if (onTouched) {
      onTouched();
    }
    if (await handleAskForPermissions()) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
      });
      console.log({ result });
      if (!result.cancelled) {
        // TODO: get base64 and upload it...
        onChange(result.uri);
      }
    }
  };

  return (
    <Container style={style}>
      {label ? <Label>{label}</Label> : null}
      <ContainerButton disabled={Boolean(value)} onPress={handleLaunchCamera}>
        {value ? (
          <TakenPictureContainer>
            <TakenPicture source={{ uri: value }} />
            <RetryButton onPress={handleClearResult}>
              <Icon icon="x" size={20} />
            </RetryButton>
          </TakenPictureContainer>
        ) : (
          <Icon icon="camera" size={36} color={symbols.colors.midOffGray} />
        )}

        {touched && error ? <Error>{error}</Error> : null}
      </ContainerButton>
    </Container>
  );
};

const Label = styled(TertiaryText)`
  margin-bottom: ${symbols.spacing._6};
`;

const Error = styled(TertiaryText)`
  margin-top: ${symbols.spacing._6};
  color: ${symbols.colors.darkRed};
`;

const Container = styled.View``;

const ContainerButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: ${symbols.colors.nearWhite};
  border-radius: ${symbols.borderRadius.small}px;
  width: 100%;
  aspect-ratio: ${16 / 9};
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
  border-radius: ${symbols.borderRadius.small}px;
  width: 100%;
  aspect-ratio: ${16 / 9};
`;

// TODO: do this...
// async function uploadImageAsync(uri) {
//   // Why are we using XMLHttpRequest? See:
//   // https://github.com/expo/expo/issues/2402#issuecomment-443726662
//   const blob = await new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.onload = function() {
//       resolve(xhr.response);
//     };
//     xhr.onerror = function(e) {
//       console.log(e);
//       reject(new TypeError('Network request failed'));
//     };
//     xhr.responseType = 'blob';
//     xhr.open('GET', uri, true);
//     xhr.send(null);
//   });

//   const ref = firebase
//     .storage()
//     .ref()
//     .child(uuid.v4());
//   const snapshot = await ref.put(blob);

//   // We're done with the blob, close and release it
//   blob.close();

//   return await snapshot.ref.getDownloadURL();
// }
