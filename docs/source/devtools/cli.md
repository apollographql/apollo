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

* `client` (such as `client:codegen`) for interactions between Apollo Client and Graph Manager
* `service` (such as `service:download`) for interactions between Apollo Server and Graph Manager

For a full list of commands in a particular namespace, use the `apollo help` command:

```
apollo help client
```
