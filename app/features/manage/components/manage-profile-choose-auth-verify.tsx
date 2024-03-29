import { StackScreenProps } from "@react-navigation/stack";
import React from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { Button } from "../../../components/button";
import { BackableScreenLayout } from "../../../components/layouts/backable-screen";
import { ScreenTitle } from "../../../components/typography";
import { makeNavigationRoute } from "../../../navigation/make-navigation-route";
import { symbols } from "../../../theme";
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
    <BackableScreenLayout onBack={navigation.goBack} scrollView={false}>
      <ContentContainer>
        <ScreenTitle
          title={getScreenTitle(context.flow)}
          description="You must sign in to continue"
        />

        <View style={{ flex: 1 }} />

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
      </ContentContainer>
    </BackableScreenLayout>
  );
};

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
  padding-horizontal: ${symbols.spacing.appHorizontal}px;
  padding-bottom: ${symbols.spacing._20}px;
`;

const ProviderButton = styled(Button)`
  margin-top: ${symbols.spacing._8};
`;

export const manageProfileChooseAuthVerify = makeNavigationRoute({
  screen: ManageProfileChooseAuthVerifyScreen,
  routeName: routeNames.manageAuthVerifyProviderRoute,
});
