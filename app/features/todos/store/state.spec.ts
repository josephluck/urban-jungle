import { store, defaultState } from "../../../store/state";
import { makeTodoModel } from "../../../models/todo";
import { makeCareModel } from "../../../models/care";
import moment from "moment";
import firebase from "firebase";
import { selectTodosSchedule } from "./state";

const baseDate = new Date("2020/01/01").getTime();
jest.spyOn(Date, "now").mockReturnValue(baseDate);

const makeFirebaseDate = (
  daysAdjustment: number = 0
): firebase.firestore.Timestamp => {
  const date =
    daysAdjustment === 0
      ? moment()
      : daysAdjustment >= 0
      ? moment().add(daysAdjustment, "days")
      : moment().subtract(Math.abs(daysAdjustment), "days");
  return firebase.firestore.Timestamp.fromDate(date.toDate());
};

describe("store / todos", () => {
  const init = store.createMutator;

  beforeEach(() => {
    store.replaceState(defaultState);
  });

  describe("schedule", () => {
    it("includes todos that haven't had any cares yet", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(1);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].todos).toHaveLength(1);
      expect(schedule[0].todos[0]).toEqual(todo1);
    });

    it("includes todos where the last care was before the next due date", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        todoId: "todo1",
        householdId: "household1",
        dateCreated: makeFirebaseDate(-2),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(1);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].date.toDate().getTime()).toEqual(baseDate);
      expect(schedule[0].todos).toHaveLength(1);
      expect(schedule[0].todos[0]).toEqual(todo1);
    });

    it("repeats a single todo according to it's recurrence days", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(10);

      expect(schedule).toHaveLength(10);
      expect(schedule[0].todos).toEqual([todo1]);
      expect(schedule[1].todos).toEqual([]);
      expect(schedule[2].todos).toEqual([todo1]);
      expect(schedule[3].todos).toEqual([]);
      expect(schedule[4].todos).toEqual([todo1]);
      expect(schedule[5].todos).toEqual([]);
      expect(schedule[6].todos).toEqual([todo1]);
      expect(schedule[7].todos).toEqual([]);
      expect(schedule[8].todos).toEqual([todo1]);
      expect(schedule[9].todos).toEqual([]);
    });

    it("repeats multiple todos according to their recurrence days", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const todo2 = makeTodoModel({
        id: "todo2",
        householdId: "household1",
        recurrenceDays: 3,
      });
      const todo3 = makeTodoModel({
        id: "todo3",
        householdId: "household1",
        recurrenceDays: 4,
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
            todo2,
            todo3,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(10);

      expect(schedule).toHaveLength(10);
      expect(schedule[0].todos).toEqual([todo1, todo2, todo3]);
      expect(schedule[1].todos).toEqual([]);
      expect(schedule[2].todos).toEqual([todo1]);
      expect(schedule[3].todos).toEqual([todo2]);
      expect(schedule[4].todos).toEqual([todo1, todo3]);
      expect(schedule[5].todos).toEqual([]);
      expect(schedule[6].todos).toEqual([todo1, todo2]);
      expect(schedule[7].todos).toEqual([]);
      expect(schedule[8].todos).toEqual([todo1, todo3]);
      expect(schedule[9].todos).toEqual([todo2]);
    });

    it("skips a todo if it's been cared for today", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(1);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].todos).toHaveLength(0);
    });

    it("only takes in to account the most recent care for a todo", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(-2),
      });
      const care2 = makeCareModel({
        id: "care2",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
            care2,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(1);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].todos).toHaveLength(0);
    });

    it("skips a todo if it's been cared for today and includes the next due date", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(5);

      expect(schedule[0].todos).toEqual([]);
      expect(schedule[1].todos).toEqual([]);
      expect(schedule[2].todos).toEqual([todo1]);
      expect(schedule[3].todos).toEqual([]);
      expect(schedule[4].todos).toEqual([todo1]);
    });

    it("takes in to account a todos next due date based on when it was last done", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 4,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(-2),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
          },
        };
      })();
      const schedule = selectTodosSchedule("household1")(10);

      expect(schedule).toHaveLength(10);
      expect(schedule[0].todos).toEqual([]);
      expect(schedule[1].todos).toEqual([]);
      expect(schedule[2].todos).toEqual([todo1]);
      expect(schedule[3].todos).toEqual([]);
      expect(schedule[4].todos).toEqual([]);
      expect(schedule[5].todos).toEqual([]);
      expect(schedule[6].todos).toEqual([todo1]);
      expect(schedule[7].todos).toEqual([]);
      expect(schedule[8].todos).toEqual([]);
      expect(schedule[9].todos).toEqual([]);
    });

    it("generates a complex example", () => {
      const todo1 = makeTodoModel({
        id: "todo1",
        householdId: "household1",
        recurrenceDays: 4,
      });
      const todo2 = makeTodoModel({
        id: "todo2",
        householdId: "household1",
        recurrenceDays: 6,
      });
      const todo3 = makeTodoModel({
        id: "todo3",
        householdId: "household1",
        recurrenceDays: 2,
      });
      const care1 = makeCareModel({
        id: "care1",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(-2),
      });
      const care2 = makeCareModel({
        id: "care2",
        householdId: "household1",
        todoId: "todo1",
        dateCreated: makeFirebaseDate(),
      });
      const care3 = makeCareModel({
        id: "care3",
        householdId: "household1",
        todoId: "todo2",
        dateCreated: makeFirebaseDate(),
      });
      const care4 = makeCareModel({
        id: "care4",
        householdId: "household1",
        todoId: "todo2",
        dateCreated: makeFirebaseDate(-10),
      });

      init((state) => {
        state.todos.todosByHouseholdId = {
          household1: {
            todo1,
            todo2,
            todo3,
          },
        };
        state.cares.caresByHouseholdId = {
          household1: {
            care1,
            care2,
            care3,
            care4,
          },
        };
      })();

      const schedule = selectTodosSchedule("household1")(20);
      expect(schedule[0].todos).toEqual([todo3]);
      expect(schedule[1].todos).toEqual([]);
      expect(schedule[2].todos).toEqual([todo3]);
      expect(schedule[3].todos).toEqual([]);
      expect(schedule[4].todos).toEqual([todo1, todo3]);
      expect(schedule[5].todos).toEqual([]);
      expect(schedule[6].todos).toEqual([todo2, todo3]);
      expect(schedule[7].todos).toEqual([]);
      expect(schedule[8].todos).toEqual([todo1, todo3]);
      expect(schedule[9].todos).toEqual([]);
      expect(schedule[10].todos).toEqual([todo3]);
      expect(schedule[11].todos).toEqual([]);
      expect(schedule[12].todos).toEqual([todo1, todo2, todo3]);
      expect(schedule[13].todos).toEqual([]);
      expect(schedule[14].todos).toEqual([todo3]);
      expect(schedule[15].todos).toEqual([]);
      expect(schedule[16].todos).toEqual([todo1, todo3]);
      expect(schedule[17].todos).toEqual([]);
      expect(schedule[18].todos).toEqual([todo2, todo3]);
      expect(schedule[19].todos).toEqual([]);
    });
  });
});
