---
title: '5. Connect your graph to Apollo Studio'
sidebar_title: '5. Connect to Apollo Studio'
description: Learn about essential developer tooling
---

> Time to accomplish: 10 Minutes

Great work! We have a running GraphQL server that interacts with data from multiple sources. Now before we jump over to the client side, let's turn on some powerful tooling.

**Apollo Studio** is a cloud platform that helps you with every phase of GraphQL development, from prototyping to deploying to monitoring.

Studio's core features are free for all users. All features included in this tutorial are free features.

## Create an Apollo account

Visit [studio.apollographql.com](https://studio.apollographql.com) and click **Create an account**. You can sign up either with your GitHub account or by setting a username and password.

After signing up, you're redirected to your Apollo Studio homepage.

## Create your first graph

In Apollo Studio, each **graph** is a distinct data graph with a corresponding GraphQL schema. For your first graph, we'll use the schema of the server you just finished building.

1. From your [Studio homepage](https://studio.apollographql.com), click **New Graph**. 
2. Provide a name for your graph and click **Next**.
3. A dialog appears instructing to you register your schema. We'll do that in the next step.

## Connect your server

Apollo Server communicates directly with Apollo Studio to register its schema and push performance metrics. This communication requires an **API key**. Let's obtain an API key for your graph.

From your [Studio homepage](https://studio.apollographql.com), click your newly created graph. This displays the same dialog that appeared after you created it:


TODO copy and paste the key indicated and save it to .env 

When Apollo Server starts up, it automatically begins communicating with Apollo Studio if it has an API key to use. You give it your API key by setting the `APOLLO_KEY` environment variable.

Conveniently, our `index.js` file already uses the `dotenv` package to read environment variables from a `.env` file.

Create a `.env` file in `start/server` by making a copy of `start/server/.env.example`. Then paste your API key into it like so:

```none:title=.env
APOLLO_KEY=PASTE_YOUR_KEY_HERE
```

> **Graph API keys are secret credentials.** Never share them outside your organization or commit them to version control. Delete and replace API keys that might be compromised.

Start up your server using `npm start`, then return to your Studio homepage. When you click on your graph now, its full details appear.

## Explore free Studio features

Connecting your server to Apollo Studio activates a variety of powerful features: 

### Schema explorer

On startup, Apollo Server automatically registers the latest version of its schema with Studio.

Open the **Explorer** tab to view all of the types and fields in the latest version of your graph's schema:

The rightmost column of each field shows how many GraphQL operations have included that field in the last 24 hours (more on metrics below), so you can tell which fields are used most:

### Schema history

Open the **History** tab to view a full revision history of the schema versions your server pushes over time:

TODO SCREENSHOT

This history helps you identify exactly when a particular type or field was added or removed, which is crucial when diagnosing an issue.

### Metrics reporting

Apollo Server pushes **trace data** to Studio for each GraphQL operation it executes. This data includes a breakdown of the timing and error information for each field that's resolved as part of the operation.

> Apollo Server does _not_ push GraphQL operation results to Studio. For more information, see [Graph Manager data privacy and compliance](https://www.apollographql.com/docs/graph-manager/graph-manager-data-privacy/).

Open the **Metrics** tab to view performance data based on the last 24 hours of your server's operation traces:

TODO SCREENSHOT

Organizations with a paid Studio plan can view metrics for the last 90 days or more, depending on the plan. 

> For more information on paid Studio features, see the [Studio documentation](https://www.apollographql.com/docs/graph-manager/).

<hr/>

Now that our server is connected to Studio, let's start building a client to execute some queries!
