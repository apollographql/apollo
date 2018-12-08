---
title: Editor plugins
description: How to get the most out of your editor with Apollo
---

By design, GraphQL has the ability to create incredible developer experiences thank's to its strongly typed schema and query language. The Apollo GraphQL Platform brings these possibilities to life with deep editor integrations. Currently only [VS Code](https://code.visualstudio.com/) is supported, but more are coming soon.

<h2 id="vscode">Getting started with Apollo and VS Code</h2>

The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) for Apollo brings an all-in-one tooling experience for developing apps with Apollo.

* Get instant feedback and intelligent autocomplete as you write queries
* Seamlessly manage your client side schema alongside your remote one
* See performance information inline with your query definitions
* Loads GraphQL schemas and queries automatically from an Apollo Config file
* Adds syntax highlighting for GraphQL files and gql templates inside JavaScript files
* Code-completes fields, arguments, types, and variables in your queries
* Detects and loads client side schemas and validates client side field usage in operations
* Displays performance statistics from Engine inline with your queries
* Jump-to-definition for fragments and schema types
* Detects fragment references and shows them next to definitions

To get started, first install the extension by using this [link](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) or by searching `Apollo` in the VS Code extension marketplace. After installation, GraphQL syntax highlighting should be enabled for `.graphql`, `.gql`, `.js` and `.ts` file types.

<h2 id="linking-a-schema">Linking a schema</h2>

To get all of the benefits of the VS Code experience, its best to link the schema that is being developed against. The best way to do that is by [publishing a schema](./schema-registry.html#publish) to the Apollo schema registry. Once that is done, two steps are needed:

1. Create an `apollo.config.js` at the root of the project
2. Copy an API key from the Engine dashboard of the published service

<h3 id="apollo-config">Setting up an Apollo config</h3>
In order for the VS Code plugin to know how to find the schema, it needs to be linked to either a published schema or a local one. To link a project to a published schema, edit the `apollo.config.js` file to look like this:

```js
module.exports = {
  client: {
    service: 'my-graphql-app',
  },
};
```

The service name is the id of the service created in Engine and can be found in the services dashboard of [Engine](https://engine.apollographql.com)

> Important note: If the name of the service in Engine is changed, this value should be the service id. This can be found in the url when browsing the service in Engine. This will be easier to manage in the near future

<h3 id="api-key">Setting up an API key</h3>
To authenticate with Engine to pull down the schema, create a file next to the `apollo.config.js` called `.env`. This should be an untraced file (i.e. don't push it to GitHub). Go to the settings page of the published service and create a new API key.

> It is best practice to create a new API key for each member of the team and name the key so its easy to find and revoke if needed

After the key is found, add the following line to the `.env` file:

```bash
ENGINE_API_KEY=<enter copied key here>
```

After this is done, VS Code can be restarted and the editor integration will start providing autocomplete, validation, and more!

<h2 id="local-schemas">Local schemas</h2>

Sometimes it may make sense to link the editor to a locally running version of a schema to try out new designs that are in active development. To do this, the `apollo.config.js` file can be linked to a local service definition:

```js
module.exports = {
  client: {
    service: {
      name: 'my-graphql-app',
      endpoint: 'http://localhost:4000/graphql',
    },
  },
};
```

> Linking to the local schema won't provide all features such as switching schema tags and performance metrics.

More information about configuring an Apollo project can be found [here](../resources/apollo-config.html)

<h2 id="client-side-schemas">Client side schemas</h2>

One of the best features of the VS Code extension is the automatic merging of remote schemas and local ones when using integrated state management with Apollo Client. This happens automatically whenever schema definitions are found within a client project.

Client side schema definitions can be spread throughout the client app project and will be merged together to create one single schema. This can be controlled through the `apollo.config.js` at the root of he project:

```js
module.exports = {
  client: {
    service: "my-graphql-app"
    includes: ["./src/**/*.js"],
    excludes: ["**/__tests__/**"]
  }
}
```

By default, the VS Code extension will look for all files under "./src" to find both the operations and schema definitions for building a complete schema for the application.

<h2 id="performance-insights">Performance insights</h2>

GraphQL operations provide incredible flexibilty in what data is requested from a service. This can sometimes lead to unknown performance characteristics of how an operation will run. Thanks to the trace wharehouse in the Apollo GraphQL Platform, teams no longer will be surprised by how long an operation takes.

The VS Code extension will show inline performance diagnostics when connected to a service with reported metrics in Engine. As operations are typed, any fields that take longer than 1ms to respond will be annoated to the right of the field inline! This gives team members a picture of how long the operation will take as more and more fields are added to operations or fragments.

<h2 id="commands">Apollo commands</h2>
The VS Code extension integrates with the VS Code command palate and provides two commands currently:

* switch schema tags
* reload the schema and diagnostics

These can be run by typing `cmd+shift+p` then typing `apollo` into thr prompt. That will show the two commands which can help teams stay on top of changes to the schema right in their editors
