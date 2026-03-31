import { Request } from "express";
import { compareSync, hashSync } from "bcrypt";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_update_profile_validator } from "@app_root/app_modules/user/validators/user_update_profile.validator";

const user_update_profile_controller: TController = {
  method: "patch",
  routePath: "/",
  middlewares: [mw_validator(user_update_profile_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryUserData =
      await req.appData.dbConnection!.collections.users.findOne(
        { _id: req.appData.auth.user!._id },
        { projection: { password: 1 } }
      );
    if (!queryUserData?.password) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }

    const isPasswordOk = compareSync(
      validatedInputData.password,
      queryUserData.password
    );
    if (!isPasswordOk) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }

    const updateUserData: TDocumentOrQuery = {
      mobile_phone_number: validatedInputData.mobile_phone_number,
      name: validatedInputData.name,
      birth_date: validatedInputData.birth_date,
      gender: validatedInputData.gender,
      address: validatedInputData.address
    };
    if (validatedInputData.new_password) {
      updateUserData.password = hashSync(
        validatedInputData.new_password,
        parseInt(process.env.HASH_SALT_ROUNDS!, 10)
      );
    }

    await req.appData.dbConnection!.collections.users.updateOne(
      { _id: req.appData.auth.user!._id },
      { $set: updateUserData }
    );

    return { _message: "Updated successfully." };
  }
};

export { user_update_profile_controller };
