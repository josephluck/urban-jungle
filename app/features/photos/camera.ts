import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as ImagePicker from "expo-image-picker";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { uploadPhoto } from "./storage";
import {
  ImageInfo,
  ImagePickerOptions,
} from "expo-image-picker/build/ImagePicker.types";

// TODO: move these options out to "presets" as it's very specific to plant images right now
// TODO: compression
export const takePicture = (
  options: ImagePickerOptions = {
    allowsEditing: true,
    aspect: [16, 9],
  }
): TE.TaskEither<IErr, ImageInfo> =>
  TE.tryCatch(
    async () => {
      const result = await ImagePicker.launchCameraAsync(options);
      if (result.cancelled) {
        throw new Error("Cancelled");
      } else {
        return result;
      }
    },
    () => "BAD_REQUEST"
  );

/**
 * TODO: deprecate this as it doesn't play nicely with loading UIs
 */
export const takeAndUploadPicture = (
  reference: StorageEntityType = "default",
  options: ImagePickerOptions = {
    allowsEditing: true,
    aspect: [16, 9],
  }
): TE.TaskEither<IErr, ImageInfo> =>
  pipe(takePicture(options), TE.chain(uploadPhoto(reference)));
