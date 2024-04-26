const path = require('path');
const date = require('date-and-time');

const getFileBaseName = (fileUrl) => {
  return path.basename(fileUrl);
};

const addTimeStampToName = (fileNameWithExtension) => {
  const fileNameNormalized = path
    .parse(fileNameWithExtension)
    .name.replace(/[^a-zA-Z0-9]/g, '');
  const fileExtension = path.parse(fileNameWithExtension).ext;
  const now = new Date();
  const timeNow = date.format(now, 'YYYY-MM-DD-HH_mm_ss');
  return `${fileNameNormalized}-${timeNow}${fileExtension}`;
};

module.exports = { addTimeStampToName, getFileBaseName };
