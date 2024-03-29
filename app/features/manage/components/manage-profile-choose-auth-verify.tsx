import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "@urban-jungle/design/components/button";
import {
  Footer,
  ScreenLayout,
} from "@urban-jungle/design/components/layouts/screen-layout";
import { ScreenTitle } from "@urban-jungle/design/components/typography";
import { symbols } from "@urban-jungle/design/theme";
import React from "react";
import styled from "styled-components/native";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { MANAGE_STACK_NAME } from "../../../navigation/stack-names";
import { useManageAuthMachine } from "../machine/machine";
import { AuthProvider, getScreenTitle } from "../machine/types";
import { routeNames } from "../route-names";

const ManageProfileChooseAuthVerifyScreen = ({
  navigation,
}: StackScreenProps<{}>) => {
  const { context, execute } = useManageAuthMachine();

  const makeSubmitHandler = (authProviderType: AuthProvider) => () =>
    execute((ctx) => {
      ctx.selectedAuthSecurityCheckProvider = authProviderType;
    });

  return (
    <ScreenLayout
      footer={
        <Footer>
          {context.currentAuthProviders.includes("EMAIL") ? (
            <ProviderButton onPress={makeSubmitHandler("EMAIL")} large>
              Use my email address
            </ProviderButton>
          ) : null}

          {context.currentAuthProviders.includes("PHONE") ? (
            <ProviderButton onPress={makeSubmitHandler("PHONE")} large>
              Use my phone number
            </ProviderButton>
          ) : null}
        </Footer>
      }
    >
      <ContentContainer>
        <ScreenTitle
          title={getScreenTitle(context.flow)}
          description="You must sign in to continue"
        />
      </ContentContainer>
    </ScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-bottom: ${symbols.spacing._20}px;
`;

const ProviderButton = styled(Button)`
  margin-top: ${symbols.spacing._8}px;
`;

export const manageProfileChooseAuthVerify = makeNavigationRoute({
  screen: ManageProfileChooseAuthVerifyScreen,
  stackName: MANAGE_STACK_NAME,
  routeName: routeNames.manageAuthVerifyProviderRoute,
});
