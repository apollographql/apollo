---
title: GraphQL Glossary
description: A comprehensive list of important GraphQL words and acronyms
---

When you start diving into the GraphQL ecosystem, you'll probably encounter some unfamiliar terms and phrases along the way. To help you on your journey, we've defined some of the most common GraphQL vocabulary here in this handy cheat sheet.

## Apollo

An open-source implementation of GraphQL that helps you manage data between the cloud and your UI. The Apollo platform is pluggable into your existing architecture and features production-ready tooling that helps you scale GraphQL across your organization ([Server](https://www.apollographql.com/docs/apollo-server/getting-started/), [Client](https://www.apollographql.com/docs/react/), and [Engine](https://www.apollographql.com/docs/engine/)).

## Automatic Persisted Queries (APQ)

A technique for improving GraphQL network performance with zero build-time configuration by reducing request size over the wire. A smaller signature reduces bandwidth utilization and speeds up client loading times. Apollo Server allows implementation of [Automatic Persisted Queries (APQ)](https://www.apollographql.com/docs/apollo-server/features/apq/).

## Argument

A set of key-value pairs attached to a specific field. Arguments can be literal values or variables.

```graphql
{
  human(id: "200") {
    weight(unit: "pounds")
    height
  }
}
```

`id` is an argument to human in the query above.

## Alias

An alternative name given to the result of a field to avoid conflicts during data fetching.

```graphql
{
  admins: users(role: "admin") {
    id
    firstname
    lastname
  }
  managers: users(role: "manager") {
    id
    firstname
    lastname
  }
}
```

`admins` and `managers` are aliases in the example query above.

## Data Source

A new pattern for fetching data from a particular service, with built-in support for caching, deduplication, and error handling. When deploying GraphQL as a layer between your apps and existing APIs and services, [Data sources](https://www.apollographql.com/docs/apollo-server/v2/features/data-sources/) provide the best experience for fetching and caching data from REST endpoints.

## Deferred query

A query that has certain fields tagged with the `@defer` directive, so that fields that take a long time to resolve do not need to slow down the entire query.

```graphql
query NewsFeed {
  newsFeed {
    stories {
      text
      comments @defer {
        text
      }
    }
  }
}
```

## Directive

A declaration prefixed with an `@` character that encapsulates programming logic for query execution on the client or server. There are built-in directives such as `@skip` or `@include`, and [custom directives](https://www.apollographql.com/docs/graphql-tools/schema-directives/). Directives can be used for features such as authentication, incremental data loading, etc.

```graphql
type User @auth {
  name: String!
  banned: Boolean @auth!
}
```

## Docstring

It is used for providing descriptions of types, fields and arguments. Docstrings show up in the documentation panel inside GraphQL playground and GraphiQL.

```graphql
"""
Description for the User
"""
type User {
  """
  Description for first Name
  """
  firstName: String!

  age(
    """
    Must be an integer
    """
    arg: Int
  )
}
```

## Document

A file or request string that contains one or multiple definitions of a GraphQL type system and can be interpreted by a GraphQL execution engine.

## Extensions

Special fields in the GraphQL response that allow you to attach extra metadata. [Apollo tracing](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-tracing) is an example of an extension.

## Field

A unit of data you are asking for in a Schema, which ends up as a field in your JSON response data.

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
}
```

`id`, `firstName`, and `lastName` are fields in the Author type above.

## Fragment

A selection set that can be reused in multiple query operations. A [GraphQL fragment](https://www.apollographql.com/docs/react/advanced/fragments/) is a shared piece of query logic.

```graphql
fragment UserData on User {
  id: ID!
  firstName: String!
  lastName: String!
}

query getUsers {
  allUsers {
    ...UserData
  }
}
```

## gql function

A [JavaScript template literal tag](https://github.com/apollographql/graphql-tag) that parses GraphQL queries into an abstract syntax tree (AST).

```js
const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
`;
```

## GraphQL Playground

An in-browser IDE for GraphQL development and workflow. Added benefits exist such as theme change, automatic schema reloading, HTTP headers configuration, query history and GraphQL subscription support. In addition, it comes [out-of-the-box in Apollo Server 2](https://www.apollographql.com/docs/apollo-server/features/graphql-playground/).

## GraphQL Service

The server that contains a GraphQL schema and the ability to run it. Services have runtime information, and through features of the Apollo Platform they can send metrics and maintain a history of the schemas that have been run on that service in the past.

## GraphiQL

An in-browser IDE for GraphQL development.

## Introspection

A technique to provide detailed information about a GraphQL API's schema. Types and fields used in introspection are prefixed with "\_\_" two underscores.

```graphql
{
  __schema {
    types {
      name
    }
  }
}
```

## Mutation

An operation for creating, modifying and destroying data.

```graphql
mutation AddTodo($type: String!) {
  addTodo(type: $type) {
    id
    type
  }
}
```

## Normalization

A technique for transforming the response of a query operation before saving it to the store by [Apollo Client's `InMemoryCache`](https://www.apollographql.com/docs/react/advanced/caching/#normalization). The result is split into individual objects, creating a unique identifier for each object, and storing those objects in a flattened data structure.

```js
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case 'foo':
        return object.key; // use `key` as the primary key
      case 'bar':
        return `bar:${object.blah}`; // use `bar` prefix and `blah` as the primary key
      default:
        return defaultDataIdFromObject(object); // fall back to default handling
    }
  }
});
```

## Object Type

A type in a GraphQL schema that has fields.

```graphql
type User {
   name: String!
}
```

`User` is an Object type in the example above.

## Operation

A single query, mutation, or subscription that can be interpreted by a GraphQL execution engine.

## Operation name

A name for a single query, mutation, or subscription. Identifying a query or mutation by name is very useful for logging and debugging when something goes wrong in a GraphQL server.

```graphql
mutation AddTodo($type: String!) {
  addTodo(type: $type) {
    id
    type
  }
}

query getHuman {
  human(id: "200") {
    weight(unit: "pounds")
    height
  }
}
```

`AddTodo` and `getHuman` are names for the mutation and query operation respectively.

## Partial query caching

A technique for caching inputs to GraphQL queries. This type of caching ensures that if the query is slightly different but with the same inputs, those inputs can simply be retrieved from the cache instead of fetching data again from the backend. It is implemented in Apollo Server 2 as [Data Source](https://www.apollographql.com/docs/apollo-server/features/data-sources/) caching.

## Query

A read-only fetch operation to request data from a GraphQL service.

## Query colocation

A practice of placing a GraphQL query in the same location as the app component's view logic. Query co-location makes it easier to facilitate a smooth UI and chore of data retrieval. Jumping directly to the query and keeping the component in sync with its data dependencies is a pleasure.

```jsx
const GET_DOG_PHOTO = gql`
  query dog($breed: String!) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

export const queryComponent = ({ breed }) => (
  <Query query={GET_DOG_PHOTO} variables={{ breed }}>
    {({ loading, error, data }) => {
      if (loading) return null;
      if (error) return 'Error!';
      return <img src={data.dog.displayImage} />;
    }}
  </Query>
);
```

## Query whitelisting

A technique for preventing unwanted attacks by maintaining a list of approved queries that are allowed in your application. Any query not present in the list that is run against the server will not be allowed. [Automatic Persisted Queries](/old/performance/#automatic-persisted-queries) is a feature of Apollo Server 2 that enables query whitelisting and persisted queries.

## Resolver

A function that connects schema fields and types to various backends. Resolvers provide the instructions for turning a GraphQL operation into data. It can retrieve data from or write data to anywhere, including a SQL, No-SQL, or graph database, a micro-service, and a REST API. Resolvers can also return strings, ints, null, and other primitives.

```js
const resolvers = {
  Query: {
    author(root, args, context, info) {
      return find(authors, { id: args.id });
    },
  },
  Author: {
    books(author) {
      return filter(books, { author: author.name });
    },
  },
};
```

## Schema

A GraphQL [schema](https://www.apollographql.com/docs/apollo-server/essentials/schema.html) is at the center of any GraphQL server implementation and describes the functionality available to the clients which connect to it.

## Schema Definition Language (SDL)

The syntax for writing GraphQL Schemas. It is otherwise known as Interface Definition Language. It is the lingua franca shared by all for building GraphQL APIs regardless of the programming language chosen.

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String
  author: Author
  votes: Int
}

type Query {
  posts: [Post]
  author(id: Int!): Author
}
```

## Schema first development

A [development approach](/intro/platform/#workflows) for designing and building modern UIs that involves the frontend and backend teams agreeing on a Schema first, which serves as a contract between the UI and the backend before any API engineering happens.

## Schema registry

A central source of truth for your schema in Apollo Engine. It enables schema registration, schema validation, tracking of detailed schema changes e.g. types added, fields added, fields deprecated and looking up previous versions of schema.

## Schema versioning

Refers to the need to evolve a schema over time. As a schema evolves, there is a potential for introducing breaking changes to clients. The Apollo CLI assists schema evolution by validating schema changes and checking for breaking changes using Apollo Engine. Read more in our article about [schema change validation](/platform/schema-validation/#set-up-schema-validation).

## Schema stitching

The process of merging [different schemas into one GraphQL schema](https://www.apollographql.com/docs/graphql-tools/schema-stitching/). These schemas can be local, remote, or from third-party services. In a microservice-style deployment model, where your data exists across multiple APIs, schema stitching makes it possible to combine all of them into one schema that can be queried for all the data at once.

## Subscription

A real-time GraphQL operation. A [Subscription](https://www.apollographql.com/docs/apollo-server/features/subscriptions/) is defined in a schema along with queries and mutations.

```graphql
type Subscription {
  commentAdded(repoFullName: String!): Comment
}
...
subscription onCommentAdded($repoFullName: String!){
  commentAdded(repoFullName: $repoFullName){
    id
    content
  }
}
```

## Scalar Type

A type that qualifies the data a GraphQL field resolves. GraphQL ships with some scalar types out of the box; **Int**, **Float**, **String**, **Boolean** and **ID**. However, a [custom scalar](https://www.apollographql.com/docs/graphql-tools/scalars/#custom-scalars) type such as **Date** can be specified in a GraphQL service implementation.

## Type System

A collection of types which characterizes the set of data that can be validated, queried, and executed on a GraphQL API.

## Variable

A value that can be passed to an operation. Variables can be used to fill arguments, or be passed to directives.

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    firstName
  }
}
```

In the query above, `userId` is a variable. The variable and its type is declared in the operation signature, signified by a `$`. The type of the variable here is a required `ID`. It's important to note that variable types must match the type of the arguments that they fill.

The `userId` variable would be passed to the operation by `apollo-client` like this:

```js
client.query({ query: getUserQuery, variables: { userId: 1 } });
```

In `react-apollo` it would be passed like this:

```jsx
<Query query={getUserQuery} variables={{ userId: 1 }}>
  {' '}
  ...{' '}
</Query>
```

## Whole response caching

A technique used to cache entire results of GraphQL queries. This process improves performance by preventing the fetching of the same results from the server if it has been obtained before. Read more about GraphQL query caching in our [guide for caching with Apollo Server](https://www.apollographql.com/docs/apollo-server/features/caching/).
