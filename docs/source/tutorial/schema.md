---
title: "1. Build a schema"
description: Start here for the Apollo fullstack tutorial
---

<h2 id="setup">Set up Apollo Server</h2>

Apollo Server is a GraphQL Server implementation that provides all the features you need to take your GraphQL API from prototype to production.

We need to install two packages when setting up Apollo Server:

```bash
npm install apollo-server graphql --save
```

* [apollo-server](https://npm.im/apollo-server): This is the Apollo Server library.
* [graphql](https://npm.im/graphql): This package is the JavaScript reference implementation for GraphQL. It's needed for Apollo Server to function as intended.

Apollo Server has various variants to accomodate easy integration with existing applications. Some of them are `apollo-server-express`, `apollo-server-hapi`, `apollo-server-koa`, etc.

```bash
npm install apollo-server-express graphql --save
```

To quickly set up a GraphQL server using Apollo Server, a schema type definition and corresponding resolver is needed. The schema type definition represents your GraphQL schema, while the resolver is a function that implements the schema.

Check out a simple Apollo Server example below:

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    name: String
  }
`;

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  Query: {
    name: () => 'graphql',
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

In the code above, we imported the `ApolloServer` class and `gql` tag from the `apollo-server` package.

* **ApolloServer**: The `ApolloServer` class instantiates and starts a new GraphQL server.
* **gql**: The `gql` tag is a JavaScript template literal tag that enables syntax highlighting for our schema.

<h2 id="write-schema">Write your graph's schema</h2>

Every GraphQL server runs a schema at its core. A schema defines types and their relationships. The specifications of the types of queries that can be run against a GraphQL server are defined in a schema. Let's design the schema for our app.

GraphQL schemas are at their best when they are designed around the needs of client applications. In fact, this is called **Schema First Development**, an approach for building applications with GraphQL that involves the frontend and backend teams agreeing on a schema first, which serves as a contract between the UI and the backend before any API development commences.

In our app, we need to provide the following features:

* Fetch all upcoming rocket launches.
* Fetch a specific launch.
* Fetch upcoming trips.
* Users should be able to login to be authorized to book and cancel launch trips.
* Users should be able to book launch trips.
* Users should be able to cancel launch trips.

These features influenced the derived types for our Schema as shown below:

_src/schema.js_

```js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    launches(pageSize: Int, cursor: String): [Launch]!
    launch(id: ID!): Launch
    user(id: ID!): User
  }

  type Mutation {
    bookTrips(userId: ID!, tripId: [ID!]): Boolean!
    cancelTrip(userId: ID!, tripId: ID!): Boolean!
    login(email: String): String
  }

  type Launch {
    id: ID!
    cursor: String
    year: String!
    date: String!
    mission: Mission!
    rocket: Rocket!
    launchSuccess: Boolean
  }

  type Rocket {
    id: ID!
    name: String!
    type: String!
  }

  type User {
    id: ID!
    email: String!
    avatar: String
    trips: [Launch]
  }

  type Mission {
    name: String!
    missionPatch: String
  }
`;

module.exports = typeDefs;
```

<h2 id="apollo-server-run">Run your server</h2>
