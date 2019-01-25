---
title: Registering your schema
description: How to add your schema to the Apollo registry
---

The [schema](https://www.apollographql.com/docs/tutorial/schema.html) is the center point of all GraphQL applications. Concretely, a schema creates an enforceable contract between clients and servers, provides up to date API documentation, and enables development tools to improve. Since the schema is the focal point for developers working with GraphQL, the Apollo GraphQL Platform provides a free schema registry for teams of all sizes to use. The schema registry stores a consistent view of the current and future data models that teams use in every facet of their workflow.

<h2 id="benefits">Benefits of registering schemas</h2>

The Apollo schema registry provides a number of benefits to help teams collaborate and ship high quality software faster. A few of these benefits are:

- Powering editor tools like the [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo)
- Enabling better code reviews and safer changes with [schema validation](./schema-validation.html)
- Maintaining a single source of knowledge for all teams with the [Apollo schema explorer](https://engine.apollographql.com)
- Sharing upcoming changes with [schema tags](#schema-tags)
- Protecting the server when combined with the [Apollo operation registry](./operation-registry.html)
- Keeping the history of schema changes with the [Apollo schema history tab](#history)

<h2 id="setup">Using the schema registry</h2>

Adding schemas to the Apollo schema registry occurs when pushing a [GraphQL service](../resources/graphql-glossary.html#graphql-service) to Engine. A service contains information about the schema and how to run it. Part of this push includes registering the service's schema. To begin using the schema registry and perform a service push, use the [`apollo` command line interface (CLI)](https://npm.im/apollo).

<h3 id="install-apollo-cli">Install Apollo CLI</h3>

To install the [`apollo`](https://npm.im/apollo) CLI, ensure that `node` and `npm` are installed, then run:

```bash
npm install --global apollo
```

> Note: This guide will utilize the global installation method, but the `apollo` command can also be installed in a project's `devDependencies` and used via [`npm-scripts`](https://docs.npmjs.com/misc/scripts) or [`npx`](https://npm.im/npx).

<h3 id="push">Pushing a service</h3>

Once the `apollo` command is installed, the `apollo service:push` command is used to register a schema to Apollo Engine.

To push a service, start the GraphQL server and run the following command, substituting the appropriate GraphQL endpoint URL and API key:

> An API key can be obtained from a service's _Settings_ menu within [Engine](https://engine.apollographql.com/).

```bash
apollo service:push --key="<API_KEY>" --endpoint="https://example.com/graphql"
```

> For accuracy, it's best to retrieve the schema from a running GraphQL server (with introspection enabled), though local files representing a schema can also be used. See the [configuration options](../references/apollo-config.html) for more information.

<h3 id="viewing-schema">Viewing a registered schema</h3>

Now that the service is pushed, view it on [Engine](https://engine.apollographql.com) by browsing to the service's dashboard. The pushed service should now appear with an overall schema summary about its types and fields, as well as full information about every type, argument, and description in the schema. With a registered schema, teams can now use productivity boosters such as the [Apollo VS Code extension](./editor-plugins.html)

<h2 id="schema-tags">Coordinating with schema tags</h2>

Product cycles move incredibly fast and coordination of teams is critical to shipping features quickly. To enable communication, the Apollo schema registry allows teams to push proposed or future versions of their schema to the registry under a schema tag. These new versions are used in editors, validation, and documentation as the source of truth for future schemas.

There are two parts of setup to getting the most out of schema tags. The first is pushing the tagged schema to the registry:

<h3 id="using-tags">Using schema tags</h3>

Pushing a tagged version of a schema is done using the same command as registering the initial schema. In fact, the `apollo service:push` command registers a schema under a tag called `current`. To register a tagged version, run the server with the new schema and then push the service:

```bash
apollo service:push --key="<API_KEY>" --endpoint="https://example.com/graphql" --tag=beta
```

The only change in this push is the addition of the `--tag` flag on the end of the push command.

<h3 id="sending-tagged-metrics">Running a tagged schema</h3>

To get the most out of tagged schemas, teams can send metrics to [Engine](https://engine.apollographql.com) with this tag. This enables a single service to be tracked in production, staging, and any other environment running a schema. To associate metrics with a schema, make sure the latest Apollo Server is installed and turn on tagging in one of two ways:

1. Starting up the service with an environment variable called `ENGINE_SCHEMA_TAG` will link metrics sent to Engine with the value of that environment variable. This is the best way to associate metrics so that the schema tag isn't hardcoded into the server.
2. Alternatively, schema tag can be set within the `engine` settings of Apollo Server 2.2 and up:

```js
const server = new ApolloServer({
  // rest of normal server settings
  engine: {
    schemaTag: "beta"
  }
});
```

Both the new version of the schema, as well as its performance and error metrics can be viewed in [Engine](https://engine.apollographql.com) and used with [schema validation](./schema-validation.html).

<h2 id="history">Schema history</h2>

As the schema grows and evolves to meet the needs of the product, keeping and visualizing the history of schema changes becomes increasingly valuable. A consistent historical view allows everyone to understand when new features were introduced, when old fields were removed, and which commit made a change. The Apollo Platform provides the tooling necessary to track this history with the [`apollo service:push`](#push) command.

After a schema is registered, it becomes the basis for comparison when validating future schemas to avoid breaking changes. Therefore, a service should be pushed to [Engine](https://engine.apollographql.com) each time a new schema is deployed.

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
