const jsonToCsv = (jsonArray: Record<string, unknown>[]) => {
  if (!jsonArray || !Array.isArray(jsonArray) || jsonArray.length === 0) {
    return;
  }

  const csvData = [];
  for (const json of jsonArray) {
    if (csvData.length === 0) {
      csvData[csvData.length] = Object.keys(json).join(",");
    }
    csvData[csvData.length] = Object.values(json).join(",");
  }
  return csvData.join("\n");
};

export { jsonToCsv };
