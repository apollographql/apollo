---
title: Operation registry
description: How to secure your graph with operation safelisting
---

## Overview

Any API requires security and confidence prior to going to production.  During development, GraphQL offers front-end engineers the ability to explore all the data available to them and fetch exactly what they need for the components they're building.  However, in production, it can be unnecessary and undesirable to provide this flexibility.

The Apollo Operation Registry allows organizations to:

* Provide demand control for their production GraphQL APIs.
* Permit the exact operations necessary for their client applications.
* Eliminate the risk of unexpected, and possibly costly, operations being executed against their graph.

Operations defined within client applications are automatically extracted and uploaded to Apollo Engine using the Apollo CLI.  Apollo Server fetches a manifest of these operations from Apollo Engine and forbids execution of operations which were not registered from the client bundle.

## Getting started

### Prerequisites

* Apollo Server 2.2.x (or newer).
  * To get started with Apollo Server, visit [its documentation](/docs/apollo-server/).
* A client application which utilizes `gql` tagged template literals for its operations or, alternatively, stores operations in `.graphql` files.
* An Apollo Engine API key.
  * To grab a key, visit [Apollo Engine](https://engine.apollographql.com) and create a service.

### Installation steps

> Make sure you've met the requirements for _Prerequisites_ above.

**1. Install the `apollo` command line tool as a development dependency of your client application:**

```
npm install apollo --save-dev
```

> Yarn users can run `yarn add apollo --dev`.

**2. Register the server's schema with Apollo Engine:**

> If this server's schema has already been registered using `apollo service:push`, you can skip this step.  For additional options and details, see the [documentation for the schema registry](./schema-registry.html).

First, make sure Apollo Server is running and that introspection is enabled (it is often disabled in production).

Next, using the following command as a reference, replace the `<ENGINE_API_KEY>` with the Apollo Engine API key from the appropriate service and specify the correct server endpoint with the `--endpoint` flag:

```
npx apollo service:push               \
    --key <ENGINE_API_KEY>            \
    --endpoint https://server/graphql
```

When successful, this command should return output similar to the following:

```
✔ Loading Apollo config
✔ Fetching current schema
✔ Publishing <service> to Apollo Engine

id      schema        tag
------  ------------- -------
abc123  <service>     current
```

> If you encounter any errors, refer to the _**Troubleshooting**_ section below.

**3. Register operations from the client bundle.**

Now we'll use `apollo queries:register` to locate operations within the client codebase and upload a manifest of those operations to Apollo Engine.  Once Apollo Server has been configured to respect the operation registry, only operations which have been included in the manifest will be permitted.

The `apollo queries:register` command:

* Supports multiple client bundles.  Each bundle is identified by a `clientName` (e.g. `react-web`).
* Supports JavaScript, TypeScript and `.graphql` files.
* Accepts a list of files as a glob (e.g. `src/**/*.ts`) to search for GraphQL operations.
* By default, includes the `__typename` fields which are added by Apollo Client at runtime.

To register operations, use the following command as a reference, taking care to replace the `<ENGINE_API_KEY>` with the appropriate Apollo Engine API key, specifying a unique name for this application with `<CLIENT_IDENTIFIER>`, and indicating the correct glob of files to search:

```
npx apollo queries:register              \
    --key <ENGINE_API_KEY>               \
    --clientName <CLIENT_IDENTIFIER>     \
    --queries="src/**/*.{ts,js,graphql}"
```

When succesfull, the output from this command should look similar to the following:

```
✔ Loading Apollo config
✔ Loading schema
✔ Resolving GraphQL document sets
✔ Scanning for GraphQL queries (N found)
✔ Isolating operations and fragments
✔ Combining operations and fragments
✔ Generating manifest
✔ Registering operations with Apollo Engine service <service>
```

If you encounter any errors, check the _**Troubleshooting**_ section below.

**4. Enable demand control by adding the operation registry to Apollo Server.**

To enable the operation registry within Apollo Server, it's necessary to install and enable the `apollo-server-plugin-operation-registry` plugin and ensure Apollo Server is configured to communicate with Apollo Engine.

First, add the appropriate plugin to the Apollo Server's `package.json`:

```
npm install apollo-server-plugin-operation-registry
```

> Yarn uses run: `yarn add apollo-server-plugin-operation-registry`.

Next, the plugin must be enabled.  This requires adding the appropriate module to the `plugins` parameter to the Apollo Server options:

```js
const server = new ApolloServer({
  // Existing configuration
  typeDefs,
  resolvers,
  // ...
  // New configuration
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      forbidUnregisteredOperations: true,
    }),
  ],
});
```

**5. Start Apollo Server with Apollo Engine enabled**

If the server was already configured to  use Apollo Engine, no additional changes are necessary, but it's important to make sure that the server is configured to use the same service as the operations were registered with in step 3.

If the server was not previously configured with Apollo Engine, be sure to start the server with the `ENGINE_API_KEY` variable set to the appropriate API key.  For example:

```
ENGINE_API_KEY=<ENGINE_API_KEY> npm start
```

Alternatively, the API key can be specified with the `engine` parameter on the Apollo Server constructor options:

```js
const server = new ApolloServer({
  // ...
  engine: "<ENGINE_API_KEY>",
  // ...
});
```

For security, it's recommended to pass the Engine API key as an environment variable so it will not be checked into version control (VCS).

**6. Verification**

With the operation registry enabled, _only_ operations which have been registered will be permitted.

To confirm that everything is configured properly, try executing an operation against the server which was **not** registered from the client bundle in step 3.

For example, using `curl` this could be done with a command similar to:

```
curl 'http://server/graphql/' \
    -H 'Content-Type: application/json' \
    --data-binary '{"query":"query { likes{title} }"}'
```

If the server  is configured properly, it should return:

```
Execution forbidden
```

Finally, to confirm that the server will allow permitted operations, try running an operation from the client.

## Troubleshooting

### Operations aren't being forbidden or operations which should be permitted are not allowed

The first step in debugging the operation registry behavior is to enable debugging.  This can be done by enabling the `debug` setting on the plugin within the Apollo Server constructor options:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    require("apollo-server-plugin-operation-registry")({
      // ... other, existing options ...
      debug: true,
    });
  ],
});
```

When the server is started with debugging enabled, additional information will be displayed at server startup which can be useful in determining the source of the problem.  For example:

```
Checking for manifest changes at https://...
🚀 app running at http://localhost:4000/
Incoming manifest ADDs: ba4573fca2e1491fd54b9f3984...
Incoming manifest ADDs: 32a21510374c3c9ad25e064240...
Incoming manifest ADDs: c60ac6dfe19ba70dd9d6a29a27...
```

By clicking on the URL listed in the `Checking for manifest changes at ` message, it will be possible to see the full contents of the manifest and see the list of permitted operations.  This information is not publicly available and this URL should not be shared.

### Schema registration

If a problem occurs during the `apollo service:push` command, make sure that the running Apollo Server can be accessed from the machine where the command is being executed.

Additionally, make sure that introspection is enabled on the server since introspection details are used to obtain and publish the schema.
