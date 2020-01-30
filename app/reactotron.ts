import Reactotron from "reactotron-react-native";

export const configure = () => {
  if (__DEV__) {
    Reactotron.configure({ port: 9090 })
      .useReactNative()
      .connect();
  }
};
