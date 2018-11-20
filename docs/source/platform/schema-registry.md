---
title: Registering your schema
description: How to publish your schema to the Apollo registry
---

A schema is the center point of all GraphQL applications. It powers incredible development tools, is an always up to date set of documentation, and creates an enforcable contract between clients and servers through validation. Since this is such a center point of how teams work on GraphQL, the Apollo GraphQL Platform provides a free schema registry for teams of all sizes to use. In storing a schema in the registry, teams can share an always up to date picture of their data model into every facet of their workflow.

<h2 id="benefits">Benefits of publishing a schema</h2>

The Apollo schema registry provides a number of benefits to help teams collaborate and ship high quality software faster. A few of these benefits are:

* Powering editor tools like the [Apollo VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo)
* Empowering better code reviews and safer changes with [schema validation](./schema-validation.html)
* Having a single point of knowledge for all teams to view through the [Apollo schema explorer](https://engine.apollographql.com)
* Sharing upcoming changes with [schema tags](#schema-tags)
* Protecting the server along with the [Apollo operation registry](./operation-registry.html)
* Having a historical view of how a schema changes with the [Apollo schema history tab in Engine](#history)

<h2 id="setup">Publishing a schema</h2>

Publishing schemas to the Apollo schema registry is done by pushing a GraphQL service to Engine. A service represents information about the schema and how it can be run. Part of this push includes registering the service's schema in the schema registry.

To begin using the schema registry, the first step that needs to be done is pushing a service into the registry. This is done by using the [`apollo` command line interface (CLI)](https://npm.im/apollo).

<h3 id="install-apollo-cli">Install Apollo CLI</h3>

To install the [`apollo`](https://npm.im/apollo) CLI, ensure that `node` and `npm` are installed, then run:

```bash
npm install --global apollo
```

> Note: This guide will utilize the global installation method, but the `apollo` command can also be installed in a project's `devDependencies` and used via [`npm-scripts`](https://docs.npmjs.com/misc/scripts) or [`npx`](https://npm.im/npx).

<h3 id="publish">Pushing a service</h3>

Once the `apollo` command is installed, the `apollo service:push` command is used to publish a schema to Apollo Engine.

To push a service, start the GraphQL server and run the following command, substituting the appropriate GraphQL endpoint URL and an API key:

> An API key can be obtained from a service's _Settings_ menu within the [Engine dashboard](https://engine.apollographql.com/).

```bash
apollo service:push --key="<API_KEY>" --endpoint="https://example.com/graphql"
```

> For accuracy, it's best to retrieve the schema from a running GraphQL server (with introspection enabled), though local files representing a schema can also be used. See the [configuration options](./resources/apollo-config.html) for more information.

<h3 id="viewing-schema">Viewing a published schema</h3>

Now that the service has been pushed, it can be viewed by going to [Engine](https://engine.apollographql.com) and browsing to the service's dashboard. The schema that was pushed should now appear with overal information about its number of types and fields, as well as full information about every type, argument, and description of the schema. With this done, teams can now use productivity boosters like the [Apollo VS Code extension](./editor-plugins.html)

<h2 id="schema-tags">Schema tags</h2>

Product cycles move incredibly fast and coordination of teams is critical to shipping features quickly. To enable this coordination, the Apollo schema registry allows teams to push proposed or future versions of their schema to the registry so teams can use them in their editors, validate against them, and have a center point of truth even for the future of their graph.

There are two parts to getting the most out of schema tags. The first is pushing the tagged schema to the registry:

<h3 id="publishing-a-tag">Publishing a tag</h3>

Publishing a tagged version of a schema is done using the same command as publishing the initial schema. In fact, the `apollo service:push` command publishes a schema under a tag called `current`. To publish a tagged version, run the server with the new schema and then push the service:

```bash
apollo service:push --key="<API_KEY>" --endpoint="https://example.com/graphql" --tag=beta
```

The only change in this push is the addition of the `--tag` flag on the end of the push command.

<h3 id="sending-tagged-metrics">Running a tagged schema</h3>

To get the most out of using tagged schemas, teams can send metrics to [Engine](https://engine.apollographql.com) associated with this tag. This enables a single service to be tracked in production, staging, and any other environment a schema is being run. To track metrics with a schema, make sure the latest Apollo Server is installed and turn on tagging in one of two ways:

1. Starting up the service with an environment variable called `ENGINE_SCHEMA_TAG` will link metrics sent to Engine with the value of that environment variable. This is the best way to associate metrics so that the schema tag isn't hardcoded into the server.
2. Alternatively, schema tag can be set within the `engine` settings of Apollo Server 2.2 and up:

```js
const server = new ApolloServer({
  // rest of normal server settings
  engine: {
    schemaTag: 'beta',
  },
});
```

Both the new version of the schema, as well as its performance and error metrics can be viewed using [Engine](https://engine.apollographql.com) and can even be used with [schema validation](./schema-validation.html).

<h2 id="history">Schema history</h2>

As your schema grows and evolves to meet the needs of your product, it is helpful to see a history of changes for a team. This allows everyone to know when new features were introduced, when old fields were removed, and even link back to the commit that caused the change. Apollo Engine provides all the tooling needed to track this history in a simple way. Every time your schema is updated, you can simply run the [`apollo service:push`](#publish) command to keep an up to date history of your schema.

Each time a schema is published, it becomes the basis for comparison for validating future schemas and avoiding breaking changes. Therefore, a service should be pushed to [Engine](https://engine.apollographql.com) each time a new schema is deployed.

This is best accomplished from automatic steps within a continuous integration workflow and an example CircleCI configuration is available below.

In order to keep provide accurate analysis of breaking changes, it important to run the `apollo service:push` command each time the schema is deployed. This can be done by configuring continuous integration to run `apollo service:push` automatically on the `master` branch (or the appropriate mainline branch).

Below is a sample configuration for pushing a schema using CircleCI:

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

      # This will authenticate using the `ENGINE_API_KEY` environment
      # variable. If the GraphQL server is available elsewhere than
      # http://localhost:4000/graphql, set it with `--endpoint=<URL>`.

      # When running on the 'master' branch, publish the latest version
      # of the schema to Apollo Engine.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "master" ]; then
            apollo service:push
          fi
```
