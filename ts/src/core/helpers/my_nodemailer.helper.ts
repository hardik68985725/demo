import { createTransport, SendMailOptions } from "nodemailer";
import * as AWS from "@aws-sdk/client-ses";

const _get_nmses_transporter = () => {
  const ses_configuration: AWS.SESClientConfig = {
    // apiVersion: "2010-12-01",
    region: process.env.AWS_REGION
  };
  ses_configuration.credentials = {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY as string
  };
  return createTransport({
    SES: { aws: AWS, ses: new AWS.SES(ses_configuration) }
  });
};

const send_an_email = async (
  _to: string,
  _subject: string,
  _message: string,
  _attachments?: Array<Record<string, string>>
) => {
  if (process.env.ENV_NAME === "development") {
    return;
  }

  if (
    !(
      _to &&
      _to.toString().trim().length > 0 &&
      _subject &&
      _subject.toString().trim().length > 0 &&
      _message &&
      _message.toString().trim().length > 0
    )
  ) {
    return;
  }

  const attachments = [];
  if (_attachments && Array.isArray(_attachments) && _attachments.length > 0) {
    for (const _attachment of _attachments) {
      attachments[attachments.length] = {
        filename: _attachment.name,
        path: _attachment.path
      };
    }
  }

  try {
    const mail_options: SendMailOptions = {
      from: process.env.AWS_SES_FROM_EMAIL,
      to: [_to],
      subject: _subject,
      html: _message
    };
    if (attachments && attachments.length > 0) {
      mail_options.attachments = attachments;
    }

    return await _get_nmses_transporter().sendMail(mail_options);
  } catch (error) {
    __line__;
    console.my_log_point("error", error);
    return;
  }
};

export { send_an_email };
