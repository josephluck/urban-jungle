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
import { deletePlantByHouseholdId } from "../../../store/effects";
import { selectedSelectedOrMostRecentHouseholdId } from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";

export const DeletePlantScreen = ({
  route,
}: StackScreenProps<Record<keyof DeletePlantRouteParams, undefined>>) => {
  const runWithUIState = useRunWithUIState();
  const navigation = useNavigation();
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const { plantId } = deletePlantRoute.getParams(route);

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );
  const handleDelete = useCallback(
    () =>
      runWithUIState(
        pipe(
          deletePlantByHouseholdId(selectedHouseholdId)(plantId),
          TE.map(() => navigation.dispatch(StackActions.popToTop())),
        ),
      ),
    [plantId, selectedHouseholdId],
  );

  return (
    <ScreenLayout isModal>
      <TouchableOpacity
        onPress={handleDelete}
        style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
      >
        <ListItem title="Delete plant" />
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

type DeletePlantRouteParams = {
  plantId: string;
};

export const deletePlantRoute = makeNavigationRoute<DeletePlantRouteParams>({
  screen: DeletePlantScreen,
  stackName: null,
  defaultParams: {
    plantId: "",
  },
  routeName: "DELETE_PLANT_SCREEN",
});
