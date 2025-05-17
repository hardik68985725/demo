import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { dummycrud_view_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_view.validator";

const dummycrud_delete_controller: TController = {
  method: "delete",
  route_path: "/:_id",
  middlewares: [mw_validator(dummycrud_view_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    await req.app_data.db_connection.models.dummycrud
      .findByIdAndDelete(validated_input_data?._id)
      .select({ _id: 1 })
      .lean()
      .exec();

    return { _message: "Dummycrud deleted successfully." };
  }
};

export { dummycrud_delete_controller };
