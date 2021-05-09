import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as ImageManipulator from "expo-image-manipulator";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import firebase from "firebase";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { v4 as uuid } from "uuid";

// NB: see https://github.com/expo/expo/issues/2402#issuecomment-443726662
const getFileFromUri = (uri: string): TE.TaskEither<IErr, any> =>
  TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      }),
    () => "BAD_REQUEST" as IErr,
  );

/**
 * Resizes an image to a sensible size (max 800px by 800px) as well as applying
 * light compression
 */
export const resizePhoto = (image: ImageInfo): TE.TaskEither<IErr, ImageInfo> =>
  TE.tryCatch(
    () =>
      ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 800, height: 800 } }],
        {
          compress: 0.8,
          base64: true,
          format: ImageManipulator.SaveFormat.PNG,
        },
      ),
    () => "UNKNOWN" as IErr,
  );

export const uploadPhoto = (reference: StorageEntityType = "default") => (
  image: ImageInfo,
): TE.TaskEither<IErr, ImageInfo> =>
  pipe(
    getFileFromUri(image.uri),
    TE.chain((blob) =>
      TE.tryCatch(
        async () => {
          const ref = firebase.storage().ref(reference).child(uuid());
          const snapshot = await ref.put(blob);
          blob.close();
          const uri = await snapshot.ref.getDownloadURL();
          return { ...image, uri };
        },
        () => "BAD_REQUEST" as IErr,
      ),
    ),
  );
