---
title: The Apollo CLI
---

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

## Supported commands

Most of the Apollo CLI's commands are in the following namespaces:

* `client` (such as `apollo client:codegen`) for interactions involving Apollo Client and Apollo Studio
* `service` (such as `apollo service:check`) for interactions involving Apollo Server and Apollo Studio

For a full list of commands in a particular namespace, use the `apollo help` command:

> Omit `npx` from the example commands below if you [installed the Apollo CLI globally](#global-installation).

```
$ npx apollo help client
Check a client project against a pushed service

USAGE
  $ apollo client:COMMAND

COMMANDS
  client:check            Check a client project against a pushed service
  client:codegen          Generate static types for GraphQL queries. Can use the published
                          schema in Apollo Studio or a downloaded schema.
  client:download-schema  Download a schema from Apollo Engine or a GraphQL endpoint.
  client:extract          Extract queries from a client
  client:push             Register operations with Apollo, adding them to the safelist
```

You can also obtain the full set of options for an individual command like so:

```
$ npx apollo help client:codegen
```
