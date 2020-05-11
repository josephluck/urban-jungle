import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Keyboard } from "react-native";
import { IErr } from "../utils/err";
import { store } from "./state";

export const setLoadingOn = store.createMutator((s) => {
  s.ui.loading = true;
});

export const setLoadingOff = store.createMutator((s) => {
  s.ui.loading = false;
});

export const selectLoading = store.createSelector((s) => s.ui.loading);

// TODO: support success toast?
export const runWithUIState = <V extends TE.TaskEither<IErr, any>>(
  task: V
): ReturnType<typeof task> => {
  Keyboard.dismiss();
  setLoadingOn();
  return pipe(
    task,
    TE.map((value) => {
      setLoadingOff();
      return value;
    }),
    TE.mapLeft((err) => {
      // TODO: show error based off IErr type
      setLoadingOff();
      return err;
    })
  )() as ReturnType<typeof task>;
};
