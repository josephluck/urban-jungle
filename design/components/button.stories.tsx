import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Button } from "./button";

export default {
  title: "components/Button",
  component: Button,
} as ComponentMeta<typeof Button>;

export const Default: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);

Default.args = {
  children: "Hello World",
};
