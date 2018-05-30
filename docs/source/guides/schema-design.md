---
title: Schema design
description: Our recommendations for architecting your dream GraphQL API
---

Proper schema design is important during GraphQL adoption.  While GraphQL makes it easier to evolve an API, large applications will find it more difficult to allocate time for refactoring.  Therefore, schema design decisions should be made carefully to avoid accumulating technical debt.

This article details some practices around schema design which should help avoid expensive refactoring in the future.

<h2 id="structure">Structure</h2>

GraphQL schemas are at their best when they are designed around the needs of client applications.  When a team is building their first GraphQL schema, they might be tempted to create literal mappings on top of existing database collections or tables using CRUD-like root fields but it’s important to consider how this could be disadvantageous.

While this literal database-to-schema mapping may be a fast way to get up and running, we strongly suggest avoiding it and instead building the schema around based on how the GraphQL API will be used by the front-end.

If a database has has fields or relationships that the client won’t need, don’t include them in the schema. Adding fields later is cheap, so additions to a schema should be made when the need arises. Likewise, if a connection between two types of data doesn’t currently exist in a database, that doesn’t mean it can’t be added later.

For example, if you have a REST endpoint exposing a list of events and their locations, but not weather information for the day of the event, the following schema accommodates this structure in a clean and concise manner:

```graphql
type Event {
  name: String
  date: String
  weather: WeatherInfo
}

type WeatherInfo {
  temperature: Float
  description: String
}
```

In scenarios like this, you would just need to fetch the weather information from another endpoint (or a 3rd party endpoint) in your resolvers.

<h2 id="style">Style conventions</h2>

The GraphQL specification is flexible in the style that it dictates and doesn't impose specific naming guidelines. In order to facilitate development and continuity across GraphQL deployments, we suggest the following style conventions:

* **Fields**: are recommended to be written in `camelCase`, since the majority of consumers will be client applications written in JavaScript.
* **Types**: should be `PascalCase`.
* **Enums**: should have their name in `PascalCase` and their values in `ALL_CAPS` to denote their special meaning.

<h2 id="interfaces">Utilizing interfaces</h2>

Interfaces are a powerful way to build and use GraphQL schemas through the use of _abstract types_. Abstract types can't be used directly in schema, but can be used as building blocks for creating explicit types.

Consider an example where different types of books share a common set of attributes, such as _text books_ and _coloring books_. A simple foundation for these books might be represented as the following `interface`:

```graphql
interface Book {
  title: String
  author: Author
}
```

We won't be able to directly use this interface to query for a book, but we can use it to implement concrete types. Imagine a screen within an application which needs to display a feed of all books, without regard to their (more specific) type. To create such functionality, we could define the following:

```graphql
type TextBook implements Book {
  title: String
  author: Author
  classes: [Class]
}

type ColoringBook implements Book {
  title: String
  author: Author
  colors: [Color]
}

type Query {
  schoolBooks: [Book]
}
```

In this example, we've used the `Book` interface as the foundation for the `TextBook` and `ColoringBook` types. Then, a `schoolBooks` field simply expresses that it returns a list of books (i.e. `[Book]`).

Implementing the book feed example is now simplified since we've removed the need to worry about what kind of `Book`s will be returned. A query against this schema, which could return _text books_ and _coloring_ books, might look like:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

This is really helpful for feeds of common content, user role systems, and more!

Furthermore, if we need to return fields which are only provided by either `TextBook`s or `ColoringBook`s (not both) we can request fragments from the abstract types in the query. Those fragments will be filled in only as appropriate; in the case of the example, only coloring books will be returned with `colors`, and only textbooks will have `classes`:

```graphql
query GetBooks {
  schoolBooks {
    title
    ... on TextBook {
      classes {
        name
      }
    }
    ... on ColoringBook {
      colors {
        name
      }
    }
  }
}
```

<h2 id="mutations">Designing mutations</h2>

Mutations are one of the core types in GraphQL. Just like you can make a query to fetch information, you can make a mutation to update or change information. Unlike REST, GraphQL mutations actually are executed in two parts: the mutation itself, and a subsequent query, which can return any kind of data that you normally could query for. A mutation definition for updating the age of a `User` could look like this:

```graphql
type Mutation {
  updateUserAge(id: ID!, age: Int!): User
}

type User {
  id: ID!
  name: String!
  age: Int!
}
```

With that definition, you could then make the following mutation:

```graphql
mutation updateMyUser {
  updateUserAge(id: 1, age: 25){
    id
    age
    name
  }
}
```

With a response looking something like:

```json
{
  "data": {
    "updateUserAge": {
      "id": "1",
      "age": "25",
      "name": "jane doe"
    }
  }
}
```

