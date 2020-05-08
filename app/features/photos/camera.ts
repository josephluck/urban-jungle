import * as TE from "fp-ts/lib/TaskEither";
import * as ImagePicker from "expo-image-picker";
import { uploadFile, StorageEntityType } from "./storage";
import { pipe } from "fp-ts/lib/pipeable";
import { IErr } from "../../utils/err";

export const takePicture: TE.TaskEither<IErr, ImageInfo> = TE.tryCatch(
  async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
    });
    console.log({ result });
    if (result.cancelled) {
      throw new Error("Cancelled");
    } else {
      return result;
    }
  },
  () => "BAD_REQUEST" as IErr
);

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
