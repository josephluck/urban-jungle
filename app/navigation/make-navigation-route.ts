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

type SerializeParams<Params extends Record<string, any>> = (
  params: Params
) => Partial<Record<keyof Params, string>>;

type DeserializeParams<Params extends Record<string, any>> = (
  params: Record<keyof Params, string>
) => Params;

export const makeNavigationRoute = <Params extends Record<string, any> = {}>({
  routeName,
  screen,
  defaultParams = {} as Params,
  serializeParams = id,
  deserializeParams = id as DeserializeParams<Params>,
}: {
  routeName: string;
  screen: NavigationComponent<any, any>;
  defaultParams?: Params;
  serializeParams?: SerializeParams<Params>;
  deserializeParams?: DeserializeParams<Params>;
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

const id = <V>(value: V): V => value;
