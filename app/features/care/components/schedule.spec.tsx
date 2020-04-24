import React from "react";
import { View } from "react-native";
import { useStore, store, defaultState } from "../../../store/state";
import {
  selectTodosSchedule,
  upsertTodo,
  upsertTodoByHouseholdId,
} from "../../todos/store/state";
import { render, wait } from "@testing-library/react-native";
import { makeTodoModel } from "../../../models/todo";
import moment from "moment";
import firebase from "firebase";
import {
  upsertCareByHouseholdId,
  selectCaresByHouseholdId,
} from "../store/state";
import { makeCareModel } from "../../../models/care";

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

describe("schedule rendering", () => {
  const init = store.createMutator;

  beforeEach(() => {
    store.replaceState(defaultState);
  });

  it("renders a basic schedule", () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });

    init((state) => {
      state.todos.todosByHouseholdId = {
        household1: {
          todo1,
        },
      };
    })();

    const { container, queryByTestId, queryAllByTestId } = render(
      <Schedule householdId="household1" />
    );
    expect(container).toBeDefined();
    expect(queryByTestId(moment().toISOString())).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
  });

  it("displays a todo when one is added", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });
    const todo2 = makeTodoModel({
      id: "todo2",
      householdId: "household1",
      recurrenceDays: 1,
    });

    init((state) => {
      state.todos.todosByHouseholdId = {
        household1: {
          todo1,
        },
      };
    })();

    const { queryAllByTestId } = render(<Schedule householdId="household1" />);
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    upsertTodo(todo2.householdId, todo2);
    await wait();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(7);
  });

  it("displays a todo when one is added with a different schedule", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });
    const todo2 = makeTodoModel({
      id: "todo2",
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

    const { queryAllByTestId } = render(<Schedule householdId="household1" />);
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    upsertTodo(todo2.householdId, todo2);
    await wait();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
  });

  it("skips a todo when a care for it has already been made", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
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

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />
    );

    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
  });

  it("removes a todo when a care is made", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(),
    });

    init((state) => {
      state.todos.todosByHouseholdId = {
        household1: {
          todo1,
        },
      };
    })();

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />
    );
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryByTestId(care1.id)).toBeNull();
    upsertCareByHouseholdId(todo1.householdId)(care1);
    await wait();
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
  });

  it("persists unrelated todos when a care is made", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceDays: 1,
    });
    const todo2 = makeTodoModel({
      id: "todo2",
      householdId: "household1",
      recurrenceDays: 2,
    });
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(),
    });

    init((state) => {
      state.todos.todosByHouseholdId = {
        household1: {
          todo1,
          todo2,
        },
      };
    })();

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />
    );
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
    expect(queryByTestId(care1.id)).toBeNull();
    upsertCareByHouseholdId(todo1.householdId)(care1);
    await wait();
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
  });

  it("handles a real-world example", async () => {
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
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(-1),
    });
    const care2 = makeCareModel({
      id: "care2",
      householdId: todo2.householdId,
      todoId: todo2.id,
      dateCreated: makeFirebaseDate(),
    });
    const care3 = makeCareModel({
      id: "care3",
      householdId: todo3.householdId,
      todoId: todo3.id,
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

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />
    );

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(0);
    expect(queryByTestId(care2.id)).toBeNull();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    upsertTodoByHouseholdId(todo2.householdId)(todo2);
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(3);
    expect(queryByTestId(care2.id)).toBeNull();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    upsertCareByHouseholdId(care2.householdId)(care2);
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    upsertTodoByHouseholdId(todo3.householdId)(todo3);
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(2);
    expect(queryByTestId(care3.id)).toBeNull();

    upsertCareByHouseholdId(care3.householdId)(care3);
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(1);
    expect(queryByTestId(care3.id)).toBeDefined();

    upsertTodoByHouseholdId(todo3.householdId)({ ...todo3, recurrenceDays: 2 });
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(3);
    expect(queryByTestId(care3.id)).toBeDefined();
  });
});

const Schedule = ({
  householdId,
  numberOfDaysToRender = 7,
}: {
  householdId: string;
  numberOfDaysToRender?: number;
}) => {
  const schedule = useStore(
    () => selectTodosSchedule(householdId)(numberOfDaysToRender),
    [householdId, numberOfDaysToRender]
  );
  const cares = useStore(() => selectCaresByHouseholdId(householdId), [
    householdId,
  ]);

  return (
    <View>
      {schedule.map((day) => (
        <View key={day.date.toISOString()} testID={day.date.toISOString()}>
          {day.todos.map((todo) => (
            <View key={todo.id} testID={todo.id} />
          ))}
        </View>
      ))}
      {cares.map((care) => (
        <View key={care.id} testID={care.id} />
      ))}
    </View>
  );
};
