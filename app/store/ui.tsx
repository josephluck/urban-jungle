import { Button } from "@urban-jungle/design/components/button";
import {
  BodyText,
  SubHeading,
  SubScriptText,
} from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { createContext, useCallback, useContext, useState } from "react";
import { Keyboard, Modal, View } from "react-native";
import { store } from "./state";

export type FirestoreCollectionName =
  | "auth"
  | "profile"
  | "plant-photos"
  | "todos"
  | "plants"
  | "households";

export const setFirestoreLoaded = store.createMutator(
  (s, key: FirestoreCollectionName) =>
    (s.ui.firestoresLoading = s.ui.firestoresLoading.filter(
      (curr) => curr !== key,
    )),
);

export const setLoadingOn = store.createMutator((s) => {
  s.ui.loading = true;
});

export const setLoadingOff = store.createMutator((s) => {
  s.ui.loading = false;
});

export const selectFirestoresInitialising = store.createSelector((s) => {
  return s.ui.firestoresLoading.length > 0;
});

export const selectLoading = store.createSelector((s) => s.ui.loading);

export const startLoading = <V extends any>(value: V): V => {
  Keyboard.dismiss();
  setLoadingOn();
  return value;
};

export const finishLoading = <V extends any>(value: V): V => {
  requestAnimationFrame(setLoadingOff);
  return value;
};

export const finishLoadingWithError = <V extends any>(error: V): V => {
  finishLoading(error);
  return error; // TODO: should maybe swallow this?
};

export const pipeWithUILoading = <V extends TE.TaskEither<IErr, any>>(
  task: V,
): V =>
  pipe(task, TE.map(finishLoading), TE.mapLeft(finishLoadingWithError)) as V;

type GlobalErrorContextType = {
  error?: IErr;
  setError: (err: IErr | undefined) => void;
};

const GlobalErrorContext = createContext<GlobalErrorContextType>({
  setError: () => undefined,
});

export const GlobalErrorProvider = ({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) => {
  const [error, setError] = useState<IErr>();

  const clearError = useCallback(() => setError(undefined), [setError]);

  return (
    <GlobalErrorContext.Provider value={{ error, setError }}>
      {children}

      <Modal visible={!!error}>
        {loading ? null : (
          <>
            <View style={{ alignItems: "center" }}>
              <SubHeading
                style={{
                  marginBottom: symbols.spacing._32,
                  marginTop: symbols.spacing._8,
                }}
              >
                Whoops.
              </SubHeading>
              <BodyText
                style={{
                  marginBottom: symbols.spacing._32,
                  textAlign: "center",
                }}
              >
                We're sorry, something went wrong. Please try again.
              </BodyText>
              <SubScriptText style={{ marginBottom: symbols.spacing._8 }}>
                Internal code: {error}
              </SubScriptText>
            </View>

            <Button onPress={clearError} large>
              Close
            </Button>
          </>
        )}
      </Modal>
    </GlobalErrorContext.Provider>
  );
};

export const useGlobalErrorContext = () => useContext(GlobalErrorContext);

const handledErrorTypes: IErr[] = ["VALIDATION", "HANDLED"];

export const useRunWithUIState = () => {
  const { setError } = useGlobalErrorContext();

  // TODO: support options for success / failure toasts
  return useCallback(
    <T, V extends TE.TaskEither<IErr, T>>(
      task: V,
      handleErrors: boolean = true,
    ): Promise<E.Either<IErr, T>> => {
      startLoading(void null);
      setError(undefined);
      return pipe(
        pipeWithUILoading(task),
        TE.mapLeft((err) => {
          if (handleErrors && !handledErrorTypes.includes(err)) {
            setError(err);
          }
          return err;
        }),
      )();
    },
    [],
  );
};

/**
 * Wraps up common TaskEither loading / error handling functions
 * TODO: deprecate this
 */
export const UIEffect = {
  start: startLoading,
  right: finishLoading,
  left: finishLoadingWithError,
};

// TODO deprecate this
export const runWithUIState = <V extends TE.TaskEither<IErr, any>>(
  task: V,
): ReturnType<typeof task> => {
  startLoading(void null);
  return pipeWithUILoading(task)() as ReturnType<typeof task>;
};
