import { IErr } from "@urban-jungle/shared/utils/err";
import { ImageInfo } from "expo-image-picker/build/ImagePicker.types";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { env } from "../../env";
import { IdentificationResult } from "./types";

export const identify = (
  image: ImageInfo
): TE.TaskEither<IErr, IdentificationResult> =>
  pipe(
    O.fromNullable(image.base64),
    TE.fromOption(() => "NOT_FOUND" as IErr),
    TE.map((base64) => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: env.plantId.apiKey,
        images: [base64], // NB: base64 images
        modifiers: ["crops_fast", "similar_images"],
        plant_language: "en",
        plant_details: [
          "common_names",
          "url",
          "name_authority",
          "wiki_description",
          "taxonomy",
          "synonyms",
        ],
      }),
    })),
    TE.chain((request) =>
      TE.tryCatch(
        async () => {
          const response = await fetch(
            "https://api.plant.id/v2/identify",
            request
          );
          const data = await response.json();
          console.log(data);
        },
        () => "BAD_REQUEST" as IErr
      )
    )
  );
