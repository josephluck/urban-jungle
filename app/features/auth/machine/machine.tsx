import { useCallback } from "react";
import { makeMachineHooks } from "../../../hooks/machine";
import { fetchOrCreateProfile } from "../../../store/effects";
import { useRunWithUIState } from "../../../store/ui";
import { states } from "./states";
import { AdditionalEntryData, SignUpContext } from "./types";

const authMachineHooks = makeMachineHooks<SignUpContext, AdditionalEntryData>({
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
    (ctx: SignUpContext) => runWithUIState(fetchOrCreateProfile(ctx)),
    [],
  );
  return authMachineHooks.useMachine(handleFinished);
};
