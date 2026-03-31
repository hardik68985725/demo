import { createTransport, SendMailOptions } from "nodemailer";
import { CoreEnums } from "@app_root/core/enums";

const _getNmTransporter = () => {
  return createTransport({});
};

const sendAnEmail = async (
  _to: string,
  _subject: string,
  _message: string,
  _attachments?: Array<Record<string, string>>
) => {
  if (process.env.ENV_NAME === CoreEnums.EEnvs.Development) {
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
      from: process.env.APP_FROM_EMAIL_ADDRESS,
      to: [_to],
      subject: _subject,
      html: _message
    };
    if (attachments && attachments.length > 0) {
      mail_options.attachments = attachments;
    }

    return await _getNmTransporter().sendMail(mail_options);
  } catch (error) {
    __line__;
    myLogger.error(error);
    return;
  }
};

export { sendAnEmail };
