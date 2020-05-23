import { database as makeDatabase } from "@urban-jungle/shared/database/database";
import { sequenceSTE, traverseTE } from "@urban-jungle/shared/fp/task-either";
import { CareModel } from "@urban-jungle/shared/models/care";
import { HouseholdModel } from "@urban-jungle/shared/models/household";
import { PlantModel } from "@urban-jungle/shared/models/plant";
import { ProfileModel } from "@urban-jungle/shared/models/profile";
import { TodoModel } from "@urban-jungle/shared/models/todo";
import { IErr } from "@urban-jungle/shared/utils/err";
import * as admin from "firebase-admin";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";

admin.initializeApp();
export const database = makeDatabase(admin.firestore() as any);

export const getHouseholds = (): TE.TaskEither<IErr, HouseholdModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await database.households.database.get();
      return query.docs.map((doc) => doc.data() as HouseholdModel);
    },
    () => "BAD_REQUEST"
  );

export const getProfiles = (): TE.TaskEither<IErr, ProfileModel[]> =>
  TE.tryCatch(
    async () => {
      const query = await database.profiles.database.get();
      return extractQueryData<ProfileModel>(query);
    },
    () => "BAD_REQUEST"
  );

export const getHouseholdTodos = (
  householdId: string
): TE.TaskEither<IErr, TodoModel[]> =>
  TE.tryCatch(
    async () => {
      const response = await database.todos.database(householdId).get();
      return extractQueryData<TodoModel>(response);
    },
    () => "BAD_REQUEST"
  );

export const getHouseholdPlants = (
  householdId: string
): TE.TaskEither<IErr, PlantModel[]> =>
  TE.tryCatch(
    async () => {
      const response = await database.plants.database(householdId).get();
      return extractQueryData<PlantModel>(response);
    },
    () => "BAD_REQUEST"
  );

export const getHouseholdCares = (
  householdId: string
): TE.TaskEither<IErr, CareModel[]> =>
  TE.tryCatch(
    async () => {
      const response = await database.cares.database(householdId).get();
      return extractQueryData<CareModel>(response);
    },
    () => "BAD_REQUEST"
  );

export type HouseholdWithPlantsAndTodos = {
  household: HouseholdModel;
  plants: PlantModel[];
  todos: TodoModel[];
};

export const getHouseholdsWithPlantsAndTodos = (): TE.TaskEither<
  IErr,
  HouseholdWithPlantsAndTodos[]
> =>
  pipe(
    getHouseholds(),
    TE.mapLeft((err) => [err]),
    TE.chain((households) =>
      traverseTE(
        households.map(getHouseholdWithPlantsAndTodos),
        TE.mapLeft(A.of)
      )
    ),
    TE.mapLeft((errs) => errs[0] || "UNKNOWN")
  );

export const getHouseholdWithPlantsAndTodos = (
  household: HouseholdModel
): TE.TaskEither<IErr, HouseholdWithPlantsAndTodos> =>
  sequenceSTE({
    household: TE.right(household),
    plants: getHouseholdPlants(household.id),
    todos: getHouseholdTodos(household.id),
  });

export type HouseholdWithPlantsTodosAndCares = {
  household: HouseholdModel;
  plants: PlantModel[];
  todos: TodoModel[];
  cares: CareModel[];
};

export const getHouseholdsWithPlantsTodosAndCares = (): TE.TaskEither<
  IErr,
  HouseholdWithPlantsTodosAndCares[]
> =>
  pipe(
    getHouseholds(),
    TE.mapLeft((err) => [err]),
    TE.chain((households) =>
      traverseTE(
        households.map(getHouseholdWithPlantsTodosAndCares),
        TE.mapLeft(A.of)
      )
    ),
    TE.mapLeft((errs) => errs[0] || "UNKNOWN")
  );

export const getHouseholdWithPlantsTodosAndCares = (
  household: HouseholdModel
): TE.TaskEither<IErr, HouseholdWithPlantsTodosAndCares> =>
  sequenceSTE({
    household: pipe(
      O.fromNullable(household),
      TE.fromOption(() => "NOT_FOUND")
    ),
    plants: getHouseholdPlants(household.id),
    todos: getHouseholdTodos(household.id),
    cares: getHouseholdCares(household.id),
  });

export const extractQueryData = <Data>(
  query: firebase.firestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): Data[] => query.docs.map((doc) => doc.data() as Data);
