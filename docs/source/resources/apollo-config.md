---
title: Apollo Config
description: Configuration options for Apollo projects
---

Apollo projects are configured using an `apollo.config.js` file at the root of the project. This config file powers [editor integrations](../platform/editor-plugins.html) and the [Apollo CLI](https://www.npmjs.com/package/apollo). The configuration file how Apollo projects are setup. There are two types of projects, `client` and `service` which can be in the same configuration file if necessary.

<h2 id="client-config">Configuring a client project</h2>

Configuration of a client project is done through a top level `client` key in the config. In the simplest form, this is meant to link a client to a service:

```js
module.exports = {
  client: {
    service: 'my-apollo-service',
  },
};
```

<h3 id="client-to-service">Linking a service</h3>
Service's can be linked in one of three ways:

* using the [schema registry](../platform/schema-registry.html)
* using a remote endpoint
* using a local schema file

<h4 id="client-schema-registry">Schema registry</h4>
To use the schema registry, pass the id of the service from Engine as the value for service:

```js
module.exports = {
  client: {
    service: 'my-apollo-service',
  },
};
```

If a schema tag is being used, it can be included in the config after the service id:

```js
module.exports = {
  client: {
    service: 'my-apollo-service@beta',
  },
};
```

<h4 id="client-remote-endpoint">Remote endpoint</h4>

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js
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

<h4 id="client-local-file">Local schema</h4>

In some cases, teams may have a local generated file of their schema they want to link. This can be either a `.graphql` file with the schma in SDL, or a saved introspection result in `.json`. To link a client with a local file, configure the project like this:

```js
module.exports = {
  client: {
    service: {
      name: 'my-service-name',
      localSchemaFile: './path/to/schema.graphql',
    },
  },
};
```

<h3 id="loading-files">Loading operation and schema files</h3>
Client projects can contain both operations and schema definitions for local state with Apollo Client. By default, Apollo will look under a `./src` directory to find all operations and SDL to extract. To configure which folders to include, and which to ignore, adjust the config like so:

```js
module.exports = {
  client: {
    includes: ['./imports/**/*.js'],
    excludes: ['**/__tests__/**/*'],
  },
};
```

<h4>Custom tagged template name</h4>
When using GraphQL with JavaScript of TypeScript projects, it is common to use the `gql` tagged template literal to write out operations. If a different template literal is used, it can be configured like so:

```js
module.exports = {
  client: {
    tagName: 'graphql',
  },
};
```

<h4>Typename addition</h4>
GraphQL clients like Apollo Client often add the `__typename` field to an operation automatically. This is turned on by default in Apollo projects but can be turned off by adding `addTypename: false` to the client config:

```js
module.exports = {
  client: {
    addTypename: false,
  },
};
```

<h4>Custom schema directives</h4>
Client side applications with Apollo can use custom directives that aren't meant to be sent to the server. By default, Apollo projects support the following client side only directives:

* `@client` for local state
* `@rest` for using apollo-link-rest
* `@connection` for custom pagignation with Apollo Client
* `@type` for dynamic type names with apollo-link-rest

Futher configuration of client side directives can be done in two ways:

```js
module.exports = {
  client: {
    clientOnlyDirectives: ['connection', 'type'],
    clientSchemaDirectives: ['client', 'rest'],
  },
};
```

`clientOnlyDirectives` are directives that should be stripped out of the operation before being sent to the server. An example of this is the `@connection` directive.

`clientSchemaDirectives` are directives that indicate a portion of the operation that is not meant to be sent to the server. These directives are removed as well as the fields they are placed on. An example of this type of of directive is the `@client` directive.

<h2 id="service-config">Configuring a service project</h2>

Configuration of a service project is done through a top level `service` key in the config. In the simplest form, this is meant to link a service to the Apollo schema registry:

```js
module.exports = {
  service: {
    name: 'my-apollo-service',
  },
};
```

Services can be configured to remove the need for using flags when using the Apollo CLI. By configuring a service in the config, commands like `apollo service:push` and `apollo service:check` can have all flags removed and just use the config

<h3 id="service-schema">Loading a schema</h3>
Loading a schema for a service can be linked in one of two ways:

* using a remote endpoint
* using a local schema file

<h4 id="service-remote-endpoint">Remote endpoint</h4>

Remote endpoints can be used to pull down a schema from a running service. This can be configured like so:

```js
module.exports = {
  service: {
    endpoint: {
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

<h4 id="service-local-file">Local schema</h4>

In some cases, teams may have a local generated file of their schema they want to link. This can be either a `.graphql` file with the schma in SDL, or a saved introspection result in `.json`. To link a service with a local file, configure the project like this:

```js
module.exports = {
  service: {
    localSchemaFile: './path/to/schema.graphql',
  },
};
```
