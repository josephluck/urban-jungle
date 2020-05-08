import {
  NavigationParams,
  NavigationRoute,
  NavigationComponent,
} from "react-navigation";
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";

type NavigationSingleton = StackNavigationProp<
  NavigationRoute<NavigationParams>,
  NavigationParams
>;

export const makeNavigationRoute = <Params extends Record<string, any>>({
  routeName,
  screen,
  defaultParams,
  serializeParams,
  deserializeParams,
}: {
  routeName: string;
  screen: NavigationComponent<any, any>;
  defaultParams: Params;
  serializeParams: (params: Params) => Partial<Record<keyof Params, string>>;
  deserializeParams: (params: Record<keyof Params, string>) => Params;
}) => ({
  routeName,
  screen,
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
