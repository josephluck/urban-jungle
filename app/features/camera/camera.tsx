import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  ImageInfo,
  ImagePickerOptions,
} from "expo-image-picker/build/ImagePicker.types";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback, useContext, useRef, useState } from "react";
import { resizePhoto, uploadPhoto } from "../photos/storage";

export const launchCameraAndTakePicture = (
  options: ImagePickerOptions = {
    base64: true,
  },
): TE.TaskEither<IErr, ImageInfo> =>
  TE.tryCatch(
    async () => {
      const result = await ImagePicker.launchCameraAsync(options);
      if (result.cancelled) {
        throw new Error("Cancelled");
      }
      return result;
    },
    () => "BAD_REQUEST",
  );

type CameraContextType = {
  direction: typeof Camera.Constants.Type;
  setDirection: (direction: "front" | "back") => void;
  ref: React.RefObject<Camera>;
  setRef: React.RefCallback<Camera>;
  availableAspectRatios: string[];
  loading: boolean;
  saving: boolean;
  takeModalPictureAndUpload: (
    type: StorageEntityType,
  ) => TE.TaskEither<IErr, ImageInfo>;
  takeInlinePictureAndUpload: (
    type: StorageEntityType,
  ) => TE.TaskEither<IErr, ImageInfo>;
  hasPermissions: boolean;
  askForPermissions: () => TE.TaskEither<IErr, boolean>;
};

const CameraContext = React.createContext<CameraContextType>({
  direction: Camera.Constants.Type.back,
  setDirection: () => {},
  ref: {
    current: null,
  },
  setRef: () => {},
  availableAspectRatios: [],
  loading: true,
  saving: false,
  takeModalPictureAndUpload: () => TE.left("UNKNOWN" as IErr),
  takeInlinePictureAndUpload: () => TE.left("UNKNOWN" as IErr),
  hasPermissions: false,
  askForPermissions: () => TE.left("UNAUTHENTICATED" as IErr),
});

export const useCamera = () => useContext(CameraContext);

export const CameraProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  const [availableAspectRatios, setAvailableAspectRatios] = useState<string[]>(
    [],
  );

  const [direction, _setDirection] = useState(Camera.Constants.Type.back);

  const setDirection = useCallback(
    (direction: "front" | "back") =>
      _setDirection(
        direction === "front"
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
      ),
    [],
  );

  const ref = useRef<Camera | null>(null);

  const setRef = useCallback((camera: Camera) => {
    ref.current = camera;
    camera
      .getSupportedRatiosAsync()
      .then(setAvailableAspectRatios)
      .finally(() => setLoading(false));
  }, []);

  const askForPermissions = () =>
    pipe(
      obtainCameraPermissions,
      TE.map((val) => {
        setHasPermissions(true);
        return val;
      }),
      TE.mapLeft((err) => {
        setHasPermissions(false);
        return err;
      }),
    );

  const uploadTakenPhoto = (type: StorageEntityType) => (image: ImageInfo) =>
    pipe(
      TE.right(image),
      TE.map((image) => {
        setSaving(true);
        return image;
      }),
      TE.chain(resizePhoto),
      TE.chain(uploadPhoto(type)),
      TE.map((image) => {
        setSaving(false);
        return image;
      }),
      TE.mapLeft((err) => {
        setSaving(false);
        return err;
      }),
    );

  const takeModalPictureAndUpload = (type: StorageEntityType) =>
    pipe(
      askForPermissions(),
      TE.chain(() => launchCameraAndTakePicture()),
      TE.chain(uploadTakenPhoto(type)),
    );

  const takeInlinePictureAndUpload = (type: StorageEntityType) =>
    pipe(
      O.fromNullable(ref.current),
      TE.fromOption(() => "BAD_REQUEST" as IErr),
      TE.chain((camera) =>
        TE.tryCatch(
          () => camera.takePictureAsync(),
          () => "BAD_REQUEST" as IErr,
        ),
      ),
      TE.chain(uploadTakenPhoto(type)),
    );

  return (
    <CameraContext.Provider
      value={{
        ref,
        setRef,
        direction,
        setDirection,
        loading,
        saving,
        availableAspectRatios,
        takeModalPictureAndUpload,
        takeInlinePictureAndUpload,
        askForPermissions,
        hasPermissions,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

const obtainCameraPermissions = TE.tryCatch(
  async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const roll = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (camera.status !== "granted" || roll.status !== "granted") {
      throw new Error();
    }
    return true;
  },
  () => "BAD_REQUEST" as IErr,
);

export const trimBase64FromImage = <V extends { base64?: string }>({
  base64,
  ...value
}: V): Omit<V, "base64"> => value;
