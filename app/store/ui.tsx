import { IErr } from "@urban-jungle/shared/utils/err";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { useContext } from "react";
import React, { createContext, useCallback, useState } from "react";
import { Keyboard, View } from "react-native";
import { store } from "./state";
import { BottomDrawer } from "../components/bottom-drawer";
import { BodyText, SubHeading, SubScriptText } from "../components/typography";
import { Button } from "../components/button";
import { symbols } from "../theme";

export const setLoadingOn = store.createMutator((s) => {
  s.ui.loading = true;
});

export const setLoadingOff = store.createMutator((s) => {
  s.ui.loading = false;
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
  task: V
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

  return (
    <GlobalErrorContext.Provider value={{ error, setError }}>
      {children}

      <BottomDrawer onClose={() => setError(undefined)} visible={!!error}>
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

            <Button onPress={() => setError(undefined)} large>
              Close
            </Button>
          </>
        )}
      </BottomDrawer>
    </GlobalErrorContext.Provider>
  );
};

export const useGlobalErrorContext = () => useContext(GlobalErrorContext);

export const useRunWithUIState = <V extends TE.TaskEither<IErr, any>>() => {
  const { setError } = useGlobalErrorContext();

  return useCallback((task: V) => {
    startLoading(void null);
    setError(undefined);
    return pipe(pipeWithUILoading(task), TE.mapLeft(setError))();
  }, []);
};

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
  return pipeWithUILoading(task)() as ReturnType<typeof task>;
};
