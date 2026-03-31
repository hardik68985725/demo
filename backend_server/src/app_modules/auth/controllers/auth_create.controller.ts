import { Request } from "express";
import { compareSync, hashSync } from "bcrypt";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { auth_create_validator } from "@app_root/app_modules/auth/validators/auth_create.validator";
import { my_db, my_type, myUTC } from "@app_root/core/helpers";

const auth_create_controller: TController = {
  method: "post",
  routePath: "/",
  isAuthRequired: false,
  middlewares: [mw_validator(auth_create_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryUserData = (
      await req.appData
        .dbConnection!.collections.users.aggregate([
          { $match: { email: validatedInputData.email } },
          { $project: { password: 1 } }
        ])
        .toArray()
    )[0];
    if (
      my_type.isAnEmptyObject(queryUserData) ||
      !queryUserData?.password?.trim()
    ) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials. No password."
      };
    }

    // Verify whether the password is correct and whether the email address is present in the database.
    const isPasswordOk = compareSync(
      validatedInputData.password,
      queryUserData.password
    );
    if (!isPasswordOk) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials. Invalid password."
      };
    }
    // /Verify whether the password is correct and whether the email address is present in the database.

    const queryAuth: TDocumentOrQuery = { created_by: queryUserData._id };
    if (validatedInputData.useragent) {
      queryAuth.useragent = validatedInputData.useragent;
    }

    let queryAuthData: TDocumentOrQuery | my_db.mongodbInsertOneResult =
      (await req.appData.dbConnection!.collections.auths.findOne(
        queryAuth
      )) as TDocumentOrQuery;

    // If auth data is already there then need to check if it is expired or not.
    if (
      queryAuthData &&
      myUTC() >=
        myUTC(queryAuthData.created_at as Date).plus({
          milliseconds: parseInt(
            process.env.AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS!,
            10
          )
        })
    ) {
      // First remove existing auth data tokens so can create new one.
      await req.appData.dbConnection!.collections.auths.deleteMany({
        _id: queryAuthData._id
      });

      // Free the queryAuthData to create new one.
      queryAuthData = undefined;
    }
    // /If auth data is already there then need to check if it is expired or not.

    if (!queryAuthData) {
      // Generate token.
      const token = hashSync(
        `${queryUserData._id.toString().trim()}_${validatedInputData.useragent}`,
        parseInt(process.env.HASH_SALT_ROUNDS!, 10)
      );
      // /Generate token.

      // Create token in db.
      queryAuthData =
        await req.appData.dbConnection!.collections.auths.insertOne({
          created_at: myUTC().toJSDate(),
          ...queryAuth,
          token
        });
      // /Create token in db.

      queryAuthData =
        (await req.appData.dbConnection!.collections.auths.findOne(
          { _id: queryAuthData.insertedId },
          { projection: { token: 1 } }
        )) as TDocumentOrQuery;
    }

    return { _data: { token: queryAuthData!.token, role: queryUserData.role } };
  }
};

export { auth_create_controller };
