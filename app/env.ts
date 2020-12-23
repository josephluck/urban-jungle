import { IFirebaseOptions } from "expo-firebase-core/src/FirebaseOptions";

export interface Env {
  firebase: IFirebaseOptions;
  plantId: {
    apiKey: string;
  };
}

export const env: Env = !__DEV__
  ? require("./env.prod.json")
  : require("./env.dev.json");
