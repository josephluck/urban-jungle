import { makeCareModel } from "@urban-jungle/shared/models/care";
import { makeTodoModel } from "@urban-jungle/shared/models/todo";

import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import moment from "moment";
import { defaultState, store } from "../../../store/state";
import { selectSchedule } from "./schedule";

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

describe("schedule", () => {
  const init = store.createMutator;

  beforeEach(() => {
    store.replaceState(defaultState);
  });

  it("builds a schedule", () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 1,
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
      todoId: "todo2",
      dateCreated: makeFirebaseDate(-1),
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
        },
      };
    })();

    const schedule = selectSchedule("household1", 3);

    expect(schedule).toHaveLength(7);
    // History
    expect(schedule[0].todos).toHaveLength(0);
    expect(schedule[0].cares).toHaveLength(0);
    expect(schedule[1].todos).toHaveLength(0);
    expect(schedule[1].cares).toHaveLength(0);
    expect(schedule[2].todos).toHaveLength(0);
    expect(schedule[2].cares).toHaveLength(1);
    // Today
    expect(schedule[3].todos).toHaveLength(0);
    expect(schedule[3].cares).toHaveLength(1);
    // Future
    expect(schedule[4].todos).toHaveLength(2);
    expect(schedule[4].cares).toHaveLength(0);
    expect(schedule[5].todos).toHaveLength(1);
    expect(schedule[5].cares).toHaveLength(0);
    expect(schedule[6].todos).toHaveLength(2);
    expect(schedule[6].cares).toHaveLength(0);
  });
});
