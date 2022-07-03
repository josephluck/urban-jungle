import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { AvatarCircle } from "./avatar-circle";

export default {
  title: "components/AvatarCircle",
  component: AvatarCircle,
} as ComponentMeta<typeof AvatarCircle>;

export const Default: ComponentStory<typeof AvatarCircle> = (args) => (
  <AvatarCircle {...args} />
);

Default.args = {};
