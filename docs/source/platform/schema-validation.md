---
title: Validate schema changes
description: Check if proposed schema changes are safe or breaking by comparing against live server traffic
---

As GraphQL scales within an organization, it becomes harder to evolve the schema while guaranteeing that no query or client will ever break from a change. Some organizations take the approach of just _never_ making schema changes that might be breaking; however, managing an only-ever-growing schema is unnecessarily difficult for most teams. It can actually be very safe to evolve the schema through field removals and return type changes if you have the right tools to guarantee that no such change will ever break an active query.

As such, schema change validation is one of the cornerstones of the [Apollo Platform](/docs/intro/platform.html) and we've built a set of tools to make the workflow possible.

<h2 id="schema-validation">How it works</h2>

Schema validation is possible through the use of Apollo's schema registry and Apollo's trace warehouse, both of which are free to use.

The **schema registry** is used to identify changes between schema versions. The first step of validation is to create the "schema diff" between your local schema (the schema to validate) and the previously registered schema in the registry. By taking the diff between these two schemas, we identify which changes are being proposed and can validate them against live traffic one-by-one.

The **trace warehouse** is used to identify which clients and which operations are using which fields in the schema, in real time. The second step of schema validation is to make sure that none of the proposed changes in the schema diff will affect live traffic in a breaking way. This is done by comparing the fields in the schema diff to the usage of fields seen by the trace warehouse.

