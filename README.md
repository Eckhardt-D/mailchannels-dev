# MailChannels Dev Server

Run a local server that mimics the MailChannels `/tx/v1/send` API endpoint. The server captures
the sent emails and stores them temporarily so you can read them in the browser. This is useful
when developing and testing email without actually sending them.

## Getting started

No official Docker image yet, you can build it yourself:

```bash
docker build -t mailchannels-dev .
```

Run the server:

```bash
docker run -p 8008:8008 mailchannels-dev
```

## Usage

This server mimics the API endpoint [here](https://docs.mailchannels.net/email-api/api-reference/send-a-message-over-mail-channels-email-api).
It tries to stay as close as possible to:

- Validation rules
- Request and Response structures
- Error Codes and Messages
- Parsing of the mustache templates

It should be a drop-in replacement for the real API in most cases.

### Viewing emails

When you do e.g. `POST http://localhost:8008/tx/v1/send` with the body following the API docs at the link above,
the server will capture the email and store it in a temporary directory. You can view the emails in the browser
by going to `http://localhost:8008/mails`.
