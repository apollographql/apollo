---
title: Configuring Apollo projects
description: How to configure Apollo VS Code and CLI with apollo.config.js
---

Apollo projects are configured using an `apollo.config.js` file at the root of your project. Many Apollo tools leverage your the Apollo config, reducing the net amount of configuration you need to do in your project in the end.

If you're using one of our workflow tools like the Apollo CLI or the Apollo VS Code extension, you'll need to have an `apollo.config.js` project to get the features those tools bring.

There are two types of projects, `client` and `service`, which can be in the same configuration file if necessary. This document describes all the options available in the Apollo config and defines which are required vs. optional.

## Client projects

Client projects are configured through a top level `client` key in the config.

```js
module.exports = {
  client: { ... }, // highlight-line
};
```

### `client.service`

**Required** –– the CLI and VS Code extension rely on knowledge of your schema to show you "intellisense" (eg. autocomplete on fields, metrics annotations, query validation).

There are a few different ways you can link your client to a schema:

1. Use the Apollo [schema registry](/platform/schema-registry/)
1. With a remote endpoint (from a running server)
1. With a local schema file

#### _Option 1_: Use the Apollo schema registry

To link your client to a schema through the Apollo schema registry, you'll need to have at least one version of your schema uploaded to the [registry](/platform/schema-registry/).

With Engine set up, you can point your client directly to your graph's schema by putting your graph's Engine ID in your Apollo config, like so:

```js{3}
module.exports = {
  client: {
    service: 'my-apollo-service' // the id of your service in Engine (from the URL)
  }
};
```

> **Note:** you must have a [registered schema](/platform/schema-registry/#registering-a-schema) for features like VS Code intellisense, which requires knowledge of your schema, to work properly.

If you're tracking different versions of your schema in the registry using schema variants, you can link your client to a specific variant like so:

```js{3}
module.exports = {
  client: {
    service: 'my-apollo-service@staging' // "staging" is the schema variant we're using
  }
};
```

If a schema variant is not specified, Apollo tools will fall back to the default value of `current`.

#### _Option 2_: Link a schema from a remote endpoint

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js{3-11}
module.exports = {
  client: {
    service: {
      name: 'github',
      url: 'https://api.github.com/graphql',
      // optional headers
      headers: {
        authorization: 'Bearer lkjfalkfjadkfjeopknavadf'
      },
      // optional disable SSL validation check
      skipSSLValidation: true
    }
  }
};
```

#### _Option 3_: Link a schema from a local file

In some cases you may have a locally generated file with your schema that you want to link. This can be either a `.graphql` file with the schema in SDL form or a saved introspection result in `.json`. To link your client project to a local schema file, configure it like so:

```js{3-6}
module.exports = {
  client: {
    service: {
      name: 'my-service-name',
      localSchemaFile: './path/to/schema.graphql'
    }
  }
};
```

### `client.includes`

_Optional_ –– by default, Apollo tools will look under a `./src` directory to find all operations and SDL to extract.

Client projects often contain client-side schema definitions for local state with Apollo Client. To make sure the Apollo CLI and VS Code extension can find these files and read them correctly, you may need to tell Apollo which folders to look for your schema and queries in like so:

```js{3}
module.exports = {
  client: {
    includes: ['./imports/**/*.js'], // array of glob patterns
    service: ...
  },
};
```

### `client.excludes`

_Optional_ –– by default, Apollo tools will exclude `**/node_modules` and `**/__tests___` when looking for your queries and schema files.

If you want Apollo to ignore any of your other folders when looking for queries and schema definitions, adjust your config like so:

```js{3}
module.exports = {
  client: {
    excludes: ['**/__tests__/**/*'], // array of glob patterns
    service: ...
  },
};
```

### `client.tagName`

_Optional_ –– custom tagged template literal.

When using GraphQL with JavaScript or TypeScript projects, it is common to use the `gql` tagged template literal to write out operations. Apollo tools will be looking through your files for the `gql` tag to extract your queries, so if you use a different template literal, you can configure it like so:

```js
module.exports = {
  client: {
    tagName: "graphql", // highlight-line
    service: ...
  }
};
```

### `client.addTypename`

_Optional_ –– Apollo will by default add the `__typename` field to all your operations automatically and to all your generated types during codegen.

GraphQL clients like Apollo Client often add the `__typename` field to operations automatically when they're sent over the wire. This can come in really handy for things like caching, but it can be turned off by adding `addTypename: false` to the client config:

```js
module.exports = {
  client: {
    addTypename: false, // highlight-line
    service: ...
  }
};
```

> **Note:** For consistency, we recommend that you keep this option consistent with how your `ApolloClient` is configured.

### `client.clientOnlyDirectives`, `client.clientSchemaDirectives`

_Optional_ –– By default, Apollo projects support the following client-side directives:

- `@client` for local state
- `@rest` for using apollo-link-rest
- `@connection` for custom pagination with Apollo Client
- `@type` for dynamic type names with apollo-link-rest

Client side applications can use custom directives on their queries that aren't meant to be sent to the server. Configuration of client side directives beyond the defaults listed above can be set up like so:

```js{3-4}
module.exports = {
  client: {
    clientOnlyDirectives: ["connection", "type"],
    clientSchemaDirectives: ["client", "rest"],
    service: ...
  }
};
```

`clientOnlyDirectives` are directives that should be stripped out of the operation before being sent to the server. An example of this is the `@connection` directive.

`clientSchemaDirectives` are directives that indicate a portion of the operation that is not meant to be sent to the server. These directives are removed as well as the fields they are placed on. An example of this type of directive is the `@client` directive.

## Server projects

Server projects are configured through a top level `service` key in the config.

```js
module.exports = {
  service: { ... }, // highlight-line
};
```

Defining a `service` key in your Apollo config will provide the CLI with the information it needs to perform commands like `apollo service:push` and `apollo service:check`. You can set up the schema for your service to load in one of two ways:

1. Using a remote endpoint
1. Using a local schema file

#### Option 1: Remote endpoint

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js{2-10}
module.exports = {
  service: {
    endpoint: {
      url: 'https://api.github.com/graphql', // defaults to http://localhost:4000
      headers: {
        // optional
        authorization: 'Bearer lkjfalkfjadkfjeopknavadf'
      },
      skipSSLValidation: true // optional, disables SSL validation check
    }
  }
};
```

#### Option 2: Local schema

In some cases you may have a locally generated file with your schema that you want to link. This can be either a `.graphql` file with the schema in SDL form or a saved introspection result in `.json`. To link your client project to a local schema file, configure it like so:

```js
module.exports = {
  service: {
    localSchemaFile: './path/to/schema.graphql'
  }
};
```
