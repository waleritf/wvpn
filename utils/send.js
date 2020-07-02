function send(object, commands) {
  let accumulator = object;

  for (let command of commands) {
    accumulator = accumulator[command];
  }

  return accumulator;
}

module.exports = send;
