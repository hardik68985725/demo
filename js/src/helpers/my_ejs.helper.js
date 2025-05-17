const path = require("node:path");
const { existsSync, writeFile } = require("node:fs");
const { renderFile } = require("ejs");

const {
  my_type: { is_an_empty_object },
} = require("./my_type.helper");

const template_vars = Object.freeze({
  project_public_link: `<a href="${process.env.PROJECT_PUBLIC_URL}" target="_blank" class="link-style">Demo</a>`,
});

const render_email_template = async (_template_name, _html_title, _data) => {
  if (
    !(
      _template_name &&
      _template_name.toString().trim().length > 0 &&
      _html_title &&
      _html_title.toString().trim().length > 0 &&
      _data &&
      !is_an_empty_object(_data)
    )
  ) {
    throw {
      _message:
        "Enough parameters have not been passed. Template name, HTML title, and Data are required.",
    };
  }

  _template_name = _template_name.toString().trim();
  _html_title = _html_title.toString().trim();
  // _data = { ..._data };

  const template_path = path.join(
    __root_path,
    "views",
    "email-templates",
    "pages",
    _template_name
  );

  if (!existsSync(template_path)) {
    throw { _message: `The ${template_path} template is not found.` };
  }

  const html_content = await renderFile(
    path.join(__root_path, "views", "email-templates", "template.ejs"),
    {
      ...template_vars,
      ..._data,
      html_title: _html_title,
      body: template_path,
    },
    { async: true, rmWhitespace: true }
  );

  if (process.env.ENV_NAME === "development") {
    writeFile(
      path.join(process.env.MEDIA_UPLOAD_DIRECTORY, `${_template_name}.html`),
      html_content,
      () => {}
    );
  }

  return html_content;
};

module.exports.my_ejs = { render_email_template };
