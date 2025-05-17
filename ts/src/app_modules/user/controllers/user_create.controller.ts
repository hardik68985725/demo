import { Request } from "express";
import { hashSync } from "bcryptjs";
import { my_ejs, my_nodemailer, utility } from "@app_root/core/helpers";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_create_validator } from "@app_root/app_modules/user/validators/user_create.validator";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";

const user_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [mw_validator(user_create_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_user_data = (await req.app_data.db_connection.models.user
      .findOne({ email: validated_input_data?.email })
      .select({ _id: 1 })
      .lean()
      .exec()) as Record<string, unknown>;
    if (query_user_data?._id) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.email} is already exists.`
      };
    }

    const query_role_data = (await req.app_data.db_connection.models.role
      .findOne({ _id: validated_input_data?.role })
      .select({ _id: 1, name: 1 })
      .lean()
      .exec()) as Record<string, unknown>;
    if (!query_role_data) {
      throw { _status: 403, _code: "not_exists", _message: "Role is invalid" };
    }

    const new_user_data: Record<string, unknown> = {
      created_by: req.app_data.auth.created_by,
      email: validated_input_data?.email,
      role: validated_input_data?.role,
      name: validated_input_data?.name,
      set_password_token: {
        token: hashSync(
          utility.get_random_password(),
          parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
        ),
        created_at: new Date()
      }
    };
    if (req.app_data.auth.is_organization_owner) {
      new_user_data.organization = req.app_data.auth.organization;
    }

    await req.app_data.db_connection.models.user.insertMany(new_user_data);

    // SEND AN EMAIL
    let subdomain: string = OrganizationEnums.EPreservedSubdomains.System;
    if (req.app_data.auth.is_organization_owner) {
      if (req.app_data.subdomain) {
        subdomain = req.app_data.subdomain;
      } else {
        const query_organization_data =
          (await req.app_data.db_connection.models.organization
            .findOne({ _id: req.app_data.auth.organization })
            .select({ _id: 1, subdomain: 1 })
            .lean()
            .exec()) as Record<string, string>;
        subdomain = query_organization_data.subdomain;
      }
    }
    const email_subject = "Demo - Registration";
    const signin_url = (process.env.PROJECT_PUBLIC_URL as string)
      .toString()
      .trim()
      .split("//")
      .join("//".concat(subdomain, "."));
    const set_password_url = signin_url.concat(
      "/user/set-password?_spt=",
      (new_user_data?.set_password_token as Record<string, string>)?.token
    );
    const email_content = await my_ejs.render_email_template(
      "user_create.ejs",
      email_subject,
      {
        signin_url,
        set_password_url,
        subdomain,
        role_name: query_role_data.name as string
      }
    );
    if (email_content) {
      await my_nodemailer.send_an_email(
        validated_input_data?.email,
        email_subject,
        email_content
      );
    }
    // /SEND AN EMAIL

    return {
      _message: `User has been created successfully with an email address ${validated_input_data?.email}.`
    };
  }
};

export { user_create_controller };
