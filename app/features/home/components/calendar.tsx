import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import moment from "moment";
import styled from "styled-components/native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import { BodyText } from "../../../components/typography";
import { symbols } from "../../../theme";
import { Dimensions, ScrollView, View } from "react-native";
import { ListItem } from "../../../components/list-item";
import { useStore } from "../../../store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { TouchableOpacity } from "react-native-gesture-handler";
import { createCareForPlant } from "../../care/store/effects";
import { selectCurrentUserId } from "../../auth/store/state";
import { selectSchedule } from "./schedule";

export const Calendar = (_props: { householdId: string }) => {
  const today = useMemo(() => moment(), []);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const _profileId = useStore(selectCurrentUserId);
  const profileId = pipe(
    _profileId,
    O.getOrElse(() => "")
  );
  const schedule = useStore(() => selectSchedule(selectedHouseholdId, 4), [
    selectedHouseholdId,
  ]);
  const todaysIndex = useMemo(() => Math.floor(schedule.length / 2), []);
  const windowWidth = useMemo(() => Dimensions.get("window").width, []);
  const days = schedule.map((day, index) => ({
    ...day,
    index,
    isPast: false,
    isToday: index === todaysIndex,
  }));

  const [activeMonth, setActiveMonth] = useState(() => today.format("MMMM"));

  const scrollViewRef = useRef<ScrollView>(null);
  const carouselRef = useRef<CarouselStatic<any>>(null);

  const snapDaysToIndex = useCallback(
    (index: number) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: 0,
          x: index * dayOverallSize,
          animated: true,
        });
      }
    },
    [scrollViewRef.current]
  );

  const snapCarouselToIndex = useCallback(
    (index: number) => {
      if (carouselRef.current) {
        carouselRef.current.snapToItem(index, true);
      }
    },
    [carouselRef.current]
  );

  const handleDayPress = useCallback(
    (index: number, date: moment.Moment) => {
      snapCarouselToIndex(index);
      snapDaysToIndex(index);
      if (date.format("MMMM") !== activeMonth) {
        setActiveMonth(date.format("MMMM"));
      }
    },
    [snapCarouselToIndex, snapDaysToIndex, setActiveMonth, activeMonth]
  );

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      snapDaysToIndex(index);
      const date = days[index].date;
      if (date.format("MMMM") !== activeMonth) {
        setActiveMonth(date.format("MMMM"));
      }
    },
    [days, snapDaysToIndex, activeMonth]
  );

  const hasSnappedInitialDays = useRef(false);

  useEffect(() => {
    if (!hasSnappedInitialDays.current && scrollViewRef.current) {
      snapDaysToIndex(todaysIndex);
      hasSnappedInitialDays.current = true;
    }
  }, [hasSnappedInitialDays.current, scrollViewRef.current]);

  return (
    <Container>
      <MonthText weight="semibold">{activeMonth}</MonthText>
      <DaysContainer
        horizontal
        snapToInterval={dayOverallSize}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: windowWidth - dayOverallSize,
          backgroundColor: symbols.colors.appBackground,
        }}
        ref={scrollViewRef}
        removeClippedSubviews
      >
        {days.map((day) => (
          <Day
            key={day.date.toISOString()}
            onPress={() => handleDayPress(day.index, day.date)}
            isPast={day.isPast}
            isToday={day.isToday}
            activeOpacity={0.8}
          >
            <DayText weight="semibold" isToday={day.isToday}>
              {day.date.date()}
            </DayText>
          </Day>
        ))}
      </DaysContainer>
      <Carousel
        data={days}
        firstItem={todaysIndex}
        sliderWidth={windowWidth}
        itemWidth={windowWidth}
        nestedScrollEnabled
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        onBeforeSnapToItem={handleCarouselIndexChange}
        renderItem={(slide) => {
          const date = slide.item.date.toISOString();
          return (
            <TodosList key={date}>
              {slide.item.todos.map((todo) => (
                <TouchableOpacity
                  key={`${date}-${todo.id}`}
                  disabled={!slide.item.isToday}
                  onPress={createCareForPlant(profileId)(todo.id)(todo.plantId)(
                    todo.householdId
                  )}
                >
                  <ListItem
                    title={todo.title}
                    detail={`${todo.detail} every ${todo.recurrenceDays} days.`}
                    image={pipe(
                      todo.plant,
                      O.chain((plant) => O.fromNullable(plant.avatar)),
                      O.getOrElse(() => "")
                    )}
                  />
                </TouchableOpacity>
              ))}
              {slide.item.cares.map((care) => (
                <View key={care.id}>
                  <ListItem
                    title={care.todo.title}
                    detail={care.todo.detail}
                    image={pipe(
                      O.fromNullable(care.plant.avatar),
                      O.getOrElse(() => "")
                    )}
                  />
                </View>
              ))}
            </TodosList>
          );
        }}
        ref={carouselRef as any}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

const MonthText = styled(BodyText)`
  padding-horizontal: ${symbols.spacing.appHorizontal};
  margin-bottom: ${symbols.spacing._8};
`;

const DaysContainer = styled.ScrollView`
  flex-grow: 0;
  padding-horizontal: ${symbols.spacing.appHorizontal};
  background-color: ${symbols.colors.appBackground};
  margin-bottom: ${symbols.spacing._20};
`;

const daySize = 50;
const dayGap = symbols.spacing._8;
const dayOverallSize = daySize + dayGap;

const Day = styled.TouchableOpacity<{ isPast: boolean; isToday: boolean }>`
  width: ${daySize};
  height: ${daySize};
  background-color: ${(props) =>
    props.isToday ? "transparent" : symbols.colors.nearWhite};
  border-color: ${symbols.colors.solidBlue};
  border-width: ${(props) => (props.isToday ? 2 : 0)};
  opacity: ${(props) => (props.isPast ? 0.5 : 1)};
  justify-content: center;
  align-items: center;
  margin-right: ${dayGap};
  border-radius: ${symbols.borderRadius.tiny};
`;

const DayText = styled(BodyText)<{ isToday: boolean }>`
  color: ${(props) =>
    props.isToday ? symbols.colors.solidBlue : symbols.colors.offBlack};
`;

const TodosList = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
`;
