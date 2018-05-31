---
title: Security
description: Building a secure, safe GraphQL server
---

Apollo Server is a safer way to build applications thanks to GraphQL's strong typing and the conversion of raw operations into a trusted syntax tree. By validating each part of an operation, GraphQL is mostly exempt from injection-attacks which might be of concern on other platforms.

This guide will discuss additional security measures which further harden the excellent foundation which GraphQL is already built upon. While Apollo Server will enable some additional protections automatically, others require attention on the part of the developer.

<h2 id="introspection">Introspection in production</h2>

Introspection is a powerful tool to have enabled during development and allows developers to get real-time visibility of a GraphQL server's capabilities. In production, this insight might be less desirable, especially if the API is not being offered as a “public” API.

For security, Apollo Server introspection is automatically disabled when the `NODE_ENV` is set to `production` or `testing`.  For those wishing to allow introspection, the functionality can be explicitly enabled by setting `introspection` to `true` on the `ApolloServer` constructor options.

Of course, no system should rely solely on so-called "security through obscurity" and this practice should be combined with other security techniques like _open security_ and _security by design_.

<h2 id="injection">Injection prevention</h2>

As we build out our schema, it may be tempting to allow for “shortcut arguments” to creep in. This creative repurposing of fields might seem like a good idea at the time, but it often creates unnecessary security risks.  This most commonly happens on mutation inputs or when attempting to use a simple “filter”-type field to do generic work, as demonstrated in this example:

```graphql
query OhNo {
  users(filter: "id = 1;' sql injection goes here!") {
    id
  }
}

mutation Dang {
  updateUser(user: { firstName: "James", id: 1 }) {
    success
  }
}
```

In the first `query` operation we are passing a filter that is a database filter directly as a string.  Since this value is passed directly to the data storage engine and the input value itself can be manipulated by a malicious user, this opens the door to a SQL injection attack.

In the second `mutation` operation an arbitrary `id` value is being passed which could allow a bad actor to update information for another user by simply manipulating the mutation with a different user ID.  This can happen if a generic `input` type has been used inappropriately, as in the following example:

```graphql
# Used for creating and updating a user!
input UserInput {
  id: Int
  firstName: String
}

type Mutation {
  createUser(user: UserInput): User
  updateUser(user: UserInput): User
}
```

The fix for both of these scenarios is to create more explicit arguments, with each serving the appropriate purpose, and allow Apollo Server to prune incorrectly typed values during validation.  Additionally, care should be taken to **never** pass raw values from clients into a datastore.

Of course, any of the above scenarios can occur in any API implementations if proper precautions are not taken, and GraphQL is no different in this regard.

<h2 id="dos">Denial-of-Service (DoS) Protection</h2>

Apollo Server is a Node.js application and standard precautions should be taken in order to avoid Denial-of-Service (DoS) attacks.

Since GraphQL involves the traversal of a graph in which circular relationships of arbitrary depths might be accessible, some additional precautions can be taken to limit the risks of complexity attacks where bad actors could craft expensive operations and lock up resources indefinitely.

There are two common mitigation techniques and they can be enabled together:

<h3 id="safe-listing">Operation safe-listing</h3>

By hashing the potential operations a client is expected to send (e.g. based on field names) and storing these "permitted" hashes on the server (or a shared cache), it becomes possible to check incoming operations against the permitted hashes and skip execution if the hash is not allowed.

Since many consumers of non-public APIs have their operations statically defined within their source code, this technique is often sufficient and is best implemented as an automated deployment step.

Future versions of Apollo Server and Apollo Engine will make it easier to maintain a list of allowed operations, though complexity limits (discussed in the next section) are a very reasonable solution which can provide similar protection.

<h3 id="complexity">Complexity limits</h3>

These can be used to limit the use of queries which, for example, request a list of books including the authors of each book, plus the books of those authors, and _their_ authors, and so on. By limiting operations to an application-defined depth of "_n_", these can be prevented.

We suggest implementing complexity limits using community-provided packages like [graphql-depth-limit](https://github.com/stems/graphql-depth-limit) and [graphql-validation-complexity](https://github.com/4Catalyzer/graphql-validation-complexity).

<h2 id="resources">Additional resources</h2>

> For additional information on securing a GraphQL server deployment, check out [Securing your GraphQL API from malicious queries](https://dev-blog.apollodata.com/securing-your-graphql-api-from-malicious-queries-16130a324a6b) by Spectrum co-founder, Max Stoiber.
