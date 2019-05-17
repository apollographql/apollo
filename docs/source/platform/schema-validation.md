---
title: Validating schema changes
description: Check if schema changes are safe or breaking by comparing against live server traffic
---

Making schema changes is a natural part of evolving your API over time. GraphQL is flexible, and there are certain change types, like removing a field, that could be potentially breaking to clients in the field

As GraphQL schemas evolve over time, it's important to make sure that changes to the schema never break actively running clients and queries by accident.

As GraphQL scales within and organization and your schema evolves, it's important to validate that changes

As GraphQL scales within an organization, it’s important in schema evolution to keep current queries and clients in mind and to avoid breaking changes. Some organizations take the approach of _never_ making schema changes that might be breaking, which leads to an ever-growing schema and reduced api accessibility. In reality, removing fields and updating return types is safe when done with tools that guarantee no change will ever break an active query.

As such, schema change validation is one of the cornerstones of the [Apollo Platform](/docs/intro/platform.html) and we've built a set of tools to make the workflow possible.

> **Note:** Schema validation is an Apollo Platform feature available on the [Team and Enterprise plans](https://www.apollographql.com/plans/). To get started, sign up for [Engine](https://engine.apollographql.com) and upgrade to a [Team plan](https://engine.apollographql.com/upgrade).

<h2 id="schema-validation">How it works</h2>

Schema validation is an Apollo CLI command that is configured and run within your server's repository. When you run `apollo service:check`, the command fetches the necessary data from Engine's schema registry and trace warehouse to perform validation. Engine computes a schema diff and then compare each change in the diff against the live usage data from your server to determine if any of the changes are "breaking changes" for any of your clients or queries.

Here's how it works:

1. You run `apollo service:check` locally or in CI. The proposed schema is sent to Engine's schema registry.
1. Engine creates a diff between the local schema and the most recently published schema in the registry.
1. Engine fetches a list of all operations sent to your service in the last day (time window is [configurable](#cli-advanced)).
1. Engine walks through the schema diff change-by-change and compares against the operation list to see if the changes will affect the behavior of any operations.
1. Engine returns the schema diff and indicates any breaking changes found.
1. The CLI prints the output of this check with a link to view more details in the Engine UI.

<h3 id="algorithm">Breaking change detection</h3>

The following sections describe the rules that Engine uses to determine when a change type will fail the `apollo service:check` command and return a non-0 exit code. These failing changes, if deployed without special consideration, could cause clients to experience unexpected behavior from your API.

#### Removals

Each of these change types removes a schema element. If an element is being actively used by an operation and is removed from your schema, your GraphQL layer will start returning errors to the dependent operations.

<ul>
  <li id="FIELD_REMOVED">
    <code>FIELD_REMOVED</code>: Field used by at least one operation was removed
  </li>
  <li id="TYPE_REMOVED">
    <code>TYPE_REMOVED</code>: Type(scalar, object) used by at least one operation was removed
  </li>
  <li id="ARG_REMOVED">
    <code>ARG_REMOVED</code>: Argument was removed from a field used by at least one operation
  </li>
  <li id="TYPE_REMOVED_FROM_UNION">
    <code>TYPE_REMOVED_FROM_UNION</code>: Type was removed from a union used by at least one operation
  </li>
  <li id="INPUT_FIELD_REMOVED">
    <code>INPUT_FIELD_REMOVED</code>: Field removed from an input type referenced by an argument on a field used by at least one operation
  </li>
  <li id="VALUE_REMOVED_FROM_ENUM">
    <code>VALUE_REMOVED_FROM_ENUM</code>: A value removed from an enum used by at least one operation
  </li>
  <li id="TYPE_REMOVED_FROM_INTERFACE">
    <code>TYPE_REMOVED_FROM_INTERFACE</code>: An object removed from an interface used by at least one operation
  </li>
</ul>

#### Required arguments

Each of these changes adds a required input to a schema element. If an operation is actively using an element and doesn't update itself to add the new required input argument, the GraphQL layer will start returning an error to the operation.

<ul>
  <li id="REQUIRED_ARG_ADDED">
    <code>REQUIRED_ARG_ADDED</code>: Non-nullable argument added to field used by at least one operation
  </li>
  <li id="NON_NULL_INPUT_FIELD_ADDED">
    <code>NON_NULL_INPUT_FIELD_ADDED</code>: Non-null field added to an input object used by at least one operation
  </li>
</ul>

#### In-place updates

Each of these changes updates an existing schema element. If an operation is activley using an element and that element is updated, the operation could start receiving an error from the GraphQL layer or, in some cases, an unexpected result.

> **Note:** In some cases, these changes are compatible with the client at runtime, such as a type rename or an object to interface conversion with the same fields. Schema validation still marks these breaking changes because validation does not have enough information to ensure safety and these changes deserve extra scrutiny, such as their impact on type generation.

<ul>
  <li id="FIELD_CHANGED_TYPE">
    <code>FIELD_CHANGED_TYPE</code>: Field used by at least one operation changed return type
  </li>
  <li id="INPUT_FIELD_CHANGED_TYPE">
    <code>INPUT_FIELD_CHANGED_TYPE</code>: Field in input object changed type and is referenced by argument on field used by at least one operation
  </li>
  <li id="TYPE_CHANGED_KIND">
    <code>TYPE_CHANGED_KIND</code>: Type used by at least one operation changed, ex: scalar to object or enum to union
  </li>
  <li id="ARG_CHANGED_TYPE">
    <code>ARG_CHANGED_TYPE</code>: Argument changed type on field used by at least one operation
  </li>
</ul>

#### Type extensions

These changes add a type to an existing union or interface. If an operation is actively using an element of the union or interface, it could receive and unexpected result when updated depending on the fragment spreads requested.

<ul>
  <li id="TYPE_ADDED_TO_UNION">
    <code>TYPE_ADDED_TO_UNION</code>: Type added to a union used by at least one operation
  </li>
  <li id="TYPE_ADDED_TO_INTERFACE">
    <code>TYPE_ADDED_TO_INTERFACE</code>: Interface added to an object used by at least one operation
  </li>
</ul>

#### Default arguments

These changes update the default value for an argument. If an operation does not specify a value for this argument and relies on the value, the operation can experience unexpected results when the schema is updated, which can lead to modified client behavior.

<ul>
  <li id="ARG_DEFAULT_VALUE_CHANGE">
    <code>ARG_DEFAULT_VALUE_CHANGE</code>: Default value added or changed for argument on a field used by at least one operation
  </li>
</ul>

#### Non-breaking changes

These changes can be returned by the `service:check` command and are compatible with existing clients by default. They will not affect the behavior of clients if deployed.

<ul>
  <li>Optional arguments</li>
  <ul>
    <li id="OPTIONAL_ARG_ADDED"><code>OPTIONAL_ARG_ADDED</code> Nullable argument added to a field</li>
    <li id="NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT"><code>NULLABLE_FIELD_ADDED_TO_INPUT_OBJECT</code> Nullable field added to an input object</li>
  </ul>
  <li>Additions</li>
  <ul>
    <li id="FIELD_ADDED"><code>FIELD_ADDED</code> Field added to a type</li>
    <li id="TYPE_ADDED"><code>TYPE_ADDED</code> Type added to the schema</li>
    <li id="VALUE_ADDED_TO_ENUM"><code>VALUE_ADDED_TO_ENUM</code> Value added to an enum. If clients contain a switch case on the enum and do not include the `default`, this change could cause unexpected behavior</li>
  </ul>
  <li>Deprecations</li>
  <ul>
    <li id="FIELD_DEPRECATED"><code>FIELD_DEPRECATED</code> Field deprecated</li>
    <li id="FIELD_DEPRECATION_REMOVED"><code>FIELD_DEPRECATION_REMOVED</code> Field no longer deprecated</li>
    <li id="FIELD_DEPRECATED_REASON_CHANGE"><code>FIELD_DEPRECATED_REASON_CHANGE</code> Reason for deprecation changed</li>
    <li id="ENUM_DEPRECATED"><code>ENUM_DEPRECATED</code> Enum deprecated</li>
    <li id="ENUM_DEPRECATION_REMOVED"><code>ENUM_DEPRECATION_REMOVED</code> Enum no longer deprecated</li>
    <li id="ENUM_DEPRECATED_REASON_CHANGE"><code>ENUM_DEPRECATED_REASON_CHANGE</code> Reason for enum deprecation changed</li>
  </ul>
</ul>

### Validation response

Running a schema validation check is as simple as running `apollo service:check` on the command line from within a service repository
that is configured to be an Apollo project.

Running `apollo service:check` will output the diff of all schema changes found and highlight changes determined to be breaking. Here's an example:

```console
$ npx apollo service:check --tag=prod
  ✔ Loading Apollo Project
  ✔ Validated local schema against tag prod on service engine
  ✔ Compared 8 schema changes against 110 operations over the last 24 hours
  ✖ Found 3 breaking changes and 5 compatible changes
    → breaking changes found

FAIL    ARG_REMOVED                `ServiceMutation.checkSchema` arg `gitContext` was removed
FAIL    FIELD_REMOVED              `Schema.fieldCount` was removed
FAIL    FIELD_REMOVED              `Schema.typeCount` was removed

PASS    FIELD_ADDED                `SchemaTag.schemaRepoID` was added
PASS    FIELD_CHANGED_TYPE         `ServiceMutation.uploadPartialSchema` changed type from `UploadPartialSchemaResponse!` to `CompositionResult!`
PASS    FIELD_DEPRECATION_REMOVED  `IntrospectionSchema.fieldCount` is no longer deprecated
PASS    FIELD_DEPRECATION_REMOVED  `IntrospectionSchema.typeCount` is no longer deprecated
PASS    TYPE_REMOVED               `UploadPartialSchemaResponse` removed

View full details at: https://engine.apollographql.com/service/example-1234/check/<DETAILS>
```

Each change to the schema will be labeled with `PASS` or `FAIL` and a URL with full details on the changes and their impact on clients and operations will be generated. Following the URL will take you to Engine:

<img src="../img/schema-validation/service-check-page.png" width="100%" alt="Service check page in the Engine UI">

> **Note:** If you have [set up your validation checks on your GitHub PRs](#github), the "Details" link in your checks will also take you to the generated details URL.

A failed `apollo service:check` command will exit with a non-0 exit code and fail CI checks! There are many cases where it is safe to make a potentially breaking change, as long as the change is made intentionally with an understanding of its impact.

Since breaking changes are detected using live traffic, **your service will need active metrics** for the change algorithm to detect failures. If there are no metrics associated with your service, _all_ changes will be labeled as a `PASS` as opposed to a `FAIL`.

<h2 id="setup">Set up schema validation</h2>

To get started with schema validation, you wlil first need to be actively sending traces and registering schemas to Apollo's system:

1. [Set up trace reporting to Apollo Engine](/docs/references/setup-analytics).
1. [Set up schema registration in your continuous delivery pipeline](/docs/platform/schema-registry.html).

Next, you will need to configure your project for the `apollo service:check` command:

1. [Set up a `.env` file with your `ENGINE_API_KEY`](/docs/platform/schema-registry.html#Get-your-Engine-API-key).
1. [Set up an `apollo.config.js` file with a `service` configured](/docs/platform/schema-registry.html#Create-an-apollo-config-js-file).

> **Note:** If you have set up one of Apollo's workflows previously, your project may already have its `.env` file and `apollo.config.js` file configured.

Once you've got these set up, running your schema check is as simple as running:

```console
$ npm install apollo
$ npx apollo service:check
```

The command can be placed in any continuous integration pipeline. To surface results, `apollo` emits an exit code and [integrates with GitHub statuses](#github). The check command validates against traffic from the past day by default, but this time window can be [configured](#cli-advanced) to be a longer range.

> **Note:** The Apollo CLI will be looking in your Apollo config for a location from which to fetch your local schema and using your ENGINE_API_KEY to authenticate its requests with the Engine service.

<h3 id="service-check-on-ci">Run validation on each commit</h3>

We highly recommended that you add validation to your continuous integration workflow (e.g. Jenkins, CircleCI, etc.). In doing so, you can detect potential problems automatically and display the results of checks directly on pull requests.

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

> **Note:** If you're using GitHub status checks, we recommend ignoring the exit code of the `apollo service:check` command so your continuous integration can complete without failing early. This can be done by appending `|| echo 'validation failed'` to the command call.

<h3 id="github">GitHub integration</h3>

<div style="text-align:center">

![GitHub Status View](../img/schema-validation/github-check.png)

</div>

Like most tools, schema validation is best used when it is integrated directly into the rest of your workflow. If you're using GitHub, you can install the Apollo Engine GitHub app. This will enable Apollo's systems to send a webhook back to your project on each `apollo service:check`, providing built-in pass/fail status checks on your pull requests.

To install the Apollo Engine integration on GitHub, go to [https://github.com/apps/apollo-engine](https://github.com/apps/apollo-engine), click the `Configure` button, and select the appropriate GitHub profile or organization.

### Posting a comment to your PRs

For teams using GitHub Enterprise, Bitbucket, and other source control tools, we recommend setting up your CI to post a comment on your PRs with the results of schema validation. Surfacing schema diffs and breaking changes directly in your PR will speed up your review workflow by saving you the time of combing through your CI logs to check wether or not validation has passed.

The CLI supports passing a `--markdown` flag to `apollo service:check`, which outputs the results of schema validation in a markdown format specifically. This markdown can be piped directly into a comment to your source control tool, like in [this example of posting a comment with the results of schema validation to GitHub](https://gist.github.com/daniman/e53d0589d18b778878bd8ef32d2e793c).

The output of `apollo service:check --markdown` looks like this:

```md
### Apollo Service Check

🔄 Validated your local schema against schema tag `staging` on service `engine`.
🔢 Compared **18 schema changes** against **100 operations** seen over the **last 24 hours**.
❌ Found **7 breaking changes** that would affect **3 operations** across **2 clients**

🔗 [View your service check details](https://engine.apollographql.com/service/engine/checks?...).
```

<h3 id="multiple-environments">Multiple environments</h3>

Product cycles move fast, and it’s common for schemas to be slightly different across environments as changes make their way through your system. To accommodate for this, schemas can be registered under specific schema tags and checks can be performed against specific schema tags.

Tags mostly commonly represent environments and can also indicate branches or future schemas. Passing the `--tag` flag to `apollo service:check` specifies which schema to compare against, such as `prod` or `staging`. It's common to run checks against multiple different schema tags during continuous integration to ensure that all important deployments are accounted for. Checking multiple tags will result in check statuses similar to:

<div style="text-align:center">

![multiple service checks](../img/schema-validation/multi-github-check.png)

</div>

<h2 id="cli-advanced">Adjusting validation parameters</h2>

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
npx apollo service:check \
# Validate the schema against operations that have run in the last 5 days
--validationPeriod=P5D \
# Only validate against operations that have run at least 5 times during the 5 day duration
--queryCountThreshold=5 \
# Only validate against operations that account for at least 3% of total operation volume
--queryCountThresholdPercentage=3
```
