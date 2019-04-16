---
title: GraphQL Glossary
description: A comprehensive list of important GraphQL words and acronyms
---

When you start diving into the GraphQL ecosystem, you'll probably encounter some unfamiliar terms and phrases along the way. To help you on your journey, we've defined some of the most common GraphQL vocabulary here in this handy cheat sheet.

<h2 id="Apollo">Apollo</h2>

An open-source implementation of GraphQL that helps you manage data between the cloud and your UI. The Apollo platform is pluggable into your existing architecture and features production-ready tooling across the stack ([Server](https://www.apollographql.com/docs/apollo-server/getting-started.html), [Client](https://www.apollographql.com/docs/react/), and [Engine](https://www.apollographql.com/docs/engine/)).

<h2 id="automatic-persisted-queries">Automatic Persisted Queries (APQ) </h2>

A technique for improving GraphQL network performance with zero build-time configuration by reducing request size over the wire. A smaller signature reduces bandwidth utilization and speeds up client loading times. Apollo Server allows implementation of [Automatic Persisted Queries (APQ)](https://www.apollographql.com/docs/guides/performance.html#automatic-persisted-queries).

<h2 id="argument">Argument</h2>

A set of key-value pairs attached to a specific field. Arguments can be literal values or variables.

```js
{
  human(id: "200") {
    weight(unit: "pounds")
    height
  }
}
```

`id` is an argument to human in the query above.

<h2 id="alias">Alias</h2>

An alternative name given to the result of a field to avoid conflicts during data fetching.

```js
{
  admin: users(role: admin) {
    id
    firstname
    lastname
  }
  managers: users(role: manager) {
    id
    firstname
    lastname
  }
}
```

`admin` and `managers` are aliases in the example query above.

<h2 id="data-source">Data Source</h2>

A new pattern for fetching data from a particular service, with built-in support for caching, deduplication, and error handling. When deploying GraphQL as a layer between your apps and existing APIs and services, [Data sources](https://www.apollographql.com/docs/apollo-server/v2/features/data-sources.html) provide the best experience for fetching and caching data from REST endpoints.

<h2 id="deferred-query">Deferred query</h2>

A query that has certain fields tagged with the [`@defer` directive](https://www.apollographql.com/docs/react/features/defer-support.html), so that fields that take a long time to resolve do not need to slow down the entire query.

```js
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

<h2 id="directive">Directive</h2>

A declaration prefixed with an `@` character that encapsulates programming logic for query execution on the client or server. There are built-in directives such as `@skip` or `@include`, and [custom directives](https://www.apollographql.com/docs/graphql-tools/schema-directives.html). Directives can be used for features such as authentication, incremental data loading, etc.

```js
type User @auth {
  name: String!
  banned: Boolean @auth!
}
```

<h2 id="docstring">Docstring</h2>

It is used for providing descriptions of types, fields and arguments. Docstrings show up in the documentation panel inside GraphQL playground and GraphiQL.

```js
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

<h2 id="document">Document</h2>

A file or request string that contains one or multiple definitions of a GraphQL type system and can be interpreted by a GraphQL execution engine.

<h2 id="extensions">Extensions</h2>
Special fields in the GraphQL response that allows you to attach extra metadata. [Apollo tracing](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-tracing) is an example of an extension.

<h2 id="field">Field</h2>

A unit of data you are asking for in a Schema, which ends up as a field in your JSON response data.

```js
type Author {
  id: Int!
  firstName: String
  lastName: String
}
```

`id`, `firstName`, and `lastName` are fields in the Author type above.

<h2 id="fragment">Fragment</h2>

A selection set that can be reused in multiple query operations. A [GraphQL fragment](https://www.apollographql.com/docs/react/advanced/fragments.html) is a shared piece of query logic.

```js
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

<h2 id="gql-function">gql function</h2>

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

<h2 id="graphql-playground">GraphQL Playground</h2>

An in-browser IDE for GraphQL development and workflow. Added benefits exist such as theme change, automatic schema reloading, HTTP headers configuration, query history and GraphQL subscription support. In addition, it comes [out-of-the-box in Apollo Server 2](https://www.apollographql.com/docs/apollo-server/features/graphql-playground.html).

<h2 id="graphql-service">GraphQL Service</h2>

The server that contains a GraphQL schema and the ability to run it. Services have runtime information, and through features of the Apollo Platform they can send metrics and maintain a history of the schemas that have been run on that service in the past.

<h2 id="graphiql">GraphiQL</h2>

An in-browser IDE for GraphQL development.

<h2 id="introspection">Introspection</h2>

A technique to provide detailed information about a GraphQL API's schema. Types and fields used in introspection are prefixed with "\_\_" two underscores.

```js
{
  __schema {
    types {
      name
    }
  }
}
```

<h2 id="mutation">Mutation</h2>

An operation for creating, modifying and destroying data.

```js
mutation AddTodo($type: String!) {
  addTodo(type: $type) {
    id
    type
  }
}
```

<h2 id="normalization">Normalization</h2>

A technique for transforming the response of a query operation before saving it to the store by [Apollo Client's `InMemoryCache`](https://www.apollographql.com/docs/react/advanced/caching.html#normalization). The result is split into individual objects, creating a unique identifier for each object, and storing those objects in a flattened data structure.

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
  },
});
```

<h2 id="object-type">Object Type</h2>

A type in a GraphQL schema which has fields.

```js
type User {
   name: String!,
}
```

`User` is an Object type in the example above.

<h2 id="operation">Operation</h2>
A single query, mutation, or subscription that can be interpreted by a GraphQL execution engine.

<h2 id="operation-name">Operation name</h2>

A name for a single query, mutation, or subscription. Identifying a query or mutation by name is very useful for logging and debugging when something goes wrong in a GraphQL server.

```js
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

<h2 id="partial-query-caching">Partial query caching</h2>
A technique for caching inputs to GraphQL queries. This type of caching ensures that if the query is slightly different but with the same inputs, those inputs can simply be retrieved from the cache instead of fetching data again from the backend. It is implemented in Apollo Server 2 as [Data Source](https://www.apollographql.com/docs/apollo-server/features/data-sources.html) caching.

<h2 id="query">Query</h2>

A read-only fetch operation to request data from a GraphQL service.

<h2 id="query-colocation">Query colocation</h2>

A practice of placing a GraphQL query in the same location as the app component's view logic. Query co-location makes it easier to facilitate a smooth UI and chore of data retrieval. Jumping directly to the query and keeping the component in sync with its data dependencies is a bliss.

```js
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

<h2 id="query-whitelisting">Query whitelisting</h2>

A technique for preventing unwanted attacks by maintaining a list of approved queries that are allowed in your application. Any query not present in the list that is run against the server will not be allowed. [Automatic Persisted Queries](../guides/performance.html#automatic-persisted-queries) is a feature of Apollo Server 2 that enables query whitelisting and persisted queries.

<h2 id="resolver">Resolver</h2>

A function that connects schema fields and types to various backends. Resolvers provide the instructions for turning a GraphQL operation into data. It can retrieve or write data from either an SQL, a No-SQL, graph database, a micro-service or a REST API. Resolvers can also return strings, ints, null, and other primitives.

```js
...
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

<h2 id="schema">Schema</h2>

A GraphQL [schema](https://www.apollographql.com/docs/apollo-server/essentials/schema.html) is at the center of any GraphQL server implementation and describes the functionality available to the clients which connect to it.

<h2 id="schema-definition-language">Schema Definition Language (SDL)</h2>

The syntax for writing GraphQL Schemas. It is otherwise known as Interface Definition Language. It is the lingua franca shared by all for building GraphQL APIs regardless of the programming language chosen.

```js
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

<h2 id="schema-first-development">Schema first development</h2>
A [development approach](https://www.apollographql.com/docs/fundamentals/tips.html#schema) for designing and building modern UIs that involves the frontend and backend teams agreeing on a Schema first, which serves as a contract between the UI and the backend before any API engineering happens.

<h2 id="schema-registry">Schema registry</h2>

A central source of truth for your schema in Apollo Engine. It enables schema registration, schema validation, tracking of detailed schema changes e.g. types added, fields added, fields deprecated and looking up previous versions of schema.

<h2 id="schema-versioning">Schema versioning</h2>

Refers to the need to evolve a schema over time. As a schema evolves, there is a potential for introducing breaking changes to clients. The Apollo CLI assists schema evolution by validating schema changes and checking for breaking changes using Apollo Engine. Read more in the [versioning guide](https://www.apollographql.com/docs/guides/versioning.html).

<h2 id="schema-stitching">Schema stitching</h2>

The process of merging [different schemas into one GraphQL schema](./docs/graphql-tools/schema-stitching.html). These schemas can be local, remote or from third party services. In a microservice-style deployment model, where your data exists across multiple APIs, Schema stitching makes it possible to combine all of them into one schema that can be queried for all the data at once.

<h2 id="subscription">Subscription</h2>

A real-time GraphQL operation. A [Subscription](https://www.apollographql.com/docs/apollo-server/features/subscriptions.html) is defined in a schema like queries and mutations.

```js
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

<h2 id="scalar-type">Scalar Type</h2>

A type that qualifies the data a GraphQL field resolves. GraphQL ships with some scalar types out of the box; **Int**, **Float**, **String**, **Boolean** and **ID**. However, a [custom scalar](https://www.apollographql.com/docs/graphql-tools/scalars.html#custom-scalars) type such as **Date** can be specified in a GraphQL service implementation.

<h2 id="type-system">Type System</h2>

A collection of types which characterizes the set of data that can be validated, queried and executed on a GraphQL API.

<h2 id="variable">Variable</h2>

A value that can be passed to an operation. Variables can be used to fill arguments, or be passed to directives.

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    firstName
  }
}
```

In the query above, `userId` is a variable. The variable and its type is declared in the operation signature, signified by a `$`. The type of the variable here is a required `ID`. It's important to note that variable types must match the type of the arguments that they fill.

The userId variable would be passed to the operation by `apollo-client` like this:

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

<h2 id="whole-response-caching">Whole response caching</h2>

A technique used to cache entire results of GraphQL queries. This process improves performance by preventing the fetching of the same results from the server if it has been obtained before. Check out the [Apollo performance guide](../guides/performance.html).
