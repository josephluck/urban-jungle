import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { CircleImage } from "./circle-image";

export default {
  title: "components/CircleImage",
  component: CircleImage,
} as ComponentMeta<typeof CircleImage>;

export const Default: ComponentStory<typeof CircleImage> = (args) => (
  <CircleImage {...args} />
);

Default.args = {
  uri: "https://s.gravatar.com/avatar/453a7a095109ec93f419a54ad19956f6?s=80&r=g",
};

export const WithTick = Default.bind({});
WithTick.args = {
  ...Default.args,
  withTickBadge: true,
};

export const WithDelete = Default.bind({});
WithDelete.args = {
  ...Default.args,
  withDeleteBadge: true,
};
