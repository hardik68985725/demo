import { Request } from "express";
import { TController } from "@app_root/core/types";
import { hashSync } from "bcrypt";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { utility, myUTC } from "@app_root/core/helpers";
import { organization_create_validator } from "@app_root/app_modules/organization/validators/organization_create.validator";

const organization_create_controller: TController = {
  method: "post",
  routePath: "/",
  middlewares: [mw_validator(organization_create_validator, true)],
  controller: async (req: Request) => {
    if (req.appData.auth.user!.organization) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryOrganizationDataBySubdomain =
      await req.appData.dbConnection!.collections.organizations.findOne(
        { subdomain: validatedInputData.name },
        { projection: { _id: 1 } }
      );
    if (queryOrganizationDataBySubdomain?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.name} is already exists.`
      };
    }

    const queryUserDataByEmail =
      await req.appData.dbConnection!.collections.users.findOne(
        { email: validatedInputData.owner.email },
        { projection: { _id: 1 } }
      );
    if (queryUserDataByEmail?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.owner.email} is already exists.`
      };
    }

    const newOrganizationData =
      await req.appData.dbConnection!.collections.organizations.insertOne({
        create_at: myUTC().toJSDate(),
        created_by: req.appData.auth.user!._id,
        subdomain: validatedInputData.subdomain,
        name: validatedInputData.name,
        address: validatedInputData.address
      });
    if (newOrganizationData?.insertedId) {
      const newOrganizationUserOwnerData =
        await req.appData.dbConnection!.collections.users.insertOne({
          create_at: myUTC().toJSDate(),
          created_by: req.appData.auth.user!._id,
          organization: newOrganizationData.insertedId,
          email: validatedInputData.owner.email,
          name: validatedInputData.owner.name,
          address: validatedInputData.owner.address,
          mobile_phone_number: validatedInputData.owner.mobile_phone_number,
          set_password_token: {
            created_at: myUTC().toJSDate(),
            token: hashSync(
              utility.getRandomPassword(),
              parseInt(process.env.HASH_SALT_ROUNDS!, 10)
            )
          }
        });
      if (newOrganizationUserOwnerData?.insertedId) {
        await req.appData.dbConnection!.collections.organizations.updateOne(
          { _id: newOrganizationData.insertedId },
          {
            $set: {
              updated_by: req.appData.auth.user!._id,
              owner: newOrganizationUserOwnerData.insertedId
            }
          }
        );
      }
    }

    return { _message: "Organization created successfully." };
  }
};

export { organization_create_controller };
