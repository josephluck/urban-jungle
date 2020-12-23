import React, { useState, useContext, useCallback } from "react";
import { makeMachine, State, Condition } from "@josephluck/machi/src/machine";
import produce from "immer";

import { getCurrentRoute, navigate } from "../navigation/navigation-imperative";

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
    const [context, setContext] = useState<Context>(initialContext);
    const getNextState = makeMachine<Context, AdditionalEntryData, Conditions>(
      states,
      conditions
    );

    const clearContext = useCallback(() => setContext(initialContext), []);

    const execute = useCallback(
      async (producer: (draft: Context) => void, shouldNavigate = true) => {
        const ctx = produce(context, producer);
        setContext(ctx);
        const currentRouteName = getCurrentRoute();
        const result = getNextState(ctx);
        console.log({ ctx, currentRouteName, result });
        if (!result) {
          console.warn("Next state in machine not found - reached the end.");
        } else if (shouldNavigate) {
          navigate(result.entry.routeName);
        }
        return result;
      },
      [context, navigate, getNextState]
    );

    return { context, setContext, clearContext, execute, getNextState };
  };

  const MachineContext = React.createContext<ReturnType<typeof useMakeMachine>>(
    {
      context: initialContext,
      setContext: async () => void null,
      clearContext: async () => undefined,
      execute: async () => undefined,
      getNextState: () => void null,
    }
  );

  const MachineProvider = ({ children }: { children: React.ReactNode }) => (
    <MachineContext.Provider value={useMakeMachine()}>
      {children}
    </MachineContext.Provider>
  );

  const useMachine = () => useContext(MachineContext);

  return {
    MachineProvider,
    useMachine,
  };
};
