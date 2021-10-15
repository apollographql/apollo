---
title: 'Connect your graph to Apollo Studio'
sidebar_title: '5. Connect to Apollo Studio'
description: Learn about essential developer tooling
---

> Time to accomplish: 10 minutes

Great work! We have a running GraphQL server that interacts with data from multiple sources. Now before we jump over to the client side, let's turn on some powerful tooling.

**Apollo Studio** is a cloud platform that helps you with every phase of GraphQL development, from prototyping to deploying to monitoring.

Studio's core features are free for everyone. All of the features in this tutorial are free features.

## Create an Apollo account

> Skip this if you already created an account to use the Apollo Studio Explorer.

Visit [studio.apollographql.com](https://studio.apollographql.com) and click **Create an account**. You can sign up either with your GitHub account or by setting a username and password.

After signing up, you're redirected to your Apollo Studio homepage.

## Create your first graph

In Apollo Studio, each **graph** has a corresponding GraphQL schema. For your first graph, we'll use the schema of the server you just finished building.

1. From your [Studio homepage](https://studio.apollographql.com), click **New Graph** in the upper right.
2. Provide a name for your graph and set the **Graph type** to **Deployed**.
    > A deployed graph is shared with other members of your organization. A development graph is private to you.
3. Click **Next**. A dialog appears instructing you to register your schema. We'll do that in the next step.

## Connect your server

Apollo Server can communicate directly with Apollo Studio to register its schema and push useful performance metrics. This communication requires a **graph API key**. Let's obtain one for our graph.

From your [Studio homepage](https://studio.apollographql.com), click your newly created graph. This displays the same dialog that appeared after you created it:

<img src="../img/register-schema.png" class="screenshot" width="600" />

Copy all of the environment variable definitions in the block at the bottom of the dialog (the value of `APOLLO_KEY` is your graph API key).

### Set environment variables

You provide your graph API key to Apollo Server by setting it as the value of the `APOLLO_KEY` environment variable.

Create a `.env` file in `start/server` by making a copy of `start/server/.env.example`. Then paste the environment variables from the dialog in studio:

```none:title=.env
APOLLO_KEY=YOUR_API_KEY
APOLLO_GRAPH_ID=your-graph-id
APOLLO_GRAPH_VARIANT=current
APOLLO_SCHEMA_REPORTING=true
```

> **Graph API keys are secret credentials.** Never share them outside your organization or commit them to version control. Delete and replace API keys that might be compromised.

### Load environment variables

Add the following line to the very top of `start/server/src/index.js` if it isn't already there:

```js:title=start/server/src/index.js
require('dotenv').config();
```

The `dotenv` package provides support for reading environment variables from the `.env` file.

### Restart your server

After you restart your server with `npm start`, return to your Studio homepage. After fifteen seconds or so, Studio will receive your server's schema and you can view its full details.

## Try out free Studio features

Connecting your server to Apollo Studio activates a variety of powerful features:

### The Explorer

As shown [earlier in the tutorial](./schema/#explore-your-schema) with Sandbox, the Apollo Studio Explorer provides a comprehensive view into your schema, including all documentation strings you include in it. Use it to build queries and execute them on your server.

<img src="../img/explorer-tab.jpg" alt="Studio Explorer tab" class="screenshot" />

### Schema history

Open the **History** tab to view a full revision history of the schema versions your server pushes over time:

<img src="../img/schema-history/schema-history.jpg" class="screenshot" width="400" />

This history helps you identify exactly when a particular type or field was added or removed, which is crucial when diagnosing an issue.

### Operation metrics

Apollo Server pushes metrics data to Studio for each GraphQL operation it executes. This data includes a breakdown of the timing and error information for each field that's resolved as part of the operation.

> Apollo Server does **not** push GraphQL operation results to Studio. For more information, see [Data privacy and compliance](https://www.apollographql.com/docs/studio/data-privacy/).

Open the **Operations** tab to view performance data based on the last 24 hours of your server's operation traces:

<img src="../img/operations-tab.jpg" alt="Studio Explorer tab" class="screenshot" />

> Organizations with a paid Studio plan can view metrics for the last 90 days or more, depending on the plan.  For more information on paid Studio features, see the [Studio documentation](https://www.apollographql.com/docs/studio/).

<hr/>

Now that our server is connected to Studio, let's start building a client to execute some queries!
