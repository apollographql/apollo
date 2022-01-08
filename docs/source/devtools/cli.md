---
title: The Apollo CLI
sidebar_title: The Apollo CLI (partially deprecated)
---

> ⚠️ **Important:** All `apollo service:*` commands are now **deprecated** in favor of commands in the [Rover CLI](https://www.apollographql.com/docs/rover/).

The **Apollo CLI** provides useful commands for interacting with every component of the Apollo platform, including Apollo Client, Apollo Server, and Apollo Studio.

## Download and install

The Apollo CLI is available as an [npm](https://www.npmjs.com/get-npm) package.

### Project-level installation (recommended)

If your project uses `npm`, we recommend installing the Apollo CLI locally by adding it to your project's `devDependencies`, like so:

```bash
npm install -D apollo
```

This helps make sure that all of your project's collaborators have the same version of the CLI installed.

### Global installation

You can install the CLI globally in your development environment with the following command:

```bash
npm install -g apollo
```

## Provide an API key

Like all other tools, the Apollo CLI requires an API key to communicate with Apollo Studio. For each of your projects, [obtain a graph API key](https://www.apollographql.com/docs/studio/api-keys/#graph-api-keys) for the project's associated graph, and set that key as the value of `APOLLO_KEY` in your application's `.env` file:

```js:title=.env
APOLLO_KEY=service:docs-example-graph:NYKgCqwfCyYPIm84WVXCdw
```

Alternatively, you can provide an API key to individual CLI commands with the `--key` option:

```
apollo client:check --graph=MyGraph --key=service:docs-example-graph:NYKgCqwfCyYPIm84WVXCdw
```

## Supported commands

Most of the Apollo CLI's commands are in the following namespaces:

* `client` (such as `apollo client:codegen`) for interactions involving Apollo Client and Apollo Studio
* `service` (such as `apollo service:check`) for interactions involving Apollo Server and Apollo Studio
    * ⚠️ **Important:** All `apollo service:*` commands are now **deprecated** in favor of commands in the [Rover CLI](https://www.apollographql.com/docs/rover/).

For a full list of commands in a particular namespace, use the `apollo help` command:

> Omit `npx` from the example commands below if you [installed the Apollo CLI globally](#global-installation).

```
$ npx apollo help client
Check a client project against a pushed service

USAGE
  $ apollo client:COMMAND

COMMANDS
  client:check            Check a client project against a pushed service
  client:codegen          Generate static types for GraphQL queries. Can use the
                          published schema in the Apollo registry or a
                          downloaded schema.
  client:download-schema  Download a schema from Apollo or a GraphQL endpoint in
                          JSON or SDL format
  client:extract          Extract queries from a client
  client:push             Register operations with Apollo, adding them to the
                          safelist
```

You can also obtain the full set of options for an individual command like so:

```
$ npx apollo help client:codegen
```
