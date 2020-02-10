import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { Linking } from "expo";
import { pipe } from "fp-ts/lib/pipeable";
import { IErr } from "../../../utils/err";

export const SIGN_IN_SCREEN = "LOGIN_SCREEN";
export const createLoginRoute = () => SIGN_IN_SCREEN;

export const SIGN_UP_SCREEN = "SIGN_UP_SCREEN";
export const createSignUpRoute = () => SIGN_UP_SCREEN;

const HOUSEHOLD_INVITATION_LINK = "auth/to-household";

type HouseholdInvitationQueryParams = { householdId: string };

export const makeHouseholdInvitationLink = (householdId: string) =>
  Linking.makeUrl(HOUSEHOLD_INVITATION_LINK, {
    householdId
  } as HouseholdInvitationQueryParams);

export const getAndParseInitialHouseholdInvitationLink = (): TE.TaskEither<
  IErr,
  HouseholdInvitationQueryParams
> =>
  pipe(
    TE.tryCatch(
      async () => {
        const response = await Linking.getInitialURL();
        if (!response) {
          throw new Error();
        }
        return response as string;
      },
      () => "NOT_FOUND" as IErr
    ),
    TE.map(link =>
      pipe(
        parseHouseholdInvitationLink(link),
        TE.fromOption(() => "NOT_FOUND" as IErr)
      )
    ),
    TE.flatten
  );

export const parseHouseholdInvitationLink = (
  link: string
): O.Option<HouseholdInvitationQueryParams> => {
  const { path, queryParams } = Linking.parse(link);
  return pipe(
    path,
    O.fromPredicate(p => !!p && p.includes(HOUSEHOLD_INVITATION_LINK)), // NB: includes necessary since the link is prefixed with `--/`
    O.chain(() => O.fromNullable(queryParams as HouseholdInvitationQueryParams))
  );
};
