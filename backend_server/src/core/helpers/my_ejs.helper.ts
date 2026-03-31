import { join } from "node:path";
import { existsSync } from "node:fs";
import { renderFile } from "ejs";
import { my_type } from "@app_root/core/helpers";

const templateVars = {
  app_public_link: `<a href="${process.env.APP_PUBLIC_URL}" target="_blank" class="link-style">Backend Server Demo</a>`
} as const;

const renderEmailTemplate = async (
  templateName: string,
  htmlTitle: string,
  data: Record<string, string>
) => {
  if (
    !templateName ||
    !templateName.toString().trim().length ||
    !htmlTitle ||
    !htmlTitle.toString().trim().length ||
    !data ||
    my_type.isAnEmptyObject(data)
  ) {
    __line__;
    myLogger.error(
      "Enough parameters have not been passed. Template name, HTML title, and Data are required."
    );
    return;
  }

  templateName = templateName.toString().trim();
  htmlTitle = htmlTitle.toString().trim();
  // data = { ...data };

  const templatePath = join(
    __root_path__,
    "views",
    "email-templates",
    "pages",
    templateName
  );
  if (!existsSync(templatePath)) {
    __line__;
    myLogger.error(`The ${templatePath} template is not found.`);
    return;
  }

  return await renderFile(
    join(__root_path__, "views", "email-templates", "template.ejs"),
    {
      ...templateVars,
      ...data,
      html_title: htmlTitle,
      body: templatePath
    },
    { async: true, rmWhitespace: true }
  );
};

export { renderEmailTemplate };
