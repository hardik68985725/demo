import { is_valid_json } from "./my_type.helper";

const json_to_csv = (_json: Array<Record<string, unknown>>) => {
  if (!(is_valid_json(_json) && Array.isArray(_json))) {
    return;
  }

  const csv_data = [];
  for (const v_data of _json) {
    if (csv_data.length === 0) {
      csv_data[csv_data.length] = Object.keys(v_data).join(",");
    }
    csv_data[csv_data.length] = Object.values(v_data).join(",");
  }
  return csv_data.join("\n");
};

export { json_to_csv };
