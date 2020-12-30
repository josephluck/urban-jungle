import { Condition, makeMachine, State } from "@josephluck/machi/src/machine";
import produce from "immer";
import React, { useCallback, useContext, useRef, useState } from "react";
import { navigate } from "../navigation/navigation-imperative";

export const makeMachineHooks = <
  Context extends any = void,
  AdditionalEntryData extends { routeName: string } = never,
  Conditions extends Record<string, Condition<Context>> = Record<
    string,
    Condition<Context>
  >
>({
  states,
  conditions,
  initialContext,
}: {
  states: State<Context, Conditions, AdditionalEntryData>[];
  conditions: Conditions;
  initialContext: Context;
}) => {
  const useMakeMachine = () => {
    const onFinishedRef = useRef<(ctx: Context) => any>();
    const [context, setContext] = useState<Context>(initialContext);
    const [currentEntryId, setCurrentEntryId] = useState<string>();
    const getNextState = makeMachine<Context, AdditionalEntryData, Conditions>(
      states,
      conditions,
    );

    const clearContext = useCallback(() => setContext(initialContext), []);

    const execute = useCallback(
      (producer: (draft: Context) => void, shouldNavigate = true) => {
        const ctx = produce(context, producer);
        setContext(ctx);
        const result = getNextState(ctx, currentEntryId);
        console.log({ ctx, nextEntry: result?.entry });
        if (!result) {
          console.log(
            "Next state in machine not found - reached the end.",
            ctx,
          );
          if (onFinishedRef.current) {
            onFinishedRef.current(ctx);
          }
        } else if (shouldNavigate) {
          setCurrentEntryId(result.entry.id);
          navigate(result.entry.routeName);
        }
        return result;
      },
      [context, currentEntryId, navigate, getNextState],
    );

    return {
      context,
      setContext,
      clearContext,
      execute,
      getNextState,
      onFinishedRef,
    };
  };

  const MachineContext = React.createContext<ReturnType<typeof useMakeMachine>>(
    {
      context: initialContext,
      setContext: async () => void null,
      clearContext: async () => undefined,
      execute: () => undefined,
      getNextState: () => void null,
      onFinishedRef: {
        current: () => {},
      },
    },
  );

  const MachineProvider = ({ children }: { children: React.ReactNode }) => (
    <MachineContext.Provider value={useMakeMachine()}>
      {children}
    </MachineContext.Provider>
  );

  const useMachine = (onFinished: (ctx: Context) => any) => {
    const ctx = useContext(MachineContext);
    ctx.onFinishedRef.current = onFinished;

    return ctx;
  };

  return {
    MachineProvider,
    useMachine,
  };
};
