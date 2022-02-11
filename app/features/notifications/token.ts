import { IErr } from "@urban-jungle/shared/utils/err";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
import {
  removeExpoPushTokenFromProfile,
  saveExpoPushTokenToProfile,
} from "../profiles/store/effects";

export const disablePushNotifications = (): TE.TaskEither<IErr, void> =>
  Constants.isDevice
    ? removeExpoPushTokenFromProfile()
    : TE.left("BAD_REQUEST");

export const enablePushNotifications = (): TE.TaskEither<IErr, void> =>
  Constants.isDevice
    ? pipe(
        getPushNotificationPermissions(),
        TE.chain(getExpoPushToken),
        TE.chainFirst(setupAndroidChannels),
        TE.chainFirst(saveExpoPushTokenToProfile),
        TE.map(() => {}),
      )
    : TE.left("BAD_REQUEST");

export const getPushNotificationPermissions = (): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      const {
        status: existingStatus,
      } = await Notifications.getPermissionsAsync();
      if (existingStatus === "granted") {
        return existingStatus;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("User did not grant permission");
      }
      return status;
    },
    () => "UNAUTHENTICATED",
  );

export const getExpoPushToken = (): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    },
    () => "NOT_FOUND",
  );

const setupAndroidChannels = (): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelGroupAsync("default", {
          name: "default",
        });
      }
    },
    () => "UNKNOWN",
  );
