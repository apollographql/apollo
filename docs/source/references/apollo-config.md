---
title: Configuring Apollo projects
description: How to configure Apollo VS Code and CLI with apollo.config.js
---

Apollo projects are configured using an `apollo.config.js` file at the root of your project. The Apollo tools leverage what you've put in the Apollo config, reducing the net amount of configuration you need to do in your project in the end.

If you're using one of our workflow tools like the Apollo CLI or the Apollo VS Code extension, you'll need to have an `apollo.config.js` project to get the features those tools bring.

There are two types of projects, `client` and `service`, which can be in the same configuration file if necessary. This document describes all the options available in the Apollo config and defines which are required vs. optional.

<h2 id="client-config">Client projects</h2>

Client projects are configured through a top level `client` key in the config.

```js line=2
module.exports = {
  client: { ... },
};
```

### `service`

**Required** –– the CLI and VS Code extension rely on knowledge of your schema to show you "intellisense" (eg. autocomplete on fields, metrics annotations, query validation).

There are a few different ways you can link your client to a schema:
1. Use the Apollo [schema registry](/docs/platform/schema-registry.html)
1. With a remote endpoint (from a running server)
1. With a local schema file

#### _Option 1_: Use the Apollo schema registry

To link your client to a schema through the Apollo schema registry, you'll need to have at least one version of your schema uploaded to the [registry](/docs/platform/schema-registry.html).

If you have an Engine service set up and tracking your schema's history, you can point your client to that very simply by putting the id of your service in your Apollo config:

```js line=3
module.exports = {
  client: {
    service: 'my-apollo-service', // the id of your service in Engine (from the URL)
  },
};
```

If you're tracking different versions of your schema in the registry using schema tags, you can include the tag you're interested in linking your client to like so:

```js line=3
module.exports = {
  client: {
    service: 'my-apollo-service@beta', // "beta" is the schema tag we're using
  },
};
```
If a schema tag is not specified, the default value is `current`.

#### Option 2: Link a schema from a remote endpoint

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js line=3-11
module.exports = {
  client: {
    service: {
      name: 'github',
      url: 'https://api.github.com/graphql',
      // optional headers
      headers: {
        authorization: 'Bearer lkjfalkfjadkfjeopknavadf',
      },
      // optional disable SSL validation check
      skipSSLValidation: true,
    },
  },
};
```

#### Option 3: Link a schema from a local file

In some cases, teams may have a local generated file of their schema they want to link. This can be either a `.graphql` file with the schma in SDL, or a saved introspection result in `.json`. To link a client with a local file, configure the project like this:

```js line=3-6
module.exports = {
  client: {
    service: {
      name: 'my-service-name',
      localSchemaFile: './path/to/schema.graphql',
    },
  },
};
```

### `includes`, `excludes`

*Optional* –– by default, Apollo tools will look under a `./src` directory to find all operations and SDL to extract.

Client projects often contain client-side schema definitions for local state with Apollo Client. To make sure the Apollo CLI and VS Code extension can find these files and read them correctly, you may need to add some additional definitions in your config file. To configure which folders to include, and which to ignore, adjust your config like so:

```js line=3-4
module.exports = {
  client: {
    includes: ['./imports/**/*.js'],
    excludes: ['**/__tests__/**/*'],
  },
};
```

### `tagName`

*Optional* –– custom tagged template literal.

When using GraphQL with JavaScript or TypeScript projects, it is common to use the `gql` tagged template literal to write out operations. Apollo tools will be looking through your files for the `gql` tag to extract your queries, so if you use a different template literal, you can configure it like so:

```js line=3
module.exports = {
  client: {
    tagName: 'graphql',
  },
};
```

### `addTypename`

*Optional* –– Apollo will by default add the `__typename` field to all operations automatically.

GraphQL clients like Apollo Client often add the `__typename` field to operations automatically when they're sent over the wire. This can come in really handy for things like caching, but it can be turned off by adding `addTypename: false` to the client config:

```js line=3
module.exports = {
  client: {
    addTypename: false,
  },
};
```

### `clientOnlyDirectives`, `clientSchemaDirectives`

*Optional* –– By default, Apollo projects support the following client-side directives:

- `@client` for local state
- `@rest` for using apollo-link-rest
- `@connection` for custom pagination with Apollo Client
- `@type` for dynamic type names with apollo-link-rest

Client side applications can use custom directives on their queries that aren't meant to be sent to the server. Configuration of client side directives beyond the defaults listed above can be set up like so:

```js line=3-4
module.exports = {
  client: {
    clientOnlyDirectives: ['connection', 'type'],
    clientSchemaDirectives: ['client', 'rest'],
  },
};
```

`clientOnlyDirectives` are directives that should be stripped out of the operation before being sent to the server. An example of this is the `@connection` directive.

`clientSchemaDirectives` are directives that indicate a portion of the operation that is not meant to be sent to the server. These directives are removed as well as the fields they are placed on. An example of this type of of directive is the `@client` directive.

<h2 id="service-config">Server projects</h2>

Server projects are configured through a top level `service` key in the config.

```js line=2
module.exports = {
  service: { ... },
};
```

Setting up a `service` in your Apollo config will save you from needing to use flags your Apollo CLI commands like `apollo service:push` and `apollo service:check`. You can set up the schema for your service to load in one of two ways:
1. Using a remote endpoint
1. Using a local schema file

<h4 id="service-remote-endpoint">Option 1: Remote endpoint</h4>

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js line=2-10
module.exports = {
  service: {
    endpoint: {
      url: 'https://api.github.com/graphql', // defaults to http://localhost:4000
      headers: { // optional
        authorization: 'Bearer lkjfalkfjadkfjeopknavadf',
      },
      skipSSLValidation: true, // optional, disables SSL validation check
    },
  },
};
```

<h4 id="service-local-file">Option 2: Local schema</h4>

In some cases, teams may have a local generated file of their schema that they want to link. This can be either a `.graphql` file with the schma in SDL, or a saved introspection result in `.json`. To link a service with a local file, configure the project like this:

```js
module.exports = {
  service: {
    localSchemaFile: './path/to/schema.graphql',
  },
};
```
