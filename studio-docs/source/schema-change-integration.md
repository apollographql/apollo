---
title: Schema change notifications
sidebar_title: Schema changes
---

You can [configure Apollo Studio](./notification-setup) to notify your team whenever any changes (additions, deprecations, removals, etc.) are made to your graph's registered schema:

<img class="screenshot" src="./img/integrations/schema-notification.jpg" alt="Schema notification Slack message." width="400" />

You can configure separate change notifications for each [variant](./org/graphs/#managing-variants) of your graph.

## Setup

See [Setting up Studio Notifications](./notification-setup).

## Webhook format

If you receive schema change notifications via a [custom webhook](./notification-setup/#custom-webhooks-enterprise-only), notification details are provided as a JSON object in the request body.

The JSON object conforms to the structure of the `ResponseShape` interface:

```javascript
interface Change {
  description: string;
}

interface ResponseShape {
  eventType: 'SCHEMA_PUBLISH'; // Currently, only SCHEMA_PUBLISH webhooks are supported
  eventID: string;
  changes: Change[]; // Set of schema changes that occurred
  schemaURL: string; // See description below
  schemaURLExpiresAt: string; // ISO 8601 Date string
  graphID: string;
  variantID: string; // See description below
  timestamp: string; // ISO 8601 Date string
}
```

* The value of `schemaURL` is a short-lived (24-hour) URL that enables you to fetch the published schema _without_ authenticating (such as with an API key). The URL expires at the time indicated by `schemaURLExpiresAt`.

* The value of `variantID` is in the format `graphID@variantName` (e.g., `mygraph@staging`).
