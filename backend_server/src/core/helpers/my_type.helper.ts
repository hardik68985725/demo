const getBoolean = (value: unknown) => {
  const str = String(value ?? "").trim();
  const falsy_expression = /^(?:f(?:alse)?|no?|0+)$/i;
  return !!str && !falsy_expression.test(str);
};

/* const getBoolean = (value: unknown, defaultValue = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(trimmed)) return true;
    if (["false", "0", "no"].includes(trimmed)) return false;
  }
  return defaultValue;
}; */

const isValidVariableName = (value: string | undefined) => {
  if (value && (typeof value).toLowerCase() === "string" && value.trim()) {
    return /^[a-z_]+[a-z0-9_]*$/i.test(value.trim());
  }

  return false;
};

const isAnObject = (value: unknown): value is Record<string, unknown> => {
  return (
    value !== null && typeof value === "object" && value.constructor === Object
  );
};

const isAnEmptyObject = (value: unknown) => {
  return !isAnObject(value) || Object.keys(value as Object).length === 0;
};

const isValidJson = (
  value: unknown,
  isReturnParsed: boolean = false
): boolean | Record<string, unknown> | unknown[] => {
  if (typeof value !== "string") return false;

  try {
    const parsed = JSON.parse(value);

    if (parsed !== null && typeof parsed === "object") {
      return isReturnParsed ? parsed : true;
    }
  } catch {
    return false;
  }

  return false;
};

export {
  getBoolean,
  isValidVariableName,
  isAnObject,
  isAnEmptyObject,
  isValidJson
};
