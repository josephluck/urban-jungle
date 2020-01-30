import React, { useState, useCallback } from "react";
import { FilterGroup } from "../hooks/tag-filters";
import { FilterGroupButton } from "./filter-group-button";
import styled from "styled-components/native";
import { theme } from "../theme";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ListItemTitle, SubDetailText } from "./typography";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { Modal } from "./modal";
import { ScrollView } from "react-native-gesture-handler";

export function FilterGroupBar({
  filterGroups,
  activeFilterIds,
  onFilterPress,
  onFilterGroupPress,
  onClearAllFilters
}: {
  filterGroups: FilterGroup[];
  activeFilterIds: string[];
  onFilterPress: (filterId: string) => void;
  onFilterGroupPress: (filterGroupId: string) => void;
  onClearAllFilters: () => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [
    modalShowingForFilterGroupId,
    setModalShowingForFilterGroupId
  ] = useState<string | null>(null);

  const handleFilterGroupPressed = useCallback(
    (filterGroupId: string) => {
      setModalShowingForFilterGroupId(filterGroupId);
      setModalVisible(true);
      onFilterGroupPress(filterGroupId);
    },
    [setModalShowingForFilterGroupId, onFilterGroupPress]
  );

  const clearActiveFilterGroup = useCallback(() => {
    setModalShowingForFilterGroupId(null);
  }, [setModalShowingForFilterGroupId]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);

  const filterGroupShowingInModal = modalShowingForFilterGroupId
    ? filterGroups.find(
        filterGroupId => filterGroupId.id === modalShowingForFilterGroupId
      )
    : null;

  return (
    <Container>
      <TagGroupsContainer
        horizontal
        contentContainerStyle={{ alignItems: "center" }}
      >
        {filterGroups.map(filterGroup => {
          const filterIds = filterGroup.filters.map(filter => filter.id);
          const activeFilterIdsInGroup = activeFilterIds.filter(
            activeFilterId => filterIds.includes(activeFilterId)
          );
          const groupHasActiveFilters = activeFilterIdsInGroup.length > 0;
          return (
            <TagGroupButtonSpaced
              key={filterGroup.id}
              value={activeFilterIds
                .map(activeFilterId => {
                  const filter = filterGroup.filters.find(
                    filter => filter.id === activeFilterId
                  );
                  return filter ? filter.label : undefined;
                })
                .filter(Boolean)}
              placeholder={filterGroup.label}
              isActive={groupHasActiveFilters}
              onPress={() => handleFilterGroupPressed(filterGroup.id)}
            ></TagGroupButtonSpaced>
          );
        })}
        {activeFilterIds.length > 0 && (
          <ClearAllLink onPress={onClearAllFilters}>
            <SubDetailText>Clear all</SubDetailText>
          </ClearAllLink>
        )}
      </TagGroupsContainer>
      <Modal
        title={filterGroupShowingInModal ? filterGroupShowingInModal.label : ""}
        isVisible={modalVisible}
        onClosePress={handleCloseModal}
        onClosed={clearActiveFilterGroup}
      >
        {!!filterGroupShowingInModal &&
        filterGroupShowingInModal.filtersLoading ? (
          <ActivityIndicator size="large" color={theme.colors.nearWhite} />
        ) : !!filterGroupShowingInModal ? (
          <ScrollView>
            {filterGroupShowingInModal.filters.map(filter => {
              const isActive = activeFilterIds.includes(filter.id);
              return (
                <FilterListItem
                  key={filter.id}
                  onPress={() => onFilterPress(filter.id)}
                >
                  <ListItemTitle style={{ flex: 1 }}>
                    {filter.label}
                  </ListItemTitle>
                  {isActive ? (
                    <ChevronWrap>
                      <FontAwesomeIcon
                        icon={faCheck}
                        style={{
                          color: theme.colors.darkGreen
                        }}
                        size={theme.size.filterActiveCheck}
                      />
                    </ChevronWrap>
                  ) : null}
                </FilterListItem>
              );
            })}
          </ScrollView>
        ) : null}
      </Modal>
    </Container>
  );
}

const Container = styled.View`
  margin-bottom: ${props => props.theme.spacing._18};
`;

const TagGroupsContainer = styled(ScrollView)`
  padding-left: ${props => props.theme.spacing._18};
  padding-right: ${props => props.theme.spacing._18};
`;

const TagGroupButtonSpaced = styled(FilterGroupButton)`
  margin-right: ${props => props.theme.spacing._8};
`;

const FilterListItem = styled(TouchableOpacity)`
  padding-top: ${props => props.theme.spacing._18 / 2};
  padding-bottom: ${props => props.theme.spacing._18 / 2};
  padding-left: ${props => props.theme.spacing._18};
  padding-right: ${props => props.theme.spacing._18};
  flex-direction: row;
  align-items: center;
`;

const ChevronWrap = styled.View`
  margin-left: ${props => props.theme.spacing._18};
  align-self: flex-end;
`;

const ClearAllLink = styled(TouchableOpacity)``;
