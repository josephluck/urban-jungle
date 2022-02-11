import { StackActions, useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import React, { useCallback } from "react";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { ListItem } from "../../../components/list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { useStore } from "../../../store/state";
import { useRunWithUIState } from "../../../store/ui";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { deletePlantByHouseholdId } from "../store/effects";

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
