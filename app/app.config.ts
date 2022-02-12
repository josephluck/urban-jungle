const pjson = require("./package.json");

const env =
  process.env.ENV === "prod"
    ? require("./env.prod.json")
    : require("./env.dev.json");

export default {
  expo: {
    name: "Urban Jungle",
    slug: "urban-jungle",
    scheme: "urban-jungle",
    privacy: "public",
    platforms: ["ios", "android", "web"],
    version: pjson.version,
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    packagerOpts: {
      config: "metro.config.js",
    },
    android: {
      package: "com.josephluck.urbanjungle",
    },
    plugins: ["sentry-expo"],
    hooks: {
      postPublish: [
        {
          file: "sentry-expo/upload-sourcemaps",
          config: {
            organization: env.sentry.organisation,
            project: env.sentry.project,
            authToken: env.sentry.authToken,
          },
        },
      ],
    },
  },
};
