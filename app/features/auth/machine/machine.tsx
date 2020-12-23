import { makeMachineHooks } from "../../../hooks/machine";
import { states } from "./states";
import { AdditionalEntryData, Context } from "./types";

const machineHooks = makeMachineHooks<Context, AdditionalEntryData>({
  states,
  conditions: {},
  initialContext: {
    authenticationFlow: "splash",
    authType: "phone",
    skipAvatar: false,
  },
});

export const MachineProvider = machineHooks.MachineProvider;

export const useMachine = machineHooks.useMachine;
