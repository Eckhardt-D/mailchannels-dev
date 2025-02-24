# MailChannels Dev Server

> [!NOTE]
> This is not an official MailChannels service.

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

## Example

`POST http://localhost:8008/tx/v1/send` with the following body as `application/json`:

```json
{
  "headers": {
    "X-Test": "test"
  },
  "subject": "Test Subject",
  "from": {
    "name": "John Doe",
    "email": "john.doe@test.test"
  },
  "content": [
    {
      "type": "text/plain",
      "value": "Hello, World!"
    },
    {
      "type": "text/plain",
      "value": "Hello, {{name}}!",
      "template_type": "mustache"
    },
    {
      "type": "text/html",
      "value": "<p>Hello, World!</p>"
    }
  ],
  "personalizations": [
    {
      "to": [
        {
          "name": "Jane Doe",
          "email": "jane.doe@test.test"
        }
      ],
      "dynamic_template_data": {
        "name": "Jane"
      }
    }
  ],
  "reply_to": {
    "name": "John Doe 2",
    "email": "john.doe2@test.test"
  },
  "attachments": [
    {
      "filename": "test.txt",
      "content": "SGVsbG8gV29ybGQ="
    }
  ],
  "campaign_id": "test-campaign",
  "dkim_domain": "test.test",
  "dkim_private_key": "test",
  "dkim_selector": "test",
  "tracking_settings": {
    "click_tracking": {
      "enable": true
    },
    "open_tracking": {
      "enable": true
    }
  }
}
```

### Dry Run

This endpoint also supports the `dry-run` query parameter, when it is present the server does not send emails but only returns the Array of rendered emails as strings.

`POST http://localhost:8008/tx/v1/send?dry-run=true` with the same body as above. This will return an array of rendered emails as strings.

```json
{
    data: [
        "Hello, World!",
        "Hello, Jane!",
        "<p>Hello, World!</p>"
    ]
}
```

### Viewing Sent Emails

To view non dry-run emails, go to `http://localhost:8008/mails`.

## Feature Parity

This server mimics the API endpoint [here](https://docs.mailchannels.net/email-api/api-reference/send-a-message-over-mail-channels-email-api).
It tries to stay as close as possible to:

- Validation rules
- Request and Response structures
- Error Codes and Messages
- Parsing of the mustache templates

It should be a drop-in replacement for the real API in most cases.

