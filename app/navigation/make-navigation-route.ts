import {
  CommonActions,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { authGuard } from "./auth-guard";

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
  screen: React.ComponentType<StackScreenProps<Params>>;
  defaultParams?: Required<Params>;
  serializeParams?: SerializeParams<Params>;
  deserializeParams?: DeserializeParams<Params>;
  authenticated?: boolean;
}) => ({
  routeName,
  screen: authenticated ? authGuard(screen) : screen,
  getParams: (route: RouteProp<Params, string>) => {
    const params = Object.keys(defaultParams).reduce(
      (acc, key) => ({
        ...acc,
        [key]: route.params ? route.params[key] : undefined,
      }),
      defaultParams
    );
    return deserializeParams(params);
  },
  navigateTo: (navigation: NavigationProp<any>, params: Params) => {
    // if (reset) {
    //   navigation.dispatch(
    //     CommonActions.reset({
    //       index: 0,
    //       routes: [
    //         {
    //           name: routeName,
    //           params: serializeParams(params),
    //         },
    //       ],
    //     })
    //   );
    //   return;
    // }
    navigation.navigate({
      name: routeName,
      params: serializeParams(params),
    });
  },
});

const id = <V>(value: V): V => value;
