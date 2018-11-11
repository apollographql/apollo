---
title: Schema validation and CI
description: How to validate your schema in your existing CI workflow
---

The Apollo GraphQL Platform allows developers to confidently iterate a GraphQL schema by validating the new schema against field-level usage data from the previous schema. By knowing exactly which clients will be broken by a new schema, developers can avoid inadvertently deploying a breaking change.

A GraphQL schema can change in a number of ways between releases and, depending on the type of change, can affect clients in a variety of ways. Since changes can range from "decidedly safe" to "certain breakage", it's helpful to use schema tools which are aware of actual API usage.

By comparing a new schema to the last published schema, the Apollo Platform can highlight points of concern by showing detailed schema changes alongside current usage information for those fields. With this pairing of data, the risks of changes can be greatly reduced.

<h2 id="cli">Checking schema changes with the Apollo CLI</h2>

To check and see the difference between the current published schema and a new version, run the following command, substituting the appropriate GraphQL endpoint URL and an API key:

> An API key can be obtained from a service's _Settings_ menu within the [Apollo Engine dashboard](https://engine.apollographql.com/).

```bash
apollo service:check --key="<API_KEY>" --endpoint="http://localhost:4000/graphql"
```

> For accuracy, it's best to retrieve the schema from a running GraphQL server (with introspection enabled), though the CLI also reference a local file. See [config options](../resources/apollo-config.html) for more information.

After analyzing the changes against current usage metrics, Apollo will identify three categories of changes and report them to the developer on the command line or within a GitHub pull-request:

1. **Failure**: Either the schema is invalid or the changes _will_ break current clients.
2. **Warning**: There are potential problems that may come from this change, but no clients are immediately impacted.
3. **Notice**: This change is safe and will not break current clients.

The more [performance metrics](./performance.html) that Apollo has, the better the report of these changes will become.

<h2 id="github">GitHub Integration</h2>

![GitHub Status View](../img/schema-history/github-check.png)

Schema validation is best used when integrated in a team's development workflow. To make this easy, Apollo integrates with GitHub to provide status checks on pull requests when schema changes are proposed. To enable schema validation in GitHub, follow these steps:

<h3 id="install-github">Install GitHub application</h3>

Go to [https://github.com/apps/apollo-engine](https://github.com/apps/apollo-engine) and click the `Configure` button to install the Apollo Engine integration on the appropriate GitHub profile or organization.

<h3 id="check-schema-on-ci">Run validation on each commit</h3>

By enabling schema validation in a continuous integration workflow (e.g. CircleCI, etc.), validation can be performed automatically and potential problems can be displayed directly on a pull-request's status checks — providing feedback to developers where they can appreciate it the most.

To run the validation command, the GraphQL server must have introspection enabled and run the `apollo service:check` command. An example of what this could look like is shown below with a CircleCI config:

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
      - run: apollo service:check

      # When running on the 'master' branch, publish the latest version
      # of the schema to Apollo Engine.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "master" ]; then
            apollo schema:publish
          fi
```
