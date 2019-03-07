---
title: Registering your schema
description: How to add your schema to the Apollo registry
---

The [schema](https://www.apollographql.com/docs/tutorial/schema.html) is the center point of all GraphQL applications. It creates an enforceable contract between clients and servers, it is its own self-updating API documentation, and it provides powerful development workflows thanks to its type safety. Since the schema is the focal point for developers working with GraphQL, the [Apollo Platform](/docs/intro/platform.html) provides a free schema registry for teams of all sizes to use. The schema registry stores a consistent view of the current and future data models that teams use in every facet of their workflow.

<h2 id="benefits">Benefits of registering schemas</h2>

The Apollo schema registry helps teams ship high quality software faster through tools like:

- The [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo), which comes with built-in linting on queries and performance indicators on fields.
- [Schema validation](./schema-validation.html), which helps teams safely evolve their schema over time by catching breaking changes in CI checks.
- The [Schema History](#history) log, which keeps track of all the changes made to your schema over time.
- The [Schema Explorer](https://engine.apollographql.com), which provides information on which queries and clients are using which fields in your schema and shows how much usage deprecated fields are still getting.

<h2 id="setup">Using the Schema Registry</h2>

To get started with the Schema Registry, you'll need to set up these things:

1. Install the Apollo CLI
1. Create a `.env` file in the root of your project with an Engine API Key
1. Create an `apollo.config.js` file at the root of your project which informs the behavior of CLI commands

#### Install the Apollo CLI

To install the [`apollo` CLI](https://npm.im/apollo), ensure that `node` and `npm` are both installed, then run:

```bash
npm install --global apollo
```

> **Note:** This guide will utilize the global installation method, but the `apollo` command can also be installed in a project's `devDependencies` and used via [`npm-scripts`](https://docs.npmjs.com/misc/scripts) or [`npx`](https://npm.im/npx).

#### Add your Engine API key to your `.env` file

To get an API key, you will need to log in to [Engine](https://engine.apollographql.com) and create a new service by clicking the "Add Service" button. Once you have your API key, add it to your `.env` file like so:

```
ENGINE_API_KEY=service:foobar:d1rzyrmanmrZXxTTQLxghX
```

The Apollo CLI uses your Engine API key to upload your schema to the registry.

> **Note:** Make sure your `.env` file is in the root of your project so the Apollo ClI knows where to find it.

#### Add an `apollo.config.js` file to your project

The commands executed through the Apollo CLI will be looking for a config in your project to inform their behavior. Visit the [Apollo config docs](/docs/references/apollo-config.html#service-config) for full details on how to set up your `apollo.config.js` file in your application.

#### CLI commands

Once you have the Apollo CLI installed, your Engine API key set up, and your Apollo config created you will be ready to start connecting to the Schema Registry. The main commands to interface with the registry are:

- `apollo service:push`: upload a new schema to the registry
- `apollo service:download`: download a schema from the registry
- `apollo service:check`: compare the local schema against running traffic and validate if proposed changes will break any live queries

<h3 id="push">Uploading a schema</h3>

Invoking the `apollo service:push` command is how you'll register your schema to the registry (Apollo Engine). You can configure your schema source to either be the URL of a running GraphQL server or the path to a local file with a schema SDL in it. This is configured in your `apollo.config.js`.

```
~/Development/apollo/example$ apollo service:push
  ✔ Loading Apollo Project
  ✔ Uploading service to Engine

id      schema        tag
──────  ────────────  ───────
190330  example-4218  staging
```

#### Hooking into CI

We highly recommend that you set up the `apollo service:push` command in your continuous delivery pipeline so that you're pushing a new version of your schema to the registry every time a change is deployed. This is how you will maintain accurate schema change tracking, schema change validation, schema documentation, etc.

Skip to our [Schema History](#history) section for an example CircleCI config with `apollo service:push`.

<h3 id="viewing-schema">Viewing a registered schema</h3>

Once you have uploaded your schema, you can view on [Engine](https://engine.apollographql.com) by browsing to the service's dashboard. The pushed schema will appear with an overall schema summary about its types and fields, as well as full information about every type, argument, and description in the schema. With a registered schema, you can try out other Apollo tools that integrate with the registry like the [Apollo VS Code extension](./editor-plugins.html).

<h3 id="schema-tags">Managing environments</h3>

Product cycles move fast, and it's common for a schemas to be slightly different across environments as changes make their way through your system. To accommodate for this, the schema registry allows each schema to be registered under a "schema tag". Tags are mostly commonly used to represent environments, but can also be used to represent things like branches and future schemas.

There are two parts to setting up schema tags:

1. Configuring each `service:push` to send along a tag
1. Configuring metrics sent from your server to send along a tag with each trace, if applicable

#### Register a schema to a tag

To associate each registered schema with a tag, simply add the `--tag=<TAG>` flag to your push command:

```bash
apollo service:push --tag=beta
```

#### Send tagged metrics

To get the most out of tagged schemas, you should configure metrics sent to [Engine](https://engine.apollographql.com) to associate traces with a tag as well. This will enable a single service to be tracked across production, staging, and any other environment running a schema.

To associate metrics with a schema, turn on tagged metrics in Apollo Server in one of two ways:

1. Starting up the service with an environment variable called `ENGINE_SCHEMA_TAG`. This will link metrics sent to Engine with the value of that environment variable. This is the best way to associate metrics so that the schema tag isn't hardcoded into the server.
1. Alternatively, you can add the `engine.schemaTag` option to your Apollo Server configuraiton (only works for Apollo Server 2.2+):

```js line=5
const server = new ApolloServer({
  ...
  engine: {
    ...
    schemaTag: "beta"
  }
});
```

<h2 id="history">Schema change history</h2>

Schema change tracking becomes really valuable as your schema grows and as many different teams begin contributing to and consuming from it. The [`apollo service:push`](#push) command allows for a consistent historical view to be tracked, which allows everyone to understand when new features were introduced, when old fields were removed, and which commit made corresponded to which changes in a shcma.

To ensure the schema is registered and provides accurate analysis of breaking changes, add the `apollo service:push` command to the end of all deploy scripts. For example in a workflow with continuous deployment, configure the pipeline to run `apollo service:push` automatically on the `master` branch (or the appropriate mainline branch). An example CircleCI configuration details this below.

> Note: in addition to pushing on deploy, registering the schema on the `master` branch can provide a granular history of schema changes. This is often useful for teams without continuous delivery

<h3 id="sample-config">Sample CircleCI config</h3>

A sample configuration for pushing a schema using CircleCI:

```yaml
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:8

    steps:
      - checkout

      - run: npm install
      # CircleCI needs global installs to be sudo
      - run: sudo npm install --global apollo

      # Start the GraphQL server.  If a different command is used to
      # start the server, use it in place of `npm start` here.
      - run:
          name: Starting server
          command: npm start
          background: true

      # make sure the server has enough time to start up before running
      # commands against it
      - run: sleep 5

      # When running on the 'master' branch, push the latest version
      # of the schema to Apollo Engine.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "master" ]; then
            apollo service:push --tag=master
          fi
```
