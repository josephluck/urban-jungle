import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { NavigationStackScreenProps } from "react-navigation-stack";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { PickerField } from "../../../components/picker-field";
import { TextField } from "../../../components/text-field";
import { constraints, useForm } from "../../../hooks/use-form";
import { TodoModel } from "../../../models/todo";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { IErr } from "../../../utils/err";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { upsertTodoForPlant } from "../store/effects";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { DualTextPickerField } from "../../../components/dual-text-picker-field";

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, value) => ({ label, value }));

type Fields = Pick<
  TodoModel,
  | "title"
  | "detail"
  | "activeInMonths"
  | "recurrenceCount"
  | "recurrenceInterval"
>;

type RecurrenceOption = {
  label: string;
  value: TodoModel["recurrenceInterval"];
};

const recurrenceOptions: RecurrenceOption[] = [
  { label: "Days", value: "days" },
  {
    label: "Weeks",
    value: "weeks",
  },
  {
    label: "Months",
    value: "months",
  },
];

export const ManageTodoScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { plantId, todoId, ...initialFields } = manageTodoRoute.getParams(
    navigation
  );

  const {
    submit,
    registerTextInput,
    registerMultiPickerInput,
    registerDualPickerField,
  } = useForm<Fields>(
    {
      title: initialFields.title || "",
      detail: initialFields.detail || "",
      activeInMonths: initialFields.activeInMonths || defaultMonths,
      recurrenceCount: 1,
      recurrenceInterval: "days",
    },
    {
      title: [constraints.isRequired],
      detail: [],
      activeInMonths: [],
      recurrenceInterval: [constraints.isRequired],
      recurrenceCount: [constraints.isRequired],
    }
  );

  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = useCallback(
    () =>
      pipe(
        // TODO: extract these two since it'll be a common pattern?
        TE.fromEither(submit()),
        TE.mapLeft(() => "BAD_REQUEST" as IErr),
        TE.chain((todo) =>
          upsertTodoForPlant(plantId, todoId)(selectedHouseholdId)(todo)
        ),
        TE.map(() => navigation.goBack())
      )(),
    [selectedHouseholdId, plantId, submit]
  );

  return (
    <BackableScreenLayout
      onBack={handleGoBack}
      footer={
        <Footer>
          <Button large onPress={handleSubmit}>
            Save
          </Button>
        </Footer>
      }
    >
      <ContentContainer>
        <TextField label="Title" {...registerTextInput("title")} />
        <TextField label="Detail" multiline {...registerTextInput("detail")} />
        <DualTextPickerField
          label="Repeats every"
          options={recurrenceOptions}
          {...registerDualPickerField("title", "recurrenceInterval")}
        />
        <PickerField
          label="Active in"
          options={monthOptions}
          multiValue
          {...registerMultiPickerInput("activeInMonths")}
        />
      </ContentContainer>
    </BackableScreenLayout>
  );
};

const defaultMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

type ManageTodoParams = {
  plantId: string;
  todoId?: string;
} & Partial<Fields>;

export const manageTodoRoute = makeNavigationRoute<ManageTodoParams>({
  screen: ManageTodoScreen,
  routeName: "MANAGE_TODO_SCREEN",
  authenticated: true,
  defaultParams: {
    plantId: "",
    activeInMonths: defaultMonths,
  },
  serializeParams: ({ recurrenceCount, activeInMonths, ...params }) => ({
    recurrenceCount: recurrenceCount ? recurrenceCount.toString() : "1",
    activeInMonths: JSON.stringify(
      activeInMonths ? activeInMonths : defaultMonths
    ),
    ...params,
  }),
  deserializeParams: ({
    recurrenceInterval,
    recurrenceCount,
    activeInMonths,
    ...params
  }) => ({
    recurrenceCount: recurrenceCount ? parseInt(recurrenceCount) : 1,
    recurrenceInterval: deserializeRecurrenceInterval(recurrenceInterval),
    activeInMonths: deserializeActiveInMonths(activeInMonths),
    ...params,
  }),
});

const deserializeRecurrenceInterval = (
  recurrenceInterval: string
): TodoModel["recurrenceInterval"] =>
  recurrenceInterval &&
  recurrenceOptions.map((o) => o.value).includes(recurrenceInterval as any)
    ? (recurrenceInterval as TodoModel["recurrenceInterval"])
    : "days";

const deserializeActiveInMonths = (monthsStr: string) => {
  try {
    if (monthsStr) {
      const parsed = JSON.parse(monthsStr);
      return Array.isArray(parsed) && parsed.every(Number.isInteger)
        ? parsed
        : defaultMonths;
    } else {
      return defaultMonths;
    }
  } catch (err) {
    return defaultMonths;
  }
};

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;
