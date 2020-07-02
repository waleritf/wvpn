function sleep(milliseconds) {
  return new Promise(res => setTimeout(res, milliseconds));
};

module.exports = sleep;
