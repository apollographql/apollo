---
title: Build status webhook (Preview)
---

You can [configure Apollo Studio](./notification-setup) to notify your team whenever any changes are made to your graph's build:

You can configure separate change notifications for each [variant](./org/graphs/#managing-variants) of your graph.

## Setup

See [Setting up Studio Notifications](./notification-setup).

## Webhook format

If you receive build status notifications via a [custom webhook](./notification-setup/#custom-webhooks-enterprise-only), notification details are provided as a JSON object in the request body.

The JSON object conforms to the structure of the `ResponseShape` interface:

```javascript
interface BuildError {
  message: string;
  locations: ReadonlyArray<Location>;
}

interface Location {
  line: number;
  column: number;
}

interface ResponseShape {
  eventType: 'BUILD_STATUS_UPDATE';
  eventID: string;
  coreSchemaSDL: string | undefined; // See description below
  buildErrors: BuildError[] | undefined; // See description below
  graphID: string;
  variantID: string; // See description below
  timestamp: string; // ISO 8601 Date string
}
```

* The value of `supergraphSchemaURL` is a short-lived (24-hour) URL that enables you to fetch the supergraph core schema _without_ authenticating (such as with an API key). This field will not be present if there is no valid supergraph schema.

* The value of `buildErrors` will be an array of objects of type `BuildError`. These will be present if there were any errors when building the core schema.

* The value of `variantID` is in the format `graphID@variantName` (e.g., `mygraph@staging`).
