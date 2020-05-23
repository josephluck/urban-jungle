import fs from "fs";
import moment from "moment";
import path from "path";

const makeReleaseDate = () => {
  const FILE_NAME = "release-date.json";
  const FILE_PATH = path.join(__dirname, `./${FILE_NAME}`);
  const releaseDate = moment().format("HHmmDMMYY");

  fs.writeFileSync(FILE_PATH, JSON.stringify({ releaseDate: releaseDate }), {
    encoding: "utf-8",
  });
};

makeReleaseDate();
