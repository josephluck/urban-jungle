import * as O from "fp-ts/lib/Option";
import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Avatar } from "./avatar";

export default {
  title: "components/Avatar",
  component: Avatar,
} as ComponentMeta<typeof Avatar>;

export const WithImage: ComponentStory<typeof Avatar> = (args) => (
  <Avatar {...args} />
);

WithImage.args = {
  src: O.some(
    "https://s.gravatar.com/avatar/453a7a095109ec93f419a54ad19956f6?s=80&r=g"
  ),
  letter: O.none,
};

export const LetterOnly = WithImage.bind({});
LetterOnly.args = {
  src: O.none,
  letter: O.some("J"),
};

export const Large = WithImage.bind({});
Large.args = {
  ...WithImage.args,
  size: "large",
};

export const Small = WithImage.bind({});
Small.args = {
  ...WithImage.args,
  size: "small",
};
