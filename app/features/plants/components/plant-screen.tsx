import React from "react";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { useStore } from "../../../store/state";
import styled from "styled-components/native";
import { symbols } from "../../../theme";
import { Heading, SubHeading } from "../../../components/typography";
import { selectPlantByHouseholdAndId } from "../store/state";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { TouchableIcon } from "../../../components/touchable-icon";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons";
import { faEdit } from "@fortawesome/pro-solid-svg-icons";
import { IconButton } from "../../../components/icon-button";
import { View, Text } from "react-native";
import { createTodoForPlant } from "../../todos/store/effects";
import { ListItem } from "../../../components/list-item";
import { selectTodosForPlant } from "../../todos/store/state";

export const Plant = (props: NavigationStackScreenProps) => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <PlantScreen {...props} />;
  }

  return null;
};

const PlantScreen = ({ navigation }: NavigationStackScreenProps) => {
  const plantId = navigation.getParam(PLANT_ID);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const plant = useStore(() =>
    selectPlantByHouseholdAndId(selectedHouseholdId)(plantId)
  );

  const todos = useStore(
    () => selectTodosForPlant(plantId)(selectedHouseholdId),
    [plantId, selectedHouseholdId]
  );

  return (
    <ScreenLayout>
      {pipe(
        plant,
        O.fold(
          () => null,
          (plant) => (
            <ScreenContainer>
              <Header>
                <ScreenControls>
                  <BackButtonWrapper>
                    <BackButton
                      icon={faArrowLeft}
                      onPress={() => navigation.goBack()}
                      style={{ marginRight: symbols.spacing._12 }}
                      size={symbols.font._28.size}
                    />
                    <Heading
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ flex: 1 }}
                    >
                      {plant.name}
                    </Heading>
                  </BackButtonWrapper>
                  <IconButton
                    icon={faEdit}
                    onPress={createTodoForPlant(plant.id)(plant.householdId)()}
                    style={{ marginLeft: symbols.spacing._16 }}
                  >
                    Edit
                  </IconButton>
                </ScreenControls>
              </Header>
              <ScreenContent stickyHeaderIndices={[1]}>
                <AvatarWrapper>
                  {plant.avatar ? (
                    <PlantImage source={{ uri: plant.avatar }} />
                  ) : (
                    <PlantImagePlaceholder />
                  )}
                </AvatarWrapper>
                <TabsContainer>
                  <SubHeading style={{ opacity: 0.2 }}>Details</SubHeading>
                  <SubHeading style={{ opacity: 1 }}>Next up</SubHeading>
                  <SubHeading style={{ opacity: 0.2 }}>History</SubHeading>
                </TabsContainer>
                <View>
                  {todos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      title={todo.title}
                      detail={todo.detail}
                    />
                  ))}
                </View>
              </ScreenContent>
            </ScreenContainer>
          )
        )
      )}
    </ScreenLayout>
  );
};

export const PLANT_SCREEN = "PLANT_SCREEN";
export const PLANT_ID = "PLANT_ID";
export const createPlantRoute = (plantId: string) => ({
  routeName: PLANT_SCREEN,
  params: { [PLANT_ID]: plantId },
});

const ScreenContainer = styled.View`
  flex-grow: 1;
  background-color: ${symbols.colors.appBackground};
`;

const Header = styled.View`
  padding-top: ${symbols.spacing.appVertical};
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing._20};
`;

const ScreenControls = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BackButtonWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const BackButton = styled(TouchableIcon)``;

const PlantImage = styled.Image`
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const PlantImagePlaceholder = styled.View`
  background-color: ${symbols.colors.nearWhite};
  border-radius: 30;
  width: 100%;
  aspect-ratio: 2;
`;

const AvatarWrapper = styled.View`
  margin-bottom: ${symbols.spacing._32};
  align-items: center;
`;

const ScreenContent = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
`;

const TabsContainer = styled.View`
  flex-direction: row;
  justify-content: space-evenly;
  padding-bottom: ${symbols.spacing._20};
  background-color: ${symbols.colors.appBackground};
`;
