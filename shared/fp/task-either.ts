import { sequenceS, sequenceT } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import { array } from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { IErr } from "../utils/err";

export const validationTE = TE.getTaskValidation(A.getMonoid<IErr>());

export const traverseTE = array.traverse(validationTE);

export const sequenceSTE = sequenceS(TE.taskEither);

export const sequenceTE = sequenceT(TE.taskEither);
