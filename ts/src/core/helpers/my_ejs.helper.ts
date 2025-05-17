import { join } from "node:path";
import { existsSync } from "node:fs";
import { renderFile } from "ejs";
import { my_type } from "@app_root/core/helpers";

const template_vars = {
  project_public_link: `<a href="${process.env.PROJECT_PUBLIC_URL}" target="_blank" class="link-style">Demo</a>`
} as const;

const render_email_template = async (
  _template_name: string,
  _html_title: string,
  _data: Record<string, string>
) => {
  if (
    !(
      _template_name &&
      _template_name.toString().trim().length > 0 &&
      _html_title &&
      _html_title.toString().trim().length > 0 &&
      _data &&
      !my_type.is_an_empty_object(_data)
    )
  ) {
    __line__;
    console.my_log_point(
      "Enough parameters have not been passed. Template name, HTML title, and Data are required."
    );
    return;
  }

  _template_name = _template_name.toString().trim();
  _html_title = _html_title.toString().trim();
  // _data = { ..._data };

  const template_path = join(
    __root_path__,
    "views",
    "email-templates",
    "pages",
    _template_name
  );
  if (!existsSync(template_path)) {
    __line__;
    console.my_log_point(`The ${template_path} template is not found.`);
    return;
  }

  return await renderFile(
    join(__root_path__, "views", "email-templates", "template.ejs"),
    {
      ...template_vars,
      ..._data,
      html_title: _html_title,
      body: template_path
    },
    { async: true, rmWhitespace: true }
  );
};

export { render_email_template };
