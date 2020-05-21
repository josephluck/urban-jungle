import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Keyboard } from "react-native";
import { store } from "./state";

export const setLoadingOn = store.createMutator((s) => {
  s.ui.loading = true;
});

export const setLoadingOff = store.createMutator((s) => {
  s.ui.loading = false;
});

export const selectLoading = store.createSelector((s) => s.ui.loading);

export const startLoading = <V>(value: V): V => {
  Keyboard.dismiss();
  setLoadingOn();
  return value;
};

export const finishLoading = <V>(value: V): V => {
  requestAnimationFrame(setLoadingOff);
  return value;
};

export const finishLoadingWithError = <V>(error: V): V => {
  console.log("TODO, handle this error", { error });
  finishLoading(error);
  return error; // TODO: should maybe swallow this?
};

// TODO: support success toast?
// TODO: figure out how to kick this off with an initially loading task
// removes the need for runWithUiState
export const pipeWithUiState = <V extends TE.TaskEither<IErr, any>>(
  task: V
): V =>
  pipe(task, TE.map(finishLoading), TE.mapLeft(finishLoadingWithError)) as V;

/**
 * Wraps up common TaskEither loading / error handling functions
 */
export const UIEffect = {
  start: startLoading,
  right: finishLoading,
  left: finishLoadingWithError,
};

// TODO deprecate this
export const runWithUIState = <V extends TE.TaskEither<IErr, any>>(
  task: V
): ReturnType<typeof task> => {
  startLoading(void null);
  return pipeWithUiState(task)() as ReturnType<typeof task>;
};
