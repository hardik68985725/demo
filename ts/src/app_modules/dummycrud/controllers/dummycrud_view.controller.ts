import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { dummycrud_view_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_view.validator";
import { my_type } from "@app_root/core/helpers";

const dummycrud_view_controller: TController = {
  method: "get",
  route_path: "/:_id",
  middlewares: [mw_validator(dummycrud_view_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_dummycrud: Record<string, string> = {};
    if (validated_input_data?._id) {
      query_dummycrud._id = validated_input_data._id;
    }
    if (my_type.is_an_empty_object(query_dummycrud)) {
      return { _data: null };
    }

    const query_dummycrud_data =
      (await req.app_data.db_connection.models.dummycrud
        .findById(query_dummycrud._id)
        .select({ _id: 1, dummycrud: 1 })
        .lean()
        .exec()) as Record<string, string>;

    return { _data: query_dummycrud_data };
  }
};

export { dummycrud_view_controller };
