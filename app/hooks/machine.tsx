import { Condition, makeMachine, State } from "@josephluck/machi/src/machine";
import produce from "immer";
import React, { useCallback, useContext, useState } from "react";
import { fetchOrCreateProfile } from "../features/auth/store/effects";
import { navigate } from "../navigation/navigation-imperative";
import { useRunWithUIState } from "../store/ui";

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
    const runWithUIState = useRunWithUIState();
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
        if (!result) {
          console.log(
            "Next state in machine not found - reached the end.",
            ctx,
          );
          runWithUIState(fetchOrCreateProfile(ctx));
        } else if (shouldNavigate) {
          setCurrentEntryId(result.entry.id);
          navigate(result.entry.routeName);
        }
        return result;
      },
      [context, currentEntryId, navigate, getNextState],
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
    },
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
