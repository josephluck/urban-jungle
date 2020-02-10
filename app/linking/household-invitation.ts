import { Linking } from "expo";
import * as TE from "fp-ts/lib/TaskEither";
import { IErr } from "../utils/err";
import { getInitialDeepLink } from "./deep-linking";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";

const HOUSEHOLD_INVITATION_LINK = "auth/to-household";

type HouseholdInvitationQueryParams = { householdId: string };

export const makeHouseholdInvitationDeepLink = (householdId: string) =>
  Linking.makeUrl(HOUSEHOLD_INVITATION_LINK, {
    householdId
  } as HouseholdInvitationQueryParams);

export const getAndParseInitialHouseholdInvitationDeepLink = (): TE.TaskEither<
  IErr,
  HouseholdInvitationQueryParams
> =>
  pipe(
    getInitialDeepLink(),
    TE.map(link =>
      pipe(
        parseHouseholdInvitationDeepLink(link),
        TE.fromOption(() => "NOT_FOUND" as IErr)
      )
    ),
    TE.flatten
  );

export const parseHouseholdInvitationDeepLink = (
  link: string
): O.Option<HouseholdInvitationQueryParams> => {
  const { path, queryParams } = Linking.parse(link);
  return pipe(
    path,
    O.fromPredicate(p => !!p && p.includes(HOUSEHOLD_INVITATION_LINK)), // NB: includes necessary since the link is prefixed with `--/`
    O.chain(() => O.fromNullable(queryParams as HouseholdInvitationQueryParams))
  );
};
