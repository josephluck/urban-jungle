import { IErr } from "@urban-jungle/shared/utils/err";
import * as functions from "firebase-functions";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

type ResponseError = {
  status: number;
  code: IErr;
};

type ResponseSuccess<Data> = {
  status: number;
  data: Data;
};

export const responseSuccess = (response: functions.Response, status = 200) => <
  Data
>(
  data: Data
): ResponseSuccess<Data> => {
  const body: ResponseSuccess<Data> = {
    status,
    data,
  };
  response.status(200);
  response.send(body);
  return body;
};

export const responseError = (response: functions.Response) => (
  err: IErr
): ResponseError => {
  const body: ResponseError = {
    status: errToStatus[err],
    code: err,
  };
  response.status(errToStatus[err]);
  response.send(body);
  return body;
};

export const logSuccess = (status = 200) => <Data>(
  data: Data
): ResponseSuccess<Data> => {
  const body: ResponseSuccess<Data> = {
    status,
    data,
  };
  console.log(body);
  return body;
};

export const logError = () => (err: IErr): ResponseError => {
  const body: ResponseError = {
    status: errToStatus[err],
    code: err,
  };
  console.log(body);
  return body;
};

const errToStatus: Record<IErr, number> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHENTICATED: 403,
  UNKNOWN: 500,
  VALIDATION: 400,
  HANDLED: 200,
};

export const callWithLogging = (fn: TE.TaskEither<IErr, any>) =>
  pipe(fn, TE.mapLeft(logError()), TE.map(logSuccess()))();

export const callWithResponse = (
  fn: TE.TaskEither<IErr, any>,
  response: functions.Response
) =>
  pipe(
    fn,
    TE.mapLeft(responseError(response)),
    TE.map(responseSuccess(response))
  )();
