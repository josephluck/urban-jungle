import { database as makeDatabase } from "@urban-jungle/shared/database/database";
import { CareModel } from "@urban-jungle/shared/models/care";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as admin from "firebase-admin";
import * as TE from "fp-ts/lib/TaskEither";

export type HouseholdData = {
  household: HouseholdModel;
  todos: TodoModel[];
  cares: CareModel[];
  plants: PlantModel[];
};

admin.initializeApp();
export const database = makeDatabase(admin.firestore() as any);

export const getHouseholdData = (
  householdId: string
): TE.TaskEither<IErr, HouseholdData> =>
  TE.tryCatch(
    async () => {
      const household = database.households.database.doc(householdId);
      const queries = await Promise.all([
        household.get(),
        household.collection("todos").get(),
        household.collection("cares").get(), // TODO: this is really expensive. Consider storing the last care id against the todo
        household.collection("plants").get(),
      ]);
      return {
        household: queries[0].data() as HouseholdModel,
        todos: extractQueryData<TodoModel>(queries[1]),
        cares: extractQueryData<CareModel>(queries[2]),
        plants: extractQueryData<PlantModel>(queries[3]),
      };
    },
    () => "BAD_REQUEST" as IErr
  );

export const getHouseholds = (): TE.TaskEither<IErr, HouseholdModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await database.households.database.get();
      return query.docs.map((doc) => doc.data() as HouseholdModel);
    },
    () => "BAD_REQUEST" as IErr
  );

export const getProfiles = (): TE.TaskEither<IErr, ProfileModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await database.profiles.database.get();
      return extractQueryData<ProfileModel>(query);
    },
    () => "BAD_REQUEST" as IErr
  );

export const extractQueryData = <Data>(
  query: firebase.firestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): Data[] => query.docs.map((doc) => doc.data() as Data);
