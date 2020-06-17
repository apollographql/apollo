---
title: '5. Run your graph in production'
description: Learn about deployment and essential developer tooling
---

Time to accomplish: _15 Minutes_

Great job for making it this far! We've already learned how to build a GraphQL API with Apollo, connect it to REST and SQL data sources, and send GraphQL queries. Now that we've completed building our graph, it's finally time to deploy it! 🎉

An Apollo GraphQL API can be deployed to any cloud service, such as Heroku, AWS Lambda, or Netlify. If you haven't already created an [Apollo Studio](https://studio.apollographql.com/) account, you will need to sign up for one.

## Register your schema

Just like npm provides a registry for JavaScript packages, Apollo provides a schema registry that enables you to pull your server's most recent schema from the cloud. Before we deploy our app, we'll register our schema to track changes and enable developer tooling like the Apollo VSCode extension.

In a production application, you should set up this publishing script as part of your CI workflow. For now, we will run a script in our terminal that uses the Apollo CLI to register our schema.

### Obtain an API key

First, we need to obtain an API key from Apollo Studio. Navigate to [Studio](https://studio.apollographql.com/), log in, and click **New Graph**  in the top right. The prompt will instruct you to name your graph. When you're finished, click **Create Graph**. You'll receive an API key for use in local development environment and CI. Copy the key for local development (prefixed by `user:`) so we can save it as an environment variable.

Let's save our key as an environment variable. It's important to make sure we don't check our Studio API key into version control. Go ahead and make a copy of the `.env.example` file located in `server/` and call it `.env`. Delete the content of the newly created file and add your Studio API key that you copied from the previous step to the file:

```
APOLLO_KEY=user:<hash-from-apollo-engine>:<hash-from-apollo-engine>
```

The entry should basically look like this:

```bash:title=.env
APOLLO_KEY=user:xz.5r134305-88p1-4840-12c1-88rc0xcxe179:E4VSTiXeFWaSSBgFWXOiSA
```

Our key is now stored under the environment variable `APOLLO_KEY`.

### Check and publish with the Apollo CLI

It's time to publish our schema to the registry! First, start your server in one terminal window by running `npm start`. In another terminal window, run the following command, substituting the name of your graph where indicated:

```bash
npx apollo service:push --endpoint=http://localhost:4000 --graph=name-of-graph
```

> npx is a tool bundled with npm for easily running packages that are not installed globally.

This command publishes your schema to the Apollo schema registry. Once your schema is registered, you should be able to see it in [Apollo Studio](https://studio.apollographql.com/). In future steps, we'll fetch our schema from the registry to power the Apollo VSCode extension.

For subsequent publishes, we may first want to check for any breaking changes in our new schema against the old version. In a terminal window, run:

```bash
npx apollo service:check --endpoint=http://localhost:4000 --graph=my-graph
```

### What are the benefits of Studio and the registry?

Publishing your schema to the Apollo schema registry unlocks many features necessary for running a graph API in production. Some of these features include:

- **Schema explorer:** Studio lets you explore all the types and fields in your registered schema, with usage statistics on each field. This metric makes you understand the cost of a field. How expensive is a field? Is a certain field in so much demand?
- **Schema history:** Confidently iterate on your graph's schema by validating potential changes against field-level usage data from your production schema. This empowers developers to avoid breaking changes by providing insights into which clients will be broken by a new schema.
- **Performance analytics:** Fine-grained insights into every field, resolvers and operations of your graph's execution
- **Client awareness:** Report client identity (name and version) to your server for insights on client activity.

We also want to be transparent that the features we just described, such as viewing specific execution traces and validating schema changes against recent operations, are only available on a paid plan. Individual developers just getting started with GraphQL probably don't need these features, but they become incredibly valuable as you're working on a team. Additionally, layering these paid features on top of our free developer tools like Apollo VSCode makes them more intelligent over time.

We're committed to helping you succeed in building and running an Apollo graph API. This is why features such as publishing and downloading schemas from the registry, our open source offerings like Apollo Client and Apollo Server, and certain developer tools like Apollo VSCode and Apollo DevTools will always be free forever.
