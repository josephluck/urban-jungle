import { Linking } from "expo";
import * as TE from "fp-ts/lib/TaskEither";

import { IErr } from "@urban-jungle/shared/utils/err";

export const getInitialDeepLink = (): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      const response = await Linking.getInitialURL();
      if (!response) {
        throw new Error();
      }
      return response as string;
    },
    () => "NOT_FOUND",
  );
