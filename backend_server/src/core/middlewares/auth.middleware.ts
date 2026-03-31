import { NextFunction, Request, Response } from "express";
import { hashSync } from "bcrypt";
import { TDocumentOrQuery } from "@app_root/core/types";
import { my_db, my_type, myUTC } from "@app_root/core/helpers";

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

    const queryAuth: TDocumentOrQuery = { token };
    if (req.appData.useragent) {
      queryAuth.useragent = JSON.stringify(req.appData.useragent);
    }

    if (!req.appData.dbConnection) {
      req.appData.dbConnection = await my_db.connectToDb(process.env.DB_NAME);
    }

    const queryAuthData = (
      await req.appData
        .dbConnection!.collections.auths.aggregate([
          { $match: { ...queryAuth } },
          {
            $lookup: {
              from: "users",
              localField: "created_by",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $lookup: {
                    from: "organizations",
                    localField: "organization",
                    foreignField: "_id",
                    as: "organization",
                    let: { v_userId: "$_id" },
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          isOwner: {
                            $cond: [
                              { $eq: ["$$v_userId", "$owner"] },
                              true,
                              "$$REMOVE"
                            ]
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  $unwind: {
                    path: "$organization",
                    preserveNullAndEmptyArrays: true
                  }
                },
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
                { $project: { _id: 1, organization: 1, email: 1, role: 1 } }
              ]
            }
          },
          { $unwind: { path: "$user" } },
          { $project: { created_at: 1, user: 1 } }
        ])
        .toArray()
    )[0];

    if (my_type.isAnEmptyObject(queryAuthData)) {
      throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
    }

    if (
      myUTC() >=
      myUTC(queryAuthData.created_at).plus({
        milliseconds: parseInt(
          process.env.AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS!,
          10
        )
      })
    ) {
      // Generate token.
      const token = hashSync(
        `${queryAuthData.user._id.toString().trim()}_${queryAuth.useragent}`,
        parseInt(process.env.HASH_SALT_ROUNDS!, 10)
      );
      // /Generate token.

      // Update token data in db.
      await req.appData.dbConnection!.collections.auths.updateOne(
        { _id: queryAuthData._id },
        { $set: { created_at: myUTC().toJSDate(), token } }
      );
      // /Update token data in db.

      throw {
        _status: 401,
        _code: "token_expired",
        _message: "Token expired",
        _data: { token }
      };
    }

    req.appData.auth.user = queryAuthData.user;
  } catch (error) {
    return next(error);
  }
  return next();
};

export { mw_auth };
