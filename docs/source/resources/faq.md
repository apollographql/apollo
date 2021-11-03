---
title: GraphQL FAQ
sidebar_title: GraphQL FAQ
---

This article answers common questions about GraphQL, organized by phases in the GraphQL adoption timeline.

## 1. Learning GraphQL

You're just getting started with GraphQL. You're learning about syntax, running queries, schemas, and how to connect your existing services to your GraphQL layer.

### What is GraphQL?

**GraphQL is a language for querying data.** Unlike most query languages (such as SQL), you _don't_ use GraphQL to query a particular type of data store (such as a MySQL database). Instead, **you use GraphQL to query data from any number of different sources.**

> Also check out [this Apollo blog post](https://www.apollographql.com/blog/graphql/basics/what-is-graphql-introduction/).

With GraphQL, a client (such as a web app) doesn't need to know which data store contains the information it needs. Instead, clients send queries to your **GraphQL server** (usually over HTTP), which then fetches data from the appropriate data stores.

Here's an example query:

```graphql
# Fetches a list of Book objects, each with a title and author
query GetBooks {
  books {
    title
    author
  }
}
```

Your GraphQL server defines a strongly-typed [schema](https://www.apollographql.com/docs/apollo-server/schema/schema/) that describes the data that clients can query for. Clients execute queries that conform to this schema's structure.

Here's an example GraphQL schema that supports the example query above:

```graphql:title=schema.graphql
type Book {
  title: String
  author: String
  isbn: String
}

# The root fields of a query are always fields of the special
# Query type. These root fields are also called "entry points"
# into your schema.
type Query {
  # Returns a list of Book objects
  books: [Book]
}
```

> Notice that the example query above doesn't fetch the `isbn` field that's defined here. It doesn't need to! GraphQL enables clients to query for exactly the fields they need, with no overhead.

Your GraphQL server uses a collection of special functions called [resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/) that each know how to populate data for a particular schema field by communicating with different data sources (databases, REST APIs, etc.). When a query is fully resolved, your server responds to the client with the result, which matches the query's structure:

```json
{
  "data": {
    "books": [
      {
        "title": "The Awakening",
        "author": "Kate Chopin"
      },
      {
        "title": "City of Glass",
        "author": "Paul Auster"
      }
    ]
  }
}
```

### Why use GraphQL?

GraphQL can improve nearly every area of development: from improving developer experience with quality tooling to improving client performance by reducing bundle sizes. [Read more about the benefits of GraphQL](/intro/benefits/).

### Where can I learn GraphQL?

Apollo's learning platform, [**Odyssey**](https://odyssey.apollographql.com?utm_source=apollo_docs&utm_medium=referral), provides practical, hands-on courses that help you learn GraphQL with Apollo technologies.

This documentation also includes a [full-stack tutorial](../tutorial/introduction/) and getting-started content for each platform component:

- [Apollo Client](https://www.apollographql.com/docs/react/get-started/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/)
- [Apollo Studio](https://www.apollographql.com/docs/studio/)

For an introduction to core GraphQL concepts, check out [graphql.org](https://graphql.org).

For technical GraphQL content from Apollo developer advocates and the larger GraphQL community, check out the [Apollo blog](https://www.apollographql.com/blog/).

### How can I host my GraphQL server online?

GraphQL servers created with `apollo-server` can be deployed to any environment that supports Node.js projects can be deployed. `apollo-server` even has variants to support serverless deployment with AWS Lambda.

There are deployment guides available for:

- [Heroku](https://www.apollographql.com/docs/apollo-server/deployment/heroku/)
- [Lambda](https://www.apollographql.com/docs/apollo-server/deployment/lambda/)
- [Azure Functions](https://www.apollographql.com/docs/apollo-server/deployment/azure-functions/)

### How do I connect my client app to my schema?

The Apollo platform has tools available to connect almost any kind of client to your schema:

- [Apollo Client](https://www.apollographql.com/docs/react/) for JavaScript clients
- [Apollo iOS](https://www.apollographql.com/docs/ios/) for native iOS clients
- [Apollo Android](https://github.com/apollographql/apollo-android) for native Android clients

For Apollo Client projects, there are also many view-layer integrations to make querying GraphQL schemas easier in [React](https://www.apollographql.com/docs/react/), [Vue](https://apollo.vuejs.org/), and [Angular](https://apollo-angular.com/docs/).

## 2. Building a proof of concept

You understand how GraphQL works and the benefits it offers. You're trying to create a proof of concept for your project or company to test GraphQL's viability in production.

### Which language should I use for my GraphQL server?

There are GraphQL server tools available for most popular languages, but we recommend using [apollo-server](https://www.apollographql.com/server) (Node.js) because of the ecosystem of tools developed for GraphQL in JavaScript. Node servers can also be run nearly anywhere, including on the edge.

### How do I wrap existing APIs?

One of the best things about GraphQL is that it works excellently with existing APIs. It's possible to connect any number of existing services to your schema.

The most common source is a REST API. The [`RESTDataSource`](https://www.apollographql.com/docs/apollo-server/data/data-sources/#rest-data-source) is a tool that integrates with `apollo-server` to simplify fetching and caching for existing REST APIs.

Other DataSources are under development, but even without the `DataSource` API, it's possible to connect any backend to a schema. [Resolvers](https://www.apollographql.com/docs/apollo-server/data/resolvers/) can do anything, including fetch data from an SDK or ORM.

### How do I design the schema?

Schemas should be designed with the needs of the client in mind. Rather than modeling queries and types after the underlying services, they should be designed to make querying as easy as possible. GraphQL's resolver structure makes it possible to allow this flexibility without many performance consequences. For more, see [Query-driven schema design](https://www.apollographql.com/docs/apollo-server/schema/schema/#query-driven-schema-design).

### How do I discover and reproduce errors?

As with any service, it's important to track errors and their causes. Many kinds of errors can occur in a GraphQL implementation. Some of these include service errors, where the schema can't access underlying data sources, and user errors, where a user enters invalid information in a query or mutation.

GraphQL is resilient to some of these errors. Because the schema is strongly typed, you can restrict what types of data users can provide as input, along with what types your resolvers can return. This type system catches many errors and requires no manual checks.

For errors not prevented by the type system, it's helpful to know what exact queries were made, and with what variables. [Apollo Studio](https://www.apollographql.com/docs/studio/) is a tool that does exactly this. It can help discover and reproduce errors by showing the exact conditions in which the error occurred.

## 3. Moving a feature to GraphQL

You've decided to use GraphQL in production. You don't want to immediately refactor the APIs or apps. You want to move a single feature over to GraphQL to learn how to use it and monitor it in production.

### How should the transition to GraphQL happen?

As with any large change, the adoption of GraphQL should be incremental. GraphQL allows teams to leave existing services as they are and build convenient gateways on top of them.

### Who owns the schema design?

GraphQL schemas work best when their design is collaborated on by combination of back-end implementers and front-end consumers. It's tempting to design a schema to mirror underlying API structures or database tables, but this can reduce the usefulness of GraphQL.

### How do I set up authentication/authorization for my GraphQL schema?

Authentication and authorization are important topics to discuss with any API. GraphQL provides a very granular approach to handling these topics. But don't worry, if an API being consumed by GraphQL already has authorization built-in, it may be possible to ignore it completely.

### How can I secure my schema from malicious or expensive queries?

Public APIs of any kind need some kind of safeguards against malicious queries. Since GraphQL allows for recursive queries, it wouldn't be hard to create a query that is overly complicated and acts as a DoS attack, even by accident. There are multiple ways to prevent something like this from happening, from complexity limiting to query depth limiting. Read the [guide on security](https://blog.apollographql.com/securing-your-graphql-api-from-malicious-queries-16130a324a6b) to learn more.

### What kinds of cache should I set up?

GraphQL can be cached in multiple places.

On the client, caches can prevent multiple queries from being called when data is already available locally. Client caches for GraphQL have one significant advantage over REST client caches: they can handle queries that have never been made. This is possible because of how GraphQL responses are normalized and stored.

For example, if a client requests a list of movies, each movie is cached separately on the client. Later, if the client requests a single movie in a different query and the needed movie is in the cache, the request doesn't have to use the network. This normalized cache is a part of `apollo-client` by default.

You can also set up server-side caching, including whole-query caching, partial-query caching, and cache backed by a CDN. These can lower response times and make your GraphQL server as performant as possible.

Whole-query and CDN caches are most useful when an API handles multiple identical queries. This commonly happens with public data, like content on pages of a site. Regardless of whether the API is used for public data or not, these caches almost always provide large performance benefits and are highly recommended. You can read more about how to set up whole-query and CDN caching with `apollo-server` 2.0 [here](https://www.apollographql.com/docs/apollo-server/performance/caching/).

Partial query caching can be achieved by caching the responses from underlying services with something like Redis or Memcache. With this strategy, even if two queries look completely different from one another, if there is any duplication of data fetched, those results can be shared, preventing unnecessary traffic. The [`RESTDataSource`](https://www.apollographql.com/docs/apollo-server/data/data-sources/#rest-data-source) does this automatically if the appropriate `cache-control` headers are present in REST responses.

### How can I monitor the health of my GraphQL schema?

Many apps and sites are powered almost completely by an API such as a GraphQL schema, so it's important to make sure the API is healthy at all times. Indicators of an unhealthy service include long response times, high resource usage, and unusual traffic patterns.

[Apollo Studio](https://studio.apollographql.com) is a great tool to track many of these things. It allows close inspection of fields to make it easy to see both total response times as well as how long each field took to execute.

Apollo Studio also has some integrations to make monitoring easier. The [Slack Integration](https://www.apollographql.com/docs/studio/integrations#slack) delivers daily reports to give teams a quick overview of the health of their schema. The [Datadog integration](https://www.apollographql.com/docs/studio/integrations#datadog)) works with existing Datadog accounts, to help teams track schema performance.

## 4. Moving a product to GraphQL

You have a good understanding of how to write, deploy, and monitor GraphQL in production. You are looking to scale GraphQL features to your entire product line.

### How do I organize schema code to scale for a larger project?

Keeping all schema code together makes sense for smaller projects, but once a project reaches a certain size, or has many people working on it, managing conflicts in the same file and code navigation can get difficult. Splitting types and resolvers up into smaller files can make this process much easier. Read [this blog post](https://blog.apollographql.com/modularizing-your-graphql-schema-code-d7f71d5ed5f2) to learn more.

<!-- TODO: @jakedawkins Add server testing -->

### How can I test my client?

`react-apollo` comes with everything needed to test a client app that makes queries to a GraphQL schema. Read the [Testing React Components](https://www.apollographql.com/docs/react/recipes/testing/) guide to learn more.

### How can I safely make changes to the schema?

Schemas naturally evolve over time. GraphQL schemas are more resilient to change than other APIs, but there are still occasions where breaking changes will need to happen to support new functionality. The [versioning guide](https://www.apollographql.com/docs/studio/schema-registry/#registering-a-schema) explains in more detail what kinds of changes are safe to make, and what kinds could break existing clients.

Additionally, using the [Apollo CLI](../devtools/cli/) with Apollo Studio provides the tools needed to [validate schema changes](https://www.apollographql.com/docs/studio/schema-checks/) over time. This makes collaboration easier and more transparent.
