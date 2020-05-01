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
import { Dimensions, ScrollView } from "react-native";
import { useStore } from "../../../store/state";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import { TouchableOpacity } from "react-native-gesture-handler";
import { selectSchedule } from "../store/schedule";
import { TodoListItem } from "../../../components/todo-list-item";
import { CareListItem } from "../../../components/care-list-item";
import { CalendarDay, daySize } from "../../../components/calendar-day";

export const Schedule = ({
  handleNavigateToCareSession,
}: {
  handleNavigateToCareSession: (todoIds: string[]) => void;
}) => {
  const today = useMemo(() => moment(), []);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => "")
  );
  const schedule = useStore(() => selectSchedule(selectedHouseholdId, 7), [
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
      const month = date.format("MMMM");
      if (month !== activeMonth) {
        setActiveMonth(month);
      }
    },
    [snapCarouselToIndex, snapDaysToIndex, setActiveMonth, activeMonth]
  );

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      snapDaysToIndex(index);
      const date = days[index].date;
      const month = date.format("MMMM");
      if (month !== activeMonth) {
        setActiveMonth(month);
      }
    },
    [days, snapDaysToIndex, activeMonth]
  );

  const hasSnappedInitialDays = useRef(false);

  useEffect(() => {
    if (
      !hasSnappedInitialDays.current &&
      scrollViewRef.current &&
      todaysIndex > 0
    ) {
      snapDaysToIndex(todaysIndex);
      hasSnappedInitialDays.current = true;
    }
  }, [hasSnappedInitialDays.current, scrollViewRef.current, todaysIndex]);

  if (todaysIndex <= 0) {
    return null;
  }

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
          <ScheduleDay
            key={day.date.toISOString()}
            onPress={() => handleDayPress(day.index, day.date)}
            date={day.date.date()}
            isPast={day.isPast}
            isToday={day.isToday}
          />
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
        renderItem={({ item: { date, isToday, todos, cares } }) => {
          const dateKey = date.toISOString();
          return (
            <TodosList key={dateKey}>
              <TouchableOpacity
                disabled={!isToday || todos.length === 0}
                onPress={() =>
                  handleNavigateToCareSession(todos.map((todo) => todo.id))
                }
              >
                {todos.map((todo) => (
                  <TodoListItem key={`${dateKey}-${todo.id}`} todo={todo} />
                ))}
                {cares.map((care) => (
                  <CareListItem key={care.id} care={care} />
                ))}
              </TouchableOpacity>
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

const TodosList = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal};
`;

export const dayGap = symbols.spacing._8;

export const dayOverallSize = daySize + dayGap;

const ScheduleDay = styled(CalendarDay)`
  margin-right: ${dayGap};
`;
