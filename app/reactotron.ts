import Reactotron from "reactotron-react-native";

export function configure() {
  if (__DEV__) {
    Reactotron.configure({ port: 9090 })
      .useReactNative()
      .connect();
  }
}
