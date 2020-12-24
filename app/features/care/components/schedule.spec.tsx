import { act, render, wait } from "@testing-library/react-native";
import firebase from "firebase";
import moment from "moment";
import React from "react";
import { View } from "react-native";

import { makeCareModel } from "@urban-jungle/shared/models/care";
import { makeTodoModel } from "@urban-jungle/shared/models/todo";

import { defaultState, store, useStore } from "../../../store/state";
import { selectTodosSchedule, upsertTodo } from "../../todos/store/state";
import { selectCaresByHouseholdId, upsertCare } from "../store/state";

const makeFirebaseDate = (
  daysAdjustment: number = 0,
): firebase.firestore.Timestamp => {
  const date =
    daysAdjustment === 0
      ? moment()
      : daysAdjustment >= 0
      ? moment().add(daysAdjustment, "days")
      : moment().subtract(Math.abs(daysAdjustment), "days");
  return firebase.firestore.Timestamp.fromDate(date.toDate());
};

describe.skip("schedule rendering", () => {
  const init = store.createMutator;

  beforeEach(() => {
    act(() => {
      store.replaceState(defaultState);
    });
  });

  it("renders a basic schedule", () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 1,
    });

    act(() =>
      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
      })(),
    );

    const { container, queryByTestId, queryAllByTestId } = render(
      <Schedule householdId="household1" />,
    );
    expect(container).toBeDefined();
    expect(queryByTestId(moment().toISOString())).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
  });

  it("displays a todo when one is added", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 1,
    });
    const todo2 = makeTodoModel({
      id: "todo2",
      householdId: "household1",
      recurrenceCount: 1,
    });

    act(() =>
      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
      })(),
    );

    const { queryAllByTestId } = render(<Schedule householdId="household1" />);
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    act(() => {
      upsertTodo(todo2.householdId, todo2);
    });
    await wait();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(7);
  });

  it("displays a todo when one is added with a different schedule", async () => {
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

    act(() =>
      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
      })(),
    );

    const { queryAllByTestId } = render(<Schedule householdId="household1" />);
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    act(() => {
      upsertTodo(todo2.householdId, todo2);
    });
    await wait();
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
  });

  it("skips a todo when a care for it has already been made", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 1,
    });
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(),
    });

    act(() =>
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
      })(),
    );

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />,
    );

    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
  });

  it("removes a todo when a care is made", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 1,
    });
    const care1 = makeCareModel({
      id: "care1",
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(),
    });

    act(() =>
      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
          },
        };
      })(),
    );

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />,
    );
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryByTestId(care1.id)).toBeNull();
    act(() => {
      upsertCare(todo1.householdId, care1);
    });
    await wait();
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
  });

  it("persists unrelated todos when a care is made", async () => {
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
      householdId: todo1.householdId,
      todoId: todo1.id,
      dateCreated: makeFirebaseDate(),
    });

    act(() =>
      init((state) => {
        state.todos.byHouseholdId = {
          household1: {
            todo1,
            todo2,
          },
        };
      })(),
    );

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />,
    );
    expect(queryAllByTestId(todo1.id)).toHaveLength(7);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
    expect(queryByTestId(care1.id)).toBeNull();
    act(() => {
      upsertCare(todo1.householdId, care1);
    });
    await wait();
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo1.id)).toHaveLength(6);
    expect(queryAllByTestId(todo2.id)).toHaveLength(4);
  });

  it("handles a real-world example", async () => {
    const todo1 = makeTodoModel({
      id: "todo1",
      householdId: "household1",
      recurrenceCount: 2,
    });
    const todo2 = makeTodoModel({
      id: "todo2",
      householdId: "household1",
      recurrenceCount: 3,
    });
    const todo3 = makeTodoModel({
      id: "todo3",
      householdId: "household1",
      recurrenceCount: 4,
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

    act(() =>
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
      })(),
    );

    const { queryAllByTestId, queryByTestId } = render(
      <Schedule householdId="household1" />,
    );

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(0);
    expect(queryByTestId(care2.id)).toBeNull();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    act(() => {
      upsertTodo(todo2.householdId, todo2);
    });
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(3);
    expect(queryByTestId(care2.id)).toBeNull();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    act(() => {
      upsertCare(care2.householdId, care2);
    });
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(0);
    expect(queryByTestId(care3.id)).toBeNull();

    act(() => {
      upsertTodo(todo3.householdId, todo3);
    });
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(2);
    expect(queryByTestId(care3.id)).toBeNull();

    act(() => {
      upsertCare(care3.householdId, care3);
    });
    await wait();

    expect(queryAllByTestId(todo1.id)).toHaveLength(3);
    expect(queryByTestId(care1.id)).toBeDefined();
    expect(queryAllByTestId(todo2.id)).toHaveLength(2);
    expect(queryByTestId(care2.id)).toBeDefined();
    expect(queryAllByTestId(todo3.id)).toHaveLength(1);
    expect(queryByTestId(care3.id)).toBeDefined();

    act(() => {
      upsertTodo(todo3.householdId, { ...todo3, recurrenceCount: 2 });
    });
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
    [householdId, numberOfDaysToRender],
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
