import { useCallback } from "react";
import { makeMachineHooks } from "../../../hooks/machine";
import { useRunWithUIState } from "../../../store/ui";
import { fetchOrCreateProfile } from "../store/effects";
import { states } from "./states";
import { AdditionalEntryData, Context } from "./types";

const authMachineHooks = makeMachineHooks<Context, AdditionalEntryData>({
  states,
  conditions: {},
  initialContext: {
    authenticationFlow: "splash",
    authType: "phone",
    skipAvatar: false,
    isAuthenticated: false,
    skipEmailAddress: false,
    hasResetPassword: false,
    hasSeenResetPasswordInstructions: false,
  },
});

export const AuthMachineProvider = authMachineHooks.MachineProvider;

export const useAuthMachine = () => {
  const runWithUIState = useRunWithUIState();
  const handleFinished = useCallback(
    (ctx: Context) => runWithUIState(fetchOrCreateProfile(ctx)),
    [],
  );
  return authMachineHooks.useMachine(handleFinished);
};
