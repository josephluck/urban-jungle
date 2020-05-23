import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import {
  logError,
  logSuccess,
  responseError,
  responseSuccess,
} from "./response";
import { handleSendPushNotifications } from "./todo-reminders";

const fn = functions.region("europe-west3");
admin.initializeApp();

export const scheduleTodoReminders = fn.pubsub
  .schedule("0 19 * * *") // NB: every day at 7pm
  .timeZone("Europe/London") // NB: GMT / BST
  .onRun(() =>
    pipe(
      handleSendPushNotifications(),
      TE.mapLeft(logError()),
      TE.map(logSuccess())
    )()
  );

export const sendTodoReminders = fn.https.onRequest((_request, response) => {
  pipe(
    handleSendPushNotifications(),
    TE.mapLeft(responseError(response)),
    TE.map(responseSuccess(response))
  )();
});
