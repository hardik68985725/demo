import { Request } from "express";
import { compareSync, hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { auth_create_validator } from "@app_root/app_modules/auth/validators/auth_create.validator";
import { my_type, my_utc } from "@app_root/core/helpers";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";

const auth_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [mw_validator(auth_create_validator, true)],
  is_disabled: false,
  is_auth_required: false,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const query_user_data = (
      await req.app_data.db_connection.models.user
        .aggregate([
          { $match: { email: validated_input_data?.email } },
          {
            $lookup: {
              from: "organizations",
              localField: "organization",
              foreignField: "_id",
              as: "organization"
            }
          },
          {
            $unwind: { path: "$organization", preserveNullAndEmptyArrays: true }
          },
          {
            $project: {
              password: 1,
              is_owner: 1,
              role: 1,
              "organization.subdomain": 1
            }
          }
        ])
        .exec()
    )[0];
    if (
      my_type.is_an_empty_object(query_user_data) ||
      !query_user_data?.password?.trim()
    ) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }

    // VERIFY WHETHER THE PASSWORD IS CORRECT AND WHETHER THE EMAIL ADDRESS IS PRESENT IN THE DATABASE
    const is_password_ok = compareSync(
      validated_input_data?.password,
      query_user_data.password
    );
    if (!is_password_ok) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }
    // /VERIFY WHETHER THE PASSWORD IS CORRECT AND WHETHER THE EMAIL ADDRESS IS PRESENT IN THE DATABASE

    // VERIFY WHETHER THE SUBDOMAIN IS CORRECT FOR GIVEN CREDENTIALS
    if (
      req.app_data.subdomain &&
      req.app_data.subdomain !== OrganizationEnums.EPreservedSubdomains.System
    ) {
      if (req.app_data.subdomain !== query_user_data.organization?.subdomain) {
        throw {
          _status: 400,
          _code: "invalid_credentials",
          _message:
            "Invalid credentials or Maybe Your Organization is Incorrect."
        };
      }
    }
    // /VERIFY WHETHER THE SUBDOMAIN IS CORRECT FOR GIVEN CREDENTIALS

    const query_auth: Record<string, string> = {
      created_by: query_user_data._id
    };
    if (validated_input_data?.useragent) {
      query_auth.useragent = validated_input_data?.useragent;
    }
    if (validated_input_data?.maca) {
      query_auth.maca = validated_input_data?.maca;
    }

    let query_auth_data: undefined | Record<string, string> =
      (await req.app_data.db_connection.models.auth
        .findOne(query_auth)
        .lean()
        .exec()) as Record<string, string>;

    // IF AUTH DATA IS ALREADY THERE THEN NEED TO CHECK IF IT IS EXPIRED OR NOT
    if (
      query_auth_data &&
      my_utc().isSameOrAfter(
        my_utc(query_auth_data.created_at).add(
          process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS,
          "ms"
        )
      )
    ) {
      // FIRST REMOVE EXISTING AUTH DATA TOKENS SO CAN CREATE NEW ONE
      await req.app_data.db_connection.models.auth.deleteMany({
        _id: query_auth_data._id
      });

      // FREE THE query_auth_data TO CREATE NEW ONE
      query_auth_data = undefined;
    }
    // /IF AUTH DATA IS ALREADY THERE THEN NEED TO CHECK IF IT IS EXPIRED OR NOT

    if (!query_auth_data) {
      // GENERATE TOKEN
      const _raw_token = `${query_user_data._id.toString().trim()}`;
      if (validated_input_data?.useragent) {
        _raw_token.concat("_", validated_input_data?.useragent);
      }
      if (validated_input_data?.maca) {
        _raw_token.concat("_", validated_input_data?.maca);
      }
      const token = hashSync(
        _raw_token,
        parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
      );
      // /GENERATE TOKEN

      // CREATE TOKEN IN DB
      query_auth_data = await req.app_data.db_connection.models.auth.create({
        token,
        ...query_auth
      });
      // /CREATE TOKEN IN DB
    }

    return {
      _data: {
        token: query_auth_data?.token,
        is_owner: query_user_data.is_owner,
        role: query_user_data.role
      }
    };
  }
};

export { auth_create_controller };
