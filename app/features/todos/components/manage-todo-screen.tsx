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

export const ManageTodoScreen = ({
  navigation,
}: NavigationStackScreenProps) => {
  const { plantId, todoId, ...initialFields } = manageTodoRoute.getParams(
    navigation
  );

  const { submit, registerTextInput, registerMultiPickerInput } = useForm<
    Fields
  >(
    {
      title: initialFields.title || "",
      detail: initialFields.detail || "",
      activeInMonths: initialFields.activeInMonths || defaultMonths,
    },
    { title: [constraints.isRequired], detail: [], activeInMonths: [] }
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
  serializeParams: (params) => ({
    ...params,
    activeInMonths: JSON.stringify(
      params.activeInMonths ? params.activeInMonths : defaultMonths
    ),
  }),
  deserializeParams: (params) => ({
    ...params,
    activeInMonths: deserializeActiveInMonths(params.activeInMonths),
  }),
});

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
