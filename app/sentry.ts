import * as Sentry from "sentry-expo";
import { env } from "./env";

const pjson = require("./package.json");

export const initSentry = () => {
  Sentry.init({
    dsn: env.sentry.dsn,
    enableInExpoDevelopment: true,
    debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
    environment: env.sentry.environment,
    release: pjson.version,
  });
};
