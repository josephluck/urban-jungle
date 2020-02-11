import React, { useCallback, useContext, useRef, useMemo } from "react";
import { Heading, BodyText, SubHeading } from "../../../components/typography";
import { ScreenLayout } from "../../../components/screen-layout";
import { selectHasAuthenticated } from "../../auth/store/state";
import { signOut } from "../../auth/store/effects";
import { Button, View, Animated } from "react-native";
import { NavigationContext, FlatList } from "react-navigation";
import {
  createLoginRoute,
  createSignUpRoute
} from "../../auth/navigation/routes";
import {
  selectedSelectedOrMostRecentHouseholdId,
  selectSelectedHouseholdName
} from "../../households/store/state";
import { createPlantForHousehold } from "../../plants/store/effects";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { HouseholdPlantsSubscription } from "../../plants/subscriptions/household-plants";
import { selectPlantsByHouseholdId } from "../../plants/store/state";
import { useStore } from "../../../store/state";
import {
  HouseholdsSelection,
  COLLAPSED_MIN_HEIGHT
} from "../../households/components/households-selection";
import styled from "styled-components/native";
import { faPlus } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CurrentProfileAvatar } from "../../profiles/components/current-profile-button";
import { PlantModel } from "../../../types";
import { IErr } from "../../../utils/err";
import { ButtonLink } from "../../../components/button-link";

export const Home = () => {
  const hasAuthenticated = useStore(selectHasAuthenticated);

  if (hasAuthenticated) {
    return <HomeScreen />;
  }

  return <SplashScreen />;
};

const HomeScreen = () => {
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );

  const plants = useStore(
    () =>
      pipe(
        selectedHouseholdId_,
        O.map(selectPlantsByHouseholdId),
        O.getOrElse(() => [] as PlantModel[])
      ),
    [selectedHouseholdId_]
  );

  const handleCreatePlant = useCallback(async () => {
    const task = pipe(
      selectedHouseholdId_,
      TE.fromOption(() => "NOT_FOUND" as IErr),
      TE.chain(createPlantForHousehold())
    );
    task();
  }, [selectedHouseholdId_]);

  const scrollAnimatedValue = useRef(new Animated.Value(0));

  return (
    <ScreenLayout>
      <AppHeading scrollAnimatedValue={scrollAnimatedValue.current} />
      {selectedHouseholdId ? (
        <HouseholdPlantsSubscription householdId={selectedHouseholdId} />
      ) : null}
      <FlatList
        ListHeaderComponent={
          <HouseholdsSelection
            scrollAnimatedValue={scrollAnimatedValue.current}
          />
        }
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { y: scrollAnimatedValue.current } } }
        ])}
        data={plants}
        keyExtractor={plant => plant.id}
        renderItem={({ item }) => (
          <View>
            <BodyText>{item.name}</BodyText>
          </View>
        )}
        ListFooterComponent={
          <Button title="Add plant" onPress={handleCreatePlant} />
        }
      />
      <ButtonLink onPress={signOut}>Sign out</ButtonLink>
    </ScreenLayout>
  );
};

const AppHeading = ({
  scrollAnimatedValue
}: {
  scrollAnimatedValue: Animated.Value;
}) => {
  const selectedHouseholdName_ = useStore(selectSelectedHouseholdName);
  const selectedHouseholdName = pipe(
    selectedHouseholdName_,
    O.getOrElse(() => "")
  );

  const opacity = useMemo(
    () =>
      scrollAnimatedValue.interpolate({
        inputRange: [0, COLLAPSED_MIN_HEIGHT],
        outputRange: [0, 1],
        extrapolate: "clamp"
      }),
    [scrollAnimatedValue]
  );

  return (
    <HeadingWrapper>
      <CurrentProfileAvatar onPress={console.log} />
      <HouseholdNameTitle style={{ opacity }}>
        <SubHeading>{selectedHouseholdName}</SubHeading>
      </HouseholdNameTitle>
      <AddButton onPress={console.log} />
    </HeadingWrapper>
  );
};

const HouseholdNameTitle = styled(Animated.Text)``;

const HeadingWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = ({ onPress }: { onPress: () => void }) => (
  <AddButtonButton onPress={onPress}>
    <AddIconWrapper>
      <FontAwesomeIcon color="white" icon={faPlus} size={20} />
    </AddIconWrapper>
  </AddButtonButton>
);

const AddButtonButton = styled.TouchableOpacity`
  padding-vertical: ${props => props.theme.spacing._16};
  padding-horizontal: ${props => props.theme.spacing._16};
  justify-content: center;
  align-items: center;
`;

const AddIconWrapper = styled.View`
  width: ${props => props.theme.size.avatarSmall};
  height: ${props => props.theme.size.avatarSmall};
  justify-content: center;
  align-items: center;
`;

const SplashScreen = () => {
  const { navigate } = useContext(NavigationContext);

  const handleSignUp = useCallback(() => {
    navigate(createSignUpRoute());
  }, []);

  const handleSignIn = useCallback(() => {
    navigate(createLoginRoute());
  }, []);

  return (
    <ScreenLayout>
      <Heading>Plantpal</Heading>
      <Button title="Create account" onPress={handleSignUp} />
      <Button title="Sign in" onPress={handleSignIn} />
    </ScreenLayout>
  );
};
