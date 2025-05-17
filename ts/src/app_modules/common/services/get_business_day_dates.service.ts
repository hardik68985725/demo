import { Request } from "express";
import { my_utc } from "@app_root/core/helpers";

const get_business_day_dates = async (req: Request, _start_date?: string) => {
  // Validate _start_date and set default if invalid
  if (
    !(
      _start_date &&
      _start_date.toString().trim().length > 0 &&
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(_start_date.toString().trim())
    )
  ) {
    _start_date = my_utc().format("YYYY-MM-DD");
  }
  const _end_date = my_utc(_start_date).format("YYYY-MM-DD");

  // Fetch organization details
  const query_organization =
    (await req.app_data.db_connection.models.organization
      .findById(req.app_data.auth.organization.toString().trim())
      .select({ business_day: 1 })
      .lean()
      .exec()) as Record<string, any>; // Adjust type as needed

  if (!(query_organization && query_organization.business_day)) {
    return {
      start_date_time: my_utc(_start_date).toDate(),
      end_date_time: my_utc(_end_date).toDate()
    };
  }

  const business_day = query_organization.business_day;
  const day_name = my_utc(_start_date).format("dddd").toLowerCase();

  if (
    !(
      business_day[day_name] &&
      business_day[day_name].start_at &&
      business_day[day_name].end_at
    )
  ) {
    throw {
      _status: 400,
      _code: "business_day_not_set",
      _message: `Business hours for ${day_name} are not defined.`
    };
  }

  const start_time = business_day[day_name].start_at;
  const end_time = business_day[day_name].end_at;

  // Combine date and time strings using .concat()
  const start_date_time_str = _start_date.concat(" ", start_time);
  const end_date_time_str = _end_date.concat(" ", end_time);

  let start_date_time = my_utc(start_date_time_str);
  let end_date_time = my_utc(end_date_time_str);

  // Adjust end_date_time if it's before start_date_time (overnight shifts)
  if (start_date_time.isAfter(end_date_time)) {
    end_date_time = end_date_time.add(1, "day");
  }

  // Maintain the specified logic for calculating previous and next business day times
  const previous_date = my_utc(_start_date).subtract(1, "day");
  const next_date = my_utc(_start_date).add(1, "day");

  const previous_day_name = previous_date.format("dddd").toLowerCase();
  const next_day_name = next_date.format("dddd").toLowerCase();

  let previous_start_time = business_day[previous_day_name].start_at;
  let previous_end_time = business_day[previous_day_name].end_at;

  const previous_start_time_date = my_utc(
    my_utc(previous_date).format("YYYY-MM-DD").concat(" ", previous_start_time)
  );
  let previous_end_time_date = my_utc(
    my_utc(previous_date).format("YYYY-MM-DD").concat(" ", previous_end_time)
  );

  if (previous_start_time_date.isAfter(previous_end_time_date)) {
    previous_end_time_date = previous_end_time_date.add(1, "day");
  }

  const next_start_time_str = next_date
    .format("YYYY-MM-DD")
    .concat(" ", business_day[next_day_name].start_at);

  let next_start_time = my_utc(next_start_time_str);

  return {
    previous_end_time: previous_end_time_date.toDate(),
    start_date_time: start_date_time.toDate(),
    end_date_time: end_date_time.toDate(),
    next_start_time: next_start_time.toDate()
  };
};

export { get_business_day_dates };