If it is determined by the [change algorithm](#algorithm) that one of the proposed changes to a field could be breaking, and that field is still being actively used by clients, the schema validation check will fail. Schema checks are run through the Apollo CLI using the `apollo schema:check` command. Each invocation of the command will trigger a check to be run in registry. The registry will perform the diffing algorithm and talk to the trace warehouse to determine of any of the changes will break live-running clients.

The output of the check is printed to the console, and a URL is provided to see a detailed view of the results in Apollo Engine like so:

```console
~/Development/apollo/example$ apollo schema:check
  ✔ Loading Apollo Project
  ✔ Checking service for changes


Change   Code           Description
───────  ─────────────  ───────────────────────────
FAILURE  FIELD_REMOVED  `User.name` was removed


View full details at: https://engine.apollographql.com/service/example-1234/checks?<DETAILS>
```

<h3 id="algorithm">Change algorithm</h3>

The schema change algorithm uses utilities from the [graphql](https://www.npmjs.com/package/graphql) package to generate a schema diff and identify potentially breaking changes. It then checks with Apollo's trace warehouse to see if any of the changes in the diff will affect active clients and clients.

The following list enumerates which changes types are potentially breaking and the conditions on which each change type will _fail the `apollo service:check` command_.

- **Removals**
  - `FIELD_REMOVED` A field referenced by at least one operation was removed
  - `TYPE_REMOVED` A referenced type(scalar, object) was removed
  - `ARG_REMOVED` A referenced argument was removed
  - `TYPE_REMOVED_FROM_UNION` A type in a union used by at least one operation was removed
  - `INPUT_FIELD_REMOVED` A field in an input type used by at least one operation was removed
  - `VALUE_REMOVED_FROM_ENUM` A value in an enum used by at least one operation was removed
  - `TYPE_REMOVED_FROM_INTERFACE` An object used by at least one operation was removed from an interface
- **Required arguments**
  - `REQUIRED_ARG_ADDED` Non-nullable argument added to field used by at least one operation
  - `NON_NULL_INPUT_FIELD_ADDED` Non-null field added to an input object used by at least one operation
- **In-place updates**
  - `FIELD_CHANGED_TYPE` Field used by at least one operation changed return type
  - `INPUT_FIELD_CHANGED_TYPE` Field in input object referenced in field argument used by at least one operation changed type
  - `TYPE_CHANGED_KIND` Type used by at least one operation changed, ex: scalar to object or enum to union
  - `ARG_CHANGED_TYPE` Argument used by at least one operation changed a type
- **Type extensions**
  - `TYPE_ADDED_TO_UNION` New type added to a union used by at least one operation
  - `TYPE_ADDED_TO_INTERFACE` New interface added to an object used by at least one operation
- **Optional arguments**
  - `ARG_DEFAULT_VALUE_CHANGE` Default value added or changed for argument on a field that is used by at least one operation

> **Note:** This is not an exhaustive list of all possible change types, just breaking change types. Visit the [`graphql` package's repository](https://github.com/graphql/graphql-js/blob/9e404659a15d59c5ce12aae433dd2a636ea9eb82/src/utilities/findBreakingChanges.js#L39) for more details on changes types.

A failed `apollo schema:check` command will exit with a non-0 exit code and fail CI checks on purpose! There are actually many cases where breaking changes can be made intentionally, but should be treated thoughtfully and with intention. Here's an example:

- Changing the return type of a field with queries actively using it is safe **if and only if** the new return type contains the same selection options that all active queries were using the old return type.

<h3 id="severity">Change severity</h3>

The change algorithm identifies two change severities for each diff in a check:

1. **Failure**: Either the schema is invalid or the changes _will_ break current clients.
2. **Notice**: This change is safe and will not break current clients.

Changes are assigned a severity based on the operation reported against the schema(chosen with `--tag`, `current` by default). If an operation uses an affected element, then the change is marked as a `Failure`. When any change in the set is marked as a failure, the overall status of validation dictates the CLI's exit code and GitHub status.

> Note: If no metrics are associated with the tag, then all changes will be assigned `Notice`.f

### CLI output

Running a schema validation check is as simple as running `apollo service:check` on the command line from within a service repository that has been configured to be an Apollo project.

> **Note:** [Skip ahead](#setup) to the setup section for details on how to configure your project for schema change validation.

Running the `apollo service:check` will output the diff of all schema changes found, and highlight changes determined to be breaking as `FAILING`. All other changes in the diff will be labeled with `NOTICE`. Here's a sample of what the output looks like:

```console
~/Development/apollo/example$ apollo schema:check
  ✔ Loading Apollo Project
  ✔ Checking service for changes


Change   Code           Description
───────  ─────────────  ──────────────────────────────────
FAILURE  FIELD_REMOVED  `User.name` was removed
NOTICE   FIELD_ADDED    `User.friends` was added


View full details at: https://engine.apollographql.com/service/example-1234/checks?<DETAILS>
```

A details URL will be generated if there are _any_ changes found by the diff algorithm, even if none of the changes are failing.

### View full change details

Following the details link from the CLI will take you to a special URL on your Engine account where the details of each change in your check and its impact are enumerated in the UI. This URL is unique to each `service:check`.

<img src="../images/schema-checks.png" width="100%" alt="Schema checks page in the Engine UI">

If you [set up your checks on GitHub](#github), the "Details" link in your checks will take you to this special URL as well.

<h2 id="setup">Set up schema validation</h2>

You will need to be actively sending traces to the Apollo trace warehouse and registering schemas to the Apollo schema registry to properly use schema validation. Follow these guides if you have not set these up:

1. [Set up trace reporting to Apollo Engine](/docs/platform/setup-analytics.html) (either through Apollo Server 2+ or the Engine proxy).
1. [Set up schema registration in your continuous delivery pipeline](/docs/platform/schema-registry.html).

For the `apollo schema:check` command to be configured properly, you will also need:

1. [A `.env` file with an `ENGINE_API_KEY`](/docs/platform/schema-registry.html#Get-your-Engine-API-key).
1. [An `apollo.config.js` file with a `service` configured](/docs/platform/schema-registry.html#Create-an-apollo-config-js-file).

If you have set up schema registration, your project may already have its `.env` file and `apollo.config.js` file configured. Once you've got these set up, running your schema check is as simple as running:

```console
apollo service:check
```

The command can be placed in any continuous integration pipeline. To surface results, `apollo` emits an exit code and [integrates with GitHub statuses](#github). By default, the check verifies the schema diff against the past day and can be [configured](#cli-advanced) for a longer time range.

> **Note:** The Apollo CLI will be looking in your Apollo config for a location from which to fetch your local schema and using your ENGINE_API_KEY to authenticate its requests with the Engine service.

<h3 id="service-check-on-ci">Run validation on each commit</h3>

We highly recommended that you set up validation as part of your continuous integration workflow (e.g. CircleCI, etc.). This will help you detect potential problems automatically and display them directly on a pull-requests status checks.

Here's a example of how to add a schema validation check to CircleCI:

```yaml line=29
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
      # variable. Configure your endpoint's location in your Apollo config.
      - run: npx apollo service:check
```

> Note: with a GitHub status check, to allow continuous integration to complete without failing early, ignore the exit code of the `apollo service:check` command. The exit code can be ignored by appending `|| echo 'validation failed'` to the command call.

<h3 id="github">GitHub integration</h3>

![GitHub Status View](../img/schema-history/github-check.png)

Like most tools, schema validation is best used when it is integrated directly into the rest of your workflow. If you're using GitHub, you can install the Apollo Engine GitHub app. This will enable Apollo's systems to send a webhook back to your project on each `apollo schema:check`, providing built-in pass/fail status checks on your pull requests.

Go to [https://github.com/apps/apollo-engine](https://github.com/apps/apollo-engine) and click the `Configure` button to install the Apollo Engine integration on the appropriate GitHub profile or organization.

<h3 id="multiple-environments">Multiple environments</h3>

Product cycles move fast, and it’s common for a schemas to be slightly different across environments as changes make their way through your system. To accommodate for this, schemas can be registered under specific "schema tags
, and checks can be performed against specific "schema tags".

schema registry allows each schema to be registered under a “schema tag”. Tags are mostly commonly used to represent environments, but can also be used to represent things like branches and future schemas. Passing the `--tag` flag to `apollo service:check` specifies which schema to compare against, such as `prod` or `staging`. It's common to run checks against multiple different schema tags during continuous integration to ensure that all important deployments are accounted for. Checking multiple tags will result in check statuses similar to:

<div style="text-align:center">
![multiple service checks](../img/schema-validation/service-checks.png)
</div>

<h3 id="cli-advanced">Advanced configuration</h3>

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
