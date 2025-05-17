import { NextFunction, Request } from "express";
import Joi from "joi";
import { my_joi, get_validation_error_messages } from "@app_root/core/helpers";

const mw_validator = (
  _validation_middleware_function: Function,
  _is_throw_an_error: boolean = false
) => {
  return async (req: Request, _res: unknown, next: NextFunction) => {
    try {
      const validated_input_data = await (
        _validation_middleware_function(req) as Joi.ObjectSchema
      )
        .messages(my_joi.get_messages_list())
        .validateAsync(
          { ...req.app_data.validation_data.input_data },
          { ...my_joi.get_default_validate_options() }
        );

      req.app_data.validation_data = {
        validated_input_data,
        uploaded_file_list: req.app_data.validation_data.uploaded_file_list
      };
    } catch (error) {
      req.app_data.validation_data = {
        validation_errors: get_validation_error_messages(
          (error as Joi.ValidationError)?.details
        )
      };

      if (_is_throw_an_error) {
        return next({
          _status: 400,
          _code: "bad_input",
          _message: req.app_data.validation_data.validation_errors
        });
      }
    }

    return next();
  };
};

export { mw_validator };
