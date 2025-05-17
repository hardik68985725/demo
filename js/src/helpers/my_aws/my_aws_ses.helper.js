const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const _get_ses_client = () => {
  const ses_configuration = { region: process.env.AWS_REGION };
  ses_configuration.credentials = {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  };
  return new SESClient(ses_configuration);
};

const send_an_email = async (_to, _subject, _message) => {
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

  const ses_client = _get_ses_client();
  try {
    return await ses_client.send(
      new SendEmailCommand({
        Source: process.env.AWS_SES_FROM_EMAIL,
        Destination: { ToAddresses: [_to] },
        Message: {
          Subject: { Charset: "UTF-8", Data: _subject },
          Body: { Html: { Charset: "UTF-8", Data: _message } },
        },
      })
    );
  } catch (_caught_error) {
    console.log(">>>>> _caught_error >", _caught_error);
  }
};

module.exports.my_aws_ses = { send_an_email };
