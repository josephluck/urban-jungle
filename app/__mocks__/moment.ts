const moment = require.requireActual("moment");

import MockDate from "mockdate";

export const defaultDate = "2020-01-01";

const mockedMoment = (timestamp = defaultDate, format?: boolean) => {
  MockDate.set(defaultDate);
  return moment(timestamp, format);
};

Object.assign(mockedMoment.prototype, moment.prototype);

Object.keys(moment).forEach((key) => {
  (mockedMoment as any)[key] = moment[key];
});

export default mockedMoment;
