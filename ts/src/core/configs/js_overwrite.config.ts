(() => {
  // OVERWRITE CONSOLE.
  const console_log = console.log;

  console.my_log_point = (...args: Array<string>) => {
    if (args && args.length) {
      console_log("APP_LOG_POINT -", ...args);
    }
  };
  // /OVERWRITE CONSOLE.
})();
