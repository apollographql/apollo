---
title: Tracking your GraphQL schema
description: A central hub for your GraphQL API
---

Apollo includes a schema registry that serves as a [central hub](https://principledgraphql.com/integrity#3-track-the-schema-in-a-registry) for tracking your GraphQL schema. Adopting a shared schema registry for your project has many benefits:

- Unlike introspection, which provides a snapshot of a particular server's current schema, the registry serves as a global source of truth for the schema. In small projects this frees you from always needing a running server to access the schema. At scale, it avoids issues related to running multiple servers that may not always be in sync (eg, rolling updates).
- Much like a source control system, Apollo's schema registry tracks a full history of a schema and how it changed over time. This is valuable for understanding and collaborating on a GraphQL API, especially as your team grows.
- Having a registry allows you to disable introspection in production – a recommended best practice for good security.
- Tools like the [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) automatically fetch schema definitions from the registry.
- Apollo's registry lets you track related _variants_ of a schema, like staging or alpha versions. It's helpful to have these schema definitions handy without having to juggle running servers that implement them.

<h2 id="setup">Using the Schema Registry</h2>

To get started using Apollo's schema registration service, you'll need to configure your repository to be an Apollo project by:

1. [Installing the Apollo CLI](#install-cli)
1. [Creating a `.env` file in the root of your project with an `ENGINE_API_KEY`](#api-key)
1. [Creating an `apollo.config.js` file at the root of your project and adding the right configuration](#apollo-config)

#### CLI commands

Once you have the Apollo CLI installed, your Engine API key set up, and your Apollo config created, you will be ready to start connecting to the schema registry. The main commands to interface with the registry are:

- `apollo service:push`: push a new schema to the registry
- `apollo service:check`: compare the local schema against collected usage metrics and validate if proposed changes will break any live queries

Type `apollo service --help` for full details on the commands available in the CLI.

<h3 id="install-cli">Install the Apollo CLI</h3>

To install the [`apollo` CLI](https://npm.im/apollo), ensure that `node` and `npm` are both installed, then run:

```bash
npm install --global apollo
```

> **Note:** This guide will utilize the global installation method, but the `apollo` command can also be installed in a project's `devDependencies` and used via [`npm-scripts`](https://docs.npmjs.com/misc/scripts) or [`npx`](https://npm.im/npx).

<h3 id="api-key">Get your Engine API key</h3>

To get an API key, you will need to [log in to Engine](https://engine.apollographql.com) and create a new service by clicking the "Add Service" button. If you already have a service, get your API key by visiting your service's settings page. Once you have your API key, add it to your `.env` file like so:

```
ENGINE_API_KEY=service:foobar:d1rzyrmanmrZXxTTQLxghX
```

The Apollo CLI uses your Engine API key to authenticate with the registry when it pushes your schema.

> **Note:** Make sure your `.env` file is in the root of your project so the Apollo CLI knows where to find it. You can also export `ENGINE_API_KEY` as an environment variable.

<h3 id="apollo-config">Create an `apollo.config.js` file</h3>

The commands executed through the Apollo CLI will be looking for your Apollo config to inform their behavior. Visit the [Apollo config docs](/docs/references/apollo-config.html#service-config) for full details on how to set up your `apollo.config.js` file in your application.

To set up schema registration, you'll need to configure a source that the CLI can fetch your schema from like so:

```js
module.exports = {
  service: {
    endpoint: {
      url: "http://localhost:4000"
    }
    // OR
    localSchemaFile: './path/to/schema.graphql'
  }
};
```

<h2 id="push">Registering a schema</h2>

You push a schema to the registry by running `apollo service:push` from within your repository. The CLI will know where to fetch your local schema from based on the configuration you gave in your `apollo.config.js` file. Each time a new version of your schema is pushed, it is logged in your schema history and it becomes the basis of comparison for `apollo service:check`.

Here's what running `apollo service:push` will look like:

```
~/Development/apollo/example$ apollo service:push
  ✔ Loading Apollo Project
  ✔ Uploading service to Engine

id      schema        tag
──────  ────────────  ───────
190330  example-4218  current
```

### Hooking into CI

To get the full value out of Apollo's platform, the schema registry should be an accurate representation of what's running live on your services. To achieve this, you should add the `apollo service:push` command to your continuous delivery pipeline so that your schema is pushed to the registry on every deploy. This is how you will maintain accurate schema change tracking, schema change validation, schema documentation, etc.

Here is a sample configuration for pushing a schema using CircleCI:

```yaml line=13,29-31
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

<h2 id="history">Viewing schema change history</h2>

Changes made to your schema over time can be tracked in Apollo's UI in Engine by browsing to the History page in your service.

Once you have pushed your schema, you can view it through [Apollo Engine](https://engine.apollographql.com) by browsing to the History page in your Service. The pushed schema will appear in your history log along with a list of changes comparing it to the previously pushed versions of your schema. You can view the full contents of the most recently pushed version of your schema in the Explorer page.

<img src="../images/schema-history.png" width="100%" alt="Schema history page in the Engine UI">

<h2 id="schema-tags">Managing environments</h2>

Product cycles move fast, and it's common for a schemas to be slightly different across environments as changes make their way through your system. To accommodate for this, the schema registry allows each schema to be registered under a "schema tag". Tags are mostly commonly used to represent environments.

There are two parts to setting up schema tags:

1. [Configuring each `service:push` to send along a tag with each schema push.](#registry-tag)
1. [Configuring metrics sent from your server to send along a tag with each trace.](#metrics-tag)

<h3 id="registry-tag">Register a schema to a tag</h3>

To register your schema to a specific tag, simply add the `--tag=<TAG>` flag to your push command:

```bash
apollo service:push --tag=beta
```

> **Note:** Untagged pushes to the registry will be associated with the default tag, `current`.

<h3 id="metrics-tag">Send tagged metrics</h3>

Tagging both schemas pushes and metrics sent enables a single service to be tracked across production, staging, and any other environments exposing a schema.

Configure the metrics sent to [Engine](https://engine.apollographql.com) from your server to send a tag with each trace in one of two ways:

1. Starting up the service with an environment variable called `ENGINE_SCHEMA_TAG`. This will link metrics sent to Engine with the value of that environment variable. This is the best way to associate metrics so that the schema tag isn't hardcoded into the server.
1. Alternatively, add the `schemaTag` option to your Apollo Server configuration (only works for Apollo Server 2.2+):

```js line=5
const server = new ApolloServer({
  ...
  engine: {
    apiKey: "<ENGINE_API_KEY>",
    schemaTag: "beta"
  }
});
```

<h2 id="benefits">Tools that use the schema registry</h2>

An up-to-date schema in Apollo's schema registry enables a number of workflow benefits through integrations with other tools. A registered schema combined with:

- The [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) provides built-in linting on queries by validating against the schema in your registry, and annotates fields on your queries with performance indicators collected in Apollo's trace warehouse.
- [Schema validation](./schema-validation.html) creates a diff between your local schema and the last schema pushed to the registry, and validates this diff against live traffic seen on your endpoint to make sure you never accidentally deploy a breaking schema change to production.
- The [Schema History](#history) keeps track of all the changes made to your schema over time.
- The [Schema Explorer](https://engine.apollographql.com) links the fields in your schema to clients and queries that are using them.
