export const AUTH_STACK_NAME = "auth";
export const HOME_STACK_NAME = "home";
export const PLANTS_STACK_NAME = "plants";
export const MANAGE_STACK_NAME = "manage";

export type StackNames =
  | typeof AUTH_STACK_NAME
  | typeof HOME_STACK_NAME
  | typeof PLANTS_STACK_NAME
  | typeof MANAGE_STACK_NAME;
