import { StackActions, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { ScreenLayout } from "@urban-jungle/design/components/layouts/screen-layout";
import { ListItem } from "@urban-jungle/design/components/list-item";
import { TouchableOpacity } from "@urban-jungle/design/components/touchable-opacity";
import { symbols } from "@urban-jungle/design/theme";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { deleteTodo } from "../../../store/effects";
import { selectedSelectedOrMostRecentHouseholdId } from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";

export const DeleteTodoScreen = ({
  route,
}: StackScreenProps<Record<keyof DeleteTodoRouteParams, undefined>>) => {
  const runWithUIState = useRunWithUIState();
  const navigation = useNavigation();
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const { todoId } = deleteTodoRoute.getParams(route);

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );
  const handleDelete = useCallback(
    () =>
      runWithUIState(
        pipe(
          deleteTodo(selectedHouseholdId)(todoId),
          TE.map(() => navigation.dispatch(StackActions.pop(2))),
        ),
      ),
    [todoId, selectedHouseholdId],
  );

  return (
    <ScreenLayout isModal>
      <TouchableOpacity
        onPress={handleDelete}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem title="Delete todo" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={navigation.goBack}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem title="Cancel" />
      </TouchableOpacity>
    </ScreenLayout>
  );
};

type DeleteTodoRouteParams = {
  todoId: string;
};

export const deleteTodoRoute = makeNavigationRoute<DeleteTodoRouteParams>({
  screen: DeleteTodoScreen,
  stackName: null,
  defaultParams: {
    todoId: "",
  },
  routeName: "DELETE_TODO_SCREEN",
});
