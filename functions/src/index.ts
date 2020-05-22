import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { sequenceT } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import {
  getHouseholdData,
  getHouseholds,
  getProfiles,
  HouseholdData,
} from "./api";
import {
  logError,
  logSuccess,
  responseError,
  responseSuccess,
} from "./response";
import { getTodosDueToday } from "./state";

const fn = functions.region("europe-west3");
const expo = new Expo();
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

const handleSendPushNotifications = () =>
  pipe(
    sequenceTE(getHouseholds(), getProfiles()),
    TE.chain(([households, profiles]) =>
      TE.tryCatch(
        async () => {
          const data = households.map((household) =>
            getHouseholdData(household.id)
          );
          // TODO: this is horrible. Surely we can do this through sequence?
          const tasks = await Promise.all(
            data.map((household) =>
              pipe(
                household,
                TE.chain(getPushNotificationsForHousehold(profiles))
              )()
            )
          );
          // TODO: this is horrible. Surely we can do this through sequence?
          return tasks
            .map((task) =>
              pipe(
                task,
                E.getOrElse(() => (null as any) as PushNotification)
              )
            )
            .filter(Boolean);
        },
        () => "BAD_REQUEST" as IErr
      )
    ),
    TE.chain(sendPushNotifications)
  );

const getPushNotificationsForHousehold = (profiles: ProfileModel[]) => (
  household: HouseholdData
): TE.TaskEither<IErr, PushNotification> =>
  pipe(
    filterHouseholdsDueToday()(TE.right(household)),
    TE.map((household) => ({
      ...household,
      profiles: getNotifiableProfilesForHousehold(profiles)(
        household.household
      ),
    })),
    TE.map((household) => ({
      profiles: household.profiles,
      plants: household.todos.map((todo) => ({
        todo,
        plant: pipe(
          O.fromNullable(
            household.plants.find((plant) => plant.id === todo.plantId)
          ),
          O.getOrElse(() => (null as any) as PlantModel) // TODO: this is horrible. Figure out a good way to do this.
        ),
      })),
    }))
  );

/**
 * TODO: this implementation is a bit odd..
 */
const filterHouseholdsDueToday = () => (
  task: TE.TaskEither<IErr, HouseholdData>
): TE.TaskEither<IErr, HouseholdData> =>
  pipe(
    task,
    TE.map(({ household, todos, cares, plants }) => ({
      household,
      cares,
      plants,
      todos: getTodosDueToday(household.id, todos, cares),
    })),
    TE.filterOrElse(
      ({ todos }) => todos.length > 0,
      () => "NOT_FOUND" as IErr
    )
  );

const getNotifiableProfilesForHousehold = (profiles: ProfileModel[]) => (
  household: HouseholdModel
): ProfileModel[] =>
  household.profileIds
    .map((profileId) => profiles.find((profile) => profile.id === profileId))
    .filter(
      (profile) =>
        profile &&
        Boolean(profile.pushToken) &&
        Expo.isExpoPushToken(profile.pushToken || "")
    ) as ProfileModel[];

const sendPushNotifications = (
  pushNotifications: PushNotification[]
): TE.TaskEither<IErr, ExpoPushTicket[]> =>
  TE.tryCatch(
    async () => {
      const notifications: ExpoPushMessage[] = pushNotifications.map(
        (notification) => {
          const message = getNotificationMessage(
            notification.plants.reduce(
              (prev, curr) => [...prev, curr.plant],
              [] as PlantModel[]
            )
          );
          return {
            to: notification.profiles.map((profile) => profile.pushToken || ""),
            sound: "default",
            body: `🌱 💦 ${message}`,
            data: {},
          };
        }
      );

      const chunks = expo.chunkPushNotifications(notifications);
      const tickets = await Promise.all(
        chunks.map(
          async (chunk) => await expo.sendPushNotificationsAsync(chunk)
        )
      );

      return flatten(tickets);
    },
    () => "BAD_REQUEST" as IErr
  );

const getNotificationMessage = (plants: PlantModel[]): string => {
  const plantNames = [...new Set(plants.map((plant) => plant.name))];
  const length = plantNames.length;

  if (length > 4) {
    const firstThreePlants = plantNames.slice(0, 3).join(", ");
    return `${firstThreePlants} and ${length - 3} others need your help`;
  }
  if (length > 1) {
    const firstPlants = plantNames.slice(0, length - 2).join(", ");
    const lastPlant = plantNames[length - 1];
    return `${firstPlants} and ${lastPlant} need your help`;
  }
  if (length === 1) {
    return `${plantNames[0]} needs your help`;
  }
  return "Your plants need your help";
};

const sequenceTE = sequenceT(TE.taskEither);

type PushNotification = {
  profiles: ProfileModel[];
  plants: { plant: PlantModel; todo: TodoModel }[];
};

const flatten = <Data>(arr: Data[][]): Data[] =>
  arr.reduce((acc, val) => [...acc, ...val], [] as Data[]);
