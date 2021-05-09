import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, ScrollView } from "react-native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import styled from "styled-components/native";
import { CalendarDay, daySize } from "../../../components/calendar-day";
import { CareListItem } from "../../../components/care-list-item";
import { TodoListItem } from "../../../components/todo-list-item";
import { TouchableOpacity } from "../../../components/touchable-opacity";
import { BodyText } from "../../../components/typography";
import { useStore } from "../../../store/state";
import { symbols } from "../../../theme";
import { selectedSelectedOrMostRecentHouseholdId } from "../../households/store/state";
import { ScheduleItem, selectSchedule } from "../store/schedule";

export const Schedule = ({
  handleNavigateToCareSession,
}: {
  handleNavigateToCareSession: (todoIds: string[]) => void;
}) => {
  const today = useMemo(() => moment(), []);
  const selectedHouseholdId_ = useStore(
    selectedSelectedOrMostRecentHouseholdId,
  );
  const selectedHouseholdId = pipe(
    selectedHouseholdId_,
    O.getOrElse(() => ""),
  );
  const schedule = useStore(() => selectSchedule(selectedHouseholdId, 7), [
    selectedHouseholdId,
  ]);
  const todaysIndex = useMemo(() => Math.floor(schedule.length / 2), []);
  const windowWidth = useMemo(() => Dimensions.get("window").width, []);

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
    [scrollViewRef.current],
  );

  const snapCarouselToIndex = useCallback(
    (index: number) => {
      if (carouselRef.current) {
        carouselRef.current.snapToItem(index, true);
      }
    },
    [carouselRef.current],
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
    [snapCarouselToIndex, snapDaysToIndex, setActiveMonth, activeMonth],
  );

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      snapDaysToIndex(index);
      const date = schedule[index].date;
      const month = date.format("MMMM");
      if (month !== activeMonth) {
        setActiveMonth(month);
      }
    },
    [schedule, snapDaysToIndex, activeMonth],
  );

  const hasSnappedInitialDays = useRef(false);

  useEffect(() => {
    if (
      !hasSnappedInitialDays.current &&
      scrollViewRef.current &&
      todaysIndex === 7 &&
      schedule.length === 15
    ) {
      hasSnappedInitialDays.current = true;
      requestAnimationFrame(() => {
        snapDaysToIndex(todaysIndex);
      });
    }
  }, [
    hasSnappedInitialDays.current,
    scrollViewRef.current,
    todaysIndex,
    schedule.length,
    snapDaysToIndex,
  ]);

  const handleRenderItem = useCallback(
    ({ item: { index, date, todos, cares } }: { item: ScheduleItem }) => {
      const dateKey = date.toISOString();
      const isToday = todaysIndex === index;
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
    },
    [handleNavigateToCareSession],
  );
  if (todaysIndex === 7 && schedule.length === 15) {
    return (
      <Container>
        <MonthText weight="semibold">{activeMonth}</MonthText>
        <DaysContainer
          horizontal
          snapToInterval={dayOverallSize}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingRight: windowWidth - dayOverallSize,
          }}
          ref={scrollViewRef}
          removeClippedSubviews
        >
          {schedule.map((day) => {
            const isToday = day.index === todaysIndex;
            return (
              <ScheduleDay
                key={day.date.toISOString()}
                onPress={() => handleDayPress(day.index, day.date)}
                date={day.date.date()}
                isToday={isToday}
              />
            );
          })}
        </DaysContainer>
        <Carousel
          useScrollView
          data={schedule}
          firstItem={todaysIndex}
          sliderWidth={windowWidth}
          itemWidth={windowWidth}
          nestedScrollEnabled
          inactiveSlideScale={1}
          inactiveSlideOpacity={1}
          onBeforeSnapToItem={handleCarouselIndexChange}
          renderItem={handleRenderItem}
          ref={carouselRef as any}
        />
      </Container>
    );
  }

  return null;
};

const Container = styled.View`
  flex: 1;
`;

const MonthText = styled(BodyText)`
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  margin-bottom: ${symbols.spacing._8}px;
`;

const DaysContainer = styled.ScrollView`
  flex-grow: 0;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  background-color: ${(props) => props.theme.appBackground};
  margin-bottom: ${symbols.spacing._20}px;
`;

const TodosList = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
`;

export const dayGap = symbols.spacing._8;

export const dayOverallSize = daySize + dayGap;

const ScheduleDay = styled(CalendarDay)`
  margin-right: ${dayGap}px;
`;
