import { IErr } from "@urban-jungle/shared/utils/err";
import { Notifications } from "expo";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
import {
  removeExpoPushTokenFromProfile,
  saveExpoPushTokenToProfile,
} from "../profiles/store/effects";

export const disablePushNotifications = (): TE.TaskEither<IErr, void> =>
  removeExpoPushTokenFromProfile();

export const enablePushNotifications = (): TE.TaskEither<IErr, string> =>
  Constants.isDevice
    ? pipe(
        getPushNotificationPermissions(),
        TE.chain(getExpoPushToken),
        TE.chainFirst(setupAndroidChannels),
        TE.chainFirst(saveExpoPushTokenToProfile)
      )
    : TE.left("BAD_REQUEST");

export const getPushNotificationPermissions = (): TE.TaskEither<
  IErr,
  Permissions.PermissionStatus
> =>
  TE.tryCatch(
    async () => {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      if (existingStatus === "granted") {
        return existingStatus;
      }
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== "granted") {
        throw new Error("User did not grant permission");
      }
      return status;
    },
    () => "UNAUTHENTICATED"
  );

export const getExpoPushToken = (): TE.TaskEither<IErr, string> =>
  TE.tryCatch(
    async () => {
      const token = await Notifications.getExpoPushTokenAsync();
      return token;
    },
    () => "NOT_FOUND"
  );

const setupAndroidChannels = (): TE.TaskEither<IErr, void> =>
  TE.tryCatch(
    async () => {
      if (Platform.OS === "android") {
        await Notifications.createChannelAndroidAsync("default", {
          name: "default",
          sound: true,
          priority: "max",
          vibrate: [0, 250, 250, 250],
        });
      }
    },
    () => "UNKNOWN"
  );
