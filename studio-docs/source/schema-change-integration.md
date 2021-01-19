---
title: Schema change notifications
---

You can [configure Apollo Studio](./notification-setup) to notify your team whenever any changes (additions, deprecations, removals, etc.) are made to your graph's registered schema:

<img class="screenshot" src="./img/integrations/schema-notification.jpg" alt="Schema notification Slack message." width="400"></img>

You can configure separate change notifications for each [variant](./org/graphs/#managing-variants) of your graph.

## Setup

See [Setting up Studio Notifications](./notification-setup).

## Webhook Schema

The webhook will have the following response shape

```javascript
interface Change {
  description: string;
}

interface ResponseShape {
  eventType: 'SCHEMA_PUBLISH';
  eventID: string;
  changes: Change[];
  schemaURL: string;
  schemaURLExpiresAt: string; # ISO 8601 Date string
  graphID: string;
  variantID: string;
  timestamp: string; # ISO 8601 Date string
}

```



The schemaURL is a short lived (24-hour) url which allows the schema that was published to be fetched without other access tokens or permissions required. The expires at timestamp will be when the url will no longer work.

Variant ID is the concatenation of `graphID@variantName` on which the schema publish occured.