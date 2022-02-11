import { StackScreenProps } from "@react-navigation/stack";
import { sortByMostRecent } from "@urban-jungle/shared/utils/sort";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React, { useCallback, useMemo } from "react";
import { SectionList, View } from "react-native";
import styled from "styled-components/native";
import { ScreenLayout } from "../../../components/layouts/screen-layout";
import { PlantListItem } from "../../../components/plant-list-item";
import { TouchableIcon } from "../../../components/touchable-icon";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { Heading, SubHeading } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { NavigationButtonList } from "../../../navigation/navigation-button-list";
import { PLANTS_STACK_NAME } from "../../../navigation/stack-names";
import {
  groupPlantsByLocation,
  selectedSelectedOrMostRecentHouseholdId,
  selectPlantsByHouseholdId,
} from "../../../store/selectors";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { newPlantPictureRoute } from "./new-plant/new-plant-picture-screen";
import { plantRoute } from "./plant-screen";

export const PlantsScreen = ({ navigation }: StackScreenProps<{}>) => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );

  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );

  const plants = useStore(() =>
    selectPlantsByHouseholdId(selectedHouseholdId).sort(sortByMostRecent),
  );

  const plantGroups = useMemo(() => groupPlantsByLocation()(plants), [plants]);

  const handleAddNew = useCallback(
    () => newPlantPictureRoute.navigateTo(navigation, {}),
    [],
  );

  return (
    <ScreenLayout onBack={navigation.goBack} scrollView={false} isRootScreen>
      <NavigationButtonList withoutClose>
        <TouchableIcon icon="plus" onPress={handleAddNew} />
      </NavigationButtonList>
      {selectedHouseholdId ? (
        <SectionList
          style={{
            flex: 1,
          }}
          sections={plantGroups}
          ListHeaderComponent={
            <WelcomeMessageContainer>
              <Heading>Your plants</Heading>
            </WelcomeMessageContainer>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ paddingHorizontal: symbols.spacing.appHorizontal }}>
              <SectionHeading weight="bold">{title}</SectionHeading>
            </View>
          )}
          renderItem={({ item: plant }) => (
            <TouchableOpacity
              key={plant.id}
              style={{ paddingHorizontal: symbols.spacing.appHorizontal }}
              onPress={() =>
                plantRoute.navigateTo(navigation, { plantId: plant.id })
              }
            >
              <PlantListItem plant={plant} />
            </TouchableOpacity>
          )}
        />
      ) : null}
    </ScreenLayout>
  );
};

export const plantsRoute = makeNavigationRoute({
  screen: PlantsScreen,
  stackName: PLANTS_STACK_NAME,
  routeName: "PLANTS_SCREEN",
});

const SectionHeading = styled(SubHeading)`
  padding-top: ${symbols.spacing._20}px;
  padding-bottom: ${symbols.spacing._12}px;
  background-color: ${(props) => props.theme.appBackground};
`;

const WelcomeMessageContainer = styled.View`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-vertical: ${symbols.spacing._20}px;
`;
