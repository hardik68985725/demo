import { user_create_controller } from "./user_create.controller";
import { user_read_controller } from "./user_read.controller";
import { user_view_controller } from "./user_view.controller";
import { user_update_controller } from "./user_update.controller";
import { user_update_profile_controller } from "./user_update_profile.controller";
import { user_set_password_controller } from "./user_set_password.controller";
import { user_reset_password_request_controller } from "./user_reset_password_request.controller";

export default [
  user_create_controller,
  user_read_controller,
  user_view_controller,
  user_update_controller,
  user_update_profile_controller,
  user_set_password_controller,
  user_reset_password_request_controller
];
