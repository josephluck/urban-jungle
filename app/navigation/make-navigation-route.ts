import { NavigationProp, RouteProp } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";

type SerializeParams<Params extends Record<string, any>> = (
  params: Params,
) => Partial<Record<keyof Params, string>>;

type DeserializeParams<Params extends Record<string, any>> = (
  params: Record<keyof Params, string>,
) => Params;

export const makeNavigationRoute = <Params extends Record<string, any> = {}>({
  routeName,
  screen,
  defaultParams = {} as Required<Params>,
  serializeParams = id as SerializeParams<Params>,
  deserializeParams = id as DeserializeParams<Params>,
}: {
  routeName: string;
  screen: React.ComponentType<StackScreenProps<Params>>;
  defaultParams?: Required<Params>;
  serializeParams?: SerializeParams<Params>;
  deserializeParams?: DeserializeParams<Params>;
}) => ({
  routeName,
  screen,
  getParams: (route: RouteProp<Params, string>) => {
    const paramKeys = Object.keys(defaultParams);
    return deserializeParams(
      paramKeys.length
        ? paramKeys.reduce(
            (acc, key) => ({
              ...acc,
              [key]: route.params ? route.params[key] : undefined,
            }),
            defaultParams,
          )
        : route.params!,
    );
  },
  navigateTo: (navigation: NavigationProp<any>, params: Params) => {
    navigation.navigate({
      name: routeName,
      params: serializeParams(params),
    });
  },
});

const id = <V>(value: V): V => value;
