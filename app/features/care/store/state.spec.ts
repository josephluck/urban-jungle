import { makeCareModel } from "@urban-jungle/shared/models/care";
import { makeTodoModel } from "@urban-jungle/shared/models/todo";

import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import moment from "moment";
import { defaultState, store } from "../../../store/state";
import { selectCareHistory } from "./state";

const makeFirebaseDate = (
  daysAdjustment: number = 0
): FirebaseFirestoreTypes.Timestamp => {
  const date =
    daysAdjustment === 0
      ? moment()
      : daysAdjustment >= 0
      ? moment().add(daysAdjustment, "days")
      : moment().subtract(Math.abs(daysAdjustment), "days");
  return firestore.Timestamp.fromDate(date.toDate());
};

describe("store / cares", () => {
  const init = store.createMutator;

  beforeEach(() => {
    store.replaceState(defaultState);
  });

  describe("schedule", () => {
    it("includes builds a basic care history", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceCount: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });

      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.byHouseholdId = {
          household1: {
            care1,
          },
        };
      })();
      const schedule = selectCareHistory("household1")(1);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].cares).toHaveLength(1);
      expect(schedule[0].cares[0]).toEqual(care1);
    });

    it("includes multiple cares for the same todo", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceCount: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });
      const care2 = makeCareModel({
        id: "care2",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(-1),
      });

      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.byHouseholdId = {
          household1: {
            care1,
            care2,
          },
        };
      })();
      const schedule = selectCareHistory("household1")(2);

      expect(schedule).toHaveLength(2);
      expect(schedule[0].cares).toHaveLength(1);
      expect(schedule[0].cares[0]).toEqual(care1);
      expect(schedule[1].cares).toHaveLength(1);
      expect(schedule[1].cares[0]).toEqual(care2);
    });

    it("includes multiple todos and cares", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceCount: 2,
      });
      const todo2 = makeTodoModel({
        id: "todo2",
        householdId: "household1",
        recurrenceCount: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });
      const care2 = makeCareModel({
        id: "care2",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(-1),
      });
      const care3 = makeCareModel({
        id: "care3",
        householdId: "household1",
        todoId: "todo2",
        dateCreated: makeFirebaseDate(-1),
      });
      const care4 = makeCareModel({
        id: "care4",
        householdId: "household1",
        todoId: "todo2",
        dateCreated: makeFirebaseDate(-2),
      });

      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
            todo2,
          },
        };
        state.cares.byHouseholdId = {
          household1: {
            care1,
            care2,
            care3,
            care4,
          },
        };
      })();
      const schedule = selectCareHistory("household1")(3);

      expect(schedule).toHaveLength(3);
      expect(schedule[0].cares).toHaveLength(1);
      expect(schedule[0].cares[0]).toEqual(care1);
      expect(schedule[1].cares).toHaveLength(2);
      expect(schedule[1].cares[0]).toEqual(care2);
      expect(schedule[1].cares[1]).toEqual(care3);
      expect(schedule[2].cares).toHaveLength(1);
      expect(schedule[2].cares[0]).toEqual(care4);
    });
  });
});
