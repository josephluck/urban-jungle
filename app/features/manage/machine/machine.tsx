import { pipe } from "fp-ts/lib/pipeable";
import { useCallback } from "react";
import { makeMachineHooks } from "../../../hooks/machine";
import { navigate } from "../../../navigation/navigation-imperative";
import { useRunWithUIState } from "../../../store/ui";
import { handleEndOfManageAuthFlow } from "../../auth/store/effects";
import { manageRoute } from "../components/manage-screen";
import { conditions, states } from "./states";
import { AdditionalEntryData, ManageAuthContext } from "./types";

const manageAuthMachineInitialContext: ManageAuthContext = {
  currentAuthProviders: [],
  recentlyAuthenticated: false,
};

const manageAuthMachineHooks = makeMachineHooks<
  ManageAuthContext,
  AdditionalEntryData,
  typeof conditions
>({
  states,
  conditions,
  initialContext: manageAuthMachineInitialContext,
});

export const ManageAuthMachineProvider = manageAuthMachineHooks.MachineProvider;

export const useManageAuthMachine = () => {
  const runWithUIState = useRunWithUIState();

  const handleFinished = useCallback(async (ctx: ManageAuthContext) => {
    await runWithUIState(pipe(handleEndOfManageAuthFlow(ctx)));
    navigate(manageRoute.routeName, {});
  }, []);

  return manageAuthMachineHooks.useMachine(handleFinished);
};
