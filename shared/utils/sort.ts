import { BaseModel } from "@urban-jungle/shared/models/base";

export const sortByMostRecent = (
  entityA: BaseModel,
  entityB: BaseModel
): number => entityB.dateCreated.toMillis() - entityA.dateCreated.toMillis();
