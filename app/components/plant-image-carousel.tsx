import React, { useCallback, useEffect, useRef } from "react";
import { Dimensions } from "react-native";
import Carousel, { CarouselStatic } from "react-native-snap-carousel";
import styled from "styled-components/native";
import { deletePlantPhoto } from "../features/plants/store/effects";
import { PhotoModel } from "../models/photo";
import { useStore } from "../store/state";
import { symbols } from "../theme";
import { PlantImage } from "./plant-image";
import { PlantImageUploader } from "./plant-image-uploader";
import { selectPhotosForPlant } from "../features/photos/store/state";

const horizontalMargin = symbols.spacing._4;
const sliderWidth = Dimensions.get("window").width;
const slideWidth = sliderWidth - symbols.spacing.appHorizontal * 2;
const itemWidth = slideWidth + horizontalMargin * 2;

type CameraSlide = { slideType: "camera"; id: string };

type PhotoSlide = { slideType: "photo" } & PhotoModel;

type SlideItem = PhotoSlide | CameraSlide;

export const PlantImageCarousel = ({
  plantId,
  householdId,
}: {
  plantId: string;
  householdId: string;
}) => {
  const photos = useStore(() => selectPhotosForPlant(householdId, plantId), [
    householdId,
    plantId,
  ]);

  const carouselRef = useRef<CarouselStatic<SlideItem>>(null);

  const slideItems: SlideItem[] = [
    { slideType: "camera" as const, id: "camera" },
    ...photos.map((photo) => ({ ...photo, slideType: "photo" as const })),
  ];

  useEffect(() => {
    if (photos.length > 0) {
      requestAnimationFrame(() => {
        if (carouselRef.current) {
          // NB: we assume the latest upload is the first item
          carouselRef.current.snapToItem(1, true);
        }
      });
    }
  }, [photos.length]);

  const handleDeleteImage = useCallback(
    (photoId: string) => {
      deletePlantPhoto(householdId, plantId)(photoId)();
    },
    [householdId, plantId]
  );

  return (
    <Carousel
      style={{ flex: 1 }}
      containerCustomStyle={{ flex: 1 }}
      data={slideItems}
      removeClippedSubviews
      sliderWidth={sliderWidth}
      itemWidth={itemWidth}
      nestedScrollEnabled
      inactiveSlideScale={1}
      inactiveSlideOpacity={0.8}
      renderItem={(slide) => (
        <Slide key={slide.item.id}>
          {slide.item.slideType === "camera" ? (
            <PlantImageUploader householdId={householdId} plantId={plantId} />
          ) : (
            <PlantImageButton
              onLongPress={() => handleDeleteImage(slide.item.id)}
            >
              <PlantImage uri={slide.item.uri} />
            </PlantImageButton>
          )}
        </Slide>
      )}
      ref={carouselRef as any}
    />
  );
};

const Slide = styled.View`
  width: ${itemWidth};
  padding-horizontal: ${symbols.spacing._4}px;
`;

const PlantImageButton = styled.TouchableOpacity`
  width: ${slideWidth}px;
`;
