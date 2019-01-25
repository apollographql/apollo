---
title: Validating schema changes
description: How to maintain the schema's contract via CI
---

A GraphQL schema defines the contract between clients and server that contains the available types and their behavior. When a GraphQL API is deployed, consumers start to request fields and depend on the contract. When the schema is updated, such as adding a field or removing a type, the contract changes. Modifying the schema and contract can have a wide range of impact on clients from positive(more functionality) to adverse(active schema dependencies no longer exist).

The Apollo Platform ensures teams deploy schemas without breaking consumers. To prevent dangerous schema evolution, the `apollo service:check` command compares a proposed schema against the active schema to create a list of changes. To enhance this comparison, the Apollo Platform stores the operations run against the active schema. Upon validation, the Apollo Platform tests that all of those operations still work against the new proposed schema version and marks changes by severity according to their impact. If any change causes a failure, the team is promptly flagged by the CLI or GitHub status with actionable feedback.

<h2 id="cli">Setup `apollo` for schema changes</h2>

To check and validate the difference between the current schema and a new version, run the `apollo service:check` command during continuous integration.

For basic usage, use the following command, substituting the appropriate GraphQL endpoint URL and an API key obtained from the service _Settings_ menu in [Engine](https://engine.apollographql.com/):

```bash
npx apollo service:check --key="<API_KEY>" --endpoint="http://localhost:4000/graphql"
```

The command can be placed in any continuous integration pipeline, such as this [example in CircleCI](#check-schema-on-ci). To surface results, `apollo` emits an exit code and [integrates with GitHub statuses](#github). By default, the check verifies the schema diff against the past day and can be [configured](#cli-advanced) for a longer time range.

> For accuracy, it's best to retrieve the schema from a running GraphQL server (with introspection enabled), though the CLI can also reference a local file. See [config options](../platform/apollo-config.html) for more information.

<h3 id="check-tags">Multiple schemas</h3>

When multiple schemas are [pushed under separate tags](./schema-registry.html), the `--tag` flag specifies which schema to compare against, such as `prod` or `staging`. Often running checks against different schema tags during continuous integration ensures that all important deployments are accounted for. Checking multiple tags will result in check statuses similar to:

<div style="text-align:center">
![multiple service checks](../img/schema-validation/service-checks.png)
</div>

<h2 id="categorize">Categorizing schema changes</h2>

`apollo` buckets schema changes by impact on consumers. Since consumers choose exactly how to use the GraphQL API, the real effect of changes can be unpredictable when inspecting the change in isolation. To properly categorize these changes, the Apollo Platform matches changes with field usage metrics to determine a change's severity.

<h3 id="severity">Change severity</h3>

The Apollo Platform identifies two change severities and reports them on the command line or within a pull request status([setup for GitHub](#github)):

1. **Failure**: Either the schema is invalid or the changes _will_ break current clients.
2. **Notice**: This change is safe and will not break current clients.

Changes are assigned a severity based on the operation reported against the schema(chosen with `--tag`, `current` by default). If an operation uses an affected element, then the change is marked as a `Faulure`. When any change in the set is marked as a failure, the overall status of validation dictates the CLI's exit code and GitHub status.

> Note: If no metrics are associated with the tag, then all changes will be assigned `Notice`.

<h2 id="performing-changes">Strategies for performing schema changes</h2>

Strategies for performing schema changes with minimal impact on clients are necessary to maintainably evolving a schema in response to rapidly changing product requirements. The insight enabling for these techniques is adding new fields, arguments, queries, or mutations won't introduce any new breaking changes. These additive changes can be confidently made without consideration about existing clients or field usage metrics, since GraphQL clients receive exactly what they ask for.

While tempting to modify a field in place, we strongly recommend deprecating the old field and creating a new one instead rather than updating a field in place, which could break current clients. This technique is defined as _Field rollover_, an API change that's an evolution of a field, such as a rename or a change in arguments.

We'll go over these a field rollover and show how to make these changes safely.

<h3 id="renaming-or-removing">Renaming or removing a field</h3>

When a field is unused, renaming or removing can be performed immediately without affecting clients. Unfortunately, additional considerations should be made if a client uses the field or a GraphQL deployment doesn't have per-field usage metrics, especially with a production schema.

For example, let's look at a workflow with the following `Query` type in the base schema:

```graphql
type Query {
  user(id: ID!): User
}
```

A possible change is renaming `user` to `getUser` to be more descriptive, like so:

```graphql
type Query {
  getUser(id: ID!): User
}
```

Assuming some clients use `user`, this would be a breaking change, since those clients expecting a `user` query would receive error.

To make this change safely, we can add a new `getUser` field and leave the existing `user` field untouched.

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

> To prevent code duplication, the resolver logic can be shared between the two fields

<h3 id="deprecating">Deprecating the field</h3>

The previous tactic works well to avoid breaking changes, however consumers don't know to switch to the new field name. To solve this problem and signal the switch, the GraphQL specification provides a built-in `@deprecated` schema directive (sometimes called decorators in other languages):

```
type Query {
  user(id: ID!): User @deprecated(reason: "renamed to 'getUser'")
  getUser(id: ID!): User
}
```

GraphQL-aware client tooling, like [Apollo VScode](./vscode.html), GraphQL Playground, and GraphiQL, use this information to help developers make the right choices. These tools will:

- Provide developers with the helpful deprecation message referring them to the new name.
- Avoid auto-completing the field.

Over time, usage will fall for the deprecated field and grow for the new field.

> the Apollo Platform contains a [trace warehouse](./tracing.html) to enable educated decisions about when to retire a field based on usage data through schema analytics.

<h2 id="alternatives">Alternative evolution strategies</h2>

There are a couple of other possible strategies for maintaining GraphQL api's, such as versioning and making no breaking changes. Each has tradeoffs, which are detailed below:

<h3 id="versioning">Versioning</h3>

Versioning is a technique to prevent necessary changes from becoming breaking changes. Developers who have worked with REST APIs in the past may have various patterns for versioning the API, commonly by using a different URI (e.g. `/api/v1`, `/api/v2`, etc.) or a query parameter (e.g. `?version=1`). With this technique, an application can easily end up with many different API endpoints over time, and the question of _when_ an API can be deprecated can become problematic. While version a GraphQL API the same way may be tempting, multiple graphql endpoints add exponential complexity to schema development and quickly become unmaintainable.

<h3 id="never-breaking">No breaking changes</h3>

Teams can choose to avoid any schema change that might break an operation, ignoring consumer usage. This viable strategy for maintaining clients, since no change will cause a behavior change. Over the long term, this strategy limits the flexibility and usability of the schema. On the other hand, checking changes against usage enables more aggressive improvements to the API, such as removing fields or default argument updates. This freedom often leads to a more positive API experience, which translates to better developer experience and more robust client and server interaction.

<h2 id="github">Continuous Integration and GitHub</h2>

Schema validation is best used when integrated in a team's development workflow. To make this easy, Apollo integrates with GitHub to provide status checks on pull requests when schema changes are proposed. To enable schema validation in GitHub, follow these steps:

![GitHub Status View](../img/schema-history/github-check.png)

<h3 id="install-github">1. Install GitHub application</h3>

Go to [https://github.com/apps/apollo-engine](https://github.com/apps/apollo-engine) and click the `Configure` button to install the Apollo Engine integration on the appropriate GitHub profile or organization.

<h3 id="check-schema-on-ci">2. Run validation on each commit</h3>

After adding `apollo service:check` in a continuous integration workflow (e.g. CircleCI), schema validation is performed automatically and potential problems are displayed directly on a pull request's status checks, providing actionable feedback to developers.

To setup validation, run the `apollo service:check` command targeting a GraphQL server with introspection enabled. An example of is shown below with a CircleCI config:

> Note: with a GitHub status check, to allow continuous integration to complete without failing early, ignore the exit code of the `apollo service:check` command. The exit code can be ignored by appending `|| echo 'validation failed'` to the command call.

```yaml
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:8

    steps:
      - checkout

      - run: npm install

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
      - run: npx apollo service:check
```

<h2 id="cli-advanced">Advanced CLI Usage</h2>

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
