---
title: Validating schema changes
description: How to validate your schema in your existing CI workflow
---

The Apollo GraphQL Platform allows developers to confidently iterate a GraphQL schema by validating the new schema against field-level usage data from the previous schema. By knowing exactly which clients will be broken by a new schema, developers can avoid inadvertently deploying a breaking change.

A GraphQL schema can change in a number of ways between releases and, depending on the type of change, can affect clients in a variety of ways. Since changes can range from "decidedly safe" to "certain breakage", it's helpful to use schema tools which are aware of actual API usage.

By comparing a new schema to the last published schema, the Apollo Platform can highlight points of concern by showing detailed schema changes alongside current usage information for those fields. With this pairing of data, the risks of changes can be greatly reduced.

<h2 id="versioning">Understanding schema changes</h2>

Versioning is a technique to prevent necessary changes from becoming "breaking changes" which affect the existing consumers of an API. These iterations might be as trivial as renaming a field, or as substantial as refactoring the whole data model.

Developers who have worked with REST APIs in the past have probably recognized various patterns for versioning the API, commonly by using a different URI (e.g. `/api/v1`, `/api/v2`, etc.) or a query parameter (e.g. `?version=1`). With this technique, an application can easily end up with many different API endpoints over time, and the question of _when_ an API can be deprecated can become problematic.

It might be tempting to version a GraphQL API the same way, but it's unnecessary with the right techniques. By following the strategies and precautions outlined in this guide and using Apollo tooling that adds clarity to every change, many iterations of an API can be served from a single endpoint.

<h3 id="field-usage">Field usage</h3>

Rather than returning extensive amounts of data which might not be necessary, GraphQL allows consumers to specify exactly what data they need. This field-based granularity is valuable and avoids "over-fetching", but also makes it more difficult to understand which parts of the schema are used.

To improve the understanding of field usage within an API, Apollo Server extends GraphQL with rich tracing data that demonstrates _how_ a GraphQL field is used and _when_ it's safe to change or eliminate a field.

