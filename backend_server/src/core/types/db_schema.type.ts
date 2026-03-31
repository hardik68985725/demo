const DbSchemaMap = {
  dummycruds: "dummycruds",
  users: "users",
  roles: "roles",
  auths: "auths",
  organizations: "organizations"
} as const;

type ValueOf<T> = T[keyof T];
export type TDbSchema = ValueOf<typeof DbSchemaMap>;
export const dbSchemas: TDbSchema[] = Object.values(DbSchemaMap);
