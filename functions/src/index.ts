import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { sequenceT } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import {
  getHouseholdData,
  getHouseholds,
  getProfiles,
  HouseholdData,
} from "./api";
import { responseError, responseSuccess } from "./response";
import { getTodosDueToday } from "./state";

admin.initializeApp();

export const sendTodoReminders = functions.https.onRequest(
  async (_request, response) => {
    pipe(
      sequenceTE(getHouseholds(), getProfiles()),
      TE.chain(([households, profiles]) =>
        TE.tryCatch(
          async () => {
            // TODO: can this be done via sequence?
            const tasks = households.map((household) =>
              getHouseholdData(household.id)
            );
            const all = await Promise.all(
              tasks.map((task) => filterNotifiableProfiles(profiles)(task)())
            );
            return flatten(
              all.map((val) =>
                pipe(
                  val,
                  E.fold(() => [], id)
                )
              )
            );
          },
          () => "BAD_REQUEST" as IErr
        )
      ),
      TE.chain(sendPushNotifications),
      TE.mapLeft(responseError(response)),
      TE.map(responseSuccess(response))
    )();
  }
);

/**
 * TODO: this API is a bit odd..
 */
const filterNotifiableProfiles = (profiles: ProfileModel[]) => (
  task: TE.TaskEither<IErr, HouseholdData>
): TE.TaskEither<IErr, ProfileModel[]> =>
  pipe(
    task,
    TE.map(({ household, todos, cares }) => ({
      household,
      todos: getTodosDueToday(household.id, todos, cares),
    })),
    TE.filterOrElse(
      ({ todos }) => todos.length > 0,
      () => "NOT_FOUND" as IErr
    ),
    TE.map((data) => data.household),
    TE.map(getNotifiableProfilesForHousehold(profiles))
  );

/**
 * TODO: only return profiles with Expo PN token
 */
const getNotifiableProfilesForHousehold = (profiles: ProfileModel[]) => (
  household: HouseholdModel
): ProfileModel[] =>
  household.profileIds
    .map((profileId) => profiles.find((profile) => profile.id === profileId))
    .filter(Boolean) as ProfileModel[];

/**
 * TODO: implement
 */
const sendPushNotifications = (
  profiles: ProfileModel[]
): TE.TaskEither<IErr, string[]> =>
  TE.tryCatch(
    async () => {
      return profiles.map((profile) => profile.name);
    },
    () => "BAD_REQUEST" as IErr
  );

const sequenceTE = sequenceT(TE.taskEither);

const id = <Data>(val: Data): Data => val;

const flatten = <Data>(arr: Data[][]): Data[] =>
  arr.reduce((acc, val) => [...acc, ...val], [] as Data[]);
