import { dummycrud_module } from "./dummycrud/dummycrud.module";
import { user_module } from "./user/user.module";
import { role_module } from "./role/role.module";
import { auth_module } from "./auth/auth.module";
import { organization_module } from "./organization/organization.module";

export default [
  dummycrud_module,
  user_module,
  role_module,
  auth_module,
  organization_module
];
