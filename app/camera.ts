import * as TE from "fp-ts/lib/TaskEither";
import * as ImagePicker from "expo-image-picker";
import { uploadFile, StorageReference } from "./storage";
import { pipe } from "fp-ts/lib/pipeable";
import { IErr } from "./utils/err";

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

export const takeAndUploadPicture = (reference: StorageReference = "default") =>
  pipe(
    takePicture,
    TE.map((imageInfo) => imageInfo.uri),
    TE.chain(uploadFile(reference))
  );

// TODO: this is from ImagePicker, but not exported
type ImageInfo = {
  uri: string;
  width: number;
  height: number;
  type?: "image" | "video";
  exif?: {
    [key: string]: any;
  };
  base64?: string;
};
