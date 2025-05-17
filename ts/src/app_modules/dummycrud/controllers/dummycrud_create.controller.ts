import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db } from "@app_root/core/helpers";
import { dummycrud_create_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_create.validator";

const dummycrud_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [mw_validator(dummycrud_create_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_dummycrud_data =
      (await req.app_data.db_connection.models.dummycrud
        .findOne({
          dummycrud: my_db.get_regex_field_for_aggregation(
            validated_input_data?.dummycrud
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;

    if (query_dummycrud_data?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.dummycrud} is already exists.`
      };
    }

    await req.app_data.db_connection.models.dummycrud.insertMany({
      created_by: req.app_data.auth.created_by,
      dummycrud: validated_input_data?.dummycrud
    });

    return { _message: "Dummycrud created successfully." };
  }
};

export { dummycrud_create_controller };
