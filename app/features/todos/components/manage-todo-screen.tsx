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

type Fields = Pick<TodoModel, "title" | "detail" | "activeInMonths">;

const parseActiveInMonths = (monthsStr: string): number[] => {
  const defaultMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
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

export const ManageTodoScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const extractFieldFromNav = (field: keyof Fields): string =>
    navigation.getParam(field) || "";

  const { submit, registerTextInput, registerMultiPickerInput } = useForm<
    Fields
  >(
    {
      title: extractFieldFromNav("title"),
      detail: extractFieldFromNav("detail"),
      activeInMonths: parseActiveInMonths(
        extractFieldFromNav("activeInMonths")
      ),
    },
    { title: [constraints.isRequired], detail: [], activeInMonths: [] }
  );

  const todoId = navigation.getParam(TODO_ID);
  const plantId = navigation.getParam(PLANT_ID);

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
        <TextField label="Title" autoFocus {...registerTextInput("title")} />
        <TextField label="Detail" multiline {...registerTextInput("detail")} />
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

export const MANAGE_TODO_SCREEN = "MANAGE_TODO_SCREEN";

export const TODO_ID = "TODO_ID";
export const PLANT_ID = "PLANT_ID";

export const createManageTodoRoute = ({
  plantId,
  todoId,
  activeInMonths,
  ...fields
}: { plantId: string; todoId?: string } & Partial<Fields>) => ({
  routeName: MANAGE_TODO_SCREEN,
  params: {
    [PLANT_ID]: plantId,
    [TODO_ID]: todoId,
    activeInMonths: JSON.stringify(activeInMonths),
    ...fields,
  },
});

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

const Footer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-vertical: ${symbols.spacing._20}px;
`;
