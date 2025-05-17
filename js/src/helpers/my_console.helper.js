const {
  my_type: { get_boolean },
} = require("./my_type.helper");

const reset_console = (_is_reset_light) => {
  if (process.env.RESET_CONSOLE == 1) {
    process.stdout.write(
      get_boolean(_is_reset_light)
        ? "\x1B[H\x1B[2J"
        : "\x1B[2J\x1B[3J\x1B[H\x1Bc"
    ); // RESET CONSOLE
  }
};

module.exports.my_console = { reset_console };
