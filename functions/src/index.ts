import * as functions from "firebase-functions";
import { handleMigrateTodoLastDone } from "./migrate-todo-last-done";
import { callWithLogging, callWithResponse } from "./response";
import { handleSendPushNotifications } from "./todo-reminders";

const fn = functions.region("europe-west3");

export const scheduleTodoReminders = fn.pubsub
  .schedule("0 19 * * *") // NB: every day at 7pm
  .timeZone("Europe/London") // NB: GMT / BST
  .onRun(() => {
    callWithLogging(handleSendPushNotifications());
  });

export const sendTodoReminders = fn.https.onRequest((_request, response) => {
  callWithResponse(handleSendPushNotifications(), response);
});

export const migrateTodoLastDone = fn.https.onRequest((_request, response) => {
  callWithResponse(handleMigrateTodoLastDone(), response);
});
