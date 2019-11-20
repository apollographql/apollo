---
title: The Apollo CLI
---

The **Apollo CLI** provides useful commands for interacting with every component of the Apollo platform, including Apollo Client, Apollo Server, and Apollo Graph Manager.

## Download and install

The Apollo CLI is available as an [npm](https://www.npmjs.com/get-npm) package. Install it globally in your development environment with the following command:

```bash
npm install -g apollo
```

After installation completes, run the following command to make sure it was successful:

```bash
apollo
```

## Supported commands

Most of the Apollo CLI's commands are in the following namespaces:

* `client` (such as `apollo client:codegen`) for interactions involving Apollo Client and Graph Manager
* `service` (such as `apollo service:download`) for interactions involving Apollo Server and Graph Manager

For a full list of commands in a particular namespace, use the `apollo help` command:

```
$ apollo help client
Check a client project against a pushed service

USAGE
  $ apollo client:COMMAND

COMMANDS
  client:check            Check a client project against a pushed service
  client:codegen          Generate static types for GraphQL queries. Can use the published
                          schema in Apollo Engine or a downloaded schema.
  client:download-schema  Download a schema from engine or a GraphQL endpoint.
  client:extract          Extract queries from a client
  client:push             Register operations with Apollo, adding them to the safelist
```

You can also obtain the full set of options for an individual command like so:

```
$ apollo help client:codegen
```