> For details on how tracing data can be used to avoid shipping breaking changes to clients, check out the schema history tooling in [Apollo Engine](https://www.apollographql.com/platform) which utilizes actual usage data to provide warnings and notices about changes that might break existing clients.

Since GraphQL clients only receive exactly what they ask for, adding new fields, arguments, queries, or mutations won't introduce any new breaking changes and these changes can be confidently made without consideration about existing clients or field usage metrics.

_Field rollover_ is a term given to an API change that's an evolution of a field, such as a rename or a change in arguments. Some of these changes can be really small, resulting in many variations and making an API harder to manage.

We'll go over these two kinds of field rollovers separately and show how to make these changes safely.

<h3 id="renaming-or-removing">Renaming or removing a field</h3>

When a field is unused, renaming or removing it is as straightforward as it sounds: it can be renamed or removed. However, if a GraphQL deployment doesn't have per-field usage metrics, additional considerations should be made. The following example demonstrates a safe approach to renaming a field.

Take the following `user` query as an example:

```graphql
type Query {
  user(id: ID!): User
}
```

We may want to rename it to `getUser` to be more descriptive of what the query is for, like so:

```graphql
type Query {
  getUser(id: ID!): User
}
```

Even if that was the only change, this would be a breaking change for some clients, since those expecting a `user` query would receive error.

To make this change safely, instead of renaming the existing field we can simply add a new `getUser` field and leave the existing `user` field untouched. To prevent code duplication, the resolver logic can be shared between the two fields:

```js
const getUserResolver = (root, args, context) => {
  context.User.getById(args.id);
};

const resolvers = {
  Query: {
    getUser: getUserResolver,
    user: getUserResolver
  }
};
```

<h3 id="deprecating">Deprecating a field</h3>

The tactic we used works well to avoid breaking changes, but we still haven’t provided a way for consumers to know that they should switch to using the new field name. Luckily, the GraphQL specification provides a built-in `@deprecated` schema directive (sometimes called decorators in other languages):

```
type Query {
  user(id: ID!): User @deprecated(reason: "renamed to 'getUser'")
  getUser(id: ID!): User
}
```

GraphQL-aware client tooling, like GraphQL Playground and GraphiQL, use this information to assist developers in making the right choices. These tools will:

- Provide developers with the helpful deprecation message referring them to the new name.
- Avoid auto-completing the field.

Over time, usage will fall for the deprecated field and grow for the new field.

> Using tools like [Apollo Engine](https://www.apollographql.com/platform), it’s possible to make educated decisions about when to retire a field based on actual usage data through schema analytics.

<h3 id="non-breaking">Non-breaking changes</h3>

Sometimes we want to keep a field, but change how clients use it by adjusting its variables. For example, if we had a `getUsers` query that we used to fetch user data based off of a list of user `ids`, but wanted to change the arguments to support a `groupId` to look up users of a group or filter the users requested by the `ids` argument to only return users in the group:

```graphql
type Query {
  # what we have
  getUsers(ids: [ID!]!): [User]!

  # what we want to end up with
  getUsers(ids: [ID!], groupId: ID!): [User]!
}
```

Since this is an _additive_ change, and doesn't actually change the default behavior of the `getUsers` query, this isn't a breaking change!

<h3 id="breaking">Breaking changes</h3>

An example of a breaking change on an argument would be renaming (or deleting) an argument.

```graphql
type Query {
  # What we have.
  getUsers(ids: [ID!], groupId: ID!): [User]!

  # What we want to end up with.
  getUsers(ids: [ID!], groupIds: [ID!]): [User]!
}
```

There's no way to mark an argument as deprecated, but there are a couple options.

If we wanted to leave the old `groupId` argument active, we wouldn't need to do anything; adding a new argument isn't a breaking change as long as existing functionality doesn't change.

Instead of supporting it, if we wanted to remove the old argument, the safest option would be to create a new field and deprecate the current `getUsers` field.

Using an API management tool, like the Apollo platform, it’s possible to determine when usage of an old field has dropped to an acceptable level and remove it. The previously discussed [field rollover](#field-rollover) section gives more info on how to do that.

Of course, it’s also possible to leave the field in place indefinitely!

<h2 id="cli">Checking schema changes with the Apollo CLI</h2>

To check and see the difference between the current published schema and a new version, run the following command, substituting the appropriate GraphQL endpoint URL and an API key:

> An API key can be obtained from a service's _Settings_ menu within the [Apollo Engine dashboard](https://engine.apollographql.com/).

```bash
apollo service:check --key="<API_KEY>" --endpoint="http://localhost:4000/graphql"
```

> For accuracy, it's best to retrieve the schema from a running GraphQL server (with introspection enabled), though the CLI also reference a local file. See [config options](../platform/apollo-config.html) for more information.

After analyzing the changes against current usage metrics, Apollo will identify three categories of changes and report them to the developer on the command line or within a GitHub pull-request:

1. **Failure**: Either the schema is invalid or the changes _will_ break current clients.
2. **Warning**: There are potential problems that may come from this change, but no clients are immediately impacted.
3. **Notice**: This change is safe and will not break current clients.

<h3 id="cli-advanced">Advanced CLI Usage</h3>

Depending on the requirements of your application, you may want to configure the timeframe to validate operations against. You can do so by providing a `validationPeriod` flag to the CLI. The timeframe will always end at "now", and go back in time by the amount specified.

```bash
apollo service:check --validationPeriod=P2W
```

> Valid durations are represented in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations). It can also be provided as a number in seconds, i.e. 86400 for a single day.

Two other parameters for customizing the results of `service:check` are threshold values. For example, you may wish to drop support for an old version of an app in order to remove some deprecated fields. Using these parameters, you can decide what amount of breakage is acceptable before shipping any breaking changes.

- `queryCountThreshold` - This flag will only validate the schema against operations that have been executed at least the specified number of times within the provided duration.
- `queryCountThresholdPercentage` - Similar to `queryCountThreshold`, but expressed as a percentage of all operation volume.
  > Note: these flags are compatible with each other. In the case that both are provided, an operation must meet or exceed both thresholds.

If you have requests for other filtering or threshold mechanisms, we'd love to hear them! Please feel free to submit a [feature request](https://github.com/apollographql/apollo-tooling/issues/new?template=feature-request.md) or PR to the [apollo-tooling](https://github.com/apollographql/apollo-tooling/) repo.

```bash
apollo service:check \
# Validate the schema against operations that have run in the last 5 days
--validationPeriod=P5D \
# Only validate against operations that have run at least 5 times during the 5 day duration
--queryCountThreshold=5 \
# Only validate against operations that account for at least 3% of total operation volume
--queryCountThresholdPercentage=3
```

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
            apollo service:push
          fi
```
