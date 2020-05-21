import { IErr } from "@urban-jungle/shared/utils/err";
import * as functions from "firebase-functions";

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

const errToStatus: Record<IErr, number> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHENTICATED: 403,
  UNKNOWN: 500,
};
