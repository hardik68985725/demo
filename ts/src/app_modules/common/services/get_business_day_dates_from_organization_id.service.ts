import { Connection } from "mongoose";
import { my_utc } from "@app_root/core/helpers";

const get_business_day_dates_from_organization_id = async (
  _db_connection: Connection,
  _organization_id: string,
  _start_date: string
) => {
  // Validate _start_date and set default if invalid
  if (
    !(
      _start_date &&
      _start_date.trim().length > 0 &&
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(_start_date.trim())
    )
  ) {
    _start_date = my_utc().format("YYYY-MM-DD");
  }
  const _end_date = my_utc(_start_date).format("YYYY-MM-DD");

  if (!_db_connection) {
    return {
      start_date_time: my_utc(_start_date).toDate(),
      end_date_time: my_utc(_end_date).toDate()
    };
  }

  // Fetch organization details
  const query_organization = (await _db_connection.models.organization
    .findById(_organization_id.toString().trim())
    .select({ business_day: 1 })
    .lean()
    .exec()) as Record<string, any>;

  if (!(query_organization && query_organization.business_day)) {
    return {
      start_date_time: my_utc(_start_date).toDate(),
      end_date_time: my_utc(_end_date).toDate()
    };
  }

  const business_day = query_organization.business_day;
  const start_day = my_utc(_start_date).format("dddd").toLowerCase();
  const end_day = my_utc(_end_date).format("dddd").toLowerCase();

  const start_time = business_day[start_day]?.start_at || "00:00";
  const end_time = business_day[end_day]?.end_at || "23:59";

  // Calculate start_date_time and end_date_time using concat()
  const start_date_time_str = _start_date.concat(" ", start_time);
  const end_date_time_str = _end_date.concat(" ", end_time);

  let start_date_time = my_utc(start_date_time_str);
  let end_date_time = my_utc(end_date_time_str);

  // Adjust end_date_time if it's before start_date_time
  if (start_date_time.isAfter(end_date_time)) {
    end_date_time = end_date_time.add(1, "day");
  }

  // Calculate previous day and next day for reference times
  const previous_date = my_utc(_start_date).subtract(1, "day");
  const next_date = my_utc(_start_date).add(1, "day");

  const previous_day_name = previous_date.format("dddd").toLowerCase();
  const next_day_name = next_date.format("dddd").toLowerCase();

  // Previous day business times (use fallback if not defined)
  let previous_start_time =
    business_day[previous_day_name]?.start_at || "00:00";
  let previous_end_time = business_day[previous_day_name]?.end_at || "23:59";

  const previous_start_time_date = my_utc(
    previous_date.format("YYYY-MM-DD").concat(" ", previous_start_time)
  );
  let previous_end_time_date = my_utc(
    previous_date.format("YYYY-MM-DD").concat(" ", previous_end_time)
  );

  if (previous_start_time_date.isAfter(previous_end_time_date)) {
    previous_end_time_date = previous_end_time_date.add(1, "day");
  }

  // Next day start time (use fallback if not defined)
  const next_start_time_str = next_date
    .format("YYYY-MM-DD")
    .concat(" ", business_day[next_day_name]?.start_at || "00:00");

  let next_start_time = my_utc(next_start_time_str);

  return {
    previous_end_time: previous_end_time_date.toDate(),
    start_date_time: start_date_time.toDate(),
    end_date_time: end_date_time.toDate(),
    next_start_time: next_start_time.toDate()
  };
};

export { get_business_day_dates_from_organization_id };
