import { IFirebaseOptions } from "expo-firebase-core/src/FirebaseOptions";

export interface Env {
  firebase: IFirebaseOptions;
  plantId: {
    apiKey: string;
  };
  sentry: {
    dsn: string;
    authToken: string;
    project: string;
    organisation: string;
    environment: string;
  };
}

export const env: Env =
  process.env.ENV === "prod"
    ? require("./env.prod.json")
    : require("./env.dev.json");
