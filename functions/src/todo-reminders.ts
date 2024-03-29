import { sequenceTTE, validationTE } from "@urban-jungle/shared/fp/task-either";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import * as A from "fp-ts/lib/Array";
import { array } from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import {
  getHouseholdsWithPlantsAndTodos,
  getProfiles,
  HouseholdWithPlantsAndTodos,
} from "./api";
import { getTodosDueToday as filterTodosDueToday } from "./state";

const expo = new Expo();

export const handleSendPushNotifications = () =>
  pipe(
    sequenceTTE(getHouseholdsWithPlantsAndTodos(), getProfiles()),
    TE.chain(([households, profiles]) =>
      pipe(
        TE.right(households),
        TE.chain((households) =>
          array.traverse(validationTE)(
            households.map(getPushNotificationsForHousehold(profiles)),
            TE.mapLeft(A.of)
          )
        ),
        TE.mapLeft((errs) => errs[0] || "UNKNOWN")
      )
    ),
    TE.chain(sendPushNotifications)
  );

const getPushNotificationsForHousehold = (profiles: ProfileModel[]) => (
  household: HouseholdWithPlantsAndTodos
): TE.TaskEither<IErr, PushNotification> =>
  pipe(
    TE.right(household),
    TE.map((household) => ({
      ...household,
      todos: filterTodosDueToday(household.todos),
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

const getNotifiableProfilesForHousehold = (profiles: ProfileModel[]) => (
  household: HouseholdModel
): ProfileModel[] =>
  household.profileIds
    .map((profileId) => profiles.find((profile) => profile.id === profileId))
    .filter(profileHasValidPushToken) as ProfileModel[];

const profileHasValidPushToken = (profile: ProfileModel | undefined): boolean =>
  !!profile &&
  Boolean(profile.pushToken) &&
  Expo.isExpoPushToken(profile.pushToken || "");

const sendPushNotifications = (
  notifications: PushNotification[]
): TE.TaskEither<IErr, ExpoPushTicket[]> =>
  pipe(
    TE.tryCatch(
      () =>
        Promise.all(
          expo
            .chunkPushNotifications(notifications.map(buildExpoPushMessage))
            .map(expo.sendPushNotificationsAsync)
        ),
      () => "BAD_REQUEST" as IErr
    ),
    TE.map(A.flatten)
  );

const buildExpoPushMessage = (
  notification: PushNotification
): ExpoPushMessage => {
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
};

const getNotificationMessage = (plants: PlantModel[]): string => {
  const plantNames = [
    ...new Set(plants.map((plant) => plant.nickname || plant.name)),
  ];
  const length = plantNames.length;

  if (length > 4) {
    const firstThreePlants = plantNames.slice(0, 3).join(", ");
    return `${firstThreePlants} and ${length - 3} others need your help`;
  }
  if (length > 1) {
    const firstPlants = plantNames.slice(0, length - 1).join(", ");
    const lastPlant = plantNames[length - 1];
    return `${firstPlants} and ${lastPlant} need your help`;
  }
  if (length === 1) {
    return `${plantNames[0]} needs your help`;
  }
  return "Your plants need your help";
};

type PushNotification = {
  profiles: ProfileModel[];
  plants: { plant: PlantModel; todo: TodoModel }[];
};
