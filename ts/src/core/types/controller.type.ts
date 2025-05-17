type TAllowedMethods = "post" | "get" | "patch" | "delete";

export type TController = {
  is_disabled: boolean;
  is_auth_required: boolean;
  method: TAllowedMethods;
  route_path: string;
  middlewares: Array<Function>;
  controller: Function;
};
