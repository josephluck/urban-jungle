import {
  NavigationComponent,
  NavigationParams,
  NavigationRoute,
} from "react-navigation";
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";
import { authGuard } from "./auth-guard";

type NavigationSingleton = StackNavigationProp<
  NavigationRoute<NavigationParams>,
  NavigationParams
>;

type SerializeParams<Params extends Record<string, any>> = (
  params: Params
) => Partial<Record<keyof Params, string>>;

type DeserializeParams<Params extends Record<string, any>> = (
  params: Record<keyof Params, string>
) => Params;

export const makeNavigationRoute = <Params extends Record<string, any> = {}>({
  routeName,
  screen,
  defaultParams = {} as Required<Params>,
  serializeParams = id as SerializeParams<Params>,
  deserializeParams = id as DeserializeParams<Params>,
  authenticated = false,
}: {
  routeName: string;
  screen: NavigationComponent<any, any>;
  defaultParams?: Required<Params>;
  serializeParams?: SerializeParams<Params>;
  deserializeParams?: DeserializeParams<Params>;
  authenticated?: boolean;
}) => ({
  routeName,
  screen: authenticated ? authGuard(screen) : screen,
  getParams: ({ getParam }: NavigationSingleton) => {
    const params = Object.keys(defaultParams).reduce(
      (acc, key) => ({
        ...acc,
        [key]: getParam(key),
      }),
      defaultParams
    );
    return deserializeParams(params);
  },
  navigateTo: ({ navigate }: NavigationSingleton, params: Params) => {
    navigate({ routeName, params: serializeParams(params) });
  },
});

const id = <V>(value: V): V => value;
