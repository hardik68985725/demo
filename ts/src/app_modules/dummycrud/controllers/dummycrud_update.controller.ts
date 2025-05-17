import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { dummycrud_update_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_update.validator";
import { my_type, my_db } from "@app_root/core/helpers";

const dummycrud_update_controller: TController = {
  method: "patch",
  route_path: "/:_id",
  middlewares: [mw_validator(dummycrud_update_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_dummycrud_by_id: Record<string, string> = {};
    if (validated_input_data?._id) {
      query_dummycrud_by_id._id = validated_input_data._id;
    }
    if (my_type.is_an_empty_object(query_dummycrud_by_id)) {
      return { _data: null };
    }

    const query_dummycrud_data_by_id =
      (await req.app_data.db_connection.models.dummycrud
        .findOne({ _id: query_dummycrud_by_id._id })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (!query_dummycrud_data_by_id?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "invalid_dummycrud",
        _message: "Dummycrud is invalid."
      };
    }

    const query_dummycrud_data_by_dummycrud =
      (await req.app_data.db_connection.models.dummycrud
        .findOne({
          dummycrud: my_db.get_regex_field_for_aggregation(
            validated_input_data?.dummycrud
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_dummycrud_data_by_dummycrud) {
      if (
        !new my_db.mongodb_objectid(
          query_dummycrud_data_by_dummycrud._id
        ).equals(query_dummycrud_data_by_id._id)
      ) {
        throw {
          _status: 400,
          _code: "already_exists",
          _message: `${validated_input_data?.dummycrud} is already exists.`
        };
      }
    }

    await req.app_data.db_connection.models.dummycrud
      .findByIdAndUpdate(query_dummycrud_by_id._id, {
        dummycrud: validated_input_data?.dummycrud
      })
      .exec();

    return { _message: "Dummycrud updated successfully." };
  }
};

export { dummycrud_update_controller };
