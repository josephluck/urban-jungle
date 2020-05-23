import { StorageEntityType } from "@urban-jungle/shared/models/storage";
import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import uuid from "uuid";
import storage from "@react-native-firebase/storage";

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
    () => "BAD_REQUEST" as IErr
  );

export const uploadFile = (reference: StorageEntityType = "default") => (
  uri: string
): TE.TaskEither<IErr, string> =>
  pipe(
    getFileFromUri(uri),
    TE.chain((blob) =>
      TE.tryCatch(
        async () => {
          const ref = storage().ref(reference).child(uuid());
          const snapshot = await ref.put(blob);
          blob.close();
          return await snapshot.ref.getDownloadURL();
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );
