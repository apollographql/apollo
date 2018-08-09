---
title: GraphQL Glossary
description: A comprehensive list of important GraphQL words and acronyms
---


We have put together a glossary of words and acronyms that you might hear or come across frequently in GraphQL land. Every developer and GraphQL enthusiast should be able to easily look up a particular term here when referenced in specs, reference guides, READMEs and within a codebase.


<h2 id="Apollo">Apollo</h2>
<p>A set of tools for building GraphQL apps. Some of these tools are Apollo Client (best way to use GraphQL to build Client apps), Apollo Server (for building GraphQL servers), Engine (performance monitoring and tracing), etc.</p>

<h2 id="automatic-persisted-queries">Automatic Persisted Queries (APQ) </h2>
<p> A technique for improving GraphQL network performance by reducing request size over the wire. </p>

<h2 id="argument">Argument</h2>
<p>A parameter or set of key-value pair passed to fields in a schema to filter out results sent back from the server to the client.</p>

<h2 id="alias">Alias</h2>
<p>An alternative name given to the result of a field to avoid conflicts during data fetching.</p>

<h2 id="data-source">Data Source</h2>
<p>A new utility and pattern for fetching and caching data from REST API endpoints. When layering GraphQL over REST APIs, data sources provides the ability to have a resource cache that saves and shares data easily across multiple GraphQL servers.</p>

```js
const { RESTDataSource } = require('apollo-datasource-rest');

class MoviesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movies-api.example.com/';
  }

  async getMovie(id) {
    return this.get(`movies/${id}`);
  }

  async getMostViewedMovies(limit = 10) {
    const data = await this.get('movies', {
      per_page: limit,
      order_by: 'most_viewed',
    });
    return data.results;
  }
}
```

<h2 id="deferred-query">Deferred Query</h2>
<p>A declaration prefixed with an @ character that encapsulates programming logic for query execution on the client or server. There are built-in such as @skip, @include and custom directives. It can be used for features such as authentication, incremental data loading, etc.</p>

<h2 id="docstring">Docstring</h2>
<p>A technique for providing metadata to a GraphQL Document. It can used for describing types, fields and arguments.</p>

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
<p>A file or request string that contains one or multiple definitions of a GraphQL type system and can be interpreted by a GraphQL execution engine.</p>

<h2 id="extensions">Extensions </h2>
<p></p>


<h2 id="field">Field</h2>
<p>A node in a GraphQL Object type that makes up a Schema. It is a unit of data.</p>


<h2 id="fragment">Fragment</h2>
<p>A selection set that can be reused in multiple query operations.</p>

<h2 id="gql-function">gql function</h2>
<p>A JavaScript template literal tag that parses GraphQL queries.</p>

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
<p>An in-browser IDE for GraphQL development and workflow. Added benefits exist such as theme change, automatic schema reloading, HTTP headers configuration, query history and GraphQL subscription support.</p>

<h2 id="graphiql">GraphiQL</h2>
<p>An in-browser IDE for GraphQL development. The first-ever GraphQL IDE released by Facebook.</p>

<h2 id="introspection">Introspection</h2>
<p>A technique to provide detailed information about a GraphQL API's schema. Types and fields used in introspection are prefixed with "__" two underscores.</p>

<h2 id="mutation">Mutation</h2>
<p>An operation for creating, modifying and destroying data. A fetch operation happens immediately after the write.</p>

<h2 id="normalization">Normalization</h2>
<p>A technique for transforming default GraphQL responses into a specific desired format.</p>

```js
// Example of a default GraphQL response
const response = {
  data: {
    getUser: {
      __typename: 'User',
      uid: '5a6efb94b0e8c36f99fba013',
      email: 'john.doe@yahoo.com',
    },
  },
}

// After Normalization
{
 users: {
    '5a6efb94b0e8c36f99fba013': {
      uid: '5a6efb94b0e8c36f99fba013',
      email: 'john.doe@yahoo.com'
   }
 }
}
```

<h2 id="object-type">Object Type</h2>
<p>A form of Object with a type specifier that has fields that can fetch data from an API service, e.g User is an Object type.</p>

```js
type User {
   name: String!,
}
```

<h2 id="operation">Operation</h2>
<p>A single query, mutation, or subscription that can be interpreted by a GraphQL execution engine.</p>

<h2 id="operation-name">Operation name</h2>
<p>A name for a single query, mutation, or subscription. Identifying a query or mutation by name is very useful for logging and debugging when something goes wrong in a GraphQL server.</p>

<h2 id="partial-query-caching">Partial query caching</h2>
<p>A technique for caching inputs to GraphQL queries. This type of caching ensures that if the query is slightly different but with the same inputs, those inputs can simply be retrieved from the cache instead of fetching data again from the backend. It is implemented in Apollo Server 2 as Data Source caching.</p>

<h2 id="query">Query</h2>
<p>An operation that makes a GET request to a GraphQL service requesting for some data. It's better known as a read-only fetch operation.</p>

<h2 id="query-colocation">Query colocation</h2>
<p>A practice of placing a GraphQL query in the same location as the app component's view logic.</p>

```js
const GET_DOG_PHOTO = gql`
 query dog($breed: String!) {
  dog(breed: $breed) {
    id
    displayImage
  }
}`;

export const queryComponent = `const DogPhoto = ({ breed }) => (
  <Query query={GET_DOG_PHOTO} variables={{ breed }}>
    {({ loading, error, data }) => {
      if (loading) return null;
      if (error) return 'Error!';
      return (
        <img src={data.dog.displayImage} />
      );
    }}
  </Query>
);`;
```

<h2 id="query-whitelisting">Query whitelisting</h2>
<p>A technique for preventing unwanted attacks by maintaining a list of approved queries that are allowed in your application. Any query not present in the list that is run against the server will not be allowed. [Automatic Persisted Queries](../guides/performance.html#automatic-persisted-queries) is a tool by Apollo that enables query whitelisting and persisted queries.</p>

<h2 id="resolver">Resolver</h2>
<p>A function that connects schema fields and types to various backends. It can retrieve or write data from either an SQL, a No-SQL, graph database, a micro-service or a REST API.</p>


<h2 id="schema">Schema</h2>
<p>A model of the data that can be fetched from or written to a GraphQL server.</p>


<h2 id="schema-definition-language">Schema Definition Language (SDL)</h2>
<p>The syntax for writing GraphQL Schemas. It is otherwise known as Interface Definition Language. It is the lingua franca shared by all for building GraphQL APIs regardless of the programming language chosen.</p>


<h2 id="schema-first-development">Schema first development</h2>
<p>A development approach for designing and building modern UIs that involves the frontend and backend teams agreeing on a Schema first, which serves as a contract between the UI and the backend before any API engineering happens.</p>


<h2 id="schema-registry">Schema registry</h2>
<p>A central database that enables schema registration, tracking of detailed schema changes e.g. types added, fields added, fields deprecated and checking out previous versions of schema.</p>


<h2 id="schema-versioning">Schema versioning</h2>
<p>Refers to the ability to have different versions of your Schema. This allows for reversible changes to be made to the Schema. The Apollo CLI is a tool that provides and manages Schema versioning with Engine.</p>


<h2 id="schema-stitching">Schema stitching</h2>
<p>The process of merging [different schemas into one GraphQL schema](./docs/graphql-tools/schema-stitching.html). These schemas can be local, remote or from third party services.</p>


<h2 id="subscription">Subscription</h2>
<p>A real-time GraphQL operation. A Subscription is defined in a schema like queries and mutations.</p>

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
<p>A type that qualifies the data a GraphQL field resolves. GraphQL ships with some scalar types out of the box; **Int**, **Float**, **String**, **Boolean** and **ID**. However, a custom scalar type such as **Date** can be specified in a GraphQL service implementation.</p>


<h2 id="type-system">Type System</h2>
<p>A collection of types which characterizes the set of data that can be validated, queried and executed on a GraphQL API.</p>


<h2 id="whole-response-caching">Whole response caching</h2>
<p>A technique used to cache entire results of GraphQL queries. This process improves performance by preventing the fetching of the same results from the server if it has been obtained before. Check out the [Apollo performance guide on how to implement this type of caching](../guides/performance.html).</p>