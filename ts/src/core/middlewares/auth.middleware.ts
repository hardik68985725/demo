import { NextFunction, Request, Response } from "express";
import { hashSync } from "bcryptjs";
import { my_type, my_utc } from "@app_root/core/helpers";

const mw_auth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers["authorization"];
    if (!(authorization && authorization.trim())) {
      throw {
        _status: 401,
        _code: "required_token",
        _message: "Required token"
      };
    }
    const bearer = authorization.split(" ");
    const token = bearer[1] || undefined;
    if (!(token && token.trim())) {
      throw { _status: 401, _code: "invalid_token", _message: "Invalid token" };
    }

    const query_auth: Record<string, string> = { token };
    if (req.app_data.useragent) {
      query_auth.useragent = JSON.stringify(req.app_data.useragent);
    }
    if (req.app_data.maca) {
      query_auth.maca = req.app_data.maca;
    }

    const query_auth_data = (
      await req.app_data.db_connection.models.auth
        .aggregate([
          { $match: { ...query_auth } },
          {
            $lookup: {
              from: "users",
              localField: "created_by",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                    pipeline: [{ $project: { _id: 1, have_rights: 1 } }]
                  }
                },
                {
                  $unwind: { path: "$role", preserveNullAndEmptyArrays: true }
                },
                {
                  $project: {
                    _id: 1,
                    email: 1,
                    is_owner: 1,
                    role: 1,
                    organization: 1
                  }
                }
              ]
            }
          },
          { $unwind: { path: "$user" } },
          { $project: { created_by: 1, created_at: 1, user: 1 } }
        ])
        .exec()
    )[0];

    if (!query_auth_data || my_type.is_an_empty_object(query_auth_data)) {
      throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
    }

    if (
      my_utc().isSameOrAfter(
        my_utc(query_auth_data.created_at).add(
          process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS,
          "ms"
        )
      )
    ) {
      // GENERATE TOKEN
      const token = hashSync(
        `${query_auth_data.user._id.toString().trim()}_${query_auth.useragent}_${query_auth.maca}`,
        parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
      );
      // /GENERATE TOKEN

      // UPDATE TOKEN DATA IN DB.
      await req.app_data.db_connection.models.auth
        .updateOne(
          { _id: query_auth_data._id },
          { token, created_at: my_utc().toDate() },
          { timestamps: { createdAt: false }, strict: false }
        )
        .exec();
      // /UPDATE TOKEN DATA IN DB.

      throw {
        _status: 401,
        _code: "token_expired",
        _message: "Token expired",
        _data: { token }
      };
    }

    req.app_data.auth.created_by = query_auth_data.created_by;

    if (query_auth_data.user.organization) {
      req.app_data.auth.organization = query_auth_data.user.organization;
    }

    if (query_auth_data.user.is_owner) {
      if (query_auth_data.user.organization) {
        req.app_data.auth.is_organization_owner = true;
      } else {
        req.app_data.auth.is_system_owner = true;
      }
    } else if (query_auth_data.user.role) {
      req.app_data.auth.role = query_auth_data.user.role;
    }

    req.app_data.auth.user = query_auth_data.user;
  } catch (error) {
    return next(error);
  }
  return next();
};

export { mw_auth };
