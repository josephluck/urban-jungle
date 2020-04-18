import { Constants } from "expo";

export interface Env {
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const env: Env =
  !__DEV__ && Constants.manifest.releaseChannel === "production"
    ? require("./env.prod.json")
    : require("./env.dev.json");