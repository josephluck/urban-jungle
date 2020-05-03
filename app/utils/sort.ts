import { BaseModel } from "../models/base";

export const sortByMostRecent = (
  entityA: BaseModel,
  entityB: BaseModel
): number => entityB.dateCreated.toMillis() - entityA.dateCreated.toMillis();
