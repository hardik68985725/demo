import { Request } from "express";
import { hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { my_db, my_ejs, my_nodemailer, utility } from "@app_root/core/helpers";
import { organization_create_validator } from "@app_root/app_modules/organization/validators/organization_create.validator";

const organization_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [
    mw_role("organization", "write"),
    mw_validator(organization_create_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (req.app_data.auth.organization?.toString().trim()) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_organization_data_by_subdomain =
      (await req.app_data.db_connection.models.organization
        .findOne({
          subdomain: my_db.get_regex_field_for_aggregation(
            validated_input_data?.subdomain
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_organization_data_by_subdomain?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.subdomain} is already exists.`
      };
    }

    const query_user_data_by_email =
      (await req.app_data.db_connection.models.user
        .findOne({ email: validated_input_data?.owner.email })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_user_data_by_email?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.owner.email} is already exists.`
      };
    }

    const new_organization =
      await req.app_data.db_connection.models.organization.insertMany({
        created_by: req.app_data.auth.created_by,
        subdomain: validated_input_data?.subdomain,
        name: validated_input_data?.name,
        address: validated_input_data?.address,
        business_day: validated_input_data?.business_day,
        timezone: validated_input_data?.timezone,
        currency: validated_input_data?.currency
      });
    if (
      new_organization &&
      Array.isArray(new_organization) &&
      new_organization.length > 0
    ) {
      const inserted_organization_user_owner_data =
        await req.app_data.db_connection.models.user.insertMany({
          created_by: req.app_data.auth.created_by,
          email: validated_input_data?.owner.email,
          is_owner: true,
          name: validated_input_data?.owner.name,
          address: validated_input_data?.owner.address,
          mobile_phone_number: validated_input_data?.owner.mobile_phone_number,
          set_password_token: {
            created_at: new Date(),
            token: hashSync(
              utility.get_random_password(),
              parseInt(process.env.HASH_SALTROUNDS as string, 10)
            )
          },
          organization: new_organization[0]._id
        });
      if (
        inserted_organization_user_owner_data &&
        Array.isArray(inserted_organization_user_owner_data) &&
        inserted_organization_user_owner_data.length > 0
      ) {
        await req.app_data.db_connection.models.organization.findByIdAndUpdate(
          new_organization[0]._id,
          {
            updated_by: req.app_data.auth.created_by,
            owner: inserted_organization_user_owner_data[0]._id
          }
        );

        // SEND AN EMAIL
        const email_subject = "Demo - Registration";
        const signin_url = (process.env.PROJECT_PUBLIC_URL as string)
          .toString()
          .trim()
          .split("//")
          .join("//".concat(validated_input_data?.subdomain, "."));
        const set_password_url = signin_url.concat(
          "/user/set-password?_spt=",
          inserted_organization_user_owner_data[0].set_password_token.token
        );
        const email_content = await my_ejs.render_email_template(
          "organization_create.ejs",
          email_subject,
          {
            signin_url,
            set_password_url,
            subdomain: validated_input_data?.subdomain
          }
        );

        if (email_content) {
          await my_nodemailer.send_an_email(
            validated_input_data?.owner.email,
            email_subject,
            email_content
          );
        }
        // /SEND AN EMAIL
      }
    }

    return { _message: "Organization created successfully." };
  }
};

export { organization_create_controller };
