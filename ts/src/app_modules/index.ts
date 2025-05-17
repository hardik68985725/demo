import { dummycrud_module } from "./dummycrud/dummycrud.module";
import { auth_module } from "./auth/auth.module";
import { user_module } from "./user/user.module";
import { role_module } from "./role/role.module";
import { organization_module } from "./organization/organization.module";
import { gateway_module } from "./gateway/gateway.module";
import { product_module } from "./product/product.module";
import { group_module } from "./group/group.module";
import { location_module } from "./location/location.module";
import { plu_module } from "./plu/plu.module";
import { sales_module } from "./sales/sales.module";
import { device_module } from "./device/device.module";
import { device_data_module } from "./device_data/device_data.module";
import { kpi_module } from "./kpi/kpi.module";

export default [
  dummycrud_module,
  auth_module,
  user_module,
  role_module,
  organization_module,
  gateway_module,
  product_module,
  group_module,
  location_module,
  plu_module,
  sales_module,
  device_module,
  device_data_module,
  kpi_module
];
