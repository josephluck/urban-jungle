import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as ImagePicker from "expo-image-picker";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { uploadFile } from "./storage";

export const takePicture: TE.TaskEither<IErr, ImageInfo> = TE.tryCatch(
  async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
    });
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
  reference: StorageEntityType = "default"
): TE.TaskEither<IErr, ImageInfo> =>
  pipe(
    takePicture,
    TE.chainFirst((imageInfo) => uploadFile(reference)(imageInfo.uri))
  );

// TODO: this is from ImagePicker, but not exported
export type ImageInfo = {
  uri: string;
  width: number;
  height: number;
  type?: "image" | "video";
  exif?: {
    [key: string]: any;
  };
  base64?: string;
};