The first thing to note is that it’s most common to return the thing you’re updating from a mutation. In our example, we were updating a `User` record, so we returned that updated user. There’s nothing _enforcing_ this practice, but it’s highly recommended, because it’s often needed to have an updated user to let the clients update any local cache with a new instance of that `User`. For this same reason, it’s useful design mutations to update only one entity. If you wanted to update two unrelated entities, it’s recommended to in separate mutations. For more details on how to handle errors and warnings in mutations, see the [mutation responses](#mutation-responses) section below.

But what if we wanted to update more than just a single or couple attributes on a user? Passing each thing we need as a single argument would get tedious. Especially if multiple mutations used similar fields. For this, we can use input types, which are explained in the next section.

<h3 id="mutation-input-types">Input types</h3>

Input types are a special type in GraphQL which are defined as arguments to queries and, more commonly, mutations.  They can be thought of as object types for arguments, in addition to the other scalar types.  Input types are especially useful when multiple mutations require similar information; for example, when creating a user and updating a user require the same fields, like `age` and `name`.

Input types are used like any other type and defining them is similar to a typical object type definitions, but with the `input` keyword rather than `type`.

Here is an example of two mutations that operate on a `User`, _without_ using input types:

```
type Mutation {
  createUser(name: String, age: Int, address: String, phone: String): User
  updateUser(id: ID!, name: String, age: Int, address: String, phone: String): User
}
```

To avoid the repetition of argument fields, this can be refactored to use an input type, as follows:

```
type Mutation {
  createUser(user: UserInput): User
  updateUser(id: ID!, user: UserInput): User
}

input UserInput {
  name: String
  age: Int
  address: String
  phone: String
}
```

<h3 id="mutation-responses">Responses</h3>

Mutations have a higher chance of causing errors than queries since they are modifying data.  A common way to handle errors during a mutation is to simply `throw` an error.  While that's fine, throwing an error in the resolver will return an error to the caller and prevent a partial response, which could be useful in the event of a partial update.  Consider the following mutation example, which tries to update a user's `name` and `age`:

```graphql
mutation updateUser {
  updateUser(id: 1, user: { age: -1, name: "Foo Bar" }){
    name
    age
  }
}
```

With validation in place, this mutation might cause an error since the `age` is a negative value.  While it’s possible that the entire operation should be stopped, there’s an opportunity to partially update the user’s record with the new `name` and return the updated record with the `age` left untouched.

Luckily, the powerful structure of GraphQL mutations accommodates this use case and can return transactional information about the update alongside the records which have been changed which enables client-side updates to occur automatically.

In order to provide consistency across a schema, we suggest introducing a `MutationResponse` interface which can be implemented on every mutation response in a schema and enables transactional information to be returned in addition to the normal mutation response object.

A `MutationResponse` interface would look like this:

```graphql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

An implementing type would look like this:

```graphql
type UpdateUserMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  user: User
}
```

Calling a mutation that returns that `UpdateUserMutationResponse` type would result in a response that looks something like this:

```json
{
  "data": {
    "updateUser": {
      "code": "200",
      "success": true,
      "message": "User was successfully updated",
      "user": {
        "id": "1",
        "name": "Jane Doe",
        "age": 35
      }
    }
  }
}
```

Let’s break this down, field by field:

* `code` is a string representing a transactional value explaining details about the status of the data change. Think of this like an HTTP status code.
* `success` is a boolean indicating whether the update was successful or not. This allows a coarse check by the client to know if there were failures.
* `message` is a string that is meant to be a human-readable description of the status of the transaction. It is intended to be used in the UI of the product.
* `post` is added by the implementing type `AddPostMutationResponse` to return back the newly created post for the client to use!

Following this pattern for mutations provides detailed information about the data that has changed and feedback on whether the operation was successful or not.  Armed with this information, developers can easily react to failures in the client and fetch the information they need to update their local cache.

<h2 id="gql">Wrapping documents with `gql`</h2>

There are two common ways to write GraphQL schemas and queries. The first is to write queries into a `.graphql` file and import them into your other files for usage. The second is to write them wrapped them with the `gql` tag provided by the [graphql-tag library](https://github.com/apollographql/graphql-tag#graphql-tag).

We recommend doing the latter for a couple reasons. Most notably, it can save a build step. Using `.graphql` files requires a loader to parse the file and make it useful. This may not seem like a concern on the client, but it may be especially useful on the server, where there’s often not a build step.

Additionally, using the `gql` tag unlocks full syntax highlighting in most editors and auto-formatting support with [prettier](https://prettier.io/).
