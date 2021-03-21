import { IErr } from "@urban-jungle/shared/utils/err";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { env } from "../../env";
// import { exampleIdentificationResponse } from "./state";
import { IdentificationResult } from "./types";

export const identify = (
  images: ImageInfo[],
): TE.TaskEither<IErr, IdentificationResult> =>
  pipe(
    O.fromNullable(images),
    O.filter((images) => images.every((image) => Boolean(image.base64))),
    O.map((images) => images.map((image) => image.base64 || "")),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((base64Images) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: env.plantId.apiKey,
        images: base64Images, // NB: base64 images
        modifiers: ["crops_medium", "similar_images"],
        plant_language: "en",
        plant_details: ["common_names", "wiki_description", "synonyms"],
      }),
    })),
    // TODO: this is the real request, but the API is limited to 200 uses. Uncomment this when the implementation is finished.
    TE.chain((request) =>
      TE.tryCatch(
        async () => {
          const response = await fetch(
            "https://api.plant.id/v2/identify",
            request,
          );
          return await response.json();
        },
        () => "BAD_REQUEST" as IErr,
      ),
    ),
    // TODO: this is an example response as the API is limited to 200 uses. Uncomment this when the implementation is finished.
    // TE.chain(() =>
    //   TE.tryCatch(
    //     async () => {
    //       const sleep = (duration: number = 1000) =>
    //         new Promise((resolve) => setTimeout(resolve, duration));
    //       await sleep(1000);
    //       return exampleIdentificationResponse;
    //     },
    //     () => "BAD_REQUEST" as IErr
    //   )
    // )
  );
