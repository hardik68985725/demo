import { Request } from "express";
import { hashSync } from "bcrypt";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { organization_update_validator } from "@app_root/app_modules/organization/validators/organization_update.validator";
import { my_db, myUTC } from "@app_root/core/helpers";

const organization_update_controller: TController = {
  method: "patch",
  routePath: "/:_id",
  middlewares: [mw_validator(organization_update_validator, true)],
  controller: async (req: Request) => {
    if (req.appData.auth.user!.organization) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryOrganization: TDocumentOrQuery = {
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };

    const queryOrganizationDataById =
      await req.appData.dbConnection!.collections.organizations.findOne(
        queryOrganization,
        { projection: { _id: 1 } }
      );
    if (!queryOrganizationDataById?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "invalid_organization",
        _message: "Organization is invalid."
      };
    }

    const updatedOrganizationData =
      await req.appData.dbConnection!.collections.organizations.findOneAndUpdate(
        queryOrganization,
        {
          $set: {
            updated_at: myUTC().toJSDate(),
            updated_by: req.appData.auth.user!._id,
            name: validatedInputData.name,
            address: validatedInputData.address
          }
        },
        { returnDocument: "after", projection: { _id: 0, owner: 1 } }
      );

    const updateUserData: TDocumentOrQuery = {
      updated_at: myUTC().toJSDate(),
      updated_by: req.appData.auth.user!._id,
      name: validatedInputData.owner.name,
      address: validatedInputData.owner.address,
      mobile_phone_number: validatedInputData.owner.mobile_phone_number
    };
    if (validatedInputData.owner.password) {
      updateUserData.password = hashSync(
        validatedInputData.owner.password,
        parseInt(process.env.HASH_SALT_ROUNDS!, 10)
      );
    }

    await req.appData.dbConnection!.collections.users.updateOne(
      { _id: updatedOrganizationData!.owner },
      { $set: updateUserData }
    );

    return { _message: "Organization updated successfully." };
  }
};

export { organization_update_controller };
