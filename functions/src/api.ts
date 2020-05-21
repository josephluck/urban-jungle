import { CareModel } from "@urban-jungle/shared/models/care";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as admin from "firebase-admin";
import * as TE from "fp-ts/lib/TaskEither";

export type HouseholdData = {
  household: HouseholdModel;
  todos: TodoModel[];
  cares: CareModel[];
};

export const getHouseholdData = (
  householdId: string
): TE.TaskEither<IErr, HouseholdData> =>
  TE.tryCatch(
    async () => {
      const household = admin
        .firestore()
        .collection("households")
        .doc(householdId);
      const queries = await Promise.all([
        household.get(),
        household.collection("todos").get(),
        household.collection("cares").get(), // TODO: this only has to be the most recent care
      ]);
      return {
        household: queries[0].data() as HouseholdModel,
        todos: extractQueryData<TodoModel>(queries[1]),
        cares: extractQueryData<CareModel>(queries[2]),
      };
    },
    () => "BAD_REQUEST" as IErr
  );

export const getHouseholds = (): TE.TaskEither<IErr, HouseholdModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await admin.firestore().collection("households").get();
      return query.docs.map((doc) => doc.data() as HouseholdModel);
    },
    () => "BAD_REQUEST" as IErr
  );

export const getProfiles = (): TE.TaskEither<IErr, ProfileModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await admin.firestore().collection("profiles").get();
      return extractQueryData<ProfileModel>(query);
    },
    () => "BAD_REQUEST" as IErr
  );

export const extractQueryData = <Data>(
  query: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): Data[] => query.docs.map((doc) => doc.data() as Data);
