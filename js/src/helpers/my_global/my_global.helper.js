Object.defineProperty(global, "__line_number", {
  // EXAMPLE TO USE: console.log(__line_number);
  // EXAMPLE TO USE: console.log(`At ${__line_number.filepath} on line ${__line_number.line}.`);
  get: function () {
    const return_data = {};

    const origin = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    const _error = new Error();
    Error.captureStackTrace(_error, arguments.callee);

    const stack = _error.stack[0];
    Error.prepareStackTrace = origin;

    return_data.filepath = stack.getFileName();
    return_data.line = stack.getLineNumber();
    return_data.column = stack.getColumnNumber();

    return return_data;
  },
});

Object.defineProperty(global, "__line_number_print", {
  // EXAMPLE TO USE: __line_number_print;
  get: function () {
    const return_data = {};

    const origin = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    const _error = new Error();
    Error.captureStackTrace(_error, arguments.callee);

    const stack = _error.stack[0];
    Error.prepareStackTrace = origin;

    return_data.filepath = stack.getFileName();
    return_data.line = stack.getLineNumber();
    return_data.column = stack.getColumnNumber();

    console.log(`At ${return_data.filepath} on line ${return_data.line}.`);

    return undefined;
  },
});
