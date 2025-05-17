import { product_create_controller } from "./product_create.controller";
import { product_read_controller } from "./product_read.controller";
import { product_view_controller } from "./product_view.controller";
import { product_update_controller } from "./product_update.controller";
import { product_delete_controller } from "./product_delete.controller";
import { product_status_change_controller } from "./product_status_change.controller";
import { product_clone_to_organization_controller } from "./product_clone_to_organization.controller";

export default [
  product_create_controller,
  product_read_controller,
  product_view_controller,
  product_update_controller,
  product_delete_controller,
  product_status_change_controller,
  product_clone_to_organization_controller
];
